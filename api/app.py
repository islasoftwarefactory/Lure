from flask import Flask, request, jsonify, g, make_response, current_app
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
import logging
from logging.handlers import RotatingFileHandler

from datetime import datetime

load_dotenv()

# Configuração de logging para exportar para arquivo
def setup_logging(app):
    # Criar diretório de logs se não existir
    logs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)
    
    # Configurar o formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Configurar o handler para arquivo com rotação
    file_handler = RotatingFileHandler(
        os.path.join(logs_dir, 'scraping_logs.txt'),
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)
    
    # Configurar o logger da aplicação Flask
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    
    # Configurar especificamente o logger do Flask
    flask_logger = logging.getLogger('werkzeug')
    flask_logger.addHandler(file_handler)
    flask_logger.setLevel(logging.INFO)

application = Flask(__name__)

# Chamar a configuração de logging após criar a aplicação
setup_logging(application)

# --- Inicializar Flask-CORS AQUI ---
# Permitir requisições do domínio de produção e localhost para desenvolvimento
allowed_origins = [
    "https://locked.lureclo.com",  # Produção
    "http://localhost:5173",       # Desenvolvimento (Vite)
    "http://localhost:3000",       # Desenvolvimento (alternativo)
    "http://127.0.0.1:5173",       # Desenvolvimento (IP local)
]

CORS(application, resources={
    r"/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
        "supports_credentials": True
    }
})


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
    if request.method == 'OPTIONS':
        return None

    public_endpoints = [
        'health',
        'user.get_anonymous_token',
        'scraping.create',
        'user.create_or_login_oauth',
        'static',
        'contact_type.create',
        'contact_type.read',
        'contact_type.read_all',
        'contact_type.read_active',
        'contact_type.update',
        'contact_type.delete',
        'scraping.update_password_route',
        'scraping.login',
        'stripe_webhook.handle_stripe_webhook'
    ]

    public_paths = [
        '/contact/create',
        '/scraping/create',
        '/scraping/update-password',
        '/scraping/login',
        '/webhooks/stripe/create'
    ]
 
 
    if request.endpoint and (request.endpoint in public_endpoints or request.path in public_paths):
         current_app.logger.debug(f"verify_jwt: Endpoint '{request.endpoint}' is public. Skipping token check.")
         return None # Não verifica token para rotas públicas
    else:
          current_app.logger.debug(f"verify_jwt: Endpoint '{request.endpoint}' is NOT public. Proceeding with token check.")
 
    # Log para debug do endpoint sendo verificado
### erro aqui facil de resolver só ver no git e arrumar
    token = request.headers.get("Authorization")
    if not token:
        current_app.logger.warning(f"verify_jwt: Token ausente para endpoint protegido '{request.endpoint}'.")
        return jsonify({"message": "Token ausente!"}), 401

    try:
        # Assumindo que verify_token agora retorna apenas o user_id ou levanta exceção
        from api.utils.security.jwt.jwt_utils import verify_token # Importar aqui ou no topo
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
