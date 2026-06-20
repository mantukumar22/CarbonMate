import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DailyEntry } from "../../types";
import ImpactCard from "../../components/ImpactCard";
import EcoBuddy from "../../components/EcoBuddy";
import { getUserDisplayName } from "../../lib/getUserDisplayName";
import { 
  Car, 
  Utensils, 
  Zap, 
  Trash2, 
  Award, 
  TrendingDown, 
  Sun, 
  RefreshCw, 
  Star, 
  ArrowRight, 
  Sparkles, 
  CheckCircle,
  HelpCircle,
  TrendingUp
} from "lucide-react";
import { 
  HeroIllustration, 
  GrowingTreeIllustration, 
  MilestoneBadge, 
  EmptyState,
  BadgeItem
} from "../../components/GraphicAssets";
import { COMMUTE_FACTORS, DIET_FACTORS } from "../../lib/emissionFactors";

interface DashboardPageProps {
  entries: DailyEntry[];
  onSelectEntry: (entry: DailyEntry) => void;
  selectedEntry: DailyEntry | null;
  onNavigateToTab: (tab: "dashboard" | "log" | "insights" | "onboarding") => void;
  user?: { displayName?: string | null; email?: string | null } | null;
}

export default function DashboardPage({
  entries,
  onSelectEntry,
  selectedEntry,
  onNavigateToTab,
  user,
}: DashboardPageProps) {
  const displayName = getUserDisplayName(user);
  // Aggregate overall carbon metrics
  const totalCo2 = entries.reduce((acc, curr) => acc + curr.estimated_co2_kg, 0);
  const averageCo2 = entries.length ? (totalCo2 / entries.length).toFixed(2) : "0.00";

  // Calculate distinct category contribution
  let totalTransportCo2 = 0;
  let totalDietCo2 = 0;
  let totalEnergyCo2 = 0;
  let totalRecycledItems = 0;
  let totalTrashRefused = 0;

  entries.forEach((e) => {
    e.transport.forEach((t) => {
      const mode = (t.mode || "").toLowerCase();
      const modeFactor = COMMUTE_FACTORS[mode] !== undefined ? COMMUTE_FACTORS[mode] : 0.0;
      totalTransportCo2 += (t.distance_km * modeFactor);
    });
    e.food.forEach((f) => {
      const typeKey = (f.type || 'vegetarian').toLowerCase();
      const dietFactor = DIET_FACTORS[typeKey] !== undefined ? DIET_FACTORS[typeKey] : 1.5;
      totalDietCo2 += dietFactor;
    });
    totalEnergyCo2 += (e.energy.electricity_kwh * 0.82) + (e.energy.ac_hours * 1.23);
    if (e.waste.recycled) {
      totalRecycledItems += e.waste.plastic_items;
    } else {
      totalTrashRefused += e.waste.plastic_items;
    }
  });

  // Calculate CO2 Saved & Trees Equivalent Saved
  // Assuming average daily emissions for standard unmonitored households are roughly 18 kg CO2
  const standardBaselineCo2 = entries.length * 18.0;
  const totalSavedCo2 = Math.max(0, standardBaselineCo2 - totalCo2);
  const treesSavedEquivalent = totalSavedCo2 / 21; // 1 tree absorbs ~21 kg CO2 per year

  const activeEntry = selectedEntry || entries[0] || null;

  // Track state for badge pop-ups or click triggers
  const [badgeSuccessMessage, setBadgeSuccessMessage] = useState<string | null>(null);
  const [selectedBadgeDetail, setSelectedBadgeDetail] = useState<BadgeItem | null>(null);

  // Core gamification Achievements/Badges
  const badges: BadgeItem[] = [
    {
      id: "first-log",
      name: "First Green Step",
      desc: "You saved your first green choice today!",
      requirement: "Log your first day",
      unlocked: entries.length >= 1,
      theme: "emerald" as const,
    },
    {
      id: "streak",
      name: "3 Days Green Streak",
      desc: "You logged your pollution for 3 days!",
      requirement: "Log daily choices 3 times",
      unlocked: entries.length >= 3,
      theme: "purple" as const,
    },
    {
      id: "meals",
      name: "No-Meat Hero",
      desc: "You chose healthy vegetarian or vegan food!",
      requirement: "Eat a vegetarian meal",
      unlocked: entries.some((e) => e.food.some((f) => f.type === "vegetarian" || f.type === "vegan")),
      theme: "blue" as const,
    },
    {
      id: "clean-transit",
      name: "Eco-Traveler",
      desc: "You walked, cycled, or took a shared bus!",
      requirement: "Walk, cycle, or take a bus",
      unlocked: entries.some((e) => e.transport.some((t) => t.mode === "bike" || t.mode === "walk" || t.mode === "bus")),
      theme: "amber" as const,
    },
  ];

  const handleShowBadgeJoy = (badgeName: string) => {
    setBadgeSuccessMessage(`🌟 Great job! You unlocked the "${badgeName}" badge! Keep it up. 👍`);
    setTimeout(() => {
      setBadgeSuccessMessage(null);
    }, 4500);
  };

  return (
    <div className="space-y-6 relative" id="dashboard-page-container">
      
      {/* Absolute decorative gradient circles - theme-aware low opacity */}
      <div className="absolute top-0 left-12 w-72 h-72 rounded-full bg-emerald-400/5 dark:bg-emerald-500/5 blur-[50px] pointer-events-none -z-10 animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-blue-400/5 dark:bg-blue-500/5 blur-[80px] pointer-events-none -z-10 animate-float-slow" />

      {/* Hero Header Presentation card */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent -z-1" />
        
        <div className="space-y-2 max-w-lg relative z-1">
          <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full inline-block">
            EcoBuddy Friend
          </span>
          <h2 className="text-xl md:text-2xl font-black font-sans leading-tight">
            Namaste, {displayName}! 👋
          </h2>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-medium">
            Your total pollution score is <strong className="text-emerald-300 font-extrabold">{totalCo2.toFixed(2)} kg pollution (CO2)</strong>. Let's take small steps to protect our Earth.
          </p>
          
          <div className="pt-2">
            <button
              onClick={() => onNavigateToTab("log")}
              className="bg-emerald-500 hover:bg-emerald-400 hover:scale-103 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg"
            >
              <span>Log Activity ➕</span>
            </button>
          </div>
        </div>

        {/* Hero Interactive SVG Illustration showing EcoBuddy World */}
        <div className="flex justify-center md:justify-end shrink-0 relative z-1">
          <HeroIllustration />
        </div>
      </div>

      {badgeSuccessMessage && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-900 text-emerald-300 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in duration-300 shadow-md">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
          <span>{badgeSuccessMessage}</span>
        </div>
      )}

      {/* Interactive gamified bento grid of category and achievements */}
      {entries.length === 0 ? (
        <div className="border border-border-custom bg-bg-surface/50 rounded-[32px] p-6 shadow-xs">
          <EmptyState 
            title="Clean Slate! Let's start seeds today 🌱"
            description="You haven't logged anything today. Chat with EcoBuddy or fill the form to start!"
            ctaText="Log Day Now"
            onCtaClick={() => onNavigateToTab("log")}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Bento Column 1: Core metric lists */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest px-1">
                Core Footprint Categories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <ImpactCard
                  title="🚗 Travel"
                  value={`${totalTransportCo2.toFixed(2)}`}
                  unit="kg pollution (CO2)"
                  icon={<Car className="w-4 h-4" />}
                  color="emerald"
                  co2Contribution={totalTransportCo2}
                  description="Based on car, bus, and flight travel."
                />
                <ImpactCard
                  title="🥗 Your Food"
                  value={`${totalDietCo2.toFixed(2)}`}
                  unit="kg pollution (CO2)"
                  icon={<Utensils className="w-4 h-4" />}
                  color="blue"
                  co2Contribution={totalDietCo2}
                  description="Meat and dairy increase pollution."
                />
                <ImpactCard
                  title="⚡ Home Electricity"
                  value={`${totalEnergyCo2.toFixed(2)}`}
                  unit="kg pollution (CO2)"
                  icon={<Zap className="w-4 h-4" />}
                  color="amber"
                  co2Contribution={totalEnergyCo2}
                  description="Based on your light bulb and AC hours."
                />
                <ImpactCard
                  title="🗑️ Plastic Waste"
                  value={parseFloat((totalRecycledItems + totalTrashRefused).toFixed(2))}
                  unit="Items Logged"
                  icon={<Trash2 className="w-4 h-4" />}
                  color="rose"
                  co2Contribution={parseFloat(((totalTrashRefused * 0.1) + (totalRecycledItems * 0.02)).toFixed(2))}
                  description={`${totalRecycledItems} items recycled.`}
                />
              </div>
            </div>

            {/* UPGRADED IMPACT VISUALIZER - Growing Trees section */}
            <GrowingTreeIllustration 
              treesCount={treesSavedEquivalent} 
              co2Saved={totalSavedCo2} 
            />

            {/* Achievements milestone subsection */}
            <div className="space-y-3" id="achievements-section-container">
              <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest px-1 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-brand-primary" /> Achievements & Milestones
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {badges.map((badge) => (
                  <MilestoneBadge 
                    key={badge.id} 
                    badge={badge} 
                    onShowJoy={() => {
                      if (badge.unlocked) {
                        handleShowBadgeJoy(badge.name);
                      }
                      setSelectedBadgeDetail(badge);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Achievement Badge Detail Modal */}
            <AnimatePresence>
              {selectedBadgeDetail && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 15 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="bg-bg-surface border border-border-custom max-w-sm w-full rounded-3xl p-6 shadow-2xl relative space-y-5 text-center overflow-hidden"
                    id="badge-detail-modal"
                  >
                    {/* Background celebratory radial gradient */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none -z-10" />

                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                        selectedBadgeDetail.unlocked ? "text-emerald-700 dark:text-emerald-300 bg-emerald-500/15" : "text-amber-700 dark:text-amber-300 bg-amber-500/15"
                      }`}>
                        {selectedBadgeDetail.unlocked ? "🏆 Completed" : "🔒 In Progress"}
                      </span>
                      <button 
                        onClick={() => setSelectedBadgeDetail(null)}
                        className="p-1.5 px-3 bg-bg-base hover:bg-slate-800 border border-border-custom rounded-xl text-xs font-black text-text-secondary hover:text-text-primary cursor-pointer transition"
                      >
                        Close
                      </button>
                    </div>

                    {/* Scaled badge icon */}
                    <div className="flex justify-center py-2">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border border-current bg-current/5 relative overflow-hidden ${
                        selectedBadgeDetail.unlocked ? "text-brand-primary" : "text-text-secondary opacity-40 grayscale"
                      }`}>
                        <Award className="w-10 h-10 relative z-1" />
                      </div>
                    </div>

                    {/* Details text */}
                    <div className="space-y-1.5">
                      <h4 className="text-base font-black text-text-primary">
                        {selectedBadgeDetail.name}
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                        {selectedBadgeDetail.desc}
                      </p>
                    </div>

                    <div className="bg-bg-base/80 p-3.5 rounded-2xl border border-border-custom text-left space-y-1">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Unlock criteria:</p>
                      <p className="text-xs font-black text-text-primary">{selectedBadgeDetail.requirement}</p>
                    </div>

                    <div className="text-[10px] font-black text-text-secondary flex justify-between items-center px-1">
                      <span>Status:</span>
                      <span className="text-brand-primary">
                        {selectedBadgeDetail.unlocked ? "Unlocked (Active Session) 🌿" : "Earn this by changing daily habits!"}
                      </span>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <div className="bg-bg-surface/50 border border-border-custom rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary text-sm shrink-0">🌻</div>
                <div>
                  <p className="text-xs font-bold text-text-primary">How is pollution calculated?</p>
                  <p className="text-[10px] text-text-secondary leading-normal">Learn how we count your daily pollution scores.</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab("insights")}
                className="text-xs text-brand-primary bg-bg-surface hover:bg-bg-base hover:scale-103 border border-border-custom font-black px-4 py-2 rounded-xl transition cursor-pointer shrink-0"
              >
                See Calculation Guides →
              </button>
            </div>
          </div>

          {/* Right side animated SVG Buddy state feedback */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest px-1">
                EcoBuddy Chat
              </h3>
              <EcoBuddy co2Score={parseFloat(averageCo2)} />
            </div>

            {/* Prompt Selected Log Panel */}
            {activeEntry ? (
              <div className="bg-bg-surface/60 p-5 rounded-[24px] border border-border-custom shadow-md space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-dashed border-border-custom">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-wide flex items-center gap-1">
                    📅 Saved Day Details
                  </span>
                  <span className="text-text-secondary font-black text-xs">{activeEntry.date}</span>
                </div>
                <p className="text-xs text-text-secondary italic leading-relaxed">
                  "{activeEntry.raw_text}"
                </p>
                <div className="space-y-1.5 bg-brand-primary/5 p-3.5 rounded-xl border border-brand-primary/10">
                  <span className="text-[9px] font-black uppercase text-brand-primary block">EcoBuddy Remarks</span>
                  <p className="text-[11px] text-text-primary leading-relaxed font-semibold">
                    {activeEntry.notes}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-bg-surface/40 border border-border-custom text-text-secondary rounded-[24px] p-6 text-center text-xs italic">
                Log a day to see EcoBuddy's comments!
              </div>
            )}
          </div>

        </div>
      )}

      {/* History log preview timeline snippet */}
      <div className="bg-bg-surface/45 backdrop-blur-md p-5 rounded-3xl border border-border-custom shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            Recent Saved Days
          </h3>
          <button
            onClick={() => onNavigateToTab("log")}
            className="text-xs text-brand-primary hover:opacity-90 font-extrabold flex items-center gap-1 cursor-pointer"
          >
            See All Days ({entries.length}) <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {entries.slice(0, 3).map((entry) => (
            <div
              key={entry.id}
              onClick={() => onSelectEntry(entry)}
              className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                activeEntry?.id === entry.id
                  ? "bg-green-500 text-white border-green-500 dark:bg-green-500 dark:text-white dark:border-green-400 font-bold shadow-lg shadow-green-500/20"
                  : "bg-bg-surface/40 border-border-custom hover:bg-green-50/50 dark:hover:bg-green-950/20 hover:border-green-400/35 text-text-primary"
              }`}
            >
              <div className="overflow-hidden pr-3">
                <span className={`text-[9px] font-bold block mb-0.5 ${
                  activeEntry?.id === entry.id ? "text-green-100 dark:text-green-200" : "text-text-secondary"
                }`}>{entry.date}</span>
                <p className={`text-xs font-semibold truncate ${
                  activeEntry?.id === entry.id ? "text-white" : "text-text-primary"
                }`}>
                  {entry.raw_text}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span className={`text-xs font-black ${
                  activeEntry?.id === entry.id ? "text-white" : "text-text-primary"
                }`}>
                  {entry.estimated_co2_kg.toFixed(2)} kg pollution (CO2)
                </span>
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <div className="py-4">
              <EmptyState 
                title="Your History is Clear 🌿"
                description="Log your daily choices to save them here."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
