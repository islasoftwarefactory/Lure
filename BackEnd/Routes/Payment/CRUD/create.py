from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Payment import Payment
from ....Database.connection import db

blueprint = Blueprint('create_payment', __name__)

@blueprint.route("/create/<int:user_id>/<int:payment_method_id>", methods=["POST"])
def create(user_id, payment_method_id):
    data = request.get_json()

    if not data or not all(field in data for field in ("user_id", "total", "checkout_url", "status")):
        return jsonify({"message": "Falta de campos obrigatórios"}), 400

    try:
        payment = Payment(
            user_id=user_id,
            total=data["total"],
            payment_method_id=payment_method_id,
            checkout_url=data["checkout_url"],
            status=data["status"]
        )

        db.session.add(payment)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao criar o pagamento: {str(e)}"}), 500

    return jsonify({
        "data": payment.serialize(),
        "message": "Pagamento criado com sucesso."
    }), 201
 