from flask import request, jsonify, Blueprint
from api.Database.Models.Category import Category
from api.Database.connection import db
from api.validators.category_validators import validate_category_creation, validate_category_update
from api.utils.decorators import token_required

blueprint = Blueprint('category', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
@token_required
def create(current_user_id):
    data = request.get_json()

    validation_errors = validate_category_creation(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    category = Category(name=data["name"])

    try:
        db.session.add(category)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create category: {str(e)}"}), 500

    return jsonify({
        "data": category.serialize(),
        "message": "Category created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    category = Category.query.get(id)
    if category is None:
        return jsonify({"error": "Category not found"}), 404

    return jsonify({
        "data": category.serialize(),
        "message": "Category retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    categories = Category.query.all()
    categories_data = [category.serialize() for category in categories]

    return jsonify({
        "data": categories_data,
        "message": "Categories retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
    category = Category.query.get(id)
    if category is None:
        return jsonify({"error": "Category not found"}), 404

    data = request.get_json()

    validation_errors = validate_category_update(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    if "name" in data:
        category.name = data["name"]

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update category: {str(e)}"}), 500

    return jsonify({
        "data": category.serialize(),
        "message": "Category updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    category = Category.query.get(id)
    if category is None:
        return jsonify({"error": "Category not found"}), 404

    try:
        db.session.delete(category)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete category: {str(e)}"}), 500

    return jsonify({
        "message": "Category deleted successfully."
    }), 200 