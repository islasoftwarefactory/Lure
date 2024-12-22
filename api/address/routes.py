from flask import request, jsonify, Blueprint
from api.address.model import Address
from api.Database.connection import db

blueprint = Blueprint('address', __name__)

# Create
@blueprint.route("/create/<int:user_id>", methods=["POST"])
def create(user_id):
    data = request.get_json()

    if not data or not all(field in data for field in ("street", "number", "city", "state", "neighborhood", "zip_code")):
        return jsonify({"message": "Missing required fields"}), 400

    try:
        address = Address(
            user_id=user_id,
            observation=data.get("observation"),
            street=data["street"],
            number=data["number"],
            city=data["city"],
            state=data["state"],
            zip_code=data["zip_code"],
            neighborhood=data["neighborhood"],
            complement=data.get("complement")
        )

        db.session.add(address)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create address: {str(e)}"}), 500

    return jsonify({
        "data": address.serialize(),
        "message": "Address created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
def read(id):
    address = Address.query.get(id)
    if address is None:
        return jsonify({"error": "Address not found"}), 404

    return jsonify({
        "data": address.serialize(),
        "message": "Address retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
def read_all():
    addresses = Address.query.all()
    addresses_data = [address.serialize() for address in addresses]

    return jsonify({
        "data": addresses_data,
        "message": "Addresses retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    address = Address.query.get(id)
    if address is None:
        return jsonify({"error": "Address not found"}), 404

    data = request.get_json()

    for field in ("street", "number", "city", "state", "zip_code", "neighborhood"):
        if field in data:
            setattr(address, field, data[field])

    address.observation = data.get("observation", address.observation)
    address.complement = data.get("complement", address.complement)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update address: {str(e)}"}), 500

    return jsonify({
        "data": address.serialize(),
        "message": "Address updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    address = Address.query.get(id)
    if address is None:
        return jsonify({"error": "Address not found"}), 404

    try:
        db.session.delete(address)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete address: {str(e)}"}), 500

    return jsonify({"message": "Address deleted successfully"}), 200 