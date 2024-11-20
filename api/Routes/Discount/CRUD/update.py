from flask import request, jsonify, Blueprint
from api.Database.Models.Discount import Discount
from api.Database.connection import db
from api.validators.discount_validators import validate_discount_update
from api.utils.decorators import token_required

blueprint = Blueprint('update_discount', __name__)

@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
    discount = Discount.query.get(id)
    if discount is None:
        return jsonify({"error": "Discount not found"}), 404

    data = request.get_json()

    validation_errors = validate_discount_update(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    for field in ("name", "description", "discount_percent", "start_date", "end_date"):
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
