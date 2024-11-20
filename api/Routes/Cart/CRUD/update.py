from flask import request, jsonify, Blueprint
from api.Database.Models.Cart import Cart
from api.Database.connection import db

blueprint = Blueprint('update_cart', __name__)

@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    cart = Cart.query.get(id)
    if cart is None:
        return jsonify({"error": "Cart not found"}), 404

    data = request.get_json()

    for field in ("name", "gender_id"):
        if field in data:
            setattr(cart, field, data[field])

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update cart: {str(e)}"}), 500

    return jsonify({
        "data": cart.serialize(),
        "message": "Cart updated successfully."
    }), 200
