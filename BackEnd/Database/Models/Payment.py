from ..connection import db
from datetime import datetime
import pytz

class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    cart = db.relationship('Cart', backref='payment', lazy=True)
    total = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method_id = db.Column(db.Integer, db.ForeignKey('payment_methods.id'), nullable=False)
    checkout_url = db.Column(db.String(100), nullable=False)
    status = db.Column(db.Boolean, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))

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