print("=== Carregando módulo decorators.py ===", flush=True)

from functools import wraps
from flask import request, jsonify, make_response, g
from api.utils.security.jwt.jwt_utils import verify_token, decode_token
import jwt
from flask import current_app

print("=== Módulo decorators.py carregado ===", flush=True)

# Lista de rotas públicas que não requerem autenticação
PUBLIC_ROUTES = [
    '/contact/create',  # Rota de criação de contato
    # Adicione outras rotas públicas aqui se necessário
]

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        print("\n=== INÍCIO DA REQUISIÇÃO (decorator) ===", flush=True)
        print(f"Método: {request.method}", flush=True)

        # Flask-CORS agora lida com OPTIONS automaticamente
        # if request.method == 'OPTIONS':
        #     response = make_response()
        #     response.headers.add('Access-Control-Allow-Origin', 'https://locked.lureclo.com')
        #     response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        #     response.headers.add('Access-Control-Allow-Methods', 'GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS')
        #     response.headers.add('Access-Control-Allow-Credentials', 'true')
        #     response.headers.add('Access-Control-Max-Age', '86400')
        #     return response, 200
            
        # Verifica se a rota atual está na lista de rotas públicas
        if request.path in PUBLIC_ROUTES:
            return f(*args, **kwargs)

        print("\n=== Validação de Token (decorator) ===", flush=True)
        token = request.headers.get("Authorization")
        
        if not token:
            print("❌ Token ausente no header (decorator)", flush=True)
            return jsonify({"message": "Token ausente!"}), 401
            
        if token.startswith("Bearer "):
            token = token.split()[1]
            print("✓ Bearer token encontrado (decorator)", flush=True)
        
        print(f"Token recebido (decorator): {token[:20]}...", flush=True)
        
        try:
            user_id = verify_token(token)
            print(f"✓ Token válido para user_id: {user_id} (decorator)", flush=True)
            kwargs['current_user_id'] = user_id
            return f(*args, **kwargs)
        except Exception as e:
            print(f"❌ Erro na validação do token (decorator): {str(e)}", flush=True)
            return jsonify({"message": "Token inválido ou expirado!"}), 401
            
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        print("\n=== INÍCIO DA REQUISIÇÃO ADMIN (decorator) ===", flush=True)
        print(f"Método: {request.method}", flush=True)
        
        token = request.headers.get("Authorization")
        if not token:
            print("❌ Token ausente no header (admin_required)", flush=True)
            return jsonify({"message": "Token ausente!"}), 401

        if token.startswith("Bearer "):
            token = token.split()[1]
            print("✓ Bearer token encontrado (admin_required)", flush=True)
        
        print(f"Token recebido (admin_required): {token[:20]}...", flush=True)
        
        try:
            user_id = verify_token(token)
            print(f"✓ Token válido para user_id: {user_id} (admin_required)", flush=True)
            
            # Importação dinâmica para evitar circular imports
            from api.user.model import is_admin
            
            if not is_admin(user_id):
                print(f"❌ Usuário ID {user_id} não tem privilégios de admin", flush=True)
                current_app.logger.warning(f"Usuário ID {user_id} tentou acessar endpoint admin sem permissão.")
                return jsonify({"message": "Acesso negado. Privilégios de administrador necessários."}), 403
                
            print(f"✓ Usuário ID {user_id} confirmado como admin", flush=True)
            kwargs['current_user_id'] = user_id
            return f(*args, **kwargs)
        except Exception as e:
            print(f"❌ Erro na validação do token (admin_required): {str(e)}", flush=True)
            return jsonify({"message": "Token inválido ou expirado!"}), 401
            
    return decorated

def optional_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].replace('Bearer ', '')

        if not token:
            return f(None, *args, **kwargs)  # Passa None como current_user_id

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user_id = data['id']
            return f(current_user_id, *args, **kwargs)
        except:
            return f(None, *args, **kwargs)  # Em caso de erro no token, passa None
    return decorated

def optional_token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token:
            return f(current_user_id=None, *args, **kwargs)
            
        try:
            current_user_id = decode_token(token)
            return f(current_user_id=current_user_id, *args, **kwargs)
        except:
            return f(current_user_id=None, *args, **kwargs)
            
    return decorated