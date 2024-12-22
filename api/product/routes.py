from flask import request, jsonify, Blueprint
from api.Database.Models.Product import Product
from api.Database.connection import db
from api.validators.product_validators import validate_product_creation
from api.utils.decorators import token_required

blueprint = Blueprint('product', __name__)

# Create
@blueprint.route("/create/<int:size_id>/<int:category_id>/<int:gender_id>", methods=["POST"])
def create(size_id, category_id, gender_id):
    data = request.get_json()

    validation_errors = validate_product_creation(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    try:
        product = Product(
            size_id=size_id,
            category_id=category_id,
            gender_id=gender_id,
            name=data["name"],
            price=data["price"],
            description=data["description"],
            inventory=data["inventory"],
            images_ids=data.get("images_ids"),
        )

        db.session.add(product)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create product: {str(e)}"}), 500

    return jsonify({
        "data": product.serialize(),
        "message": "Product created successfully."
    }), 201

# Read
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

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
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

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    product = Product.query.get(id)
    if product is None:
        return jsonify({"error": "Product not found"}), 404

    try:
        db.session.delete(product)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete product: {str(e)}"}), 500

    return jsonify({"message": "Product deleted successfully"}), 200 