from flask import request, jsonify, Blueprint
from api.payment.model import Payment, create_payment, get_payment, update_payment, delete_payment
from api.Database.connection import db
from api.utils.decorators import token_required

blueprint = Blueprint('payment', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
@token_required
def create(current_user_id):
    data = request.get_json()

    if not data or not all(field in data for field in 
                          ["cart_id", "payment_method", "payment_status", "payment_amount"]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        payment = create_payment(data)
    except Exception as e:
        return jsonify({"error": f"Failed to create payment: {str(e)}"}), 500

    return jsonify({
        "data": payment.serialize(),
        "message": "Payment created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    payment = get_payment(id)
    if payment is None:
        return jsonify({"error": "Payment not found"}), 404

    return jsonify({
        "data": payment.serialize(),
        "message": "Payment retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    payments = Payment.query.all()
    payments_data = [payment.serialize() for payment in payments]

    return jsonify({
        "data": payments_data,
        "message": "Payments retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
    data = request.get_json()

    if not data or not all(field in data for field in 
                          ["cart_id", "payment_method", "payment_status", "payment_amount"]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        payment = update_payment(id, data)
    except Exception as e:
        return jsonify({"error": f"Failed to update payment: {str(e)}"}), 500

    return jsonify({
        "data": payment.serialize(),
        "message": "Payment updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    try:
        delete_payment(id)
    except Exception as e:
        return jsonify({"error": f"Failed to delete payment: {str(e)}"}), 500

    return jsonify({
        "message": "Payment deleted successfully."
    }), 200 