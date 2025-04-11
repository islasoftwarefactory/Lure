from flask import Flask, request, jsonify, g, make_response
from api.utils.db.config import database_uri
from api.utils.db.connection import connect_to_db, init_db, db
from sqlalchemy.exc import OperationalError
from api.blueprints import register_blueprints
from flask_migrate import Migrate
from flask_cors import CORS
from api.utils.db.create_tables import create_tables
from sqlalchemy import inspect
from flask_mail import Mail
from api.contact.routes import blueprint as contact_blueprint

from dotenv import load_dotenv
import os

from datetime import datetime

load_dotenv()
application = Flask(__name__)

# --- Inicializar Flask-CORS AQUI ---
# Permitir requisições das origens do seu frontend (dev e HMR)
# supports_credentials=True é importante para permitir envio de cookies ou cabeçalhos de autenticação
CORS(application, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:8081"]}}, supports_credentials=True)
# ------------------------------------

# Configuração do email iCloud
application.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
application.config['MAIL_PORT'] = os.getenv('MAIL_PORT')
application.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS')
application.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
application.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

# Inicializar Flask-Mail
mail = Mail(application)

register_blueprints(application)

application.config["SQLALCHEMY_DATABASE_URI"] = database_uri()
application.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
application.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

init_db(application)
migrate = Migrate(application, db)

try:
    connect_to_db(application)
    print("Connected successfully")
    
    with application.app_context():
        # Desabilita temporariamente o rastreamento de modificações
        application.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        
        try:
            # Primeiro, verifica se as tabelas já existem
            inspector = inspect(db.engine)
            existing_tables = inspector.get_table_names()
            
            if not existing_tables:
                # Se não existirem tabelas, cria todas de uma vez
                create_tables()
                print("Tables created successfully")
            else:
                print("Tables already exist, skipping creation")
                
        except Exception as e:
            print(f"Error during database initialization: {str(e)}")
            db.session.rollback()
            raise
        
except OperationalError as e:
    print("Connection failed: OperationalError")
    raise
except Exception as e:
    print("Error:", e)
    raise


@application.before_request
def verify_jwt():
    # Permite que requisições OPTIONS passem diretamente para o Flask-CORS
    if request.method == 'OPTIONS':
        return None # Retorna None para continuar o processamento normal (Flask-CORS)

    # Permitir todas as requisições OPTIONS automaticamente (Flask-CORS cuida disso agora)
    # A lógica principal aqui é verificar o token para rotas NÃO públicas
    # if request.method == 'OPTIONS': # Linha antiga removida/comentada
    #     return None

    public_endpoints = [
        'health',
        'user.get_anonymous_token',
        'scraping.create',
        'user.create',
        'static',
        # 'handle_options', # Remover da lista se a rota foi removida
        'contact_type.create',
        'contact_type.read',
        'contact_type.read_all',
        'contact_type.read_active',
        'contact_type.update',
        'contact_type.delete'
    ]

    public_paths = [
        '/contact/create',
        '/scraping/create'
    ]

    # Verifica se o endpoint existe antes de checar se é público
    # E verifica se a rota atual requer autenticação
    if request.endpoint and (request.endpoint in public_endpoints or request.path in public_paths):
        return None # Não verifica token para rotas públicas

    # --- Se chegou aqui, a rota é protegida ---
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Token ausente!"}), 401

    try:
        # Assumindo que verify_token agora retorna apenas o user_id ou levanta exceção
        from api.utils.jwt.jwt_utils import verify_token # Importar aqui ou no topo
        user_id = verify_token(token.split()[1] if token.startswith("Bearer ") else token)
        g.current_user_id = user_id # Armazena no contexto da requisição 'g'
    except Exception as e: # Captura exceções de verify_token (Expirado, Inválido)
        # É importante que verify_token levante exceções específicas ou retorne algo
        # que indique falha para este try/except funcionar bem.
        # Ajuste a mensagem de erro conforme o que verify_token retorna/levanta.
        return jsonify({"message": f"Token inválido ou expirado: {str(e)}"}), 401


@application.before_request
def log_request_info():
    print("\n=== Before Request ===", flush=True)
    print(f"URL: {request.url}", flush=True)
    print(f"Method: {request.method}", flush=True)
    print(f"Endpoint: {request.endpoint}", flush=True)
    return None

# --- REMOVER ou COMENTAR a função after_request ---
# @application.after_request
# def after_request(response):
#     # ... (código removido) ...
#     return response
# ----------------------------------------------------

# --- REMOVER ou COMENTAR a rota handle_options ---
# @application.route('/<path:path>', methods=['OPTIONS'])
# @application.route('/', methods=['OPTIONS'])
# def handle_options(path=''):
#     # ... (código removido) ...
#     return response
# -------------------------------------------------


print("=== Servidor Iniciando ===")

if __name__ == "__main__":
    print("=== Servidor Rodando ===")
    application.run(debug=True)
