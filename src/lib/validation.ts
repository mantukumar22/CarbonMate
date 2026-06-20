/**
 * Validates travel distance input
 */
export function validateDistance(distance: unknown): boolean {
  if (typeof distance !== "number" || isNaN(distance)) return false;
  return distance >= 0 && distance <= 2000;
}

/**
 * Validates electricity usage input
 */
export function validateElectricity(kwh: unknown): boolean {
  if (typeof kwh !== "number" || isNaN(kwh)) return false;
  return kwh >= 0 && kwh <= 1000;
}

/**
 * Validates AC hours input
 */
export function validateACHours(hours: unknown): boolean {
  if (typeof hours !== "number" || isNaN(hours)) return false;
  return hours >= 0 && hours <= 24;
}

/**
 * Sanitizes and secures raw user input to prevent HTML/Script injection and prompt attacks.
 */
export function sanitizeAIInput(input: string): string {
  if (!input) return "";
  
  let result = input.trim();
  
  // Strip script tags and all internal contents
  result = result.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, "");
  
  // Single element strip tag elements
  result = result.replace(/<\/?[^>]+(>|$)/g, "");
  
  // Normalize whitespace
  result = result.replace(/\s+/g, " ").trim();

  
  // Prompt injection blocklists
  const lower = result.toLowerCase();
  if (
    lower.includes("ignore previous instructions") ||
    lower.includes("ignore above") ||
    lower.includes("system:") ||
    lower.includes("developer:") ||
    lower.includes("you are now")
  ) {
    return "";
  }
  
  // Max size limit
  if (result.length > 500) {
    result = result.substring(0, 500);
  }
  
  return result;
}
