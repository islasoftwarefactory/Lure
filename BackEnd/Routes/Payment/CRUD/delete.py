from flask import jsonify, Blueprint
from Database.connection import db
from Database.Models import Payment

blueprint = Blueprint('delete_payment', __name__)

@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    payment = Payment.query.get(id)
    if payment is None:
        return jsonify({"error": "Pagamento não encontrado"}), 404

    try:
        db.session.delete(payment)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao deletar o pagamento: {str(e)}"}), 500

    return jsonify({"message": "Pagamento deletado com sucesso"}), 200
