from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional, List
from flask import current_app

class TransactionMethod(db.Model):
    __tablename__ = "transaction_methods"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False) # ex: 'stripe', 'paypal'
    display_name = db.Column(db.String(100), nullable=False) # ex: 'Stripe', 'PayPal'
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))

    # Relacionamento: Um método pode ser usado em muitas transações
    transactions = db.relationship('Transaction', back_populates='method_rel', lazy='dynamic')

    def __repr__(self):
        return f"<TransactionMethod {self.id}: {self.name}>"

    def serialize(self) -> Dict:
        return {
            "id": self.id,
            "name": self.name,
            "display_name": self.display_name,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    @classmethod
    def create(cls, data: Dict) -> 'TransactionMethod':
        """Creates a new transaction method"""
        current_app.logger.info(f"Creating transaction method: {data.get('name')}")
        try:
            method = cls(
                name=data["name"],
                display_name=data["display_name"],
                is_active=data.get("is_active", True)
            )
            # Add validation if needed
            db.session.add(method)
            db.session.commit()
            current_app.logger.info(f"Transaction method '{method.name}' created successfully with ID {method.id}")
            return method
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error creating transaction method: {str(e)}")
            raise

    @classmethod
    def get_by_id(cls, method_id: int) -> Optional['TransactionMethod']:
        """Retrieves a transaction method by ID"""
        return cls.query.get(method_id)

    @classmethod
    def get_by_name(cls, name: str) -> Optional['TransactionMethod']:
        """Retrieves a transaction method by name"""
        return cls.query.filter_by(name=name).first()

    @classmethod
    def get_all(cls, active_only: bool = False) -> List['TransactionMethod']:
        """Retrieves all transaction methods, optionally only active ones"""
        query = cls.query
        if active_only:
            query = query.filter_by(is_active=True)
        return query.order_by(cls.id).all()

    @classmethod
    def update(cls, method_id: int, data: Dict) -> Optional['TransactionMethod']:
        """Updates an existing transaction method"""
        method = cls.get_by_id(method_id)
        if method:
            try:
                method.name = data.get("name", method.name)
                method.display_name = data.get("display_name", method.display_name)
                method.is_active = data.get("is_active", method.is_active)
                # Add validation if needed
                db.session.commit()
                current_app.logger.info(f"Transaction method ID {method_id} updated.")
                return method
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(f"Error updating transaction method ID {method_id}: {str(e)}")
                raise
        return None

    @classmethod
    def delete(cls, method_id: int) -> bool:
        """Deletes a transaction method"""
        method = cls.get_by_id(method_id)
        if method:
            # Add check: Prevent deletion if method is in use by transactions?
            if method.transactions.count() > 0:
                 current_app.logger.warning(f"Attempt to delete transaction method ID {method_id} which is in use.")
                 raise ValueError("Cannot delete method that is currently assigned to transactions.")
            try:
                db.session.delete(method)
                db.session.commit()
                current_app.logger.info(f"Transaction method ID {method_id} deleted.")
                return True
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(f"Error deleting transaction method ID {method_id}: {str(e)}")
                raise
        return False 