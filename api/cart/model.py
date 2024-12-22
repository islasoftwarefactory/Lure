from ..connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional

class Cart(db.Model):
    __tablename__ = "carts"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    discount_id = db.Column(db.Integer, db.ForeignKey('discounts.id'), nullable=True)
    status = db.Column(db.Boolean, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))
    payment = db.relationship('Payment', backref='cart', lazy=True)

    def __repr__(self):
        return f"<Cart {self.id}, User_id: {self.user_id}, Product_id: {self.product_id}>"

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "product_id": self.product_id,
            "discount_id": self.discount_id,
            "status": self.status,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

def create_cart(cart_data: Dict) -> Optional[Cart]:
    """Creates a new cart"""
    current_app.logger.info("Starting cart creation")
    try:
        new_cart = Cart(
            user_id=cart_data["user_id"],
            product_id=cart_data["product_id"],
            discount_id=cart_data.get("discount_id"),
            status=cart_data["status"]
        )
        db.session.add(new_cart)
        db.session.commit()
        
        current_app.logger.info(f"Cart created successfully for user: {new_cart.user_id}")
        return new_cart
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating cart: {str(e)}")
        raise

def get_cart(cart_id: int) -> Optional[Cart]:
    """Retrieves a cart by ID"""
    return Cart.query.get(cart_id)

def update_cart(cart_id: int, cart_data: Dict) -> Optional[Cart]:
    """Updates an existing cart"""
    cart = get_cart(cart_id)
    if cart:
        for field in ["
