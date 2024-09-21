from flask import request, jsonify, Blueprint
from Database.connection import db
from Database.Models.Category import Category
import datetime

blueprint = Blueprint('create_category', __name__)

@blueprint.route("/create/<int:gender_id>", methods=["POST"])
def create(gender_id):
    data = request.get_json()

    if not data or not all(field in data for field in ("name")):
        return jsonify({"message": "Falta de campos obrigatórios"}), 400

    try:
        category = Category(
            name=data["name"],
            gender_id=gender_id
        )

        db.session.add(category)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao criar a categoria: {str(e)}"}), 500

    return jsonify({
        "data": category.serialize(),
        "message": "Categoria criada com sucesso."
    }), 201
