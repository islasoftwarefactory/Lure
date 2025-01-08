from flask import current_app
from extensions import db
from datetime import datetime

class Order(db.Model):
    __tablename__ = "order"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    delivery_address = db.Column(db.String(255))
    status = db.Column(db.String(50), nullable=False)
    observation = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Order {self.id}>"

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "delivery_address": self.delivery_address,
            "status": self.status,
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
            status=order_data["status"],
            observation=order_data.get("observation")
        )
        
        db.session.add(new_order)
        db.session.commit()
        
        current_app.logA()
        current_app.logger.error(f"Erro ao criar pedido: {str(e)}")
        raise

def get_order(order_id):
    return Order.query.get(order_id)

def update_order(order_id, order_data):
    order = get_order(order_id)
    if order:
        order.delivery_address = order_data.get("delivery_address", order.delivery_address)
        order.status = order_data.get("status", order.status)
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