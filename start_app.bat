@echo off
echo ===================================================
echo   Starting AI-Powered BRD Generator Web App
echo   Primary AI Engine: Groq (Qwen 3.8 27B / Free)
echo ===================================================

start "BRD Generator Backend" cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 2 > nul
start "BRD Generator Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Application started!
echo Frontend: http://localhost:5173
echo Backend:  http://127.0.0.1:8000
echo.
