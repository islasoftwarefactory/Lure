from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional, List
from flask import current_app

class Currency(db.Model):
    __tablename__ = "currencies"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(3), unique=True, nullable=False, index=True)
    name = db.Column(db.String(50), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))

    # Relacionamento: Uma moeda pode ser usada em muitas transações
    transactions = db.relationship('Transaction', back_populates='currency_rel', lazy='dynamic')

    def __repr__(self):
        return f"<Currency {self.id}: {self.code}>"

    def serialize(self) -> Dict:
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    @classmethod
    def create(cls, data: Dict) -> 'Currency':
        """Creates a new currency"""
        code = data.get("code", "").upper()
        current_app.logger.info(f"Creating currency: {code}")
        if not code or len(code) != 3:
             raise ValueError("Invalid currency code provided. Must be 3 letters.")
        try:
            currency = cls(
                code=code,
                name=data["name"],
                is_active=data.get("is_active", True)
            )
            # Add validation if needed
            db.session.add(currency)
            db.session.commit()
            current_app.logger.info(f"Currency '{currency.code}' created successfully with ID {currency.id}")
            return currency
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error creating currency {code}: {str(e)}")
            raise

    @classmethod
    def get_by_id(cls, currency_id: int) -> Optional['Currency']:
        """Retrieves a currency by ID"""
        return cls.query.get(currency_id)

    @classmethod
    def get_by_code(cls, code: str) -> Optional['Currency']:
        """Retrieves a currency by its code (e.g., 'BRL')"""
        return cls.query.filter(cls.code == code.upper()).first()

    @classmethod
    def get_all(cls, active_only: bool = False) -> List['Currency']:
        """Retrieves all currencies, optionally only active ones"""
        query = cls.query
        if active_only:
            query = query.filter_by(is_active=True)
        return query.order_by(cls.code).all()

    @classmethod
    def update(cls, currency_id: int, data: Dict) -> Optional['Currency']:
        """Updates an existing currency"""
        currency = cls.get_by_id(currency_id)
        if currency:
            try:
                if "code" in data:
                     code = data["code"].upper()
                     if len(code) != 3:
                          raise ValueError("Invalid currency code provided. Must be 3 letters.")
                     currency.code = code
                currency.name = data.get("name", currency.name)
                currency.is_active = data.get("is_active", currency.is_active)
                # Add validation if needed
                db.session.commit()
                current_app.logger.info(f"Currency ID {currency_id} updated.")
                return currency
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(f"Error updating currency ID {currency_id}: {str(e)}")
                raise
        return None

    @classmethod
    def delete(cls, currency_id: int) -> bool:
        """Deletes a currency"""
        currency = cls.get_by_id(currency_id)
        if currency:
            if currency.transactions.count() > 0:
                 current_app.logger.warning(f"Attempt to delete currency ID {currency_id} which is in use.")
                 raise ValueError("Cannot delete currency that is currently assigned to transactions.")
            try:
                db.session.delete(currency)
                db.session.commit()
                current_app.logger.info(f"Currency ID {currency_id} deleted.")
                return True
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(f"Error deleting currency ID {currency_id}: {str(e)}")
                raise
        return False 