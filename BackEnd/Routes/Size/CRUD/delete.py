from flask import jsonify, Blueprint
from Database.connection import db
from Database.Models import Size

blueprint = Blueprint('delete_size', __name__)

@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    size = Size.query.get(id)
    if size is None:
        return jsonify({"error": "Tamanho não encontrado"}), 404

    try:
        db.session.delete(size)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao deletar o tamanho: {str(e)}"}), 500

    return jsonify({"message": "Tamanho deletado com sucesso"}), 200
