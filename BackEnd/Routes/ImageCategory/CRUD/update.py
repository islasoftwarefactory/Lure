from flask import Blueprint, request, jsonify
from ..Models.ImageCategory import ImageCategory
from ..connection import db

blueprint = Blueprint('image_category_update', __name__)

@blueprint.route('/read/<int:id>', methods=['PUT'])
def update_image_category(id):
    data = request.get_json()
    category = ImageCategory.query.get(id)
    if not category:
        return jsonify({'error': 'ImageCategory not found'}), 404

    if 'name' in data:
        category.name = data['name']
    db.session.commit()

    return jsonify(category.serialize()), 200
