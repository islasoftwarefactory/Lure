from flask import jsonify, Blueprint
from BackEnd.Database.Models.Discount import Discount
from ...utils.decorators import token_required

blueprint = Blueprint('read_discount', __name__)

@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    discount = Discount.query.get(id)
    if discount is None:
        return jsonify({"error": "Discount not found"}), 404

    return jsonify({
        "data": discount.serialize(),
        "message": "Discount retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    discounts = Discount.query.all()
    discounts_data = [discount.serialize() for discount in discounts]

    return jsonify({
        "data": discounts_data,
        "message": "Discounts retrieved successfully."
    }), 200
