from flask_sqlalchemy import SQLAlchemy

try:
    db = SQLAlchemy()

    def init_db(app):
        db.init_app(app)

    def connect_to_db(app):
        with app.app_context():
            db.session.commit()

except Exception as e:
    print("Erro:", e)