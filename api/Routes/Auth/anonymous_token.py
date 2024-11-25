from flask import jsonify, Blueprint
from api.utils.jwt_utils import generate_token
import uuid

blueprint = Blueprint('anonymous_auth', __name__)

@blueprint.route("/anonymous-token", methods=["GET"])
def get_anonymous_token():
    # Gera um ID único para usuário anônimo
    anonymous_id = f"anon_{uuid.uuid4()}"
    token = generate_token(anonymous_id)
    
    return jsonify({
        "token": token,
        "message": "Anonymous token generated successfully"
    }), 200 