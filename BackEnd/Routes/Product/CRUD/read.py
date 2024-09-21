from flask import jsonify, Blueprint
from Database.Models import Product

blueprint = Blueprint('read_product', __name__)

@blueprint.route("/read/<int:id>", methods=["GET"])
def read(id):
    product = Product.query.get(id)
    if product is None:
        return jsonify({"error": "Produto não encontrado"}), 404

    return jsonify({
        "data": product.serialize(),
        "message": "Produto retornado com sucesso."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
def read_all():
    products = Product.query.all()
    products_data = [product.serialize() for product in products]

    return jsonify({
        "data": products_data,
        "message": "Produtos retornados com sucesso."
    }), 200
