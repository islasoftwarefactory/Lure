from flask import request, jsonify, Blueprint
from Database.connection import db
from Database.Models import Address

blueprint = Blueprint('update_address', __name__)

@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    address = Address.query.get(id)
    if address is None:
        return jsonify({"error": "Endereço não encontrado"}), 404

    data = request.get_json()

    for field in ("street", "number", "city", "state", "zip_code", "neighborhood"):
        if field in data:
            setattr(address, field, data[field])

    address.observation = data.get("observation", address.observation)
    address.complement = data.get("complement", address.complement)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao atualizar o endereço: {str(e)}"}), 500

    return jsonify({
        "data": address.serialize(),
        "message": "Endereço atualizado com sucesso."
    }), 200
