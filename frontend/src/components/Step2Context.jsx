import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Users, Layers, ShieldAlert, Cpu, FileText, CheckCircle2, Edit3, Loader2 } from 'lucide-react';

export default function Step2Context({ 
  context, 
  userPrompt, 
  onUpdatePrompt, 
  onContinue, 
  onBack,
  isLoading = false 
}) {
  const [promptValue, setPromptValue] = useState(userPrompt || "");

  const handlePromptChange = (e) => {
    setPromptValue(e.target.value);
    onUpdatePrompt(e.target.value);
  };

  const addPromptSuggestion = (suggestion) => {
    const updated = promptValue ? `${promptValue}\n• ${suggestion}` : `• ${suggestion}`;
    setPromptValue(updated);
    onUpdatePrompt(updated);
  };

  const suggestions = [
    "Strictly format Functional Requirements using PREQ, CREQ, and GCREQ numbered hierarchy.",
    "Emphasize latency under 1500ms and 99.99% availability in Non-Functional Requirements.",
    "Include Dead Letter Queue (DLQ) administrative replay console specifications.",
    "Ensure PCI-DSS compliance and AES-256 encryption at rest are explicitly mandated."
  ];

  return (
    <div className="mx-6 my-4">
      <div className="bg-[#E8E8E6]/80 rounded-2xl p-6 border border-gray-300/70 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E65100]/10 flex items-center justify-center text-[#E65100]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Smart Context & Prompt Engineering
              </h2>
              <p className="text-xs text-gray-600">
                Review extracted business entities and refine instructions for the drafting agents.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Entities Extracted</span>
          </span>
        </div>

        {/* Extracted Entities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Project Summary Card */}
          <div className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-2xs">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-800 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-[#E65100]" />
              <span>Project Overview</span>
            </div>
            <p className="text-sm font-bold text-gray-900 mb-1">
              {context?.project_name || "Enterprise Data Pipeline"}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {context?.project_summary || "Automated data transformation pipeline modernization."}
            </p>
          </div>

          {/* Sponsors & Contributors */}
          <div className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-2xs">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-800 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Identified Stakeholders</span>
            </div>
            <div className="space-y-1.5">
              {context?.sponsors?.slice(0, 2).map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1 rounded border border-gray-100">
                  <span className="font-semibold text-gray-800">{s[0]}</span>
                  <span className="text-gray-500 text-[11px]">{s[1]} (Sponsor)</span>
                </div>
              ))}
              {context?.contributors?.slice(0, 2).map((c, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1 rounded border border-gray-100">
                  <span className="font-medium text-gray-700">{c[0]}</span>
                  <span className="text-gray-500 text-[11px]">{c[1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* In-Scope Deliverables */}
          <div className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-2xs">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>In-Scope Deliverables</span>
            </div>
            <ul className="space-y-1 text-xs text-gray-700">
              {context?.in_scope?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{Array.isArray(item) ? item[0] : item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Out-of-Scope & Acronyms */}
          <div className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-2xs">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-800 uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Out-of-Scope & Acronyms</span>
            </div>
            <div className="mb-2">
              <span className="text-[11px] text-gray-500 font-semibold block mb-1">Excluded Boundaries:</span>
              <ul className="space-y-0.5 text-xs text-gray-600">
                {context?.out_of_scope?.map((item, idx) => (
                  <li key={idx} className="truncate">
                    <span className="text-red-500 mr-1">✕</span>
                    {Array.isArray(item) ? `${item[0]} (${item[1]})` : item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {context?.acronyms?.map((a, idx) => (
                <span key={idx} className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200" title={a[1]}>
                  {a[0]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* BA Refinement & Instructions Textarea */}
        <div className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
              <Edit3 className="w-3.5 h-3.5 text-[#E65100]" />
              <span>Business Analyst Custom Directives & Refinement</span>
            </div>
            <span className="text-[11px] text-gray-500">Optional but recommended</span>
          </div>

          <textarea
            rows={4}
            value={promptValue}
            onChange={handlePromptChange}
            placeholder="Add any specific guidelines for the AI generation agents (e.g. 'Ensure PREQ/CREQ hierarchy is strictly followed', 'Focus on onboarding and authentication APIs', 'Mandate 99.95% uptime for NFRs')..."
            className="w-full text-xs text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#E65100]/30 focus:border-[#E65100] resize-y"
          />

          {/* Quick Suggestions Chips */}
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Quick Guidance Prompts:</p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addPromptSuggestion(s)}
                  className="text-[11px] bg-orange-50 hover:bg-orange-100 text-[#E65100] border border-orange-200/80 px-2.5 py-1 rounded-md transition-colors cursor-pointer text-left"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={onBack}
          className="px-5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Upload</span>
        </button>

        <button
          onClick={onContinue}
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#E65100] hover:bg-[#D84315] text-white shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Run Generation Agents</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
