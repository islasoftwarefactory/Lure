from datetime import datetime, timedelta
from os import getenv

import jwt

JWT_SECRET_KEY = getenv('JWT_SECRET_KEY')
JWT_EXPIRATION_MINUTES = int(getenv('JWT_EXPIRATION_MINUTES', 30))

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
        user_id = payload['sub']
        # Aceita tanto IDs numéricos (usuários logados) quanto strings (anônimos)
        return user_id
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None