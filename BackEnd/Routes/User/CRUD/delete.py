from flask import jsonify, Blueprint
from ....Database.connection import db
from ....Database.Models import User

blueprint = Blueprint('delete_user', __name__)

@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    user = User.query.get(id)
    if user is None:
        return jsonify({"error": "Usuário não encontrado"}), 404

    try:
        db.session.delete(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao deletar o usuário: {str(e)}"}), 500

    return jsonify({"message": "Usuário deletado com sucesso"}), 200
