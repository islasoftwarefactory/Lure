from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional
from flask import current_app

class Scraping(db.Model):
    __tablename__ = "scrapings"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    sms = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def __repr__(self):
        return f"<Scraping {self.id}, Name: {self.first_name} {self.last_name}>"

    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "sms": self.sms,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

def validate_scraping_data(scraping_data: Dict) -> tuple[bool, Optional[str]]:
    """
    Validates scraping data before creation/update
    Returns (is_valid: bool, error_message: Optional[str])
    """
    # Validar campos obrigatórios
    if not all(field in scraping_data for field in ["first_name", "last_name"]):
        return False, "Missing required fields (first_name, last_name)"

    # Validação de email XOR sms
    has_email = bool(scraping_data.get("email"))
    has_sms = bool(scraping_data.get("sms"))
    
    if not (has_email ^ has_sms):
        return False, "Must provide either email OR sms, not both or neither"
    
    return True, None

def create_scraping(scraping_data: Dict) -> Optional[Scraping]:
    """Creates a new scraping entry"""
    current_app.logger.info("Starting scraping entry creation")
    
    # Validar dados
    is_valid, error_message = validate_scraping_data(scraping_data)
    if not is_valid:
        current_app.logger.error(f"Validation error: {error_message}")
        raise ValueError(error_message)
    
    try:
        new_scraping = Scraping(
            first_name=scraping_data["first_name"],
            last_name=scraping_data["last_name"],
            email=scraping_data.get("email", ""),
            sms=scraping_data.get("sms", "")
        )
        db.session.add(new_scraping)
        db.session.commit()
        
        current_app.logger.info(f"Scraping entry created successfully for: {new_scraping.first_name}")
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
        for field in ["first_name", "last_name", "email", "sms"]:
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