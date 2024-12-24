from datetime import datetime, timedelta
from dotenv import load_dotenv
import jwt
import os
from pathlib import Path

env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev_secret_key")  # valor default para desenvolvimento
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", "30"))  # valor default de 30 minutos

def generate_token(user_id):
    """a
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
        user_id = payload['sub']
        # Aceita tanto IDs numéricos (usuários logados) quanto strings (anônimos)
        return user_id
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None