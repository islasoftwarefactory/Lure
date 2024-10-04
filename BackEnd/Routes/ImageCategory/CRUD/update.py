from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.ImageCategory import ImageCategory
from ....Database.connection import db
from ....validators.image_category_validators import validate_image_category_creation

blueprint = Blueprint('update_image_category', __name__)

@blueprint.route('/update/<int:id>', methods=['PUT'])
def update_image_category(id):
    category = ImageCategory.query.get(id)
    if not category:
        return jsonify({'error': 'ImageCategory not found'}), 404

    data = request.get_json()
    
    validation_errors = validate_image_category_creation(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    try:
        if 'name' in data:
            category.name = data['name']
        db.session.commit()

        return jsonify(category.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update image category: {str(e)}'}), 500
