from flask import jsonify, Blueprint
from api.Database.Models.Discount import Discount
from api.Database.connection import db
from api.utils.decorators import token_required

blueprint = Blueprint('delete_discount', __name__)

@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    discount = Discount.query.get(id)
    if discount is None:
        return jsonify({"error": "Discount not found"}), 404

    try:
        db.session.delete(discount)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete discount: {str(e)}"}), 500

    return jsonify({
        "message": "Discount deleted successfully."
    }), 200
