from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Product import Product
from ....Database.connection import db

blueprint = Blueprint('update_product', __name__)

@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    product = Product.query.get(id)
    if product is None:
        return jsonify({"error": "Produto não encontrado"}), 404

    data = request.get_json()

    for field in ("name", "price", "size_id", "description", "images_ids", "inventory", "category_id", "gender_id"):
        if field in data:
            setattr(product, field, data[field])

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao atualizar o produto: {str(e)}"}), 500

    return jsonify({
        "data": product.serialize(),
        "message": "Produto atualizado com sucesso."
    }), 200
