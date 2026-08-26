@echo off
cd /d %~dp0
if not exist .venv python -m venv .venv
call .venv\Scripts\activate
pip install -r requirements.txt
if not exist .env copy .env.example .env
echo Starting Customs AI Local Bridge on port 8787
python -m uvicorn app:app --host 0.0.0.0 --port 8787
pause
