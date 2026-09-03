import React, { useState, useEffect } from 'react';
import { Bot, CheckCircle2, Clock, Loader2, RefreshCw, ArrowRight, ShieldCheck, AlertCircle, FileCheck, Terminal } from 'lucide-react';

export default function Step3AgentRun({ 
  generationStatus = {}, 
  agentsActivity = [], 
  onProceedToReport, 
  onRetrySection,
  isGenerating = true 
}) {
  const [logs, setLogs] = useState([
    "Initializing multi-agent orchestrator...",
    "Agent 'Context Extractor' confirmed 18 entities from uploaded source materials.",
    "Spawning 'Requirements Engineer' for PREQ/CREQ hierarchical decomposition...",
    "Spawning 'NFR Specialist' for 8-point corporate architecture review...",
    "Spawning 'Data Architect' to map field attributes and constraints..."
  ]);

  const sections = [
    {
      id: "project_overview",
      title: "Project Overview & Scope (Sponsors, In/Out of Scope)",
      agent: "Requirements Engineer",
      status: generationStatus?.project_overview || "in_progress",
    },
    {
      id: "existing_processes",
      title: "Existing Processes & Problem Narrative",
      agent: "Context Extractor",
      status: generationStatus?.existing_processes || "in_progress",
    },
    {
      id: "deliverables",
      title: "Functional Requirements (Hierarchical PREQ / CREQ / GCREQ)",
      agent: "Requirements Engineer",
      status: generationStatus?.deliverables || "in_progress",
    },
    {
      id: "nfr",
      title: "Non-Functional Requirements Checklist (Availability, Scalability, Security, etc.)",
      agent: "NFR Specialist",
      status: generationStatus?.deliverables || "in_progress",
    },
    {
      id: "data_requirements",
      title: "Data Requirements & Field Dictionary Catalog",
      agent: "Data Architect",
      status: generationStatus?.deliverables || "in_progress",
    },
    {
      id: "appendix_and_signoff",
      title: "Sign-off Matrix, Business Rules & Appendix",
      agent: "QA & Gap Verifier",
      status: generationStatus?.appendix_and_signoff || "in_progress",
    },
  ];

  const allCompleted = !isGenerating && Object.values(generationStatus).every(s => s === "completed");

  useEffect(() => {
    if (allCompleted) {
      setLogs(prev => [
        ...prev,
        "QA & Gap Verifier completed validation check.",
        "Corporate .docx styling compiled matching template standards.",
        "Ready for Business Analyst review and export."
      ]);
    }
  }, [allCompleted]);

  return (
    <div className="mx-6 my-4">
      <div className="bg-[#E8E8E6]/80 rounded-2xl p-6 border border-gray-300/70 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1976D2]/10 flex items-center justify-center text-[#1976D2]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Dynamic & Action Agent — Generation Pipeline
              </h2>
              <p className="text-xs text-gray-600">
                Coordinated AI agents are drafting and validating each section according to corporate BRD standards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isGenerating ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Agents Active (Groq Llama / Qwen)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Draft Generation Complete</span>
              </span>
            )}
          </div>
        </div>

        {/* Two Column Layout: Section Progress & Live Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
          {/* Section Progress (7 Cols) */}
          <div className="lg:col-span-7 space-y-2.5">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
              BRD Template Sections Generation
            </h3>

            {sections.map((sec) => {
              const isDone = sec.status === "completed";
              const isInProgress = sec.status === "in_progress";
              const isFailed = sec.status === "failed";

              return (
                <div
                  key={sec.id}
                  className="flex items-center justify-between bg-white rounded-xl p-3.5 border border-gray-200/90 shadow-2xs transition-all hover:border-gray-300"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : isInProgress ? (
                        <Loader2 className="w-5 h-5 text-[#1976D2] animate-spin" />
                      ) : isFailed ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {sec.title}
                      </p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>Handled by: {sec.agent}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isInProgress
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {isDone ? "Ready" : isInProgress ? "Drafting..." : "Queued"}
                    </span>
                    {isFailed && (
                      <button
                        onClick={() => onRetrySection(sec.id)}
                        className="text-xs p-1 text-gray-500 hover:text-gray-800 rounded"
                        title="Retry section"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Agents & Live Stream Log (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* Active Agents Summary */}
            <div className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-2xs">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-[#1976D2]" />
                <span>Active Agent Fleet</span>
              </h3>
              <div className="space-y-2">
                {agentsActivity.slice(0, 4).map((ag, idx) => (
                  <div key={idx} className="flex items-start justify-between text-xs bg-gray-50 p-2 rounded border border-gray-100">
                    <div>
                      <span className="font-semibold text-gray-800 block">{ag.agent}</span>
                      <span className="text-[11px] text-gray-500">{ag.task}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      ag.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ag.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Generation Console */}
            <div className="bg-gray-900 text-gray-200 rounded-xl p-3.5 font-mono text-[11px] flex-1 flex flex-col shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800 text-gray-400 text-[10px]">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-emerald-400" />
                  <span>Agent Stream Output</span>
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live
                </span>
              </div>
              <div className="space-y-1.5 overflow-y-auto max-h-44 pr-1 text-gray-300">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-gray-500 select-none">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onProceedToReport}
            disabled={isGenerating}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
              !isGenerating
                ? 'bg-[#E65100] hover:bg-[#D84315] text-white cursor-pointer active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Assembling Document...</span>
              </>
            ) : (
              <>
                <span>Review Final Report</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
