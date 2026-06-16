import { DailyEntry } from "../types";

export async function extractDailyJournal(description: string): Promise<any> {
  const response = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to analyze your text with EcoBuddy.");
  }

  return response.json();
}

export async function fetchPersonalizedTips(history: DailyEntry[]): Promise<string[]> {
  const response = await fetch("/api/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to load personalized recommendations.");
  }

  const data = await response.json();
  return data.tips || [];
}

export async function sendMessageToBuddy(message: string, chatHistory: { role: string; text: string }[]): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, chatHistory }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "EcoBuddy is asleep at the moment.");
  }

  const data = await response.json();
  return data.text || "";
}
