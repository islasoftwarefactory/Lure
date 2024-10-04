from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.ImageCategory import ImageCategory
from ....Database.connection import db
from ....validators.image_category_validators import validate_image_category_creation

blueprint = Blueprint('create_image_category', __name__)

@blueprint.route('/create', methods=['POST'])
def create():
    data = request.get_json()
    
    validation_errors = validate_image_category_creation(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    try:
        image_category = ImageCategory(
            name=data["name"]
        )
    
        db.session.add(image_category)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create image category: {str(e)}"}), 500

    return jsonify({
        "data": image_category.serialize(),
        "message": "Image category created successfully."
    }), 201
