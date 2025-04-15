from flask import Blueprint, request, jsonify, current_app
# Importar a CLASSE do modelo
from api.purchases.product.model import PurchaseItem
# Importar Purchase para verificação
from api.purchases.purchase.model import Purchase # Importar APENAS a CLASSE Purchase
from api.utils.jwt.decorators import token_required
from api.utils.db.connection import db # Importar db para commit se necessário
import traceback
import uuid

# Manter o nome do blueprint como definido no alias em blueprints.py
purchase_item_bp = Blueprint('purchase_item', __name__, url_prefix='/purchase-items')

@purchase_item_bp.route("", methods=["POST"])
@token_required
def handle_create_purchase_item(current_user_id):
    data = request.get_json()
    required_fields = ["purchase_id", "product_id", "size_id", "quantity", "unit_price_at_purchase"]
    if not data or not all(field in data for field in required_fields):
        return jsonify({"error": f"Missing one or more required fields: {', '.join(required_fields)}"}), 400

    purchase = Purchase.get_by_id(data["purchase_id"])
    if not purchase or purchase.user_id != current_user_id:
         return jsonify({"error": "Purchase not found or not authorized"}), 403

    try:
        # Chamar método da classe
        new_item = PurchaseItem.create(data)

        # Recalcular totais da compra pai
        purchase.calculate_totals()
        db.session.add(purchase)

        db.session.commit() # Commit item E atualização da compra
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

@purchase_item_bp.route("/<int:item_id>", methods=["GET"])
@token_required
def handle_get_purchase_item(current_user_id, item_id):
    # Chamar método da classe
    item = PurchaseItem.get_by_id(item_id)
    if not item:
        return jsonify({"error": "Purchase item not found"}), 404

    purchase = Purchase.get_by_id(item.purchase_id)
    if not purchase or purchase.user_id != current_user_id:
         return jsonify({"error": "Not authorized to view this item"}), 403

    return jsonify({"data": item.serialize()}), 200

# GET /purchase-items/ (Read All) is less common without filtering by purchase_id
# Consider adding a filter: /purchase-items?purchase_id=<uuid>

@purchase_item_bp.route("/<int:item_id>", methods=["PUT"])
@token_required
def handle_update_purchase_item(current_user_id, item_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    item_to_update = PurchaseItem.get_by_id(item_id)
    if not item_to_update:
         return jsonify({"error": "Purchase item not found"}), 404

    purchase = Purchase.get_by_id(item_to_update.purchase_id)
    if not purchase or purchase.user_id != current_user_id:
         return jsonify({"error": "Not authorized to update this item"}), 403

    try:
        # Chamar método da classe
        updated_item = PurchaseItem.update(item_id, data)
        if not updated_item:
            return jsonify({"error": "Purchase item not found during update"}), 404

        # Recalcular totais da compra pai
        purchase.calculate_totals()
        db.session.add(purchase)

        db.session.commit() # Commit item E atualização da compra
        return jsonify({
            "message": "Purchase item updated successfully.",
            "data": updated_item.serialize()
        }), 200
    except ValueError as ve:
        current_app.logger.warning(f"Purchase item update validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Failed to update purchase item {item_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to update purchase item due to an internal error."}), 500

@purchase_item_bp.route("/<int:item_id>", methods=["DELETE"])
@token_required
def handle_delete_purchase_item(current_user_id, item_id):
    item_to_delete = PurchaseItem.get_by_id(item_id)
    if not item_to_delete:
         return jsonify({"error": "Purchase item not found"}), 404

    purchase = Purchase.get_by_id(item_to_delete.purchase_id)
    if not purchase or purchase.user_id != current_user_id:
         return jsonify({"error": "Not authorized to delete this item"}), 403

    try:
        # Chamar método da classe
        deleted = PurchaseItem.delete(item_id)
        if not deleted:
            return jsonify({"error": "Purchase item not found during delete"}), 404

        # Recalcular totais da compra pai
        purchase.calculate_totals()
        db.session.add(purchase)

        db.session.commit() # Commit deletion E atualização da compra
        return jsonify({"message": "Purchase item deleted successfully."}), 200
    except ValueError as ve:
        current_app.logger.warning(f"Purchase item deletion error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Failed to delete purchase item {item_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to delete purchase item due to an internal error."}), 500 