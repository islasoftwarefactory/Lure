from flask_sqlalchemy import SQLAlchemy
from api.address.model import Address
from api.cart.model import Cart
from api.category.model import Category
from api.gender.model import Gender
from api.image_category.model import ImageCategory
from api.product.model import Product
from api.size.model import Size
from api.user.model import User
from api.scraping.model import Scraping
from api.scraping.type.model import ContactType
from api.purchases.history.model import PurchaseHistory
from api.purchases.product.model import PurchaseItem
from api.purchases.purchase.model import Purchase
from api.transaction.payment.model import Transaction
from api.transaction.method.model import TransactionMethod
from api.payment_status.model import PaymentStatus
from api.currency.model import Currency
from api.shippings.status.model import ShippingStatus
from api.shippings.conclusion.model import ShippingConclusion
from api.favorites.model import Favorite

from api.utils.db.connection import db
from sqlalchemy import inspect

def create_tables():
    """Creates all database tables for registered models"""
    try:
        with db.session.begin_nested():
            # Usa uma transação aninhada para garantir atomicidade
            db.create_all()
            
            # Criar tipos de contato padrão
            from api.scraping.type.model import ContactType
            
            # Verificar se já existem os tipos
            if not ContactType.query.filter_by(name='email').first():
                email_type = ContactType(name='email', disabled=False)
                db.session.add(email_type)
            
            if not ContactType.query.filter_by(name='sms').first():
                sms_type = ContactType(name='sms', disabled=False)
                db.session.add(sms_type)
        
        # Commit da transação principal
        db.session.commit()
        print("Tables and default contact types created successfully")
        
    except Exception as e:
        print(f"Error creating tables: {str(e)}")
        db.session.rollback()
        raise