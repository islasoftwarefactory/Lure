from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional
from flask import current_app

class PurchaseHistory(db.Model):
    __tablename__ = "purchase_history"

    id = db.Column(db.Integer, primary_key=True)
    purchase_id = db.Column(db.String(36), db.ForeignKey('purchases.id'), nullable=False)
    # Add new user_id column with foreign key
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_by = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))

    # Relationships
    purchase_rel = db.relationship('Purchase', back_populates='history')
    # Add new user relationship
    user_rel = db.relationship('User', back_populates='purchase_history')

    def serialize(self) -> Dict:
        return {
            "id": self.id,
            "purchase_id": self.purchase_id,
            "user_id": self.user_id,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    @classmethod
    def create(cls, data: Dict) -> 'PurchaseHistory':
        """Creates a new purchase history entry"""
        current_app.logger.info(f"Creating history entry for purchase {data.get('purchase_id')}")
        try:
            history_entry = cls(
                purchase_id=data["purchase_id"],
                user_id=data["user_id"],  # Add user_id to creation
                created_by=data.get("created_by")
            )
            db.session.add(history_entry)
            current_app.logger.info(f"PurchaseHistory {history_entry.id} created.")
            return history_entry
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error creating purchase history: {str(e)}")
            raise

    @classmethod
    def get_by_id(cls, history_id: int) -> Optional['PurchaseHistory']:
        """Retrieves a purchase history entry by ID"""
        return cls.query.get(history_id)

    # History entries are typically immutable, so update/delete are rare.
    @classmethod
    def update(cls, history_id: int, data: Dict) -> Optional['PurchaseHistory']:
        """Updates an existing purchase history entry (use with caution)."""
        history = cls.get_by_id(history_id)
        if not history:
            current_app.logger.warning(f"PurchaseHistory ID {history_id} not found for update.")
            return None

        current_app.logger.info(f"Updating PurchaseHistory ID {history_id}")
        updated = False
        try:
            if "created_by" in data and history.created_by != data["created_by"]:
                history.created_by = data["created_by"]
                updated = True

            if updated:
                db.session.commit()
                current_app.logger.info(f"PurchaseHistory ID {history_id} updated successfully.")
            else:
                current_app.logger.info(f"No changes detected for PurchaseHistory ID {history_id}.")

            return history
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error updating PurchaseHistory ID {history_id}: {str(e)}")
            raise

    @classmethod
    def delete(cls, history_id: int) -> bool:
        """Deletes a purchase history entry (use with caution)."""
        history = cls.get_by_id(history_id)
        if not history:
            current_app.logger.warning(f"PurchaseHistory ID {history_id} not found for deletion.")
            return False

        current_app.logger.info(f"Deleting PurchaseHistory ID {history_id}")
        try:
            db.session.delete(history)
            db.session.commit()
            current_app.logger.info(f"PurchaseHistory ID {history_id} deleted successfully.")
            return True
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error deleting PurchaseHistory ID {history_id}: {str(e)}")
            raise