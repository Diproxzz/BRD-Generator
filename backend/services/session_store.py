import uuid
import time
import os
import json
from typing import Dict, Any, Optional, List
from backend.config import settings

SESSION_DIR = os.path.join(settings.UPLOAD_DIR, "sessions")
os.makedirs(SESSION_DIR, exist_ok=True)

class SessionStore:
    def __init__(self):
        self._sessions: Dict[str, Dict[str, Any]] = {}
        
    def _get_file_path(self, session_id: str) -> str:
        return os.path.join(SESSION_DIR, f"{session_id}.json")
        
    def _save_to_disk(self, session: Dict[str, Any]):
        try:
            p = self._get_file_path(session["session_id"])
            with open(p, "w", encoding="utf-8") as f:
                json.dump(session, f, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving session to disk: {e}")
            
    def _load_from_disk(self, session_id: str) -> Optional[Dict[str, Any]]:
        try:
            p = self._get_file_path(session_id)
            if os.path.exists(p):
                with open(p, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self._sessions[session_id] = data
                    return data
        except Exception as e:
            print(f"Error reading session from disk: {e}")
        return None

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
                {"agent": "Requirements Engineer", "status": "Ready", "task": "Agile Epic/Story generator idle"},
                {"agent": "NFR Specialist", "status": "Ready", "task": "Non-functional architecture agent idle"},
                {"agent": "Data Architect", "status": "Ready", "task": "Process flow & exception handler idle"},
                {"agent": "QA & Gap Verifier", "status": "Ready", "task": "Acceptance criteria reviewer idle"}
            ],
            "brd_data": None,
            "docx_path": None,
            "provider": "groq",
            "model": "qwen/qwen3.8-27b"
        }
        self._sessions[session_id] = session
        self._save_to_disk(session)
        return session
        
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        if session_id in self._sessions:
            return self._sessions[session_id]
        return self._load_from_disk(session_id)
        
    def update_session(self, session_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        session = self.get_session(session_id)
        if session:
            session.update(updates)
            self._sessions[session_id] = session
            self._save_to_disk(session)
            return session
        return None
        
    def list_sessions(self) -> List[str]:
        return list(self._sessions.keys())

session_store = SessionStore()
