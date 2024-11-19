from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Product import Product
from ....Database.connection import db
from ....validators.product_validators import validate_product_creation

blueprint = Blueprint('create_product', __name__)

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
