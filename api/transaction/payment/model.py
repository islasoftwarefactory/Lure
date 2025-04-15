from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional, List
from flask import current_app
import uuid # Importar UUID
from api.currency.model import Currency # Importar a classe Currency
from api.user.model import User # Importar User

class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    purchase_id = db.Column(db.String(36), db.ForeignKey('purchases.id'), nullable=False) # UUID é string
    method_id = db.Column(db.Integer, db.ForeignKey('transaction_methods.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), nullable=False, default='BRL')
    currency_id = db.Column(db.Integer, db.ForeignKey('currencies.id'), nullable=False)
    gateway_payment_id = db.Column(db.String(255), nullable=True, index=True) # ID da transação no gateway (ex: pi_xxxx no Stripe)
    payment_status_id = db.Column(db.Integer, db.ForeignKey('payment_statuses.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))

    # Relacionamentos
    user_rel = db.relationship('User', back_populates='transactions')
    purchase_rel = db.relationship('Purchase', back_populates='transactions')
    method_rel = db.relationship('TransactionMethod', back_populates='transactions')
    status_rel = db.relationship('PaymentStatus', back_populates='transactions')
    currency_rel = db.relationship('Currency', back_populates='transactions')

    def __repr__(self):
        return f"<Transaction {self.id} for Purchase {self.purchase_id}>"

    def serialize(self) -> Dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "purchase_id": self.purchase_id,
            "method_id": self.method_id,
            "amount": float(self.amount),
            "currency": self.currency,
            "currency_id": self.currency_id,
            "gateway_payment_id": self.gateway_payment_id,
            "payment_status_id": self.payment_status_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "status": self.status_rel.serialize() if self.status_rel else None,
            "method": self.method_rel.serialize() if self.method_rel else None,
            "currency": self.currency_rel.serialize() if self.currency_rel else None,
        }

    @classmethod
    def create(cls, data: Dict) -> 'Transaction':
        """Creates a new transaction"""
        current_app.logger.info(f"Creating transaction for purchase ID: {data.get('purchase_id')}")
        try:
            # Find the initial payment status (e.g., 'pending')
            initial_status = PaymentStatus.get_by_name('pending') # Assumes 'pending' status exists
            if not initial_status:
                raise ValueError("Initial 'pending' payment status not found.")

            if "user_id" not in data:
                raise ValueError("Missing 'user_id' for transaction creation.")

            transaction = cls(
                user_id=data["user_id"],
                purchase_id=data["purchase_id"],
                method_id=data["method_id"],
                amount=data["amount"],
                currency=data.get("currency", "BRL"),
                currency_id=data.get("currency_id"),
                gateway_payment_id=data.get("gateway_payment_id"),
                payment_status_id=data.get("payment_status_id", initial_status.id) # Default to pending
            )
            # Add validation if needed
            db.session.add(transaction)
            db.session.commit()
            current_app.logger.info(f"Transaction {transaction.id} created successfully for purchase {transaction.purchase_id}")
            return transaction
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error creating transaction: {str(e)}")
            raise

    @classmethod
    def get_by_id(cls, transaction_id: int) -> Optional['Transaction']:
        """Retrieves a transaction by ID"""
        return cls.query.get(transaction_id)

    @classmethod
    def get_by_gateway_id(cls, gateway_id: str) -> Optional['Transaction']:
        """Retrieves a transaction by Gateway Payment ID"""
        return cls.query.filter_by(gateway_payment_id=gateway_id).first()

    @classmethod
    def get_all_for_purchase(cls, purchase_id: str) -> List['Transaction']:
        """Retrieves all transactions for a specific purchase"""
        return cls.query.filter_by(purchase_id=purchase_id).order_by(cls.created_at.desc()).all()

    @classmethod
    def update(cls, transaction_id: int, data: Dict) -> Optional['Transaction']:
        """Updates an existing transaction"""
        transaction = cls.get_by_id(transaction_id)
        if transaction:
            try:
                # Update only specific fields, typically status and gateway ID
                if "payment_status_id" in data:
                    transaction.payment_status_id = data["payment_status_id"]
                if "gateway_payment_id" in data:
                     transaction.gateway_payment_id = data["gateway_payment_id"]
                # Add other updatable fields as needed
                # Add validation if needed
                db.session.commit()
                current_app.logger.info(f"Transaction ID {transaction_id} updated.")
                return transaction
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(f"Error updating transaction ID {transaction_id}: {str(e)}")
                raise
        return None

    # Delete might not be common for transactions, usually status changes.
    # Implement if needed, but be cautious.
    # @classmethod
    # def delete(cls, transaction_id: int) -> bool: ... 