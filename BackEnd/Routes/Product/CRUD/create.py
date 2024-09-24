from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Product import Product
from ....Database.connection import db

blueprint = Blueprint('create_product', __name__)

@blueprint.route("/create/<int:size_id>/<int:category_id>/<int:gender_id>", methods=["POST"])
def create(size_id, category_id, gender_id):
    data = request.get_json()

    if not data or not all(field in data for field in ("name", "price", "description", "inventory")):
        return jsonify({"message": "Falta de campos obrigatórios"}), 400

    try:
        product = Product(
            name=data["name"],
            price=data["price"],
            size_id=size_id,
            description=data["description"],
            images_ids=data.get("images_ids"),
            inventory=data["inventory"],
            category_id=category_id,
            gender_id=gender_id
        )

        db.session.add(product)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao criar o produto: {str(e)}"}), 500

    return jsonify({
        "data": product.serialize(),
        "message": "Produto criado com sucesso."
    }), 201
