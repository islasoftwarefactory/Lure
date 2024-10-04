from flask import Flask, request, jsonify, g
from BackEnd.Database.config import database_uri
from BackEnd.Database.connection import connect_to_db, init_db, db
from sqlalchemy.exc import OperationalError
from BackEnd.Routes.blueprints import register_blueprints
from flask_migrate import Migrate
from .utils.jwt_utils import verify_token
import os
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

app = Flask(__name__)
register_blueprints(app)

app.config['SQLALCHEMY_DATABASE_URI'] = database_uri()
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

migrate = Migrate(app, db)
init_db(app)

try:
    connect_to_db(app)
    print("Connected successfully")
except OperationalError as e:
    print("Connection failed: OperationalError")
except Exception as e:
    print("Error:", e)

with app.app_context():
    db.create_all()
    
@app.before_request
def verify_jwt():
    if request.endpoint != 'login':
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        user_id = verify_token(token.split()[1] if token.startswith('Bearer ') else token)
        if not user_id:
            return jsonify({'message': 'Token is invalid or expired!'}), 401
        
        g.current_user_id = user_id

if __name__ == '__main__':
    app.run(debug=True)
