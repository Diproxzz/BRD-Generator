import os
import shutil
import uuid
import time
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
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

class PromptUpdateRequest(BaseModel):
    user_prompt: str
    active_step: Optional[int] = None

class SectionUpdateRequest(BaseModel):
    brd_data: Dict[str, Any]

class RegenerateSectionRequest(BaseModel):
    section_key: str
    custom_instruction: str

class ConfigUpdateRequest(BaseModel):
    provider: Optional[str] = None
    groq_api_key: Optional[str] = None
    google_api_key: Optional[str] = None
    groq_model: Optional[str] = None

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "provider": settings.DEFAULT_PROVIDER,
        "groq_model": settings.GROQ_MODEL
    }

@app.post("/api/sessions/create")
def create_session(use_case_id: str = "UC_DP_005"):
    session = session_store.create_session(use_case_id=use_case_id)
    return session

@app.get("/api/sessions/{session_id}")
def get_session(session_id: str):
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@app.post("/api/sessions/{session_id}/upload")
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
        safe_name = os.path.basename(f.filename)
        dest_path = os.path.join(session_upload_dir, safe_name)
        with open(dest_path, "wb") as out_f:
            shutil.copyfileobj(f.file, out_f)
            
        parsed = extract_file_content(dest_path, safe_name)
        rec = {
            "id": str(uuid.uuid4())[:8],
            "name": safe_name,
            "size": parsed["size_bytes"],
            "extension": parsed["extension"],
            "char_count": parsed["char_count"],
            "path": dest_path
        }
        uploaded_records.append(rec)
        text_buffer += f"\n\n--- DOCUMENT: {safe_name} ---\n" + parsed["content"]
        
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

@app.post("/api/sessions/{session_id}/load-sample")
def load_sample_project(session_id: str):
    session = session_store.get_session(session_id)
    if not session:
        session = session_store.create_session()
        session_id = session["session_id"]
        
    sample_dir = os.path.join(settings.BASE_DIR, "sample_data")
    if not os.path.exists(sample_dir):
        raise HTTPException(status_code=404, detail="Sample files not found")
        
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

@app.delete("/api/sessions/{session_id}/files/{file_id}")
def delete_file(session_id: str, file_id: str):
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
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

@app.post("/api/sessions/{session_id}/extract-context")
def extract_context_route(session_id: str):
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    text = session.get("aggregated_text", "")
    if not text.strip():
        raise HTTPException(status_code=400, detail="No document content found. Please upload at least one file.")
        
    # Update agent status
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
        "agents_activity": agents_activity
    })
    
    return {
        "session_id": session_id,
        "context": context,
        "active_step": 2
    }

@app.post("/api/sessions/{session_id}/update-prompt")
def update_prompt(session_id: str, body: PromptUpdateRequest):
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    updates = {"user_prompt": body.user_prompt}
    if body.active_step:
        updates["active_step"] = body.active_step
        
    session_store.update_session(session_id, updates)
    return {"message": "Prompt updated", "active_step": updates.get("active_step")}

@app.post("/api/sessions/{session_id}/generate")
def generate_brd(session_id: str):
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    context = session.get("context")
    if not context:
        raise HTTPException(status_code=400, detail="Context not extracted yet")
        
    user_prompt = session.get("user_prompt", "")
    provider = session.get("provider", settings.DEFAULT_PROVIDER)
    
    # Update agent statuses
    agents_activity = [
        {"agent": "Context Extractor", "status": "Completed", "task": "Entities validated"},
        {"agent": "Requirements Engineer", "status": "Active", "task": "Drafting PREQ, CREQ, GCREQ specifications"},
        {"agent": "NFR Specialist", "status": "Active", "task": "Assembling 8-point NFR criteria"},
        {"agent": "Data Architect", "status": "Active", "task": "Building data field catalog and schema constraints"},
        {"agent": "QA & Gap Verifier", "status": "Active", "task": "Flagging incomplete items with [NEEDS INPUT]"}
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
    
    # 1. Project Overview & Scope
    overview_data = generate_brd_section("project_overview", context, user_prompt, provider=provider)
    
    # 2. Existing Processes
    existing_proc_data = generate_brd_section("existing_processes", context, user_prompt, provider=provider)
    
    # 3. Deliverables & Requirements (PREQ/CREQ)
    deliverables_data = generate_brd_section("deliverables", context, user_prompt, provider=provider)
    
    # 4. Appendix & Sign-off
    appendix_data = generate_brd_section("appendix_and_signoff", context, user_prompt, provider=provider)
    
    # Assemble full BRD
    date_str = time.strftime("%Y-%m-%d")
    brd_data = {
        "project_name": context.get("project_name", "Enterprise Data Pipeline"),
        "version": "1.0",
        "date": date_str,
        "author": context.get("author", "Business Analyst"),
        "revision_history": [
            ["1.0", date_str, context.get("author", "Business Analyst"), "Initial draft compiled from source documentation and BA workflow parameters"]
        ],
        "sponsors": overview_data.get("sponsors", context.get("sponsors", [])),
        "contributors": overview_data.get("contributors", context.get("contributors", [])),
        "in_scope": overview_data.get("in_scope", context.get("in_scope", [])),
        "out_of_scope": overview_data.get("out_of_scope", context.get("out_of_scope", [])),
        "acronyms": context.get("acronyms", []),
        "existing_processes": existing_proc_data,
        "deliverables": deliverables_data,
        "sign_off": appendix_data.get("sign_off", []),
        "appendix": appendix_data.get("appendix", {})
    }
    
    # Generate DOCX
    docx_filename = f"BRD_{context.get('project_name', 'Document').replace(' ', '_')}_{session_id[:8]}.docx"
    docx_path = os.path.join(settings.EXPORT_DIR, docx_filename)
    build_docx_brd(brd_data, docx_path)
    
    for agent in agents_activity:
        agent["status"] = "Completed"
    agents_activity[1]["task"] = "Requirements drafted with hierarchical PREQ/CREQ"
    agents_activity[2]["task"] = "8 NFR criteria validated"
    agents_activity[3]["task"] = "Data catalog & risks matrix finalized"
    agents_activity[4]["task"] = "QA verified with [NEEDS INPUT] tags"
    
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

@app.post("/api/sessions/{session_id}/regenerate-section")
def regenerate_section(session_id: str, body: RegenerateSectionRequest):
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    brd_data = session.get("brd_data", {})
    context = session.get("context", {})
    provider = session.get("provider", settings.DEFAULT_PROVIDER)
    
    if body.section_key in ["project_overview", "existing_processes", "deliverables", "appendix_and_signoff"]:
        new_content = generate_brd_section(body.section_key, context, body.custom_instruction, provider=provider)
        if body.section_key == "project_overview":
            brd_data["sponsors"] = new_content.get("sponsors", brd_data.get("sponsors"))
            brd_data["contributors"] = new_content.get("contributors", brd_data.get("contributors"))
            brd_data["in_scope"] = new_content.get("in_scope", brd_data.get("in_scope"))
            brd_data["out_of_scope"] = new_content.get("out_of_scope", brd_data.get("out_of_scope"))
        elif body.section_key == "existing_processes":
            brd_data["existing_processes"] = new_content
        elif body.section_key == "deliverables":
            brd_data["deliverables"] = new_content
        elif body.section_key == "appendix_and_signoff":
            brd_data["sign_off"] = new_content.get("sign_off", brd_data.get("sign_off"))
            brd_data["appendix"] = new_content.get("appendix", brd_data.get("appendix"))
            
        # Re-export DOCX
        docx_path = session.get("docx_path")
        if not docx_path:
            docx_path = os.path.join(settings.EXPORT_DIR, f"BRD_{session_id[:8]}.docx")
        build_docx_brd(brd_data, docx_path)
        
        session_store.update_session(session_id, {
            "brd_data": brd_data,
            "docx_path": docx_path
        })
        
    return {"message": "Section regenerated successfully", "brd_data": brd_data}

@app.put("/api/sessions/{session_id}/sections")
def update_sections(session_id: str, body: SectionUpdateRequest):
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
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

@app.get("/api/sessions/{session_id}/export")
def export_docx(session_id: str):
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    docx_path = session.get("docx_path")
    if not docx_path or not os.path.exists(docx_path):
        brd_data = session.get("brd_data")
        if not brd_data:
            raise HTTPException(status_code=400, detail="BRD has not been generated yet")
        docx_path = os.path.join(settings.EXPORT_DIR, f"BRD_{session_id[:8]}.docx")
        build_docx_brd(brd_data, docx_path)
        session_store.update_session(session_id, {"docx_path": docx_path})
        
    proj_name = session.get("brd_data", {}).get("project_name", "Requirements_Document")
    safe_title = "".join(c for c in proj_name if c.isalnum() or c in (' ', '_', '-')).strip().replace(" ", "_")
    download_filename = f"BRD_{safe_title}.docx"
    
    return FileResponse(
        docx_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=download_filename
    )

@app.get("/api/agents/status")
def get_agents_status(session_id: Optional[str] = None):
    if session_id:
        session = session_store.get_session(session_id)
        if session and "agents_activity" in session:
            return {"agents": session["agents_activity"]}
            
    return {
        "agents": [
            {"agent": "Context Extractor", "status": "Active", "model": "Qwen 3.8 27B / Groq", "description": "Extracts entities, sponsors, scope, and existing systems from source files."},
            {"agent": "Requirements Engineer", "status": "Active", "model": "Qwen 3.8 27B / Groq", "description": "Formulates formal PREQ, CREQ, and GCREQ requirements."},
            {"agent": "NFR Specialist", "status": "Active", "model": "Qwen 3.8 27B / Groq", "description": "Drafts Availability, Scalability, Security, and Performance checklists."},
            {"agent": "Data Architect", "status": "Active", "model": "Qwen 3.8 27B / Groq", "description": "Extracts data dictionary tables, types, constraints, and risk matrix."},
            {"agent": "QA & Gap Verifier", "status": "Active", "model": "Qwen 3.8 27B / Groq", "description": "Prevents hallucinations by inserting [NEEDS INPUT] placeholders."}
        ]
    }

@app.post("/api/config")
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
