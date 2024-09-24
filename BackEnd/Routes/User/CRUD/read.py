from flask import jsonify, Blueprint
from BackEnd.Database.Models.User import User


blueprint = Blueprint('read_user', __name__)

@blueprint.route("/read/<int:id>", methods=["GET"])
def read(id):
    user = User.query.get(id)
    if user is None:
        return jsonify({"error": "Usuário não encontrado"}), 404

    return jsonify({
        "data": user.serialize(),
        "message": "Usuário retornado com sucesso."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
def read_all():
    users = User.query.all()
    users_data = [user.serialize() for user in users]

    return jsonify({
        "data": users_data,
        "message": "Usuários retornados com sucesso."
    }), 200
