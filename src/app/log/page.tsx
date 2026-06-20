import React, { useState } from "react";
import Image from "../../components/Image";
import { DailyEntry } from "../../types";
import { getUserDisplayName } from "../../lib/getUserDisplayName";
import ChatLogger from "../../components/ChatLogger";
import ManualLogger from "../../components/ManualLogger";
import { Sparkles, HelpCircle, Check, Info } from "lucide-react";
import { EmptyState } from "../../components/GraphicAssets";
import { motion, AnimatePresence } from "motion/react";

interface LogPageProps {
  onAddEntry: (entry: DailyEntry) => void;
  entries: DailyEntry[];
  user?: { displayName?: string | null; email?: string | null } | null;
}

export default function LogPage({ onAddEntry, entries, user }: LogPageProps) {
  const [activeSubTab, setActiveSubTab] = useState<"ai" | "manual">("ai");
  const [newEntryId, setNewEntryId] = useState<string | null>(null);
  const [selectedModeId, setSelectedModeId] = useState<"car" | "auto" | "bus" | "bike">("car");
  const [distanceKm, setDistanceKm] = useState<number>(50);

  const transportModes = [
    { 
      id: "car" as const, 
      label: "Car", 
      emoji: "🚗",
      image: "/illustrations/car.svg",
      co2PerKm: 0.21,
      color: "rose"
    },
    { 
      id: "auto" as const, 
      label: "Auto", 
      emoji: "🛺",
      image: "/illustrations/auto.svg",
      co2PerKm: 0.13,
      color: "amber"
    },
    { 
      id: "bus" as const, 
      label: "Bus", 
      emoji: "🚌",
      image: "/illustrations/bus.svg",
      co2PerKm: 0.08,
      color: "blue"
    },
    { 
      id: "bike" as const, 
      label: "Bike", 
      emoji: "🚲",
      image: "/illustrations/bike.svg",
      co2PerKm: 0.00,
      color: "emerald"
    }
  ];

  const currentMode = transportModes.find(m => m.id === selectedModeId) || transportModes[0];
  const co2Total = parseFloat((distanceKm * currentMode.co2PerKm).toFixed(2));
  const treesRequired = parseFloat((co2Total / 21).toFixed(2));

  const displayName = getUserDisplayName(user);

  // Wrap the entry completion to automatically track and highlight the newly added item
  const handleAddEntryWrapped = (newEntry: DailyEntry) => {
    setNewEntryId(newEntry.id);
    onAddEntry(newEntry);
    
    // Clear highlight status after the 2-second flash animation completes
    setTimeout(() => {
      setNewEntryId(null);
    }, 2500);
  };

  return (
    <div className="space-y-6" id="log-page-container">
      {/* Intro prompt */}
      <div className="bg-slate-900 border border-slate-800 shadow-lg rounded-2xl p-5 text-white">
        <h2 className="text-xl md:text-2xl font-black font-sans leading-tight">
          Hello, {displayName}! 📝
        </h2>
        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
          How do you want to calculate your pollution today? Type your day in simple English below, or write down the numbers yourself.
        </p>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-3 mt-4 relative z-0" id="tab-switcher">
          <button
            type="button"
            onClick={() => setActiveSubTab("ai")}
            className={`relative px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95 border-2 ${
              activeSubTab === "ai"
                ? "bg-green-500 text-white border-green-500 shadow-md"
                : "bg-slate-800/80 border-slate-700 text-slate-300 hover:border-green-400 hover:text-green-400"
            }`}
          >
            {activeSubTab === "ai" && (
              <motion.span
                layoutId="activeTabPill"
                className="absolute inset-0 bg-green-500 rounded-full -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Sparkles className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Auto Read</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("manual")}
            className={`relative px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95 border-2 ${
              activeSubTab === "manual"
                ? "bg-green-500 text-white border-green-500 shadow-md"
                : "bg-slate-800/80 border-slate-700 text-slate-300 hover:border-green-400 hover:text-green-400"
            }`}
          >
            {activeSubTab === "manual" && (
              <motion.span
                layoutId="activeTabPill"
                className="absolute inset-0 bg-green-500 rounded-full -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">🔨 Fill it Yourself</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Logger form container */}
        <div className="lg:col-span-2 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSubTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {activeSubTab === "ai" ? (
                <div className="space-y-4">
                  <ChatLogger onExtractionComplete={handleAddEntryWrapped} />

                  <div className="bg-emerald-950/20 border border-emerald-950 rounded-2xl p-4 space-y-3">
                    <span className="font-extrabold text-emerald-400 block text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> EcoBuddy AI Prompt Tips
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-[#1B2119] p-3 rounded-xl border border-[#2C342B] shadow-xs flex items-start gap-2.5">
                        <span className="text-lg shrink-0">🛺</span>
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Travel</p>
                          <p className="text-[11.5px] text-[#A8B8AA] font-semibold leading-snug">
                            Tell how far you travelled — like <span className="italic text-emerald-300">'5 km by bike'</span> or <span className="italic text-emerald-300">'2 km by auto'</span> 🛺
                          </p>
                        </div>
                      </div>
                      <div className="bg-[#1B2119] p-3 rounded-xl border border-[#2C342B] shadow-xs flex items-start gap-2.5">
                        <span className="text-lg shrink-0">🍱</span>
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Food</p>
                          <p className="text-[11.5px] text-[#A8B8AA] font-semibold leading-snug">
                            Tell what you ate — like <span className="italic text-emerald-300">'chicken curry'</span>, <span className="italic text-emerald-300">'paneer'</span> or <span className="italic text-emerald-300">'dal rice'</span> 🍱
                          </p>
                        </div>
                      </div>
                      <div className="bg-[#1B2119] p-3 rounded-xl border border-[#2C342B] shadow-xs flex items-start gap-2.5">
                        <span className="text-lg shrink-0">⚡</span>
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Home Energy</p>
                          <p className="text-[11.5px] text-[#A8B8AA] font-semibold leading-snug">
                            Tell if you used <span className="italic text-emerald-300">'AC for 2 hours'</span>, or fan / TV for long hours ⚡
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <ManualLogger onAddEntry={handleAddEntryWrapped} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Quick Recent Activity Sidebar helper */}
        <div className="space-y-6">
          <div id="what-you-added-today" className="bg-[#1B2119] border border-[#2C342B] shadow-sm rounded-2xl p-5 space-y-4 scroll-mt-20">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#A8B8AA] flex items-center gap-2">
              🪵 What You Added Today
            </h3>

            <div className="space-y-2.5">
              {entries.slice(0, 4).map((entry) => (
                <div 
                  key={entry.id} 
                  className={`p-3 bg-[#121714] border border-[#2C342B] hover:bg-[#222d20] rounded-xl leading-relaxed transition-all ${
                    entry.id === newEntryId ? "highlight-new" : ""
                  }`}
                >
                  <div className="flex justify-between text-[10px] font-bold text-[#6B7F6A] mb-1">
                    <span>{entry.date}</span>
                    <span className={`font-bold ${
                      entry.estimated_co2_kg < 10 
                        ? "text-green-400" 
                        : "text-red-400"
                    }`}>
                      {entry.estimated_co2_kg.toFixed(2)} kg
                    </span>
                  </div>
                  <p className="text-xs text-[#E8F0E3] font-medium truncate">
                    {entry.raw_text}
                  </p>
                  {entry.notes && (
                    <p className="text-sm text-[#A8B8AA] mt-1 line-clamp-2 italic">
                      "{entry.notes}"
                    </p>
                  )}
                </div>
              ))}

              {entries.length === 0 && (
                <EmptyState 
                  title="Timeline is Clean! 🌱" 
                  description="Type your day above or fill the form to see your score!" 
                />
              )}
            </div>
          </div>

          {/* Transit Impact Visualizer Card */}
          <div className="bg-[#1B2119] border border-[#2C342B] shadow-sm rounded-2xl p-4 overflow-hidden space-y-4" id="transit-calculator-container">
            <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
              Transit Impact Guide
            </h4>

            {/* Clickable transport modes */}
            <div className="grid grid-cols-4 gap-2 pb-1 overflow-x-auto">
              {transportModes.map((mode) => {
                const isSelected = selectedModeId === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSelectedModeId(mode.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center text-center justify-between transition-all duration-300 cursor-pointer h-24 ${
                      isSelected
                        ? "bg-[#253022] border-brand-primary text-white scale-103 shadow-md"
                        : "bg-[#161D15] border-[#2C342B] text-[#A8B8AA] hover:border-[#4B5E4A]"
                    }`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                      <Image
                        src={mode.image}
                        alt={mode.label}
                        width={40}
                        height={40}
                        className={`w-full h-full object-contain transition-all ${
                          isSelected ? "scale-110" : "opacity-80"
                        }`}
                      />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black leading-none">{mode.emoji} {mode.label}</p>
                      <p className="text-[8px] opacity-75 font-mono leading-none">{mode.co2PerKm.toFixed(2)} kg/km</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Travel Distance Input/Slider */}
            <div className="space-y-1 pt-1 border-t border-[#2C342B]/40">
              <div className="flex justify-between items-center text-[9px] font-black text-[#A8B8AA] uppercase tracking-wider">
                <span>Journey Distance</span>
                <span className="text-brand-primary font-black">{distanceKm} km</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="100" 
                step="5"
                value={distanceKm} 
                onChange={(e) => setDistanceKm(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-[#121714] rounded-lg appearance-none cursor-pointer border border-[#232B22]"
              />
            </div>

            {/* Smooth transition comparison results container */}
            <div className="bg-[#121714] border border-[#232B22] p-3 rounded-xl min-h-[58px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedModeId}-${distanceKm}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="w-full text-center space-y-1"
                >
                  <p className="text-xs font-bold text-[#E8F0E3]">
                    {currentMode.emoji} {currentMode.label} ({distanceKm}km) &nbsp;=&nbsp;{" "}
                    <span className="text-rose-400 font-extrabold">{co2Total} kg CO₂</span>
                  </p>
                  <p className="text-[10.5px] text-[#A8B8AA] leading-normal font-semibold">
                    🌳 Equivalent: requires{" "}
                    <span className="text-emerald-400 font-black">
                      {treesRequired} trees
                    </span>{" "}
                    to absorb annually!
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
