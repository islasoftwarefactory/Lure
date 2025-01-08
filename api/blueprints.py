from flask import Blueprint
from api.user.routes import blueprint as user_blueprint
from api.orders.order_routes import blueprint as orders_blueprint
from api.orders.order_status_routes import blueprint as orders_status_blueprint

def register_blueprints(app):
    app.register_blueprint(user_blueprint, url_prefix='/user')
    app.register_blueprint(orders_blueprint, url_prefix='/orders')
    app.register_blueprint(orders_status_blueprint, url_prefix='/orders/status')