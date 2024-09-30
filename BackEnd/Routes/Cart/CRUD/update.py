from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Cart import Cart
from ....Database.connection import db

blueprint = Blueprint('update_cart', __name__)

@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    cart = Cart.query.get(id)
    if cart is None:
        return jsonify({"error": "Categoria não encontrada"}), 404

    data = request.get_json()

    for field in ("name", "gender_id"):
        if field in data:
            setattr(cart, field, data[field])

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao atualizar a categoria: {str(e)}"}), 500

    return jsonify({
        "data": cart.serialize(),
        "message": "Categoria atualizada com sucesso."
    }), 200
