from flask import jsonify, Blueprint
from api.Database.Models.Product import Product
from api.utils.decorators import token_required

blueprint = Blueprint('read_product', __name__)

@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    product = Product.query.get(id)
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
