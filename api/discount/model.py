from ..connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional
from flask import current_app

class Discount(db.Model):
    __tablename__ = "discounts"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(40), nullable=False)
    description = db.Column(db.String(120), nullable=False)
    value = db.Column(db.Numeric(10, 2), nullable=False)
    allowed_product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def __repr__(self):
        return f"<Discount {self.id}, Name: {self.name}, Value: {self.value}>"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "value": float(self.value),
            "allowed_product_id": self.allowed_product_id,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

def create_discount(discount_data: Dict) -> Optional[Discount]:
    """Creates a new discount"""
    current_app.logger.info("Starting discount creation")
    try:
        new_discount = Discount(
            name=discount_data["name"],
            description=discount_data["description"],
            value=discount_data["value"],
            allowed_product_id=discount_data["allowed_product_id"]
        )
        db.session.add(new_discount)
        db.session.commit()
        
        current_app.logger.info(f"Discount created successfully: {new_discount.name}")
        return new_discount
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating discount: {str(e)}")
        raise

def get_discount(discount_id: int) -> Optional[Discount]:
    """Retrieves a discount by ID"""
    return Discount.query.get(discount_id)

def update_discount(discount_id: int, discount_data: Dict) -> Optional[Discount]:
    """Updates an existing discount"""
    discount = get_discount(discount_id)
    if discount:
        for field in ["name", "description", "value", "allowed_product_id"]:
            if field in discount_data:
                setattr(discount, field, discount_data[field])
        db.session.commit()
        return discount
    return None

def delete_discount(discount_id: int) -> Optional[Discount]:
    """Deletes a discount"""
    discount = get_discount(discount_id)
    if discount:
        db.session.delete(discount)
        db.session.commit()
        return discount
    return None