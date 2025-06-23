from flask import request, jsonify, Blueprint, current_app
from api.address.model import Address, create_address, get_address, update_address, delete_address
from api.utils.security.jwt.decorators import token_required

blueprint = Blueprint('address', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
@token_required
def create(current_user_id):
    data = request.get_json()

    required_fields = ["street", "number", "city", "state", "zip_code", "country"]
    if not data or not all(field in data for field in required_fields):
        missing_fields = [field for field in required_fields if field not in data]
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    try:
        address = create_address(data, current_user_id)
    except ValueError as ve:
        current_app.logger.warning(f"Address creation validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"Failed to create address: {str(e)}")
        return jsonify({"error": f"Failed to create address: {str(e)}"}), 500

    return jsonify({
        "data": address.serialize(),
        "message": "Address created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:address_id>", methods=["GET"])
@token_required
def read(current_user_id, address_id):
    # Busca o endereço e verifica se pertence ao usuário atual
    address = Address.query.filter_by(id=address_id, user_id=current_user_id).first()
    
    if not address:
        return jsonify({"error": "Address not found or not authorized"}), 404
    
    return jsonify({
        "data": address.serialize(),
        "message": "Address retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    addresses = Address.query.filter_by(user_id=current_user_id).all()
    addresses_data = [address.serialize() for address in addresses]

    return jsonify({
        "data": addresses_data,
        "message": "Addresses retrieved successfully."
    }), 200

@blueprint.route("/read/all/<int:user_id>", methods=["GET"])
@token_required
def read_all_for_user(current_user_id, user_id):
    if current_user_id != user_id:
        return jsonify({"error": "Not authorized to view addresses for this user"}), 403

    addresses = Address.query.filter_by(user_id=user_id).all()
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
    
    address_to_update = get_address(id)
    if address_to_update is None or address_to_update.user_id != current_user_id:
        return jsonify({"error": "Address not found or not authorized"}), 404

    try:
        address = update_address(id, data)
    except Exception as e:
        current_app.logger.error(f"Failed to update address: {str(e)}")
        return jsonify({"error": f"Failed to update address: {str(e)}"}), 500

    return jsonify({
        "data": address.serialize(),
        "message": "Address updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    address_to_delete = get_address(id)
    if address_to_delete is None or address_to_delete.user_id != current_user_id:
        return jsonify({"error": "Address not found or not authorized"}), 404
        
    try:
        address = delete_address(id)
    except Exception as e:
        current_app.logger.error(f"Failed to delete address: {str(e)}")
        return jsonify({"error": f"Failed to delete address: {str(e)}"}), 500

    return jsonify({
        "message": "Address deleted successfully."
    }), 200 