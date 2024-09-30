from flask import Blueprint, request, jsonify
from ..Models.ImageCategory import ImageCategory
from ..connection import db

image_category_bp = Blueprint('image_category', __name__)

@image_category_bp.route('/image_category', methods=['POST'])
def create_image_category():
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'error': 'Name is required'}), 400

    new_category = ImageCategory(name=data['name'])
    db.session.add(new_category)
    db.session.commit()

    return jsonify(new_category.serialize()), 201
