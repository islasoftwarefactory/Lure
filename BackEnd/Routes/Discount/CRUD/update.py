from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Discount import Discount
from ....Database.connection import db

blueprint = Blueprint('update_discount', __name__)

@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    discount = Discount.query.get(id)
    if discount is None:
        return jsonify({"error": "Discount not found"}), 404

    data = request.get_json()

    for field in ("name", "description", "value", "allowed_product_id"):
        if field in data:
            setattr(discount, field, data[field])

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update discount: {str(e)}"}), 500

    return jsonify({
        "data": discount.serialize(),
        "message": "Discount updated successfully."
    }), 200
