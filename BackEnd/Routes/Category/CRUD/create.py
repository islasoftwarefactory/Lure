from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Category import Category
from BackEnd.Database.Models.Gender import Gender
from ....Database.connection import db
from ....validators.category_validators import validate_category_creation

blueprint = Blueprint('create_category', __name__)

@blueprint.route("/create/<int:gender_id>", methods=["POST"])
def create(gender_id):
    data = request.get_json()

    validation_errors = validate_category_creation(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    gender = Gender.query.get(gender_id)
    if not gender:
        return jsonify({"message": "Gender not found"}), 404

    try:
        category = Category(
            name=data["name"],
            gender_id=gender_id
        )

        db.session.add(category)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create category: {str(e)}"}), 500

    return jsonify({
        "data": category.serialize(),
        "message": "Category created successfully."
    }), 201
