from flask import request, jsonify, Blueprint
from api.cart.model import Cart, create_cart, get_cart, update_cart, delete_cart
from api.utils.jwt.decorators import token_required

blueprint = Blueprint('cart', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
@token_required
def create(current_user_id):
    data = request.get_json()

    if not data or not all(field in data for field in ["user_id", "product_id", "status"]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        cart = create_cart(data)
    except Exception as e:
        return jsonify({"error": f"Failed to create cart: {str(e)}"}), 500

    return jsonify({
        "data": cart.serialize(),
        "message": "Cart created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    cart = get_cart(id)
    if cart is None:
        return jsonify({"error": "Cart not found"}), 404

    return jsonify({
        "data": cart.serialize(),
        "message": "Cart retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    carts = Cart.query.all()
    carts_data = [cart.serialize() for cart in carts]

    return jsonify({
        "data": carts_data,
        "message": "Carts retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
    data = request.get_json()

    try:
        cart = update_cart(id, data)
        if cart is None:
            return jsonify({"error": "Cart not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to update cart: {str(e)}"}), 500

    return jsonify({
        "data": cart.serialize(),
        "message": "Cart updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    try:
        cart = delete_cart(id)
        if cart is None:
            return jsonify({"error": "Cart not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to delete cart: {str(e)}"}), 500

    return jsonify({
        "message": "Cart deleted successfully."
    }), 200