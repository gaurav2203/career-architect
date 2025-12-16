
import os
from typing import Any, Dict, Optional
from resume_parser import GeminiUtil
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
from google.genai import types



# 2. Load Environment Variables
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '../../.env')
load_dotenv(env_path)

# Env Var
FRONTEND_URL = os.getenv("FRONTEND_URL")

# 4. FastAPI Setup
app = FastAPI(title="Resume Backend")

# Initialize Utils
gem = GeminiUtil()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Routes
@app.get("/")
async def root():
    return {"status": "ok", "message": "Resume backend running"}

@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    pdf_bytes = await file.read()
    
    # Process the file
    result = gem.parse_resume_data(pdf_bytes)
    
    return {
        "success": True,
        "method": "gemini",
        "response_text": result
    }