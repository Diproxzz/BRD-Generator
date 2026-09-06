import React, { useState, useEffect } from 'react';
import { 
  Download, Edit3, Save, RefreshCw, CheckCircle2, FileText, 
  Layers, ShieldCheck, ArrowLeft, Loader2, Image as ImageIcon, Check, Bookmark, BookOpen
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

  useEffect(() => {
    if (brdData && Object.keys(brdData).length > 0) {
      setData(brdData);
    }
  }, [brdData]);
  const [selectedSectionKey, setSelectedSectionKey] = useState("deliverables");
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

  const versionHistory = data?.version_history || [
    ["0.1", data?.author || "Smriti Srivastava", "Updated Requirements, Features and User Stories"]
  ];

  const fileDetails = data?.file_details || [
    [`${(data?.project_name || 'Project').replace(/\s+/g, '_')}_BRD`, "Docx", "Requirements Vault"]
  ];

  const flowSteps = data?.process_flow_steps || [
    "1. The Business Analyst / TAP analyst navigates to the application on supported desktop browser (Edge / Chrome).",
    "2. On the home page, the user selects an existing project/deal folder or creates a new deal.",
    "3. User selects document type from the local drive and uploads source documents.",
    "4. The documents are uploaded to secure storage vault and queued for automated processing.",
    "5. The backend pipeline processes document text, schema validation, and vector embeddings.",
    "6. The system notifies the user via status indicator / email once document processing is complete.",
    "7. The user navigates to the interactive workspace to query records or execute ad-hoc validation.",
    "8. The user exports structured reports and generated requirements to CSV or styled .docx format."
  ];

  const inScopeFunc = data?.in_scope_functional || [
    { id: "4.1.1", title: "Multi-document type ingestion support", sub: ["a. ESA", "b. Contract & Leases", "c. CIM"] },
    { id: "4.1.2", title: "Pre-configured Analytical Question Sets (Canned Prompts)", sub: ["a. ESA (10)", "b. Contract & Leases (5)", "c. CIM (16)"] },
    { id: "4.1.3", title: "Ability to ask ad-hoc questions", sub: [] },
    { id: "4.1.4", title: "Download Q&A in CSV format", sub: [] },
    { id: "4.1.5", title: "Reference Source doc page numbers in response (accuracy in-line with POC)", sub: [] },
    { id: "4.1.6", title: "Accuracy of the answers (canned & ad-hoc) in-line with the POC", sub: [] },
    { id: "4.1.7", title: "Support only desktop browsers — Edge & Chrome (latest and latest-1 versions)", sub: [] }
  ];

  const inScopeNFR = data?.in_scope_nfr || [
    { id: "4.2.1", text: "Integration with Enterprise AD (Group based authentication)." },
    { id: "4.2.2", text: "Performance in-line with POC:\n  a. Doc Processing — 60 to 90 seconds (for 1 doc) based on doc complexity and length.\n  b. Answer — Up to 60 secs based on the complexity & length of the answer." },
    { id: "4.2.3", text: "Auditing, logging, and error handling will be enhanced to support the system." },
    { id: "4.2.4", text: "For monitoring Lockton can hook the logs into existing monitoring system." },
    { id: "4.2.5", text: "Application will be accessible to authorized corporate employee users within enterprise network only." },
    { id: "4.2.6", text: "Only allowed documents (<25MB) will be supported." }
  ];

  const outOfScope = data?.out_of_scope || [
    "5.1.1  New document types such as Cyber policies.",
    "5.1.2  New canned questions including prompt tuning for existing questions.",
    "5.1.3  Admin interface (configuration to be done manually via config files/DB).",
    "5.1.4  Multi-region provisioning of LLM (Azure OpenAI), including DR.",
    "5.1.5  Performance, Security & Automation testing in production.",
    "5.1.6  Support for mobile devices.",
    "5.1.7  Availability (to be handled in subsequent phases).",
    "5.1.8  Provisioning / configuration of CI/CD Pipeline.",
    "5.1.9  Workflow solution include Document based Authorization."
  ];

  const functionalEpics = data?.functional_epics || [
    {
      epic_id: "6.1",
      epic_title: "EPIC 1 - DASHBOARD PAGE",
      features: [
        {
          feature_id: "6.1.1",
          feature_title: "FEATURE 1: DEAL SUMMARY",
          user_stories: [
            {
              id: "6.1.1.1",
              title: "User Story 1: Ability to land on the Dashboard Page",
              description: "As a TAP analyst, I should be able to land on the Dashboard Page, so that I can view and select the required information therein.",
              acceptance_criteria: [
                "i. Verify that application redirects the user to the Dashboard Page after login."
              ],
              screenshot_ref: "[Reference Screenshot: Dashboard Navigation and Landing Page]"
            },
            {
              id: "6.1.1.2",
              title: "User Story 2: Ability to view all features on Dashboard Page",
              description: "As a TAP analyst, I should be able to view all features on the Dashboard Page, so that I can view and select the required information therein.",
              acceptance_criteria: [
                "i. Verify that application enables view of all features on the Dashboard Page as:",
                "   a. Deal Summary Table (Deal ID, Deal Name, Deal Generated By, Priority, Creation Time Stamp, Document Summary)",
                "   b. Search Bar",
                "   c. Refresh Button",
                "   d. Create New Deal Button",
                "   e. Pagination"
              ],
              screenshot_ref: "[Reference Screenshot: Deal Summary Table with Priority, Timestamp and Action Buttons]"
            },
            {
              id: "6.1.1.3",
              title: "User Story 3: Ability to filter from the Deal Summary table",
              description: "As a TAP analyst, I should be able to filter from the Deal Summary table, so that I can view and select the required information therein.",
              acceptance_criteria: [
                "i. Verify that application provides the ability to type the keyword based on search in the search bar.",
                "ii. Verify that the application provides the ability to search and filter from any of the Dashboard Page columns basis the keyword entered in the search bar."
              ],
              screenshot_ref: "[Reference Screenshot: Keyword Search & Filter Controls]"
            },
            {
              id: "6.1.1.4",
              title: "User Story 4: Ability to refresh the Deal Summary table",
              description: "As a TAP analyst, I should be able to refresh data in the Deal Summary table, so that I can view and select the required information therein.",
              acceptance_criteria: [
                "i. Verify that application provides the ability to refresh entries with data of deal entries created in the Deal Summary table.",
                "ii. Verify that application provides the ability to refresh entries with data of deal entries updated in the Deal Summary table."
              ],
              screenshot_ref: "[Reference Screenshot: Refresh Button & Active Spin State]"
            },
            {
              id: "6.1.1.5",
              title: "User Story 5: Ability to create new deal",
              description: "As a TAP analyst, I should be able to view and click on the 'Create New Deal' in the Deal Summary table, so that I can enter the required information therein.",
              acceptance_criteria: [
                "i. Verify that application provides the ability to view and click on the 'Create New Deal' button in the Deal Summary table.",
                "ii. Verify that application provides the ability to display a pop-up window on the click of 'Create New Deal' button, for entering the required information for creating a new deal."
              ],
              screenshot_ref: "[Reference Screenshot: Create New Deal Modal Dialog]"
            }
          ]
        }
      ]
    },
    {
      epic_id: "6.2",
      epic_title: "EPIC 2 - CHATBOT PAGE",
      features: [
        {
          feature_id: "6.2.1",
          feature_title: "FEATURE 1: CHATBOT FEATURES",
          user_stories: [
            {
              id: "6.2.1.1",
              title: "User Story 1: Ability to view all features on Chatbot Page",
              description: "As a TAP analyst, I should be able to view all features on the Chatbot Page, so that I can view and select the required information therein.",
              acceptance_criteria: [
                "i. Verify that application enables view of all features on the Chatbot Page as:",
                "   a. Chat box (Deal ID, Deal Name, Deal Generated By, Document Name, Document Type, Processing Status, Query Text box, Submit button)",
                "   b. Back option",
                "   c. Show History",
                "   d. Clear Chat",
                "   e. CSV Download",
                "   f. End Conversation",
                "   g. Question Tags",
                "   h. All FAQs",
                "ii. Verify that the application provides the ability to go back and initiate chat on a different document by clicking on the 'Back' option on the Chatbot page."
              ],
              screenshot_ref: "[Reference Screenshot: Chatbot Screen with Question Tags & Document Viewer]"
            }
          ]
        },
        {
          feature_id: "6.2.2",
          feature_title: "FEATURE 2: QUESTION TAGS TAB",
          user_stories: [
            {
              id: "6.2.2.1",
              title: "User Story 1: Ability to view and select question tags for document type",
              description: "As a TAP analyst, I should be able to view and select question tags for ESA document type on the Chatbot Page, so that I can get the required information therein.",
              acceptance_criteria: [
                "i. Verify that the application provides the ability to display the question tags for document type in the left navigation bar on the Chatbot page.",
                "ii. Verify that the question tags displayed in the left navigation bar on the Chatbot page are enabled for selection.",
                "iii. Verify that the selection of any question tag sends a pre-defined question in the chat box in the right panel of the Chatbot page.",
                "iv. Verify that the correct pre-defined question is displayed in the right panel for any selected question tag."
              ],
              screenshot_ref: "[Reference Screenshot: Question Tags Sidebar & Canned Prompt Matrix]"
            }
          ]
        }
      ]
    }
  ];

  const nfrEpics = data?.non_functional_epics || [
    {
      epic_id: "7.1",
      epic_title: "EPIC 1 - APPLICATION ACCESSIBILITY",
      features: [
        {
          title: "7.1.1 FEATURE 1: APPLICATION BROWSER",
          story_title: "7.1.1.1 User Story 1: Ability to navigate to application in a desktop browser",
          description: "User should be able to navigate to the application in a desktop browser.",
          acceptance: [
            "i. Verify that the application navigation is supported in the desktop browsers — Edge & Chrome in their latest and latest-1 version."
          ]
        },
        {
          title: "7.1.2 FEATURE 2: APPLICATION LOGIN",
          story_title: "7.1.2.1 User Story 1: Ability to integrate with Enterprise Active Directory",
          description: "Application should have the ability to authorize and authenticate user's login.",
          acceptance: [
            "i. Verify that application can integrate with Enterprise AD to validate group-based authentication through SSO login.",
            "ii. Verify that the application provides the ability to display an appropriate popup message for incorrect login (Azure AD SSO implementation).",
            "iii. Verify that the application redirects users to the SSO login page if not already authenticated.",
            "iv. Verify that only authorized users with Analyst role/persona are logged into application.",
            "v. Verify that users not with Analyst role/persona are unable to login ('Authentication failed for your login credentials.')."
          ]
        },
        {
          title: "7.1.3 FEATURE 3: APPLICATION SECURITY",
          story_title: "7.1.3.1 User Story 1: Ability to make application accessible within corporate network only",
          description: "Application should be accessible to enterprise employees within corporate environment only.",
          acceptance: [
            "i. Verify that the application provides the ability to be accessible to employees within environment only via network security rules implemented by cloud security team.",
            "ii. Verify that the application provides the ability to assess that each API has a valid token.",
            "iii. Verify that the application provides a mechanism to check token expiry."
          ]
        }
      ]
    },
    {
      epic_id: "7.2",
      epic_title: "EPIC 2 - EXCEPTION HANDLING",
      features: [
        {
          title: "7.2.1 FEATURE 1: DOCUMENT UPLOAD",
          story_title: "7.2.1.1 User Story 1: Document upload restrictions and validations",
          description: "Application should implement document upload restrictions and validations.",
          acceptance: [
            "i. Verify that any functionality broken in the application in any APIs and modules is handled through an exception handling mechanism, whereby error codes will be displayed with proper error messages to the front-end.",
            "ii. Verify that the application provides the ability to not allow files for upload which are not in supported format and displays an error message: 'Only supported files can be selected for upload'.",
            "iii. Verify that the application provides the ability to not allow files for upload which are >25MB in size and displays an error message: 'Only files <25MB can be selected for upload'.",
            "iv. Verify that the application only allows upload of max five documents in single request.",
            "v. Verify that files selected for upload should either be deleted or submitted for processing first."
          ]
        },
        {
          title: "7.2.2 FEATURE 2: DOCUMENT PROCESSING",
          story_title: "7.2.2.1 User Story 1: Document processing restrictions and validations",
          description: "Application should implement document processing restrictions and validations.",
          acceptance: [
            "i. Verify that any functionality broken in any APIs and modules is handled through exception handling with proper error messages.",
            "ii. Verify that the application provides the ability to not take more than 90 secs for each file submitted for processing based on complexity and length of document."
          ]
        }
      ]
    },
    {
      epic_id: "7.3",
      epic_title: "EPIC 3 - APPLICATION MONITORING",
      features: [
        {
          title: "7.3.1 FEATURE 1: AUDITING",
          story_title: "7.3.1.1 User Story 1: Audit logs for transactions",
          description: "Application should have audit logs for all key transactions while there will not be any UI screens to view the same and can be only retrieved through DB query.",
          acceptance: [
            "i. Verify that the state changes are captured in MongoDB/SQL for Document Upload timestamp, Document Processed Timestamp, Document Review completion Timestamp, Document Review Completed By."
          ]
        },
        {
          title: "7.3.2 FEATURE 2: LOGGING",
          story_title: "7.3.2.1 User Story 1: Application exception logging",
          description: "Application should have the ability to implement exception logging.",
          acceptance: [
            "i. Verify that the application provides the ability to have an appropriate logging mechanism if the application fails.",
            "ii. Verify that the application has logs in console in local or cloud monitoring service for debugging of the application."
          ]
        },
        {
          title: "7.3.3 FEATURE 3: MONITORING",
          story_title: "7.3.3.1 User Story 1: Application monitoring",
          description: "Application should have monitoring capability.",
          acceptance: [
            "i. Verify that the application provides health check probes and monitoring logs in centralized monitoring service."
          ]
        }
      ]
    }
  ];

  const refDocs = data?.reference_documents || [
    ["PROJECT SOW PPT", "Lockton_Unleash the Power of Generative AI.pptx"],
    ["CANNED QUESTIONS MATRIX", "Canned Questions.xlsx"],
    ["ARCHITECTURE SPECIFICATION", "Target_State_Architecture_v2.pdf"]
  ];

  const tocItems = [
    { title: "1   Version History", page: "4", level: 1, targetId: "section-1" },
    { title: "2   File Details", page: "4", level: 1, targetId: "section-2" },
    { title: "3   Functional Process Flow Diagram", page: "4", level: 1, targetId: "section-3" },
    { title: "4   In Scope Requirements", page: "5", level: 1, targetId: "section-4" },
    { title: "4.1   Functional Requirements", page: "5", level: 2, targetId: "section-4" },
    { title: "4.1.1   3 document types", page: "5", level: 3, targetId: "section-4" },
    { title: "4.1.2   Canned Questions", page: "5", level: 3, targetId: "section-4" },
    { title: "4.1.3   Ability to ask ad-hoc questions", page: "5", level: 3, targetId: "section-4" },
    { title: "4.1.4   Download Q&A in CSV format", page: "5", level: 3, targetId: "section-4" },
    { title: "4.1.5   Reference Source doc page numbers in response", page: "5", level: 3, targetId: "section-4" },
    { title: "4.1.6   Accuracy of the answers in-line with POC", page: "5", level: 3, targetId: "section-4" },
    { title: "4.1.7   Support only desktop browsers - Edge & Chrome", page: "5", level: 3, targetId: "section-4" },
    { title: "4.2   Non - Functional Requirements", page: "5", level: 2, targetId: "section-4" },
    { title: "4.2.1   Integration with Lockton AD (Group based authentication)", page: "5", level: 3, targetId: "section-4" },
    { title: "4.2.2   Performance in-line with POC", page: "5", level: 3, targetId: "section-4" },
    { title: "4.2.3   Auditing, logging, and error handling", page: "5", level: 3, targetId: "section-4" },
    { title: "4.2.4   Hook logs into existing monitoring system", page: "5", level: 3, targetId: "section-4" },
    { title: "4.2.5   Application accessible within enterprise env. only", page: "5", level: 3, targetId: "section-4" },
    { title: "4.2.6   Only PDF documents (<5MB) supported", page: "5", level: 3, targetId: "section-4" },
    { title: "5   Out Of Scope Requirements", page: "5", level: 1, targetId: "section-5" },
    { title: "5.1.1   New document types such as Cyber policies", page: "5", level: 2, targetId: "section-5" },
    { title: "5.1.2   New canned questions including prompt tuning", page: "5", level: 2, targetId: "section-5" },
    { title: "5.1.3   Admin interface (configuration via DB)", page: "5", level: 2, targetId: "section-5" },
    { title: "5.1.4   Multi-region provisioning of LLM (Azure OpenAI)", page: "5", level: 2, targetId: "section-5" },
    { title: "5.1.5   Performance, Security & Automation testing", page: "5", level: 2, targetId: "section-5" },
    { title: "5.1.6   Support for mobile devices", page: "5", level: 2, targetId: "section-5" },
    { title: "5.1.7   Availability (handled in subsequent phases)", page: "5", level: 2, targetId: "section-5" },
    { title: "5.1.8   Provisioning / configuration of CI/CD Pipeline", page: "5", level: 2, targetId: "section-5" },
    { title: "5.1.9   Workflow solution include Document based Auth", page: "5", level: 2, targetId: "section-5" },
    { title: "6   EPICS (Functional)", page: "6", level: 1, targetId: "section-6" },
    { title: "6.1   EPIC 1 - DASHBOARD PAGE", page: "6", level: 2, targetId: "section-6" },
    { title: "6.1.1   FEATURE 1: DEAL SUMMARY", page: "6", level: 3, targetId: "section-6" },
    { title: "6.1.2   FEATURE 2: DEAL DETAILS", page: "9", level: 3, targetId: "section-6" },
    { title: "6.1.3   FEATURE 3: CREATE NEW DEAL", page: "13", level: 3, targetId: "section-6" },
    { title: "6.1.4   FEATURE 4: DOCUMENT SUMMARY", page: "17", level: 3, targetId: "section-6" },
    { title: "6.2   EPIC 2 - CHATBOT PAGE", page: "21", level: 2, targetId: "section-6" },
    { title: "6.2.1   FEATURE 1: CHATBOT FEATURES", page: "21", level: 3, targetId: "section-6" },
    { title: "6.2.2   FEATURE 2: QUESTION TAGS TAB", page: "22", level: 3, targetId: "section-6" },
    { title: "6.2.3   FEATURE 3: ALL FAQS TAB", page: "24", level: 3, targetId: "section-6" },
    { title: "6.2.4   FEATURE 4: CHAT BOX", page: "24", level: 3, targetId: "section-6" },
    { title: "6.2.5   FEATURE 5: CHAT ACCESS OPTIONS", page: "24", level: 3, targetId: "section-6" },
    { title: "7   EPICS (Non-Functional)", page: "26", level: 1, targetId: "section-7" },
    { title: "7.1   EPIC 1 - APPLICATION ACCESSIBILITY", page: "26", level: 2, targetId: "section-7" },
    { title: "7.1.1   FEATURE 1: APPLICATION BROWSER", page: "26", level: 3, targetId: "section-7" },
    { title: "7.1.2   FEATURE 2: APPLICATION LOGIN", page: "26", level: 3, targetId: "section-7" },
    { title: "7.1.3   FEATURE 3: APPLICATION SECURITY", page: "26", level: 3, targetId: "section-7" },
    { title: "7.2   EPIC 2 - EXCEPTION HANDLING", page: "27", level: 2, targetId: "section-7" },
    { title: "7.2.1   FEATURE 1: DOCUMENT UPLOAD", page: "27", level: 3, targetId: "section-7" },
    { title: "7.2.2   FEATURE 2: DOCUMENT PROCESSING", page: "27", level: 3, targetId: "section-7" },
    { title: "7.2.3   FEATURE 3: QUERY RESPONSE TIMING", page: "28", level: 3, targetId: "section-7" },
    { title: "7.3   EPIC 3 - APPLICATION MONITORING", page: "28", level: 2, targetId: "section-7" },
    { title: "7.3.1   FEATURE 1: AUDITING", page: "28", level: 3, targetId: "section-7" },
    { title: "7.3.2   FEATURE 2: LOGGING", page: "28", level: 3, targetId: "section-7" },
    { title: "7.3.3   FEATURE 3: MONITORING", page: "29", level: 3, targetId: "section-7" },
    { title: "8   USER STORIES ALIGNMENT WITH POC", page: "29", level: 1, targetId: "section-8" },
    { title: "9   REFERENCE DOCUMENTS", page: "30", level: 1, targetId: "section-9" }
  ];

  return (
    <div className="mx-6 my-4">
      {/* Top Action Bar */}
      <div className="bg-[#E8E8E6]/80 rounded-2xl p-4 border border-gray-300/70 shadow-sm mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToWorkflow}
            className="p-1.5 rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 transition-colors cursor-pointer"
            title="Back to Agent step"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span>{data?.project_name || "Business Requirements Document"}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                v{data?.version || "0.1"} Corporate Ready
              </span>
            </h2>
            <p className="text-[11px] text-gray-500">
              Corporate BRD Format (Epics, Features, User Stories & Acceptance Criteria) • Downloadable .docx ready
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {savedSuccess && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Saved
            </span>
          )}

          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Changes</span>
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
            onClick={() => onExportDocx && onExportDocx(data)}
            disabled={isExporting}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#E65100] hover:bg-[#D84315] text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export Styled .DOCX</span>
          </button>
        </div>
      </div>

      {/* Sticky Document Outline & Index Navigation Bar */}
      <div className="sticky top-2 z-30 max-w-5xl mx-auto mb-4 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-gray-300/80 shadow-md flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-[#0A2A5C] flex items-center gap-1.5 mr-1 text-[11px] uppercase tracking-wider">
          <Bookmark className="w-3.5 h-3.5 text-[#0072CE]" />
          Index Jump:
        </span>
        <a
          href="#index-page"
          className="px-3 py-1 rounded-lg bg-[#0072CE] hover:bg-[#005ba3] text-white font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Table of Contents (Index Page)</span>
        </a>
        <a href="#section-1" className="px-2 py-1 rounded hover:bg-gray-100 text-gray-700 font-medium transition-colors">1. History</a>
        <a href="#section-2" className="px-2 py-1 rounded hover:bg-gray-100 text-gray-700 font-medium transition-colors">2. Files</a>
        <a href="#section-3" className="px-2 py-1 rounded hover:bg-gray-100 text-gray-700 font-medium transition-colors">3. Flow</a>
        <a href="#section-4" className="px-2 py-1 rounded hover:bg-gray-100 text-gray-700 font-medium transition-colors">4. In-Scope</a>
        <a href="#section-5" className="px-2 py-1 rounded hover:bg-gray-100 text-gray-700 font-medium transition-colors">5. Out-of-Scope</a>
        <a href="#section-6" className="px-2 py-1 rounded hover:bg-gray-100 text-gray-700 font-medium transition-colors">6. Functional Epics</a>
        <a href="#section-7" className="px-2 py-1 rounded hover:bg-gray-100 text-gray-700 font-medium transition-colors">7. NFR Epics</a>
        <a href="#section-8" className="px-2 py-1 rounded hover:bg-gray-100 text-gray-700 font-medium transition-colors">8. POC Alignment</a>
        <a href="#section-9" className="px-2 py-1 rounded hover:bg-gray-100 text-gray-700 font-medium transition-colors">9. References</a>
      </div>

      {/* Rendered Document View (Matching PDF Template Hierarchy) */}
      <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-300/80 shadow-md max-w-5xl mx-auto space-y-8 text-gray-800 font-sans">
        
        {/* Document Header & Title */}
        <div className="border-b-2 border-[#0A2A5C] pb-6 pt-2">
          <div className="flex justify-between items-start text-[11px] text-gray-500 font-medium mb-3">
            <span>&lt;Function Name&gt; &lt;Sub Function Name&gt; &lt;Name of Process&gt;</span>
            <span className="font-semibold text-[#0A2A5C]">Enterprise Business Solutions | LTIMindtree Format</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0A2A5C] tracking-tight">
            {data?.project_name || "Enterprise Copilot & Data Platform"}
          </h1>
          <div className="text-sm font-semibold text-[#0072CE] mt-1">
            Business Requirements Document (BRD)
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
            <div><span className="font-semibold text-gray-800">Version:</span> {data?.version || "0.1"}</div>
            <div><span className="font-semibold text-gray-800">Date:</span> {data?.date || "2026-09-06"}</div>
            <div><span className="font-semibold text-gray-800">Author:</span> {data?.author || "Lead Business Analyst"}</div>
            <div><span className="font-semibold text-gray-800">Status:</span> Updated Requirements, Features & User Stories</div>
          </div>
        </div>

        {/* DEDICATED INDEX PAGE (Table of Contents matching Page 2 & Page 3 of PDF) */}
        <section id="index-page" className="scroll-mt-16 bg-[#FAFBFD] border-2 border-[#0A2A5C]/30 rounded-2xl p-6 md:p-8 shadow-sm space-y-4 relative">
          {/* Running Corporate Header matching PDF */}
          <div className="flex justify-between items-center text-[11px] text-gray-500 border-b border-gray-200 pb-2.5 font-medium">
            <span>&lt;Function/ Name&gt; &lt;Sub Function Name&gt; &lt;Name of Process&gt; | (Ver. 2.1/2026)</span>
            <span className="font-extrabold text-[#0A2A5C] text-xs tracking-tight">LTIMindtree</span>
          </div>

          <div className="flex flex-wrap items-center justify-between border-b-2 border-[#0A2A5C] pb-2 pt-1">
            <div>
              <h2 className="text-2xl font-black text-[#0A2A5C] tracking-tight">
                Table of Contents (Index Page)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Corporate Standard Requirements Hierarchy • Page 2 of 30
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-[#0072CE] border border-blue-300 shadow-2xs">
              📄 Dedicated Index Page
            </span>
          </div>

          <div className="space-y-1 font-sans pt-1">
            {tocItems.map((item, idx) => (
              <a
                key={idx}
                href={`#${item.targetId}`}
                className={`flex items-baseline text-xs group hover:bg-blue-50/70 py-1 px-1.5 rounded transition-colors cursor-pointer ${
                  item.level === 1
                    ? 'font-bold text-[#0A2A5C] pt-2'
                    : item.level === 2
                    ? 'font-medium text-[#1E3A8A] pl-5'
                    : 'text-gray-700 pl-10'
                }`}
              >
                <span className="shrink-0 group-hover:text-[#0072CE] transition-colors">{item.title}</span>
                <span className="flex-1 mx-2 border-b-2 border-dotted border-gray-300 select-none min-w-[20px]" />
                <span className="shrink-0 font-mono text-gray-600 font-bold px-1.5 py-0.5 rounded group-hover:bg-blue-200/60 group-hover:text-[#0072CE] transition-colors">
                  {item.page}
                </span>
              </a>
            ))}
          </div>

          {/* Running Corporate Footer matching PDF */}
          <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-200 pt-2.5 font-medium">
            <span>LTIMindtree | Privileged and Confidential 2026</span>
            <span>Page 2 of 30</span>
          </div>
        </section>

        {/* 1. VERSION HISTORY */}
        <section id="section-1" className="scroll-mt-16">
          <h2 className="text-base font-bold text-[#0A2A5C] border-b pb-1.5 mb-3 flex items-center gap-2">
            <span>1  Version History</span>
          </h2>
          <table className="w-full text-xs text-left border-collapse border border-gray-200">
            <thead className="bg-[#F0F4F8] text-[#0A2A5C] font-bold">
              <tr>
                <th className="border border-gray-300 p-2 w-1/5">Version No.</th>
                <th className="border border-gray-300 p-2 w-1/3">Updated By</th>
                <th className="border border-gray-300 p-2">Updates</th>
              </tr>
            </thead>
            <tbody>
              {versionHistory.map((rev, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 font-mono font-medium">{rev[0]}</td>
                  <td className="border border-gray-300 p-2 font-medium">{rev[1]}</td>
                  <td className="border border-gray-300 p-2">{rev[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 2. FILE DETAILS */}
        <section id="section-2" className="scroll-mt-16">
          <h2 className="text-base font-bold text-[#0A2A5C] border-b pb-1.5 mb-3">
            2  File Details
          </h2>
          <table className="w-full text-xs text-left border-collapse border border-gray-200">
            <thead className="bg-[#F0F4F8] text-[#0A2A5C] font-bold">
              <tr>
                <th className="border border-gray-300 p-2 w-2/5">File Name</th>
                <th className="border border-gray-300 p-2 w-1/5">File Format</th>
                <th className="border border-gray-300 p-2 w-2/5">File Location</th>
              </tr>
            </thead>
            <tbody>
              {fileDetails.map((f, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 font-mono">{f[0]}</td>
                  <td className="border border-gray-300 p-2">{f[1]}</td>
                  <td className="border border-gray-300 p-2 text-blue-600 underline cursor-pointer">{f[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 3. FUNCTIONAL PROCESS FLOW DIAGRAM */}
        <section id="section-3" className="scroll-mt-16 space-y-3">
          <h2 className="text-base font-bold text-[#0A2A5C] border-b pb-1.5 mb-2">
            3  Functional Process Flow Diagram
          </h2>
          <div className="bg-[#F8FAFC] border border-blue-200 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-[#0072CE] uppercase tracking-wider">
              MVP to Production | User Flow
            </h3>
            <div className="space-y-1.5 text-xs text-gray-700">
              {flowSteps.map((step, idx) => (
                <p key={idx} className="leading-relaxed">
                  <span className="font-semibold text-[#0A2A5C]">{step.substring(0, 3)}</span>
                  {step.substring(3)}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* 4. IN SCOPE REQUIREMENTS */}
        <section id="section-4" className="scroll-mt-16 space-y-4">
          <h2 className="text-base font-bold text-[#0A2A5C] border-b pb-1.5 mb-2">
            4  In Scope Requirements
          </h2>

          {/* 4.1 Functional Requirements */}
          <div>
            <h3 className="text-sm font-bold text-[#0072CE] mb-2">4.1 Functional Requirements</h3>
            <div className="space-y-2 text-xs">
              {inScopeFunc.map((req, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="font-semibold text-gray-900">
                    <span className="text-[#0A2A5C] font-mono mr-1.5">{req.id}</span>
                    {req.title}
                  </p>
                  {req.sub && req.sub.length > 0 && (
                    <div className="pl-6 space-y-0.5 text-gray-600">
                      {req.sub.map((s, sIdx) => (
                        <p key={sIdx}>{s}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4.2 Non-Functional Requirements */}
          <div>
            <h3 className="text-sm font-bold text-[#0072CE] mb-2">4.2 Non-Functional Requirements</h3>
            <div className="space-y-2 text-xs">
              {inScopeNFR.map((nfr, idx) => (
                <div key={idx}>
                  <p className="text-gray-800 whitespace-pre-line">
                    <span className="text-[#0A2A5C] font-mono font-semibold mr-1.5">{nfr.id}</span>
                    {nfr.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. OUT OF SCOPE REQUIREMENTS */}
        <section id="section-5" className="scroll-mt-16">
          <h2 className="text-base font-bold text-[#0A2A5C] border-b pb-1.5 mb-2">
            5  Out Of Scope Requirements
          </h2>
          <div className="space-y-1 text-xs text-gray-700">
            {outOfScope.map((item, idx) => (
              <p key={idx} className="leading-relaxed">
                <span className="text-red-500 mr-1.5 font-bold">✕</span>
                {item}
              </p>
            ))}
          </div>
        </section>

        {/* 6. EPICS (FUNCTIONAL) */}
        <section id="section-6" className="scroll-mt-16 space-y-6">
          <h2 className="text-base font-bold text-[#0A2A5C] border-b pb-1.5 mb-2">
            6  EPICS (Functional)
          </h2>

          {functionalEpics.map((epic, eIdx) => (
            <div key={eIdx} className="space-y-4">
              <h3 className="text-sm font-bold text-[#0A2A5C] uppercase tracking-wide bg-blue-50/60 p-2 rounded border border-blue-100">
                {epic.epic_id} {epic.epic_title}
              </h3>

              {epic.features?.map((feat, fIdx) => (
                <div key={fIdx} className="pl-3 space-y-3 border-l-2 border-[#0072CE]">
                  <h4 className="text-xs font-bold text-[#0072CE] uppercase">
                    {feat.feature_id} {feat.feature_title}
                  </h4>

                  {feat.user_stories?.map((story, sIdx) => (
                    <div key={sIdx} className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200/90 space-y-2 text-xs">
                      <h5 className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-[#0A2A5C] bg-white px-1.5 py-0.5 rounded border border-gray-200">
                          {story.id}
                        </span>
                        <span>{story.title}</span>
                      </h5>

                      {/* Description */}
                      <div className="pl-2">
                        <span className="font-semibold text-gray-700 block text-[11px] uppercase tracking-wider mb-0.5">
                          {story.id}.1 Description
                        </span>
                        <p className="text-gray-700 italic leading-relaxed">
                          "{story.description}"
                        </p>
                      </div>

                      {/* Acceptance Criteria */}
                      <div className="pl-2 pt-1">
                        <span className="font-semibold text-gray-700 block text-[11px] uppercase tracking-wider mb-0.5">
                          {story.id}.2 Acceptance Criteria
                        </span>
                        <div className="space-y-1 text-gray-800">
                          {story.acceptance_criteria?.map((ac, acIdx) => (
                            <p key={acIdx} className="whitespace-pre-line pl-2">
                              {ac}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Reference Screenshot Callout */}
                      {story.screenshot_ref && (
                        <div className="mt-2 bg-white border border-blue-200 rounded-lg p-2.5 flex items-center gap-2 text-xs text-[#0072CE]">
                          <ImageIcon className="w-4 h-4 shrink-0 text-blue-500" />
                          <span className="font-medium text-[11px]">{story.screenshot_ref}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </section>

        {/* 7. EPICS (NON-FUNCTIONAL) */}
        <section id="section-7" className="scroll-mt-16 space-y-6">
          <h2 className="text-base font-bold text-[#0A2A5C] border-b pb-1.5 mb-2">
            7  EPICS (Non-Functional)
          </h2>

          {nfrEpics.map((epic, eIdx) => (
            <div key={eIdx} className="space-y-3">
              <h3 className="text-sm font-bold text-[#0A2A5C] uppercase tracking-wide bg-blue-50/60 p-2 rounded border border-blue-100">
                {epic.epic_id} {epic.epic_title}
              </h3>

              {epic.features?.map((feat, fIdx) => (
                <div key={fIdx} className="pl-3 space-y-2 border-l-2 border-emerald-500">
                  <h4 className="text-xs font-bold text-gray-900">
                    {feat.title}
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-1.5 text-xs">
                    <p className="font-semibold text-[#0072CE]">{feat.story_title}</p>
                    <p className="text-gray-700 italic">"{feat.description}"</p>
                    <div className="pt-1">
                      <span className="font-semibold text-gray-700 block text-[11px] uppercase mb-0.5">
                        Acceptance Criteria
                      </span>
                      {feat.acceptance?.map((ac, acIdx) => (
                        <p key={acIdx} className="text-gray-800 pl-2 leading-relaxed">
                          {ac}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </section>

        {/* 8. USER STORIES ALIGNMENT WITH POC */}
        <section id="section-8" className="scroll-mt-16 space-y-3">
          <h2 className="text-base font-bold text-[#0A2A5C] border-b pb-1.5 mb-2">
            8  USER STORIES ALIGNMENT WITH POC
          </h2>
          <div className="bg-[#F8FAFC] border border-blue-200 rounded-xl p-4 text-xs text-gray-700 leading-relaxed">
            <p className="font-semibold text-[#0A2A5C] mb-1">Traceability & POC Verification</p>
            <p>
              All functional epics, deal features, and chatbot question tags specified above have been mapped and validated against the exploratory Proof of Concept (POC) baseline. Acceptance criteria maintain parity with demonstrated response timings (&lt;90 seconds for document parsing and &lt;60 seconds for complex query generation) while strictly preserving source document page citations and desktop browser support.
            </p>
          </div>
        </section>

        {/* 9. REFERENCE DOCUMENTS */}
        <section id="section-9" className="scroll-mt-16">
          <h2 className="text-base font-bold text-[#0A2A5C] border-b pb-1.5 mb-3">
            9  REFERENCE DOCUMENTS
          </h2>
          <table className="w-full text-xs text-left border-collapse border border-gray-200">
            <thead className="bg-[#F0F4F8] text-[#0A2A5C] font-bold">
              <tr>
                <th className="border border-gray-300 p-2 w-1/2">TOPIC</th>
                <th className="border border-gray-300 p-2 w-1/2">REFERENCE DOCUMENT</th>
              </tr>
            </thead>
            <tbody>
              {refDocs.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 font-semibold text-[#0A2A5C]">{row[0]}</td>
                  <td className="border border-gray-300 p-2 text-gray-700 font-mono text-[11px]">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  <option value="deliverables">6 & 7. EPICS (Functional & Non-Functional User Stories)</option>
                  <option value="existing_processes">4. In Scope & Flow Overview</option>
                  <option value="project_overview">1 & 2. Version History & File Details</option>
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
                  placeholder="e.g. Add 3 more user stories for document processing, or expand exception handling criteria..."
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 text-gray-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-5">
              <button
                onClick={() => setRegenModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerate}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#E65100] hover:bg-[#D84315] text-white shadow-sm cursor-pointer"
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
