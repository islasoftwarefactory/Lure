from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Category import Category
from ....Database.connection import db

blueprint = Blueprint('update_category', __name__)

@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    category = Category.query.get(id)
    if category is None:
        return jsonify({"error": "Categoria não encontrada"}), 404

    data = request.get_json()

    for field in ("name", "gender_id"):
        if field in data:
            setattr(category, field, data[field])

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao atualizar a categoria: {str(e)}"}), 500

    return jsonify({
        "data": category.serialize(),
        "message": "Categoria atualizada com sucesso."
    }), 200
