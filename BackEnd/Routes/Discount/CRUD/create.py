from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Discount import Discount
from ....Database.connection import db

blueprint = Blueprint('create_discount', __name__)

@blueprint.route("/create/<int:allowed_product_id>", methods=["POST"])
def create(allowed_product_id):
    data = request.get_json()

    if not data or not all(field in data for field in ("name", "description", "value")):
        return jsonify({"message": "Falta de campos obrigatórios"}), 400

    try:
        discount = Discount(
            name=data["name"],
            description=data["description"],
            value=data["value"],
            allowed_product_id=allowed_product_id
        )

        db.session.add(discount)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao criar o desconto: {str(e)}"}), 500

    return jsonify({
        "data": discount.serialize(),
        "message": "Desconto criado com sucesso."
    }), 201
