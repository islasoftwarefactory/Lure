from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Discount import Discount
from ....Database.connection import db
from ....validators.discount_validators import validate_discount_creation

blueprint = Blueprint('create_discount', __name__)

@blueprint.route("/create/<int:allowed_product_id>", methods=["POST"])
def create(allowed_product_id):
    data = request.get_json()

    validation_errors = validate_discount_creation(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    try:
        discount = Discount(
            name=data["name"],
            description=data["description"],
            value=data["value"],
            allowed_product_id=allowed_product_id
        )

        db.session.add(discount)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create discount: {str(e)}"}), 500

    return jsonify({
        "data": discount.serialize(),
        "message": "Discount created successfully."
    }), 201
