from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, MetaData
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

metadata_obj = MetaData(schema="public")

class Customer(Base):
    __tablename__ = "customers"
    __table_args__ = {'schema': 'public'}
    
    customer_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    city = Column(String)
    country = Column(String)
    signup_date = Column(DateTime, default=datetime.utcnow)
    customer_segment = Column(String)
    
    orders = relationship("Order", back_populates="customer")

class Product(Base):
    __tablename__ = "products"
    __table_args__ = {'schema': 'public'}
    
    product_id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String, index=True)
    category = Column(String)
    price = Column(Float)
    cost = Column(Float)
    stock_quantity = Column(Integer)
    
class Order(Base):
    __tablename__ = "orders"
    __table_args__ = {'schema': 'public'}
    
    order_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("public.customers.customer_id"))
    order_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String)
    payment_status = Column(String)
    
    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    __table_args__ = {'schema': 'public'}
    
    order_item_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("public.orders.order_id"))
    product_id = Column(Integer, ForeignKey("public.products.product_id"))
    quantity = Column(Integer)
    unit_price = Column(Float)
    
    order = relationship("Order", back_populates="items")
