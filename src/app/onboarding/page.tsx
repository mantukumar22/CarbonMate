import React, { useState } from "react";
import EcoBuddy from "../../components/EcoBuddy";
import { Sparkles, ArrowRight, ArrowLeft, Leaf, Shield, Heart, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Image from "../../components/Image";

const onboardingSteps = [
  {
    image: "/images/ecobuddy-happy.png",
    imageTitle: "Welcome to CarbonMate 🌍",
    heading: "Namaste! Ready to help Earth?",
    description: "Track your daily pollution in 30 seconds"
  },
  {
    image: "/images/ecobuddy-neutral.png", 
    imageTitle: "Tell us about yourself 👤",
    heading: "Set up your profile",
    description: "We use this to give you personal tips"
  },
  {
    image: "/illustrations/forest.png",
    imageTitle: "Set your green goal 🎯",
    heading: "How much do you want to reduce?",
    description: "Even small changes make a big difference"
  }
];

interface OnboardingPageProps {
  onCompleteOnboarding: (baselineAnswers: {
    commutePref: string;
    dietPref: string;
    acPref: string;
  }) => void;
}

export default function OnboardingPage({ onCompleteOnboarding }: OnboardingPageProps) {
  const [step, setStep] = useState(1);
  const [commutePref, setCommutePref] = useState("car");
  const [dietPref, setDietPref] = useState("vegetarian");
  const [acPref, setAcPref] = useState("rarely");

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCompleteOnboarding({ commutePref, dietPref, acPref });
  };

  const progressPct = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div className="max-w-2xl mx-auto bg-bg-surface text-text-primary rounded-[32px] border border-border-custom shadow-xl p-6 md:p-8 space-y-6 text-center" id="onboarding-page-container">
      {/* Wave header */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-lg">
          <Leaf className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-xl md:text-2xl font-black tracking-tight mt-1">
          {onboardingSteps[step - 1]?.heading || "Welcome to CarbonMate!"}
        </h2>
        <p className="text-xs md:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
          {onboardingSteps[step - 1]?.description || "Let's track and improve your carbon footprint."}
        </p>
      </div>

      {/* Step progress bar indicator */}
      <div className="space-y-2 max-w-md mx-auto">
        <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary uppercase tracking-wider px-1">
          <span>Your progress</span>
          <span className="text-brand-primary font-black">Step {step} of 3 ({progressPct}%)</span>
        </div>
        <div className="w-full h-2 bg-bg-base rounded-full overflow-hidden border border-border-custom">
          <div 
            className="h-full bg-brand-primary transition-all duration-300" 
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Embedded interactive custom graphic preview of EcoBuddy scenarios with transitions */}
      <div className="flex justify-center max-w-xs mx-auto py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="w-44 h-44 rounded-[24px] overflow-hidden border border-border-custom bg-bg-base relative shadow-md group">
              <Image 
                src={onboardingSteps[step - 1]?.image} 
                alt={onboardingSteps[step - 1]?.imageTitle}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                width={176}
                height={176}
                priority={true}
              />
              <div className="absolute bottom-2 left-2 right-2 bg-slate-950/75 text-[9px] font-black text-white py-1 px-2 rounded-lg text-center backdrop-blur-xs">
                {onboardingSteps[step - 1]?.imageTitle}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-left border-t border-border-custom pt-6">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-1.5 p-5 rounded-2xl bg-bg-base border border-border-custom">
              <span className="bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md inline-block mb-1">
                Step 1: Commute
              </span>
              <label className="text-xs font-black uppercase tracking-wider text-text-secondary block">
                How do you travel daily?
              </label>
              <p className="text-[11px] text-text-secondary mb-3 leading-relaxed">
                Travel makes up 30% of daily pollution. Walking or sharing a bus helps a lot!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {[
                  { id: "car", label: "🚗 Car or Bike", desc: "Uses petrol or diesel" },
                  { id: "bus", label: "🚌 Shared Bus/Train", desc: "Shared public travel" },
                  { id: "bike", label: "🚲 Walk or Cycle", desc: "Zero pollution!" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCommutePref(opt.id)}
                    className={`p-3.5 rounded-xl border transition text-left cursor-pointer flex flex-col justify-between h-24 ${
                      commutePref === opt.id
                        ? "bg-brand-primary text-white border-brand-primary shadow-md"
                        : "bg-bg-surface text-text-primary border-border-custom hover:border-brand-primary"
                    }`}
                  >
                    <span className="font-bold text-xs">{opt.label}</span>
                    <span className={`text-[10px] ${commutePref === opt.id ? "text-emerald-100" : "text-text-secondary"}`}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="bg-brand-primary hover:opacity-90 text-white text-xs font-black px-6 py-3 rounded-xl transition duration-150 flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-1.5 p-5 rounded-2xl bg-bg-base border border-border-custom">
              <span className="bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md inline-block mb-1">
                Step 2: Food
              </span>
              <label className="text-xs font-black uppercase tracking-wider text-text-secondary block">
                What do you usually eat?
              </label>
              <p className="text-[11px] text-text-secondary mb-3 leading-relaxed">
                Meat and dairy create more pollution. Eating vegetarian food is cleaner and healthier!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {[
                  { id: "mixed", label: "🥩 Meat & Dairy", desc: "Chicken, fish, eggs & milk" },
                  { id: "vegetarian", label: "🥗 Vegetarian", desc: "Roti, dal, rice, subzi & paneer" },
                  { id: "vegan", label: "🥦 Plant Based", desc: "Only plants, no milk items" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDietPref(opt.id)}
                    className={`p-3.5 rounded-xl border transition text-left cursor-pointer flex flex-col justify-between h-24 ${
                      dietPref === opt.id
                        ? "bg-brand-primary text-white border-brand-primary shadow-md"
                        : "bg-bg-surface text-text-primary border-border-custom hover:border-brand-primary"
                    }`}
                  >
                    <span className="font-bold text-xs">{opt.label}</span>
                    <span className={`text-[10px] ${dietPref === opt.id ? "text-emerald-100" : "text-text-secondary"}`}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="border border-border-custom bg-bg-surface hover:bg-bg-base text-text-secondary text-xs font-black px-6 py-3 rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="bg-brand-primary hover:opacity-90 text-white text-xs font-black px-6 py-3 rounded-xl transition duration-150 flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-1.5 p-5 rounded-2xl bg-bg-base border border-border-custom">
              <span className="bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md inline-block mb-1">
                Step 3: Home electricity
              </span>
              <label className="text-xs font-black uppercase tracking-wider text-text-secondary block">
                How often do you use AC or cooling units?
              </label>
              <p className="text-[11px] text-text-secondary mb-3 leading-relaxed">
                Using AC consumes a lot of electricity. Let's track and save power together!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {[
                  { id: "yes", label: "❄️ Many Hours Daily", desc: "Uses heavy electricity" },
                  { id: "rarely", label: "🌬️ Summer Days Only", desc: "Occasional eco usage" },
                  { id: "never", label: "🌳 Fan Only", desc: "Zero AC pollution!" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAcPref(opt.id)}
                    className={`p-3.5 rounded-xl border transition text-left cursor-pointer flex flex-col justify-between h-24 ${
                      acPref === opt.id
                        ? "bg-brand-primary text-white border-brand-primary shadow-md"
                        : "bg-bg-surface text-text-primary border-border-custom hover:border-brand-primary"
                    }`}
                  >
                    <span className="font-bold text-xs">{opt.label}</span>
                    <span className={`text-[10px] ${acPref === opt.id ? "text-emerald-100" : "text-text-secondary"}`}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="border border-border-custom bg-bg-surface hover:bg-bg-base text-text-secondary text-xs font-black px-6 py-3 rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
              <button
                type="submit"
                className="bg-brand-primary hover:opacity-90 text-white text-xs font-black px-6 py-3 rounded-xl transition duration-150 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>All Done! 🎉</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </form>

      <div className="flex justify-center items-center gap-4 text-[10px] text-text-secondary font-semibold pt-4 border-t border-border-custom">
        <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-brand-primary" /> Your Data is Safe</span>
        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500" /> Daily Green Tips</span>
      </div>
    </div>
  );
}

