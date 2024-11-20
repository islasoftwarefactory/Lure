from flask import jsonify, Blueprint
from api.Database.Models.PaymentMethod import PaymentMethod

blueprint = Blueprint('read_payment_method', __name__)

@blueprint.route("/read/<int:id>", methods=["GET"])
def read(id):
    payment_method = PaymentMethod.query.get(id)
    if payment_method is None:
        return jsonify({"error": "Payment method not found"}), 404

    return jsonify({
        "data": payment_method.serialize(),
        "message": "Payment method retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
def read_all():
    payment_methods = PaymentMethod.query.all()
    payment_methods_data = [payment_method.serialize() for payment_method in payment_methods]

    return jsonify({
        "data": payment_methods_data,
        "message": "Payment methods retrieved successfully."
    }), 200
