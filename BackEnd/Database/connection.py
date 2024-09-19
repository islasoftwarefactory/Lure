from flask_sqlalchemy import SQLAlchemy

try:
    db = SQLAlchemy()

    def init_db(app):
        db.init_app(app)
        with app.app_context():
            db.create_all()


    def connect_to_db(app):
        with app.app_context():
            db.session.connection()
            db.session.commit()

except Exception as e:
    print("Erro:", e)