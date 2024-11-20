from flask import Flask, request, jsonify, g
from api.Database.config import database_uri
from api.Database.connection import connect_to_db, init_db, db
from sqlalchemy.exc import OperationalError
from api.Routes.blueprints import register_blueprints
from flask_migrate import Migrate
from api.utils.jwt_utils import verify_token

from os import getenv


application = Flask(__name__)
register_blueprints(application)

application.config["SQLALCHEMY_DATABASE_URI"] = database_uri()
application.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
application.config["JWT_SECRET_KEY"] = getenv("JWT_SECRET_KEY")

migrate = Migrate(application, db)
init_db(application)

try:
    connect_to_db(application)
    print("Connected successfully")
except OperationalError as e:
    print("Connection failed: OperationalError")
except Exception as e:
    print("Error:", e)

with application.app_context():
    db.create_all()


@application.before_request
def verify_jwt():
    if request.endpoint != "login":
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        user_id = verify_token(
            token.split()[1] if token.startswith("Bearer ") else token
        )
        if not user_id:
            return jsonify({"message": "Token is invalid or expired!"}), 401

        g.current_user_id = user_id



if __name__ == "__main__":
    application.run(debug=True)
