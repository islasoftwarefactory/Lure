from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.PaymentMethod import PaymentMethod
from ....Database.connection import db
from ....validators.payment_method_validators import validate_payment_method_creation

blueprint = Blueprint('update_payment_method', __name__)

@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    payment_method = PaymentMethod.query.get(id)
    if payment_method is None:
        return jsonify({"error": "Payment method not found"}), 404

    data = request.get_json()

    validation_errors = validate_payment_method_creation(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    for field in ("name", "long_name"):
        if field in data:
            setattr(payment_method, field, data[field])

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update payment method: {str(e)}"}), 500

    return jsonify({
        "data": payment_method.serialize(),
        "message": "Payment method updated successfully."
    }), 200
