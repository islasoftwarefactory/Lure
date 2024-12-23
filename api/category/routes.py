from flask import request, jsonify, Blueprint
from api.category.model import Category, create_category, get_category, update_category, delete_category
from api.utils.jwt.decorators import token_required

blueprint = Blueprint('category', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
@token_required
def create(current_user_id):
    data = request.get_json()

    validation_errors = validate_category_creation(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    try:
        category = create_category(data)
    except Exception as e:
        return jsonify({"error": f"Failed to create category: {str(e)}"}), 500

    return jsonify({
        "data": category.serialize(),
        "message": "Category created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    category = get_category(id)
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
    data = request.get_json()

    validation_errors = validate_category_update(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    try:
        category = update_category(id, data)
        if category is None:
            return jsonify({"error": "Category not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to update category: {str(e)}"}), 500

    return jsonify({
        "data": category.serialize(),
        "message": "Category updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    try:
        category = delete_category(id)
        if category is None:
            return jsonify({"error": "Category not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to delete category: {str(e)}"}), 500

    return jsonify({
        "message": "Category deleted successfully."
    }), 200 