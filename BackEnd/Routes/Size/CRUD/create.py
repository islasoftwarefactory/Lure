from flask import request, jsonify, Blueprint
from Database.connection import db
from Database.Models import Size

blueprint = Blueprint('create_size', __name__)

@blueprint.route("/create", methods=["POST"])
def create():
    data = request.get_json()

    if not data or not all(field in data for field in ("name")):
        return jsonify({"message": "Falta de campos obrigatórios"}), 400

    try:
        size = Size(
            name=data["name"],
            long_name=data.get("long_name")
        )

        db.session.add(size)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao criar o tamanho: {str(e)}"}), 500

    return jsonify({
        "data": size.serialize(),
        "message": "Tamanho criado com sucesso."
    }), 201
