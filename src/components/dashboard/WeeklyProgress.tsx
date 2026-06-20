import React from "react";

export interface WeeklyProgressProps {
  thisWeek: number;
  lastWeek: number;
}

export const WeeklyProgress = ({ 
  thisWeek, 
  lastWeek 
}: WeeklyProgressProps): React.JSX.Element => {
  const diff = lastWeek - thisWeek;
  const improved = diff > 0;
  const percentage = lastWeek > 0 
    ? Math.abs((diff / lastWeek) * 100).toFixed(1)
    : "0";

  return (
    <div 
      className="bg-[#1B2119] border border-[#2C342B] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 text-text-primary"
      aria-label={`Weekly progress comparison: ${
        improved 
          ? `You reduced pollution by ${percentage}%` 
          : `Pollution increased by ${percentage}%`
      } compared to last week`}
    >
      <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">
        vs Last Week
      </p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className={`text-3xl font-extrabold ${
          improved ? "text-emerald-400" : diff === 0 ? "text-blue-400" : "text-rose-400"
        }`}>
          {improved ? "↓" : diff === 0 ? "•" : "↑"} {percentage}%
        </p>
        <span className="text-[10px] font-bold text-text-secondary uppercase">Pollution change</span>
      </div>
      <p className="text-[#A8B8AA] text-xs mt-2 leading-relaxed font-semibold">
        {improved 
          ? `Great job! ${diff.toFixed(1)}kg less pollution produced than previous week. 🌿` 
          : diff === 0
            ? "Consistent footprint! Try walking or choosing more vegan meals tomorrow to see progress roll. 🥦"
            : `Try to reduce by ${Math.abs(diff).toFixed(1)}kg next week to meet your green targets.`
        }
      </p>
    </div>
  );
};

export default WeeklyProgress;
