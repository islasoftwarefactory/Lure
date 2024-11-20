from ..connection import db
from datetime import datetime
import pytz

class Address(db.Model):
    __tablename__ = "addresses"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    observation = db.Column(db.String(50), nullable=True)
    street = db.Column(db.String(30), nullable=False)
    number = db.Column(db.Integer, nullable=False)
    city = db.Column(db.String(30), nullable=False) 
    state = db.Column(db.String(2), nullable=False) 
    zip_code = db.Column(db.String(9), nullable=False)
    neighborhood = db.Column(db.String(30), nullable=False)
    complement = db.Column(db.String(40), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def __repr__(self):
        return f"<Address {self.id}, User_id: {self.user_id}, Street: {self.street}>"

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "observation": self.observation,
            "street": self.street,
            "number": self.number,
            "city": self.city,
            "state": self.state,
            "zip_code": self.zip_code,
            "neighborhood": self.neighborhood,
            "complement": self.complement,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }