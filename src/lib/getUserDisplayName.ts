/**
 * Returns a user's display name or drops back to their email prefix / guest status.
 * @param user The current User state object
 * @returns string user's polished name
 */
export const getUserDisplayName = (user: { displayName?: string | null; email?: string | null } | null | undefined): string => {
  if (!user) return "Guest";
  if (user.displayName) return user.displayName;
  if (user.email) return user.email.split("@")[0];
  return "Demo User";
};

/**
 * Returns the uppercase initials of a user based on their display name.
 * @param name The complete display string
 * @returns string 1-2 character initials
 */
export const getUserInitials = (name: string): string => {
  if (!name) return "G";
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
