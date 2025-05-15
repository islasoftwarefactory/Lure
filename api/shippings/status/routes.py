from flask import request, jsonify, Blueprint, current_app
from api.shippings.status.model import create_shipping_status, update_shipping_status, delete_shipping_status, find_shipping_status_by_id, update_shipping_details
from api.shippings.conclusion.model import find_shipping_conclusion_by_id
from api.address.model import Address
from api.utils.security.jwt.decorators import token_required
from datetime import datetime

blueprint = Blueprint('shipping_status', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
@token_required
def create(current_user_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    try:
        # Validar conclusion_id se fornecido
        if 'conclusion_id' in data:
            conclusion = find_shipping_conclusion_by_id(data['conclusion_id'])
            if not conclusion:
                return jsonify({"error": "Invalid conclusion"}), 400

        # Validate address_id if provided
        if 'address_id' in data:
            address = Address.query.get(data['address_id'])
            if not address:
                return jsonify({"error": "Invalid address"}), 400
        
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
def read(current_user_id, id):
    shipping_status = find_shipping_status_by_id(id)
    if not shipping_status:
        return jsonify({"error": "Shipping status not found"}), 404

    # Removed user verification (was previously user-specific)
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

    shipping_status = find_shipping_status_by_id(id)
    if not shipping_status:
        return jsonify({"error": "Shipping status not found"}), 404

    try:
        # Validar conclusion_id se fornecido
        if 'conclusion_id' in data:
            conclusion = find_shipping_conclusion_by_id(data['conclusion_id'])
            if not conclusion:
                return jsonify({"error": "Invalid conclusion"}), 400

        # Validate address_id if being updated
        if 'address_id' in data:
            address = Address.query.get(data['address_id'])
            if not address:
                return jsonify({"error": "Invalid address"}), 400

        updated = update_shipping_status(id, data)
        return jsonify({
            "data": updated.serialize(),
            "message": "Shipping status updated successfully."
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error updating shipping status: {str(e)}")
        return jsonify({"error": str(e)}), 400

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    # Removed ownership check (was previously user-specific)
    shipping_status = find_shipping_status_by_id(id)
    if not shipping_status:
        return jsonify({"error": "Shipping status not found"}), 404

    deleted = delete_shipping_status(id)
    if not deleted:
        return jsonify({"error": "Failed to delete shipping status"}), 400

    return jsonify({
        "message": "Shipping status deleted successfully."
    }), 200

# Update Details
@blueprint.route("/update-details/<int:status_id>", methods=["PUT"])
@token_required
def handle_update_shipping_details(current_user_id, status_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    # First check if status exists
    shipping_status = find_shipping_status_by_id(status_id)
    if not shipping_status:
        return jsonify({"error": "Shipping status not found"}), 404

    try:
        # Validar conclusion_id se fornecido
        if 'conclusion_id' in data:
            conclusion = find_shipping_conclusion_by_id(data['conclusion_id'])
            if not conclusion:
                return jsonify({"error": "Invalid conclusion"}), 400

        tracking_number = data.get("tracking_number")
        estimated_delivery_date = data.get("estimated_delivery_date")

        if estimated_delivery_date:
            estimated_delivery_date = datetime.fromisoformat(estimated_delivery_date)

        # Add audit information (can still track who updated it)
        data['updated_at'] = datetime.now()

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
        return jsonify({"error": "Failed to update shipping details due to an internal error."}), 500
