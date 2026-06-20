import React, { useState } from "react";
import { Plus, Trash2, CheckCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import { DailyEntry, TransportItem, FoodItem, TransportMode, FoodType } from "../types";
import { COMMUTE_FACTORS, DIET_FACTORS, calculateEntryCO2 } from "../lib/emissionFactors";
import { getISTDateString } from "../lib/dateUtils";
import {
  MAX_DISTANCE_KM,
  MAX_AC_HOURS,
  MAX_ELECTRICITY_KWH,
  HIGH_CO2_THRESHOLD,
  MEDIUM_CO2_THRESHOLD
} from "../constants/appConfig";

interface ManualLoggerProps {
  onAddEntry: (entry: DailyEntry) => void;
}

export default function ManualLogger({ onAddEntry }: ManualLoggerProps): React.JSX.Element {
  const [date, setDate] = useState(() => getISTDateString());
  const [transports, setTransports] = useState<TransportItem[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [electricity, setElectricity] = useState<number>(3);
  const [acHours, setAcHours] = useState<number>(0);
  const [plasticItems, setPlasticItems] = useState<number>(0);
  const [recycled, setRecycled] = useState<boolean>(true);

  // Temporary selectors & inputs
  const [tempMode, setTempMode] = useState<TransportMode>("car");
  const [tempDistance, setTempDistance] = useState<string>("");

  const [tempFoodItem, setTempFoodItem] = useState<string>("");
  const [tempFoodType, setTempFoodType] = useState<FoodType>("vegetarian");

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const addTransport = (): void => {
    setError(null);
    const dist = parseFloat(tempDistance);
    if (isNaN(dist) || dist <= 0) {
      setError("Please enter distance in km.");
      return;
    }
    if (dist > MAX_DISTANCE_KM) {
      setError(`Please enter correct distance (max ${MAX_DISTANCE_KM}km). 🌍`);
      return;
    }
    setTransports([...transports, { mode: tempMode, distance_km: dist }]);
    setTempDistance("");
  };

  const removeTransport = (index: number): void => {
    setTransports(transports.filter((_, i) => i !== index));
  };

  const addFood = (): void => {
    setError(null);
    if (!tempFoodItem.trim()) {
      setError("Please write what you ate (for example, roti or rice).");
      return;
    }
    if (tempFoodItem.length > 80) {
      setError("Please write a shorter item name.");
      return;
    }
    setFoods([...foods, { item: tempFoodItem.trim(), type: tempFoodType }]);
    setTempFoodItem("");
  };

  const removeFood = (index: number): void => {
    setFoods(foods.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setError(null);

    if (transports.length === 0 && foods.length === 0 && electricity === 0 && acHours === 0 && plasticItems === 0) {
      setError("Please fill details above before saving!");
      return;
    }

    if (electricity < 0 || acHours < 0 || plasticItems < 0) {
      setError("Please enter correct numbers.");
      return;
    }

    if (acHours > MAX_AC_HOURS) {
      setError(`AC used cannot be more than ${MAX_AC_HOURS} hours.`);
      return;
    }

    if (electricity > MAX_ELECTRICITY_KWH) {
      setError(`Electricity cannot be more than ${MAX_ELECTRICITY_KWH} units.`);
      return;
    }

    if (plasticItems > 1000) {
      setError("Please enter correct number of plastic items.");
      return;
    }

    // Mathematically calculate CO2 sum
    const co2Sum = calculateEntryCO2({
      transport: transports,
      food: foods,
      energy: { electricity_kwh: electricity, ac_hours: acHours },
      waste: { plastic_items: plasticItems, recycled }
    });

    // Build raw text summary automatically
    const summaryParts: string[] = [];
    if (transports.length > 0) {
      summaryParts.push(`Commuted via ${transports.map((t) => `${t.mode} (${t.distance_km}km)`).join(", ")}`);
    } else {
      summaryParts.push("No carbon heavy commutes");
    }
    if (foods.length > 0) {
      summaryParts.push(`Ate ${foods.map((f) => `${f.item} (${f.type})`).join(", ")}`);
    }
    if (acHours > 0) {
      summaryParts.push(`Ran AC for ${acHours} hours`);
    }

    const raw_text = summaryParts.join(". ") + ".";

    // Generate dynamic eco encouragement note
    let encouragingNotes = "Saved! Every small step helps our Earth. Keep going! 🌱";
    if (co2Sum < MEDIUM_CO2_THRESHOLD) {
      encouragingNotes = "Saved! Every small step helps our Earth. Keep going! 🌱";
    } else if (co2Sum > HIGH_CO2_THRESHOLD) {
      encouragingNotes = "Saved! Let's eat more vegetarian food like dal rice tomorrow to go green. 🥦";
    }

    const newEntry: DailyEntry = {
      id: Math.random().toString(),
      date,
      raw_text,
      transport: transports,
      food: foods,
      energy: { electricity_kwh: electricity, ac_hours: acHours },
      waste: { plastic_items: plasticItems, recycled },
      estimated_co2_kg: co2Sum,
      notes: encouragingNotes,
      timestamp: Date.now(),
    };

    setIsSaving(true);

    setTimeout(() => {
      onAddEntry(newEntry);
      setIsSaving(false);
      setIsSaved(true);
      setMessage("Saved! Every small step helps our Earth. Keep going! 🌱");

      // Reset fields
      setTransports([]);
      setFoods([]);
      setElectricity(3);
      setAcHours(0);
      setPlasticItems(0);
      setRecycled(true);

      setTimeout(() => {
        setIsSaved(false);
        setMessage(null);
      }, 3000);
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1B2119] border border-[#2C342B] shadow-sm rounded-2xl p-5 space-y-4" id="manual-logger-component">
      <div className="flex items-center justify-between pb-3 border-b border-[#2C342B]">
        <h3 className="text-sm font-bold text-[#E8F0E3] flex items-center gap-2">
          🔨 Fill it Yourself
        </h3>
        <label htmlFor="manual-date-input" className="sr-only">Select activity log date</label>
        <input
          id="manual-date-input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-[#121714] text-[#E8F0E3] text-xs font-bold p-1.5 border border-[#2C342B] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {message && (
        <div className="p-3 text-xs bg-emerald-950/40 border border-emerald-900 text-emerald-300 rounded-xl flex items-center gap-1.5 font-bold animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 text-xs bg-rose-950/40 border border-rose-900 text-rose-300 rounded-xl flex items-center gap-1.5 font-bold animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Transport Input */}
      <div className="space-y-2 bg-[#121714] border border-[#2C342B] p-4 rounded-xl shadow-xs">
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400 block mb-1">
          Add Your Travel
        </span>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <div>
            <label htmlFor="manual-transport-select" className="sr-only">Select transport mode</label>
            <select
              id="manual-transport-select"
              aria-label="Select transport mode"
              value={tempMode}
              onChange={(e) => setTempMode(e.target.value as TransportMode)}
              className="w-full bg-[#1B2119] text-[#E8F0E3] text-xs font-semibold p-2.5 border border-[#2C342B] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
            >
              <option value="car" className="bg-[#1B2119] text-[#E8F0E3]">🚗 Car</option>
              <option value="bus" className="bg-[#1B2119] text-[#E8F0E3]">🚌 Bus</option>
              <option value="bike" className="bg-[#1B2119] text-[#E8F0E3]">🚲 Bicycle</option>
              <option value="walk" className="bg-[#1B2119] text-[#E8F0E3]">🚶 Walk</option>
              <option value="flight" className="bg-[#1B2119] text-[#E8F0E3]">✈️ Flight</option>
            </select>
          </div>

          <div className="flex flex-col w-full">
            <div className="flex gap-2 w-full">
              <label htmlFor="manual-distance-input" className="sr-only">Distance travelled in kilometers</label>
              <input
                id="manual-distance-input"
                aria-label="Distance in kilometers"
                type="number"
                placeholder="Distance (km)"
                value={tempDistance}
                onChange={(e) => setTempDistance(e.target.value)}
                className={`flex-1 min-w-0 bg-[#1B2119] text-[#E8F0E3] text-xs p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none ${
                  tempDistance && (parseFloat(tempDistance) <= 0 || isNaN(parseFloat(tempDistance)))
                    ? "border-rose-500 focus:ring-rose-500" 
                    : "border-[#2C342B]"
                }`}
              />
              <button
                type="button"
                onClick={addTransport}
                aria-label="Add transport segment"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs transition duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 hover:scale-[1.02] active:scale-[0.97]"
                disabled={!tempDistance || parseFloat(tempDistance) <= 0 || isNaN(parseFloat(tempDistance))}
              >
                + Add
              </button>
            </div>
            {tempDistance && (parseFloat(tempDistance) <= 0 || isNaN(parseFloat(tempDistance))) && (
              <p className="text-[10px] text-rose-450 font-bold flex items-center gap-1 animate-fadeIn mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" /> Distance must be greater than 0
              </p>
            )}
          </div>
        </div>

        {transports.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {transports.map((t, idx) => (
              <span key={idx} className="bg-emerald-950/60 text-[10px] text-emerald-450 border border-emerald-900 font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                <span className="capitalize">{t.mode}</span> ({t.distance_km}km)
                <button type="button" aria-label={`Remove transport item ${t.mode}`} onClick={() => removeTransport(idx)} className="text-red-400 hover:text-red-500 ml-1 font-extrabold cursor-pointer">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Food Input */}
      <div className="space-y-2 bg-[#121714] border border-[#2C342B] p-4 rounded-xl shadow-xs">
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400 block mb-1">
          Add Food
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <div className="flex flex-col w-full">
            <label htmlFor="manual-food-item-input" className="sr-only">Meal description</label>
            <input
              id="manual-food-item-input"
              aria-label="Meal description word input"
              type="text"
              placeholder="Example: Paneer sabzi, Dal fry"
              value={tempFoodItem}
              onChange={(e) => setTempFoodItem(e.target.value)}
              className={`w-full bg-[#1B2119] text-[#E8F0E3] text-xs p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none ${
                tempFoodItem !== "" && !tempFoodItem.trim()
                  ? "border-rose-500 focus:ring-rose-500" 
                  : "border-[#2C342B]"
              }`}
            />
            {tempFoodItem !== "" && !tempFoodItem.trim() && (
              <p className="text-[10px] text-rose-450 font-bold flex items-center gap-1 animate-fadeIn mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" /> Meal name cannot be empty
              </p>
            )}
          </div>

          <div className="flex gap-2 w-full">
            <label htmlFor="manual-food-type-select" className="sr-only">Select meal type</label>
            <select
              id="manual-food-type-select"
              aria-label="Select meal type category"
              value={tempFoodType}
              onChange={(e) => setTempFoodType(e.target.value as FoodType)}
              className="flex-1 min-w-0 bg-[#1B2119] text-[#E8F0E3] text-xs font-semibold p-2.5 border border-[#2C342B] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
            >
              <option value="beef" className="bg-[#1B2119] text-[#E8F0E3]">🥩 Beef Meal</option>
              <option value="chicken" className="bg-[#1B2119] text-[#E8F0E3]">🍗 Chicken Meal</option>
              <option value="meat" className="bg-[#1B2119] text-[#E8F0E3]">🍖 Other Meat</option>
              <option value="dairy" className="bg-[#1B2119] text-[#E8F0E3]">🧀 Dairy & Milk Selection</option>
              <option value="vegetarian" className="bg-[#1B2119] text-[#E8F0E3]">🥗 Vegetarian Selection</option>
              <option value="vegan" className="bg-[#1B2119] text-[#E8F0E3]">🥦 Pure Vegan (Plant Meal)</option>
            </select>
            <button
              type="button"
              onClick={addFood}
              aria-label="Add meal entry"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs transition duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 hover:scale-[1.02] active:scale-[0.97]"
              disabled={!tempFoodItem.trim()}
            >
              + Add
            </button>
          </div>
        </div>

        {foods.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {foods.map((f, idx) => (
              <span key={idx} className="bg-emerald-950/60 text-[10px] text-emerald-450 border border-emerald-900 font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                <span>{f.item}</span> <span className="text-slate-450 font-normal">({f.type})</span>
                <button type="button" aria-label={`Remove meal item ${f.item}`} onClick={() => removeFood(idx)} className="text-red-400 hover:text-red-500 ml-1 font-extrabold cursor-pointer">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Household & Utilities row */}
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3 w-full">
        <div className="bg-[#121714] border border-[#2C342B] p-4 rounded-xl shadow-xs space-y-1">
          <label htmlFor="manual-electricity-input" className="text-xs font-semibold uppercase tracking-wide text-emerald-400 block">
            ⚡ Electricity Used (units)
          </label>
          <input
            id="manual-electricity-input"
            type="number"
            min={0}
            step={0.5}
            value={electricity}
            onChange={(e) => setElectricity(parseFloat(e.target.value) || 0)}
            className="w-full bg-[#1B2119] text-[#E8F0E3] text-xs p-2.5 border border-[#2C342B] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="bg-[#121714] border border-[#2C342B] p-4 rounded-xl shadow-xs space-y-1">
          <label htmlFor="manual-ac-hours-input" className="text-xs font-semibold uppercase tracking-wide text-emerald-400 block">
            ❄️ AC Used (hours)
          </label>
          <input
            id="manual-ac-hours-input"
            type="number"
            min={0}
            max={24}
            value={acHours}
            onChange={(e) => setAcHours(parseInt(e.target.value) || 0)}
            className="w-full bg-[#1B2119] text-[#E8F0E3] text-xs p-2.5 border border-[#2C342B] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Recycling details */}
      <div className="bg-[#121714] border border-[#2C342B] p-4 rounded-xl flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-3 shadow-xs">
        <div className="space-y-1 w-full min-[420px]:w-auto">
          <label htmlFor="manual-plastic-items-input" className="text-xs font-semibold uppercase tracking-wide text-emerald-400 block">
            🗑️ Discarded Plastic Items
          </label>
          <input
            id="manual-plastic-items-input"
            type="number"
            min={0}
            value={plasticItems}
            onChange={(e) => setPlasticItems(parseInt(e.target.value) || 0)}
            className="bg-[#1B2119] text-[#E8F0E3] text-xs p-2.5 border border-[#2C342B] rounded-xl outline-none w-full min-[420px]:w-28 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col items-start min-[420px]:items-end shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400 block mb-1.5">Was it Recycled?</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRecycled(true)}
              aria-label="Yes, plastic was recycled"
              className={`p-2 px-4 rounded-xl text-xs font-bold border transition duration-150 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.97] ${
                recycled 
                  ? "bg-green-600 text-white border-green-600 shadow-green-500/10" 
                  : "bg-[#1B2119] text-[#A8B8AA] border-[#2C342B]"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setRecycled(false)}
              aria-label="No, plastic was not recycled"
              className={`p-2 px-4 rounded-xl text-xs font-bold border transition duration-150 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.97] ${
                !recycled 
                  ? "bg-amber-600 text-white border-amber-600 shadow-amber-500/10" 
                  : "bg-[#1B2119] text-[#A8B8AA] border-[#2C342B]"
              }`}
            >
              No
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving || isSaved}
        className={`w-full py-3.5 rounded-xl font-bold transition-all duration-200 ease-in-out cursor-pointer text-xs flex items-center justify-center gap-2 ${
          isSaved 
            ? "bg-emerald-600 text-white shadow-md animate-pulse"
            : isSaving 
              ? "bg-[#121714] text-slate-500 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-400 text-[#000000] font-black shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.97] active:brightness-95"
        }`}
      >
        {isSaving ? (
          <span className="flex items-center gap-2">
            <Loader2 className="animate-spin w-4 h-4" /> Saving...
          </span>
        ) : isSaved ? (
          <span className="flex items-center gap-2 animate-fadeIn font-extrabold">
            <CheckCircle className="w-4 h-4 text-white" /> Saved! Every small step helps our Earth. Keep going! 🌱
          </span>
        ) : (
          "Save Log"
        )}
      </button>
    </form>
  );
}
