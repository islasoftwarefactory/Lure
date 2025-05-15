from api.utils.db.connection import db  # Add this import
from datetime import datetime
import pytz
from typing import Dict, Optional
from flask import current_app
from api.user.model import User
from api.size.model import Size
from api.product.model import Product

class Cart(db.Model):
    __tablename__ = "carts"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    size_id = db.Column(db.Integer, db.ForeignKey('sizes.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    status = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))

    user = db.relationship('User', backref=db.backref('cart_items', lazy=True))
    product = db.relationship('Product', backref=db.backref('cart_items', lazy=True))
    size = db.relationship('Size', backref=db.backref('cart_items', lazy=True))

    def __repr__(self):
        return f"<Cart {self.id}, User_id: {self.user_id}, Product_id: {self.product_id}, Size_id: {self.size_id}, Qty: {self.quantity}>"

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "product_id": self.product_id,
            "size_id": self.size_id,
            "quantity": self.quantity,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

def create_cart(cart_data: Dict) -> Cart:
    """Creates a new cart item."""
    current_app.logger.info("Starting cart creation")
    try:
        new_cart = Cart(
            user_id=cart_data.get("user_id"),
            product_id=cart_data["product_id"],
            size_id=cart_data["size_id"],
            quantity=cart_data.get("quantity", 1),
            status=cart_data.get("status", True)
        )
        db.session.add(new_cart)
        db.session.commit()
        
        current_app.logger.info(f"Cart created successfully with ID: {new_cart.id} for user: {new_cart.user_id}")
        return new_cart
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating cart: {str(e)}")
        raise

def get_cart(cart_id: int) -> Optional[Cart]:
    """Retrieves a cart item by ID"""
    return Cart.query.get(cart_id)

def update_cart(cart_id: int, cart_data: Dict) -> Optional[Cart]:
    """Updates an existing cart item"""
    current_app.logger.info(f"Attempting to update cart ID: {cart_id}")
    try:
        cart = get_cart(cart_id)
        if not cart:
            current_app.logger.warning(f"Cart ID {cart_id} not found for update")
            return None

        updatable_fields = ["user_id", "product_id", "size_id", "quantity", "status"]
        
        for field in updatable_fields:
            if field in cart_data:
                setattr(cart, field, cart_data[field])
        
        cart.updated_at = datetime.now(pytz.timezone('America/Sao_Paulo'))
        
        db.session.commit()
        current_app.logger.info(f"Cart {cart_id} updated successfully")
        return cart
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating cart {cart_id}: {str(e)}")
        raise

def delete_cart(cart_id: int) -> bool:
    """Deletes a cart item by ID"""
    current_app.logger.info(f"Attempting to delete cart ID: {cart_id}")
    try:
        cart = get_cart(cart_id)
        if not cart:
            current_app.logger.warning(f"Cart ID {cart_id} not found for deletion")
            return False
            
        db.session.delete(cart)
        db.session.commit()
        current_app.logger.info(f"Cart {cart_id} deleted successfully")
        return True
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting cart {cart_id}: {str(e)}")
        raise
