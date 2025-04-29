from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional
from flask import current_app

class ShippingConclusion(db.Model):
    __tablename__ = "shipping_conclusion"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.String(256), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))
    
    # Relationship with ShippingStatus
    shipping_status = db.relationship('ShippingStatus', backref='conclusions', lazy='dynamic')

    def __repr__(self):
        return f"<ShippingConclusion id={self.id} name='{self.name}'>"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

def find_shipping_conclusion_by_id(conclusion_id: int) -> Optional[ShippingConclusion]:
    """Fetch a shipping conclusion by ID."""
    return ShippingConclusion.query.get(conclusion_id)

def create_shipping_conclusion(conclusion_data: Dict) -> ShippingConclusion:
    """Create a new shipping conclusion."""
    current_app.logger.info(f"Creating shipping conclusion: {conclusion_data.get('name')}")

    required_fields = ['name']
    if not all(field in conclusion_data for field in required_fields):
        raise ValueError(f"Incomplete data to create shipping conclusion. Required fields: {required_fields}")

    try:
        shipping_conclusion = ShippingConclusion(
            name=conclusion_data["name"],
            description=conclusion_data.get("description"),
        )
        db.session.add(shipping_conclusion)
        db.session.commit()
        current_app.logger.info(f"Shipping conclusion created successfully: {shipping_conclusion.name}")
        return shipping_conclusion
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating shipping conclusion {conclusion_data.get('name')}: {str(e)}")
        raise

def update_shipping_conclusion(conclusion_id: int, conclusion_data: Dict) -> Optional[ShippingConclusion]:
    """Update an existing shipping conclusion."""
    shipping_conclusion = find_shipping_conclusion_by_id(conclusion_id)
    if not shipping_conclusion:
        current_app.logger.warning(f"Attempt to update non-existent shipping conclusion: ID {conclusion_id}")
        return None

    current_app.logger.info(f"Updating shipping conclusion ID {conclusion_id}")
    try:
        allowed_updates = ['name', 'description']
        updated = False
        for key, value in conclusion_data.items():
            if key in allowed_updates:
                setattr(shipping_conclusion, key, value)
                updated = True

        if updated:
            db.session.commit()
            current_app.logger.info(f"Shipping conclusion ID {conclusion_id} updated successfully.")
        else:
            current_app.logger.info(f"No changes detected for shipping conclusion ID {conclusion_id}.")

        return shipping_conclusion
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating shipping conclusion ID {conclusion_id}: {str(e)}")
        raise

def delete_shipping_conclusion(conclusion_id: int) -> bool:
    """Delete a shipping conclusion by ID."""
    shipping_conclusion = find_shipping_conclusion_by_id(conclusion_id)
    if shipping_conclusion:
        try:
            db.session.delete(shipping_conclusion)
            db.session.commit()
            current_app.logger.info(f"Shipping conclusion ID {conclusion_id} deleted.")
            return True
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error deleting shipping conclusion ID {conclusion_id}: {str(e)}")
            raise
    current_app.logger.warning(f"Attempt to delete non-existent shipping conclusion: ID {conclusion_id}")
    return False
