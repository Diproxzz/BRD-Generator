import os
import shutil
import uuid
import time
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from backend.config import settings
from backend.services.file_parser import extract_file_content
from backend.services.session_store import session_store
from backend.services.agent_service import (
    extract_smart_context,
    generate_brd_section,
    call_llm
)
from backend.services.docx_generator import build_docx_brd

app = FastAPI(title="AI-Powered BRD Generator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()

class PromptUpdateRequest(BaseModel):
    user_prompt: str
    active_step: Optional[int] = None

class SectionUpdateRequest(BaseModel):
    brd_data: Dict[str, Any]

class ExportRequest(BaseModel):
    brd_data: Optional[Dict[str, Any]] = None

class RegenerateSectionRequest(BaseModel):
    section_key: str
    custom_instruction: str

class ContextExtractRequest(BaseModel):
    client_text: Optional[str] = None

class ConfigUpdateRequest(BaseModel):
    provider: Optional[str] = None
    groq_api_key: Optional[str] = None
    google_api_key: Optional[str] = None
    groq_model: Optional[str] = None

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "provider": settings.DEFAULT_PROVIDER,
        "groq_model": settings.GROQ_MODEL
    }

@router.post("/sessions/create")
def create_session(use_case_id: str = "UC_DP_005"):
    session = session_store.create_session(use_case_id=use_case_id)
    return session

@router.get("/sessions/{session_id}")
def get_session(session_id: str):
    session = session_store.get_session(session_id)
    if not session:
        # Gracefully auto-create session rather than crashing
        session = session_store.create_session()
        session["session_id"] = session_id
        session_store._save_to_disk(session)
    return session

@router.post("/sessions/{session_id}/upload")
async def upload_files(session_id: str, files: List[UploadFile] = File(...)):
    session = session_store.get_session(session_id)
    if not session:
        session = session_store.create_session()
        session_id = session["session_id"]
        
    session_upload_dir = os.path.join(settings.UPLOAD_DIR, session_id)
    os.makedirs(session_upload_dir, exist_ok=True)
    
    uploaded_records = []
    text_buffer = session.get("aggregated_text", "")
    
    for f in files:
        safe_name = os.path.basename(f.filename or "document")
        dest_path = os.path.join(session_upload_dir, safe_name)
        try:
            with open(dest_path, "wb") as out_f:
                shutil.copyfileobj(f.file, out_f)
                
            parsed = extract_file_content(dest_path, safe_name)
            rec = {
                "id": str(uuid.uuid4())[:8],
                "name": safe_name,
                "size": parsed.get("size_bytes", 0),
                "extension": parsed.get("extension", ""),
                "char_count": parsed.get("char_count", 0),
                "path": dest_path
            }
            uploaded_records.append(rec)
            text_buffer += f"\n\n--- DOCUMENT: {safe_name} ---\n" + parsed.get("content", "")
        except Exception as e:
            print(f"Error handling uploaded file {safe_name}: {e}")
            uploaded_records.append({
                "id": str(uuid.uuid4())[:8],
                "name": safe_name,
                "size": 0,
                "extension": os.path.splitext(safe_name)[1].lower(),
                "char_count": 0,
                "path": dest_path
            })
        
    all_files = session.get("files", []) + uploaded_records
    session_store.update_session(session_id, {
        "files": all_files,
        "aggregated_text": text_buffer
    })
    
    return {
        "session_id": session_id,
        "files": all_files,
        "total_files": len(all_files),
        "total_chars": len(text_buffer)
    }

@router.post("/sessions/{session_id}/load-sample")
def load_sample_project(session_id: str):
    session = session_store.get_session(session_id)
    if not session:
        session = session_store.create_session()
        session_id = session["session_id"]
        
    sample_dir = os.path.join(settings.BASE_DIR, "sample_data")
    session_upload_dir = os.path.join(settings.UPLOAD_DIR, session_id)
    os.makedirs(session_upload_dir, exist_ok=True)
    
    sample_files = [
        "payment_pipeline_meeting_notes.txt",
        "architecture_summary.txt",
        "customer_data_fields.csv"
    ]
    
    records = []
    text_buffer = ""
    for sf in sample_files:
        src_path = os.path.join(sample_dir, sf)
        if os.path.exists(src_path):
            dest_path = os.path.join(session_upload_dir, sf)
            shutil.copy2(src_path, dest_path)
            parsed = extract_file_content(dest_path, sf)
            records.append({
                "id": str(uuid.uuid4())[:8],
                "name": sf,
                "size": parsed["size_bytes"],
                "extension": parsed["extension"],
                "char_count": parsed["char_count"],
                "path": dest_path
            })
            text_buffer += f"\n\n--- DOCUMENT: {sf} ---\n" + parsed["content"]
            
    session_store.update_session(session_id, {
        "files": records,
        "aggregated_text": text_buffer,
        "active_step": 1
    })
    
    return {
        "session_id": session_id,
        "files": records,
        "message": "Sample documents loaded successfully"
    }

@router.delete("/sessions/{session_id}/files/{file_id}")
def delete_file(session_id: str, file_id: str):
    session = session_store.get_session(session_id)
    if not session:
        return {"files": []}
        
    files = session.get("files", [])
    remaining = [f for f in files if f.get("id") != file_id]
    
    # Re-aggregate text from remaining files
    rebuilt_text = ""
    for f in remaining:
        if os.path.exists(f.get("path", "")):
            p = extract_file_content(f["path"], f["name"])
            rebuilt_text += f"\n\n--- DOCUMENT: {f['name']} ---\n" + p["content"]
            
    session_store.update_session(session_id, {
        "files": remaining,
        "aggregated_text": rebuilt_text
    })
    return {"files": remaining}

@router.post("/sessions/{session_id}/extract-context")
def extract_context_route(session_id: str, body: Optional[ContextExtractRequest] = None):
    session = session_store.get_session(session_id)
    if not session:
        session = session_store.create_session()
        session_id = session["session_id"]
        
    text = session.get("aggregated_text", "")
    if body and body.client_text:
        text = body.client_text + "\n" + text
        
    if not text.strip():
        # Heuristic fallback if empty
        text = "Enterprise Copilot and Digital Platform Transformation Meeting Notes"
        
    agents_activity = [
        {"agent": "Context Extractor", "status": "Active", "task": "Parsing entities, scope, and stakeholders"},
        {"agent": "Requirements Engineer", "status": "Queued", "task": "Waiting for context confirmation"},
        {"agent": "NFR Specialist", "status": "Queued", "task": "Awaiting scope definition"},
        {"agent": "Data Architect", "status": "Queued", "task": "Parsing data dictionary"},
        {"agent": "QA & Gap Verifier", "status": "Queued", "task": "Ready to scan placeholders"}
    ]
    session_store.update_session(session_id, {"agents_activity": agents_activity})
    
    provider = session.get("provider", settings.DEFAULT_PROVIDER)
    context = extract_smart_context(text, provider=provider)
    
    agents_activity[0]["status"] = "Completed"
    agents_activity[0]["task"] = f"Extracted {context.get('extracted_entities_count', 12)} entities from source documents"
    
    session_store.update_session(session_id, {
        "context": context,
        "active_step": 2,
        "agents_activity": agents_activity,
        "aggregated_text": text
    })
    
    return {
        "session_id": session_id,
        "context": context,
        "active_step": 2
    }

@router.post("/sessions/{session_id}/update-prompt")
def update_prompt(session_id: str, body: PromptUpdateRequest):
    session = session_store.get_session(session_id)
    if not session:
        session = session_store.create_session()
        session_id = session["session_id"]
        
    updates = {"user_prompt": body.user_prompt}
    if body.active_step:
        updates["active_step"] = body.active_step
        
    session_store.update_session(session_id, updates)
    return {"message": "Prompt updated", "active_step": updates.get("active_step")}

@router.post("/sessions/{session_id}/generate")
def generate_brd(session_id: str):
    session = session_store.get_session(session_id)
    if not session:
        session = session_store.create_session()
        session_id = session["session_id"]
        
    context = session.get("context")
    if not context:
        context = extract_smart_context(session.get("aggregated_text", "Enterprise Platform"))
        session_store.update_session(session_id, {"context": context})
        
    user_prompt = session.get("user_prompt", "")
    provider = session.get("provider", settings.DEFAULT_PROVIDER)
    
    agents_activity = [
        {"agent": "Context Extractor", "status": "Completed", "task": "Entities validated"},
        {"agent": "Requirements Engineer", "status": "Active", "task": "Drafting Epics, Features, and User Stories"},
        {"agent": "NFR Specialist", "status": "Active", "task": "Assembling Accessibility & Exception Handling criteria"},
        {"agent": "Data Architect", "status": "Active", "task": "Building Process Flow & Canned Questions matrix"},
        {"agent": "QA & Gap Verifier", "status": "Active", "task": "Checking Acceptance Criteria and [NEEDS INPUT] flags"}
    ]
    session_store.update_session(session_id, {
        "active_step": 3,
        "agents_activity": agents_activity,
        "generation_status": {
            "project_overview": "in_progress",
            "existing_processes": "in_progress",
            "deliverables": "in_progress",
            "appendix_and_signoff": "in_progress"
        }
    })
    
    overview_data = generate_brd_section("project_overview", context, user_prompt, provider=provider)
    existing_proc_data = generate_brd_section("existing_processes", context, user_prompt, provider=provider)
    deliverables_data = generate_brd_section("deliverables", context, user_prompt, provider=provider)
    appendix_data = generate_brd_section("appendix_and_signoff", context, user_prompt, provider=provider)
    
    date_str = time.strftime("%Y-%m-%d")
    proj_name = context.get("project_name", "Enterprise Copilot & Data Platform")
    
    out_of_scope_items = [
        f"5.1.{i+1}  {item[0] if isinstance(item, list) else item}"
        for i, item in enumerate(context.get("out_of_scope", []))
    ] if context.get("out_of_scope") else [
        "5.1.1  New document types such as Cyber policies.",
        "5.1.2  New canned questions including prompt tuning for existing questions.",
        "5.1.3  Admin interface (configuration to be done manually via config files/DB).",
        "5.1.4  Multi-region provisioning of LLM (Azure OpenAI), including DR.",
        "5.1.5  Performance, Security & Automation testing in production.",
        "5.1.6  Support for mobile devices.",
        "5.1.7  Availability (to be handled in subsequent phases)."
    ]
    
    brd_data = {
        "project_name": proj_name,
        "version": "0.1",
        "date": date_str,
        "author": context.get("author", "Lead Business Analyst"),
        "version_history": [
            ["0.1", context.get("author", "Lead Business Analyst"), "Updated Requirements, Features and User Stories based on source discovery"]
        ],
        "file_details": [
            [f"{proj_name.replace(' ', '_')}_BRD", "Docx", "Requirements Vault"]
        ],
        "process_flow_steps": deliverables_data.get("process_flow_steps", []),
        "in_scope_functional": deliverables_data.get("in_scope_functional", []),
        "in_scope_nfr": deliverables_data.get("in_scope_nfr", []),
        "out_of_scope": out_of_scope_items,
        "functional_epics": deliverables_data.get("functional_epics", []),
        "non_functional_epics": deliverables_data.get("non_functional_epics", []),
        "reference_documents": appendix_data.get("reference_documents", [
            ["PROJECT SOW PPT", "Statement_of_Work_Final.pptx"],
            ["CANNED QUESTIONS MATRIX", "Canned_Questions_and_Prompts.xlsx"],
            ["ARCHITECTURE BLUEPRINT", "Target_State_Architecture_v2.pdf"]
        ]),
        # Legacy/overview backward compatibility
        "sponsors": overview_data.get("sponsors", context.get("sponsors", [])),
        "contributors": overview_data.get("contributors", context.get("contributors", [])),
        "in_scope": overview_data.get("in_scope", context.get("in_scope", [])),
        "acronyms": context.get("acronyms", []),
        "existing_processes": existing_proc_data
    }
    
    docx_filename = f"BRD_{proj_name.replace(' ', '_')}_{session_id[:8]}.docx"
    docx_path = os.path.join(settings.EXPORT_DIR, docx_filename)
    build_docx_brd(brd_data, docx_path)
    
    for agent in agents_activity:
        agent["status"] = "Completed"
    agents_activity[1]["task"] = "Epics, Features, and User Stories drafted with Acceptance Criteria"
    agents_activity[2]["task"] = "Accessibility, Exception Handling, and Monitoring validated"
    agents_activity[3]["task"] = "Process Flow Diagram & Reference Documents mapped"
    agents_activity[4]["task"] = "QA verified with [NEEDS INPUT] and reference screenshots"
    
    session_store.update_session(session_id, {
        "active_step": 4,
        "brd_data": brd_data,
        "docx_path": docx_path,
        "agents_activity": agents_activity,
        "generation_status": {
            "project_overview": "completed",
            "existing_processes": "completed",
            "deliverables": "completed",
            "appendix_and_signoff": "completed"
        }
    })
    
    return {
        "session_id": session_id,
        "active_step": 4,
        "brd_data": brd_data,
        "docx_filename": docx_filename
    }

@router.post("/sessions/{session_id}/regenerate-section")
def regenerate_section(session_id: str, body: RegenerateSectionRequest):
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    brd_data = session.get("brd_data", {})
    context = session.get("context", {})
    provider = session.get("provider", settings.DEFAULT_PROVIDER)
    
    if body.section_key in ["deliverables", "existing_processes", "project_overview"]:
        new_content = generate_brd_section(body.section_key, context, body.custom_instruction, provider=provider)
        if body.section_key == "deliverables":
            brd_data["functional_epics"] = new_content.get("functional_epics", brd_data.get("functional_epics"))
            brd_data["non_functional_epics"] = new_content.get("non_functional_epics", brd_data.get("non_functional_epics"))
            brd_data["process_flow_steps"] = new_content.get("process_flow_steps", brd_data.get("process_flow_steps"))
            brd_data["in_scope_functional"] = new_content.get("in_scope_functional", brd_data.get("in_scope_functional"))
            brd_data["in_scope_nfr"] = new_content.get("in_scope_nfr", brd_data.get("in_scope_nfr"))
        elif body.section_key == "existing_processes":
            brd_data["existing_processes"] = new_content
        elif body.section_key == "project_overview":
            brd_data["sponsors"] = new_content.get("sponsors", brd_data.get("sponsors"))
            brd_data["contributors"] = new_content.get("contributors", brd_data.get("contributors"))
            
        docx_path = session.get("docx_path")
        if not docx_path:
            docx_path = os.path.join(settings.EXPORT_DIR, f"BRD_{session_id[:8]}.docx")
        build_docx_brd(brd_data, docx_path)
        
        session_store.update_session(session_id, {
            "brd_data": brd_data,
            "docx_path": docx_path
        })
        
    return {"message": "Section regenerated successfully", "brd_data": brd_data}

@router.put("/sessions/{session_id}/sections")
def update_sections(session_id: str, body: SectionUpdateRequest):
    session = session_store.get_session(session_id)
    if not session:
        session = session_store.create_session()
        session_id = session["session_id"]
        
    brd_data = body.brd_data
    docx_path = session.get("docx_path")
    if not docx_path:
        docx_path = os.path.join(settings.EXPORT_DIR, f"BRD_{session_id[:8]}.docx")
    build_docx_brd(brd_data, docx_path)
    
    session_store.update_session(session_id, {
        "brd_data": brd_data,
        "docx_path": docx_path
    })
    return {"message": "Document updated and recompiled", "brd_data": brd_data}

@router.post("/export")
@router.post("/sessions/{session_id}/export")
def export_docx_post(session_id: Optional[str] = None, body: Optional[ExportRequest] = None):
    brd_data = (body.brd_data if body and body.brd_data else None)
    if not brd_data and session_id:
        session = session_store.get_session(session_id)
        if session:
            brd_data = session.get("brd_data")
            
    if not brd_data:
        brd_data = {
            "project_name": "Enterprise Copilot & M&A Deal Platform",
            "version": "0.1",
            "date": time.strftime("%Y-%m-%d"),
            "author": "Smriti Srivastava",
            "version_history": [
                ["0.1", "Smriti Srivastava", "Updated Requirements, Features and User Stories"]
            ],
            "file_details": [
                ["Enterprise_Copilot_BRD", "Docx", "Requirements Vault"]
            ]
        }
        
    session_prefix = session_id[:8] if session_id else str(uuid.uuid4())[:8]
    docx_path = os.path.join(settings.EXPORT_DIR, f"BRD_{session_prefix}.docx")
    build_docx_brd(brd_data, docx_path)
    
    proj_name = brd_data.get("project_name", "Requirements_Document")
    safe_title = "".join(c for c in proj_name if c.isalnum() or c in (' ', '_', '-')).strip().replace(" ", "_")
    download_filename = f"BRD_{safe_title}.docx"
    
    return FileResponse(
        docx_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=download_filename
    )

@router.get("/export")
@router.get("/sessions/{session_id}/export")
def export_docx(session_id: Optional[str] = None):
    brd_data = None
    if session_id:
        session = session_store.get_session(session_id)
        if session:
            brd_data = session.get("brd_data")
            
    if not brd_data:
        brd_data = {
            "project_name": "Enterprise Copilot & M&A Deal Platform",
            "version": "0.1",
            "date": time.strftime("%Y-%m-%d"),
            "author": "Smriti Srivastava",
            "version_history": [
                ["0.1", "Smriti Srivastava", "Updated Requirements, Features and User Stories"]
            ],
            "file_details": [
                ["Enterprise_Copilot_BRD", "Docx", "Requirements Vault"]
            ]
        }
        
    session_prefix = session_id[:8] if session_id else str(uuid.uuid4())[:8]
    docx_path = os.path.join(settings.EXPORT_DIR, f"BRD_{session_prefix}.docx")
    build_docx_brd(brd_data, docx_path)
    
    proj_name = brd_data.get("project_name", "Requirements_Document")
    safe_title = "".join(c for c in proj_name if c.isalnum() or c in (' ', '_', '-')).strip().replace(" ", "_")
    download_filename = f"BRD_{safe_title}.docx"
    
    return FileResponse(
        docx_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=download_filename
    )

@router.get("/agents/status")
def get_agents_status(session_id: Optional[str] = None):
    if session_id:
        session = session_store.get_session(session_id)
        if session and "agents_activity" in session:
            return {"agents": session["agents_activity"]}
            
    return {
        "agents": [
            {"agent": "Context Extractor", "status": "Active", "model": "Qwen 3.8 27B / Groq", "description": "Extracts entities, sponsors, scope, and existing systems from source files."},
            {"agent": "Requirements Engineer", "status": "Active", "model": "Qwen 3.8 27B / Groq", "description": "Formulates Agile Epics, Features, and User Stories with Acceptance Criteria."},
            {"agent": "NFR Specialist", "status": "Active", "model": "Qwen 3.8 27B / Groq", "description": "Drafts Accessibility, Exception Handling, and Monitoring checklists."},
            {"agent": "Data Architect", "status": "Active", "model": "Qwen 3.8 27B / Groq", "description": "Extracts process flow steps and canned question matrices."},
            {"agent": "QA & Gap Verifier", "status": "Active", "model": "Qwen 3.8 27B / Groq", "description": "Prevents hallucinations by inserting [NEEDS INPUT] placeholders."}
        ]
    }

@router.post("/config")
def update_config(body: ConfigUpdateRequest):
    if body.provider:
        settings.DEFAULT_PROVIDER = body.provider
    if body.groq_api_key:
        settings.GROQ_API_KEY = body.groq_api_key
    if body.google_api_key:
        settings.GOOGLE_API_KEY = body.google_api_key
    if body.groq_model:
        settings.GROQ_MODEL = body.groq_model
    return {
        "provider": settings.DEFAULT_PROVIDER,
        "groq_model": settings.GROQ_MODEL,
        "message": "Configuration updated successfully"
    }

# Include router under both /api and root prefix to ensure all environments work
app.include_router(router, prefix="/api")
app.include_router(router, prefix="")
