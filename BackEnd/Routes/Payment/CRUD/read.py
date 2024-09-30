from flask import jsonify, Blueprint
from BackEnd.Database.Models.Payment import Payment

blueprint = Blueprint('read_payment', __name__)

@blueprint.route("/read/<int:id>", methods=["GET"])
def read(id):
    payment = Payment.query.get(id)
    if payment is None:
        return jsonify({"error": "Payment not found"}), 404

    return jsonify({
        "data": payment.serialize(),
        "message": "Payment retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
def read_all():
    payments = Payment.query.all()
    payments_data = [payment.serialize() for payment in payments]

    return jsonify({
        "data": payments_data,
        "message": "Payments retrieved successfully."
    }), 200
