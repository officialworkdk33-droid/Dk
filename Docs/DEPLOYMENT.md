# Deployment

## GitHub

```bash
git init
git add .
git commit -m "Initial Customs Invoice AI"
git branch -M main
git remote add origin https://github.com/YOUR-USER/YOUR-REPO.git
git push -u origin main
```

## Render

Connect the repository as a Web Service.

Build:
`pip install -r backend/requirements.txt`

Start:
`uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`

Environment:
- BRIDGE_URL
- BRIDGE_TOKEN
- MAX_FILE_MB=20

## Vercel

Deploy `frontend/`.

Build:
`npm run build`

Output:
`dist`

Environment:
`VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com`

## Important network point

The Render server cannot call Ollama on `127.0.0.1` of your office PC. Use a secure private network or tunnel for the local bridge. Never expose Ollama itself publicly.

## Future OCR

Scanned/image-only PDFs are detected but require OCR. Add a local OCR worker using Tesseract for fully automated scanned invoice support.
