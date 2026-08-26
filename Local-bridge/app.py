import json
import os
import re
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="Customs AI Local Bridge")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:7b")
BRIDGE_TOKEN = os.getenv("BRIDGE_TOKEN", "change-me")

class ExtractRequest(BaseModel):
    filename: str
    system_prompt: str
    schema: dict[str, Any]
    text: str

def json_from_model(raw: str) -> dict[str, Any]:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
    start, end = raw.find("{"), raw.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("Model did not return JSON.")
    return json.loads(raw[start:end + 1])

@app.get("/health")
async def health():
    return {"ok": True, "model": OLLAMA_MODEL}

@app.post("/extract")
async def extract(req: ExtractRequest, authorization: str | None = Header(default=None)):
    if authorization != f"Bearer {BRIDGE_TOKEN}":
        raise HTTPException(status_code=401, detail="Invalid bridge token.")

    prompt = f"""{req.system_prompt}

JSON schema/example:
{json.dumps(req.schema, ensure_ascii=False, indent=2)}

Document filename:
{req.filename}

DOCUMENT TEXT:
{req.text}
"""

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {"temperature": 0},
    }

    try:
        async with httpx.AsyncClient(timeout=180) as client:
            response = await client.post(f"{OLLAMA_URL}/api/generate", json=payload)
            response.raise_for_status()
            result = json_from_model(response.json().get("response", ""))
            return {"data": result}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Ollama extraction failed: {exc}")
