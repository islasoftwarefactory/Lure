from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Category import Category
from BackEnd.Database.connection import db
from BackEnd.validators.category_validators import validate_category_update
from ...utils.decorators import token_required

blueprint = Blueprint('update_category', __name__)

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
