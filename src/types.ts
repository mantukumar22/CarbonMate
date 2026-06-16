export type TransportMode = 'car' | 'bus' | 'bike' | 'walk' | 'flight';
export type FoodType = 'meat' | 'beef' | 'chicken' | 'vegetarian' | 'vegan' | 'dairy';

export interface TransportItem {
  mode: TransportMode;
  distance_km: number;
}

export interface FoodItem {
  item: string;
  type: FoodType;
}

export interface EnergyData {
  electricity_kwh: number;
  ac_hours: number;
}

export interface WasteData {
  plastic_items: number;
  recycled: boolean;
}

export interface DailyEntry {
  id: string;
  date: string; // e.g. "2026-06-12"
  raw_text: string;
  transport: TransportItem[];
  food: FoodItem[];
  energy: EnergyData;
  waste: WasteData;
  estimated_co2_kg: number;
  notes: string;
  timestamp: number;
  is_fallback?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
