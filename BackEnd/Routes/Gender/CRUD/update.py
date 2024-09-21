from flask import request, jsonify, Blueprint
from Database.connection import db
from Database.Models import Gender

blueprint = Blueprint('update_gender', __name__)

@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    gender = Gender.query.get(id)
    if gender is None:
        return jsonify({"error": "Gênero não encontrado"}), 404

    data = request.get_json()

    for field in ("name", "long_name"):
        if field in data:
            setattr(gender, field, data[field])

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao atualizar o gênero: {str(e)}"}), 500

    return jsonify({
        "data": gender.serialize(),
        "message": "Gênero atualizado com sucesso."
    }), 200
