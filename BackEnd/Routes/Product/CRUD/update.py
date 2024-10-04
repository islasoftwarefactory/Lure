from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Product import Product
from ....Database.connection import db
from ....validators.product_validators import validate_product_creation

blueprint = Blueprint('update_product', __name__)

@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    product = Product.query.get(id)
    if product is None:
        return jsonify({"error": "Product not found"}), 404

    data = request.get_json()

    validation_errors = validate_product_creation(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    for field in ("name", "price", "size_id", "description", "images_ids", "inventory", "category_id", "gender_id"):
        if field in data:
            setattr(product, field, data[field])

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update product: {str(e)}"}), 500

    return jsonify({
        "data": product.serialize(),
        "message": "Product updated successfully."
    }), 200
