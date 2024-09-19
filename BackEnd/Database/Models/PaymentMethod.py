from ..connection import db
from datetime import datetime
import pytz

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