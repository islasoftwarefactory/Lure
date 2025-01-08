from flask import Blueprint, current_app, jsonify, request
from api.utils.jwt.decorators import token_required
from api.orders.order_status_model import (
    create_orders_status,
    OrdersStatus
)

blueprint = Blueprint("orders_status", __name__)

@blueprint.route("/create", methods=["POST"])
@token_required
def create_status(current_user_id):
    current_app.logger.info("Starting order status creation process")
    
    status_data = request.json
    current_app.logger.info(f"Received data: {status_data}")
    
    try:
        status = create_orders_status(status_data)
        current_app.logger.info(f"Order status created successfully: {status.id}")
        return jsonify({
            "data": status.serialize(),
            "message": "Order status created successfully"
        }), 201
    except Exception as e:
        current_app.logger.error(f"Error creating order status: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal error occurred. Please try again."}), 500

@blueprint.route("/read/<int:status_id>", methods=["GET"])
@token_required
def get_status(current_user_id, status_id):
    status = get_orders_status(status_id)
    if status:
        return jsonify({
            "data": status.serialize(),
            "message": "Order status retrieved successfully"
        })
    return jsonify({"error": "Order status not found"}), 404

@blueprint.route("/update/<int:status_id>", methods=["PUT"])
@token_required
def update_status(current_user_id, status_id):
    status_data = request.json
    status = update_orders_status(status_id, status_data)
    if status:
        current_app.logger.info(f"Order status updated: {status.id}")
        return jsonify({
            "data": status.serialize(),
            "message": "Order status updated successfully"
        })
    return jsonify({"error": "Order status not found"}), 404

@blueprint.route("/delete/<int:status_id>", methods=["DELETE"])
@token_required
def delete_status(current_user_id, status_id):
    status = delete_orders_status(status_id)
    if status:
        current_app.logger.info(f"Order status deleted: {status.id}")
        return jsonify({"message": "Order status deleted successfully"})
    return jsonify({"error": "Order status not found"}), 404

@blueprint.route("/read/all", methods=["GET"])
@token_required
def get_all_status(current_user_id):
    statuses = get_all_orders_status()
    return jsonify({
        "data": [status.serialize() for status in statuses],
        "message": "Order statuses retrieved successfully"
    }), 200
