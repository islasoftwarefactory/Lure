from flask import request, jsonify, Blueprint
from api.address.model import Address, create_address, get_address, update_address, delete_address
from api.Database.connection import db
from api.utils.decorators import token_required

blueprint = Blueprint('address', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
@token_required
def create(current_user_id):
    data = request.get_json()

    if not data or not all(field in data for field in 
                          ["street", "number", "city", "state", "neighborhood", "zip_code"]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        address = create_address(data)
    except Exception as e:
        return jsonify({"error": f"Failed to create address: {str(e)}"}), 500

    return jsonify({
        "data": address.serialize(),
        "message": "Address created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    address = get_address(id)
    if address is None:
        return jsonify({"error": "Address not found"}), 404

    return jsonify({
        "data": address.serialize(),
        "message": "Address retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    addresses = Address.query.all()
    addresses_data = [address.serialize() for address in addresses]

    return jsonify({
        "data": addresses_data,
        "message": "Addresses retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
    data = request.get_json()

    try:
        address = update_address(id, data)
        if address is None:
            return jsonify({"error": "Address not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to update address: {str(e)}"}), 500

    return jsonify({
        "data": address.serialize(),
        "message": "Address updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    try:
        address = delete_address(id)
        if address is None:
            return jsonify({"error": "Address not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to delete address: {str(e)}"}), 500

    return jsonify({
        "message": "Address deleted successfully."
    }), 200 