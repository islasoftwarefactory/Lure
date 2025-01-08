from flask import current_app
from api.utils.db.connection import db
from datetime import datetime

class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    delivery_address = db.Column(db.String(255))
    status_id = db.Column(db.Integer, db.ForeignKey("orders_status.id"), nullable=False)
    observation = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    user = db.relationship("User", backref="orders")
    status = db.relationship("OrdersStatus", backref="orders")

    def __repr__(self):
        return f"<Order {self.id}>"

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "delivery_address": self.delivery_address,
            "status_id": self.status_id,
            "observation": self.observation,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

# Funções do modelo
def create_order(order_data):
    current_app.logger.info("Iniciando criação do pedido")
    try:
        new_order = Order(
            user_id=order_data["user_id"],
            delivery_address=order_data.get("delivery_address"),
            status_id=order_data["status_id"],
            observation=order_data.get("observation")
        )
        
        db.session.add(new_order)
        db.session.commit()
        
        current_app.logger.info(f"Pedido criado com sucesso para o usuário: {new_order.user_id}")
        return new_order
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erro ao criar pedido: {str(e)}")
        raise

def get_order(order_id):
    return Order.query.get(order_id)

def update_order(order_id, order_data):
    order = get_order(order_id)
    if order:
        order.delivery_address = order_data.get("delivery_address", order.delivery_address)
        order.status_id = order_data.get("status_id", order.status_id)
        order.observation = order_data.get("observation", order.observation)
        db.session.commit()
        return order
    return None

def delete_order(order_id):
    order = get_order(order_id)
    if order:
        db.session.delete(order)
        db.session.commit()
        return order
    return None

def get_all_orders():
    try:
        return Order.query.all()
    except Exception as e:
        current_app.logger.error(f"Erro ao buscar pedidos: {str(e)}")
        raise