from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional
from flask import current_app

class PurchaseItem(db.Model):
    __tablename__ = "purchase_items"

    id = db.Column(db.Integer, primary_key=True)
    purchase_id = db.Column(db.String(36), db.ForeignKey('purchases.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    size_id = db.Column(db.Integer, db.ForeignKey('sizes.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price_at_purchase = db.Column(db.Numeric(10, 2), nullable=False) # Price per item at time of purchase
    total_price = db.Column(db.Numeric(10, 2), nullable=False) # quantity * unit_price
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))

    # Relacionamentos
    purchase_rel = db.relationship('Purchase', back_populates='items')
    # Using string names to avoid potential circular imports if Product/Size link back
    product_rel = db.relationship('Product', backref='purchase_items')
    size_rel = db.relationship('Size', backref='purchase_items')

    def __repr__(self):
        return f"<PurchaseItem {self.id} for Purchase {self.purchase_id} (Product {self.product_id})>"

    def calculate_total(self):
        """Calculates the total price for this item line"""
        if self.quantity is not None and self.unit_price_at_purchase is not None:
             self.total_price = self.quantity * self.unit_price_at_purchase
        else:
             self.total_price = 0.0 # Or handle error

    def serialize(self) -> Dict:
        return {
            "id": self.id,
            "purchase_id": self.purchase_id,
            "product_id": self.product_id,
            "size_id": self.size_id,
            "quantity": self.quantity,
            "unit_price_at_purchase": float(self.unit_price_at_purchase),
            "total_price": float(self.total_price)
        }

    @classmethod
    def create(cls, data: Dict) -> 'PurchaseItem':
        """Creates a new purchase item"""
        current_app.logger.info(f"Creating item for purchase {data.get('purchase_id')}, product {data.get('product_id')}")
        try:
            item = cls(
                purchase_id=data["purchase_id"],
                product_id=data["product_id"],
                size_id=data["size_id"],
                quantity=data["quantity"],
                unit_price_at_purchase=data["unit_price_at_purchase"] # Should be fetched from Product at time of creation
            )
            item.calculate_total() # Calculate total price
            # Add validation if needed
            db.session.add(item)
            # Commit might happen when the whole purchase is finalized
            # db.session.commit()
            current_app.logger.info(f"PurchaseItem {item.id} created.")
            return item
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error creating purchase item: {str(e)}")
            raise

    @classmethod
    def get_by_id(cls, item_id: int) -> Optional['PurchaseItem']:
        """Retrieves a purchase item by ID"""
        return cls.query.get(item_id)

    @classmethod
    def update(cls, item_id: int, data: Dict) -> Optional['PurchaseItem']:
        """Updates an existing purchase item (e.g., quantity)."""
        item = cls.get_by_id(item_id)
        if not item:
            current_app.logger.warning(f"PurchaseItem ID {item_id} not found for update.")
            return None

        # Optional: Add checks here to prevent updates after purchase is completed/shipped
        # purchase = Purchase.get_by_id(item.purchase_id)
        # if purchase and purchase.status not in ['draft', 'awaiting_payment']: # Example check
        #     raise ValueError("Cannot update item in a finalized purchase.")

        current_app.logger.info(f"Updating PurchaseItem ID {item_id}")
        updated = False
        try:
            if "quantity" in data:
                new_quantity = int(data["quantity"])
                if new_quantity < 0: # Basic validation
                     raise ValueError("Quantity cannot be negative.")
                if item.quantity != new_quantity:
                     item.quantity = new_quantity
                     updated = True

            # Add other updatable fields if needed, e.g., size_id before finalization
            # if "size_id" in data: ...

            if updated:
                 item.calculate_total() # Recalculate total price
                 # Important: Need to recalculate Purchase totals as well, maybe via a signal or service layer
                 db.session.commit()
                 current_app.logger.info(f"PurchaseItem ID {item_id} updated successfully.")
            else:
                 current_app.logger.info(f"No changes detected for PurchaseItem ID {item_id}.")

            return item
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error updating PurchaseItem ID {item_id}: {str(e)}")
            raise

    @classmethod
    def delete(cls, item_id: int) -> bool:
        """Deletes a purchase item."""
        item = cls.get_by_id(item_id)
        if not item:
            current_app.logger.warning(f"PurchaseItem ID {item_id} not found for deletion.")
            return False

        # Optional: Add checks here to prevent deletion after purchase is completed/shipped
        # purchase = Purchase.get_by_id(item.purchase_id)
        # if purchase and purchase.status not in ['draft', 'awaiting_payment']: # Example check
        #     raise ValueError("Cannot delete item from a finalized purchase.")

        current_app.logger.info(f"Deleting PurchaseItem ID {item_id}")
        try:
            # Important: Need to recalculate Purchase totals as well, maybe via a signal or service layer
            db.session.delete(item)
            db.session.commit()
            current_app.logger.info(f"PurchaseItem ID {item_id} deleted successfully.")
            return True
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error deleting PurchaseItem ID {item_id}: {str(e)}")
            raise 