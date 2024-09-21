from flask import jsonify, Blueprint
from Database.connection import db
from Database.Models.Category import Category

blueprint = Blueprint('delete_category', __name__)

@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    category = Category.query.get(id)
    if category is None:
        return jsonify({"error": "Categoria não encontrada"}), 404

    try:
        db.session.delete(category)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao deletar a categoria: {str(e)}"}), 500

    return jsonify({"message": "Categoria deletada com sucesso"}), 200
