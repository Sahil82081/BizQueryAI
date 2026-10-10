from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, MetaData
from datetime import datetime
from app.database import Base

class Expense(Base):
    __tablename__ = "expenses"
    __table_args__ = {'schema': 'finance'}
    
    expense_id = Column(Integer, primary_key=True, index=True)
    expense_date = Column(DateTime, default=datetime.utcnow)
    category = Column(String)
    amount = Column(Float)
    description = Column(String)

class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = {'schema': 'finance'}
    
    payment_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("public.orders.order_id"))
    payment_date = Column(DateTime, default=datetime.utcnow)
    amount = Column(Float)
    payment_method = Column(String)
    status = Column(String)
