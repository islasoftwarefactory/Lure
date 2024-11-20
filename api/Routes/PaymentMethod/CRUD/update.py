from flask import request, jsonify, Blueprint
from api.Database.Models.PaymentMethod import PaymentMethod
from api.Database.connection import db
from api.validators.payment_method_validators import validate_payment_method_update
from api.utils.decorators import token_required

blueprint = Blueprint('update_payment_method', __name__)

@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
    payment_method = PaymentMethod.query.get(id)
    if payment_method is None:
        return jsonify({"error": "Payment method not found"}), 404

    data = request.get_json()

    validation_errors = validate_payment_method_update(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    if "name" in data:
        payment_method.name = data["name"]

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update payment method: {str(e)}"}), 500

    return jsonify({
        "data": payment_method.serialize(),
        "message": "Payment method updated successfully."
    }), 200
