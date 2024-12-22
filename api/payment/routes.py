from flask import request, jsonify, Blueprint
from api.Database.Models.Payment import Payment
from api.Database.connection import db
from api.validators.payment_validators import validate_payment_creation, validate_payment_update
from api.utils.decorators import token_required

blueprint = Blueprint('payment', __name__)

# Create
@blueprint.route("/create/<int:user_id>/<int:payment_method_id>", methods=["POST"])
def create(user_id, payment_method_id):
    data = request.get_json()

    validation_errors = validate_payment_creation(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    try:
        payment = Payment(
            user_id=user_id,
            payment_method_id=payment_method_id,
            total=data["total"],
            checkout_url=data["checkout_url"],
            status=data["status"]
        )

        db.session.add(payment)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create payment: {str(e)}"}), 500

    return jsonify({
        "data": payment.serialize(),
        "message": "Payment created successfully."
    }), 201

# Read
@blueprint.route("/read/ 