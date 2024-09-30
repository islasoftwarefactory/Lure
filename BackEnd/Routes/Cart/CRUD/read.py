from flask import jsonify, Blueprint
from BackEnd.Database.Models.Cart import Cart

blueprint = Blueprint('read_cart', __name__)

@blueprint.route("/read/<int:id>", methods=["GET"])
def read(id):
    cart = Cart.query.get(id)
    if cart is None:
        return jsonify({"error": "Categoria não encontrada"}), 404

    return jsonify({
        "data": cart.serialize(),
        "message": "Categoria retornada com sucesso."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
def read_all():
    categories = Cart.query.all()
    categories_data = [category.serialize() for category in categories]

    return jsonify({
        "data": categories_data,
        "message": "Categorias retornadas com sucesso."
    }), 200
