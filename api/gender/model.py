from ..connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional
from flask import current_app

class Gender(db.Model):
    __tablename__ = "genders"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False)
    long_name = db.Column(db.String(50), nullable=False)
    categories = db.relationship('Category', backref='gender', lazy=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def __repr__(self):
        return f"<Gender {self.id}, Name: {self.name}>"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "long_name": self.long_name,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "categories": [category.serialize() for category in self.categories]
        }

def create_gender(gender_data: Dict) -> Optional[Gender]:
    """Creates a new gender"""
    current_app.logger.info("Starting gender creation")
    try:
        new_gender = Gender(
            name=gender_data["name"],
            long_name=gender_data["long_name"]
        )
        db.session.add(new_gender)
        db.session.commit()
        
        current_app.logger.info(f"Gender created successfully: {new_gender.name}")
        return new_gender
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating gender: {str(e)}")
        raise

def get_gender(gender_id: int) -> Optional[Gender]:
    """Retrieves a gender by ID"""
    return Gender.query.get(gender_id)

def update_gender(gender_id: int, gender_data: Dict) -> Optional[Gender]:
    """Updates an existing gender"""
    gender = get_gender(gender_id)
    if gender:
        if "name" in gender_data:
            gender.name = gender_data["name"]
        if "long_name" in gender_data:
            gender.long_name = gender_data["long_name"]
        db.session.commit()
        return gender
    return None

def delete_gender(gender_id: int) -> Optional[Gender]:
    """Deletes a gender"""
    gender = get_gender(gender_id)
    if gender:
        db.session.delete(gender)
        db.session.commit()
        return gender
    return None
