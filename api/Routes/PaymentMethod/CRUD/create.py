from flask import request, jsonify, Blueprint
from api.Database.Models.PaymentMethod import PaymentMethod
from api.Database.connection import db
from api.validators.payment_method_validators import validate_payment_method_creation

blueprint = Blueprint('create_payment_method', __name__)

@blueprint.route("/create", methods=["POST"])
def create():
    data = request.get_json()

    validation_errors = validate_payment_method_creation(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    try:
        payment_method = PaymentMethod(
            name=data["name"],
            long_name=data["long_name"]
        )

        db.session.add(payment_method)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create payment method: {str(e)}"}), 500

    return jsonify({
        "data": payment_method.serialize(),
        "message": "Payment method created successfully."
    }), 201
