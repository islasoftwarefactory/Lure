from flask import jsonify, Blueprint
from Database.connection import db
from Database.Models import Product

blueprint = Blueprint('delete_product', __name__)

@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    product = Product.query.get(id)
    if product is None:
        return jsonify({"error": "Produto não encontrado"}), 404

    try:
        db.session.delete(product)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao deletar o produto: {str(e)}"}), 500

    return jsonify({"message": "Produto deletado com sucesso"}), 200
