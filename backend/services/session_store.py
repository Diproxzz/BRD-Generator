import uuid
import time
from typing import Dict, Any, Optional, List

class SessionStore:
    def __init__(self):
        self._sessions: Dict[str, Dict[str, Any]] = {}
        
    def create_session(self, use_case_id: str = "UC_DP_005") -> Dict[str, Any]:
        session_id = str(uuid.uuid4())
        session = {
            "session_id": session_id,
            "use_case_id": use_case_id,
            "created_at": time.time(),
            "active_step": 1,
            "files": [],
            "aggregated_text": "",
            "context": None,
            "user_prompt": "",
            "generation_status": {
                "context_extraction": "idle",
                "project_overview": "idle",
                "existing_processes": "idle",
                "deliverables": "idle",
                "appendix_and_signoff": "idle"
            },
            "agents_activity": [
                {"agent": "Context Extractor", "status": "Ready", "task": "Waiting for document upload"},
                {"agent": "Requirements Engineer", "status": "Ready", "task": "PREQ/CREQ Generator idle"},
                {"agent": "NFR Specialist", "status": "Ready", "task": "Non-functional checklist agent idle"},
                {"agent": "Data Architect", "status": "Ready", "task": "Schema & field dictionary agent idle"},
                {"agent": "QA & Gap Verifier", "status": "Ready", "task": "Missing input detector idle"}
            ],
            "brd_data": None,
            "docx_path": None,
            "provider": "groq",
            "model": "qwen/qwen3.8-27b"
        }
        self._sessions[session_id] = session
        return session
        
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        return self._sessions.get(session_id)
        
    def update_session(self, session_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if session_id in self._sessions:
            self._sessions[session_id].update(updates)
            return self._sessions[session_id]
        return None
        
    def list_sessions(self) -> List[str]:
        return list(self._sessions.keys())

session_store = SessionStore()
