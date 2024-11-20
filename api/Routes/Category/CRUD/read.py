from flask import jsonify, Blueprint
from api.Database.Models.Category import Category
from api.utils.decorators import token_required

blueprint = Blueprint('read_category', __name__)

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
