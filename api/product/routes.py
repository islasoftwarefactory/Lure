from flask import request, jsonify, Blueprint
from api.product.model import Product, create_product, get_product, update_product, delete_product
from api.utils.jwt.decorators import token_required

blueprint = Blueprint('product', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
@token_required
def create(current_user_id):
    data = request.get_json()

    if not data or not all(field in data for field in 
                          ["name", "price", "size_id", "description", "inventory", "category_id", "gender_id"]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        product = create_product(data)
    except Exception as e:
        return jsonify({"error": f"Failed to create product: {str(e)}"}), 500

    return jsonify({
        "data": product.serialize(),
        "message": "Product created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    product = get_product(id)
    if product is None:
        return jsonify({"error": "Product not found"}), 404

    return jsonify({
        "data": product.serialize(),
        "message": "Product retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    products = Product.query.all()
    products_data = [product.serialize() for product in products]

    return jsonify({
        "data": products_data,
        "message": "Products retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
    data = request.get_json()

    try:
        product = update_product(id, data)
        if product is None:
            return jsonify({"error": "Product not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to update product: {str(e)}"}), 500

    return jsonify({
        "data": product.serialize(),
        "message": "Product updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    try:
        product = delete_product(id)
        if product is None:
            return jsonify({"error": "Product not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to delete product: {str(e)}"}), 500

    return jsonify({
        "message": "Product deleted successfully."
    }), 200 