import React, { useState, useRef } from "react";
import { Send, Leaf, Sparkles, AlertCircle, Loader2, Car, Utensils, Zap, Trash2, TreeDeciduous } from "lucide-react";
import { DailyEntry, TransportItem, FoodItem, TransportMode, FoodType } from "../types";
import { extractDailyJournal } from "../lib/gemini";
import { BrandedLoader } from "./GraphicAssets";
import { COMMUTE_FACTORS, DIET_FACTORS } from "../lib/emissionFactors";
import ImpactCard from "./ImpactCard";

interface FallbackOutput {
  transport: TransportItem[];
  food: FoodItem[];
  energy: { electricity_kwh: number; ac_hours: number };
  waste: { plastic_items: number; recycled: boolean };
  estimated_co2_kg: number;
  notes: string;
  is_fallback: boolean;
}

function localClientFallback(descText: string): FallbackOutput {
  const desc = descText.toLowerCase();
  const transport: TransportItem[] = [];
  let estimated_co2_kg = 0;
  
  const distanceMatch = desc.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometer|mile|mi)/i) || desc.match(/(\d+(?:\.\d+)?)\s*(?:\s|$)/);
  const distance = distanceMatch ? parseFloat(distanceMatch[1]) : 10;
  
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

  const food: FoodItem[] = [];
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
    food.push({ item: "balanced meal", type: "meat" });
    estimated_co2_kg += 4.0;
  }

  let ac_hours = 0;
  if (desc.includes("ac") || desc.includes("aircon") || desc.includes("air conditioning")) {
    const acMatch = desc.match(/(\d+)\s*(?:hour|hr|h)/i);
    ac_hours = acMatch ? parseInt(acMatch[1]) : 4;
    estimated_co2_kg += ac_hours * 1.23;
  }
  
  let electricity_kwh = 3;
  estimated_co2_kg += electricity_kwh * 0.82;

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

interface ChatLoggerProps {
  onExtractionComplete?: (entry: DailyEntry) => void;
  isLoading?: boolean;
  onSubmit?: (text: string) => void | Promise<any>;
}

export default function ChatLogger({ onExtractionComplete, onSubmit }: ChatLoggerProps) {
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoreResult, setScoreResult] = useState<DailyEntry | null>(null);
  const scoreRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isProcessing) return;

    if (onSubmit) {
      setError(null);
      try {
        await onSubmit(text);
        setText("");
      } catch (err: any) {
        setError(err.message || "Failed to submit score");
      }
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let data;
      try {
        data = await extractDailyJournal(text);
      } catch (innerErr) {
        // Fallback silently if any Gemini API error, network failure, or timeout occurs
        data = localClientFallback(text);
      }
      
      const newEntry: DailyEntry = {
        id: Math.random().toString(),
        date: new Date().toISOString().split("T")[0],
        raw_text: text,
        transport: data.transport || [],
        food: data.food || [],
        energy: data.energy || { electricity_kwh: 0, ac_hours: 0 },
        waste: data.waste || { plastic_items: 0, recycled: false },
        estimated_co2_kg: Number(data.estimated_co2_kg) || 0,
        notes: data.notes || "Success! Recorded by EcoBuddy.",
        timestamp: Date.now(),
        is_fallback: data.is_fallback || false,
      };

      // Propagation starts database log creation
      if (onExtractionComplete) {
        onExtractionComplete(newEntry);
      }

      setScoreResult(newEntry);
      setText("");
      
      // Option B Scroll: smoothly scroll down to the "What You Added Today" section
      setTimeout(() => {
        document.getElementById("what-you-added-today")?.scrollIntoView({ 
          behavior: "smooth", 
          block: "start" 
        });
      }, 300);
    } catch (err: any) {
      setError(err.message || "Oops, EcoBuddy could not read this. Please try again!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#1B2119] border border-[#2C342B] shadow-sm rounded-2xl p-5 min-h-[180px] flex flex-col justify-between" id="chat-logger-component">
        {isProcessing ? (
          <div className="flex-1 flex items-center justify-center py-4">
            <BrandedLoader />
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold tracking-widest uppercase text-emerald-400">
                  Tell EcoBuddy What You Did Today
                </span>
              </div>

              <p className="text-xs text-[#A8B8AA] mb-3 leading-relaxed font-semibold">
                Tell us about your day in simple words. EcoBuddy will do the rest! 😊
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <label htmlFor="chat-input" className="sr-only">
                  Describe your day to EcoBuddy
                </label>
                <textarea
                  id="chat-input"
                  aria-label="Describe your day to EcoBuddy"
                  aria-required="true"
                  aria-describedby="chat-hint"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Example: Today I went to market by auto (3km), ate dal rice for lunch, and used AC for 2 hours at home."
                  className="w-full text-xs p-3.5 bg-[#121714] border border-[#2C342B] text-[#E8F0E3] placeholder:text-[#6B7F6A] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all font-sans"
                  rows={3}
                />
                <p id="chat-hint" className="sr-only">
                  Type what you ate, how you travelled, and home energy use today
                </p>

                {error && (
                  <div className="p-2 text-[11px] bg-red-950/30 border border-red-900 text-red-300 rounded-lg flex items-center gap-1.5 animate-fadeIn">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-[#6B7F6A] font-semibold flex items-center gap-1">Connected ✓</span>
                  <button
                    type="submit"
                    aria-label="Check My Score - Check my carbon footprint score"
                    disabled={isProcessing || !text.trim()}
                    className="bg-green-500 hover:bg-green-400 active:scale-95 text-black font-semibold rounded-xl px-6 py-3 shadow-md shadow-green-900/50 transition-all duration-200 cursor-pointer flex items-center gap-1.5 disabled:bg-slate-850 disabled:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4" />
                        Checking...
                      </>
                    ) : (
                      "Check My Score 🌿"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>

      {scoreResult && (
        <div 
          ref={scoreRef} 
          id="score-results"
          className="mt-6 animate-fadeIn space-y-5 bg-[#1B2119] border border-[#2C342B] rounded-2xl p-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#2C342B]">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <div>
                <h4 className="text-sm font-extrabold text-[#E8F0E3] tracking-tight">Your Daily Scorecard</h4>
                <p className="text-[10px] text-[#A8B8AA] font-bold uppercase tracking-wider">Calculated instantly by EcoBuddy</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 border border-emerald-900/50 px-3 py-1.5 rounded-full inline-block">
                {scoreResult.estimated_co2_kg.toFixed(2)} kg CO2
              </span>
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ImpactCard
              title="🚗 Travel"
              value={`${scoreResult.transport.reduce((acc, t) => acc + (t.distance_km * (COMMUTE_FACTORS[t.mode] || 0.0)), 0).toFixed(2)}`}
              unit="kg CO2"
              icon={<Car className="w-4 h-4" />}
              color="emerald"
              co2Contribution={scoreResult.transport.reduce((acc, t) => acc + (t.distance_km * (COMMUTE_FACTORS[t.mode] || 0.0)), 0)}
              description={`${scoreResult.transport.length ? scoreResult.transport.map(t => `${t.distance_km}km ${t.mode}`).join(', ') : 'No commuting logged'}`}
            />
            <ImpactCard
              title="🥗 Food & Diet"
              value={`${scoreResult.food.reduce((acc, f) => acc + (DIET_FACTORS[f.type] || 0.0), 0).toFixed(2)}`}
              unit="kg CO2"
              icon={<Utensils className="w-4 h-4" />}
              color="blue"
              co2Contribution={scoreResult.food.reduce((acc, f) => acc + (DIET_FACTORS[f.type] || 0.0), 0)}
              description={`${scoreResult.food.length ? scoreResult.food.map(f => f.item).join(', ') : 'No meals logged'}`}
            />
            <ImpactCard
              title="⚡ Energy & AC"
              value={`${((scoreResult.energy.electricity_kwh * 0.82) + (scoreResult.energy.ac_hours * 1.23)).toFixed(2)}`}
              unit="kg CO2"
              icon={<Zap className="w-4 h-4" />}
              color="amber"
              co2Contribution={(scoreResult.energy.electricity_kwh * 0.82) + (scoreResult.energy.ac_hours * 1.23)}
              description={`${scoreResult.energy.electricity_kwh} units, ${scoreResult.energy.ac_hours} AC hours`}
            />
            <ImpactCard
              title="🗑️ Plastic Waste"
              value={`${scoreResult.waste.plastic_items}`}
              unit="items"
              icon={<Trash2 className="w-4 h-4" />}
              color="rose"
              co2Contribution={scoreResult.waste.plastic_items * (scoreResult.waste.recycled ? 0.02 : 0.10)}
              description={scoreResult.waste.recycled ? "Recycled" : "Not Recycled"}
            />
          </div>

          {/* Tree offset */}
          <div className="bg-[#121714] border border-[#2C342B] rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-950/60 rounded-xl flex items-center justify-center text-emerald-400">
              <TreeDeciduous className="w-5 h-5 text-emerald-400 animate-pulse-subtle" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#E8F0E3]">Trees Saving Equivalent</h5>
              <p className="text-[11px] text-[#A8B8AA] font-semibold mt-0.5 leading-snug">
                {scoreResult.estimated_co2_kg < 18 ? (
                  <>
                    Your lower footprint today saved about <strong className="text-emerald-300 font-extrabold">{(18 - scoreResult.estimated_co2_kg).toFixed(2)} kg CO2</strong> compared to an unmonitored household! That's equivalent to the work of <strong className="text-emerald-300 font-extrabold">{((18 - scoreResult.estimated_co2_kg) / 0.057).toFixed(1)} trees</strong> absorbing pollution for a full day! 🌲✨
                  </>
                ) : (
                  <>
                    Today's score is slightly above average ({scoreResult.estimated_co2_kg.toFixed(2)} kg vs 18 kg). Try swapping beef/meat for a vegetarian meal or scheduling less air conditioner use to save trees! 🌳
                  </>
                )}
              </p>
            </div>
          </div>

          {/* EcoBuddy Advice Box */}
          {scoreResult.is_fallback ? (
            <div className="bg-emerald-950/15 border border-emerald-900/50 rounded-2xl p-4.5 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-1">
                  💬 EcoBuddy Message
                </span>
                <p className="text-xs text-[#E8F0E3] font-medium leading-relaxed">
                  "EcoBuddy is resting right now 😴 But we still calculated your pollution score! Your log has been saved. 🌿"
                </p>
              </div>

              <div className="border-t border-[#2C342B] pt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#A8B8AA]">Total CO2:</span>
                  <span className="text-xl font-black text-emerald-400">
                    {scoreResult.estimated_co2_kg.toFixed(1)} kg CO2
                  </span>
                </div>
                
                <div className="text-xs text-[#A8B8AA] font-semibold flex items-center gap-1">
                  <span>= 🌳 {(scoreResult.estimated_co2_kg * 0.05).toFixed(1)} trees needed to absorb this</span>
                </div>

                <div className="text-xs text-[#A8B8AA] font-semibold flex items-center gap-1">
                  {(() => {
                    const descText = (scoreResult.raw_text || "").toLowerCase();
                    const travelVal = scoreResult.transport.reduce((acc, t) => acc + (t.distance_km * (COMMUTE_FACTORS[t.mode] || 0.0)), 0);
                    const foodVal = scoreResult.food.reduce((acc, f) => acc + (DIET_FACTORS[f.type] || 0.0), 0);
                    const energyVal = (scoreResult.energy.electricity_kwh * 0.82) + (scoreResult.energy.ac_hours * 1.23);
                    const wasteVal = scoreResult.waste.plastic_items * (scoreResult.waste.recycled ? 0.02 : 0.10);

                    let maxVal = Math.max(travelVal, foodVal, energyVal, wasteVal);
                    let mainReason = "Baseline household electricity";
                    let mainIcon = "⚡";

                    if (maxVal > 0) {
                      if (maxVal === travelVal) {
                        const distanceMatch = descText.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometer|mile|mi)/i) || descText.match(/(\d+(?:\.\d+)?)\s*(?:\s|$)/);
                        const distVal = distanceMatch ? parseFloat(distanceMatch[1]) : 10;
                        const firstTransport = scoreResult.transport[0];
                        const modeLabel = firstTransport ? (firstTransport.mode.charAt(0).toUpperCase() + firstTransport.mode.slice(1)) : "Car";
                        mainReason = `${modeLabel} travel (${distVal}km)`;
                        mainIcon = firstTransport?.mode === "bus" ? "🚌" : "🚗";
                      } else if (maxVal === foodVal) {
                        const firstFood = scoreResult.food[0];
                        if (firstFood) {
                          mainReason = `${firstFood.item}`;
                        } else {
                          mainReason = "Food selection";
                        }
                        mainIcon = "🥗";
                      } else if (maxVal === energyVal) {
                        if (scoreResult.energy.ac_hours > 0) {
                          mainReason = `Air conditioner (${scoreResult.energy.ac_hours} hours)`;
                        } else {
                          mainReason = `Electricity usage (${scoreResult.energy.electricity_kwh} units)`;
                        }
                        mainIcon = "⚡";
                      } else if (maxVal === wasteVal) {
                        mainReason = `Plastic waste (${scoreResult.waste.plastic_items} items)`;
                        mainIcon = "🗑️";
                      }
                    }
                    
                    return `${mainIcon} Main reason: ${mainReason}`;
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/10 border border-emerald-950 rounded-2xl p-4 space-y-1.5">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                💬 EcoBuddy Tip
              </span>
              <p className="text-xs text-[#A8B8AA] font-medium leading-relaxed italic">
                "{scoreResult.notes}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
