from flask import jsonify, Blueprint
from api.Database.Models.Category import Category
from api.Database.connection import db
from api.utils.decorators import token_required

blueprint = Blueprint('delete_category', __name__)

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
