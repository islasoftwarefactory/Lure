from flask import request, jsonify, Blueprint
from api.gender.model import Gender, create_gender, get_gender, update_gender, delete_gender
from api.utils.jwt.decorators import token_required

blueprint = Blueprint('gender', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
@token_required
def create(current_user_id):
    data = request.get_json()

    if not data or not all(field in data for field in ["name", "long_name"]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        gender = create_gender(data)
    except Exception as e:
        return jsonify({"error": f"Failed to create gender: {str(e)}"}), 500

    return jsonify({
        "data": gender.serialize(),
        "message": "Gender created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    gender = get_gender(id)
    if gender is None:
        return jsonify({"error": "Gender not found"}), 404

    return jsonify({
        "data": gender.serialize(),
        "message": "Gender retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    genders = Gender.query.all()
    genders_data = [gender.serialize() for gender in genders]

    return jsonify({
        "data": genders_data,
        "message": "Genders retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
    data = request.get_json()

    try:
        gender = update_gender(id, data)
        if gender is None:
            return jsonify({"error": "Gender not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to update gender: {str(e)}"}), 500

    return jsonify({
        "data": gender.serialize(),
        "message": "Gender updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    try:
        gender = delete_gender(id)
        if gender is None:
            return jsonify({"error": "Gender not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to delete gender: {str(e)}"}), 500

    return jsonify({
        "message": "Gender deleted successfully."
    }), 200 