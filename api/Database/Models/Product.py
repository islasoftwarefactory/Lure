from ..connection import db
from datetime import datetime
import pytz

class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(35), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    size_id = db.Column(db.Integer, db.ForeignKey('sizes.id'), nullable=False)
    description = db.Column(db.String(120), nullable=False)
    images_ids = db.Column(db.JSON)
    inventory = db.Column(db.Integer, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    gender_id = db.Column(db.Integer, db.ForeignKey('genders.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=datetime.now(pytz.timezone('America/Sao_Paulo')))

    def __repr__(self):
        return f"<Product {self.id}, Name: {self.name}, Price: {self.price}>"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": float(self.price),
            "size_id": self.size_id,
            "description": self.description,
            "images_ids": self.images_ids,
            "inventory": self.inventory,
            "category_id": self.category_id,
            "gender_id": self.gender_id,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }