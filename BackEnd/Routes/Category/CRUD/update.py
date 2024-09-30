from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Category import Category
from ....Database.connection import db

blueprint = Blueprint('update_category', __name__)

@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    category = Category.query.get(id)
    if category is None:
        return jsonify({"error": "Category not found"}), 404

    data = request.get_json()

    for field in ("name", "gender_id"):
        if field in data:
            setattr(category, field, data[field])

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update category: {str(e)}"}), 500

    return jsonify({
        "data": category.serialize(),
        "message": "Category updated successfully."
    }), 200
