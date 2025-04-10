from flask import request, jsonify, Blueprint, current_app
from api.user.model import User, create_user, get_user, update_user, delete_user
from api.utils.jwt.decorators import token_required
from api.utils.jwt.jwt_utils import generate_token, verify_token
from functools import wraps
import traceback

blueprint = Blueprint('user', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "Token ausente!"}), 401

        user_id = verify_token(token.split()[1] if token.startswith("Bearer ") else token)
        if not user_id:
            return jsonify({"message": "Token inválido ou expirado!"}), 401

        return f(user_id, *args, **kwargs)
    return decorated

# Create
@blueprint.route("/create", methods=["POST"])
def create():
    current_app.logger.info("Recebida requisição POST em /user/create")
    data = request.get_json()

    current_app.logger.debug(f"Dados recebidos no corpo JSON: {data}")

    if not data:
        current_app.logger.warning("Requisição recebida sem corpo JSON.")
        return jsonify({"error": "Request body must be JSON"}), 400

    current_app.logger.info("Tentando criar usuário com os dados recebidos.")
    try:
        user = create_user(data)
        current_app.logger.info(f"Usuário criado com sucesso: ID {user.id}, Email {user.email}")
        return jsonify({
            "data": user.serialize(),
            "message": "User created successfully."
        }), 201
    except ValueError as e:
        current_app.logger.error(f"Erro de validação ao criar usuário: {str(e)}")
        return jsonify({"error": f"Invalid user data: {str(e)}"}), 400
    except Exception as e:
        current_app.logger.error(f"Erro inesperado ao criar usuário: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to create user due to an internal server error."}), 500

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    current_app.logger.info(f"Recebida requisição GET em /user/read/{id}")
    user = get_user(id)
    if user is None:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "data": user.serialize(),
        "message": "User retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    users = User.query.all()
    users_data = [user.serialize() for user in users]

    return jsonify({
        "data": users_data,
        "message": "Users retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
    current_app.logger.info(f"Recebida requisição PUT em /user/update/{id}")
    data = request.get_json()
    current_app.logger.debug(f"Dados recebidos para atualização: {data}")

    if not data:
        current_app.logger.warning(f"Requisição PUT para /user/update/{id} sem corpo JSON.")
        return jsonify({"error": "Request body must be JSON"}), 400

    try:
        user = update_user(id, data)
        current_app.logger.info(f"Usuário ID {id} atualizado com sucesso.")
        return jsonify({
            "data": user.serialize(),
            "message": "User updated successfully."
        }), 200
    except ValueError as e:
        current_app.logger.error(f"Erro de validação/não encontrado ao atualizar usuário ID {id}: {str(e)}")
        if "não encontrado" in str(e).lower():
             return jsonify({"error": f"User not found: {str(e)}"}), 404
        else:
             return jsonify({"error": f"Invalid update data: {str(e)}"}), 400
    except Exception as e:
        current_app.logger.error(f"Erro inesperado ao atualizar usuário ID {id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to update user due to an internal server error."}), 500

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    current_app.logger.info(f"Recebida requisição DELETE em /user/delete/{id}")
    try:
        deleted = delete_user(id)
        if not deleted:
            current_app.logger.warning(f"Tentativa de deletar usuário ID {id} falhou (não encontrado).")
            return jsonify({"error": "User not found"}), 404
        else:
            current_app.logger.info(f"Usuário ID {id} deletado com sucesso.")
            return jsonify({
                "message": "User deleted successfully."
            }), 200
    except Exception as e:
        current_app.logger.error(f"Erro inesperado ao deletar usuário ID {id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to delete user due to an internal server error."}), 500

# Token Refresh
@blueprint.route('/refresh-token', methods=['POST'])
@token_required
def refresh_token(current_user_id):
    new_token = generate_token(current_user_id)
    return jsonify({'token': new_token}), 200

# Anonymous Token
@blueprint.route('/anonymous-token', methods=['GET'])
def get_anonymous_token():
    """
    Gera um token JWT anônimo para usuários não autenticados
    """
    try:
        # Gera um token com ID 'anonymous'
        token = generate_token('anonymous')
        return jsonify({
            'token': token,
            'type': 'anonymous'
        }), 200
    except Exception as e:
        return jsonify({
            'error': f'Erro ao gerar token anônimo: {str(e)}'
        }), 500