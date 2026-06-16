import React from "react";
import { getUserDisplayName, getUserInitials } from "../../lib/getUserDisplayName";
import { UserProfile } from "../../lib/firebase";
import { Leaf, Award, Shield, FileText, RefreshCw, Trash2 } from "lucide-react";

interface ProfileTabProps {
  user: any;
  userProfile: UserProfile | null;
  onResetOnboarding: () => void;
  entriesCount: number;
}

export default function ProfileTab({
  user,
  userProfile,
  onResetOnboarding,
  entriesCount,
}: ProfileTabProps) {
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(displayName);

  return (
    <div className="max-w-xl mx-auto bg-bg-surface text-text-primary rounded-[32px] border border-border-custom shadow-xl overflow-hidden" id="profile-tab-wrapper">
      {/* Decorative top green banner */}
      <div className="h-24 bg-gradient-to-r from-emerald-800 to-emerald-950 relative">
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
          {/* Large initials avatar */}
          <div className="w-20 h-20 rounded-full bg-emerald-500 border-4 border-bg-surface flex items-center justify-center text-slate-950 text-2xl font-black shadow-lg">
            {initials}
          </div>
        </div>
      </div>

      <div className="pt-10 pb-8 px-6 md:px-8 text-center space-y-6">
        {/* Real User Display Name Section */}
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-black text-text-primary flex items-center justify-center gap-1.5">
            {displayName} 🌿
          </h1>
          <p className="text-xs text-text-secondary">
            {user?.email || "Guest User"}
          </p>
          <p className="text-[10px] text-emerald-500/85 font-bold uppercase tracking-wider">
            {entriesCount > 3 ? "🏆 Elite Earth Guardian" : "🌱 Junior Eco Companion"}
          </p>
        </div>

        {/* Member Since Metadata block conforming to user requested indian locale representation */}
        <p className="text-[11px] text-text-secondary font-semibold">
          Member since{" "}
          {user?.metadata?.creationTime
            ? new Date(user.metadata.creationTime).toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })
            : "Today"}
        </p>

        {/* Dynamic Prefs grid */}
        <div className="grid grid-cols-2 gap-3 pt-2 text-left">
          <div className="p-3.5 rounded-2xl bg-bg-base border border-border-custom">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-primary block mb-0.5">
              Transits
            </span>
            <span className="text-xs font-black capitalize">
              {userProfile?.commutePref === "bike"
                ? "🚲 Walk/Cycle"
                : userProfile?.commutePref === "bus"
                ? "🚌 Shared Transit"
                : "🚗 Car Commuting"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-bg-base border border-border-custom">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-primary block mb-0.5">
              Diet Style
            </span>
            <span className="text-xs font-black capitalize">
              {userProfile?.dietPref === "vegan"
                ? "🥦 Plant Based"
                : userProfile?.dietPref === "vegetarian"
                ? "🥗 Vegetarian"
                : "🥩 Mixed Diet"}
            </span>
          </div>
        </div>

        {/* Action items */}
        <div className="pt-2 flex flex-col gap-2.5">
          <button
            onClick={onResetOnboarding}
            className="w-full py-3 bg-[#1B2119] border border-[#2C342B] hover:bg-[#222d20] transition text-brand-primary rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Update Eco Preferences</span>
          </button>
        </div>

        <div className="flex justify-center items-center gap-4 text-[10px] text-text-secondary font-semibold pt-4 border-t border-border-custom">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-brand-primary" /> End-to-End Encrypted
          </span>
          <span className="flex items-center gap-1">
            <Leaf className="w-3.5 h-3.5 text-brand-primary" /> Active Carbon Ledger
          </span>
        </div>
      </div>
    </div>
  );
}
