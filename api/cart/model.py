from api.utils.db.connection import db  # Add this import
from datetime import datetime
import pytz
from typing import Dict, Optional
from flask import current_app

class Cart(db.Model):
    __tablename__ = "carts"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    status = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def __repr__(self):
        return f"<Cart {self.id}, User_id: {self.user_id}, Product_id: {self.product_id}>"

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "product_id": self.product_id,
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
    """Updates an existing cart
    
    Args:
        cart_id (int): ID do carrinho a ser atualizado
        cart_data (Dict): Dicionário contendo os campos a serem atualizados
        
    Returns:
        Optional[Cart]: Carrinho atualizado ou None se não encontrado
    """
    current_app.logger.info(f"Attempting to update cart ID: {cart_id}")
    try:
        cart = get_cart(cart_id)
        if not cart:
            current_app.logger.warning(f"Cart ID {cart_id} not found")
            return None

        updatable_fields = ["user_id", "product_id", "status"]
        
        for field in updatable_fields:
            if field in cart_data:
                setattr(cart, field, cart_data[field])
        
        db.session.commit()
        current_app.logger.info(f"Cart {cart_id} updated successfully")
        return cart
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating cart {cart_id}: {str(e)}")
        raise

def delete_cart(cart_id: int) -> bool:
    """Deletes a cart by ID
    
    Args:
        cart_id (int): ID do carrinho a ser deletado
        
    Returns:
        bool: True se o carrinho foi deletado com sucesso, False se não encontrado
    """
    current_app.logger.info(f"Attempting to delete cart ID: {cart_id}")
    try:
        cart = get_cart(cart_id)
        if not cart:
            current_app.logger.warning(f"Cart ID {cart_id} not found")
            return False
            
        db.session.delete(cart)
        db.session.commit()
        current_app.logger.info(f"Cart {cart_id} deleted successfully")
        return True
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting cart {cart_id}: {str(e)}")
        raise
