import os
import json
import logging
from typing import Any, Dict, Optional
from google import genai
from google.genai import types

# 1. Logging Configuration
LOG_FILENAME = "resume_parser.log"

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    filename=LOG_FILENAME,
    filemode="w"
)
logger = logging.getLogger("resume_parser")
# 3. Gemini Utility Class
class GeminiUtil:
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash-lite"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("API key required: set GEMINI_API_KEY in env or pass api_key")
        
        self.client = genai.Client(api_key=self.api_key)
        self.model = model

        # Strict prompt for structured resume JSON
        self._prompt = """
Extract the resume data from the provided PDF. Return EXACTLY one JSON object (no markdown, no code fences,
no commentary) that conforms to the following schema:

{
  "personalInfo": {
    "name": "", 
    "email": "", 
    "phone": "", 
    "linkedin": "", 
    "github": "", 
    "website": ""
  },
  "summary": "",
  "skills": [],
  "experience": [
    {
      "role": "",
      "company": "",
      "startMonth": "",
      "startYear": "",
      "endMonth": "",
      "endYear": "",
      "details": [""]
    }
  ],
  "education": [
    {
      "degree": "",
      "school": "",
      "startMonth": "",
      "startYear": "",
      "endMonth": "",
      "endYear": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "tech": [""],
      "link": ""
    }
  ],
  "certificates": [
    {
      "name": "",
      "description": "",
      "issuer": "",
      "validTill": "",
      "link": ""
    }
  ]
}

Rules:
- Output must be valid JSON parseable by standard JSON parsers.
- Fields not found must be empty strings or empty arrays as appropriate.
- Do not add any extra fields or commentary.
Return ONLY the JSON object.
"""

    def parse_resume_data(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """
        Sends PDF bytes to Gemini and returns parsed JSON.
        """
        if not pdf_bytes:
            raise ValueError("Empty pdf_bytes provided")

        # Inline PDF bytes as a multimodal Part
        part = types.Part.from_bytes(
            data=pdf_bytes,
            mime_type="application/pdf",
        )

        # Generate content
        response = self.client.models.generate_content(
            model=self.model,
            contents=[self._prompt, part],
        )

        text_output = getattr(response, "text", None) or str(response)
        
        # Log the raw output from Gemini
        logger.debug(f"Raw Gemini Output: {text_output}")

        # Attempt to clean potential markdown fences before parsing
        cleaned_text = text_output.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        if cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        
        # Parse JSON
        parsed_data = json.loads(cleaned_text.strip())
        
        # Log the final parsed dictionary
        logger.debug(f"Parsed JSON Data: {json.dumps(parsed_data, indent=2)}")
        
        return parsed_data
