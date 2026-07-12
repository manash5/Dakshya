import logging
import os

from dotenv import load_dotenv
from google import genai

load_dotenv()

AI_SERVICE_PORT = int(os.getenv("AI_SERVICE_PORT", 8000))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "gemini")
GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash")

# Shared google-genai client (new SDK: `google-genai` package, `google.genai`
# import path) -- reused by every AI service instead of each one constructing
# its own client.
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

logging.basicConfig(level=logging.INFO)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(f"dakshya.{name}")