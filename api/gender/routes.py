from flask import request, jsonify, Blueprint
from api.Database.Models.Gender import Gender
from api.Database.connection import db

blueprint = Blueprint('gender', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
def create():
    data = request.get_json()

    if not data or not all(field in data for field in ("name", "long_name")):
        return jsonify({"message": "Missing required fields"}), 400

    try:
        gender = Gender(
            name=data["name"],
            long_name=data["long_name"]
        )

        db.session.add(gender)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create gender: {str(e)}"}), 500

    return jsonify({
        "data": gender.serialize(),
        "message": "Gender created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
def read(id):
    gender = Gender.query.get(id)
    if gender is None:
        return jsonify({"error": "Gender not found"}), 404

    return jsonify({
        "data": gender.serialize(),
        "message": "Gender retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
def read_all():
    genders = Gender.query.all()
    genders_data = [gender.serialize() for gender in genders]

    return jsonify({
        "data": genders_data,
        "message": "Genders retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    gender = Gender.query.get(id)
    if gender is None:
        return jsonify({"error": "Gender not found"}), 404

    data = request.get_json()

    for field in ("name", "long_name"):
        if field in data:
            setattr(gender, field, data[field])

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update gender: {str(e)}"}), 500

    return jsonify({
        "data": gender.serialize(),
        "message": "Gender updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    gender = Gender.query.get(id)
    if gender is None:
        return jsonify({"error": "Gender not found"}), 404

    try:
        db.session.delete(gender)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete gender: {str(e)}"}), 500

    return jsonify({"message": "Gender deleted successfully"}), 200 