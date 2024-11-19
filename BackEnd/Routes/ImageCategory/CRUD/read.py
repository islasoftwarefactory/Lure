from flask import jsonify, Blueprint
from BackEnd.Database.Models.ImageCategory import ImageCategory
from ...utils.decorators import token_required

blueprint = Blueprint('read_image_category', __name__)

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
