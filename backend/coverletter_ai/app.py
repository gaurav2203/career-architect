# Note: assumes use of an async function or the "python -m asyncio" asynchronous REPL
# Requires Python SDK version 1.5.0 or later
import lmstudio as lms
from typing import Any, Dict, Optional
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from coverletter_ai import CoverLetterUtil
import os
import uvicorn
FRONTEND_URL = os.getenv("FRONTEND_URL")

# 4. FastAPI Setup
app = FastAPI(title="Cover Letter Backend")

# Initialize Utils

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PersonalInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None
class Experience(BaseModel):
    role: Optional[str] = None
    company: Optional[str] = None
    startMonth: Optional[str] = None
    startYear: Optional[str] = None
    endMonth: Optional[str] = None
    endYear: Optional[str] = None
    details: Optional[List[str]] = None
class Education(BaseModel):
    degree: Optional[str] = None
    school: Optional[str] = None
    startMonth: Optional[str] = None
    startYear: Optional[str] = None
    endMonth: Optional[str] = None
    endYear: Optional[str] = None
class Certificate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    issuer: Optional[str] = None
    validTill: Optional[str] = None
    link: Optional[str] = None
class Project(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tech: Optional[List[str]] = None
    link: Optional[str] = None
class ResumeData(BaseModel):
    personalInfo: Optional[PersonalInfo] = None
    summary: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[List[Experience]] = None
    education: Optional[List[Education]] = None
    projects: Optional[List[Project]] = None
    certificates: Optional[List[Certificate]] = None
class CoverLetter(BaseModel):
    resume_data: Optional[ResumeData] = None
    job_description: Optional[str] = None


# 5. Routes
@app.get("/")
async def root():
    return {"status": "ok", "message": "Resume backend running"}

@app.post("/cover-letter")
async def parse_resume(input_data: CoverLetter):
    cover_letter_util = CoverLetterUtil()
    # Process the file
    result = cover_letter_util.generate_cover_letter(input_data)
    
    # result is a dict, so access it with dictionary syntax
    return result

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8003, reload=True)