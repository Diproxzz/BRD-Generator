# AI-Powered BRD Generator Web App

An enterprise-grade, agentic Business Requirements Document (BRD) generator designed specifically for **Business Analysts (BAs)**. The application ingests raw project artifacts (meeting transcripts, architecture diagrams, emails, requirement dumps, spreadsheets) and automatically generates a fully formatted, corporate-standard `.docx` BRD.

![BRD Generator Workflow](frontend/public/workflow-preview.png)

## Highlights & Features

- **Pixel-Accurate Workflow UI**: Replicates the 4-stage guided workflow (Upload Input &rarr; Smart Context & Prompt &rarr; Dynamic & Action Agent &rarr; Final Report) matching the corporate template layout.
- **Multi-Format Ingestion**: Supports `.docx`, `.pdf`, `.xlsx`, `.csv`, `.txt`, and images (`.png`/`.jpg` with OCR).
- **Free & Ultra-Fast AI Engine**:
  - **Groq API**: Powered by `qwen/qwen3.8-27b` and `openai/gpt-oss-120b` for sub-second generation.
  - **Google Gemini API**: Configured with `gemini-2.5-flash` as a secondary engine.
  - **Intelligent Fallback**: 100% offline resilience ensures workflow never fails even if offline.
- **Hierarchical Requirement Numbering**:
  - `PREQ`: Parent Requirement
  - `CREQ`: Child Requirement
  - `GCREQ`: Grandchild Requirement
- **Anti-Hallucination Safeguard**: Missing information is flagged with `[NEEDS INPUT: <field>]` placeholders rather than fabricating facts.
- **Real Styled Word Export (`.docx`)**:
  - Generates downloadable Microsoft Word documents with custom corporate color palette (Navy & Slate), styled tables with borders and shaded headers, and standard Heading 1-4 levels for automatic Table of Contents generation.
- **Active Agents Fleet**:
  - *Context Extractor Agent*: Mines stakeholders, scope boundaries, and systems.
  - *Requirements Engineer Agent*: Structures PREQ/CREQ logic.
  - *NFR Specialist Agent*: Formulates the 8 corporate non-functional pillars.
  - *Data Architect Agent*: Compiles schema dictionaries and risk matrices.
  - *QA & Gap Verifier*: Guarantees template compliance.

---

## BRD Corporate Template Hierarchy (Section 6)

```text
[Cover] Project Name — Business Requirements Document
1. Revision History (table: Version Number | Date | Author | Description)
2. Project Overview
   2.1 Project Sponsor(s)              (table: Name | Job Title)
   2.2 Project Contributors (A–Z)      (table: Name | Job Title | Role)
   2.3 In Scope (Deliverables)         (table: Title)
   2.4 Out of Scope                    (table: Title | Reason for Exclusion)
3. Common Project Acronyms, Names, and Descriptions (table: Name | Description)
4. Existing Processes
   4.1 Summary Process Narrative
   4.2 Timing
   4.3 Volume
   4.4 Screenshots / Flow references
   4.5 Problems
5. Project Requirements
   5.1 <Deliverable Title>
       5.1.1 Process Overview (Summary, Flow Diagram, Trigger, Timing, Volume, Outcomes)
       5.1.2 Functional Requirements (PREQ / CREQ / GCREQ numbered list)
       5.1.3 Non-Functional Requirements (Availability, Compatibility, Extensibility, Maintainability, Scalability, Security, Usability, Performance)
       5.1.4 Data Requirements (table: Data Field Name | Description | Editable | Mandatory Field | Predefined Value(s))
             - Known Issues/Assumptions/Risks/Dependencies (table: Type | Description)
   5.2 <repeat 5.1 per additional deliverable>
6. Sign off (table: Project Role | Signature | Date)
7. Appendix (Mock-ups, Glossary, Business Rules, Document References table)
```

---

## Quick Start

### 1. Launch the Application
Simply double-click `start_app.bat` or run:

```powershell
# Terminal 1 - Backend
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Access the Web App
Open your browser at **`http://localhost:5173`**.

### 3. Test Workflow with 1-Click
1. Click **"Load Sample Project (Payment Pipeline)"** on the upload dropzone.
2. Click **"Start Workflow"** &rarr; Review extracted entities in **Step 2**.
3. Click **"Run Generation Agents"** &rarr; Watch live multi-agent drafting in **Step 3**.
4. Review, inline edit, and click **"Export Styled .DOCX"** in **Step 4**!
