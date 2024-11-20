from flask import request, jsonify, Blueprint
from api.Database.Models.ImageCategory import ImageCategory
from api.Database.connection import db
from api.validators.image_category_validators import validate_image_category_update
from api.utils.decorators import token_required

blueprint = Blueprint('update_image_category', __name__)

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
