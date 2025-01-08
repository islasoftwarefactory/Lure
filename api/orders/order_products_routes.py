from flask import Blueprint, current_app, jsonify, request
from api.utils.jwt.decorators import token_required
from api.orders.order_products_model import (
    create_orders_product,
    delete_orders_product,
    get_orders_product,
    update_orders_product,
    get_all_orders_product,
)
from api.orders.order_model import Order

blueprint = Blueprint("orders_products", __name__)

@blueprint.route("/create", methods=["POST"])
@token_required
def add_order_product(current_user_id):
    current_app.logger.info("Starting order product creation process")
    
    order_product_data = request.json
    current_app.logger.info(f"Received data: {order_product_data}")
    
    try:
        order_product = create_orders_product(order_product_data)
        current_app.logger.info(f"Order product created successfully: {order_product.id}")
        return jsonify({
            "data": order_product.serialize(),
            "message": "Order product created successfully"
        }), 201
    except ValueError as e:
        current_app.logger.error(f"Validation error creating order product: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        current_app.logger.error(f"Unexpected error creating order product: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal error occurred. Please try again."}), 500

@blueprint.route("/read/<int:order_product_id>", methods=["GET"])
@token_required
def get_single_order_product(current_user_id, order_product_id):
    order_product = get_orders_product(order_product_id)
    
    if order_product and order_product.Order.user_id == current_user_id:
        return jsonify({
            "data": order_product.serialize(),
            "message": "Order product retrieved successfully"
        })
    return jsonify({"error": "Order product not found"}), 404

@blueprint.route("/update/<int:order_product_id>", methods=["PUT"])
@token_required
def modify_order_product(current_user_id, order_product_id):
    order_product_data = request.json
    order_product = update_orders_product(order_product_id, order_product_data)
    if order_product:
        current_app.logger.info(f"Order product updated: {order_product.id}")
        return jsonify({
            "data": order_product.serialize(),
            "message": "Order product updated successfully"
        })
    return jsonify({"error": "Order product not found"}), 404

@blueprint.route("/delete/<int:order_product_id>", methods=["DELETE"])
@token_required
def remove_order_product(current_user_id, order_product_id):
    order_product = delete_orders_product(order_product_id)
    if order_product:
        current_app.logger.info(f"Order product deleted: {order_product.id}")
        return jsonify({"message": "Order product deleted successfully"}), 200
    return jsonify({"error": "Order product not found"}), 404

@blueprint.route("/read/all", methods=["GET"])
@token_required
def get_all_orders_product_route(current_user_id):
    order_products = get_all_orders_product(user_id=current_user_id)
    return jsonify({
        "data": [order_product.serialize() for order_product in order_products],
        "message": "Order products retrieved successfully"
    }), 200
