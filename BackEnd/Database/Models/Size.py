from ..connection import db
from datetime import datetime
import pytz

class Size(db.Model):
    __tablename__ = "sizes"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False)
    long_name = db.Column(db.String(35), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def __repr__(self):
        return f"<Size {self.id}, Name: {self.name}>"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "long_name": self.long_name,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }