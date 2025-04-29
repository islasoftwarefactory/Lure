from flask import request, jsonify, Blueprint, current_app
from api.shippings.status.model import ShippingStatus, create_shipping_status, update_shipping_status, delete_shipping_status, find_shipping_status_by_id
from api.utils.jwt.decorators import token_required

blueprint = Blueprint('shipping_status', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
@token_required
def create():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    try:
        shipping_status = create_shipping_status(data)
        return jsonify({
            "data": shipping_status.serialize(),
            "message": "Shipping status created successfully."
        }), 201
    except Exception as e:
        current_app.logger.error(f"Error creating shipping status: {str(e)}")
        return jsonify({"error": str(e)}), 400

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(id):
    shipping_status = find_shipping_status_by_id(id)
    if shipping_status is None:
        return jsonify({"error": "Shipping status not found"}), 404

    return jsonify({
        "data": shipping_status.serialize(),
        "message": "Shipping status retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    try:
        shipping_status = update_shipping_status(id, data)
        if shipping_status is None:
            return jsonify({"error": "Shipping status not found"}), 404

        return jsonify({
            "data": shipping_status.serialize(),
            "message": "Shipping status updated successfully."
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error updating shipping status: {str(e)}")
        return jsonify({"error": str(e)}), 400

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(id):
    deleted = delete_shipping_status(id)
    if not deleted:
        return jsonify({"error": "Shipping status not found"}), 404

    return jsonify({
        "message": "Shipping status deleted successfully."
    }), 200
