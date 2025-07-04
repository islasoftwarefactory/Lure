from flask import request, jsonify, Blueprint, current_app
from api.user.model import User, create_user, get_user, update_user, delete_user, get_all_admins, promote_to_admin, demote_from_admin
from api.utils.security.jwt.decorators import token_required, admin_required
from api.utils.security.jwt.jwt_utils import generate_token, verify_token
import traceback

blueprint = Blueprint('user', __name__)

# Create or Login via OAuth data
@blueprint.route("/create", methods=["POST"])
def create_or_login_oauth():
    # --- LOG INICIAL DA ROTA ---
    current_app.logger.info(">>> Rota /user/create (OAuth) INICIADA")
    # --- FIM LOG INICIAL ---

    data = request.get_json()
    current_app.logger.debug(f"Dados OAuth recebidos no corpo JSON: {data}")

    if not data:
        current_app.logger.warning("<<< Rota /user/create (OAuth) FALHA: Request body não é JSON ou vazio.")
        return jsonify({"error": "Request body must be JSON"}), 400

    email = data.get('email')
    provider = data.get('auth_provider')
    provider_id = data.get('provider_id')

    # --- LOG: Dados Extraídos ---
    current_app.logger.debug(f"Dados extraídos: email={email}, provider={provider}, provider_id={provider_id}")
    # --- FIM LOG ---

    if not email or not provider or not provider_id:
         current_app.logger.error(f"Dados OAuth incompletos recebidos: {data}")
         current_app.logger.info("<<< Rota /user/create (OAuth) FALHA: Dados OAuth incompletos.")
         return jsonify({"error": "Incomplete OAuth data received (email, auth_provider, provider_id required)."}), 400

    user = None

    try:
        # --- Passo 1: Tentar Encontrar Usuário Existente ---
        current_app.logger.debug(f"Passo 1: Tentando encontrar usuário por provider={provider}, provider_id={provider_id}")
        existing_user = User.query.filter_by(auth_provider=provider, provider_id=provider_id).first()
        current_app.logger.debug(f"Resultado da busca por usuário existente: {'Encontrado (ID: ' + str(existing_user.id) + ')' if existing_user else 'Não Encontrado'}")

        if existing_user:
            current_app.logger.info(f"Usuário existente encontrado. ID: {existing_user.id}. Procedendo com fluxo de login.")
            user = existing_user

            # Opcional: Atualizar dados usando a função update_user do model
            update_data = {}
            if 'name' in data and data.get('name') != user.name: # Usar .get() para segurança
                 update_data['name'] = data['name']
            if 'photo' in data and data.get('photo') != user.photo: # Usar .get()
                 update_data['photo'] = data['photo']

            if update_data:
                current_app.logger.debug(f"Tentando atualizar dados para usuário ID {user.id} com: {update_data}")
                try:
                    user = update_user(user.id, update_data) # update_user retorna o usuário atualizado
                    current_app.logger.info(f"Dados do usuário ID {user.id} atualizados com sucesso via update_user.")
                except Exception as update_err:
                    current_app.logger.error(f"Erro ao tentar atualizar dados via update_user para ID {user.id}: {update_err}")
                    # Loga o erro mas continua com o usuário não atualizado

        else:
            # --- Passo 2: Criar Novo Usuário (se não encontrado) ---
            current_app.logger.info(f"Passo 2: Nenhum usuário encontrado. Tentando criar novo usuário usando create_user.")
            try:
                 user = create_user(data)
                 current_app.logger.info(f"Novo usuário criado com sucesso: ID {user.id}, Email {user.email}")
            except ValueError as create_val_err: # Captura especificamente erro de validação do create_user
                 current_app.logger.error(f"Erro de validação ao tentar criar usuário: {create_val_err}")
                 current_app.logger.info("<<< Rota /user/create (OAuth) FALHA: Erro de validação na criação.")
                 return jsonify({"error": f"Invalid user data for creation: {str(create_val_err)}"}), 400
            except Exception as create_err: # Captura outros erros de create_user
                 current_app.logger.error(f"Erro inesperado ao tentar criar usuário: {create_err}")
                 current_app.logger.error(traceback.format_exc())
                 current_app.logger.info("<<< Rota /user/create (OAuth) FALHA: Erro interno na criação.")
                 return jsonify({"error": "Failed to create user due to an internal server error."}), 500


        # --- Passo 3: Geração de Token e Resposta ---
        current_app.logger.debug(f"Passo 3: Preparando para gerar token para o usuário ID: {user.id if user else 'N/A'}")
        if user:
            try:
                token = generate_token(user.id)
                current_app.logger.info(f"Token gerado com sucesso para usuário ID {user.id}.")
                # --- LOG ANTES DE RETORNAR SUCESSO ---
                current_app.logger.info(f"<<< Rota /user/create (OAuth) SUCESSO: Retornando dados e token para usuário ID {user.id}")
                # --- FIM LOG ---
                return jsonify({
                    "data": user.serialize(),
                    "token": token,
                    "message": "User logged in/created successfully via OAuth."
                }), 200
            except Exception as token_err:
                current_app.logger.error(f"Erro ao gerar token para usuário ID {user.id}: {token_err}")
                current_app.logger.error(traceback.format_exc())
                current_app.logger.info("<<< Rota /user/create (OAuth) FALHA: Erro na geração do token.")
                return jsonify({"error": "Failed to generate session token after processing user."}), 500
        else:
            # Este log não deveria ser alcançado se a lógica estiver correta
            current_app.logger.error("Erro crítico: 'user' não definido no final do fluxo try.")
            current_app.logger.info("<<< Rota /user/create (OAuth) FALHA: Erro interno, usuário não processado.")
            return jsonify({"error": "Failed to process user data."}), 500

    # Estes excepts externos capturam erros antes da lógica principal ou falhas não pegas
    except ValueError as e:
        current_app.logger.error(f"Erro de validação PÓS-BUSCA/CRIAÇÃO durante create/login OAuth: {str(e)}")
        current_app.logger.info("<<< Rota /user/create (OAuth) FALHA: Erro de validação.")
        return jsonify({"error": f"Invalid user data: {str(e)}"}), 400
    except Exception as e:
        current_app.logger.error(f"Erro inesperado GERAL durante create/login OAuth: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        current_app.logger.info("<<< Rota /user/create (OAuth) FALHA: Erro interno geral.")
        return jsonify({"error": "Failed to process OAuth login/creation due to an internal server error."}), 500

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

# Admin management routes
@blueprint.route('/admin/all', methods=['GET'])
@admin_required
def get_admins(current_user_id):
    """Recupera todos os usuários administradores. Requer que o usuário logado seja admin."""
    current_app.logger.info(f"Recebida requisição GET em /user/admin/all do usuário ID: {current_user_id}")
    
    try:
        admins = get_all_admins()
        admins_data = [admin.serialize() for admin in admins]
        
        current_app.logger.info(f"Lista de administradores recuperada com sucesso. Total: {len(admins_data)}")
        return jsonify({
            "data": admins_data,
            "message": "Administrators retrieved successfully."
        }), 200
    except Exception as e:
        current_app.logger.error(f"Erro inesperado ao buscar administradores: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to retrieve administrators due to an internal server error."}), 500

@blueprint.route('/admin/promote/<int:user_id>', methods=['POST'])
@admin_required
def promote_user_to_admin(current_user_id, user_id):
    """Promove um usuário para administrador. Requer que o usuário logado seja admin."""
    current_app.logger.info(f"Recebida requisição POST em /user/admin/promote/{user_id} do usuário ID: {current_user_id}")
    
    try:
        user = promote_to_admin(user_id)
        if not user:
            current_app.logger.warning(f"Tentativa de promover usuário inexistente: ID {user_id}")
            return jsonify({"error": "User not found"}), 404
        
        current_app.logger.info(f"Usuário ID {user_id} promovido para administrador com sucesso.")
        return jsonify({
            "data": user.serialize(),
            "message": "User promoted to administrator successfully."
        }), 200
    except Exception as e:
        current_app.logger.error(f"Erro inesperado ao promover usuário ID {user_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to promote user due to an internal server error."}), 500

@blueprint.route('/admin/demote/<int:user_id>', methods=['POST'])
@admin_required
def demote_user_from_admin(current_user_id, user_id):
    """Remove privilégios de administrador de um usuário. Requer que o usuário logado seja admin."""
    current_app.logger.info(f"Recebida requisição POST em /user/admin/demote/{user_id} do usuário ID: {current_user_id}")
    
    # Impede que o usuário remova seus próprios privilégios
    if current_user_id == user_id:
        current_app.logger.warning(f"Usuário ID {current_user_id} tentou remover seus próprios privilégios de admin.")
        return jsonify({"error": "Cannot demote yourself from admin."}), 400
    
    try:
        user = demote_from_admin(user_id)
        if not user:
            current_app.logger.warning(f"Tentativa de rebaixar usuário inexistente: ID {user_id}")
            return jsonify({"error": "User not found"}), 404
        
        current_app.logger.info(f"Usuário ID {user_id} rebaixado de administrador com sucesso.")
        return jsonify({
            "data": user.serialize(),
            "message": "User demoted from administrator successfully."
        }), 200
    except Exception as e:
        current_app.logger.error(f"Erro inesperado ao rebaixar usuário ID {user_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to demote user due to an internal server error."}), 500

@blueprint.route('/admin/check/<int:user_id>', methods=['GET'])
@admin_required
def check_admin_status(current_user_id, user_id):
    """Verifica se um usuário é administrador. Requer que o usuário logado seja admin."""
    current_app.logger.info(f"Recebida requisição GET em /user/admin/check/{user_id} do usuário ID: {current_user_id}")
    
    try:
        admin_status = is_admin(user_id)
        current_app.logger.info(f"Status de admin verificado para usuário ID {user_id}: {admin_status}")
        return jsonify({
            "user_id": user_id,
            "is_admin": admin_status,
            "message": "Admin status checked successfully."
        }), 200
    except Exception as e:
        current_app.logger.error(f"Erro inesperado ao verificar status de admin para usuário ID {user_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to check admin status due to an internal server error."}), 500

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