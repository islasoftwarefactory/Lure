from flask import Flask, request, jsonify, g
from api.utils.db.config import database_uri
from api.utils.db.connection import connect_to_db, init_db, db
from sqlalchemy.exc import OperationalError
from api.blueprints import register_blueprints
from flask_migrate import Migrate
from api.utils.jwt.jwt_utils import verify_token, generate_token
from flask_cors import CORS
from api.utils.db.create_tables import create_tables

from os import getenv
from datetime import datetime


application = Flask(__name__)
CORS(application, 
     resources={r"/*": {"origins": "*"}}, 
     supports_credentials=True)
register_blueprints(application)

application.config["SQLALCHEMY_DATABASE_URI"] = database_uri()
application.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
application.config["JWT_SECRET_KEY"] = getenv("JWT_SECRET_KEY")

init_db(application)
migrate = Migrate(application, db)

try:
    connect_to_db(application)
    print("Connected successfully")
    
    with application.app_context():
        # Desabilita temporariamente o rastreamento de modificações
        application.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        
        # Inicializa as migrações primeiro
        migrate = Migrate(application, db)
        
        # Espera um momento para garantir que não há operações pendentes
        db.session.commit()
        
        try:
            # Tenta criar as tabelas
            create_tables()
            print("Tables created successfully")
        except Exception as e:
            print(f"Error creating tables: {str(e)}")
            db.session.rollback()
            raise
        
        # Reativa o rastreamento de modificações se necessário
        application.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        
except OperationalError as e:
    print("Connection failed: OperationalError")
    raise
except Exception as e:
    print("Error:", e)
    raise


@application.before_request
def verify_jwt():
    # Lista de endpoints que não precisam de autenticação
    public_endpoints = [
        'health',  # /health
        'user.get_anonymous_token',  # /user/anonymous-token
        'user.create',  # /user/create
        'static'   # arquivos estáticos
    ]
    
    print(f"Current endpoint: {request.endpoint}")  # Adicione esta linha para debug
    
    # Se o endpoint atual está na lista de públicos, permite o acesso
    if request.endpoint in public_endpoints:
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


@application.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }), 200


if __name__ == "__main__":
    application.run(debug=True)
