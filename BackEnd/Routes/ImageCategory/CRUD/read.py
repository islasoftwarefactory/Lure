from flask import Blueprint, jsonify
from ..Models.ImageCategory import ImageCategory

blueprint = Blueprint('image_category_read', __name__)

@blueprint.route('/read/<int:id>', methods=['GET'])
def read_image_category(id):
    category = ImageCategory.query.get(id)
    if category:
        return jsonify(category.serialize()), 200
    return jsonify({'error': 'ImageCategory not found'}), 404

@blueprint.route('/read', methods=['GET'])
def read_all_image_categories():
    categories = ImageCategory.query.all()
    return jsonify([category.serialize() for category in categories]), 200
