import React, { useState, useEffect } from "react";
import {
  Leaf,
  Plus,
  Trash2,
  Calendar,
  Zap,
  Trash,
  BookOpen,
  ArrowRight,
  Info,
  AlertCircle,
  HelpCircle,
  Loader2,
  Sparkles,
  Award,
  CheckCircle2,
  TrendingDown,
  X,
  Compass,
  FileText,
  LineChart,
  UserCheck,
  Settings,
  Download,
  Moon,
  Sun,
  ShieldAlert,
  LogOut,
  Signal,
  WifiOff
} from "lucide-react";

import { DailyEntry } from "./types";
import { 
  getStoredEntries, 
  saveStoredEntries, 
  getFirestoreEntries, 
  saveFirestoreEntry, 
  deleteFirestoreEntry, 
  purgeAllUserData, 
  getUserProfile, 
  saveUserProfile, 
  auth,
  isMockFirebase,
  UserProfile
} from "./lib/firebase";
import { fetchPersonalizedTips } from "./lib/gemini";
import { onAuthStateChanged, signOut } from "firebase/auth";

// Base Seeds
import { DIET_FACTORS, COMMUTE_FACTORS } from "./lib/emissionFactors";

// Import custom application pages
import OnboardingPage from "./app/onboarding/page";
import DashboardPage from "./app/dashboard/page";
import LogPage from "./app/log/page";
import InsightsPage from "./app/insights/page";

// Import compliance components
import AuthScreen from "./components/AuthScreen";
import PrivacyTerms from "./components/PrivacyTerms";
import { BrandedLoader } from "./components/GraphicAssets";

const SEED_ENTRIES: DailyEntry[] = [
  {
    id: "seed-1",
    date: "2026-06-11",
    raw_text: "Took the bus 15km to work. Ate vegetarian salad for lunch. No AC used.",
    transport: [{ mode: "bus", distance_km: 15 }],
    food: [{ item: "vegetarian salad", type: "vegetarian" }],
    energy: { electricity_kwh: 4, ac_hours: 0 },
    waste: { plastic_items: 0, recycled: true },
    estimated_co2_kg: 5.53,
    notes: "Superb bus commute and veggie lunch choices! You saved roughly 2.87kg CO2 compared to driving! Keep up the brilliant momentum! 🚌🥗",
    timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-2",
    date: "2026-06-12",
    raw_text: "Drove 30km, had a beef burger for dinner and left the AC on for 3 hours.",
    transport: [{ mode: "car", distance_km: 30 }],
    food: [{ item: "beef burger", type: "beef" }],
    energy: { electricity_kwh: 6, ac_hours: 3 },
    waste: { plastic_items: 2, recycled: false },
    estimated_co2_kg: 21.11,
    notes: "Your car transit and beef burger raised today's levels. Try substituting one car trip with public transit or a bike ride this week, and we can easily shave 6kg off your score! 🌿",
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
  }
];

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export default function App() {
  // Navigation & Authentication
  const [activeTab, setActiveTab] = useState<"onboarding" | "dashboard" | "log" | "insights">("dashboard");
  const [user, setUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Core Entries & Tips State
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DailyEntry | null>(null);
  
  const [tips, setTips] = useState<string[]>([
    "Try sharing a bus or walking twice a week to save fuel and reduce travel pollution. 🚌🚶",
    "Swapping even one meat dish for tasty dal rice or paneer cuts your meal pollution a lot! 🍛🥦",
    "Keep the AC off when leaving a room to save electricity bills and help Earth. ❄️⚡"
  ]);
  const [isGeneratingTips, setIsGeneratingTips] = useState(false);

  // Tooltips & Tour Onboarding State for first-time use
  const [showTooltip, setShowTooltip] = useState(true);

  // Force Permanent Dark Mode
  const darkMode = true;

  // Sync darkmode class on app start
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    localStorage.setItem("carbonmate_dark_mode", "true");
  }, []);

  // Regulatory Compliance State
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [cookieConsent, setCookieConsent] = useState<boolean | null>(() => {
    const saved = localStorage.getItem("carbonmate_cookies");
    return saved ? saved === "accepted" : null;
  });

  // Toast System State
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Settings dropdown view flag
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  // Network Connection Status
  const [online, setOnline] = useState(navigator.onLine);

  // Setup event listeners for online state
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      triggerToast("info", "Connected back online. Firestore sync is fully active! 📶");
    };
    const handleOffline = () => {
      setOnline(false);
      triggerToast("info", "Offline mode active. Your carbon changes will be saved locally!");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auth Sync Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Enforce email verification (exclude demo/sandbox environments)
        if (!isMockFirebase && !firebaseUser.emailVerified) {
          setUser(null);
          setUserProfile(null);
          setAuthReady(true);
          return;
        }

        setUser(firebaseUser);
        triggerToast("info", `Signed in securely as ${firebaseUser.displayName || firebaseUser.email}! 🔒`);
        
        // Fetch or bootstrap user profile
        try {
          let profile = await getUserProfile(firebaseUser.uid);
          if (!profile) {
            profile = {
              userId: firebaseUser.uid,
              name: firebaseUser.displayName || "Eco Guardian",
              email: firebaseUser.email || "",
              commutePref: "bus",
              dietPref: "vegetarian",
              acPref: "no",
              onboarded: false,
              createdAt: new Date().toISOString()
            };
            await saveUserProfile(profile);
          }
          setUserProfile(profile);

          // Get entries
          const cloudEntries = await getFirestoreEntries(firebaseUser.uid);
          if (cloudEntries && cloudEntries.length > 0) {
            setEntries(cloudEntries);
          } else {
            // Fallback seed entries
            setEntries(SEED_ENTRIES);
          }

          if (profile.onboarded) {
            setActiveTab("dashboard");
          } else {
            setActiveTab("onboarding");
          }
        } catch (err) {
          setEntries(SEED_ENTRIES);
          setActiveTab("dashboard");
        }
      } else {
        // Log out or not logged in yet
        setUser(null);
        setUserProfile(null);
        setEntries([]);
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Update selected entries whenever entries array modifies
  useEffect(() => {
    if (entries.length > 0 && !selectedEntry) {
      setSelectedEntry(entries[0]);
    }
  }, [entries]);

  // Dynamic Tips fetcher from express server
  const refreshTips = async () => {
    if (entries.length === 0) return;
    setIsGeneratingTips(true);
    try {
      const liveTips = await fetchPersonalizedTips(entries);
      if (liveTips && liveTips.length > 0) {
        setTips(liveTips);
      }
    } catch (err) {
      console.warn("Express proxy error, continuing with fallback carbon advice:", err);
    } finally {
      setIsGeneratingTips(false);
    }
  };

  useEffect(() => {
    if (entries.length > 0) {
      refreshTips();
    }
  }, [entries.length, user]);

  // Helper dispatcher of Toast alert alerts
  const triggerToast = (type: "success" | "error" | "info", message: string) => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Onboarding closure callback
  const handleCompleteOnboarding = async (baselineAnswers: {
    commutePref: string;
    dietPref: string;
    acPref: string;
  }) => {
    // Generate starter baseline logged entry personalized on preferences
    let rawText = "Onboarded with CarbonMate. ";
    let initialCo2 = 4;
    const initialTransport = [];
    const initialFood = [];

    if (baselineAnswers.commutePref === "car") {
      rawText += "Drove 12km commute in small car. ";
      initialTransport.push({ mode: "car" as any, distance_km: 12 });
      initialCo2 += 12 * 0.21;
    } else if (baselineAnswers.commutePref === "bus") {
      rawText += "Rode municipal bus for 15km. ";
      initialTransport.push({ mode: "bus" as any, distance_km: 15 });
      initialCo2 += 15 * 0.05;
    } else {
      rawText += "Walked/cycled to destinations. ";
      initialTransport.push({ mode: "walk" as any, distance_km: 3 });
    }

    if (baselineAnswers.dietPref === "mixed") {
      initialFood.push({ item: "baseline mixed dish", type: "meat" as any });
      initialCo2 += 7;
    } else if (baselineAnswers.dietPref === "vegetarian") {
      initialFood.push({ item: "baseline veggie salad", type: "vegetarian" as any });
      initialCo2 += 1.5;
    } else {
      initialFood.push({ item: "vegan whole grain snack", type: "vegan" as any });
      initialCo2 += 0.5;
    }

    const baselineEntry: DailyEntry = {
      id: `onboarding-starter-${Math.random().toString(36).substring(2, 9)}`,
      date: new Date().toISOString().split("T")[0],
      raw_text: rawText,
      transport: initialTransport,
      food: initialFood,
      energy: { electricity_kwh: 4, ac_hours: baselineAnswers.acPref === "yes" ? 4 : 0 },
      waste: { plastic_items: 1, recycled: true },
      estimated_co2_kg: initialCo2,
      notes: "Congratulations on setting up your CarbonMate profile! EcoBuddy has personalized your starting baseline calculations. Let's make today greener! 🌿✨",
      timestamp: Date.now(),
    };

    const newProfile: UserProfile = {
      userId: user?.uid || "mock-uid-123",
      name: user?.displayName || userProfile?.name || "Eco Guardian",
      email: user?.email || userProfile?.email || "",
      commutePref: baselineAnswers.commutePref,
      dietPref: baselineAnswers.dietPref,
      acPref: baselineAnswers.acPref,
      onboarded: true,
      createdAt: userProfile?.createdAt || new Date().toISOString()
    };

    setEntries((prev) => [baselineEntry, ...prev]);
    setSelectedEntry(baselineEntry);
    setUserProfile(newProfile);
    
    try {
      await saveUserProfile(newProfile);
      await saveFirestoreEntry(newProfile.userId, baselineEntry);
      triggerToast("success", "Your on-boarding setup is completed successfully! Welcome aboard! 🌸");
    } catch (e: any) {
      console.warn("Storage warning:", e);
    }
    
    setActiveTab("dashboard");
  };

  // Add a Carbon activity journal entry
  const handleAddEntry = async (newEntry: DailyEntry) => {
    // Add active logged user ID
    const boundEntry = { ...newEntry, userId: user?.uid || "mock-uid-123" };
    setEntries((prev) => [boundEntry, ...prev]);
    setSelectedEntry(boundEntry);
    
    try {
      await saveFirestoreEntry(user?.uid || "mock-uid-123", boundEntry);
      triggerToast("success", "Eco footprint journal logged successfully! 🚀");
    } catch (err: any) {
      triggerToast("error", "Saved locally. Click the email verification link to enable cloud backup!");
    }
  };

  // Delete Carbon activity log entry
  const handleDeleteEntry = async (entryId: string) => {
    try {
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null);
      }
      await deleteFirestoreEntry(user?.uid || "mock-uid-123", entryId);
      triggerToast("success", "Daily log deleted from timeline.");
    } catch (err: any) {
      triggerToast("error", "Could not complete log deleting.");
    }
  };

  // DATA PORTABILITY COMPLIANCE: Download journal entries as JSON file
  const handleDownloadExport = () => {
    try {
      const exportJson = JSON.stringify({
        appName: "CarbonMate",
        exportTimestamp: new Date().toISOString(),
        userEmail: user?.email || "anonymous",
        totalEmissionsCo2Kg: entries.reduce((acc, cr) => acc + cr.estimated_co2_kg, 0),
        historyLogs: entries
      }, null, 2);

      const blob = new Blob([exportJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `carbonmate_export_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast("success", "Your verified carbon footprint logs have been exported successfully! 📂");
    } catch (err) {
      triggerToast("error", "Failed to compile your data for download.");
    }
  };

  // ACCOUNT PERMANENT PURGE COMPLIANCE: Purges all Firestore and local data
  const handleAccountDeletion = async () => {
    const confirmation = window.confirm(
      "WARNING: Are you absolutely sure you want to permanently erase your CarbonMate account and delete all logged carbon history? This operation is irreversible and fully respects your GDPR Right to Oblivion."
    );
    if (!confirmation) return;

    try {
      await purgeAllUserData(user?.uid || "mock-uid-123");
      signOut(auth);
      setUser(null);
      setUserProfile(null);
      setEntries([]);
      triggerToast("success", "Your cloud account and daily history records have been fully purged from all systems.");
    } catch (err) {
      triggerToast("error", "Encountered an issue during account deletion.");
    }
  };

  // Handle mock sandbox instant bypass
  const handleEnterDemoMode = () => {
    const dummyUser = {
      uid: "mock-uid-123",
      email: "eco-sandbox-visitor@gmail.com",
      displayName: "Demo Sandbox Guardian",
      emailVerified: true
    };
    setUser(dummyUser);
    setUserProfile({
      userId: dummyUser.uid,
      name: dummyUser.displayName,
      email: dummyUser.email,
      commutePref: "bike",
      onboarded: true,
      dietPref: "vegetarian",
      acPref: "no",
      createdAt: new Date().toISOString()
    });
    setEntries(SEED_ENTRIES);
    triggerToast("success", "Loaded interactive Sandbox trial! Fully functional mock environment.");
    setActiveTab("dashboard");
  };

  // Cookie compliance banner choice handlers
  const handleAcceptCookies = () => {
    localStorage.setItem("carbonmate_cookies", "accepted");
    setCookieConsent(true);
    triggerToast("success", "Privacy settings updated. Essential cookie keys verified! 🍪");
  };

  const handleDeclineCookies = () => {
    localStorage.setItem("carbonmate_cookies", "declined");
    setCookieConsent(false);
    triggerToast("info", "Cookie storage declined. Only critical security tokens will be loaded.");
  };

  const totalCo2Cumulative = entries.reduce((acc, cr) => acc + cr.estimated_co2_kg, 0);

  // Authentication barrier Check
  if (!authReady) {
    return (
      <div className="min-h-screen bg-bg-base text-text-primary flex flex-col items-center justify-center p-6 gap-3 font-sans">
        <BrandedLoader />
      </div>
    );
  }

  // If not authenticated, render the high fidelity Auth screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#121714] via-[#161d19] to-[#121714] text-[#E8F0E3] flex items-center justify-center p-4 md:p-8 font-sans transition-colors duration-250">
        <AuthScreen 
          onAuthSuccess={(firebaseUser) => setUser(firebaseUser)}
          onEnterDemoMode={handleEnterDemoMode}
          darkMode={true}
          onToggleDarkMode={() => {}}
        />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-bg-base text-text-primary flex flex-col font-sans transition-colors duration-250" 
      id="global-application-glass-container"
    >
      
      {/* Toast Overlay Container */}
      <div className="fixed top-5 right-5 z-50 space-y-2 pointer-events-none max-w-sm w-full" id="global-toasts-container">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl flex items-start gap-2.5 border text-xs font-extrabold animate-in slide-in-from-top-4 duration-300 ${
              t.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-250 dark:bg-emerald-950 dark:text-emerald-100"
                : t.type === "error"
                ? "bg-rose-50 text-rose-900 border-rose-250 dark:bg-rose-950 dark:text-rose-100"
                : "bg-blue-50 text-blue-900 border-blue-250 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800"
            }`}
          >
            <div className="mt-0.5 font-bold">
              {t.type === "success" ? "❇️" : t.type === "error" ? "🚨" : "🛡️"}
            </div>
            <div className="flex-1">{t.message}</div>
          </div>
        ))}
      </div>

      {/* Onboarding welcome callout tooltip */}
      {showTooltip && (
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white text-xs px-4 py-2.5 flex items-center justify-between gap-3 text-center font-bold relative shrink-0">
          <div className="flex items-center gap-1.5 mx-auto">
            <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" />
            <span>💡 EcoBuddy Tip: Type how your day went inside 'Logger', or see how we count scores inside 'Insights'!</span>
          </div>
          <button 
            onClick={() => setShowTooltip(false)}
            className="w-5 h-5 rounded-full hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Universal header with navigation tabs */}
      <header className="px-2 sm:px-4 md:px-8 py-3 flex flex-nowrap items-center justify-between gap-1.5 sm:gap-4 sticky top-0 z-40 shrink-0 shadow-sm transition-colors duration-250 bg-bg-surface border-b border-border-custom w-full">
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
            <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="shrink-0">
            <h1 className="text-xs sm:text-base md:text-xl font-extrabold tracking-tight flex items-center gap-1">
              CarbonMate
              <span className="hidden sm:inline-block text-[9px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 py-0.5 px-2 rounded-full">
                EcoBuddy AI
              </span>
            </h1>
          </div>
        </div>

        {/* RESPONSIVE TAB BAR */}
        <nav className="fixed bottom-0 left-0 right-0 rounded-none border-t border-border-custom bg-bg-surface/95 backdrop-blur-md px-4 py-2 pb-[calc(10px+env(safe-area-inset-bottom))] justify-around shadow-lg z-40 flex items-center gap-1 md:relative md:bottom-auto md:left-auto md:right-auto md:rounded-2xl md:border md:bg-bg-base md:backdrop-blur-none md:p-1 md:pb-1 md:justify-start md:shadow-none max-w-full overflow-x-auto no-scrollbar border-border-custom">
          <button
            onClick={() => setActiveTab("onboarding")}
            aria-label="My Profile"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex flex-col md:flex-row items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap cursor-pointer min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex-1 md:flex-none ${
              activeTab === "onboarding"
                ? "bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary md:bg-bg-surface shadow-xs"
                : "text-text-secondary hover:text-brand-primary"
            }`}
          >
            <UserCheck className="w-5 h-5 md:w-3.5 md:h-3.5" />
            <span className="hidden md:inline">My Profile</span>
          </button>
          
          <button
            onClick={() => setActiveTab("dashboard")}
            aria-label="Dashboard"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex flex-col md:flex-row items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap cursor-pointer min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex-1 md:flex-none ${
              activeTab === "dashboard"
                ? "bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary md:bg-bg-surface shadow-xs"
                : "text-text-secondary hover:text-brand-primary"
            }`}
          >
            <Compass className="w-5 h-5 md:w-3.5 md:h-3.5" />
            <span className="hidden md:inline">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("log")}
            aria-label="Logger"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex flex-col md:flex-row items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap cursor-pointer min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex-1 md:flex-none ${
              activeTab === "log"
                ? "bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary md:bg-bg-surface shadow-xs"
                : "text-text-secondary hover:text-brand-primary"
            }`}
          >
            <FileText className="w-5 h-5 md:w-3.5 md:h-3.5" />
            <span className="hidden md:inline">Logger</span>
          </button>

          <button
            onClick={() => setActiveTab("insights")}
            aria-label="Insights"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex flex-col md:flex-row items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap cursor-pointer min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex-1 md:flex-none ${
              activeTab === "insights"
                ? "bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary md:bg-bg-surface shadow-xs"
                : "text-text-secondary hover:text-brand-primary"
            }`}
          >
            <LineChart className="w-5 h-5 md:w-3.5 md:h-3.5" />
            <span className="hidden md:inline">Insights</span>
          </button>
        </nav>

        {/* Dynamic Connected, Theme mode toggler, and Settings inside a unified horizontal container */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap shrink-0 relative">
          {/* Dynamic Online / Offline status badge */}
          {online ? (
            <span className="text-[10px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-250 dark:border-emerald-800 px-1.5 py-1 rounded-full flex items-center gap-1 shadow-xs shrink-0">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <Signal className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Connected</span>
            </span>
          ) : (
            <span className="text-[10px] sm:text-xs font-bold text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 border border-amber-250 dark:border-amber-800 px-1.5 py-1 rounded-full flex items-center gap-1 shadow-xs shrink-0">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
              </span>
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Offline Syncing</span>
            </span>
          )}

          {/* Secure config menu */}
          <button 
            onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
            className={`w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl transition cursor-pointer shrink-0 flex items-center justify-center ${
              showSettingsDropdown ? "bg-emerald-600 text-white" : "bg-[#1B2119] text-emerald-400 hover:bg-[#222d20] border border-[#2C342B]"
            }`}
            id="settings-gear-btn"
          >
            <Settings className="w-5 h-5" />
          </button>

          {showSettingsDropdown && (
            <div className="absolute right-0 top-12 p-3 rounded-2xl border w-56 flex flex-col gap-2.5 z-50 shadow-2xl bg-[#1B2119] border-[#2C342B] text-[#E8F0E3]" id="settings-popup-dropdown">
              <div className="pb-2 border-b border-dashed border-slate-150 mb-1.5">
                <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Account Settings</span>
                <span className="text-[11px] truncate font-bold text-slate-500 block">{user?.email}</span>
              </div>

              {/* Download compliance data */}
              <button 
                onClick={() => { setShowSettingsDropdown(false); handleDownloadExport(); }}
                className="text-xs font-bold text-left hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
                id="export-data-btn"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Export Footprint (JSON)</span>
              </button>

              {/* View Privacy Policy modal */}
              <button 
                onClick={() => { setShowSettingsDropdown(false); setShowPrivacy(true); }}
                className="text-xs font-bold text-left hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Privacy & compliance</span>
              </button>

              {/* Sign out */}
              <button 
                onClick={() => {
                  setShowSettingsDropdown(false);
                  signOut(auth);
                  setUser(null);
                  setUserProfile(null);
                  triggerToast("info", "Logged out securely. Session ended.");
                }}
                className="text-xs font-bold text-left hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 p-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
                id="signout-profile-btn"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out Account</span>
              </button>

              {/* GDPR Oblivion Purge */}
              <button 
                onClick={() => { setShowSettingsDropdown(false); handleAccountDeletion(); }}
                className="text-[10px] font-black uppercase text-left hover:bg-rose-100 border border-rose-200/50 p-2 rounded-xl text-rose-700 bg-rose-50/50 flex items-center gap-2 cursor-pointer"
                id="gdpr-delete-account-btn"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Permanent Oblivion Purge</span>
              </button>
            </div>
          )}
        </div>

      </header>

      {/* Main Container Core */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-8 overflow-hidden flex flex-col" id="main-content-flow">
        <div className="flex-1 min-h-0">
          {activeTab === "onboarding" && (
            <OnboardingPage onCompleteOnboarding={handleCompleteOnboarding} />
          )}

          {activeTab === "dashboard" && (
            <DashboardPage
              entries={entries}
              selectedEntry={selectedEntry}
              onSelectEntry={setSelectedEntry}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === "log" && (
            <LogPage onAddEntry={handleAddEntry} entries={entries} />
          )}

          {activeTab === "insights" && (
            <InsightsPage
              entries={entries}
              tips={tips}
              isGeneratingTips={isGeneratingTips}
              onRefreshTips={refreshTips}
            />
          )}
        </div>
      </main>

      {/* Dynamic Cookie Consent banner for analytics and compliance */}
      {cookieConsent === null && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-slate-900 text-white p-4 rounded-3xl border border-slate-700 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-5" id="cookie-consent-bar">
          <div className="space-y-1">
            <h4 className="text-xs font-extrabold flex items-center gap-1.5">
              <span>🍪</span> Cookie Settings
            </h4>
            <p className="text-[11px] text-slate-300 font-semibold leading-relaxed max-w-2xl">
              We use cookies to save your settings and pollution logs. You can accept below or change them in Settings any time!
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={handleDeclineCookies}
              className="px-4 py-2 border border-slate-600 hover:border-slate-500 rounded-xl text-[11px] font-bold transition cursor-pointer"
            >
              No
            </button>
            <button 
              onClick={handleAcceptCookies}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black transition cursor-pointer font-bold"
            >
              Accept
            </button>
          </div>
        </div>
      )}

      {/* Global Regulatory compliance modal */}
      {showPrivacy && <PrivacyTerms onClose={() => setShowPrivacy(false)} />}

      {/* Intelligent bottom footer */}
      <footer className="shrink-0 py-4 px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-4 text-center text-[11.5px] font-semibold transition-colors duration-250 bg-slate-900/50 border-t border-slate-800 text-slate-400">
        <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4">
          <p className="flex justify-center items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>EcoBuddy is working and active.</span>
          </p>
          <span className="hidden md:inline text-slate-300">|</span>
          <button 
            onClick={() => setShowPrivacy(true)}
            className="text-emerald-400 hover:underline cursor-pointer"
          >
            Security & Privacy Policy
          </button>
        </div>
      </footer>
    </div>
  );
}
