from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Optional, List

class AuthProvider(db.Model):
    __tablename__ = "auth_providers"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))

    # Relationship with users
    users = db.relationship('User', back_populates='auth_provider_rel', lazy='dynamic')

    def __repr__(self):
        return f"<AuthProvider id={self.id} name='{self.name}'>"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

def get_auth_provider_by_name(name: str) -> Optional[AuthProvider]:
    """Busca um provedor de autenticação pelo nome."""
    return AuthProvider.query.filter_by(name=name).first()

def get_auth_provider_by_id(provider_id: int) -> Optional[AuthProvider]:
    """Busca um provedor de autenticação pelo ID."""
    return AuthProvider.query.get(provider_id)

def get_all_auth_providers() -> List[AuthProvider]:
    """Retorna todos os provedores de autenticação."""
    return AuthProvider.query.all()