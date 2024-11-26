from flask import jsonify, Blueprint
from datetime import datetime
from api.utils.jwt_utils import generate_token
import logging

logger = logging.getLogger(__name__)
blueprint = Blueprint('anonymous_auth', __name__)

@blueprint.route("/anonymous-token", methods=["GET"])
def get_anonymous_token():
    try:
        print(f"📝 Recebida requisição para gerar token anônimo")
        anonymous_id = f"anon_{datetime.utcnow().timestamp()}"
        
        token = generate_token(anonymous_id)
        print(f"🔑 Token JWT gerado: {token}")
        print(f"👤 ID anônimo: {anonymous_id}")
        
        response_data = {
            "token": token,
            "type": "anonymous",
            "user_id": anonymous_id
        }
        print(f"✅ Resposta preparada: {response_data}")
        
        return jsonify(response_data), 200
    except Exception as e:
        print(f"❌ Erro ao gerar token: {str(e)}")
        return jsonify({
            "error": "Erro ao gerar token anônimo",
            "details": str(e)
        }), 500 