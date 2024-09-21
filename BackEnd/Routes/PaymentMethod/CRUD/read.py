from flask import jsonify, Blueprint
from Database.Models import PaymentMethod

blueprint = Blueprint('read_payment_method', __name__)

@blueprint.route("/read/<int:id>", methods=["GET"])
def read(id):
    payment_method = PaymentMethod.query.get(id)
    if payment_method is None:
        return jsonify({"error": "Método de pagamento não encontrado"}), 404

    return jsonify({
        "data": payment_method.serialize(),
        "message": "Método de pagamento retornado com sucesso."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
def read_all():
    payment_methods = PaymentMethod.query.all()
    payment_methods_data = [payment_method.serialize() for payment_method in payment_methods]

    return jsonify({
        "data": payment_methods_data,
        "message": "Métodos de pagamento retornados com sucesso."
    }), 200
