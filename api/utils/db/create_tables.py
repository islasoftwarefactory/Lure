from flask_sqlalchemy import SQLAlchemy
from api.address.model import Address
from api.cart.model import Cart
from api.category.model import Category
from api.discount.model import Discount
from api.gender.model import Gender
from api.image_category.model import ImageCategory
from api.payment.model import Payment
from api.payment_method.model import PaymentMethod
from api.product.model import Product
from api.size.model import Size
from api.user.model import User
from api.utils.db.connection import db
from sqlalchemy import inspect

def create_tables():
    try:
        inspector = inspect(db.engine)
        existing_tables = inspector.get_table_names()
        
        # Para cada modelo definido
        for table in db.Model.metadata.tables.values():
            if table.name not in existing_tables:
                table.create(db.engine)
                print(f"Table {table.name} created")
            else:
                print(f"Table {table.name} already exists")
    except Exception as e:
        print(f"Error creating tables: {e}")
