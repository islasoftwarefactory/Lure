from api.utils.db.connection import db  # Add this import
from datetime import datetime
import pytz
from typing import Dict, Optional

class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(35), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    currency_id = db.Column(db.Integer, db.ForeignKey('currencies.id'), nullable=False)
    size_id = db.Column(db.Integer, db.ForeignKey('sizes.id'), nullable=False)
    description = db.Column(db.String(120), nullable=False)
    image_category_id = db.Column(db.Integer, db.ForeignKey('image_categories.id'), nullable=True)
    inventory = db.Column(db.Integer, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    gender_id = db.Column(db.Integer, db.ForeignKey('genders.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))

    currency_rel = db.relationship('Currency', back_populates='products')
    favorited_by = db.relationship('Favorite', back_populates='product_rel', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Product {self.id}, Name: {self.name}, Price: {self.price} (Currency ID: {self.currency_id})>"

    def serialize(self):
        serialized_data = {
            "id": self.id,
            "name": self.name,
            "price": float(self.price),
            "currency_id": self.currency_id,
            "size_id": self.size_id,
            "description": self.description,
            "image_category_id": self.image_category_id,
            "inventory": self.inventory,
            "category_id": self.category_id,
            "gender_id": self.gender_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
        return serialized_data

def create_product(product_data: Dict) -> Optional[Product]:
    """Creates a new product"""
    current_app.logger.info("Starting product creation")
    if 'currency_id' not in product_data:
        raise ValueError("Missing required field: currency_id")
    try:
        product = Product(
            name=product_data["name"],
            price=product_data["price"],
            currency_id=product_data["currency_id"],
            size_id=product_data["size_id"],
            description=product_data["description"],
            inventory=product_data["inventory"],
            category_id=product_data["category_id"],
            gender_id=product_data["gender_id"],
            image_category_id=product_data.get("image_category_id")
        )
        db.session.add(product)
        db.session.commit()
        current_app.logger.info(f"Product created successfully: {product.name}")
        return product
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating product: {str(e)}")
        raise

def get_product(product_id: int) -> Optional[Product]:
    """Retrieves a product by ID"""
    return Product.query.get(product_id)

def update_product(product_id: int, product_data: Dict) -> Optional[Product]:
    """Updates an existing product"""
    product = get_product(product_id)
    if product:
        allowed_updates = ["name", "price", "currency_id", "size_id", "description",
                           "image_category_id", "inventory", "category_id", "gender_id"]
        updated = False
        for key, value in product_data.items():
            if key in allowed_updates:
                if getattr(product, key) != value:
                    setattr(product, key, value)
                    updated = True

        if updated:
            db.session.commit()
        return product
    return None

def delete_product(product_id: int) -> Optional[Product]:
    """Deletes a product"""
    product = get_product(product_id)
    if product:
        db.session.delete(product)
        db.session.commit()
        return product
    return None