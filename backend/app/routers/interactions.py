from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Interaction

router = APIRouter()

@router.get("/interactions")
def list_interactions(db: Session = Depends(get_db)):
    return db.query(Interaction).order_by(Interaction.id.desc()).limit(20).all()
