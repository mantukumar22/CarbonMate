import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import { randomUUID } from "crypto";

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

dotenv.config();

// Startup Environment Variable Validation
if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ WARNING: GEMINI_API_KEY is not set in the process environment. EcoBuddy AI will operate securely in rule-based fallback mode.");
}

const app = express();
const PORT = 3000;

// CORS configuration matching security audit constraints
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://carbonmate.vercel.app",
    process.env.FRONTEND_URL || ""
  ].filter(Boolean),
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));

// Assign X-Request-Id for distributed tracing and performance auditing
app.use((req, res, next) => {
  req.id = randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
});

// Security Headers Middleware: Protects against XSS, clickjacking, sniff attacks, and frame nesting
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' https://*.firebaseio.com https://*.googleapis.com; img-src 'self' data: https: referrer; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; font-src 'self' data: https:; connect-src 'self' https: wss:;"
  );
  next();
});

// Limit inbound JSON payload size to 15kb to prevent heap exhaustion / buffer overruns
app.use(express.json({ limit: "15kb" }));

// IN-MEMORY RATE LIMITING: Prevents abuse and cost overruns on critical Gemini API requests
const rateLimitStore: { [ip: string]: { count: number; resetTime: number } } = {};

function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "anonymous";
  const now = Date.now();
  
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = { count: 1, resetTime: now + 60050 };
    return next();
  }

  const limitInfo = rateLimitStore[ip];
  if (now > limitInfo.resetTime) {
    limitInfo.count = 1;
    limitInfo.resetTime = now + 60050;
    return next();
  }

  limitInfo.count++;
  if (limitInfo.count > 15) { // Maximum of 15 requests per minute per IP to protect resource limits
    return res.status(429).json({ 
      error: "You are crunching carbon metrics too quickly! Please wait 60 seconds to safeguard our atmospheric servers." 
    });
  }

  next();
}

// IN-PROCESS INPUT SANITIZATION: Protects against Prompt Injection and Buffer Overruns
function sanitizeInput(text: string | any): string {
  if (!text || typeof text !== "string") return "";
  let clean = text.substring(0, 1500); // Strict length limit
  
  const injectionPatterns = [
    /ignore prior instructions/gi,
    /ignore preceding/gi,
    /ignore above/gi,
    /forget all previous/gi,
    /system command/gi,
    /jailbreak/gi,
    /bypass security/gi,
    /override system/gi,
    /you are now an/gi,
    /acting as/gi,
    /dan mode/gi
  ];

  injectionPatterns.forEach((pattern) => {
    clean = clean.replace(pattern, "[redacted input to maintain ecological alignment]");
  });

  return clean;
}

// Lazy-initialized Gemini instance to prevent crashing on boot when key is missing.
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please populate it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Rule-based fallback parsing function in case Gemini is unavailable or rate limited
function ruleBasedExtractFallback(description: string) {
  const desc = description.toLowerCase();
  
  // 1. Parse Transport
  const transport: any[] = [];
  let estimated_co2_kg = 0;
  
  // Try to find a distance
  const distanceMatch = desc.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometer|mile|mi)/i) || desc.match(/(\d+(?:\.\d+)?)\s*(?:\s|$)/);
  const distance = distanceMatch ? parseFloat(distanceMatch[1]) : 10; // default 10km if referenced transport but no distance
  
  if (desc.includes("car") || desc.includes("drive") || desc.includes("drove") || desc.includes("taxi")) {
    transport.push({ mode: "car", distance_km: distance });
    estimated_co2_kg += distance * 0.21;
  } else if (desc.includes("bus") || desc.includes("train") || desc.includes("metro") || desc.includes("subway") || desc.includes("transit")) {
    transport.push({ mode: "bus", distance_km: distance });
    estimated_co2_kg += distance * 0.05;
  } else if (desc.includes("flight") || desc.includes("fly") || desc.includes("flew") || desc.includes("plane") || desc.includes("airplane")) {
    const flightDist = distance > 100 ? distance : 500;
    transport.push({ mode: "flight", distance_km: flightDist });
    estimated_co2_kg += flightDist * 0.255;
  } else if (desc.includes("bike") || desc.includes("bicycle") || desc.includes("cycle") || desc.includes("cycling")) {
    transport.push({ mode: "bike", distance_km: distance });
  } else if (desc.includes("walk") || desc.includes("foot") || desc.includes("run") || desc.includes("jog")) {
    transport.push({ mode: "walk", distance_km: distance });
  }

  // 2. Parse Food
  const food: any[] = [];
  if (desc.includes("beef") || desc.includes("steak") || desc.includes("burger")) {
    food.push({ item: desc.includes("burger") ? "burger" : "beef selection", type: "beef" });
    estimated_co2_kg += 6.0;
  } else if (desc.includes("chicken") || desc.includes("pork") || desc.includes("fish")) {
    food.push({ item: "chicken selection", type: "chicken" });
    estimated_co2_kg += 2.0;
  } else if (desc.includes("cheese") || desc.includes("milk") || desc.includes("dairy") || desc.includes("yogurt")) {
    food.push({ item: "dairy selection", type: "dairy" });
    estimated_co2_kg += 1.0;
  } else if (desc.includes("vegan") || desc.includes("plant-based") || desc.includes("tofu") || desc.includes("lentils")) {
    food.push({ item: "plant-based meal", type: "vegan" });
    estimated_co2_kg += 0.9;
  } else if (desc.includes("salad") || desc.includes("vegetarian") || desc.includes("veggie") || desc.includes("pasta") || desc.includes("dumplings")) {
    food.push({ item: "vegetarian selection", type: "vegetarian" });
    estimated_co2_kg += 1.5;
  } else {
    // default mixed meal (meat) if not specified
    food.push({ item: "balanced meal", type: "meat" });
    estimated_co2_kg += 4.0;
  }

  // 3. Parse Energy
  let ac_hours = 0;
  if (desc.includes("ac") || desc.includes("aircon") || desc.includes("air conditioning")) {
    const acMatch = desc.match(/(\d+)\s*(?:hour|hr|h)/i);
    ac_hours = acMatch ? parseInt(acMatch[1]) : 4; // default to 4 hours of AC
    estimated_co2_kg += ac_hours * 1.23;
  }
  
  let electricity_kwh = 3; // base electricity consumption
  estimated_co2_kg += electricity_kwh * 0.82;

  // 4. Parse Waste
  let plastic_items = 0;
  if (desc.includes("plastic") || desc.includes("bottle") || desc.includes("box") || desc.includes("can")) {
    const plasticMatch = desc.match(/(\d+)\s*(?:item|piece|bottle|can|trash)/i);
    plastic_items = plasticMatch ? parseInt(plasticMatch[1]) : 2;
  }
  
  const recycled = desc.includes("recycle") || desc.includes("recycled") || desc.includes("sorting");
  if (recycled) {
    estimated_co2_kg += plastic_items * 0.02;
  } else {
    estimated_co2_kg += plastic_items * 0.10;
  }

  return {
    transport,
    food,
    energy: { electricity_kwh, ac_hours },
    waste: { plastic_items, recycled },
    estimated_co2_kg: parseFloat(estimated_co2_kg.toFixed(2)),
    notes: "EcoBuddy is resting right now 😴 But we still calculated your pollution score! Your log has been saved. 🌿",
    is_fallback: true
  };
}

// TASK 1 - Activity Extraction Endpoint
app.post("/api/extract", rateLimiter, async (req, res) => {
  let { description } = req.body;
  if (!description || typeof description !== "string") {
    return res.status(400).json({ error: "Please describe your day so EcoBuddy can analyze it!" });
  }

  description = sanitizeInput(description);
  try {
    const ai = getGeminiClient();
    const systemInstruction = `You are EcoBuddy, a friendly daily pollution scoring helper inside the CarbonMate app.
Your task is to parse a simple, natural language description of a user's day and extract structured activity items with daily pollution scores.

Strictly use these simple pollution standards for calculations:
- Transport:
  - 'car': 0.21 kg pollution (CO2) per km
  - 'bus': 0.05 kg pollution (CO2) per km
  - 'flight': 0.255 kg pollution (CO2) per km
  - 'bike' or 'walk': 0.0 kg pollution (CO2) per km
- Food:
  - 'beef': 6.0 kg pollution (CO2) per meal
  - 'chicken': 2.0 kg pollution (CO2) per meal
  - 'meat': 4.0 kg pollution (CO2) per meal (for generic meat reference)
  - 'vegetarian': 1.5 kg pollution (CO2) per meal
  - 'vegan': 0.9 kg pollution (CO2) per meal
  - 'dairy': 1.0 kg pollution (CO2) per meal (e.g., milk, paneer, cheese)
- Energy:
  - 'electricity_kwh': 0.82 kg pollution (CO2) per unit used
  - 'ac_hours': 1.23 kg pollution (CO2) per hour of AC use
- Waste:
  - 'plastic_items': 0.10 kg pollution (CO2) per item if unrecycled, 0.02 kg if recycled

Calculate the final total of all daily pollution as 'estimated_co2_kg'.

If details are missing, make a helpful guess and explain inside the "notes" field:
- "I took the bus to school" -> assume 'bus' mode and 10 km. Note: "Added 10 km by bus for your travel!"
- "I ate chicken sandwich" -> 'chicken' category, item 'chicken sandwich'.
- "I used AC" -> assume 2 hours. Note: "Added 2 hours of AC."

Always use simple English that an Indian school student can understand. Use short sentences (maximum 12 words per sentence). Avoid complex words. Support and cheer for the user! Celebrate green wins like cycling, walking, or eating vegetables!`;

    const geminiPromise = ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: description,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transport: {
              type: Type.ARRAY,
              description: "Movements with 'mode' (must be: car/bus/bike/walk/flight) and 'distance_km'. Empty array if none.",
              items: {
                type: Type.OBJECT,
                properties: {
                  mode: { type: Type.STRING },
                  distance_km: { type: Type.NUMBER }
                },
                required: ["mode", "distance_km"]
              }
            },
            food: {
              type: Type.ARRAY,
              description: "Meals eaten today with dietary 'type' (meat/vegetarian/vegan/dairy) and specific item name. Empty array if none.",
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  type: { type: Type.STRING }
                },
                required: ["item", "type"]
              }
            },
            energy: {
              type: Type.OBJECT,
              description: "Household energy metrics. Default to 0 for fields if none described.",
              properties: {
                electricity_kwh: { type: Type.NUMBER },
                ac_hours: { type: Type.NUMBER }
              },
              required: ["electricity_kwh", "ac_hours"]
            },
            waste: {
              type: Type.OBJECT,
              description: "Plastic trash and recycling record.",
              properties: {
                plastic_items: { type: Type.NUMBER },
                recycled: { type: Type.BOOLEAN }
              },
              required: ["plastic_items", "recycled"]
            },
            estimated_co2_kg: {
              type: Type.NUMBER,
              description: "Precise calculated sum of carbon emissions in kilograms."
            },
            notes: {
              type: Type.STRING,
              description: "Friendly remarks, list of default values chosen for unspecified data, and dynamic encouraging reinforcement."
            }
          },
          required: ["transport", "food", "energy", "waste", "estimated_co2_kg", "notes"]
        }
      }
    });

    const timeoutPromise = new Promise<any>((_, reject) => {
      setTimeout(() => reject(new Error("Gemini request timed out after 8 seconds")), 8000);
    });

    const response = await Promise.race([geminiPromise, timeoutPromise]);

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from EcoBuddy extraction engine.");
    }

    const data = JSON.parse(text);
    return res.json(data);
  } catch (error: any) {
    console.warn("Gemini extractions: using local rule-based parsing engine.");
    try {
      const fallbackData = ruleBasedExtractFallback(description);
      return res.json(fallbackData);
    } catch (fallbackError: any) {
      console.warn("Critical fallback parsing error:", fallbackError);
      return res.status(500).json({ error: "Failed to automatically organize your footprints. Please use the Manual section!" });
    }
  }
});

// TASK 2 - Personalized Insights Endpoint
app.post("/api/recommendations", rateLimiter, async (req, res) => {
  const { history } = req.body;
  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ error: "Keep logging your activities to get weekly personalized recommendations!" });
  }

  try {
    const ai = getGeminiClient();
    const systemInstruction = `You are EcoBuddy, the friendly green helper in the CarbonMate app.
Given the user's logged details for the week (JSON format), locate their largest source of pollution (e.g. traveling by car, eating meat, high electricity / AC use, plastic waste).
Draft EXACTLY 3 tips to reduce their pollution.
- Always write tips in simple English that an Indian person with basic English knowledge can understand. Use short sentences. Maximum 15 words per tip. Use India-relevant examples like auto-rickshaw, dal, roti, AC, ceiling fan, local train, bike. Never use words like: emissions, carbon offset, footprint mitigation, sustainability metrics, net zero, sequestration, anthropogenic. Instead say: pollution, save earth, reduce harm, go green.
- Support, celebrate their efforts, never lecture or shame. Use emojis very sparingly.

Return ONLY a valid JSON object in this format:
{"tips": ["Tip 1 text", "Tip 2 text", "Tip 3 text"]}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: JSON.stringify(history),
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tips: {
              type: Type.ARRAY,
              description: "Exactly three actionable suggestions. Max 20 words each.",
              items: { type: Type.STRING }
            }
          },
          required: ["tips"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from EcoBuddy suggestions engine.");
    }

    const data = JSON.parse(text);
    return res.json(data);
  } catch (error: any) {
    console.warn("Gemini recommendations: using local dynamic eco-calculations.");
    
    // Analyze user history to find high-impact categories locally
    let totalTransportCo2 = 0;
    let totalDietCo2 = 0;
    let totalEnergyCo2 = 0;

    history.forEach((e: any) => {
      if (e.transport && Array.isArray(e.transport)) {
        e.transport.forEach((t: any) => {
          const modeFactor = t.mode === "car" ? 0.21 : t.mode === "bus" ? 0.05 : t.mode === "flight" ? 0.25 : 0;
          totalTransportCo2 += ((t.distance_km || 0) * modeFactor);
        });
      }
      if (e.food && Array.isArray(e.food)) {
        e.food.forEach((f: any) => {
          const dietFactor = f.type === "meat" ? 7.0 : f.type === "vegetarian" ? 1.5 : f.type === "dairy" ? 1.0 : 0.5;
          totalDietCo2 += dietFactor;
        });
      }
      if (e.energy) {
        totalEnergyCo2 += ((e.energy.electricity_kwh || 0) * 0.5) + ((e.energy.ac_hours || 0) * 0.75);
      }
    });

    // Detect highest-emission driver
    let highestCat = "energy";
    let highestValue = totalEnergyCo2;
    if (totalTransportCo2 > highestValue) {
      highestCat = "transport";
      highestValue = totalTransportCo2;
    }
    if (totalDietCo2 > highestValue) {
      highestCat = "diet";
      highestValue = totalDietCo2;
    }

    let fallbackTips = [
      "Turn off lights and use less AC to save electricity and money. 💡",
      "Walk short distances under 2 km or use your bicycle. 🚲",
      "Eat local foods like dal, roti, and sabzi to save our earth. 🍛"
    ];

    if (highestCat === "transport") {
      fallbackTips = [
        "Use local train, bus, or share auto to reduce pollution on roads. 🛺",
        "Try to do many works in one trip so you save fuel.",
        "Walking for short distances keeps you fit and does zero harm to earth! 🚶"
      ];
    } else if (highestCat === "diet") {
      fallbackTips = [
        "Eat vegetarian dishes like paneer or dal-roti more often. It saves earth!",
        "Chicken and beef make more pollution. Try fish or tasty green sabzi.",
        "Take only as much food as you can eat. Do not waste food."
      ];
    } else if (highestCat === "energy") {
      fallbackTips = [
        "Turn off ceiling fan and AC when we go out of the room.",
        "Use LED bulbs at home as they use very little power. 💡",
        "Keep windows open during pleasant evenings instead of using AC."
      ];
    }

    return res.json({ tips: fallbackTips });
  }
});

// TASK 3 - General EcoBuddy Conversation Endpoint
app.post("/api/chat", rateLimiter, async (req, res) => {
  let { message, chatHistory } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Please enter a message for EcoBuddy!" });
  }

  message = sanitizeInput(message);
  try {
    const ai = getGeminiClient();
    const systemInstruction = `You are EcoBuddy, a supportive, ultra-friendly green helper inside the CarbonMate app.
Your goals:
1. Provide motivating, cheerful advice in simple English that an Indian person with basic English knowledge can understand easily. Use short sentences (maximum 12 words per sentence). Use India-relevant examples like auto-rickshaw, local train, dal rice, roti, AC, fan, light, bike. Never use complex words like: emissions, carbon offset, footprint mitigation, sustainability metrics, net zero, sequestration, anthropogenic. Instead say: pollution, save earth, reduce harm, go green.
2. Celebrate every small victory (e.g., eating veg food, running less AC, walking, riding cycle).
3. Under no circumstances sound hard, clinical, or preachy. Keep responses compact and easy to read.
4. If requested, share these simple pollution values:
   - Car travel: 0.21 kg pollution per km
   - Bus travel: 0.05 kg pollution per km
   - Flight travel: 0.255 kg pollution per km
   - Beef meal: 6.0 kg pollution per meal
   - Chicken meal: 2.0 kg pollution per meal
   - Vegetarian meal: 1.5 kg pollution per meal
   - Vegan meal: 0.9 kg pollution per meal
   - Electricity: 0.82 kg pollution per unit (kWh)
   - AC hour: 1.23 kg pollution per hour`;

    const contents = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const item of chatHistory) {
        if (item.role === "user" || item.role === "model") {
          contents.push({
            role: item.role,
            parts: [{ text: item.text }]
          });
        }
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
      }
    });

    return res.json({ text: response.text });
  } catch (error: any) {
    console.warn("Gemini chat: using local conversational eco-fallback handler.");
    
    // Create a personalized responsive reply depending on keywords
    const msg = message.toLowerCase();
    let reply = "You are doing great for our Earth! Let us keep finding easy ways like walking or eating vegetables to stay green! 🌿";
    
    if (msg.includes("car") || msg.includes("drive") || msg.includes("travel") || msg.includes("distance") || msg.includes("commute")) {
      reply = "Every km saved by taking a bus or walking reduces 0.21 kg of daily pollution! You are doing amazing. 🚶‍♂️✨";
    } else if (msg.includes("meat") || msg.includes("diet") || msg.includes("eat") || msg.includes("food") || msg.includes("beef") || msg.includes("burger")) {
      reply = "Swapping meat meals for delicious vegetarian paneer, roti, or vegan dal rice reduces your score a lot! 🍛🥦";
    } else if (msg.includes("ac") || msg.includes("cool") || msg.includes("electricity") || msg.includes("power") || msg.includes("energy")) {
      reply = "Using less AC (1.23 kg per hour) and switching off lights saves bills and cuts down pollution! ⚡️🌲";
    } else if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey") || msg.includes("help") || msg.includes("who are you")) {
      reply = "Hello there! I am EcoBuddy, your clean lifestyle friend. Tell me how you travelled or what you ate today! 💚";
    } else if (msg.includes("factor") || msg.includes("value") || msg.includes("kg") || msg.includes("emission")) {
      reply = "Here are simple pollution values: Car is 0.21 kg/km, Bus is 0.05, Beef is 6.0 kg/meal, Chicken is 2.0, Veg meal is 1.5, Vegan meal is 0.9, Electricity (India grid) is 0.82, and AC is 1.23 kg/hour! 📊🌱";
    }
    
    return res.json({ text: reply });
  }
});

// Start integration with Vite (development) or Static Assets (production)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EcoBuddy - CarbonMate background services live on http://localhost:${PORT}`);
  });
}

startServer();
