from flask import request, jsonify, Blueprint
from Database.connection import db
from Database.Models.Discount import Discount

blueprint = Blueprint('update_discount', __name__)

@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    discount = Discount.query.get(id)
    if discount is None:
        return jsonify({"error": "Desconto não encontrado"}), 404

    data = request.get_json()

    for field in ("name", "description", "value", "allowed_product_id"):
        if field in data:
            setattr(discount, field, data[field])

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao atualizar o desconto: {str(e)}"}), 500

    return jsonify({
        "data": discount.serialize(),
        "message": "Desconto atualizado com sucesso."
    }), 200
