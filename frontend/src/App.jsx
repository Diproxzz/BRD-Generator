import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import StepTracker from './components/StepTracker';
import Step1Upload from './components/Step1Upload';
import Step2Context from './components/Step2Context';
import Step3AgentRun from './components/Step3AgentRun';
import Step4FinalReport from './components/Step4FinalReport';
import AgentsDrawer from './components/AgentsDrawer';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [session, setSession] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [context, setContext] = useState(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [generationStatus, setGenerationStatus] = useState({});
  const [agentsActivity, setAgentsActivity] = useState([]);
  const [brdData, setBrdData] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [agentsDrawerOpen, setAgentsDrawerOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState({
    provider: "groq",
    groq_api_key: "",
    google_api_key: "",
    groq_model: "qwen/qwen3.8-27b"
  });

  // Initialize or fetch session on mount
  useEffect(() => {
    initSession();
  }, []);

  const initSession = async () => {
    try {
      const res = await fetch('/api/sessions/create', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSession(data);
        setActiveStep(data.active_step || 1);
        setFiles(data.files || []);
        setAgentsActivity(data.agents_activity || []);
      }
    } catch (err) {
      console.error("Failed to initialize session:", err);
      // Fallback local session state
      setSession({
        session_id: "38737295-c360-410c-8586-65c37c9f875a",
        use_case_id: "UC_DP_005"
      });
    }
  };

  // Upload files
  const handleUploadFiles = async (newFiles) => {
    if (!session) return;
    setIsLoading(true);
    const formData = new FormData();
    newFiles.forEach((file) => formData.append('files', file));

    try {
      const res = await fetch(`/api/sessions/${session.session_id}/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load sample project with 1-click
  const handleLoadSample = async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sessions/${session.session_id}/load-sample`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files);
      }
    } catch (err) {
      console.error("Load sample error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete file
  const handleDeleteFile = async (fileId) => {
    if (!session) return;
    try {
      const res = await fetch(`/api/sessions/${session.session_id}/files/${fileId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files);
      }
    } catch (err) {
      console.error("Delete file error:", err);
    }
  };

  // Step 1 -> Step 2: Start Workflow (Extract Context)
  const handleStartWorkflow = async () => {
    if (!session || files.length === 0) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sessions/${session.session_id}/extract-context`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setContext(data.context);
        setActiveStep(2);
      }
    } catch (err) {
      console.error("Extract context error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 -> Step 3: Run Generation Agents
  const handleRunAgents = async () => {
    if (!session) return;
    setIsLoading(true);
    setIsGenerating(true);
    setActiveStep(3);

    // First save the refined prompt
    try {
      await fetch(`/api/sessions/${session.session_id}/update-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_prompt: userPrompt, active_step: 3 })
      });

      // Trigger multi-agent drafting
      const res = await fetch(`/api/sessions/${session.session_id}/generate`, {
        method: 'POST'
      });

      if (res.ok) {
        const data = await res.json();
        setBrdData(data.brd_data);
        setGenerationStatus({
          project_overview: "completed",
          existing_processes: "completed",
          deliverables: "completed",
          appendix_and_signoff: "completed"
        });
      }
    } catch (err) {
      console.error("Generation error:", err);
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  // Save inline edits
  const handleSaveEdits = async (updatedBrdData) => {
    if (!session) return;
    try {
      const res = await fetch(`/api/sessions/${session.session_id}/sections`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brd_data: updatedBrdData })
      });
      if (res.ok) {
        const data = await res.json();
        setBrdData(data.brd_data);
      }
    } catch (err) {
      console.error("Error saving edits:", err);
    }
  };

  // Regenerate specific section
  const handleRegenerateSection = async (sectionKey, customInstruction) => {
    if (!session) return;
    try {
      const res = await fetch(`/api/sessions/${session.session_id}/regenerate-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_key: sectionKey,
          custom_instruction: customInstruction
        })
      });
      if (res.ok) {
        const data = await res.json();
        setBrdData(data.brd_data);
      }
    } catch (err) {
      console.error("Regenerate section error:", err);
    }
  };

  // Export .docx
  const handleExportDocx = async () => {
    if (!session) return;
    setIsExporting(true);
    try {
      const res = await fetch(`/api/sessions/${session.session_id}/export`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const projectName = brdData?.project_name || "Requirements_Document";
        a.download = `BRD_${projectName.replace(/\s+/g, '_')}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export DOCX error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Update AI provider config
  const handleSaveConfig = async (newConfig) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        setAiConfig(prev => ({ ...prev, ...newConfig }));
      }
    } catch (err) {
      console.error("Config update error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EFEB] text-gray-900 pb-16">
      {/* Top Bar matching screenshot */}
      <TopBar
        session={session}
        activeStep={activeStep}
        onStepChange={(step) => setActiveStep(step)}
        onOpenAgents={() => setAgentsDrawerOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
      />

      {/* 4-Step Tracker matching screenshot */}
      <StepTracker
        activeStep={activeStep}
        onStepClick={(stepId) => {
          // Allow clicking previous steps or steps with data
          if (stepId < activeStep || (stepId === 2 && context) || (stepId === 4 && brdData)) {
            setActiveStep(stepId);
          }
        }}
      />

      {/* Main Content Body for Active Step */}
      <main className="transition-all duration-300">
        {activeStep === 1 && (
          <Step1Upload
            files={files}
            onUploadFiles={handleUploadFiles}
            onDeleteFile={handleDeleteFile}
            onLoadSample={handleLoadSample}
            onStartWorkflow={handleStartWorkflow}
            onOpenAgents={() => setAgentsDrawerOpen(true)}
            isLoading={isLoading}
          />
        )}

        {activeStep === 2 && (
          <Step2Context
            context={context}
            userPrompt={userPrompt}
            onUpdatePrompt={(val) => setUserPrompt(val)}
            onContinue={handleRunAgents}
            onBack={() => setActiveStep(1)}
            isLoading={isLoading}
          />
        )}

        {activeStep === 3 && (
          <Step3AgentRun
            generationStatus={generationStatus}
            agentsActivity={agentsActivity}
            onProceedToReport={() => setActiveStep(4)}
            onRetrySection={(secId) => handleRegenerateSection(secId, "")}
            isGenerating={isGenerating}
          />
        )}

        {activeStep === 4 && (
          <Step4FinalReport
            brdData={brdData}
            onExportDocx={handleExportDocx}
            onSaveEdits={handleSaveEdits}
            onRegenerateSection={handleRegenerateSection}
            onBackToWorkflow={() => setActiveStep(3)}
            isExporting={isExporting}
          />
        )}
      </main>

      {/* Agents Drawer */}
      <AgentsDrawer
        isOpen={agentsDrawerOpen}
        onClose={() => setAgentsDrawerOpen(false)}
        onOpenSettings={() => setSettingsModalOpen(true)}
      />

      {/* AI Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        currentConfig={aiConfig}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
}
