from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.PaymentMethod import PaymentMethod
from ....Database.connection import db

blueprint = Blueprint('create_payment_method', __name__)

@blueprint.route("/create", methods=["POST"])
def create():
    data = request.get_json()

    if not data or not all(field in data for field in ("name", "long_name")):
        return jsonify({"message": "Falta de campos obrigatórios"}), 400

    try:
        payment_method = PaymentMethod(
            name=data["name"],
            long_name=data["long_name"]
        )

        db.session.add(payment_method)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao criar o método de pagamento: {str(e)}"}), 500

    return jsonify({
        "data": payment_method.serialize(),
        "message": "Método de pagamento criado com sucesso."
    }), 201
