from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.Address import Address
from ....Database.connection import db
blueprint = Blueprint('create_address', __name__)

@blueprint.route("/create/<int:user_id>", methods=["POST"])
def create(user_id):
    data = request.get_json()

    if not data or not all(field in data for field in ("street", "number", "city", "state", "neighborhood", "zip_code")):
        return jsonify({"message": "Falta de campos obrigatórios"}), 400

    try:
        address = Address(
            user_id=user_id,
            observation=data.get("observation"),
            street=data["street"],
            number=data["number"],
            city=data["city"],
            state=data["state"],
            zip_code=data["zip_code"],
            neighborhood=data["neighborhood"],
            complement=data.get("complement")
        )

        db.session.add(address)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao criar o endereço: {str(e)}"}), 500

    return jsonify({
        "data": address.serialize(),
        "message": "Endereço criado com sucesso."
    }), 201
