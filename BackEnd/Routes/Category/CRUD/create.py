from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Category import Category
from BackEnd.Database.Models.Gender import Gender
from BackEnd.Database.connection import db
from BackEnd.validators.category_validators import validate_category_creation
from ...utils.decorators import token_required

blueprint = Blueprint('create_category', __name__)

@blueprint.route("/create", methods=["POST"])
@token_required
def create(current_user_id):
    data = request.get_json()

    validation_errors = validate_category_creation(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    category = Category(name=data["name"])

    try:
        db.session.add(category)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create category: {str(e)}"}), 500

    return jsonify({
        "data": category.serialize(),
        "message": "Category created successfully."
    }), 201
