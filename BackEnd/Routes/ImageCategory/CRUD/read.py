from flask import jsonify, Blueprint
from BackEnd.Database.Models.ImageCategory import ImageCategory
from ....Database.connection import db

blueprint = Blueprint('read_image_category', __name__)

@blueprint.route('/read/<int:id>', methods=['GET'])
def read_image_category(id):
    try:
        category = ImageCategory.query.get(id)
        if category:
            return jsonify(category.serialize()), 200
        return jsonify({'error': 'ImageCategory not found'}), 404
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve image category: {str(e)}'}), 500

@blueprint.route('/read', methods=['GET'])
def read_all_image_categories():
    try:
        categories = ImageCategory.query.all()
        return jsonify([category.serialize() for category in categories]), 200
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve image categories: {str(e)}'}), 500
