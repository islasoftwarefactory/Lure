from flask import request, jsonify, Blueprint
from api.Database.Models.Discount import Discount
from api.Database.connection import db
from api.validators.discount_validators import validate_discount_creation
from api.utils.decorators import token_required

blueprint = Blueprint('create_discount', __name__)

@blueprint.route("/create", methods=["POST"])
@token_required
def create(current_user_id):
    data = request.get_json()

    validation_errors = validate_discount_creation(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    discount = Discount(
        name=data["name"],
        description=data["description"],
        discount_percent=data["discount_percent"],
        start_date=data["start_date"],
        end_date=data["end_date"]
    )

    try:
        db.session.add(discount)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create discount: {str(e)}"}), 500

    return jsonify({
        "data": discount.serialize(),
        "message": "Discount created successfully."
    }), 201
