from ..connection import db
from datetime import datetime
import pytz

class ImageCategory(db.Model):
    __tablename__ = "image_categories"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(40), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def __repr__(self):
        return f"<ImageCategory {self.id}, Name: {self.name}>"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }