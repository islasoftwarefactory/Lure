import jwt
from datetime import datetime, timedelta
from flask import current_app
import os
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
JWT_EXPIRATION_MINUTES = int(os.getenv('JWT_EXPIRATION_MINUTES', 30))

def generate_token(user_id):
    """
    Gera um token JWT para o usuário.
    """
    payload = {
        'exp': datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION_MINUTES),
        'iat': datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')

def verify_token(token):
    """
    Verifica e decodifica um token JWT.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
        return payload['sub']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None