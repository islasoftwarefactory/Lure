from .Models import Address, Category, Discount, Gender, Payment, PaymentMethod, Product, Size, User, ImageCategory
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_tables():
    models = [Address, Category, Discount, Gender, Payment, PaymentMethod, Product, Size, User, ImageCategory]
    for model in models:
        db.Model.metadata.create_all(bind=db.engine)
