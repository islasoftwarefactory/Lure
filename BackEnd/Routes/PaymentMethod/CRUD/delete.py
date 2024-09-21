from flask import jsonify, Blueprint
from Database.connection import db
from Database.Models import PaymentMethod

blueprint = Blueprint('delete_payment_method', __name__)

@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    payment_method = PaymentMethod.query.get(id)
    if payment_method is None:
        return jsonify({"error": "Método de pagamento não encontrado"}), 404

    try:
        db.session.delete(payment_method)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao deletar o método de pagamento: {str(e)}"}), 500

    return jsonify({"message": "Método de pagamento deletado com sucesso"}), 200
