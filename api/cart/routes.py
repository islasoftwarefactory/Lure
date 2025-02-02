from flask import request, jsonify, Blueprint
from api.cart.model import Cart, create_cart, get_cart, update_cart, delete_cart
from api.utils.jwt.decorators import token_required, optional_token_required
from flask import current_app

blueprint = Blueprint('cart', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
@optional_token_required
def create(current_user_id=None):
    data = request.get_json()
    
    if not data or "product_id" not in data:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        cart_data = {
            "user_id": current_user_id,  # Pode ser None para usuários anônimos
            "product_id": data["product_id"],
            "discount_id": data.get("discount_id"),
            "status": True
        }
        
        current_app.logger.info(f"Creating cart with data: {cart_data}")  # Log para debug
        
        cart = create_cart(cart_data)
        return jsonify({
            "data": cart.serialize(),
            "message": "Cart created successfully."
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Error in cart creation: {str(e)}")  # Log para debug
        return jsonify({"error": f"Failed to create cart: {str(e)}"}), 500

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

@blueprint.route("/migrate", methods=["POST"])
@token_required
def migrate_anonymous_cart(current_user_id):
    """Migrate anonymous cart items to user's cart after login"""
    data = request.get_json()
    anonymous_cart_items = data.get("cart_items", [])
    
    migrated_items = []
    try:
        for item in anonymous_cart_items:
            cart_data = {
                "user_id": current_user_id,
                "product_id": item["product_id"],
                "discount_id": item.get("discount_id"),
                "status": True
            }
            cart = create_cart(cart_data)
            migrated_items.append(cart.serialize())
            
        return jsonify({
            "data": migrated_items,
            "message": "Cart items migrated successfully"
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to migrate cart items: {str(e)}"}), 500