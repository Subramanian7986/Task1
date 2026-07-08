from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import init_db
from app.routers import chat, interactions

app = FastAPI(title="HCP CRM AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(chat.router, prefix="/api")
app.include_router(interactions.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "HCP CRM AI Backend running"}
