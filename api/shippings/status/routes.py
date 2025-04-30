from flask import request, jsonify, Blueprint, current_app
from api.shippings.status.model import ShippingStatus, create_shipping_status, update_shipping_status, delete_shipping_status, find_shipping_status_by_id, update_shipping_details
from api.utils.jwt.decorators import token_required
from datetime import datetime

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
def update(current_user_id, id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    try:
        # First get the shipping status to check ownership
        shipping_status = find_shipping_status_by_id(id)
        if shipping_status is None:
            return jsonify({"error": "Shipping status not found"}), 404
            
        # Check if the current user has permission to update this shipping status
        if shipping_status.user_id != current_user_id:
            return jsonify({"error": "Not authorized to update this shipping status"}), 403

        # If authorized, proceed with update
        updated_status = update_shipping_status(id, data)
        return jsonify({
            "data": updated_status.serialize(),
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

@blueprint.route("/update-details/<int:status_id>", methods=["PUT"])
@token_required
def handle_update_shipping_details(current_user_id, status_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    tracking_number = data.get("tracking_number")
    estimated_delivery_date = data.get("estimated_delivery_date")  # Expecting a date string

    try:
        # Convert estimated_delivery_date to a datetime object if provided
        if estimated_delivery_date:
            estimated_delivery_date = datetime.fromisoformat(estimated_delivery_date)

        shipping_status = update_shipping_details(status_id, tracking_number, estimated_delivery_date)
        if not shipping_status:
            return jsonify({"error": "Shipping status not found"}), 404

        return jsonify({
            "data": shipping_status.serialize(),
            "message": "Shipping details updated successfully."
        }), 200
    except ValueError as ve:
        current_app.logger.warning(f"Validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"Failed to update shipping details for status ID {status_id}: {str(e)}")
        return jsonify({"error": "Failed to update shipping details due to an internal error."}), 500
