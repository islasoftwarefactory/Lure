from flask import request, jsonify, Blueprint
from api.payment_method.model import PaymentMethod, create_payment_method, get_payment_method, update_payment_method, delete_payment_method
from api.utils.decorators import token_required

blueprint = Blueprint('payment_method', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
@token_required
def create(current_user_id):
    data = request.get_json()

    if not data or not all(field in data for field in ["name", "long_name"]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        payment_method = create_payment_method(data)
    except Exception as e:
        return jsonify({"error": f"Failed to create payment method: {str(e)}"}), 500

    return jsonify({
        "data": payment_method.serialize(),
        "message": "Payment method created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    payment_method = get_payment_method(id)
    if payment_method is None:
        return jsonify({"error": "Payment method not found"}), 404

    return jsonify({
        "data": payment_method.serialize(),
        "message": "Payment method retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    payment_methods = PaymentMethod.query.all()
    payment_methods_data = [payment_method.serialize() for payment_method in payment_methods]

    return jsonify({
        "data": payment_methods_data,
        "message": "Payment methods retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
    data = request.get_json()

    try:
        payment_method = update_payment_method(id, data)
        if payment_method is None:
            return jsonify({"error": "Payment method not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to update payment method: {str(e)}"}), 500

    return jsonify({
        "data": payment_method.serialize(),
        "message": "Payment method updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    try:
        payment_method = delete_payment_method(id)
        if payment_method is None:
            return jsonify({"error": "Payment method not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to delete payment method: {str(e)}"}), 500

    return jsonify({
        "message": "Payment method deleted successfully."
    }), 200 