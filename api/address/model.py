from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional
from api.purchases.purchase.model import Purchase

class Address(db.Model):
    __tablename__ = "addresses"

    id = db.Column(db.Integer, primary_key=True)
    # Purchases that use this address for shipping
    purchases = db.relationship('Purchase', back_populates='shipping_address_rel', lazy='dynamic')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    street = db.Column(db.String(30), nullable=False)
    number = db.Column(db.Integer, nullable=False)
    city = db.Column(db.String(30), nullable=False) 
    state = db.Column(db.String(2), nullable=False) 
    zip_code = db.Column(db.String(9), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))

    # Manter apenas os relacionamentos necessários
    user_rel = db.relationship('User', back_populates='addresses')
    shipping_statuses = db.relationship('ShippingStatus', back_populates='address', lazy='dynamic')
    
    def __repr__(self):
        return f"<Address {self.id}, User_id: {self.user_id}, Street: {self.street}>"

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "street": self.street,
            "number": self.number,
            "city": self.city,
            "state": self.state,
            "zip_code": self.zip_code,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

def create_address(address_data: Dict, current_user_id: int) -> Optional[Address]:
    """Creates a new address"""
    print(f"Starting address creation for user: {current_user_id}")
    try:
        required_fields = ["street", "number", "city", "state", "zip_code"]
        if not all(field in address_data for field in required_fields):
            raise ValueError("Missing required fields in address_data")

        new_address = Address(
            user_id=current_user_id,
            street=address_data["street"],
            number=address_data["number"],
            city=address_data["city"],
            state=address_data["state"],
            zip_code=address_data["zip_code"],
        )
        db.session.add(new_address)
        db.session.commit()

        print(f"Address created successfully with ID: {new_address.id} for user: {new_address.user_id}")
        return new_address
    except Exception as e:
        db.session.rollback()
        print(f"Error creating address: {str(e)}")
        raise

def get_address(address_id: int) -> Optional[Address]:
    """Retrieves an address by ID"""
    return Address.query.get(address_id)

def update_address(address_id: int, address_data: Dict) -> Optional[Address]:
    """Updates an existing address"""
    address = get_address(address_id)
    if address:
        for field in ["street", "number", "city", "state", "zip_code"]:
            if field in address_data:
                setattr(address, field, address_data[field])
        db.session.commit()
        return address
    return None

def delete_address(address_id: int) -> Optional[Address]:
    """Deletes an address"""
    address = get_address(address_id)
    if address:
        # Modificar esta validação para verificar apenas shipping_statuses
        if address.shipping_statuses.count() > 0:
            raise ValueError("Cannot delete address that is currently linked to shipping statuses.")
        db.session.delete(address)
        db.session.commit()
        return address
    return None