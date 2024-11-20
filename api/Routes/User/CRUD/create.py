from flask import request, jsonify, Blueprint
from api.Database.Models.User import User
from api.Database.connection import db
from api.validators.user_validators import validate_user_creation

blueprint = Blueprint('create_user', __name__)

@blueprint.route("/create", methods=["POST"])
def create():
    data = request.get_json()

    validation_errors = validate_user_creation(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    user = User(
        name=data["name"],
        email=data["email"],
        photo=data.get("photo"),
        sso_type=data["sso_type"],
    )

    try:
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create user: {str(e)}"}), 500

    return jsonify({
        "data": user.serialize(),
        "message": "User created successfully."
    }), 201
