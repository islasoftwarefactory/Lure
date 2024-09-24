from flask import request, jsonify, Blueprint
from BackEnd.Database.Models.User import User
from ....Database.connection import db

# Quando usuario efetua o pedido o endereço é salvo, antes disso, nada existe

blueprint = Blueprint('create_user', __name__)

@blueprint.route("/create", methods=["POST"])
def create():
    data = request.get_json()

    user = User(
        name=data["name"],
        email=data["email"],
        photo=data["photo"],
        sso_type=data["sso_type"],
        # default_address_id=data["default_address_id"]
    )

    try:
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao criar o usuário: {str(e)}"}), 500

    return jsonify({
        "data": user.serialize(),
        "message": "Usuário criado com sucesso."
    }), 201
