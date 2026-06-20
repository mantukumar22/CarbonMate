import React, { useState, useEffect } from "react";
import { Sparkles, HelpCircle, Edit } from "lucide-react";

interface GoalProgressProps {
  todayCo2: number;
}

export function GoalProgress({ todayCo2 }: GoalProgressProps): React.JSX.Element {
  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    const saved = localStorage.getItem("carbonmate_target_goal_co2");
    return saved ? parseFloat(saved) : 12.0; // 12kg standard green target
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    localStorage.setItem("carbonmate_target_goal_co2", dailyGoal.toString());
  }, [dailyGoal]);

  const progressPercentage = Math.min(100, (todayCo2 / dailyGoal) * 100);
  const isOverGoal = todayCo2 > dailyGoal;

  const getCoachingText = () => {
    if (todayCo2 === 0) return "You haven't logged any pollution today. Go ahead and log your choices! 🌱";
    if (progressPercentage < 50) return "Wonderful! Today's carbon score is well within target. Excellent green decisions! 🌸";
    if (!isOverGoal) return "On track! You are under your daily target. Keep it steady! 👍";
    return "Higher than target. Try choosing vegetarian food or walking to set a cleaner pace! 🚶‍♂️🌿";
  };

  return (
    <div className="bg-[#1B2119] border border-[#2C342B] p-5 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <div>
            <h4 className="text-sm font-extrabold text-[#E8F0E3]">Your Green Goal</h4>
            <p className="text-[10px] text-[#A8B8AA] font-bold uppercase tracking-wider">Dynamic carbon budget</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 hover:bg-emerald-900/30 px-2.5 py-1.5 rounded-xl cursor-pointer flex items-center gap-1 transition"
        >
          <Edit className="w-3 h-3" />
          <span>{isEditing ? "Close" : "Adjust Target"}</span>
        </button>
      </div>

      {isEditing && (
        <div className="p-3 bg-[#121714] border border-[#2C342B] rounded-2xl space-y-2 animate-in fade-in duration-200">
          <label htmlFor="goal-slider" className="text-xs text-[#A8B8AA] font-extrabold flex justify-between">
            <span>Set target limit:</span>
            <span className="text-emerald-400">{dailyGoal} kg CO2/day</span>
          </label>
          <input
            id="goal-slider"
            type="range"
            min="6.0"
            max="25.0"
            step="0.5"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[#2C342B] accent-emerald-500 rounded-lg cursor-pointer"
          />
          <span className="block text-[9px] text-[#6B7F6A] font-bold">Standard Indian household average is ~18.0 kg CO2/day. Aim for 12.0 or lower!</span>
        </div>
      )}

      {/* Goal gauge progress display */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-end">
          <span className="text-xs text-[#A8B8AA] font-bold">Today's Total:</span>
          <div className="text-right">
            <span className={`text-sm font-black ${isOverGoal ? "text-rose-400" : "text-emerald-400"}`}>
              {todayCo2.toFixed(2)}
            </span>
            <span className="text-[10px] text-[#6B7F6A] font-extrabold"> / {dailyGoal.toFixed(1)} kg CO2</span>
          </div>
        </div>

        {/* Progress bar scale */}
        <div className="w-full h-3 bg-[#121714] border border-[#2C342B] rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverGoal 
                ? "bg-rose-500 shadow-sm shadow-rose-950" 
                : progressPercentage > 85 
                ? "bg-amber-500" 
                : "bg-emerald-500 shadow-sm shadow-emerald-950"
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Dynamic status alert tags */}
        <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wide">
          <span className="text-[#6B7F6A]">0.0 kg</span>
          <span className={isOverGoal ? "text-rose-400" : "text-emerald-400 animate-pulse"}>
            {isOverGoal ? "⚠️ Budget Overdraft" : "✅ Under target budget"}
          </span>
          <span className="text-[#6B7F6A]">{dailyGoal.toFixed(0)} kg</span>
        </div>
      </div>

      {/* Personalized micro tips coach */}
      <div className="p-3 bg-[#121714] border border-[#2C342B] rounded-2xl flex gap-3 items-start">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#A8B8AA] leading-normal font-semibold">
          {getCoachingText()}
        </p>
      </div>
    </div>
  );
}
