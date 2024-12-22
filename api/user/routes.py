from flask import request, jsonify, Blueprint
from api.Database.Models.User import User
from api.Database.connection import db
from api.validators.user_validators import validate_user_creation, validate_user_update
from api.utils.jwt_utils import generate_token
from api.utils.decorators import token_required

blueprint = Blueprint('user', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
def create():
    data = request.get_json()

    validation_errors = validate_user_creation(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    user = User(
        name=data["name"],
        email=data["email"],
        photo=data.get("photo"),
        sso_type=data["sso_type"],
    )

    try:
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create user: {str(e)}"}), 500

    return jsonify({
        "data": user.serialize(),
        "message": "User created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    user = User.query.get(id)
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
def update(id):
    user = User.query.get(id)
    if user is None:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()

    validation_errors = validate_user_update(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    if "name" in data:
        user.name = data["name"]
    if "email" in data:
        user.email = data["email"]
    if "photo" in data:
        user.photo = data["photo"]
    if "sso_type" in data:
        user.sso_type = data["sso_type"]

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update user: {str(e)}"}), 500

    return jsonify({
        "data": user.serialize(),
        "message": "User updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    user = User.query.get(id)
    if user is None:
        return jsonify({"error": "User not found"}), 404

    try:
        db.session.delete(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete user: {str(e)}"}), 500

    return jsonify({"message": "User deleted successfully"}), 200

# Token Refresh
@blueprint.route('/refresh-token', methods=['POST'])
@token_required
def refresh_token(current_user_id):
    new_token = generate_token(current_user_id)
    return jsonify({'token': new_token}), 200
