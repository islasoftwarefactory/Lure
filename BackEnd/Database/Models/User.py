from ..connection import db
from datetime import datetime
import pytz

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(40), nullable=False)
    email = db.Column(db.String(256), unique=True, nullable=False)
    photo = db.Column(db.String(256))  # Alterar para API de imagem "URL"
    sso_type = db.Column(db.Enum('Google', 'Apple', name='sso_type_enum'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def __repr__(self):
        return f"<User {self.id}>"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "photo": self.photo,
            "sso_type": self.sso_type,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
