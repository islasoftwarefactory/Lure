from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import List, Optional
from flask import current_app
from sqlalchemy import UniqueConstraint, Index
from sqlalchemy.orm import joinedload
from api.product.model import Product

class Favorite(db.Model):
    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint('user_id', 'product_id', name='uq_user_product_favorite'),
        Index('ix_favorite_user_id', 'user_id'),
        Index('ix_favorite_product_id', 'product_id'),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))

    user_rel = db.relationship('User', back_populates='favorites')
    product_rel = db.relationship('Product', back_populates='favorited_by')

    def __repr__(self):
        return f"<Favorite id={self.id} user_id={self.user_id} product_id={self.product_id}>"

    def serialize(self):
        """Serializes a Favorite instance, including key details from the related product."""
        product_details = self.product_rel.serialize() if self.product_rel else {}
        return {
            "id": self.id,
            "user_id": self.user_id,
            "product_id": self.product_id,
            "product_name": product_details.get("name"),
            "product_description": product_details.get("description"),
            "product_price": product_details.get("price"),
            "image_category_id": product_details.get("image_category_id"),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

def add_favorite(user_id: int, product_id: int) -> Optional[Favorite]:
    """Adds a product to a user's favorites."""
    if is_favorite(user_id, product_id):
        current_app.logger.info(f"Product {product_id} is already a favorite for user {user_id}.")
        return Favorite.query.filter_by(user_id=user_id, product_id=product_id).first()

    try:
        favorite = Favorite(user_id=user_id, product_id=product_id)
        db.session.add(favorite)
        db.session.commit()
        current_app.logger.info(f"Product {product_id} added to favorites for user {user_id}.")
        return favorite
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding favorite for user {user_id}, product {product_id}: {str(e)}")
        raise

def remove_favorite(user_id: int, product_id: int) -> bool:
    """Removes a product from a user's favorites."""
    favorite = Favorite.query.filter_by(user_id=user_id, product_id=product_id).first()
    if favorite:
        try:
            db.session.delete(favorite)
            db.session.commit()
            current_app.logger.info(f"Product {product_id} removed from favorites for user {user_id}.")
            return True
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error removing favorite for user {user_id}, product {product_id}: {str(e)}")
            raise
    current_app.logger.warning(f"Attempted to remove non-existent favorite for user {user_id}, product {product_id}.")
    return False

def get_user_favorites(user_id: int) -> List[Favorite]:
    """Retrieves all favorite records for a given user, pre-loading product data."""
    return Favorite.query.filter_by(user_id=user_id).options(
        joinedload(Favorite.product_rel)
    ).all()

def is_favorite(user_id: int, product_id: int) -> bool:
    """Checks if a product is in a user's favorites."""
    return db.session.query(Favorite.query.filter_by(user_id=user_id, product_id=product_id).exists()).scalar()
