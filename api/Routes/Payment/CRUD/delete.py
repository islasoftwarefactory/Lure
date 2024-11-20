from flask import jsonify, Blueprint
from api.Database.Models.Payment import Payment
from api.Database.connection import db

blueprint = Blueprint('delete_payment', __name__)

@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    payment = Payment.query.get(id)
    if payment is None:
        return jsonify({"error": "Payment not found"}), 404

    try:
        db.session.delete(payment)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete payment: {str(e)}"}), 500

    return jsonify({"message": "Payment deleted successfully"}), 200
