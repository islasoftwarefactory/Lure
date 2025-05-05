from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional
from flask import current_app
import re
from api.scraping.type.model import ContactType

class Scraping(db.Model):
    __tablename__ = "scrapings"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(40), nullable=False)
    last_name = db.Column(db.String(40), nullable=False)
    contact_value = db.Column(db.String(256), unique=True, nullable=False)
    contact_type_id = db.Column(db.Integer, db.ForeignKey('contact_types.id'), nullable=False)
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
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

def validate_scraping_data(data: Dict) -> tuple[bool, str]:
    """Validates scraping data"""
    # Remove contact_type_id dos campos obrigatórios já que será determinado automaticamente
    required_fields = ["first_name", "last_name", "contact_value"]
    
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    return True, ""

def validate_contact_type(contact_value: str) -> int:
    """
    Validates and determines the appropriate contact type ID based on the contact value format.
    """
    # Buscar IDs dos tipos de contato
    phone_type = ContactType.query.filter(
        db.func.lower(ContactType.name) == 'phone'
    ).first()
    email_type = ContactType.query.filter(
        db.func.lower(ContactType.name) == 'email'
    ).first()
    
    if not phone_type or not email_type:
        raise ValueError("Required contact types (Phone/Email) not found in database")
    
    # Validar formato do contato
    if re.match(r'^\d+$', contact_value):
        return phone_type.id
    elif '@' in contact_value:  # Simplificado, pode usar regex mais complexo se necessário
        return email_type.id
    else:
        raise ValueError("Contact value format not recognized as either phone or email")

def create_scraping(scraping_data: Dict) -> Optional[Scraping]:
    """Creates a new scraping entry with automatic contact type detection"""
    current_app.logger.info("Starting scraping entry creation")
    
    # Validar dados básicos
    is_valid, error_message = validate_scraping_data(scraping_data)
    if not is_valid:
        current_app.logger.error(f"Validation error: {error_message}")
        raise ValueError(error_message)
    
    try:
        # Determinar contact_type_id baseado no formato do contact_value
        contact_value = scraping_data["contact_value"]
        try:
            contact_type_id = validate_contact_type(contact_value)
            scraping_data["contact_type_id"] = contact_type_id
        except ValueError as e:
            current_app.logger.error(f"Contact type validation error: {str(e)}")
            raise
        
        new_scraping = Scraping(
            first_name=scraping_data["first_name"],
            last_name=scraping_data["last_name"],
            contact_value=contact_value,
            contact_type_id=contact_type_id
        )
        
        db.session.add(new_scraping)
        db.session.commit()
        
        current_app.logger.info(f"Scraping entry created successfully for: {new_scraping.first_name} with contact type ID: {contact_type_id}")
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
        for field in ["first_name", "last_name", "contact_type_id", "contact_value"]:
            if field in scraping_data:
                setattr(scraping, field, scraping_data[field])
        db.session.commit()
        return scraping
    return None

def delete_scraping(scraping_id: int) -> Optional[Scraping]:
    """Deletes a scraping entry"""
    scraping = get_scraping(scraping_id)
    if scraping:
        db.session.delete(scraping)
        db.session.commit()
        return scraping
    return None