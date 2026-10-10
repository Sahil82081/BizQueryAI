from sqlalchemy import Column, Integer, String, Float, DateTime, MetaData
from datetime import datetime
from app.database import Base

class Employee(Base):
    __tablename__ = "employees"
    __table_args__ = {'schema': 'hr'}
    
    employee_id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    department = Column(String)
    role = Column(String)
    salary = Column(Float)
    joining_date = Column(DateTime, default=datetime.utcnow)
