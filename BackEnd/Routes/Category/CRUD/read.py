from flask import jsonify, Blueprint
from Database.connection import db
from Database.Models.Category import Category

blueprint = Blueprint('read_category', __name__)

@blueprint.route("/read/<int:id>", methods=["GET"])
def read(id):
    category = Category.query.get(id)
    if category is None:
        return jsonify({"error": "Categoria não encontrada"}), 404

    return jsonify({
        "data": category.serialize(),
        "message": "Categoria retornada com sucesso."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
def read_all():
    categories = Category.query.all()
    categories_data = [category.serialize() for category in categories]

    return jsonify({
        "data": categories_data,
        "message": "Categorias retornadas com sucesso."
    }), 200
