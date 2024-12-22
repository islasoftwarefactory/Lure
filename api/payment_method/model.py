from ..connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional

class PaymentMethod(db.Model):
    __tablename__ = "payment_methods"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(25), nullable=False)
    long_name = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def __repr__(self):
        return f"<PaymentMethod {self.id}, Name: {self.name}>"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "long_name": self.long_name,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

def create_payment_method(payment_method_data: Dict) -> Optional[PaymentMethod]:
    """Creates a new payment method"""
    current_app.logger.info("Starting payment method creation")
    try:
        payment_method = PaymentMethod(
            name=payment_method_data["name"],
            long_name=payment_method_data["long_name"]
        )
        db.session.add(payment_method)
        db.session.commit()
        current_app.logger.info(f"Payment method created successfully")
        return payment_method
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating payment method: {str(e)}")
        raise

def get_payment_method(payment_method_id: int) -> Optional[PaymentMethod]:
    """Retrieves a payment method by ID"""
    return PaymentMethod.query.get(payment_method_id)

def update_payment_method(payment_method_id: int, payment_method_data: Dict) -> Optional[PaymentMethod]:
    """Updates an existing payment method"""
    payment_method = get_payment_method(payment_method_id)
    if payment_method:
        for key, value in payment_method_data.items():
            setattr(payment_method, key, value)
        db.session.commit()
        return payment_method
    return None

def delete_payment_method(payment_method_id: int) -> Optional[PaymentMethod]:
    """Deletes a payment method"""
    payment_method = get_payment_method(payment_method_id)
    if payment_method:
        db.session.delete(payment_method)
        db.session.commit()
        return payment_method
    return None