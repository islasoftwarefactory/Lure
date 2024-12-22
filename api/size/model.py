from ..connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional

class Size(db.Model):
    __tablename__ = "sizes"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False)
    long_name = db.Column(db.String(35), nullable=True)
    categories = db.relationship('Product', backref='size', lazy=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def __repr__(self):
        return f"<Size {self.id}, Name: {self.name}>"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "long_name": self.long_name,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

def create_size(size_data: Dict) -> Optional[Size]:
    """Creates a new size"""
    current_app.logger.info("Starting size creation")
    try:
        size = Size(
            name=size_data["name"],
            long_name=size_data["long_name"]
        )
        db.session.add(size)
        db.session.commit()
        current_app.logger.info(f"Size created successfully: {size.name}")
        return size
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating size: {str(e)}")
        raise

def get_size(size_id: int) -> Optional[Size]:
    """Retrieves a size by ID"""
    return Size.query.get(size_id)

def update_size(size_id: int, size_data: Dict) -> Optional[Size]:
    """Updates an existing size"""
    size = get_size(size_id)
    if size:
        for key, value in size_data.items():
            setattr(size, key, value)
        db.session.commit()
        return size
    return None

def delete_size(size_id: int) -> Optional[Size]:
    """Deletes a size"""
    size = get_size(size_id)
    if size:
        db.session.delete(size)
        db.session.commit()
        return size
    return None