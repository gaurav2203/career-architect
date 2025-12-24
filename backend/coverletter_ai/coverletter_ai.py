import os
import json
import logging
from typing import Any, Dict, Optional
from google import genai
from google.genai import types
import os 
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
import lmstudio as lms
import re

LOG_FILENAME = "cover_letter_ai.log"

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    filename=LOG_FILENAME,
    filemode="a"
)
logger = logging.getLogger("cover_letter_ai")

current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '../../.env')
load_dotenv(env_path)


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

# 3. Gemini Utility Class
class CoverLetterUtil:
    def __init__(self, model: str = "llama-3.2-3b-instruct"):
        self.model = lms.llm(model)
        SERVER_API_HOST = os.getenv("SERVER_API_HOST")
        # lms.configure_default_client(SERVER_API_HOST)

        if lms.Client.is_valid_api_host(SERVER_API_HOST):
            logger.info(f"An LM Studio API server instance is available at {SERVER_API_HOST}")
        else:
            logger.error(f"No LM Studio API server instance found at {SERVER_API_HOST}")
        logger.info(f"Using model: {self.model}")
        # Strict prompt for structured resume JSON
        self._prompt = """
        Act as an expert professional development coach and cover-letter writer.
Write a concise (~200 words), impactful, and human-sounding cover letter tailored to a professional in their mid-20s.

Follow these rules:
Tone:
Professional but approachable
No robotic or overly formal language
Mix short and long sentences for natural flow

Content Requirements:
Clearly align my skills, projects, and experience with the key requirements of the job
Include 3 to 5 crisp bullet points highlighting my most relevant achievements
Pull directly from my resume (metrics, tools, projects, cloud experience, ML/DL skills, etc.)
Express genuine interest in the company and how this role supports my career growth

Format:
~200 words
One short intro paragraph
One short bullet-point section
One short closing paragraph
Sound like a real person in their mid-20s
Do not write filler text like "Here is a cover letter tailored to the job description:"

Here are the inputs:

"""

    def jdValidator(self, jd: str) -> str:
        if not jd:
            return ""

        # Remove line breaks
        jd = jd.replace("\n", " ").replace("\r", " ")

        # Remove quotes that break JSON
        jd = jd.replace('"', "").replace("'", "")

        # Collapse multiple spaces into one
        jd = re.sub(r"\s+", " ", jd)

        # Strip leading/trailing whitespace
        return jd.strip()

    def generate_cover_letter(self, input: CoverLetter) -> Dict[str, Any]:
        # Create a chat with an initial system prompt.
        chat = lms.Chat(self._prompt)
        jd = self.jdValidator(input.job_description)
        # Build the chat context by adding messages of relevant types.
        chat.add_user_message(f"""Resume: {input.resume_data}
        Job Description: {jd} """)

        # Generate a response.
        response = self.model.respond(chat)
        logger.info(f"Response type: {type(response)}")
        logger.info(f"Response: {response}")
        
        # Extract the text content from the response
        # LM Studio response might be a string or have a .content attribute
        if isinstance(response, str):
            cover_letter_text = response
        elif hasattr(response, 'content'):
            cover_letter_text = response.content
        elif hasattr(response, 'text'):
            cover_letter_text = response.text
        else:
            # Fallback: convert to string
            cover_letter_text = str(response)
        
        return {
            "cover_letter": cover_letter_text,
            "success": True
        }

