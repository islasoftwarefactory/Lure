from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Payment import Payment
from ....Database.connection import db

blueprint = Blueprint('update_payment', __name__)

@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    payment = Payment.query.get(id)
    if payment is None:
        return jsonify({"error": "Pagamento não encontrado"}), 404

    data = request.get_json()

    for field in ("user_id", "total", "payment_method_id", "checkout_url", "status"):
        if field in data:
            setattr(payment, field, data[field])

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao atualizar o pagamento: {str(e)}"}), 500

    return jsonify({
        "data": payment.serialize(),
        "message": "Pagamento atualizado com sucesso."
    }), 200
