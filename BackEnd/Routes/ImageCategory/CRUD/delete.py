from flask import Blueprint, jsonify
from ..Models.ImageCategory import ImageCategory
from ..connection import db

blueprint = Blueprint('image_category_delete', __name__)

@blueprint.route('/read/<int:id>', methods=['DELETE'])
def delete_image_category(id):
    category = ImageCategory.query.get(id)
    if not category:
        return jsonify({'error': 'ImageCategory not found'}), 404

    db.session.delete(category)
    db.session.commit()

    return jsonify({'message': 'ImageCategory deleted successfully'}), 200
