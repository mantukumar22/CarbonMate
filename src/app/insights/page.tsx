import React from "react";
import Image from "../../components/Image";
import { DailyEntry } from "../../types";
import { EMISSION_FACTORS, COMMUTE_FACTORS, DIET_FACTORS } from "../../lib/emissionFactors";
import { Sparkles, Award, TrendingDown, RefreshCw, BarChart2, BookOpen } from "lucide-react";

interface InsightsPageProps {
  entries: DailyEntry[];
  tips: string[];
  isGeneratingTips: boolean;
  onRefreshTips: () => void;
}

export default function InsightsPage({
  entries,
  tips,
  isGeneratingTips,
  onRefreshTips,
}: InsightsPageProps) {
  // Aggregate data to find highest impact category
  let commuteSum = 0;
  let dietSum = 0;
  let energySum = 0;

  entries.forEach((e) => {
    e.transport.forEach((t) => {
      const mode = (t.mode || "").toLowerCase();
      const f = COMMUTE_FACTORS[mode] !== undefined ? COMMUTE_FACTORS[mode] : 0.0;
      commuteSum += t.distance_km * f;
    });
    e.food.forEach((foo) => {
      const typeKey = (foo.type || 'vegetarian').toLowerCase();
      const f = DIET_FACTORS[typeKey] !== undefined ? DIET_FACTORS[typeKey] : 1.5;
      dietSum += f;
    });
    energySum += (e.energy.electricity_kwh * 0.82) + (e.energy.ac_hours * 1.23);
  });

  const total = commuteSum + dietSum + energySum;

  let highestCategory = "Home Electricity";
  let highestVal = energySum;
  if (commuteSum > highestVal) {
    highestCategory = "Travel";
    highestVal = commuteSum;
  }
  if (dietSum > highestVal) {
    highestCategory = "Your Food";
    highestVal = dietSum;
  }

  return (
    <div className="space-y-6" id="insights-page-container">
      {/* Overview */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden" id="insights-personalized-container">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 -z-1" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-5 shrink-0">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Award className="w-5 h-5" />
              </span>
              Your Green Coaching
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Here is how we can reduce your daily pollution scores.
            </p>
          </div>

          <button
            onClick={onRefreshTips}
            disabled={isGeneratingTips}
            className="text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/10 px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            {isGeneratingTips ? "Evaluating..." : "Refresh Tips 🔄"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
              Today's Green Tips
            </h4>
            <div className="space-y-4">
              {tips.slice(0, 3).map((tip, index) => (
                <div key={index} className="flex gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/15 transition-all">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    0{index + 1}
                  </div>
                  <p className="text-slate-200 text-xs md:text-sm leading-relaxed font-semibold">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick analysis summary bar chart list */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Pollution Source Analysis
              </span>
              <p className="text-xl font-extrabold text-white mt-1 leading-tight">
                {highestCategory}
              </p>
              <p className="text-[10px] text-slate-400 leading-normal mt-1">
                This is your highest pollution source. Let's try to reduce it.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div>
                <div className="flex justify-between text-[10px] text-slate-300 font-bold mb-1">
                  <span>🚗 Travel ({((commuteSum / (total || 1)) * 100).toFixed(0)}%)</span>
                  <span>{commuteSum.toFixed(2)} kg</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${(commuteSum / (total || 1)) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-300 font-bold mb-1">
                  <span>🥗 Food ({((dietSum / (total || 1)) * 100).toFixed(0)}%)</span>
                  <span>{dietSum.toFixed(2)} kg</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${(dietSum / (total || 1)) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-300 font-bold mb-1">
                  <span>⚡ Electricity ({((energySum / (total || 1)) * 100).toFixed(0)}%)</span>
                  <span>{energySum.toFixed(2)} kg</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${(energySum / (total || 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sustainable Goal forest illustration card */}
      <div className="bg-bg-surface/45 backdrop-blur-md border border-border-custom rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-center gap-6 overflow-hidden shadow-sm hover:shadow-md transition duration-300">
        <div className="w-full md:w-1/3 rounded-2xl overflow-hidden aspect-video md:aspect-[4/3] shrink-0 border border-border-custom">
          <Image
            src="/illustrations/forest.png"
            alt="Pristine Forest Ecosystem"
            className="w-full h-full object-cover"
            width={300}
            height={200}
          />
        </div>
        <div className="flex-1 space-y-2.5">
          <span className="text-[9px] font-black uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full inline-block">
            Our Shared Goal
          </span>
          <h4 className="text-base font-extrabold text-text-primary">How Trees Help Us</h4>
          <p className="text-xs text-text-secondary leading-relaxed font-semibold">
            Every good action you take reduces pollution. Saving energy and walking more is like planting 3 fresh trees! Let's protect our earth together!
          </p>
        </div>
      </div>

      {/* Baseline calculation multipliers index */}
      <div className="bg-bg-surface/45 backdrop-blur-md p-5 rounded-3xl border border-border-custom shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border-custom">
          <BookOpen className="w-5 h-5 text-brand-primary" />
          <div>
            <h3 className="text-sm font-bold text-text-primary">How We Calculate Pollution Scores</h3>
            <p className="text-[10px] text-text-secondary">Standard rules used to count your daily pollution score.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {EMISSION_FACTORS.map((fact, idx) => (
            <div key={idx} className="bg-bg-surface/50 border border-border-custom hover:bg-bg-surface p-3 rounded-2xl flex items-center justify-between font-semibold">
              <div className="flex items-center gap-2.5">
                <span className="text-lg bg-brand-primary/10 w-8 h-8 rounded-xl flex items-center justify-center">{fact.icon}</span>
                <span className="text-xs text-text-primary">{fact.label}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-brand-primary font-black">{fact.factor} kg</span>
                <span className="text-[9px] text-text-secondary block font-normal capitalize">per {fact.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
