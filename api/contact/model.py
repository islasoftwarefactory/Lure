from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional
from flask import current_app
from api.utils.validators import validate_contact_data, validate_email_complete

class Contact(db.Model):
    __tablename__ = "contacts"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(256), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def __repr__(self):
        return f"<Contact {self.id}>"

    def serialize(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "message": self.message,
            "created_at": self.created_at
        }

def create_contact(contact_data: Dict) -> Optional[Contact]:
    """Creates a new contact message with validation"""
    current_app.logger.info("Starting contact creation")
    
    try:
        # Validate contact data using shared validator
        is_valid, error_message = validate_contact_data(contact_data)
        if not is_valid:
            current_app.logger.error(f"Validation error: {error_message}")
            raise ValueError(error_message)
        
        # Additional email validation (double-check)
        is_valid_email, email_error = validate_email_complete(contact_data["email"])
        if not is_valid_email:
            current_app.logger.error(f"Email validation error: {email_error}")
            raise ValueError(email_error)
        
        # Create contact with cleaned data
        contact = Contact(
            full_name=contact_data["full_name"].strip(),
            email=contact_data["email"].strip().lower(),  # Normalize email to lowercase
            message=contact_data["message"].strip()
        )
        
        db.session.add(contact)
        db.session.commit()
        current_app.logger.info(f"Contact created successfully from: {contact.email}")
        return contact
        
    except ValueError as ve:
        # Don't rollback for validation errors
        current_app.logger.error(f"Validation error: {str(ve)}")
        raise
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating contact: {str(e)}")
        raise

def get_contact(contact_id: int) -> Optional[Contact]:
    """Retrieves a contact by ID"""
    return Contact.query.get(contact_id)

def get_all_contacts() -> list[Contact]:
    """Retrieves all contacts"""
    return Contact.query.all() 