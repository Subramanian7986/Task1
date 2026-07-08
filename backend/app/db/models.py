from sqlalchemy import Column, Integer, String, Text, Date, Time, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.db.database import Base

class Interaction(Base):
    __tablename__ = "interactions"
    id = Column(Integer, primary_key=True, index=True)
    hcp_name = Column(String(255))
    interaction_type = Column(String(50))
    date = Column(Date)
    time = Column(Time)
    attendees = Column(Text)
    topics_discussed = Column(Text)
    materials_shared = Column(Text)
    samples_distributed = Column(Text)
    sentiment = Column(String(20))
    outcomes = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())

class FollowUp(Base):
    __tablename__ = "follow_ups"
    id = Column(Integer, primary_key=True, index=True)
    interaction_id = Column(Integer, ForeignKey("interactions.id"), nullable=True)
    action_description = Column(Text)
    due_date = Column(Date)
    action_type = Column(String(50))
    created_at = Column(TIMESTAMP, server_default=func.now())
