from flask import Flask
from BackEnd.Database.config import database_uri
from BackEnd.Database.connection import connect_to_db, init_db, db
from sqlalchemy.exc import OperationalError
from BackEnd.Routes.blueprints import register_blueprints
from flask_migrate import Migrate

app = Flask(__name__)
register_blueprints(app)

app.config['SQLALCHEMY_DATABASE_URI'] = database_uri()

migrate = Migrate(app, db)
init_db(app)

try:
    connect_to_db(app)
    print("Connected successfully")
except OperationalError as e:
    print("Connection failed: OperationalError")
except Exception as e:
    print("Error:", e)

if __name__ == '__main__':
    app.run(debug=True)