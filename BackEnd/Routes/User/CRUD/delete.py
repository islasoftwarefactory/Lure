from flask import jsonify, Blueprint
from BackEnd.Database.Models.User import User

blueprint = Blueprint('delete_user', __name__)

@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    user = User.query.get(id)
    if user is None:
        return jsonify({"error": "User not found"}), 404

    try:
        db.session.delete(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete user: {str(e)}"}), 500

    return jsonify({"message": "User deleted successfully"}), 200
