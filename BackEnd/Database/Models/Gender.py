from ..connection import db
from datetime import datetime
import pytz

class Gender(db.Model):
    __tablename__ = "genders"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False)
    long_name = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def __repr__(self):
        return f"<Gender {self.id}, Name: {self.name}>"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "long_name": self.long_name,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }