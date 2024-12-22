from ..connection import db
from datetime import datetime
import pytz
from typing import Dict, List
from flask import current_app

class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    total = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method_id = db.Column(db.Integer, db.ForeignKey('payment_methods.id'), nullable=False)
    checkout_url = db.Column(db.String(100), nullable=False) #Subistituri pela API
    status = db.Column(db.Boolean, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id'), nullable=True)

    def __repr__(self):
        return f"<Payment {self.id}, User_id: {self.user_id}, Total: {self.total}>"

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "total": float(self.total),
            "payment_method_id": self.payment_method_id,
            "checkout_url": self.checkout_url,
            "status": self.status,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

def create_payment(payment_data):
    """Creates a new payment"""
    current_app.logger.info("Starting payment creation")
    try:
        payment = Payment(**payment_data)
        db.session.add(payment)
        db.session.commit()
        current_app.logger.info(f"Payment created successfully")
        return payment
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating payment: {str(e)}")
        raise

def get_payment(payment_id):
    """Retrieves a payment by ID"""
    return Payment.query.get(payment_id)

def update_payment(payment_id, payment_data):
    """Updates an existing payment"""
    payment = get_payment(payment_id)
    if payment:
        for key, value in payment_data.items():
            setattr(payment, key, value)
        db.session.commit()
        return payment
    return None

def delete_payment(payment_id):
    """Deletes a payment"""
    payment = get_payment(payment_id)
    if payment:
        db.session.delete(payment)
        db.session.commit()
        return payment
    return None