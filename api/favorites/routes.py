from flask import Blueprint, request, jsonify, current_app
from api.favorites.model import add_favorite, remove_favorite, get_user_favorites, is_favorite
from api.product.model import get_product
from api.utils.security.jwt.decorators import token_required

favorites_bp = Blueprint("favorites", __name__, url_prefix="/favorites")

@favorites_bp.route("/create", methods=["POST"])
@token_required
def handle_add_favorite(current_user_id):
    """Adds a product to the current user's favorites list."""
    data = request.get_json()
    if not data or "product_id" not in data:
        return jsonify({"error": "Missing product_id in request body"}), 400

    product_id = data.get("product_id")

    if not isinstance(product_id, int):
        return jsonify({"error": "product_id must be an integer"}), 400

    if not get_product(product_id):
        return jsonify({"error": "Product not found"}), 404

    try:
        favorite = add_favorite(current_user_id, product_id)
        if favorite:
            return jsonify(favorite.serialize()), 201
        else:
            return jsonify({"error": "Could not add favorite. It may already exist."}), 409
    except Exception as e:
        current_app.logger.error(f"Error in handle_add_favorite: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

@favorites_bp.route("/delete/<int:product_id>", methods=["DELETE"])
@token_required
def handle_remove_favorite(current_user_id, product_id):
    """Removes a product from the current user's favorites list."""
    try:
        if remove_favorite(current_user_id, product_id):
            return jsonify({"message": "Favorite removed successfully"}), 200
        else:
            return jsonify({"error": "Favorite not found or could not be removed"}), 404
    except Exception as e:
        current_app.logger.error(f"Error in handle_remove_favorite: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

@favorites_bp.route("/read", methods=["GET"])
@token_required
def handle_get_user_favorites(current_user_id):
    """Retrieves all favorites for the currently authenticated user."""
    try:
        favorites = get_user_favorites(current_user_id)
        # Match the data structure the frontend expects
        return jsonify({"data": [fav.serialize() for fav in favorites]}), 200
    except Exception as e:
        current_app.logger.error(f"Error in handle_get_user_favorites: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

@favorites_bp.route("/is-favorite/<int:product_id>", methods=["GET"])
@token_required
def handle_is_favorite(current_user_id, product_id):
    """Checks if a specific product is in the current user's favorites."""
    if product_id is None:
        return jsonify({"error": "Missing product_id in query parameters"}), 400

    try:
        is_fav = is_favorite(current_user_id, product_id)
        return jsonify({"is_favorite": is_fav}), 200
    except Exception as e:
        current_app.logger.error(f"Error in handle_is_favorite: {e}")
        return jsonify({"error": "An internal error occurred"}), 500
