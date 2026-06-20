import React from "react";
import Image from "./Image";
import { motion, AnimatePresence } from "motion/react";

interface EcoBuddyProps {
  co2Score?: number; // Current day's score to adjust facial expressions and color accents
  co2Today?: number; // Prop used by Vitest testing suites
  className?: string;
  isThinking?: boolean;
}

export default function EcoBuddy({ co2Score = 0, co2Today, className = "", isThinking = false }: EcoBuddyProps) {
  const finalCO2 = co2Today !== undefined ? co2Today : co2Score;

  // Determine happiness level based on footprint score
  let mood: "ecstatic" | "happy" | "neutral" | "concerned" | "supportive" = "happy";
  let moodLabel = "EcoBuddy is happy with you! 🌱";
  let moodColor = "border-emerald-200 bg-emerald-50/70 text-emerald-800";
  let characterColor = "#10b981"; // Emerald-500

  if (finalCO2 === 0) {
    mood = "ecstatic";
    moodLabel = "EcoBuddy is so happy! Very clean day! 🎉";
    moodColor = "border-teal-200 bg-teal-50/80 text-teal-900 animate-pulse";
    characterColor = "#14b8a6"; // Teal-500
  } else if (finalCO2 < 6) {
    mood = "happy";
    moodLabel = "EcoBuddy is smiling! Low pollution today. 😊";
    moodColor = "border-emerald-200 bg-emerald-50/75 text-emerald-800";
    characterColor = "#10b981"; // Emerald-500
  } else if (finalCO2 < 15) {
    mood = "neutral";
    moodLabel = "EcoBuddy is smiling. Good progress today! 👍";
    moodColor = "border-blue-200 bg-blue-50/75 text-blue-800";
    characterColor = "#3b82f6"; // Blue-500
  } else if (finalCO2 < 30) {
    mood = "concerned";
    moodLabel = "EcoBuddy says: let's try to reduce pollution tomorrow!";
    moodColor = "border-amber-200 bg-amber-50/85 text-amber-900";
    characterColor = "#f59e0b"; // Amber-500
  } else {
    mood = "supportive";
    moodLabel = "Don't worry! We will do better tomorrow. 😊";
    moodColor = "border-rose-100 bg-rose-50/85 text-rose-950";
    characterColor = "#f43f5e"; // Rose-500
  }


  // Generate eye configurations dynamically
  const renderEyes = () => {
    switch (mood) {
      case "ecstatic":
        return (
          <>
            {/* Happy arching eyes (^^) */}
            <path d="M 12 18 Q 18 12 24 18M 36 18 Q 42 12 48 18" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        );
      case "happy":
        return (
          <>
            {/* Round twinkling eyes */}
            <circle cx="18" cy="18" r="4.5" fill="#1e293b" />
            <circle cx="42" cy="18" r="4.5" fill="#1e293b" />
            <circle cx="20" cy="16" r="1.5" fill="white" />
            <circle cx="44" cy="16" r="1.5" fill="white" />
          </>
        );
      case "neutral":
        return (
          <>
            {/* Standard shiny robot circles */}
            <circle cx="18" cy="18" r="4" fill="#1e293b" />
            <circle cx="42" cy="18" r="4" fill="#1e293b" />
          </>
        );
      case "concerned":
        return (
          <>
            {/* Slightly slanted worried eyebrows + circles */}
            <circle cx="18" cy="19" r="3.5" fill="#1e293b" />
            <circle cx="42" cy="19" r="3.5" fill="#1e293b" />
            <path d="M 12 12 L 22 15M 48 12 L 38 15" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          </>
        );
      case "supportive":
        return (
          <>
            {/* Reassuring soft horizontal arches */}
            <path d="M 12 16 L 22 16M 38 16 L 48 16" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </>
        );
    }
  };

  const renderMouth = () => {
    switch (mood) {
      case "ecstatic":
        return (
          <path d="M 22 28 Q 30 38 38 28 Z" fill="#e11d48" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        );
      case "happy":
        return (
          <path d="M 22 28 Q 30 34 38 28" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
        );
      case "concerned":
        return (
          <path d="M 24 30 L 36 30" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
        );
      case "supportive":
        return (
          <path d="M 24 32 Q 30 27 36 32" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
        );
      default:
        // Neutral slight line
        return (
          <path d="M 25 30 Q 30 28 35 30" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        );
    }
  };

  const getEcoBuddyMood = (co2Today: number) => {
    if (co2Today === 0) return {
      image: "/images/ecobuddy-neutral.png",
      title: "Start logging to see EcoBuddy react!",
      message: "Tell me what you did today 🌿",
      alt: "EcoBuddy character waiting for daily log"
    };
    if (co2Today < 5) return {
      image: "/images/ecobuddy-happy.png",
      title: "EcoBuddy is Happy! 😄",
      message: "Amazing! Very low pollution today! EcoBuddy is smiling.",
      alt: "EcoBuddy character smiling happily"
    };
    if (co2Today < 15) return {
      image: "/images/ecobuddy-neutral.png",
      title: "EcoBuddy is Okay 😐",
      message: "Not bad! Try to reduce car use tomorrow",
      alt: "EcoBuddy character looking neutral"
    };
    return {
      image: "/images/ecobuddy-sad.png",
      title: "EcoBuddy is Worried 😟",
      message: "High pollution today! Try to reduce emissions by using bus or auto tomorrow!",
      alt: "EcoBuddy character looking worried"
    };
  };

  const moodData = getEcoBuddyMood(finalCO2);
  const isHappy = finalCO2 < 15;

  return (
    <div className={`p-4 rounded-3xl border text-center flex flex-col items-center gap-3.5 transition-all duration-300 ${moodColor} ${className}`} id="ecobuddy-animated-character">
      {/* High-Fidelity Companion Illustration Container with Crossfade */}
      <div className="w-full rounded-2xl overflow-hidden aspect-square relative border border-black/5 shadow-sm group bg-slate-900/40">
        <AnimatePresence mode="wait">
          <motion.div
            key={moodData.image}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <Image
              src={moodData.image}
              alt={moodData.alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              width={250}
              height={250}
              priority={true}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs text-[9px] font-black tracking-widest text-white px-2 py-0.5 rounded-full uppercase z-10">
          {finalCO2 === 0 ? "📢 New" : isHappy ? "🌳 Green" : "⚠️ High"}
        </div>
      </div>

      <div className="flex items-center gap-3 bg-slate-900/45 border border-[#2C342B]/30 p-2.5 rounded-2xl w-full">
        {/* Interactive animated SVG Container */}
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          
          {/* Ambient shadow glow behind buddy */}
          <div 
            className="absolute inset-1 rounded-full blur-md opacity-30 animate-pulse transition-all duration-300"
            style={{ backgroundColor: characterColor }}
          />

          <svg
            viewBox="0 0 60 60"
            className={`w-10 h-10 relative z-1 transition-all duration-300 ${isThinking ? "animate-bounce" : "hover:scale-110"}`}
          >
            {/* Sprout on Head (Eco symbol, sways dynamically) */}
            <g className="origin-[30px_12px] animate-pulse">
              {/* Stem */}
              <path d="M 30 16 Q 32 8 36 6" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
              {/* Left Leaf */}
              <path d="M 36 6 C 33 2 28 6 30 10 C 33 14 38 10 36 6 Z" fill="#4ade80" />
              {/* Right Leaf */}
              <path d="M 36 6 C 40 4 41 9 37 11 C 33 13 32 8 36 6 Z" fill="#22c55e" />
            </g>

            {/* Main Round Pot/Robot Body */}
            <rect
              x="8"
              y="14"
              width="44"
              height="36"
              rx="18"
              ry="18"
              fill={characterColor}
              stroke="#1e293b"
              strokeWidth="3.5"
              className="transition-all duration-500"
            />

            {/* Golden/White Screen Cover for eyes */}
            <rect
              x="11"
              y="17"
              width="38"
              height="18"
              rx="9"
              fill="#f1f5f9"
              stroke="#1e293b"
              strokeWidth="2.5"
            />

            {/* Screen highlight */}
            <path d="M 14 20 L 46 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

            {/* Render face elements */}
            {renderEyes()}
            {renderMouth()}

            {/* Rosy blush cheeks */}
            <circle cx="15" cy="28" r="2.5" fill="#fda4af" opacity="0.8" />
            <circle cx="45" cy="28" r="2.5" fill="#fda4af" opacity="0.8" />
          </svg>

          {isThinking && (
            <div className="absolute top-0 right-0 bg-emerald-500 text-white rounded-full p-1 text-[8px] font-bold animate-ping">
              AI
            </div>
          )}
        </div>

        <div className="text-left overflow-hidden flex-1">
          <span className="text-[9px] font-black uppercase tracking-widest bg-slate-900/10 px-2 py-0.5 rounded-md inline-block text-slate-800 dark:text-emerald-100">
            {moodData.title}
          </span>
          <p className="text-[11px] font-bold mt-0.5 text-slate-700 dark:text-emerald-50 leading-snug">
            {moodData.message}
          </p>
        </div>
      </div>
    </div>
  );
}
