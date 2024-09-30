from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Cart import Cart
from ....Database.connection import db

blueprint = Blueprint('create_cart', __name__)

@blueprint.route("/create/<int:user_id>/<int:product_id>/<int:discount_id>", methods=["POST"])
def create(user_id, product_id, discount_id):
    data = request.get_json()

    if not data or "status" not in data:
        return jsonify({"message": "Falta de campos obrigatórios"}), 400

    try:
        cart = Cart(
            status=data["status"],
            user_id=user_id,
            product_id=product_id,
            discount_id=discount_id
        )

        db.session.add(cart)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao criar o carrinho: {str(e)}"}), 500

    return jsonify({
        "data": cart.serialize(),
        "message": "Carrinho criado com sucesso."
    }), 201
