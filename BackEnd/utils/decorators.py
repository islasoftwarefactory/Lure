from functools import wraps
from flask import request, jsonify
from .jwt_utils import verify_token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        user_id = verify_token(token.split()[1] if token.startswith('Bearer ') else token)
        if not user_id:
            return jsonify({'message': 'Token is invalid or expired!'}), 401
        
        return f(user_id, *args, **kwargs)
    return decorated