from flask import jsonify, Blueprint
from BackEnd.Database.Models.Cart import Cart
from ....Database.connection import db

blueprint = Blueprint('delete_cart', __name__)

@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    cart = Cart.query.get(id)
    if cart is None:
        return jsonify({"error": "Categoria não encontrada"}), 404

    try:
        db.session.delete(cart)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao deletar a categoria: {str(e)}"}), 500

    return jsonify({"message": "Categoria deletada com sucesso"}), 200
