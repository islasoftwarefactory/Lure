from flask import request, jsonify, Blueprint
from api.Database.Models.ImageCategory import ImageCategory
from api.Database.connection import db
from api.validators.image_category_validators import validate_image_category_creation, validate_image_category_update
from api.utils.decorators import token_required

blueprint = Blueprint('image_category', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
@token_required
def create(current_user_id):
    data = request.get_json()

    validation_errors = validate_image_category_creation(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    image_category = ImageCategory(name=data["name"])

    try:
        db.session.add(image_category)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create image category: {str(e)}"}), 500

    return jsonify({
        "data": image_category.serialize(),
        "message": "Image category created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    image_category = ImageCategory.query.get(id)
    if image_category is None:
        return jsonify({"error": "Image category not found"}), 404

    return jsonify({
        "data": image_category.serialize(),
        "message": "Image category retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    image_categories = ImageCategory.query.all()
    image_categories_data = [cat.serialize() for cat in image_categories]

    return jsonify({
        "data": image_categories_data,
        "message": "Image categories retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
    image_category = ImageCategory.query.get(id)
    if image_category is None:
        return jsonify({"error": "Image category not found"}), 404

    data = request.get_json()

    validation_errors = validate_image_category_update(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    if "name" in data:
        image_category.name = data["name"]

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update image category: {str(e)}"}), 500

    return jsonify({
        "data": image_category.serialize(),
        "message": "Image category updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    image_category = ImageCategory.query.get(id)
    if image_category is None:
        return jsonify({"error": "Image category not found"}), 404

    try:
        db.session.delete(image_category)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete image category: {str(e)}"}), 500

    return jsonify({
        "message": "Image category deleted successfully."
    }), 200 