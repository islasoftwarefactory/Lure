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

def create_tables():
    """Creates all database tables for registered models"""
    try:
        # Força o carregamento de todos os modelos
        models = [User, Address, Cart, Category, Discount, Gender, 
                 ImageCategory, Payment, PaymentMethod, Product, Size]
        
        db.create_all()
        print("Tables created successfully")
    except Exception as e:
        print(f"Error creating tables: {str(e)}")
        raise  # Re-lança o erro para debug
