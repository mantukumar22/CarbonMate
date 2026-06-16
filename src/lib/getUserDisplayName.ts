export const getUserDisplayName = (user: any): string => {
  if (!user) return "Guest";
  if (user.displayName) return user.displayName;
  if (user.email) return user.email.split("@")[0];
  return "Demo User";
};

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
