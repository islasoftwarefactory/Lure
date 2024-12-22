from ..connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional

class Address(db.Model):
    __tablename__ = "addresses"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    observation = db.Column(db.String(50), nullable=True)
    street = db.Column(db.String(30), nullable=False)
    number = db.Column(db.Integer, nullable=False)
    city = db.Column(db.String(30), nullable=False) 
    state = db.Column(db.String(2), nullable=False) 
    zip_code = db.Column(db.String(9), nullable=False)
    neighborhood = db.Column(db.String(30), nullable=False)
    complement = db.Column(db.String(40), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def __repr__(self):
        return f"<Address {self.id}, User_id: {self.user_id}, Street: {self.street}>"

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "observation": self.observation,
            "street": self.street,
            "number": self.number,
            "city": self.city,
            "state": self.state,
            "zip_code": self.zip_code,
            "neighborhood": self.neighborhood,
            "complement": self.complement,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

def create_address(address_data: Dict) -> Optional[Address]:
    """Creates a new address"""
    current_app.logger.info("Starting address creation")
    try:
        new_address = Address(
            user_id=address_data["user_id"],
            observation=address_data.get("observation"),
            street=address_data["street"],
            number=address_data["number"],
            city=address_data["city"],
            state=address_data["state"],
            zip_code=address_data["zip_code"],
            neighborhood=address_data["neighborhood"],
            complement=address_data.get("complement")
        )
        db.session.add(new_address)
        db.session.commit()
        
        current_app.logger.info(f"Address created successfully for user: {new_address.user_id}")
        return new_address
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating address: {str(e)}")
        raise

def get_address(address_id: int) -> Optional[Address]:
    """Retrieves an address by ID"""
    return Address.query.get(address_id)

def update_address(address_id: int, address_data: Dict) -> Optional[Address]:
    """Updates an existing address"""
    address = get_address(address_id)
    if address:
        for field in ["observation", "street", "number", "city", "state", 
                     "zip_code", "neighborhood", "complement"]:
            if field in address_data:
                setattr(address, field, address_data[field])
        db.session.commit()
        return address
    return None

def delete_address(address_id: int) -> Optional[Address]:
    """Deletes an address"""
    address = get_address(address_id)
    if address:
        db.session.delete(address)
        db.session.commit()
        return address
    return None