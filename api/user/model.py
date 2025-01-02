from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional
from flask import current_app

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

def create_user(user_data: Dict) -> Optional[User]:
    """Creates a new user"""
    current_app.logger.info("Starting user creation")
    try:
        user = User(
            name=user_data["name"],
            email=user_data["email"],
            photo=user_data.get("photo"),
            sso_type=user_data["sso_type"]
        )
        db.session.add(user)
        db.session.commit()
        current_app.logger.info(f"User created successfully: {user.email}")
        return user
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating user: {str(e)}")
        raise

def get_user(user_id: int) -> Optional[User]:
    """Retrieves a user by ID"""
    return User.query.get(user_id)

def update_user(user_id: int, user_data: Dict) -> Optional[User]:
    """Updates an existing user"""
    user = get_user(user_id)
    if user:
        for key, value in user_data.items():
            setattr(user, key, value)
        db.session.commit()
        return user
    return None

def delete_user(user_id: int) -> Optional[User]:
    """Deletes a user"""
    user = get_user(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return user
    return None
