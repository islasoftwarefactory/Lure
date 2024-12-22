from flask import request, jsonify, Blueprint
from api.Database.Models.Size import Size
from api.Database.connection import db

blueprint = Blueprint('size', __name__)

# Create
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

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
def read(id):
    size = Size.query.get(id)
    if size is None:
        return jsonify({"error": "Size not found"}), 404

    return jsonify({
        "data": size.serialize(),
        "message": "Size retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
def read_all():
    sizes = Size.query.all()
    sizes_data = [size.serialize() for size in sizes]

    return jsonify({
        "data": sizes_data,
        "message": "Sizes retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    size = Size.query.get(id)
    if size is None:
        return jsonify({"error": "Size not found"}), 404

    data = request.get_json()

    if "name" in data:
        size.name = data["name"]
    if "long_name" in data:
        size.long_name = data["long_name"]

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update size: {str(e)}"}), 500

    return jsonify({
        "data": size.serialize(),
        "message": "Size updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    size = Size.query.get(id)
    if size is None:
        return jsonify({"error": "Size not found"}), 404

    try:
        db.session.delete(size)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete size: {str(e)}"}), 500

    return jsonify({"message": "Size deleted successfully"}), 200 