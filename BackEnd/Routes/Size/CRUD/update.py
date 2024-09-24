from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Size import Size
from ....Database.connection import db

blueprint = Blueprint('update_size', __name__)

@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    size = Size.query.get(id)
    if size is None:
        return jsonify({"error": "Tamanho não encontrado"}), 404

    data = request.get_json()

    if "name" in data:
        size.name = data["name"]
    if "long_name" in data:
        size.long_name = data["long_name"]

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao atualizar o tamanho: {str(e)}"}), 500

    return jsonify({
        "data": size.serialize(),
        "message": "Tamanho atualizado com sucesso."
    }), 200
