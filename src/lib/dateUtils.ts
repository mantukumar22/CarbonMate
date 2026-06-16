/**
 * Utility to get correct Indian Standard Time (IST) date string in YYYY-MM-DD.
 * It ensures users in India see matches on their exact calendar day.
 */
export function getISTDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
}
