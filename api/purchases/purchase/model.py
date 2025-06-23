from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional, List
from flask import current_app
from api.transaction.payment.model import Transaction
from api.purchases.history.model import PurchaseHistory
import uuid # Importar UUID

class Purchase(db.Model):
    __tablename__ = "purchases"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    currency_id = db.Column(db.Integer, db.ForeignKey('currencies.id'), nullable=False)
    # Link to shipping address
    shipping_address_id = db.Column(db.Integer, db.ForeignKey('addresses.id'), nullable=False)
    # ORM relationship to Address for shipping
    shipping_address_rel = db.relationship('Address', back_populates='purchases')

    subtotal = db.Column(db.Numeric(10, 2), nullable=False, default=0.0)
    shipping_cost = db.Column(db.Numeric(10, 2), nullable=False, default=0.0)
    taxes = db.Column(db.Numeric(10, 2), nullable=False, default=0.0)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0.0) # subtotal + shipping + taxes
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))

    # Relacionamentos
    user_rel = db.relationship('User', back_populates='purchases')
    currency_rel = db.relationship('Currency', back_populates='purchases')
    
    # 1:1 com ShippingStatus
    shipping_status_rel = db.relationship('ShippingStatus', back_populates='purchase', uselist=False)

    items = db.relationship('PurchaseItem', back_populates='purchase_rel', cascade="all, delete-orphan", lazy='dynamic')
    history = db.relationship('PurchaseHistory', back_populates='purchase_rel', cascade="all, delete-orphan", lazy='dynamic')
    transactions = db.relationship('Transaction', back_populates='purchase_rel', lazy='dynamic')

    def __repr__(self):
        return f"<Purchase {self.id} by User {self.user_id} (Currency ID: {self.currency_id})>"

    def calculate_totals(self):
        """Calculates subtotal and total based on items"""
        self.subtotal = sum(item.total_price for item in self.items)
        # Add logic for shipping_cost and taxes if applicable
        self.total_amount = self.subtotal + self.shipping_cost + self.taxes

    def serialize(self, include_items=True, include_history=False, include_transactions=False, include_shipping=False, include_address=False) -> Dict:
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "currency_id": self.currency_id,
            "subtotal": float(self.subtotal),
            "shipping_cost": float(self.shipping_cost),
            "taxes": float(self.taxes),
            "total_amount": float(self.total_amount),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "shipping_address_id": self.shipping_address_id
        }
        if include_items:
             data["items"] = [item.serialize() for item in self.items]
        if include_history:
             data["history"] = [hist.serialize() for hist in self.history.order_by(PurchaseHistory.created_at.asc())]
        if include_transactions:
             data["transactions"] = [trans.serialize() for trans in self.transactions.order_by(Transaction.created_at.asc())]
        if include_shipping and self.shipping_status_rel:
             data["shipping_status"] = self.shipping_status_rel.serialize()
        if include_address and self.shipping_address_rel:
            data["address"] = self.shipping_address_rel.serialize()

        return data

    @classmethod
    def create(cls, data: Dict) -> 'Purchase':
        """Creates a new purchase"""
        current_app.logger.info(f"Creating purchase for user ID: {data.get('user_id')}")
        try:
            purchase = cls(
                user_id=data["user_id"],
                currency_id=data["currency_id"],
                shipping_address_id=data.get("shipping_address_id"),
                subtotal=data.get("subtotal", 0.0),
                shipping_cost=data.get("shipping_cost", 0.0),
                taxes=data.get("taxes", 0.0),
                total_amount=data.get("total_amount", 0.0),
            )
            db.session.add(purchase)
            current_app.logger.info(f"Purchase {purchase.id} created for user {purchase.user_id}")
            return purchase
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error creating purchase: {str(e)}")
            raise

    @classmethod
    def get_by_id(cls, purchase_id: str) -> Optional['Purchase']:
        """Retrieves a purchase by ID (UUID String)"""
        return cls.query.get(purchase_id)

    @classmethod
    def get_all_for_user(cls, user_id: int) -> List['Purchase']:
        """Retrieves all purchases for a specific user"""
        return cls.query.filter_by(user_id=user_id).order_by(cls.created_at.desc()).all()

    @classmethod
    def update(cls, purchase_id: str, data: Dict) -> Optional['Purchase']:
        """Updates an existing purchase"""
        purchase = cls.get_by_id(purchase_id)
        if purchase:
            try:
                if "currency_id" in data:
                    purchase.currency_id = data["currency_id"]
                if "subtotal" in data:
                    purchase.subtotal = data["subtotal"]
                if "shipping_cost" in data:
                    purchase.shipping_cost = data["shipping_cost"]
                if "taxes" in data:
                    purchase.taxes = data["taxes"]
                if "total_amount" in data:
                    purchase.total_amount = data["total_amount"]
                db.session.commit()
                current_app.logger.info(f"Purchase ID {purchase_id} updated.")
                return purchase
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(f"Error updating purchase ID {purchase_id}: {str(e)}")
                raise
        return None