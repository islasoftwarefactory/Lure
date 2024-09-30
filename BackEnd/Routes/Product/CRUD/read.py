from flask import jsonify, Blueprint
from BackEnd.Database.Models.Product import Product

blueprint = Blueprint('read_product', __name__)

@blueprint.route("/read/<int:id>", methods=["GET"])
def read(id):
    product = Product.query.get(id)
    if product is None:
        return jsonify({"error": "Product not found"}), 404

    return jsonify({
        "data": product.serialize(),
        "message": "Product retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
def read_all():
    products = Product.query.all()
    products_data = [product.serialize() for product in products]

    return jsonify({
        "data": products_data,
        "message": "Products retrieved successfully."
    }), 200
