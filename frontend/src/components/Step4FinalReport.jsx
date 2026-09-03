import React, { useState } from 'react';
import { 
  Download, Edit3, Save, RefreshCw, CheckCircle2, FileText, 
  ExternalLink, Layers, ShieldCheck, AlertTriangle, ArrowLeft, Loader2 
} from 'lucide-react';

export default function Step4FinalReport({ 
  brdData, 
  onExportDocx, 
  onSaveEdits, 
  onRegenerateSection, 
  onBackToWorkflow,
  isExporting = false 
}) {
  const [data, setData] = useState(brdData || {});
  const [isEditing, setIsEditing] = useState(false);
  const [regenModalOpen, setRegenModalOpen] = useState(false);
  const [selectedSectionKey, setSelectedSectionKey] = useState("project_overview");
  const [customInstruction, setCustomInstruction] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSaveEdits(data);
    setIsSaving(false);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRegenerate = async () => {
    setRegenModalOpen(false);
    await onRegenerateSection(selectedSectionKey, customInstruction);
  };

  // Safe table data helpers
  const sponsors = data?.sponsors || [];
  const contributors = data?.contributors || [];
  const inScope = data?.in_scope || [];
  const outOfScope = data?.out_of_scope || [];
  const acronyms = data?.acronyms || [];
  const existingProc = data?.existing_processes || {};
  const deliverables = data?.deliverables || [];
  const signOff = data?.sign_off || [];
  const appendix = data?.appendix || {};

  return (
    <div className="mx-6 my-4">
      {/* Top Action Bar */}
      <div className="bg-[#E8E8E6]/80 rounded-2xl p-4 border border-gray-300/70 shadow-sm mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToWorkflow}
            className="p-1.5 rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 transition-colors"
            title="Back to Agent step"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span>{data?.project_name || "Business Requirements Document"}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                v{data?.version || "1.0"} Ready
              </span>
            </h2>
            <p className="text-[11px] text-gray-500">
              Generated following Corporate BRD Standard • Styled Word (.docx) ready
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {savedSuccess && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Document Saved
            </span>
          )}

          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save & Recompile</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-gray-600" />
              <span>Enable Inline Edit</span>
            </button>
          )}

          <button
            onClick={() => setRegenModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
            <span>Regenerate Section</span>
          </button>

          <button
            onClick={onExportDocx}
            disabled={isExporting}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#E65100] hover:bg-[#D84315] text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export Styled .DOCX</span>
          </button>
        </div>
      </div>

      {/* Rendered Document View (Reproducing Section 6 Template Hierarchy) */}
      <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-300/80 shadow-md max-w-5xl mx-auto space-y-8 text-gray-800 font-sans">
        
        {/* COVER / TITLE BLOCK */}
        <div className="border-b-2 border-[#1A365D] pb-8 pt-4">
          <div className="text-xs font-bold uppercase tracking-widest text-[#3182CE] mb-2">
            Business Requirements Document (BRD)
          </div>
          <h1 className="text-3xl font-extrabold text-[#1A365D] tracking-tight">
            {data?.project_name || "Enterprise Data Pipeline"}
          </h1>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
            <div><span className="font-semibold text-gray-800">Version:</span> {data?.version || "1.0"}</div>
            <div><span className="font-semibold text-gray-800">Date:</span> {data?.date || "2026-09-03"}</div>
            <div><span className="font-semibold text-gray-800">Author:</span> {data?.author || "Lead Business Analyst"}</div>
            <div><span className="font-semibold text-gray-800">Status:</span> Approved for Review</div>
          </div>
        </div>

        {/* 1. REVISION HISTORY */}
        <section>
          <h2 className="text-lg font-bold text-[#1A365D] border-b pb-1.5 mb-3">
            1. Revision History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-gray-200">
              <thead className="bg-[#EDF2F7] text-[#1A365D] font-bold">
                <tr>
                  <th className="border border-gray-300 p-2">Version Number</th>
                  <th className="border border-gray-300 p-2">Date</th>
                  <th className="border border-gray-300 p-2">Author</th>
                  <th className="border border-gray-300 p-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {data?.revision_history?.map((rev, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-mono font-medium">{rev[0]}</td>
                    <td className="border border-gray-300 p-2">{rev[1]}</td>
                    <td className="border border-gray-300 p-2">{rev[2]}</td>
                    <td className="border border-gray-300 p-2">{rev[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. PROJECT OVERVIEW */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#1A365D] border-b pb-1.5 mb-3">
            2. Project Overview
          </h2>

          {/* 2.1 Project Sponsors */}
          <div>
            <h3 className="text-sm font-bold text-[#3182CE] mb-2">2.1 Project Sponsor(s)</h3>
            <table className="w-full text-xs text-left border-collapse border border-gray-200 max-w-2xl">
              <thead className="bg-[#EDF2F7] text-[#1A365D] font-bold">
                <tr>
                  <th className="border border-gray-300 p-2 w-1/2">Name</th>
                  <th className="border border-gray-300 p-2 w-1/2">Job Title</th>
                </tr>
              </thead>
              <tbody>
                {sponsors.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-medium">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row[0]}
                          onChange={(e) => {
                            const newSponsors = [...sponsors];
                            newSponsors[idx][0] = e.target.value;
                            setData({ ...data, sponsors: newSponsors });
                          }}
                          className="w-full border rounded px-1.5 py-0.5"
                        />
                      ) : (
                        <span className={row[0].includes("[NEEDS INPUT") ? "text-amber-600 font-semibold" : ""}>
                          {row[0]}
                        </span>
                      )}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row[1]}
                          onChange={(e) => {
                            const newSponsors = [...sponsors];
                            newSponsors[idx][1] = e.target.value;
                            setData({ ...data, sponsors: newSponsors });
                          }}
                          className="w-full border rounded px-1.5 py-0.5"
                        />
                      ) : (
                        row[1]
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2.2 Contributors */}
          <div>
            <h3 className="text-sm font-bold text-[#3182CE] mb-2">2.2 Project Contributors (A–Z)</h3>
            <table className="w-full text-xs text-left border-collapse border border-gray-200">
              <thead className="bg-[#EDF2F7] text-[#1A365D] font-bold">
                <tr>
                  <th className="border border-gray-300 p-2">Name</th>
                  <th className="border border-gray-300 p-2">Job Title</th>
                  <th className="border border-gray-300 p-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {contributors.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-medium">{row[0]}</td>
                    <td className="border border-gray-300 p-2">{row[1]}</td>
                    <td className="border border-gray-300 p-2">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2.3 In Scope */}
          <div>
            <h3 className="text-sm font-bold text-[#3182CE] mb-2">2.3 In Scope (Deliverables)</h3>
            <table className="w-full text-xs text-left border-collapse border border-gray-200">
              <thead className="bg-[#EDF2F7] text-[#1A365D] font-bold">
                <tr>
                  <th className="border border-gray-300 p-2">Title</th>
                </tr>
              </thead>
              <tbody>
                {inScope.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2">{Array.isArray(row) ? row[0] : row}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2.4 Out of Scope */}
          <div>
            <h3 className="text-sm font-bold text-[#3182CE] mb-2">2.4 Out of Scope</h3>
            <table className="w-full text-xs text-left border-collapse border border-gray-200">
              <thead className="bg-[#EDF2F7] text-[#1A365D] font-bold">
                <tr>
                  <th className="border border-gray-300 p-2 w-1/3">Title</th>
                  <th className="border border-gray-300 p-2 w-2/3">Reason for Exclusion</th>
                </tr>
              </thead>
              <tbody>
                {outOfScope.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-medium">{Array.isArray(row) ? row[0] : row}</td>
                    <td className="border border-gray-300 p-2 text-gray-600">{Array.isArray(row) ? row[1] : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. ACRONYMS */}
        <section>
          <h2 className="text-lg font-bold text-[#1A365D] border-b pb-1.5 mb-3">
            3. Common Project Acronyms, Names, and Descriptions
          </h2>
          <table className="w-full text-xs text-left border-collapse border border-gray-200">
            <thead className="bg-[#EDF2F7] text-[#1A365D] font-bold">
              <tr>
                <th className="border border-gray-300 p-2 w-1/4">Name</th>
                <th className="border border-gray-300 p-2 w-3/4">Description</th>
              </tr>
            </thead>
            <tbody>
              {acronyms.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 font-mono font-bold text-[#1A365D]">{row[0]}</td>
                  <td className="border border-gray-300 p-2 text-gray-700">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 4. EXISTING PROCESSES */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#1A365D] border-b pb-1.5 mb-3">
            4. Existing Processes
          </h2>
          <div>
            <h3 className="text-sm font-bold text-[#3182CE]">4.1 Summary Process Narrative</h3>
            <p className="text-xs text-gray-700 mt-1 leading-relaxed">{existingProc?.summary}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#3182CE]">4.2 Timing</h3>
            <p className="text-xs text-gray-700 mt-1">{existingProc?.timing}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#3182CE]">4.3 Volume</h3>
            <p className="text-xs text-gray-700 mt-1">{existingProc?.volume}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#3182CE]">4.4 Screenshots</h3>
            <p className="text-xs text-gray-700 mt-1">{existingProc?.screenshots}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#3182CE]">4.5 Problems</h3>
            <p className="text-xs text-gray-700 mt-1 text-red-700 bg-red-50 p-2 rounded border border-red-100">
              {existingProc?.problems}
            </p>
          </div>
        </section>

        {/* 5. PROJECT REQUIREMENTS */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold text-[#1A365D] border-b pb-1.5 mb-3">
            5. Project Requirements
          </h2>

          {deliverables.map((deliv, dIdx) => (
            <div key={dIdx} className="space-y-4 border-l-2 border-[#3182CE] pl-4">
              <h3 className="text-base font-bold text-[#1A365D]">
                5.{dIdx + 1} {deliv.title}
              </h3>

              {/* 5.x.1 Process Overview */}
              <div className="space-y-1.5 bg-gray-50/70 p-3 rounded-lg border border-gray-200">
                <h4 className="text-xs font-bold text-[#3182CE]">5.{dIdx + 1}.1 Process Overview</h4>
                <div className="text-xs text-gray-700 space-y-1">
                  <p><span className="font-semibold text-gray-900">• Summary:</span> {deliv.process_overview?.summary}</p>
                  <p><span className="font-semibold text-gray-900">• Flow Diagram:</span> <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 text-[11px]">{deliv.process_overview?.flow_diagram}</span></p>
                  <p><span className="font-semibold text-gray-900">• Trigger & Pre-Conditions:</span> {deliv.process_overview?.trigger}</p>
                  <p><span className="font-semibold text-gray-900">• Timing:</span> {deliv.process_overview?.timing}</p>
                  <p><span className="font-semibold text-gray-900">• Volume:</span> {deliv.process_overview?.volume}</p>
                  <p><span className="font-semibold text-gray-900">• Post-Conditions & Outcomes:</span> {deliv.process_overview?.outcomes}</p>
                </div>
              </div>

              {/* 5.x.2 Functional Requirements (PREQ/CREQ/GCREQ) */}
              <div>
                <h4 className="text-xs font-bold text-[#3182CE] mb-2">
                  5.{dIdx + 1}.2 Functional Requirements (PREQ / CREQ / GCREQ)
                </h4>
                <div className="space-y-1.5">
                  {deliv.functional_requirements?.map((req, rIdx) => {
                    const isParent = req.level === "PREQ";
                    const isChild = req.level === "CREQ";
                    const isGrandchild = req.level === "GCREQ";

                    return (
                      <div 
                        key={rIdx} 
                        className={`text-xs flex items-start gap-2 ${
                          isParent ? 'font-semibold text-gray-900 pl-0' :
                          isChild ? 'text-gray-800 pl-4' : 'text-gray-700 pl-8'
                        }`}
                      >
                        <span className="font-mono text-[11px] text-[#1A365D] shrink-0 bg-gray-100 px-1.5 py-0.5 rounded">
                          {req.id}
                        </span>
                        <span className="pt-0.5">{req.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5.x.3 Non-Functional Requirements */}
              <div>
                <h4 className="text-xs font-bold text-[#3182CE] mb-2">
                  5.{dIdx + 1}.3 Non-Functional Requirements
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {deliv.non_functional_requirements && Object.entries(deliv.non_functional_requirements).map(([key, val], nIdx) => (
                    <div key={nIdx} className="bg-white p-2.5 rounded border border-gray-200">
                      <span className="font-bold text-[#1A365D] block mb-0.5">{key}:</span>
                      <span className="text-gray-600 text-[11px]">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5.x.4 Data Requirements Table */}
              {deliv.data_requirements && deliv.data_requirements.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#3182CE] mb-2">
                    5.{dIdx + 1}.4 Data Requirements
                  </h4>
                  <table className="w-full text-xs text-left border-collapse border border-gray-200">
                    <thead className="bg-[#EDF2F7] text-[#1A365D] font-bold">
                      <tr>
                        <th className="border border-gray-300 p-2">Data Field Name</th>
                        <th className="border border-gray-300 p-2">Description</th>
                        <th className="border border-gray-300 p-2">Editable</th>
                        <th className="border border-gray-300 p-2">Mandatory</th>
                        <th className="border border-gray-300 p-2">Predefined Value(s)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliv.data_requirements.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 font-mono font-medium">{row[0]}</td>
                          <td className="border border-gray-300 p-2">{row[1]}</td>
                          <td className="border border-gray-300 p-2 text-center">{row[2]}</td>
                          <td className="border border-gray-300 p-2 text-center">{row[3]}</td>
                          <td className="border border-gray-300 p-2 font-mono text-[11px]">{row[4]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Risks and Assumptions */}
              {deliv.risks_and_assumptions && deliv.risks_and_assumptions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#3182CE] mb-2">
                    5.{dIdx + 1}.5 Known Issues, Assumptions, Risks & Dependencies
                  </h4>
                  <table className="w-full text-xs text-left border-collapse border border-gray-200">
                    <thead className="bg-[#EDF2F7] text-[#1A365D] font-bold">
                      <tr>
                        <th className="border border-gray-300 p-2 w-1/4">Type</th>
                        <th className="border border-gray-300 p-2 w-3/4">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliv.risks_and_assumptions.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 font-bold text-gray-800">{row[0]}</td>
                          <td className="border border-gray-300 p-2 text-gray-600">{row[1]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* 6. SIGN OFF */}
        <section>
          <h2 className="text-lg font-bold text-[#1A365D] border-b pb-1.5 mb-3">
            6. Sign off
          </h2>
          <table className="w-full text-xs text-left border-collapse border border-gray-200">
            <thead className="bg-[#EDF2F7] text-[#1A365D] font-bold">
              <tr>
                <th className="border border-gray-300 p-2 w-1/2">Project Role</th>
                <th className="border border-gray-300 p-2 w-1/4">Signature</th>
                <th className="border border-gray-300 p-2 w-1/4">Date</th>
              </tr>
            </thead>
            <tbody>
              {signOff.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 font-semibold text-gray-800">{row[0]}</td>
                  <td className="border border-gray-300 p-2 font-mono text-gray-400">{row[1]}</td>
                  <td className="border border-gray-300 p-2 text-gray-600">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 7. APPENDIX */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#1A365D] border-b pb-1.5 mb-3">
            7. Appendix
          </h2>
          <div>
            <h3 className="text-sm font-bold text-[#3182CE]">7.1 Mock-ups</h3>
            <p className="text-xs text-gray-700 mt-1">{appendix?.mockups}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#3182CE]">7.2 Glossary</h3>
            <p className="text-xs text-gray-700 mt-1">{appendix?.glossary}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#3182CE]">7.3 Business Rules and Procedures</h3>
            <p className="text-xs text-gray-700 mt-1 whitespace-pre-line">{appendix?.business_rules}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#3182CE]">7.4 Document References</h3>
            <table className="w-full text-xs text-left border-collapse border border-gray-200 mt-2">
              <thead className="bg-[#EDF2F7] text-[#1A365D] font-bold">
                <tr>
                  <th className="border border-gray-300 p-2 w-1/2">Title</th>
                  <th className="border border-gray-300 p-2 w-1/2">Location</th>
                </tr>
              </thead>
              <tbody>
                {appendix?.references?.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-medium">{row[0]}</td>
                    <td className="border border-gray-300 p-2 text-gray-600 font-mono text-[11px]">{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* Regenerate Section Modal */}
      {regenModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#E65100]" />
              <span>Regenerate Specific Section</span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Select which BRD section to redraft with specialized instructions.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Target Section
                </label>
                <select
                  value={selectedSectionKey}
                  onChange={(e) => setSelectedSectionKey(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white text-gray-800"
                >
                  <option value="project_overview">2. Project Overview & Scope</option>
                  <option value="existing_processes">4. Existing Processes</option>
                  <option value="deliverables">5. Project Requirements (PREQ/CREQ & NFRs)</option>
                  <option value="appendix_and_signoff">6 & 7. Sign-off & Appendix</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Custom BA Instructions
                </label>
                <textarea
                  rows={3}
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  placeholder="e.g. Expand on error codes and retry logic, or add 3 more NFR constraints..."
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 text-gray-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-5">
              <button
                onClick={() => setRegenModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerate}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#E65100] hover:bg-[#D84315] text-white shadow-sm"
              >
                Regenerate Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
