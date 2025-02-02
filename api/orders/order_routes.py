from flask import Blueprint, current_app, jsonify, request
from api.utils.db.decorators import token_required
from api.orders.order_model import (
    create_order,
    get_order,
    update_order,
    delete_order,
    get_all_orders,
    Order
)
from api.cart.model import Cart
from api.utils.jwt.connection import db

blueprint = Blueprint("orders", __name__)

@blueprint.route("/create", methods=["POST"])
@token_required
def create(current_user_id):
    current_app.logger.info("Starting order creation process")
    
    data = request.json
    current_app.logger.info(f"Received data: {data}")
    
    try:
        order = create_order(data)
        
        # Clear user's cart after order creation
        Cart.query.filter_by(user_id=data["user_id"]).delete()
        db.session.commit()
        
        current_app.logger.info(f"Order created successfully: {order.id}")
        return jsonify({
            "data": order.serialize(),
            "message": "Order created successfully"
        }), 201
    except Exception as e:
        current_app.logger.error(f"Error creating order: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal error occurred. Please try again."}), 500

@blueprint.route("/read/<int:order_id>", methods=["GET"])
@token_required
def read(current_user_id, order_id):
    order = get_order(order_id)
    if order and order.user_id == current_user_id:
        return jsonify({
            "data": order.serialize(),
            "message": "Order retrieved successfully"
        })
    return jsonify({"error": "Order not found"}), 404

@blueprint.route("/update/<int:order_id>", methods=["PUT"])
@token_required
def update(current_user_id, order_id):
    data = request.json
    order = update_order(order_id, data)
    if order and order.user_id == current_user_id:
        current_app.logger.info(f"Order updated: {order.id}")
        return jsonify({
            "data": order.serialize(),
            "message": "Order updated successfully"
        })
    return jsonify({"error": "Order not found"}), 404

@blueprint.route("/delete/<int:order_id>", methods=["DELETE"])
@token_required
def delete(current_user_id, order_id):
    order = delete_order(order_id)
    if order and order.user_id == current_user_id:
        current_app.logger.info(f"Order deleted: {order.id}")
        return jsonify({"message": "Order deleted successfully"})
    return jsonify({"error": "Order not found"}), 404

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    orders = get_all_orders()
    user_orders = [order for order in orders if order.user_id == current_user_id]
    return jsonify({
        "data": [order.serialize() for order in user_orders],
        "message": "Orders retrieved successfully"
    }), 200
