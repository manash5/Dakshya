import logging
import os

from dotenv import load_dotenv
from google import genai
from groq import Groq

load_dotenv()

AI_SERVICE_PORT = int(os.getenv("AI_SERVICE_PORT", 8000))
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL_NAME = os.getenv("GROQ_MODEL_NAME", "llama-3.3-70b-versatile")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash")

# Two providers, on purpose -- not a migration in progress.
#
# Groq is the default (see ai_generation.generate_structured): its free
# tier allows far more requests/day than Gemini's 20/day/model, which
# matters for small, frequent calls like career-knowledge generation.
# But Groq's free tier caps out at 6,000-12,000 tokens PER MINUTE
# (confirmed empirically across llama-3.1-8b-instant, llama-3.3-70b-versatile,
# and gpt-oss-20b -- none of them clear a single ~90,000-character prompt).
# Course extraction sends the full scraped text of a university website,
# routinely 60-90k characters, in one shot -- that's a hard 413 on Groq no
# matter which model or how the request is paced, not a fixable rate-limit
# hiccup. Gemini's much larger effective context handles it fine, and
# course extraction is a rare, admin-triggered action (not high-frequency),
# so Gemini's tiny daily quota is a non-issue there specifically. See
# course_generator/extractor.py, which explicitly opts into provider="gemini".
groq_client = Groq(api_key=GROQ_API_KEY)
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

logging.basicConfig(level=logging.INFO)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(f"dakshya.{name}")
