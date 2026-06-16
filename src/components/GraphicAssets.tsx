import React from "react";
import { Car, Utensils, Zap, Trash2, Award, TreePine, Sparkles, Check } from "lucide-react";

// 1. HERO INDIVIDUAL ILLUSTRATION (Swaying trees, floating clouds, blinking EcoBuddy)
export function HeroIllustration() {
  return (
    <div className="relative w-full max-w-[260px] aspect-[4/3] flex items-center justify-center shrink-0 select-none overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 shadow-xs">
      {/* Absolute floating clouds */}
      <svg className="absolute w-full h-full inset-0 pointer-events-none" viewBox="0 0 160 120">
        {/* Sun */}
        <circle cx="130" cy="30" r="12" fill="#FBBF24" className="animate-pulse-subtle" opacity="0.9" />
        <circle cx="130" cy="30" r="16" stroke="#FBBF24" strokeWidth="2" strokeDasharray="3 3" fill="none" className="animate-spin-slow" opacity="0.6" />

        {/* Cloud 1 */}
        <g className="animate-float" style={{ animationDelay: "0s" }}>
          <path d="M 15 25 Q 22 17 28 25 Q 35 25 32 32 L 12 32 Z" fill="white" className="fill-white/80 dark:fill-slate-700/80" />
        </g>
        {/* Cloud 2 */}
        <g className="animate-float" style={{ animationDelay: "2s" }}>
          <path d="M 85 40 Q 90 35 95 40 Q 102 40 99 46 L 80 46 Z" fill="white" className="fill-white/70 dark:fill-slate-700/60" />
        </g>

        {/* Rolling Hills Landscape */}
        <path d="M -10 125 Q 40 90 90 125 T 190 125 L 190 140 L -10 140 Z" fill="#10B981" opacity="0.25" />
        <path d="M -10 125 Q 70 85 170 125 L 170 140 L -10 140 Z" fill="#059669" opacity="0.35" />

        {/* Swaying Tree 1 (Left) */}
        <g className="animate-sway origin-[25px_105px]">
          {/* Trunk */}
          <rect x="23" y="85" width="4" height="20" rx="1.5" fill="#78350F" />
          {/* Foliage */}
          <circle cx="25" cy="75" r="14" fill="#047857" />
          <circle cx="31" cy="72" r="10" fill="#10B981" />
        </g>

        {/* Swaying Tree 2 (Right) */}
        <g className="animate-sway-reverse origin-[135px_105px]" style={{ transformScale: 0.85 }}>
          {/* Trunk */}
          <rect x="133" y="90" width="3.5" height="15" rx="1.5" fill="#78350F" />
          {/* Foliage */}
          <circle cx="135" cy="82" r="12" fill="#065F46" />
          <circle cx="139" cy="80" r="8" fill="#34D399" />
        </g>

        {/* Little EcoBuddy sitting contentedly in the center */}
        <g className="animate-float origin-[80px_90px]" style={{ animationDelay: "1s" }}>
          {/* Shadow */}
          <ellipse cx="80" cy="103" rx="14" ry="4" fill="black" opacity="0.1" />

          {/* Body Sprout */}
          <g transform="translate(62, 57)">
            {/* Sprout Stem */}
            <path d="M 18 14 Q 20 6 24 4" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
            <path d="M 24 4 C 21 0 16 4 18 8 Z" fill="#4ADE80" />
            <path d="M 24 4 C 28 2 29 7 25 9 Z" fill="#22C55E" />
            
            {/* Body */}
            <rect x="2" y="12" width="32" height="26" rx="13" fill="#10B981" stroke="#065F46" strokeWidth="2" />
            
            {/* Gloss Area */}
            <rect x="5" y="15" width="26" height="12" rx="6" fill="#F1F5F9" stroke="#065F46" strokeWidth="1.5" />
            
            {/* Blinking eyes */}
            <g className="animate-blink">
              <circle cx="12" cy="20" r="3" fill="#1E293B" />
              <circle cx="24" cy="20" r="3" fill="#1E293B" />
              <circle cx="13" cy="19" r="1" fill="white" />
              <circle cx="25" cy="19" r="1" fill="white" />
            </g>

            {/* Rosy blush cheeks */}
            <circle cx="10" cy="25" r="2" fill="#FDA4AF" opacity="0.8" />
            <circle cx="26" cy="25" r="2" fill="#FDA4AF" opacity="0.8" />

            {/* Smile Mouth */}
            <path d="M 15 25 Q 18 29 21 25" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}

// 2. REUSABLE EMPTY STATE (EcoBuddy planting a sprout, friendly copy)
interface EmptyStateProps {
  title: string;
  description: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export function EmptyState({ title, description, ctaText, onCtaClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-text-primary space-y-4 max-w-md mx-auto py-12 animate-in fade-in duration-300">
      {/* Plant sprout SVG illustration */}
      <div className="relative w-36 h-36 flex items-center justify-center select-none bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full border border-emerald-500/10 shrink-0">
        <svg viewBox="0 0 100 100" className="w-28 h-28">
          {/* Cloud raining soft particles */}
          <g className="animate-float" style={{ animationDelay: '0.5s' }}>
            <path d="M 35 25 Q 40 20 46 23 Q 54 18 60 25 Q 66 25 64 32 L 32 32 Z" fill="#93C5FD" opacity="0.6" />
            <line x1="42" y1="36" x2="40" y2="44" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3" />
            <line x1="50" y1="38" x2="48" y2="46" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3" />
            <line x1="58" y1="36" x2="56" y2="44" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3" />
          </g>

          {/* Dirt Mound */}
          <path d="M 20 85 Q 50 72 80 85 L 80 92 L 20 92 Z" fill="#78350F" opacity="0.8" />

          {/* Growing Plant Sprout */}
          <g className="animate-sway origin-[50px_80px]">
            {/* Trunk Stem */}
            <path d="M 50 80 Q 48 55 52 40" fill="none" stroke="#059669" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 52 40 Q 38 32 44 26" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
            <path d="M 52 40 Q 66 34 60 28" fill="none" stroke="#34D399" strokeWidth="3" strokeLinecap="round" />

            {/* Leaves */}
            <path d="M 44 26 C 40 22 47 18 50 24 T 44 26 Z" fill="#10B981" />
            <path d="M 60 28 C 64 24 57 20 54 26 T 60 28 Z" fill="#34D399" />
          </g>

          {/* Watering can or sparkly elements */}
          <circle cx="76" cy="48" r="1.5" fill="#FBBF24" className="animate-pulse" />
          <polygon points="22,46 25,43 28,46 25,49" fill="#F59E0B" className="animate-pulse" style={{ animationDelay: '1s' }} />
        </svg>
      </div>

      <div className="space-y-1">
        <h4 className="text-base font-extrabold text-text-primary">{title}</h4>
        <p className="text-xs text-text-secondary leading-relaxed font-semibold">{description}</p>
      </div>

      {ctaText && onCtaClick && (
        <button
          onClick={onCtaClick}
          className="bg-brand-primary hover:opacity-95 text-white text-xs font-black px-5 py-2.5 rounded-xl transition duration-150 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer max-w-fit mx-auto"
        >
          <span>{ctaText}</span>
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// 3. GROWING TREE IMPACT VISUALIZER (Visual representation of saving trees)
interface GrowingTreeProps {
  treesCount: number;
  co2Saved: number;
}

export function GrowingTreeIllustration({ treesCount, co2Saved }: GrowingTreeProps) {
  // Cap tree presentation at 4 max visually to fit grid and preserve style
  const treesToShow = Math.max(1, Math.min(4, Math.ceil(treesCount)));

  return (
    <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-border-custom p-5 rounded-3xl space-y-4 shadow-xs relative overflow-hidden">
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md text-[9px] font-black text-emerald-800 dark:text-emerald-300">
        <TreePine className="w-3 h-3" /> Live Impact
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest block">Environment Growth Index</span>
        <h4 className="text-sm font-extrabold text-text-primary">Atmospheric Trees Planting Impact</h4>
        <p className="text-xs text-text-secondary leading-normal font-medium">
          By locking lighter footprints you have saved <span className="font-extrabold text-brand-primary">{co2Saved.toFixed(1)} kg CO₂</span>. This mirrors the capacity of <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{treesCount.toFixed(2)} active trees</span>!
        </p>
      </div>

      {/* Grid of growing animated SVG trees */}
      <div className="flex flex-wrap items-end justify-center gap-6 py-3.5 bg-bg-base/30 rounded-2xl border border-border-custom/50">
        {[...Array(treesToShow)].map((_, i) => {
          let stageDelay = `${i * 0.4}s`;
          return (
            <div key={i} className="flex flex-col items-center gap-1 group animate-in slide-in-from-bottom duration-500" style={{ animationDelay: stageDelay }}>
              <svg viewBox="0 0 60 80" className="w-14 h-18 cursor-move transition-transform duration-300 hover:scale-115">
                {/* Rolling Ground shadow */}
                <ellipse cx="30" cy="74" rx="14" ry="4" fill="black" opacity="0.08" />

                {/* Tree stem with swaying animation */}
                <g className="animate-sway origin-[30px_74px]" style={{ animationDelay: `${i * 0.75}s` }}>
                  {/* Trunk */}
                  <path d="M 28 74 L 28 50 Q 30 40 32 46 L 32 74 Z" fill="#78350F" />
                  
                  {/* Branch branches */}
                  <path d="M 28 54 Q 22 44 24 49" fill="none" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 32 58 Q 38 48 35 52" fill="none" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />

                  {/* Leaf clusters with interactive colors */}
                  <circle cx="30" cy="40" r="14" fill="#10B981" opacity="0.9" />
                  <circle cx="22" cy="38" r="10" fill="#047857" opacity="0.85" />
                  <circle cx="38" cy="42" r="10" fill="#059669" opacity="0.85" />
                  <circle cx="30" cy="28" r="11" fill="#34D399" opacity="0.95" />

                  {/* Tiny glowing flower or fruit on tree */}
                  <circle cx="30" cy="38" r="2.5" fill="#EF4444" className="animate-pulse" />
                  <circle cx="22" cy="40" r="2" fill="#FBBF24" className="animate-pulse" style={{ animationDelay: "1.2s" }} />
                </g>
              </svg>
              <span className="text-[8.5px] font-black text-text-secondary uppercase">Tree #{i + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 4. ACHIEVEMENT BADGE COMPONENT (CONFETTI / CELEBRATION EFFECT)
export interface BadgeItem {
  id: string;
  name: string;
  desc: string;
  requirement: string;
  unlocked: boolean;
  theme: "emerald" | "blue" | "amber" | "purple";
}

export function MilestoneBadge({ badge, onShowJoy }: { badge: BadgeItem; onShowJoy?: () => void; key?: any }) {
  // Styles based on badge theme
  let colorMap = {
    emerald: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20 shadow-emerald-500/5",
    blue: "bg-blue-500/10 text-blue-800 dark:text-blue-400 border-blue-500/20 shadow-blue-500/5",
    amber: "bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/20 shadow-amber-500/5",
    purple: "bg-purple-500/10 text-purple-800 dark:text-purple-400 border-purple-500/20 shadow-purple-500/5",
  };

  return (
    <div 
      onClick={() => {
        if (badge.unlocked && onShowJoy) {
          onShowJoy();
        }
      }}
      className={`relative p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all duration-300 ${
        badge.unlocked 
          ? `${colorMap[badge.theme]} hover:scale-103 cursor-pointer bg-bg-surface` 
          : "bg-bg-surface/30 opacity-40 border-border-custom saturate-50 cursor-not-allowed"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Animated Badge circle icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-current bg-current/5 relative overflow-hidden ${
          badge.unlocked && badge.id === "streak" ? "animate-celebrate" : ""
        }`}>
          {/* Confetti sparkle overlay on unlocked badges */}
          {badge.unlocked && (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
          )}
          <Award className="w-5 h-5 relative z-1" />
        </div>

        <div>
          <h5 className="text-[11px] font-black tracking-tight">{badge.name}</h5>
          <p className="text-[10px] text-text-secondary max-w-[210px] leading-snug font-medium">{badge.desc}</p>
        </div>
      </div>

      <div className="shrink-0">
        {badge.unlocked ? (
          <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
            <Check className="w-2.5 h-2.5" /> Unlocked
          </span>
        ) : (
          <span className="text-[8.5px] font-bold text-text-secondary uppercase border border-border-custom px-1.5 py-0.5 rounded-full">
            Locked
          </span>
        )}
      </div>
    </div>
  );
}

// 5. ONBOARDING UNIQUE GRAPHICS
export function OnboardingWelcomeIllustration() {
  return (
    <div className="w-full max-w-[200px] aspect-square flex items-center justify-center select-none bg-emerald-500/5 rounded-full border border-emerald-500/10 pointer-events-none">
      <svg viewBox="0 0 100 100" className="w-40 h-40">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#10B981" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
        <circle cx="50" cy="50" r="32" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="6 3" className="animate-spin-slow" opacity="0.3" />
        
        {/* Growing sprout inside the bulb */}
        <g className="animate-float origin-[50px_50px]">
          <circle cx="50" cy="45" r="16" fill="#14B8A6" opacity="0.1" />
          <path d="M 50 65 L 50 48 Q 47 40 50 42" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
          <path d="M 50 48 C 45 44 48 38 52 42 Z" fill="#34D399" />
          <path d="M 50 56 C 55 52 52 46 48 50 Z" fill="#6EE7B7" />
        </g>
      </svg>
    </div>
  );
}

export function OnboardingCommuteIllustration() {
  return (
    <div className="w-full max-w-[200px] aspect-square flex items-center justify-center select-none bg-teal-500/5 rounded-full border border-teal-500/10 pointer-events-none">
      <svg viewBox="0 0 100 100" className="w-40 h-40">
        {/* Road and hills */}
        <path d="M 12 75 L 88 75" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 22 75 Q 38 65 54 75 Q 70 65 82 75" fill="none" stroke="#10B981" strokeWidth="1.5" strokeDasharray="2 4" opacity="0.5" />

        {/* Bicycle rolling */}
        <g className="animate-float origin-[50px_60px]">
          {/* Wheel 1 */}
          <circle cx="36" cy="72" r="6" fill="none" stroke="#475569" strokeWidth="1.5" />
          <circle cx="36" cy="72" r="5" fill="none" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" className="animate-spin-slow" />
          
          {/* Wheel 2 */}
          <circle cx="64" cy="72" r="6" fill="none" stroke="#475569" strokeWidth="1.5" />
          <circle cx="64" cy="72" r="5" fill="none" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" className="animate-spin-slow" />

          {/* Bike Frame */}
          <polygon points="36,72 48,72 56,60 42,60" fill="none" stroke="#0D9488" strokeWidth="1.5" strokeLinejoin="round" />
          <line x1="48" y1="72" x2="42" y2="60" stroke="#0D9488" strokeWidth="1.5" />
          <line x1="64" y1="72" x2="56" y2="60" stroke="#0D9488" strokeWidth="1.5" />

          {/* EcoBuddy riding on bike saddle */}
          <circle cx="49" cy="46" r="10" fill="#14B8A6" />
          <ellipse cx="49" cy="48" rx="8" ry="4" fill="#F1F5F9" />
          <circle cx="46" cy="48" r="1" fill="#1E293B" />
          <circle cx="52" cy="48" r="1" fill="#1E293B" />
          {/* Helmet leaf */}
          <path d="M 49 36 Q 52 30 55 32" fill="none" stroke="#22C55E" strokeWidth="1.5" />
          <path d="M 55 32 C 53 29 48 31 50 34 Z" fill="#4ADE80" />
        </g>
      </svg>
    </div>
  );
}

export function OnboardingFoodIllustration() {
  return (
    <div className="w-full max-w-[200px] aspect-square flex items-center justify-center select-none bg-emerald-500/5 rounded-full border border-emerald-500/10 pointer-events-none">
      <svg viewBox="0 0 100 100" className="w-40 h-40">
        {/* Table line */}
        <line x1="12" y1="75" x2="88" y2="75" stroke="#D1D5DB" strokeWidth="2" />

        {/* Bowl of fresh salad assembly */}
        <g className="animate-float origin-[50px_62px]">
          {/* Bowl */}
          <path d="M 28 58 L 72 58 Q 66 75 50 75 Q 34 75 28 58 Z" fill="#10B981" opacity="0.85" />
          <path d="M 25 58 L 75 58" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" />

          {/* Lettuce, organic tomatoes, vegan foods */}
          {/* Lettuce */}
          <circle cx="40" cy="54" r="8" fill="#34D399" />
          <circle cx="58" cy="53" r="7" fill="#6EE7B7" />
          <circle cx="48" cy="50" r="9" fill="#059669" />

          {/* Tomato slice */}
          <circle cx="36" cy="56" r="4.5" fill="#EF4444" />
          <circle cx="64" cy="56" r="4" fill="#F59E0B" />

          {/* Leaves Sprouting */}
          <path d="M 50 42 Q 53 34 56 36" fill="none" stroke="#22C55E" strokeWidth="1.5" />
          <path d="M 56 36 C 54 33 49 35 51 38 Z" fill="#4ADE80" />
        </g>
      </svg>
    </div>
  );
}

export function OnboardingEnergyIllustration() {
  return (
    <div className="w-full max-w-[200px] aspect-square flex items-center justify-center select-none bg-amber-500/5 rounded-full border border-amber-500/10 pointer-events-none">
      <svg viewBox="0 0 100 100" className="w-40 h-40">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 4" opacity="0.3" />

        {/* Wind turbine spinning or glowing plug */}
        <g className="origin-[50px_50px] animate-float">
          {/* Turbine Pole */}
          <polygon points="48,82 52,82 51,50 49,50" fill="#94A3B8" />

          {/* Spinning Blades */}
          <g className="animate-spin-slow origin-[50px_50px]">
            <circle cx="50" cy="50" r="4" fill="#64748B" />
            {/* Blade 1 */}
            <path d="M 50 50 Q 52 30 50 20 Q 48 30 50 50 Z" fill="#E2E8F0" />
            {/* Blade 2 */}
            <path d="M 50 50 Q 68 60 76 65 Q 64 56 50 50 Z" fill="#CBD5E1" />
            {/* Blade 3 */}
            <path d="M 50 50 Q 32 60 24 65 Q 36 56 50 50 Z" fill="#E2E8F0" />
          </g>

          {/* Small glowing charge sparks */}
          <circle cx="28" cy="28" r="1.5" fill="#F59E0B" className="animate-pulse" />
          <circle cx="72" cy="32" r="2.5" fill="#EF4444" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
        </g>
      </svg>
    </div>
  );
}

// 6. BRANDED LOADING STATE
export function BrandedLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-6 gap-4 select-none">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Soft rotating leaf circle */}
        <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin-slow" />
        <div className="absolute inset-2 border-r-2 border-teal-400 rounded-full animate-spin" style={{ animationDuration: '1.2s' }} />

        {/* Floating Sprout in the center */}
        <svg viewBox="0 0 60 60" className="w-10 h-10 relative animate-float">
          <g transform="translate(10, 10)">
            <path d="M 20 28 Q 22 12 28 8" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 28 8 C 24 3 18 7 21 12 Z" fill="#34D399" />
            <path d="M 28 8 C 33 5 35 11 30 13 Z" fill="#10B981" />
            
            {/* Small face */}
            <circle cx="15" cy="30" r="11" fill="#10B981" />
            <circle cx="11" cy="28" r="1.5" fill="white" />
            <circle cx="19" cy="28" r="1.5" fill="white" />
            <path d="M 13 32 Q 15 34 17 32" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      <div className="space-y-1 text-center">
        <p className="text-xs font-black text-text-primary uppercase tracking-widest animate-pulse">Syncing EcoBuddy...</p>
        <span className="text-[10px] text-text-secondary">Securing CarbonMate cloud vault</span>
      </div>
    </div>
  );
}
