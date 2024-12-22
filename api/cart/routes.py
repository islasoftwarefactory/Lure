from flask import request, jsonify, Blueprint
from api.Database.Models.Cart import Cart
from api.Database.connection import db

blueprint = Blueprint('cart', __name__)

# Create
@blueprint.route("/create/<int:user_id>/<int:product_id>/<int:discount_id>", methods=["POST"])
def create(user_id, product_id, discount_id):
    data = request.get_json()

    if not data or "status" not in data:
        return jsonify({"message": "Missing required fields"}), 400

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
        return jsonify({"error": f"Failed to create cart: {str(e)}"}), 500

    return jsonify({
        "data": cart.serialize(),
        "message": "Cart created successfully."
    }), 201

# Read
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

# Update
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

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    cart = Cart.query.get(id)
    if cart is None:
        return jsonify({"error": "Cart not found"}), 404

    try:
        db.session.delete(cart)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete cart: {str(e)}"}), 500

    return jsonify({"message": "Cart deleted successfully"}), 200 