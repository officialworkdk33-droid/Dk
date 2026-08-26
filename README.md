# Customs Invoice AI Extractor

GitHub-ready customs invoice/document extraction application.

## Features
- Upload one or many PDF invoices.
- Automatic PDF text extraction.
- AI extraction with a local Ollama model, so no paid AI API key is required.
- Handles changing invoice layouts through a schema-driven prompt.
- Review and edit extracted values.
- Export reviewed data to Excel.
- Local Windows AI bridge for connecting cloud frontend/backend to office AI.
- Render and Vercel deployment configuration.

## Architecture

Browser/Vercel -> Render FastAPI -> Office PC Bridge -> Ollama

The model runs on the office PC. A cloud service cannot directly access `localhost`, so the included bridge must be reachable through a private VPN or secure tunnel.

## Recommended model

Start with:
`qwen2.5:7b`

For a lower-spec PC:
`qwen2.5:3b`

Install Ollama, then:
```powershell
ollama pull qwen2.5:7b
ollama serve
```

## Local setup

### Local bridge
```powershell
cd local-bridge
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py
```

### Backend
```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Render

Build command:
`pip install -r backend/requirements.txt`

Start command:
`uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`

Set:
- BRIDGE_URL
- BRIDGE_TOKEN
- MAX_FILE_MB=20

## Vercel

Deploy the `frontend` folder.

Build:
`npm run build`

Output:
`dist`

Environment:
`VITE_API_BASE_URL=https://YOUR-RENDER-URL`

## Extraction fields

Invoice number/date, supplier, buyer, consignee, notify party, countries, currency, Incoterms, PO, transport mode, AWB, B/L, totals, confidence, warnings and line items.

Each line item supports description, HS code, origin, quantity, unit, unit price, amount, currency, net/gross weight.

## Scanned PDFs

Image-only/scanned PDFs require OCR. The included core project detects this condition. OCR can be added in the next phase with Tesseract or another local OCR engine.

## Production additions

For real customs-office use, add authentication, audit logs, encrypted storage, OCR, duplicate detection, supplier/template learning and approval workflow.
