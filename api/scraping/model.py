from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional
from flask import current_app
import re
from api.scraping.type.model import ContactType
from flask_bcrypt import Bcrypt
from api.utils.validators import validate_email_provider, validate_email_complete

bcrypt = Bcrypt()

class Scraping(db.Model):
    __tablename__ = "scrapings"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(40), nullable=False)
    last_name = db.Column(db.String(40), nullable=True)
    contact_value = db.Column(db.String(256), unique=True, nullable=False)
    contact_type_id = db.Column(db.Integer, db.ForeignKey('contact_types.id'), nullable=False)
    password = db.Column(db.String(256), nullable=True)
    accessed_at = db.Column(db.DateTime, nullable=True)  # New column replacing status
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def __repr__(self):
        return f"<Scraping {self.id}>"

    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "contact_value": self.contact_value,
            "contact_type_id": self.contact_type_id,
            "password": self.password,
            "accessed_at": self.accessed_at,  # Updated to use new column
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

def validate_scraping_data(data: Dict) -> tuple[bool, str]:
    """Validates scraping data"""
    required_fields = ["first_name", "last_name", "contact_value", "contact_type_id"]

    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"

    # Add validation to check if contact_type_id is a valid integer
    if not isinstance(data.get("contact_type_id"), int):
        return False, "contact_type_id must be an integer"

    return True, ""

def validate_contact_type(contact_value: str) -> int:
    """
    Validates and determines the appropriate contact type ID based on the contact value format.
    """
    phone_type = ContactType.query.filter(
        db.func.lower(ContactType.name) == 'phone'
    ).first()
    email_type = ContactType.query.filter(
        db.func.lower(ContactType.name) == 'email'
    ).first()
    
    if not phone_type or not email_type:
        raise ValueError("Required contact types (Phone/Email) not found in database")
    
    if re.match(r'^\d+$', contact_value):
        return phone_type.id
    elif '@' in contact_value:
        # Use shared email provider validation
        is_valid, error_message = validate_email_complete(contact_value)
        if not is_valid:
            raise ValueError(error_message)
        return email_type.id
    else:
        raise ValueError("Contact value format not recognized as either phone or email")

def process_full_name(full_name: str) -> tuple[str, Optional[str]]:
    """
    Processa o nome completo e retorna primeiro nome e sobrenome
    Args:
        full_name: Nome completo do usuário
    Returns:
        tuple: (primeiro_nome, sobrenome)
    """
    parts = full_name.strip().split(' ')
    first_name = parts[0]
    last_name = ' '.join(parts[1:]) if len(parts) > 1 else None
    
    return first_name, last_name

def create_scraping(scraping_data: Dict) -> Optional[Scraping]:
    """Creates a new scraping entry."""
    current_app.logger.info("Starting scraping entry creation")

    # Processar nome completo se fornecido
    if 'full_name' in scraping_data:
        first_name, last_name = process_full_name(scraping_data['full_name'])
        scraping_data['first_name'] = first_name
        scraping_data['last_name'] = last_name

    # Validar dados básicos
    is_valid, error_message = validate_scraping_data(scraping_data)
    if not is_valid:
        current_app.logger.error(f"Validation error: {error_message}")
        raise ValueError(error_message)

    try:
        new_scraping = Scraping(
            first_name=scraping_data["first_name"],
            last_name=scraping_data["last_name"],
            contact_value=scraping_data["contact_value"],
            contact_type_id=scraping_data["contact_type_id"],
            password=scraping_data.get("password"),
            accessed_at=scraping_data.get("accessed_at")
        )

        db.session.add(new_scraping)
        db.session.commit()

        current_app.logger.info(f"Scraping entry created successfully for: {new_scraping.first_name} {new_scraping.last_name or ''}")
        return new_scraping

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating scraping entry: {str(e)}")
        raise

def get_scraping(scraping_id: int) -> Optional[Scraping]:
    """Retrieves a scraping entry by ID"""
    return Scraping.query.get(scraping_id)

def update_scraping(scraping_id: int, scraping_data: Dict) -> Optional[Scraping]:
    """Updates an existing scraping entry"""
    scraping = get_scraping(scraping_id)
    if scraping:
        # Update allowed fields list to include accessed_at instead of status
        for field in ["first_name", "last_name", "contact_type_id", "contact_value", "password", "accessed_at"]:
            if field in scraping_data:
                if field == "accessed_at" and scraping_data[field]:
                    # Convert string datetime to Python datetime if needed
                    if isinstance(scraping_data[field], str):
                        try:
                            scraping_data[field] = datetime.fromisoformat(scraping_data[field].replace('Z', '+00:00'))
                        except ValueError:
                            raise ValueError("Invalid datetime format for accessed_at")
                setattr(scraping, field, scraping_data[field])
        db.session.commit()
        return scraping
    return None

def update_password(scraping_id: int, password: str) -> Optional[Scraping]:
    """Updates the password for a scraping entry with hash"""
    try:
        scraping = get_scraping(scraping_id)
        if not scraping:
            return None

        # Gerar hash da senha
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        scraping.password = password_hash

        db.session.commit()
        return scraping

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating password: {str(e)}")
        raise

def update_scraping_password(scraping_id: int, new_password: str) -> Optional[Scraping]:
    """Update password for a scraping entry"""
    scraping = get_scraping(scraping_id)
    if not scraping:
        return None
        
    scraping.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()
    return scraping

def delete_scraping(scraping_id: int) -> Optional[Scraping]:
    """Deletes a scraping entry"""
    scraping = get_scraping(scraping_id)
    if scraping:
        db.session.delete(scraping)
        db.session.commit()
        return scraping
    return None

def login_scraping(contact_value: str, password: str) -> Optional[Scraping]:
    """Authenticates a user with contact_value and password."""
    try:
        scraping = Scraping.query.filter_by(contact_value=contact_value).first()

        if not scraping:
            return None

        if not bcrypt.check_password_hash(scraping.password, password):
            return None

        scraping.accessed_at = datetime.now(pytz.timezone('America/Sao_Paulo'))
        db.session.commit()

        return scraping

    except Exception as e:
        current_app.logger.error(f"Login failed: {str(e)}")
        db.session.rollback()
        raise

def get_email_contact_type_id() -> Optional[int]:
    """
    Busca o ID do tipo de contato 'EMAIL' na tabela contact_types
    Returns:
        Optional[int]: ID do tipo EMAIL ou None se não encontrado
    """
    email_type = ContactType.query.filter(
        db.func.lower(ContactType.name).in_(['mail', 'email', 'e-mail', 'MAIL', 'EMAIL', 'E-MAIL', 'Email', 'E-mail'])
    ).first()
    
    if not email_type:
        current_app.logger.error("Contact type 'EMAIL' not found in database")
        return None
        
    return email_type.id