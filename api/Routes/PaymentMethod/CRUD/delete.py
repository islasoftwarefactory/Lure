from flask import jsonify, Blueprint
from api.Database.Models.PaymentMethod import PaymentMethod
from api.Database.connection import db

blueprint = Blueprint('delete_payment_method', __name__)

@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    payment_method = PaymentMethod.query.get(id)
    if payment_method is None:
        return jsonify({"error": "Payment method not found"}), 404

    try:
        db.session.delete(payment_method)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete payment method: {str(e)}"}), 500

    return jsonify({"message": "Payment method deleted successfully"}), 200
