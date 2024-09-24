from flask import jsonify, Blueprint
from BackEnd.Database.Models.Address import Address
from ....Database.connection import db


blueprint = Blueprint('delete_address', __name__)

@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    address = Address.query.get(id)
    if address is None:
        return jsonify({"error": "Endereço não encontrado"}), 404

    try:
        db.session.delete(address)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao deletar o endereço: {str(e)}"}), 500

    return jsonify({"message": "Endereço deletado com sucesso"}), 200
