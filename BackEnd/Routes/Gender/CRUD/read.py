from flask import jsonify, Blueprint
from BackEnd.Database.Models.Gender import Gender

blueprint = Blueprint('read_gender', __name__)

@blueprint.route("/read/<int:id>", methods=["GET"])
def read(id):
    gender = Gender.query.get(id)
    if gender is None:
        return jsonify({"error": "Gênero não encontrado"}), 404

    return jsonify({
        "data": gender.serialize(),
        "message": "Gênero retornado com sucesso."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
def read_all():
    genders = Gender.query.all()
    genders_data = [gender.serialize() for gender in genders]

    return jsonify({
        "data": genders_data,
        "message": "Gêneros retornados com sucesso."
    }), 200
