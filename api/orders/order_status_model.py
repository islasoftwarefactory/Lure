from api.utils.db.connection import db
from flask import current_app
from datetime import datetime

class OrdersStatus(db.Model):
    __tablename__ = "orders_status"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    description = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

def create_orders_status(status_data):
    try:
        new_status = OrdersStatus(
            name=status_data["name"],
            description=status_data.get("description")
        )
        
        db.session.add(new_status)
        db.session.commit()
        
        return new_status
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating order status: {str(e)}")
        raise

def get_orders_status(status_id):
    return OrdersStatus.query.get(status_id)

def update_orders_status(status_id, status_data):
    status = get_orders_status(status_id)
    if status:
        status.name = status_data.get("name", status.name)
        status.description = status_data.get("description", status.description)
        db.session.commit()
        return status
    return None

def delete_orders_status(status_id):
    status = get_orders_status(status_id)
    if status:
        db.session.delete(status)
        db.session.commit()
        return status
    return None

def get_all_orders_status():
    return OrdersStatus.query.all()
