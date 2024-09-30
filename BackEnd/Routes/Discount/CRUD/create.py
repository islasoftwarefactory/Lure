from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Discount import Discount
from ....Database.connection import db

blueprint = Blueprint('create_discount', __name__)

@blueprint.route("/create/<int:allowed_product_id>", methods=["POST"])
def create(allowed_product_id):
    data = request.get_json()

    if not data or not all(field in data for field in ("name", "description", "value")):
        return jsonify({"message": "Missing required fields"}), 400

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
        return jsonify({"error": f"Failed to create discount: {str(e)}"}), 500

    return jsonify({
        "data": discount.serialize(),
        "message": "Discount created successfully."
    }), 201
