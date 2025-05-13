from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional
from flask import current_app
import re
from api.scraping.type.model import ContactType
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

class Scraping(db.Model):
    __tablename__ = "scrapings"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(40), nullable=False)
    last_name = db.Column(db.String(40), nullable=False)
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

ALLOWED_EMAIL_PROVIDERS = {
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
    'aol.com',
    'mail.com',
    'zoho.com',
    'protonmail.com',
    'gmx.com'
}

def validate_email_provider(email: str) -> tuple[bool, str]:
    """
    Validates if the email provider is in the allowed list
    Args:
        email: The email address to validate
    Returns:
        tuple: (is_valid, error_message)
    """
    try:
        # Extract domain from email
        domain = email.split('@')[1].lower()
        if domain not in ALLOWED_EMAIL_PROVIDERS:
            return False, f"Email provider '{domain}' is not allowed. Please use one of: {', '.join(ALLOWED_EMAIL_PROVIDERS)}"
        return True, ""
    except IndexError:
        return False, "Invalid email format"

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
        # Add email provider validation
        is_valid, error_message = validate_email_provider(contact_value)
        if not is_valid:
            raise ValueError(error_message)
        return email_type.id
    else:
        raise ValueError("Contact value format not recognized as either phone or email")

def create_scraping(scraping_data: Dict) -> Optional[Scraping]:
    """Creates a new scraping entry."""
    current_app.logger.info("Starting scraping entry creation")

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
            accessed_at=scraping_data.get("accessed_at")  # Will be None by default
        )

        db.session.add(new_scraping)
        db.session.commit()

        current_app.logger.info(f"Scraping entry created successfully for: {new_scraping.first_name} with contact type ID: {scraping_data['contact_type_id']}")
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