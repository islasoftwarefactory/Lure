from api.utils.db.connection import db
from flask import current_app
from datetime import datetime
import pytz
from api.products.model import Product
from api.orders.order_model import Order

class OrdersProduct(db.Model):
    __tablename__ = "orders_product"

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_at_time = db.Column(db.Float, nullable=False)
    product_name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def serialize(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "order_id": self.order_id,
            "quantity": self.quantity,
            "price": self.price_at_time,
            "name": self.product_name,
            "subtotal": self.price_at_time * self.quantity,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

def create_orders_product(orders_product_data):
    try:
        product = Product.query.get(orders_product_data["product_id"])
        if not product:
            raise ValueError("Product not found")
            
        new_orders_product = OrdersProduct(
            product_id=orders_product_data["product_id"],
            order_id=orders_product_data["order_id"],
            quantity=orders_product_data["quantity"],
            price_at_time=product.price,
            product_name=product.name
        )
        
        db.session.add(new_orders_product)
        db.session.commit()
        
        return new_orders_product
    except Exception as e:
        db.session.rollback()
        raise

def get_orders_product(orders_product_id):
    return OrdersProduct.query.get(orders_product_id)

def update_orders_product(orders_product_id, orders_product_data):
    orders_product = get_orders_product(orders_product_id)
    if orders_product:
        orders_product.quantity = orders_product_data.get("quantity", orders_product.quantity)
        orders_product.price_at_time = orders_product_data.get("price_at_time", orders_product.price_at_time)
        orders_product.product_name = orders_product_data.get("product_name", orders_product.product_name)
        db.session.commit()
        return orders_product
    return None

def delete_orders_product(orders_product_id):
    orders_product = get_orders_product(orders_product_id)
    if orders_product:
        db.session.delete(orders_product)
        db.session.commit()
        return orders_product
    return None

def get_all_orders_product(user_id=None):
    if user_id:
        return OrdersProduct.query.join(Order).filter(Order.user_id == user_id).all()
    return OrdersProduct.query.all()
