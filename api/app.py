from flask import Flask, request, jsonify, g, make_response
from api.utils.db.config import database_uri
from api.utils.db.connection import connect_to_db, init_db, db
from sqlalchemy.exc import OperationalError
from api.blueprints import register_blueprints
from flask_migrate import Migrate
from api.utils.jwt.jwt_utils import verify_token, generate_token
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
    # Permitir todas as requisições OPTIONS sem verificação de token
    if request.method == 'OPTIONS':
        return None
        
    # Lista de endpoints que não precisam de autenticação
    public_endpoints = [
        'health',
        'user.get_anonymous_token',
        'scraping.create',
        'user.create',
        'static',
        'handle_options',
        'contact_type.create',
        'contact_type.read',
        'contact_type.read_all',
        'contact_type.read_active',
        'contact_type.update',
        'contact_type.delete'
    ]
    
    # Lista de paths públicos
    public_paths = [
        '/contact/create',
        '/scraping/create'
    ]
    
    # Verifica se é um endpoint ou path público
    if request.endpoint in public_endpoints or request.path in public_paths:
        return None
        
    # Verifica o token para outras rotas
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Token ausente!"}), 401

    user_id = verify_token(
        token.split()[1] if token.startswith("Bearer ") else token
    )
    if not user_id:
        return jsonify({"message": "Token inválido ou expirado!"}), 401

    g.current_user_id = user_id


@application.before_request
def log_request_info():
    print("\n=== Before Request ===", flush=True)
    print(f"URL: {request.url}", flush=True)
    print(f"Method: {request.method}", flush=True)
    print(f"Endpoint: {request.endpoint}", flush=True)
    return None


@application.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }), 200


@application.after_request
def after_request(response):
    # Remove headers existentes para evitar duplicação
    response.headers.pop('Access-Control-Allow-Origin', None)
    response.headers.pop('Access-Control-Allow-Headers', None)
    response.headers.pop('Access-Control-Allow-Methods', None)
    response.headers.pop('Access-Control-Allow-Credentials', None)
    
    origin = request.headers.get('Origin', '')
    if origin == 'http://localhost:8081':
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Max-Age'] = '86400'
    return response


@application.route('/<path:path>', methods=['OPTIONS'])
@application.route('/', methods=['OPTIONS'])
def handle_options(path=''):
    response = make_response()
    origin = request.headers.get('Origin', '')
    if origin == 'http://localhost:8081':
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Max-Age'] = '86400'
    return response


print("=== Servidor Iniciando ===")

if __name__ == "__main__":
    print("=== Servidor Rodando ===")
    application.run(debug=True)
