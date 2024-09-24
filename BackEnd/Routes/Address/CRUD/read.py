from flask import jsonify, Blueprint
from BackEnd.Database.Models.Address import Address

blueprint = Blueprint('read_address', __name__)

@blueprint.route("/read/<int:id>", methods=["GET"])
def read(id):
    address = Address.query.get(id)
    if address is None:
        return jsonify({"error": "Endereço não encontrado"}), 404

    return jsonify({
        "data": address.serialize(),
        "message": "Endereço retornado com sucesso."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
def read_all():
    addresses = Address.query.all()
    addresses_data = [address.serialize() for address in addresses]

    return jsonify({
        "data": addresses_data,
        "message": "Endereços retornados com sucesso."
    }), 200
