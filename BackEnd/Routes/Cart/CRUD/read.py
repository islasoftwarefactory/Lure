from flask import jsonify, Blueprint
from BackEnd.Database.Models.Cart import Cart

blueprint = Blueprint('read_cart', __name__)

@blueprint.route("/read/<int:id>", methods=["GET"])
def read(id):
    cart = Cart.query.get(id)
    if cart is None:
        return jsonify({"error": "Cart not found"}), 404

    return jsonify({
        "data": cart.serialize(),
        "message": "Cart retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
def read_all():
    carts = Cart.query.all()
    carts_data = [cart.serialize() for cart in carts]

    return jsonify({
        "data": carts_data,
        "message": "Carts retrieved successfully."
    }), 200
