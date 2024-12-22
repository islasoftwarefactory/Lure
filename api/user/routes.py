from flask import request, jsonify, Blueprint
from api.user.model import User, create_user, get_user, update_user, delete_user
from api.Database.connection import db
from api.utils.decorators import token_required
from api.utils.jwt_utils import generate_token

blueprint = Blueprint('user', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
def create():
    data = request.get_json()

    if not data or not all(field in data for field in ["name", "email", "sso_type"]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        user = create_user(data)
    except Exception as e:
        return jsonify({"error": f"Failed to create user: {str(e)}"}), 500

    return jsonify({
        "data": user.serialize(),
        "message": "User created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    user = get_user(id)
    if user is None:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "data": user.serialize(),
        "message": "User retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    users = User.query.all()
    users_data = [user.serialize() for user in users]

    return jsonify({
        "data": users_data,
        "message": "Users retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
    data = request.get_json()

    try:
        user = update_user(id, data)
        if user is None:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to update user: {str(e)}"}), 500

    return jsonify({
        "data": user.serialize(),
        "message": "User updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    try:
        user = delete_user(id)
        if user is None:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to delete user: {str(e)}"}), 500

    return jsonify({
        "message": "User deleted successfully."
    }), 200

# Token Refresh
@blueprint.route('/refresh-token', methods=['POST'])
@token_required
def refresh_token(current_user_id):
    new_token = generate_token(current_user_id)
    return jsonify({'token': new_token}), 200
