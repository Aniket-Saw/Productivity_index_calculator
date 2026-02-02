from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    productivity_records = relationship("DailyProductivity", back_populates="owner")

class DailyProductivity(Base):
    __tablename__ = "daily_productivity"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, default=datetime.date.today)
    
    # Inputs
    focus_time = Column(Float)
    distractions = Column(Integer)
    sleep_hours = Column(Float)
    sleep_quality = Column(Integer)
    workload = Column(Integer)
    
    # Outputs
    dpi_score = Column(Float)
    adjusted_sleep_score = Column(Float)
    linguistic_result = Column(String)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="productivity_records")
