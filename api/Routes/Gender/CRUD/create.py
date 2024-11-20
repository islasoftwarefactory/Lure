from flask import request, jsonify, Blueprint
from api.Database.Models.Gender import Gender
from api.Database.connection import db

blueprint = Blueprint('create_gender', __name__)

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
