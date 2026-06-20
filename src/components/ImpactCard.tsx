import React from "react";
import { CO2_PER_TREE_PER_YEAR } from "../constants/appConfig";

interface ImpactCardProps {
  id?: string;
  title?: string;
  value?: string | number;
  unit?: string;
  icon?: string | React.ReactNode;
  color?: "emerald" | "blue" | "teal" | "amber" | "rose" | "slate";
  co2Contribution?: number;
  description?: string;
  co2?: number;
  category?: string;
}

export function ImpactCard({
  id = "",
  title = "",
  value = "",
  unit = "",
  icon,
  color = "emerald",
  co2Contribution = 0,
  description = "",
  co2,
  category,
}: ImpactCardProps): React.JSX.Element {
  const finalCO2 = co2 !== undefined ? co2 : co2Contribution;
  const finalTitle = category !== undefined ? category : title;
  const finalValue = co2 !== undefined ? `${co2} kg` : value;
  const finalUnit = co2 !== undefined ? "" : unit;
  const finalIcon = icon || "🌳";
  const finalColor = color;

  const treesCount = finalCO2 / CO2_PER_TREE_PER_YEAR;

  // Styles based on color
  let colorClasses = {
    bg: "bg-[#1B2119] border-[#2C342B]",
    iconBg: "bg-emerald-950/60 text-emerald-400",
    text: "text-emerald-400",
    barColor: "bg-emerald-500",
  };

  switch (finalColor) {
    case "emerald":
      colorClasses = {
        bg: "bg-[#1B2119] border-[#2C342B]",
        iconBg: "bg-emerald-950/60 text-emerald-400",
        text: "text-emerald-400",
        barColor: "bg-emerald-500",
      };
      break;
    case "blue":
      colorClasses = {
        bg: "bg-[#1B2119] border-[#2C342B]",
        iconBg: "bg-blue-950/60 text-blue-400",
        text: "text-blue-400",
        barColor: "bg-blue-500",
      };
      break;
    case "teal":
      colorClasses = {
        bg: "bg-[#1B2119] border-[#2C342B]",
        iconBg: "bg-teal-950/60 text-teal-400",
        text: "text-teal-400",
        barColor: "bg-teal-500",
      };
      break;
    case "amber":
      colorClasses = {
        bg: "bg-[#1B2119] border-[#2C342B]",
        iconBg: "bg-amber-950/60 text-amber-400",
        text: "text-amber-400",
        barColor: "bg-amber-500",
      };
      break;
    case "rose":
      colorClasses = {
        bg: "bg-[#1B2119] border-[#2C342B]",
        iconBg: "bg-rose-950/60 text-rose-400",
        text: "text-rose-400",
        barColor: "bg-rose-500",
      };
      break;
    case "slate":
    default:
      colorClasses = {
        bg: "bg-[#1B2119] border-[#2C342B]",
        iconBg: "bg-slate-800 text-[#E8F0E3]",
        text: "text-[#E8F0E3]",
        barColor: "bg-slate-500",
      };
      break;
  }

  return (
    <div
      id={id}
      className="p-4 rounded-2xl border backdrop-blur-xs flex flex-col justify-between transition-all duration-300 hover:shadow-md bg-bg-surface border-border-custom text-text-primary"
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
            {finalTitle}
          </span>
          <p className="text-xl font-extrabold mt-1">
            {finalValue} <span className="text-xs font-semibold text-text-secondary">{finalUnit}</span>
          </p>
        </div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClasses.iconBg}`}>
          {typeof finalIcon === "string" ? <span className="text-sm">{finalIcon}</span> : finalIcon}
        </div>
      </div>

      {/* Cumulative tree equivalences info in small font for Accessibility audit */}
      <div className="mt-2 text-[11px] font-bold text-brand-primary">
        🌳 Equivalent to absorption of {treesCount.toFixed(1)} trees per year.
      </div>

      {/* Progress slider indicator if carbon exists */}
      <div className="mt-3 pt-2 border-t border-border-custom">
        <div className="flex items-center justify-between text-[10px] font-bold mb-1 text-text-secondary pb-0.5">
          <span>Daily Pollution</span>
          <span className="text-text-primary">{finalCO2.toFixed(1)} kg pollution (CO2)</span>
        </div>
        
        {description && (
          <p className="text-[10.5px] text-text-secondary italic line-clamp-1 mb-1.5 font-medium">{description}</p>
        )}

        <div className="w-full h-1 bg-bg-base rounded-full overflow-hidden border border-border-custom">
          <div
            className={`h-full ${colorClasses.barColor}`}
            style={{ width: `${Math.min((finalCO2 / 30) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default ImpactCard;

