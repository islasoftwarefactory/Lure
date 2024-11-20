from flask_sqlalchemy import SQLAlchemy
import time
from sqlalchemy.exc import OperationalError

db = SQLAlchemy()

def init_db(app):
    db.init_app(app)

def connect_to_db(app, max_retries=5, delay=5):
    for attempt in range(max_retries):
        try:
            with app.app_context():
                db.session.commit()
                return True
        except OperationalError:
            if attempt < max_retries - 1:
                print(f"Tentativa {attempt + 1} falhou. Tentando novamente em {delay} segundos...")
                time.sleep(delay)
            else:
                raise