from ..connection import db
from datetime import datetime
import pytz

class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    gender_id = db.Column(db.Integer, db.ForeignKey('genders.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def __repr__(self):
        return f"<Category {self.id}, Name: {self.name}>"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "gender_id": self.gender_id,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }