import os
from typing import Optional
from dotenv import load_dotenv

# Load .env file from root directory
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

class Settings:
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY", None)
    
    DEFAULT_PROVIDER: str = "groq" # "groq", "gemini", "anthropic", "heuristic"
    GROQ_MODEL: str = "qwen/qwen3.8-27b"
    GEMINI_MODEL: str = "models/gemini-2.5-flash"
    
    BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    EXPORT_DIR: str = os.path.join(BASE_DIR, "exports")

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.EXPORT_DIR, exist_ok=True)
