from flask import request, jsonify, Blueprint
from api.image_category.model import ImageCategory, create_image_category, get_image_category, update_image_category, delete_image_category
from api.utils.security.jwt.decorators import token_required

blueprint = Blueprint('image_category', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
@token_required
def create(current_user_id):
    data = request.get_json()

    if not data or not all(field in data for field in ["name", "url"]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        image_category = create_image_category(data)
    except Exception as e:
        return jsonify({"error": f"Failed to create image category: {str(e)}"}), 500

    return jsonify({
        "data": image_category.serialize(),
        "message": "Image category created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    image_category = get_image_category(id)
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
    image_categories_data = [image_category.serialize() for image_category in image_categories]

    return jsonify({
        "data": image_categories_data,
        "message": "Image categories retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
    data = request.get_json()

    try:
        image_category = update_image_category(id, data)
        if image_category is None:
            return jsonify({"error": "Image category not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to update image category: {str(e)}"}), 500

    return jsonify({
        "data": image_category.serialize(),
        "message": "Image category updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    try:
        image_category = delete_image_category(id)
        if image_category is None:
            return jsonify({"error": "Image category not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to delete image category: {str(e)}"}), 500

    return jsonify({
        "message": "Image category deleted successfully."
    }), 200 