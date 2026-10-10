import argparse
import random
from datetime import datetime, timedelta
from faker import Faker
from sqlalchemy import text
from app.database import engine, Base, SessionLocal
from app.models.public import Customer, Product, Order, OrderItem
from app.models.finance import Expense, Payment
from app.models.hr import Employee

fake = Faker()

def create_schemas():
    with engine.connect() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS public;"))
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS finance;"))
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS hr;"))
        conn.commit()
    Base.metadata.create_all(bind=engine)

def seed_data(size: str):
    db = SessionLocal()
    try:
        # Determine sizes
        sizes = {
            "small": {"customers": 50, "products": 20, "orders": 100, "expenses": 30, "employees": 10},
            "medium": {"customers": 500, "products": 100, "orders": 2000, "expenses": 300, "employees": 50},
            "large": {"customers": 5000, "products": 500, "orders": 20000, "expenses": 1000, "employees": 200}
        }
        
        cfg = sizes.get(size, sizes["small"])
        
        print(f"Seeding database with '{size}' configuration...")
        
        # Seed Products
        products = []
        categories = ["Electronics", "Clothing", "Home", "Sports", "Books"]
        for _ in range(cfg["products"]):
            p = Product(
                product_name=fake.catch_phrase(),
                category=random.choice(categories),
                price=round(random.uniform(10.0, 500.0), 2),
                cost=round(random.uniform(5.0, 200.0), 2),
                stock_quantity=random.randint(0, 1000)
            )
            products.append(p)
            db.add(p)
        db.commit()
        
        # Seed Customers
        customers = []
        segments = ["Retail", "Wholesale", "Corporate"]
        for _ in range(cfg["customers"]):
            c = Customer(
                name=fake.name(),
                email=fake.email(),
                city=fake.city(),
                country=fake.country(),
                signup_date=fake.date_time_between(start_date='-2y', end_date='now'),
                customer_segment=random.choice(segments)
            )
            customers.append(c)
            db.add(c)
        db.commit()
        
        # Seed Orders & Items
        statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]
        payment_statuses = ["Unpaid", "Paid", "Refunded"]
        orders = []
        for _ in range(cfg["orders"]):
            c = random.choice(customers)
            o = Order(
                customer_id=c.customer_id,
                order_date=fake.date_time_between(start_date=c.signup_date, end_date='now'),
                status=random.choice(statuses),
                payment_status=random.choice(payment_statuses)
            )
            db.add(o)
            db.flush()
            orders.append(o)
            
            # Order Items
            num_items = random.randint(1, 5)
            for _ in range(num_items):
                p = random.choice(products)
                oi = OrderItem(
                    order_id=o.order_id,
                    product_id=p.product_id,
                    quantity=random.randint(1, 10),
                    unit_price=p.price
                )
                db.add(oi)
                
            # Payments
            if o.payment_status in ["Paid", "Refunded"]:
                pay = Payment(
                    order_id=o.order_id,
                    payment_date=o.order_date + timedelta(days=random.randint(0, 5)),
                    amount=round(random.uniform(10.0, 1000.0), 2), # Simplified
                    payment_method=random.choice(["Credit Card", "PayPal", "Bank Transfer"]),
                    status="Completed" if o.payment_status == "Paid" else "Refunded"
                )
                db.add(pay)
        db.commit()
        
        # Seed Expenses
        expense_cats = ["Marketing", "Operations", "R&D", "Software", "Travel"]
        for _ in range(cfg["expenses"]):
            e = Expense(
                expense_date=fake.date_time_between(start_date='-1y', end_date='now'),
                category=random.choice(expense_cats),
                amount=round(random.uniform(50.0, 5000.0), 2),
                description=fake.sentence()
            )
            db.add(e)
        
        # Seed Employees
        depts = ["Engineering", "Sales", "Marketing", "HR", "Finance"]
        for _ in range(cfg["employees"]):
            emp = Employee(
                name=fake.name(),
                department=random.choice(depts),
                role=fake.job(),
                salary=round(random.uniform(40000, 150000), 2),
                joining_date=fake.date_time_between(start_date='-5y', end_date='now')
            )
            db.add(emp)
            
        db.commit()
        print("Seeding complete!")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed database for BizQuery AI")
    parser.add_argument("--size", choices=["small", "medium", "large"], default="small", help="Size of the dataset to generate")
    args = parser.parse_args()
    
    print("Setting up schemas and tables...")
    create_schemas()
    seed_data(args.size)
