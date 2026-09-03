import React from 'react';
import { X, Bot, CheckCircle2, Cpu, Zap, Activity, ShieldCheck, Sparkles, Sliders } from 'lucide-react';

export default function AgentsDrawer({ isOpen, onClose, onOpenSettings }) {
  if (!isOpen) return null;

  const agents = [
    {
      name: "Context Extractor Agent",
      role: "Entity & Boundary Miner",
      model: "Qwen 3.8 27B on Groq (Free)",
      status: "Active",
      description: "Parses uploaded documents (.docx, .pdf, .xlsx, .csv, OCR) to extract stakeholders, in/out scope boundaries, systems, and domain acronyms.",
      capabilities: ["Multi-document synthesis", "Entity linking", "Document structure extraction"]
    },
    {
      name: "Requirements Engineer Agent",
      role: "Hierarchical Requirements Decomposition",
      model: "Qwen 3.8 27B on Groq (Free)",
      status: "Active",
      description: "Generates strict PREQ (Parent), CREQ (Child), and GCREQ (Grandchild) numbered requirements following corporate BA standards.",
      capabilities: ["PREQ/CREQ numbering", "Atomic requirement criteria", "Functional traceability"]
    },
    {
      name: "NFR Specialist Agent",
      role: "Non-Functional & SLA Architect",
      model: "Qwen 3.8 27B on Groq (Free)",
      status: "Active",
      description: "Audits and drafts the 8 corporate non-functional pillars: Availability, Compatibility, Extensibility, Maintainability, Scalability, Security, Usability, and Performance.",
      capabilities: ["SLA enforcement", "Security compliance (PCI-DSS/AES-256)", "Horizontal scalability metrics"]
    },
    {
      name: "Data Architect Agent",
      role: "Schema & Dictionary Specialist",
      model: "Qwen 3.8 27B on Groq (Free)",
      status: "Active",
      description: "Structures data requirements into formal corporate tables, mapping field names, descriptions, editability, mandatory flags, and predefined values.",
      capabilities: ["Data dictionary generation", "Format constraints", "Risk/Dependency matrix"]
    },
    {
      name: "QA & Gap Verifier Agent",
      role: "Anti-Hallucination & Gap Detector",
      model: "Qwen 3.8 27B on Groq (Free)",
      status: "Active",
      description: "Scans output for missing factual details and injects '[NEEDS INPUT: ...]' tags rather than inventing false information.",
      capabilities: ["Hallucination prevention", "Gap tagging", "Template compliance checking"]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1976D2] text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">AI Agents Fleet</h2>
                <p className="text-[11px] text-gray-500">Autonomous sub-agents orchestrating BRD generation</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Engine Banner */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 border-b border-orange-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#E65100] block">
                Primary Engine Active
              </span>
              <p className="text-xs font-semibold text-gray-800">
                Groq High-Speed Inference (Free Tier)
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="text-xs font-semibold px-2.5 py-1 rounded bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3 h-3 text-gray-500" />
              <span>Configure</span>
            </button>
          </div>

          {/* Agents List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {agents.map((ag, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs hover:border-gray-300 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <span>{ag.name}</span>
                    </h3>
                    <p className="text-[11px] font-medium text-[#1976D2]">{ag.role}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {ag.status}
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {ag.description}
                </p>

                <div className="pt-1">
                  <span className="text-[10px] font-semibold text-gray-400 block mb-1">Capabilities:</span>
                  <div className="flex flex-wrap gap-1">
                    {ag.capabilities.map((cap, cIdx) => (
                      <span key={cIdx} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-[11px] text-gray-500">
            All agents adhere to corporate BRD template guidelines and data governance.
          </div>
        </div>
      </div>
    </div>
  );
}
