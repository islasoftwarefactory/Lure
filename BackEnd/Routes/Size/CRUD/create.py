from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Size import Size
from ....Database.connection import db

blueprint = Blueprint('create_size', __name__)

@blueprint.route("/create", methods=["POST"])
def create():
    data = request.get_json()

    if not data or not all(field in data for field in ("name", "long_name")):
        return jsonify({"message": "Missing required fields"}), 400

    size = Size(
        name=data["name"],
        long_name=data["long_name"]
    )

    try:
        db.session.add(size)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create size: {str(e)}"}), 500

    return jsonify({
        "data": size.serialize(),
        "message": "Size created successfully."
    }), 201
