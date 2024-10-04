from flask import jsonify, Blueprint
from BackEnd.Database.Models.ImageCategory import ImageCategory
from BackEnd.Database.connection import db
from ...utils.decorators import token_required

blueprint = Blueprint('delete_image_category', __name__)

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
