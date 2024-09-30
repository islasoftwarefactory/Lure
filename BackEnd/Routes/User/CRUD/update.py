from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.User import User
from ....Database.connection import db

blueprint = Blueprint('update_user', __name__)

@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    user = User.query.get(id)
    if user is None:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()

    if "name" in data:
        user.name = data["name"]
    if "email" in data:
        user.email = data["email"]
    if "photo" in data:
        user.photo = data["photo"]
    if "sso_type" in data:
        user.sso_type = data["sso_type"]
    if "default_address_id" in data:
        user.default_address_id = data["default_address_id"]

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update user: {str(e)}"}), 500

    return jsonify({
        "data": user.serialize(),
        "message": "User updated successfully."
    }), 200
