from flask import jsonify, Blueprint
from BackEnd.Database.Models.User import User
from ...utils.decorators import token_required

blueprint = Blueprint('read_user', __name__)

@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    user = User.query.get(id)
    if user is None:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "data": user.serialize(),
        "message": "User retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    users = User.query.all()
    users_data = [user.serialize() for user in users]

    return jsonify({
        "data": users_data,
        "message": "Users retrieved successfully."
    }), 200

@blueprint.route('/user/<int:user_id>', methods=['GET'])
@token_required
def get_user(current_user_id, user_id):
    user = User.query.get(user_id)
    if user is None:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "data": user.serialize(),
        "message": "User retrieved successfully."
    }), 200
