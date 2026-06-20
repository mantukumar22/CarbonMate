import { useMemo } from "react";
import { DailyEntry } from "../types";
import { getISTDateString } from "./dateUtils";

export interface StreakStats {
  currentStreak: number;
  maxStreak: number;
}

export function useStreak(entries: DailyEntry[]): StreakStats {
  return useMemo(() => {
    if (!entries || entries.length === 0) {
      return { currentStreak: 0, maxStreak: 0 };
    }

    // Extract unique dates and sort them in chronological order (oldest to newest)
    const uniqueDates = Array.from(new Set(entries.map((e) => e.date))).sort();

    if (uniqueDates.length === 0) {
      return { currentStreak: 0, maxStreak: 0 };
    }

    // Helper to calculate difference in days between two ISO date strings (YYYY-MM-DD)
    const getDaysBetween = (date1Str: string, date2Str: string): number => {
      const d1 = new Date(date1Str + "T00:00:00");
      const d2 = new Date(date2Str + "T00:00:00");
      return Math.round(Math.abs(d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
    };

    // Calculate maximum streak historically
    let maxStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = getDaysBetween(uniqueDates[i], uniqueDates[i - 1]);
      if (diff === 1) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else if (diff > 1) {
        tempStreak = 1;
      }
    }

    // Calculate current streak
    const todayStr = getISTDateString(new Date());
    const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = getISTDateString(yesterday);

    const newestLoggedDate = uniqueDates[uniqueDates.length - 1];
    
    // If the latest logged entry is neither today nor yesterday, the current streak is broken (0)
    if (newestLoggedDate !== todayStr && newestLoggedDate !== yesterdayStr) {
      return { currentStreak: 0, maxStreak };
    }

    // Backtrack from newestLoggedDate to see how many consecutive days are logged
    let currentStreak = 1;
    for (let i = uniqueDates.length - 2; i >= 0; i--) {
      const diff = getDaysBetween(uniqueDates[i + 1], uniqueDates[i]);
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }

    return { currentStreak, maxStreak: Math.max(maxStreak, currentStreak) };
  }, [entries]);
}
