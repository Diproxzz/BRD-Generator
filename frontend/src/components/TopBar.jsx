import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Copy, Check, Sliders, ExternalLink } from 'lucide-react';

export default function TopBar({ session, activeStep, onStepChange, onOpenAgents, onOpenSettings }) {
  const [copied, setCopied] = useState(false);

  const getStepTitle = () => {
    switch (activeStep) {
      case 1: return "Generate Requirements Document — File Upload";
      case 2: return "Generate Requirements Document — Smart Context & Prompt";
      case 3: return "Generate Requirements Document — Dynamic & Action Agent";
      case 4: return "Generate Requirements Document — Final Report";
      default: return "Generate Requirements Document";
    }
  };

  const handleCopySession = () => {
    if (session?.session_id) {
      navigator.clipboard.writeText(session.session_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBack = () => {
    if (activeStep > 1) {
      onStepChange(activeStep - 1);
    }
  };

  return (
    <header className="bg-transparent pt-4 pb-2 px-6">
      <div className="flex items-start justify-between">
        {/* Left: Back button + Titles */}
        <div className="flex items-start gap-4">
          <button 
            onClick={handleBack}
            disabled={activeStep === 1}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors shadow-sm ${
              activeStep === 1 
                ? 'bg-[#E65100]/60 cursor-not-allowed text-white/70' 
                : 'bg-[#E65100] hover:bg-[#D84315] text-white cursor-pointer active:scale-95'
            }`}
            title="Previous step"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {getStepTitle()}
            </h1>
            <p className="text-xs text-gray-600 font-medium mt-0.5">
              Data Pipeline Workflow • Role: Business Analyst • {session?.use_case_id || 'UC_DP_005'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                <span className="font-semibold">Session Active:</span>
                <span className="font-mono text-[11px] text-gray-700">{session?.session_id || 'Generating...'}</span>
              </div>
              <button 
                onClick={handleCopySession}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200/50 transition-colors"
                title="Copy Session UUID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Top-right pills */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-sm transition-all"
            title="Configure AI Providers (Groq / Gemini)"
          >
            <Sliders className="w-3.5 h-3.5 text-gray-500" />
            <span>AI Config (Free)</span>
          </button>

          <button 
            onClick={() => onStepChange(activeStep === 4 ? 1 : 4)}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#E65100] hover:bg-[#D84315] text-white shadow-sm transition-all"
          >
            Workflow View
          </button>

          <button 
            onClick={onOpenAgents}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 shadow-sm transition-all"
          >
            Studio
          </button>
        </div>
      </div>
    </header>
  );
}
