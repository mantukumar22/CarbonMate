import React from "react";
import { Shield, BookOpen, X, Check, ExternalLink } from "lucide-react";

interface PrivacyTermsProps {
  onClose: () => void;
}

export default function PrivacyTerms({ onClose }: PrivacyTermsProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" id="privacy-terms-compliance-overlay">
      <div className="bg-[#1B2119] rounded-[32px] border border-[#2C342B] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <header className="p-6 border-b border-[#2C342B] flex items-center justify-between bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-950/60 rounded-xl flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#E8F0E3]">Privacy Policy & Terms of Service</h3>
              <p className="text-[10px] text-[#A8B8AA] font-bold uppercase tracking-wider">CarbonMate Compliance Hub</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#121714] border border-[#2C342B] flex items-center justify-center text-[#A8B8AA] hover:text-[#E8F0E3] transition cursor-pointer"
            id="close-privacy-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#A8B8AA] leading-relaxed font-semibold">
          
          {/* Section 1: Introduction */}
          <section className="space-y-2">
            <h4 className="text-sm font-black text-[#E8F0E3] flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-emerald-500 rounded-full inline-block" />
              1. Our Clean Data Promise
            </h4>
            <p>
              Your personal data and daily footprint computations belong fully to you. At CarbonMate, we prioritize zero-knowledge client architectures and absolute transparency. This document describes what we collect, how it remains secure under Firebase Auth protective shielding, and your legal compliance rights under GDPR and CCPA.
            </p>
          </section>

          {/* Section 2: PII Policy */}
          <section className="space-y-2">
            <h4 className="text-sm font-black text-[#E8F0E3] flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-emerald-500 rounded-full inline-block" />
              2. Strict Non-PII & Minimal Storage Limits
            </h4>
            <p>
              We enforce strict data minimization limits. Your account stores only these essential fields:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#6B7F6A]">
              <li><strong className="text-[#E8F0E3]">Identity Details:</strong> Account display name and secure email login via Google OAuth or certified email credentials, managed by isolated Firebase Auth clusters.</li>
              <li><strong className="text-[#E8F0E3]">Local Configuration:</strong> Carbon emission dietary choices and commute presets.</li>
              <li><strong className="text-[#E8F0E3]">Atmospheric Data:</strong> Your daily raw log entries and compiled CO2 estimates. We do NOT collect GPS coordinates, street addresses, billing details, or physical tracking. Location is only evaluated at general city levels.</li>
            </ul>
          </section>

          {/* Section 3: Gemini Privacy */}
          <section className="space-y-2">
            <h4 className="text-sm font-black text-[#E8F0E3] flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-emerald-500 rounded-full inline-block" />
              3. AI processing & Server Proxy Safety
            </h4>
            <p>
              When parsing natural language journals (e.g. "I drove 15km today..."), your texts are securely channeled through an abstract encrypted server proxy to our Google Gemini model endpoint. Raw texts are converted into system objects without any attachments of your user ID, name, or metadata, protecting your identity from unauthorized machine training pipelines.
            </p>
          </section>

          {/* Section 4: Deletion & Portability rights */}
          <section className="space-y-2">
            <h4 className="text-sm font-black text-[#E8F0E3] flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-emerald-500 rounded-full inline-block" />
              4. Immediate Data Export & Deletion Rights
            </h4>
            <p>
              Under global GDPR compliance rules:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#6B7F6A]">
              <li>You have the absolute right to <strong className="text-[#E8F0E3]">Export Information</strong>. You may compile and download all historical logged activities as parsed clean JSON data directly from your client dashboard.</li>
              <li>You have the absolute right to <strong className="text-[#E8F0E3]">Permanent Oblivion / Deletion</strong>. Triggering account purging from the Settings menu immediately wipes out your active memory entries in our cloud clusters, leaving no cached residual metadata behind.</li>
            </ul>
          </section>

          {/* Section 5: Terms of Service */}
          <section className="space-y-2">
            <h4 className="text-sm font-black text-[#E8F0E3] flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-emerald-500 rounded-full inline-block" />
              5. Acceptable Continuous Use Terms
            </h4>
            <p>
              By utilizing CarbonMate and communicating with our live Carbon assistant, you agree to treat the software respectfully. Prompts causing hate-speech, high-scale bot request spikes, prompt injection attempts to jailbreak the assistant, or general Denial of Service behaviors are strictly blocked to protect fellow users' bandwidth and global computing resources.
            </p>
          </section>

          <div className="bg-emerald-950/40 border border-emerald-900 p-4 rounded-2xl flex items-center gap-3 text-emerald-400 text-[11px] font-bold">
            <Check className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>GDPR, CCPA, and Firebase Security rules validated for secure application runs!</span>
          </div>
        </div>

        {/* Modal Footer */}
        <footer className="p-4 border-t border-[#2C342B] bg-[#121714] text-right shrink-0">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
          >
            I Accept terms & close
          </button>
        </footer>
      </div>
    </div>
  );
}
