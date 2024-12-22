from ..connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional

class ImageCategory(db.Model):
    __tablename__ = "image_categories"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(40), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def __repr__(self):
        return f"<ImageCategory {self.id}, Name: {self.name}>"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "url": self.url,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

def create_image_category(image_category_data: Dict) -> Optional[ImageCategory]:
    """Creates a new image category"""
    current_app.logger.info("Starting image category creation")
    try:
        new_image_category = ImageCategory(
            name=image_category_data["name"],
            url=image_category_data["url"]
        )
        db.session.add(new_image_category)
        db.session.commit()
        
        current_app.logger.info(f"Image category created successfully: {new_image_category.name}")
        return new_image_category
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating image category: {str(e)}")
        raise

def get_image_category(image_category_id: int) -> Optional[ImageCategory]:
    """Retrieves an image category by ID"""
    return ImageCategory.query.get(image_category_id)

def update_image_category(image_category_id: int, image_category_data: Dict) -> Optional[ImageCategory]:
    """Updates an existing image category"""
    image_category = get_image_category(image_category_id)
    if image_category:
        if "name" in image_category_data:
            image_category.name = image_category_data["name"]
        if "url" in image_category_data:
            image_category.url = image_category_data["url"]
        db.session.commit()
        return image_category
    return None

def delete_image_category(image_category_id: int) -> Optional[ImageCategory]:
    """Deletes an image category"""
    image_category = get_image_category(image_category_id)
    if image_category:
        db.session.delete(image_category)
        db.session.commit()
        return image_category
    return None