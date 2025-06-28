from flask import request, jsonify, Blueprint, make_response, current_app
from api.scraping.model import Scraping, create_scraping, get_scraping, update_scraping, delete_scraping, validate_email_provider, update_password, login_scraping, update_scraping_password, get_email_contact_type_id
from api.scraping.type.model import ContactType
from sqlalchemy.exc import IntegrityError
from api.utils.security.DDOS import ddos_protection
import uuid
from api.utils.security.DDOS.cookie_manager import CookieManager
from datetime import datetime
import pytz
from flask_bcrypt import Bcrypt
from api.utils.security.jwt.decorators import token_required

blueprint = Blueprint('scraping', __name__)
bcrypt = Bcrypt()

# Contact Type Routes
@blueprint.route("/contact-types", methods=["GET"])
def get_contact_types():
    """Get all active contact types"""
    contact_types = ContactType.query.filter_by(disabled=False).all()
    return jsonify({
        "data": [ct.serialize() for ct in contact_types],
        "message": "Contact types retrieved successfully."
    }), 200

def validate_contact_value_unique(contact_value: str, exclude_id: int = None) -> bool:
    """
    Validates if a contact value is unique in the database
    Args:
        contact_value: The contact value to check
        exclude_id: Optional ID to exclude from the check (useful for updates)
    """
    query = Scraping.query.filter_by(contact_value=contact_value)
    if exclude_id:
        query = query.filter(Scraping.id != exclude_id)
    return query.first() is None

# Create
@blueprint.route("/create", methods=["POST"])
def create():
    current_app.logger.info("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    current_app.logger.info("!!!      /SCRAPING/CREATE ENDPOINT HIT      !!!")
    current_app.logger.info("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    current_app.logger.info(f"Request Method: {request.method}")
    current_app.logger.info(f"Request Path: {request.path}")
    current_app.logger.info(f"Request URL: {request.url}")
    current_app.logger.info("=== INICIO DO ENDPOINT /create ===")
    
    try:
        data = request.get_json()
        current_app.logger.info(f"Dados recebidos: {data}")
        current_app.logger.info(f"Tipo dos dados: {type(data)}")
        current_app.logger.info(f"Headers da requisição: {dict(request.headers)}")
        
        if not data:
            current_app.logger.warning("Nenhum dado fornecido na requisição")
            return jsonify({"error": "No data provided"}), 400

        current_app.logger.info("=== INICIO DA VALIDAÇÃO DE EMAIL ===")
        # Se tiver um email, busca o contact_type_id automaticamente
        contact_value = data.get("contact_value", "")
        current_app.logger.info(f"Contact value extraído: {contact_value}")
        
        if "@" in contact_value:
            current_app.logger.info("Email detectado, buscando contact_type_id...")
            try:
                email_type_id = get_email_contact_type_id()
                current_app.logger.info(f"Email type ID obtido: {email_type_id}")
                
                if not email_type_id:
                    current_app.logger.error("Email contact type não configurado no sistema")
                    return jsonify({"error": "Email contact type not configured in system"}), 500
                
                data["contact_type_id"] = email_type_id
                current_app.logger.info(f"Contact type ID atribuído: {email_type_id}")
                
                current_app.logger.info("Validando provedor de email...")
                is_valid, error_message = validate_email_provider(contact_value)
                current_app.logger.info(f"Validação do email: válido={is_valid}, erro={error_message}")
                
                if not is_valid:
                    current_app.logger.warning(f"Email inválido: {error_message}")
                    return jsonify({"error": error_message}), 400
                    
            except Exception as e:
                current_app.logger.error(f"Erro durante validação de email: {str(e)}", exc_info=True)
                return jsonify({"error": f"Email validation error: {str(e)}"}), 500

        current_app.logger.info("=== LIMPEZA DE DADOS ===")
        # Remover accessed_at se enviado na criação
        if "accessed_at" in data:
            current_app.logger.info("Removendo accessed_at dos dados")
            del data["accessed_at"]  # Sempre começa como NULL

        current_app.logger.info("=== VALIDAÇÃO DE UNICIDADE ===")
        # Add unique validation
        try:
            contact_value_for_validation = data.get("contact_value", "")
            current_app.logger.info(f"Validando unicidade para: {contact_value_for_validation}")
            
            is_unique = validate_contact_value_unique(contact_value_for_validation)
            current_app.logger.info(f"Resultado da validação de unicidade: {is_unique}")
            
            if not is_unique:
                current_app.logger.warning(f"Contact value já existe: {contact_value_for_validation}")
                return jsonify({
                    "error": "Contact value already exists"
                }), 400
                
        except Exception as e:
            current_app.logger.error(f"Erro durante validação de unicidade: {str(e)}", exc_info=True)
            return jsonify({"error": f"Uniqueness validation error: {str(e)}"}), 500

        current_app.logger.info("=== VALIDAÇÃO DUPLICADA DE EMAIL (REMOVENDO) ===")
        # Email provider validation for email contacts (DUPLICADA - REMOVENDO)
        # contact_value = data.get("contact_value", "")
        # if "@" in contact_value:
        #     is_valid, error_message = validate_email_provider(contact_value)
        #     if not is_valid:
        #         return jsonify({"error": error_message}), 400

        current_app.logger.info("=== VALIDAÇÃO DE CONTACT_TYPE ===")
        # Verificar se o contact_type_id é válido
        contact_type_id = data.get("contact_type_id")
        current_app.logger.info(f"Contact type ID para validação: {contact_type_id}")
        
        if not contact_type_id:
            current_app.logger.error("contact_type_id é obrigatório")
            return jsonify({"error": "contact_type_id is required"}), 400

        try:
            current_app.logger.info(f"Buscando contact_type no banco com ID: {contact_type_id}")
            contact_type = ContactType.query.get(contact_type_id)
            current_app.logger.info(f"Contact type encontrado: {contact_type}")
            
            if not contact_type:
                current_app.logger.error(f"Contact type inválido: {contact_type_id}")
                return jsonify({"error": "Invalid contact_type_id"}), 400

            if contact_type.disabled:
                current_app.logger.warning(f"Contact type desabilitado: {contact_type_id}")
                return jsonify({"error": "contact_type_id is disabled"}), 400
                
        except Exception as e:
            current_app.logger.error(f"Erro ao buscar contact_type: {str(e)}", exc_info=True)
            return jsonify({"error": f"Contact type validation error: {str(e)}"}), 500

        current_app.logger.info("=== CRIAÇÃO DO SCRAPING ===")
        current_app.logger.info(f"Dados finais para criação: {data}")
        
        try:
            scraping = create_scraping(data)  # password já é tratado no create_scraping
            current_app.logger.info(f"Scraping criado com sucesso: {scraping}")
            current_app.logger.info(f"ID do scraping criado: {scraping.id if scraping else 'None'}")
            
            response_data = {
                "data": scraping.serialize(),
                "message": "Scraping entry created successfully with provided contact type."
            }
            current_app.logger.info(f"Dados da resposta: {response_data}")
            
            response = make_response(jsonify(response_data))
            response.status_code = 201
            
            current_app.logger.info("=== SUCESSO - RETORNANDO RESPOSTA ===")
            return response
            
        except ValueError as e:
            current_app.logger.error(f"Erro de valor durante criação: {str(e)}", exc_info=True)
            return jsonify({"error": str(e)}), 400
        except IntegrityError as e:
            current_app.logger.error(f"Erro de integridade durante criação: {str(e)}", exc_info=True)
            return jsonify({"error": "Contact value already exists"}), 400
        except Exception as e:
            current_app.logger.error(f"Erro geral durante criação: {str(e)}", exc_info=True)
            return jsonify({"error": f"Failed to create scraping entry: {str(e)}"}), 500
    
    except Exception as e:
        current_app.logger.error(f"ERRO CRÍTICO NO ENDPOINT CREATE: {str(e)}", exc_info=True)
        return jsonify({"error": f"Critical endpoint error: {str(e)}"}), 500

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
def read(id):
    scraping = get_scraping(id)
    if scraping is None:
        return jsonify({"error": "Scraping entry not found"}), 404

    return jsonify({
        "data": scraping.serialize(),
        "message": "Scraping entry retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
def read_all():
    scrapings = Scraping.query.all()
    scrapings_data = [scraping.serialize() for scraping in scrapings]

    return jsonify({
        "data": scrapings_data,
        "message": "Scraping entries retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
    data = request.get_json()

    # Validar formato de accessed_at se fornecido
    if "accessed_at" in data and data["accessed_at"]:
        try:
            datetime.fromisoformat(data["accessed_at"].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({"error": "Invalid datetime format for accessed_at"}), 400

    # Add unique validation for contact_value if it's being updated
    if "contact_value" in data:
        if not validate_contact_value_unique(data["contact_value"], exclude_id=id):
            return jsonify({
                "error": "Contact value already exists"
            }), 400

    # Verificar se o contact_type_id é válido (se estiver sendo atualizado)
    if "contact_type_id" in data:
        contact_type = ContactType.query.get(data["contact_type_id"])
        if not contact_type:
            return jsonify({"error": "Invalid contact type ID"}), 400
        if contact_type.disabled:
            return jsonify({"error": "This contact type is disabled"}), 400

    try:
        scraping = update_scraping(id, data)
        if scraping is None:
            return jsonify({"error": "Scraping entry not found"}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to update scraping entry: {str(e)}"}), 500

    return jsonify({
        "data": scraping.serialize(),
        "message": "Scraping entry updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    try:
        scraping = delete_scraping(id)
        if scraping is None:
            return jsonify({"error": "Scraping entry not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to delete scraping entry: {str(e)}"}), 500

    return jsonify({
        "message": "Scraping entry deleted successfully."
    }), 200

@blueprint.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    
    # Log dos dados recebidos
    # Adicione esta linha para ver o payload:
    current_app.logger.info(f"Login request received. Data: {data}")
    
    # Validate request payload
    if not data:
        current_app.logger.warning("Login attempt with no data in request body.")
        return jsonify({
            "error": "Request body is required",
            "details": "Please provide contact_value and password"
        }), 400
    
    # Check required fields
    if "contact_value" not in data or "password" not in data:
        current_app.logger.warning(f"Login attempt with missing fields. Provided keys: {list(data.keys())}")
        return jsonify({
            "error": "Missing required fields",
            "details": "Both contact_value and password are required",
            "required_fields": ["contact_value", "password"]
        }), 400
    
    try:
        # Supondo que login_scraping seja uma função que você definiu em outro lugar
        scraping = login_scraping(data["contact_value"], data["password"])
        
        if not scraping:
            current_app.logger.warning(f"Login failed for contact: {data.get('contact_value')}. Invalid credentials.")
            return jsonify({
                "error": "Authentication failed",
                "details": "Invalid contact value or password",
                "message": "Please check your credentials and try again"
            }), 401
            
        current_app.logger.info(f"Login successful for contact: {data.get('contact_value')}")
        return jsonify({
            "success": True,
            "message": "Login successful",
            "data": {
                # Supondo que scraping.serialize() exista
                "user": scraping.serialize(), 
                "timestamp": datetime.now().isoformat()
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Login error for contact {data.get('contact_value', 'N/A')}: {str(e)}", exc_info=True) # Adicionado exc_info=True para traceback
        return jsonify({
            "error": "Login failed",
            "message": "An unexpected error occurred during login",
            "details": str(e)
        }), 500

# Update Password
@blueprint.route("/update-password/<int:id>", methods=["PUT"])
def update_password_route(id):
    """Update password for existing scraping entry"""
    try:
        scraping = get_scraping(id)
        if not scraping:
            return jsonify({
                "error": "Scraping entry not found"
            }), 404
            
        data = request.get_json()

        # Validar payload
        if not data or "password" not in data:
            return jsonify({
                "error": "Missing required field: password"
            }), 400

        # Validar senha
        password = data["password"]
        if not password or len(password) < 6:
            return jsonify({
                "error": "Password must be at least 6 characters long"
            }), 400

        # Alterando para usar update_scraping_password em vez de update_password
        scraping = update_scraping_password(id, password)
        return jsonify({
            "message": "Password updated successfully",
            "data": {
                "id": scraping.id,
                "contact_value": scraping.contact_value
            }
        }), 200

    except Exception as e:
        return jsonify({
            "error": f"Failed to update password: {str(e)}"
        }), 500