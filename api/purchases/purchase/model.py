from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional, List
from flask import current_app
import uuid # Importar UUID

class Purchase(db.Model):
    __tablename__ = "purchases"

    # Usando UUID como string
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    shipping_address_id = db.Column(db.Integer, db.ForeignKey('addresses.id'), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False, default=0.0)
    shipping_cost = db.Column(db.Numeric(10, 2), nullable=False, default=0.0)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0.0) # subtotal + shipping
    estimated_delivery_date = db.Column(db.Date, nullable=True)
    tracking_number = db.Column(db.String(100), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))

    # Relacionamentos
    user_rel = db.relationship('User', back_populates='purchases')
    address_rel = db.relationship('Address', back_populates='purchases')
    items = db.relationship('PurchaseItem', back_populates='purchase_rel', cascade="all, delete-orphan", lazy='dynamic')
    history = db.relationship('PurchaseHistory', back_populates='purchase_rel', cascade="all, delete-orphan", lazy='dynamic')
    transactions = db.relationship('Transaction', back_populates='purchase_rel', lazy='dynamic')

    def __repr__(self):
        return f"<Purchase {self.id} by User {self.user_id}>"

    def calculate_totals(self):
        """Calculates subtotal and total based on items"""
        self.subtotal = sum(item.total_price for item in self.items)
        # Add logic for shipping_cost if applicable
        self.total_amount = self.subtotal + self.shipping_cost

    def serialize(self, include_items=True, include_history=False, include_transactions=False) -> Dict:
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "shipping_address_id": self.shipping_address_id,
            "subtotal": float(self.subtotal),
            "shipping_cost": float(self.shipping_cost),
            "total_amount": float(self.total_amount),
            "estimated_delivery_date": self.estimated_delivery_date.isoformat() if self.estimated_delivery_date else None,
            "tracking_number": self.tracking_number,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "shipping_address": self.address_rel.serialize() if self.address_rel else None # Include serialized address
        }
        if include_items:
             data["items"] = [item.serialize() for item in self.items]
        if include_history:
             data["history"] = [hist.serialize() for hist in self.history.order_by(PurchaseHistory.created_at.asc())]
        if include_transactions:
             data["transactions"] = [trans.serialize() for trans in self.transactions.order_by(Transaction.created_at.asc())]
        return data

    @classmethod
    def create(cls, data: Dict) -> 'Purchase':
        """Creates a new purchase"""
        current_app.logger.info(f"Creating purchase for user ID: {data.get('user_id')}")
        try:
            purchase = cls(
                user_id=data["user_id"],
                shipping_address_id=data["shipping_address_id"],
                # Totals will be calculated later or passed in
                subtotal=data.get("subtotal", 0.0),
                shipping_cost=data.get("shipping_cost", 0.0),
                total_amount=data.get("total_amount", 0.0),
                notes=data.get("notes")
            )
            # Add validation if needed
            db.session.add(purchase)
            # We might commit later after adding items and calculating totals
            # db.session.commit()
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
                # Update specific fields like status (if added), tracking, notes, etc.
                if "tracking_number" in data:
                    purchase.tracking_number = data["tracking_number"]
                if "estimated_delivery_date" in data:
                    purchase.estimated_delivery_date = data["estimated_delivery_date"] # Needs date parsing
                if "notes" in data:
                    purchase.notes = data["notes"]
                # Recalculate totals if items change (handled separately)
                # Add validation if needed
                db.session.commit()
                current_app.logger.info(f"Purchase ID {purchase_id} updated.")
                return purchase
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(f"Error updating purchase ID {purchase_id}: {str(e)}")
                raise
        return None

    # Delete might be complex due to relationships (items, history, transactions)
    # Consider soft delete (e.g., setting a 'canceled' status) instead.
    # @classmethod
    # def delete(cls, purchase_id: str) -> bool: ... 