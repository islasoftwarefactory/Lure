from flask import request, jsonify, Blueprint
from api.size.model import Size, create_size, get_size, update_size, delete_size
from api.Database.connection import db
from api.utils.decorators import token_required

blueprint = Blueprint('size', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
@token_required
def create(current_user_id):
    data = request.get_json()

    if not data or not all(field in data for field in ["name", "long_name"]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        size = create_size(data)
    except Exception as e:
        return jsonify({"error": f"Failed to create size: {str(e)}"}), 500

    return jsonify({
        "data": size.serialize(),
        "message": "Size created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    size = get_size(id)
    if size is None:
        return jsonify({"error": "Size not found"}), 404

    return jsonify({
        "data": size.serialize(),
        "message": "Size retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    sizes = Size.query.all()
    sizes_data = [size.serialize() for size in sizes]

    return jsonify({
        "data": sizes_data,
        "message": "Sizes retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
    data = request.get_json()

    try:
        size = update_size(id, data)
        if size is None:
            return jsonify({"error": "Size not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to update size: {str(e)}"}), 500

    return jsonify({
        "data": size.serialize(),
        "message": "Size updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    try:
        size = delete_size(id)
        if size is None:
            return jsonify({"error": "Size not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to delete size: {str(e)}"}), 500

    return jsonify({
        "message": "Size deleted successfully."
    }), 200