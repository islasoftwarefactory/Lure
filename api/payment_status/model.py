from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional, List
from flask import current_app

class PaymentStatus(db.Model):
    __tablename__ = "payment_statuses"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False) # ex: pending, processing, succeeded, failed, refunded
    description = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))

    # Relacionamento: Um status pode estar em muitas transações
    transactions = db.relationship('Transaction', back_populates='status_rel', lazy='dynamic')

    def __repr__(self):
        return f"<PaymentStatus {self.id}: {self.name}>"

    def serialize(self) -> Dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    @classmethod
    def create(cls, data: Dict) -> 'PaymentStatus':
        """Creates a new payment status"""
        current_app.logger.info(f"Creating payment status: {data.get('name')}")
        try:
            status = cls(
                name=data["name"],
                description=data.get("description")
            )
            # Add validation if needed
            db.session.add(status)
            db.session.commit()
            current_app.logger.info(f"Payment status '{status.name}' created successfully with ID {status.id}")
            return status
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error creating payment status: {str(e)}")
            raise

    @classmethod
    def get_by_id(cls, status_id: int) -> Optional['PaymentStatus']:
        """Retrieves a payment status by ID"""
        return cls.query.get(status_id)

    @classmethod
    def get_by_name(cls, name: str) -> Optional['PaymentStatus']:
        """Retrieves a payment status by name"""
        return cls.query.filter_by(name=name).first()

    @classmethod
    def get_all(cls) -> List['PaymentStatus']:
        """Retrieves all payment statuses"""
        return cls.query.order_by(cls.id).all()

    @classmethod
    def update(cls, status_id: int, data: Dict) -> Optional['PaymentStatus']:
        """Updates an existing payment status"""
        status = cls.get_by_id(status_id)
        if status:
            try:
                status.name = data.get("name", status.name)
                status.description = data.get("description", status.description)
                # Add validation if needed
                db.session.commit()
                current_app.logger.info(f"Payment status ID {status_id} updated.")
                return status
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(f"Error updating payment status ID {status_id}: {str(e)}")
                raise
        return None

    @classmethod
    def delete(cls, status_id: int) -> bool:
        """Deletes a payment status"""
        status = cls.get_by_id(status_id)
        if status:
            # Add check: Prevent deletion if status is in use by transactions?
            if status.transactions.count() > 0:
                 current_app.logger.warning(f"Attempt to delete payment status ID {status_id} which is in use.")
                 raise ValueError("Cannot delete status that is currently assigned to transactions.")
            try:
                db.session.delete(status)
                db.session.commit()
                current_app.logger.info(f"Payment status ID {status_id} deleted.")
                return True
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(f"Error deleting payment status ID {status_id}: {str(e)}")
                raise
        return False 