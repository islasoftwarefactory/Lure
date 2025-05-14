from flask import request, jsonify, Blueprint, make_response
from api.scraping.model import Scraping, create_scraping, get_scraping, update_scraping, delete_scraping, validate_email_provider, update_password, login_scraping, update_scraping_password
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
@ddos_protection(max_requests=50, window=5)
def create():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Remover accessed_at se enviado na criação
    if "accessed_at" in data:
        del data["accessed_at"]  # Sempre começa como NULL

    # Add unique validation
    if not validate_contact_value_unique(data.get("contact_value")):
        return jsonify({
            "error": "Contact value already exists"
        }), 400

    # Email provider validation for email contacts
    contact_value = data.get("contact_value", "")
    if "@" in contact_value:
        is_valid, error_message = validate_email_provider(contact_value)
        if not is_valid:
            return jsonify({"error": error_message}), 400

    # Verificar se o contact_type_id é válido
    contact_type_id = data.get("contact_type_id")
    if not contact_type_id:
        return jsonify({"error": "contact_type_id is required"}), 400

    contact_type = ContactType.query.get(contact_type_id)
    if not contact_type:
        return jsonify({"error": "Invalid contact_type_id"}), 400

    if contact_type.disabled:
        return jsonify({"error": "contact_type_id is disabled"}), 400

    try:
        scraping = create_scraping(data)  # password já é tratado no create_scraping
        
        response = make_response(jsonify({
            "data": scraping.serialize(),
            "message": "Scraping entry created successfully with provided contact type."
        }))
        response.status_code = 201
        
        return response
    
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except IntegrityError:
        return jsonify({"error": "Contact value already exists"}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to create scraping entry: {str(e)}"}), 500

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
    """Authenticate user with contact_value and password"""
    data = request.get_json()
    
    # Validate request payload
    if not data:
        return jsonify({
            "error": "Request body is required",
            "details": "Please provide contact_value and password"
        }), 400
    
    # Check required fields
    if "contact_value" not in data or "password" not in data:
        return jsonify({
            "error": "Missing required fields",
            "details": "Both contact_value and password are required",
            "required_fields": ["contact_value", "password"]
        }), 400
    
    try:
        scraping = login_scraping(data["contact_value"], data["password"])
        
        if not scraping:
            return jsonify({
                "error": "Authentication failed",
                "details": "Invalid contact value or password",
                "message": "Please check your credentials and try again"
            }), 401
            
        return jsonify({
            "success": True,
            "message": "Login successful",
            "data": {
                "user": scraping.serialize(),
                "timestamp": datetime.now().isoformat()
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
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