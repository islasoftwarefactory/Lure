from ..connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional

class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    gender_id = db.Column(db.Integer, db.ForeignKey('genders.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def __repr__(self):
        return f"<Category {self.id}, Name: {self.name}>"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "gender_id": self.gender_id,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

def create_category(category_data: Dict) -> Optional[Category]:
    """Creates a new category"""
    current_app.logger.info("Starting category creation")
    try:
        new_category = Category(
            name=category_data["name"],
            gender_id=category_data["gender_id"]
        )
        db.session.add(new_category)
        db.session.commit()
        
        current_app.logger.info(f"Category created successfully: {new_category.name}")
        return new_category
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating category: {str(e)}")
        raise

def get_category(category_id: int) -> Optional[Category]:
    """Retrieves a category by ID"""
    return Category.query.get(category_id)

def update_category(category_id: int, category_data: Dict) -> Optional[Category]:
    """Updates an existing category"""
    category = get_category(category_id)
    if category:
        if "name" in category_data:
            category.name = category_data["name"]
        if "gender_id" in category_data:
            category.gender_id = category_data["gender_id"]
        db.session.commit()
        return category
    return None

def delete_category(category_id: int) -> Optional[Category]:
    """Deletes a category"""
    category = get_category(category_id)
    if category:
        db.session.delete(category)
        db.session.commit()
        return category
    return None