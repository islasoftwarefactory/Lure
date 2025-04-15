from flask import Blueprint, request, jsonify, current_app
from api.purchases.product.model import (
    PurchaseItem,
    create as create_purchase_item,
    get_by_id as get_purchase_item_by_id,
    update as update_purchase_item,
    delete as delete_purchase_item
)
# Need Purchase model to verify ownership
from api.purchases.purchase.model import get_purchase_by_id
from api.utils.jwt.decorators import token_required
import traceback
import uuid

# Note: Typically item routes might be nested under purchases like /purchases/<purchase_id>/items
# This implements standalone routes for simplicity based on request.
purchase_item_blueprint = Blueprint('purchase_item', __name__, url_prefix='/purchase-items')

@purchase_item_blueprint.route("", methods=["POST"])
@token_required
def handle_create_purchase_item(current_user_id):
    data = request.get_json()
    required_fields = ["purchase_id", "product_id", "size_id", "quantity", "unit_price_at_purchase"]
    if not data or not all(field in data for field in required_fields):
        return jsonify({"error": f"Missing one or more required fields: {', '.join(required_fields)}"}), 400

    # Verify purchase exists and belongs to user
    purchase = get_purchase_by_id(data["purchase_id"])
    if not purchase or purchase.user_id != current_user_id:
         return jsonify({"error": "Purchase not found or not authorized"}), 403

    # Add logic here to prevent adding items to finalized purchases if needed

    try:
        # Price should ideally be validated against Product model here
        new_item = create_purchase_item(data)

        # Recalculate purchase totals after adding item - requires commit/flush strategy
        # purchase.calculate_totals()
        # db.session.add(purchase) # Mark purchase for update

        db.session.commit() # Commit item and potentially purchase update
        return jsonify({
            "message": "Purchase item created successfully.",
            "data": new_item.serialize()
        }), 201
    except ValueError as ve:
        current_app.logger.warning(f"Purchase item creation validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Failed to create purchase item: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to create purchase item due to an internal error."}), 500

@purchase_item_blueprint.route("/<int:item_id>", methods=["GET"])
@token_required
def handle_get_purchase_item(current_user_id, item_id):
    item = get_purchase_item_by_id(item_id)
    if not item:
        return jsonify({"error": "Purchase item not found"}), 404

    # Verify ownership via parent purchase
    purchase = get_purchase_by_id(item.purchase_id)
    if not purchase or purchase.user_id != current_user_id:
         return jsonify({"error": "Not authorized to view this item"}), 403

    return jsonify({"data": item.serialize()}), 200

# GET /purchase-items/ (Read All) is less common without filtering by purchase_id
# Consider adding a filter: /purchase-items?purchase_id=<uuid>

@purchase_item_blueprint.route("/<int:item_id>", methods=["PUT"])
@token_required
def handle_update_purchase_item(current_user_id, item_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    item_to_update = get_purchase_item_by_id(item_id)
    if not item_to_update:
         return jsonify({"error": "Purchase item not found"}), 404

    # Verify ownership via parent purchase
    purchase = get_purchase_by_id(item_to_update.purchase_id)
    if not purchase or purchase.user_id != current_user_id:
         return jsonify({"error": "Not authorized to update this item"}), 403

    # Add logic here to prevent updating items in finalized purchases if needed

    try:
        updated_item = update_purchase_item(item_id, data)
        if not updated_item: # Should not happen if found above
            return jsonify({"error": "Purchase item not found during update"}), 404

        # Recalculate purchase totals after updating item
        # purchase.calculate_totals()
        # db.session.add(purchase) # Mark purchase for update

        db.session.commit() # Commit item and potentially purchase update
        return jsonify({
            "message": "Purchase item updated successfully.",
            "data": updated_item.serialize()
        }), 200
    except ValueError as ve:
        current_app.logger.warning(f"Purchase item update validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        # Rollback potentially handled in model's update
        current_app.logger.error(f"Failed to update purchase item {item_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to update purchase item due to an internal error."}), 500

@purchase_item_blueprint.route("/<int:item_id>", methods=["DELETE"])
@token_required
def handle_delete_purchase_item(current_user_id, item_id):
    item_to_delete = get_purchase_item_by_id(item_id)
    if not item_to_delete:
         return jsonify({"error": "Purchase item not found"}), 404

    # Verify ownership via parent purchase
    purchase = get_purchase_by_id(item_to_delete.purchase_id)
    if not purchase or purchase.user_id != current_user_id:
         return jsonify({"error": "Not authorized to delete this item"}), 403

    # Add logic here to prevent deleting items from finalized purchases if needed

    try:
        deleted = delete_purchase_item(item_id)
        if not deleted: # Should not happen if found above
            return jsonify({"error": "Purchase item not found during delete"}), 404

        # Recalculate purchase totals after deleting item
        # purchase.calculate_totals()
        # db.session.add(purchase) # Mark purchase for update

        db.session.commit() # Commit deletion and potentially purchase update
        return jsonify({"message": "Purchase item deleted successfully."}), 200
    except ValueError as ve:
        current_app.logger.warning(f"Purchase item deletion error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        # Rollback potentially handled in model's delete
        current_app.logger.error(f"Failed to delete purchase item {item_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to delete purchase item due to an internal error."}), 500 