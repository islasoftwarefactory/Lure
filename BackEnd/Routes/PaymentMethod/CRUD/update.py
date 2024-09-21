from flask import request, jsonify, Blueprint
from Database.connection import db
from Database.Models import PaymentMethod

blueprint = Blueprint('update_payment_method', __name__)

@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    payment_method = PaymentMethod.query.get(id)
    if payment_method is None:
        return jsonify({"error": "Método de pagamento não encontrado"}), 404

    data = request.get_json()

    for field in ("name", "long_name"):
        if field in data:
            setattr(payment_method, field, data[field])

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao atualizar o método de pagamento: {str(e)}"}), 500

    return jsonify({
        "data": payment_method.serialize(),
        "message": "Método de pagamento atualizado com sucesso."
    }), 200
