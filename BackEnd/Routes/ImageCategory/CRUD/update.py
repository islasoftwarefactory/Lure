from flask import Blueprint, request, jsonify
from BackEnd.Database.Models.ImageCategory import ImageCategory
from ....Database.connection import db

blueprint = Blueprint('update_image_category', __name__)

@blueprint.route('/update/<int:id>', methods=['PUT'])
def update_image_category(id):
    data = request.get_json()
    try:
        category = ImageCategory.query.get(id)
        if not category:
            return jsonify({'error': 'ImageCategory not found'}), 404

        if 'name' in data:
            category.name = data['name']
        db.session.commit()

        return jsonify(category.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update image category: {str(e)}'}), 500
