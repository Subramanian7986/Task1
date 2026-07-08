import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/hcp_crm")
MODEL_NAME = os.getenv("MODEL_NAME", "gemma2-9b-it")
