from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional, List
from flask import current_app
from sqlalchemy import UniqueConstraint, Enum as SQLAlchemyEnum
import enum

class AuthProviderEnum(enum.Enum):
    GOOGLE = 'Google'  # Usuário via Google SSO
    APPLE = 'Apple'    # Usuário via Apple SSO

class User(db.Model):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint('auth_provider', 'provider_id', name='uq_provider_identity'),)

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(256), unique=True, nullable=False)
    name = db.Column(db.String(40), nullable=False)
    photo = db.Column(db.String(256), nullable=True)
    admin = db.Column(db.Boolean, nullable=False, default=False)
    auth_provider = db.Column(SQLAlchemyEnum(AuthProviderEnum, name='auth_provider_enum'), nullable=False)
    provider_id = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))

    purchases = db.relationship('Purchase', back_populates='user_rel', lazy='dynamic', order_by='Purchase.created_at.desc()')
    addresses = db.relationship('Address', back_populates='user_rel', lazy='dynamic', cascade="all, delete-orphan")
    transactions = db.relationship('Transaction', back_populates='user_rel', lazy='dynamic')
    favorites = db.relationship('Favorite', back_populates='user_rel', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User id={self.id} email='{self.email}' provider='{self.auth_provider.value}' provider_id='{self.provider_id}' admin={self.admin}>"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "photo": self.photo,
            "admin": self.admin,
            "auth_provider": self.auth_provider.value,
            "provider_id": self.provider_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

def find_user_by_provider(auth_provider: AuthProviderEnum, provider_id: str) -> Optional[User]:
    """Busca um usuário pelo provedor e ID específico daquele provedor."""
    return User.query.filter_by(auth_provider=auth_provider, provider_id=provider_id).first()

def find_user_by_email(email: str) -> Optional[User]:
    """Busca um usuário pelo email."""
    return User.query.filter_by(email=email).first()

def create_user(user_data: Dict) -> User:
    """
    Cria um novo usuário a partir dos dados recebidos do provedor SSO.
    Espera-se que user_data contenha pelo menos: name, email, auth_provider, provider_id.
    """
    current_app.logger.info(f"Iniciando criação de usuário via {user_data.get('auth_provider')}")

    required_fields = ['name', 'email', 'auth_provider', 'provider_id']
    if not all(field in user_data for field in required_fields):
        raise ValueError(f"Dados incompletos para criar usuário. Campos necessários: {required_fields}")

    try:
        auth_provider_enum = AuthProviderEnum(user_data['auth_provider'])
    except ValueError:
        raise ValueError(f"Provedor de autenticação inválido: {user_data['auth_provider']}. Válidos: {[e.value for e in AuthProviderEnum]}")

    existing_user = find_user_by_provider(auth_provider_enum, user_data['provider_id'])
    if existing_user:
        current_app.logger.warning(f"Tentativa de criar usuário duplicado: {auth_provider_enum.value} - {user_data['provider_id']}")
        return existing_user

    try:
        user = User(
            name=user_data["name"],
            email=user_data["email"],
            photo=user_data.get("photo"),
            admin=user_data.get("admin", False),
            auth_provider=auth_provider_enum,
            provider_id=user_data["provider_id"]
        )
        db.session.add(user)
        db.session.commit()
        current_app.logger.info(f"Usuário criado com sucesso: {user.email} via {user.auth_provider.value}")
        return user
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erro ao criar usuário {user_data.get('email')} via {user_data.get('auth_provider')}: {str(e)}")
        raise

def get_user(user_id: int) -> Optional[User]:
    """Recupera um usuário pelo ID interno do sistema."""
    return User.query.get(user_id)

def update_user(user_id: int, user_data: Dict) -> Optional[User]:
    """Atualiza dados de um usuário existente (ex: nome, foto, admin)."""
    user = get_user(user_id)
    if not user:
        current_app.logger.warning(f"Tentativa de atualizar usuário inexistente: ID {user_id}")
        return None

    current_app.logger.info(f"Atualizando usuário ID {user_id}")
    try:
        allowed_updates = ['name', 'photo', 'admin']
        updated = False
        for key, value in user_data.items():
            if key in allowed_updates:
                if getattr(user, key) != value:
                    setattr(user, key, value)
                    updated = True
            elif key in ['email', 'auth_provider', 'provider_id']:
                current_app.logger.warning(f"Tentativa de modificar campo não permitido ('{key}') para usuário ID {user_id}")
            # Ignora outros campos não permitidos

        if updated:
            db.session.commit()
            current_app.logger.info(f"Usuário ID {user_id} atualizado com sucesso.")
        else:
            current_app.logger.info(f"Nenhuma alteração detectada para usuário ID {user_id}.")

        return user
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erro ao atualizar usuário ID {user_id}: {str(e)}")
        raise

def delete_user(user_id: int) -> bool:
    """Deleta um usuário pelo ID interno."""
    user = get_user(user_id)
    if user:
        try:
            db.session.delete(user)
            db.session.commit()
            current_app.logger.info(f"Usuário ID {user_id} ({user.email}) deletado.")
            return True
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Erro ao deletar usuário ID {user_id}: {str(e)}")
            raise
    current_app.logger.warning(f"Tentativa de deletar usuário inexistente: ID {user_id}")
    return False

def is_admin(user_id: int) -> bool:
    """Verifica se um usuário é admin."""
    user = get_user(user_id)
    return user.admin if user else False

def get_all_admins() -> List[User]:
    """Recupera todos os usuários que são administradores."""
    return User.query.filter_by(admin=True).all()

def promote_to_admin(user_id: int) -> Optional[User]:
    """Promove um usuário para administrador."""
    user = get_user(user_id)
    if not user:
        current_app.logger.warning(f"Tentativa de promover usuário inexistente: ID {user_id}")
        return None
    
    if user.admin:
        current_app.logger.info(f"Usuário ID {user_id} já é administrador.")
        return user
    
    try:
        user.admin = True
        db.session.commit()
        current_app.logger.info(f"Usuário ID {user_id} ({user.email}) promovido para administrador.")
        return user
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erro ao promover usuário ID {user_id} para admin: {str(e)}")
        raise

def demote_from_admin(user_id: int) -> Optional[User]:
    """Remove privilégios de administrador de um usuário."""
    user = get_user(user_id)
    if not user:
        current_app.logger.warning(f"Tentativa de rebaixar usuário inexistente: ID {user_id}")
        return None
    
    if not user.admin:
        current_app.logger.info(f"Usuário ID {user_id} não é administrador.")
        return user
    
    try:
        user.admin = False
        db.session.commit()
        current_app.logger.info(f"Usuário ID {user_id} ({user.email}) rebaixado de administrador.")
        return user
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erro ao rebaixar usuário ID {user_id} de admin: {str(e)}")
        raise
