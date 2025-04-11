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
        token = generate_token(user.id)
        current_app.logger.info(f"Usuário criado/encontrado com sucesso: ID {user.id}, Email {user.email}. Token gerado.")
        return jsonify({
            "data": user.serialize(),
            "token": token,
            "message": "User created/logged in successfully."
        }), 200
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

# --- NEW ROUTE: Get Logged-in User's Data ---
@blueprint.route("/me", methods=["GET"])
@token_required
def get_current_user(current_user_id):
    """
    Retrieves the data for the currently authenticated user.
    The user ID is obtained from the validated JWT token.
    """
    current_app.logger.info(f"Recebida requisição GET em /user/me para usuário ID: {current_user_id}")

    # Handle cases where current_user_id might be 'anonymous' if that token is somehow used here
    if current_user_id == 'anonymous':
         current_app.logger.warning("Tentativa de acesso a /user/me com token anônimo.")
         # Decide how to handle anonymous token requests here. Usually deny.
         return jsonify({"error": "Anonymous users do not have profile data."}), 403 # Forbidden

    try:
        # Use the current_user_id passed by the decorator to get the user
        user = get_user(current_user_id)

        if user is None:
            # This case is less likely if the token is valid, but good practice to check
            current_app.logger.error(f"Usuário não encontrado para ID {current_user_id} validado pelo token.")
            return jsonify({"error": "User not found for validated token."}), 404

        current_app.logger.info(f"Dados do usuário ID {current_user_id} recuperados com sucesso.")
        # Return the serialized user data
        return jsonify({
            "data": user.serialize(),
            "message": "Current user data retrieved successfully."
        }), 200

    except Exception as e:
        current_app.logger.error(f"Erro inesperado ao buscar dados para usuário ID {current_user_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to retrieve user data due to an internal server error."}), 500
# --- END NEW ROUTE ---

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

@blueprint.route('/refresh-token', methods=['POST'])
@token_required
def refresh_token(current_user_id):
    new_token = generate_token(current_user_id)
    return jsonify({'token': new_token}), 200

@blueprint.route('/anonymous-token', methods=['GET'])
def get_anonymous_token():
    try:
        token = generate_token('anonymous')
        return jsonify({
            'token': token,
            'type': 'anonymous'
        }), 200
    except Exception as e:
        return jsonify({
            'error': f'Erro ao gerar token anônimo: {str(e)}'
        }), 500