from flask import Blueprint, request, jsonify
from BackEnd.Database.Models.ImageCategory import ImageCategory
from ....Database.connection import db

blueprint = Blueprint('delete_image_category', __name__)

@blueprint.route('/delete/<int:id>', methods=['DELETE'])
def delete_image_category(id):
    try:
        category = ImageCategory.query.get(id)
        if not category:
            return jsonify({'error': 'ImageCategory not found'}), 404

        db.session.delete(category)
        db.session.commit()

        return jsonify({'message': 'ImageCategory deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete image category: {str(e)}'}), 500
