from datetime import datetime, timedelta
from dotenv import load_dotenv
import jwt
import os
from pathlib import Path
from flask import current_app

env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev_secret_key")  # valor default para desenvolvimento
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", "30"))  # valor default de 30 minutos

def generate_token(user_id):
    """Generate a JWT token for a user"""
    try:
        payload = {
            'exp': datetime.utcnow() + timedelta(days=1),
            'iat': datetime.utcnow(),
            'sub': str(user_id)
        }
        return jwt.encode(
            payload,
            current_app.config.get('SECRET_KEY'),
            algorithm='HS256'
        )
    except Exception as e:
        return str(e)

def verify_token(token):
    """Verify if a token is valid"""
    try:
        payload = jwt.decode(
            token,
            current_app.config.get('SECRET_KEY'),
            algorithms=['HS256']
        )
        return True, payload['sub']
    except jwt.ExpiredSignatureError:
        return False, 'Token expired. Please log in again.'
    except jwt.InvalidTokenError:
        return False, 'Invalid token. Please log in again.'

def decode_token(token):
    """Decode a JWT token and return the user_id"""
    try:
        payload = jwt.decode(
            token,
            current_app.config.get('SECRET_KEY'),
            algorithms=['HS256']
        )
        return payload['sub']
    except jwt.ExpiredSignatureError:
        raise Exception('Token expired')
    except jwt.InvalidTokenError:
        raise Exception('Invalid token')