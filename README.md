# AI-Powered BRD Generator Web App

An enterprise-grade, agentic Business Requirements Document (BRD) generator designed specifically for **Business Analysts (BAs)**. The application ingests raw project artifacts (meeting transcripts, architecture diagrams, emails, requirement dumps, spreadsheets) and automatically generates a fully formatted, corporate-standard `.docx` BRD matching top enterprise consulting templates.

## Highlights & Features

- **Instant Optimistic File Upload**: Immediately previews uploaded file chips with names, sizes, and extensions. Extracts text client-side and syncs seamlessly with backend storage.
- **Pixel-Accurate Workflow UI**: Replicates the 4-stage guided workflow (Upload Input &rarr; Smart Context & Prompt &rarr; Dynamic & Action Agent &rarr; Final Report).
- **Agile Epics & User Stories BRD Structure**:
  - **1. Version History**: Version No., Updated By, Updates table
  - **2. File Details**: File Name, File Format, File Location table
  - **3. Functional Process Flow Diagram**: MVP to Production sequential User Flow steps (1-8)
  - **4. In Scope Requirements**: Functional requirements breakdown & Non-Functional criteria (AD SSO, Response latency 60-90s, file limits <25MB)
  - **5. Out of Scope Requirements**: Numbered boundary list
  - **6. EPICS (Functional)**: Divided into Epics (Dashboard Page, Chatbot Page, etc.) with Features and **User Stories** (`As a <Role>, I should be able to...`), numbered **Acceptance Criteria** (`i. Verify that...`), and Reference Screenshot wireframes.
  - **7. EPICS (Non-Functional)**: Application Accessibility (Browser, Login/SSO, Security), Exception Handling (Upload restrictions, Processing timeouts), Application Monitoring (Auditing state changes in DB, Logging, Telemetry).
  - **8. Reference Documents**: TOPIC | REFERENCE DOCUMENT table
- **Free AI Engine**: Powered by Groq (`qwen/qwen3.8-27b`) and Google Gemini.
- **Corporate DOCX Export**: Real `.docx` styled with deep navy headers, bordered tables, and formatted acceptance criteria callouts.

---

## Quick Start

```powershell
# Start Backend
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

# Start Frontend
cd frontend
npm run dev
```

Open `http://localhost:5173`.
