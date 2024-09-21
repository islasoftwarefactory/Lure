from flask import jsonify, Blueprint
from Database.connection import db
from Database.Models.Discount import Discount

blueprint = Blueprint('delete_discount', __name__)

@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    discount = Discount.query.get(id)
    if discount is None:
        return jsonify({"error": "Desconto não encontrado"}), 404

    try:
        db.session.delete(discount)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao deletar o desconto: {str(e)}"}), 500

    return jsonify({"message": "Desconto deletado com sucesso"}), 200
