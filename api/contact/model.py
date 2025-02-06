from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional
from flask import current_app

class Contact(db.Model):
    __tablename__ = "contacts"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(256), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def __repr__(self):
        return f"<Contact {self.id}>"

    def serialize(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "phone": self.phone,
            "email": self.email,
            "message": self.message,
            "created_at": self.created_at
        }

def create_contact(contact_data: Dict) -> Optional[Contact]:
    """Creates a new contact message"""
    current_app.logger.info("Starting contact creation")
    try:
        contact = Contact(
            full_name=contact_data["full_name"],
            phone=contact_data.get("phone"),  # opcional
            email=contact_data["email"],
            message=contact_data["message"]
        )
        db.session.add(contact)
        db.session.commit()
        current_app.logger.info(f"Contact created successfully from: {contact.email}")
        return contact
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