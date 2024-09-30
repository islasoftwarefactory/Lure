from flask import jsonify, Blueprint
from BackEnd.Database.Models.Address import Address
from ....Database.connection import db

blueprint = Blueprint('delete_address', __name__)

@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    address = Address.query.get(id)
    if address is None:
        return jsonify({"error": "Address not found"}), 404

    try:
        db.session.delete(address)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete address: {str(e)}"}), 500

    return jsonify({"message": "Address deleted successfully"}), 200
