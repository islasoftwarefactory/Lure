from flask import Blueprint, request, jsonify, current_app
from api.purchases.history.model import PurchaseHistory
from api.purchases.purchase.model import Purchase
from api.utils.jwt.decorators import token_required
from api.utils.db.connection import db
import traceback

purchase_history_bp = Blueprint('purchase_history', __name__)

# POST is less common for history as it's usually created internally by other actions
# Included for CRUD completeness based on request.
@purchase_history_bp.route("", methods=["POST"])
@token_required
def handle_create_purchase_history(current_user_id):
    data = request.get_json()
    # Renamed from event_description; what field defines the event now?
    # Maybe add an 'event_type' or similar if needed externally.
    # For now, assume essential data is purchase_id.
    required_fields = ["purchase_id"]
    if not data or not all(field in data for field in required_fields):
         return jsonify({"error": f"Missing one or more required fields: {', '.join(required_fields)}"}), 400

    # Verify purchase exists and belongs to user
    purchase = Purchase.get_by_id(data["purchase_id"])
    if not purchase or purchase.user_id != current_user_id:
         return jsonify({"error": "Purchase not found or not authorized"}), 403

    # Automatically set created_by for user-initiated actions?
    # if 'created_by' not in data:
    #     data['created_by'] = f"user:{current_user_id}"

    try:
        new_history = PurchaseHistory.create(data)
        db.session.commit() # Commit the history entry
        return jsonify({
            "message": "Purchase history entry created successfully.",
            "data": new_history.serialize()
        }), 201
    except ValueError as ve:
        current_app.logger.warning(f"Purchase history creation validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Failed to create purchase history: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to create purchase history due to an internal error."}), 500

@purchase_history_bp.route("/<int:history_id>", methods=["GET"])
@token_required
def handle_get_purchase_history(current_user_id, history_id):
    history = PurchaseHistory.get_by_id(history_id)
    if not history:
        return jsonify({"error": "Purchase history entry not found"}), 404

    # Verify ownership via parent purchase
    purchase = Purchase.get_by_id(history.purchase_id)
    if not purchase or purchase.user_id != current_user_id:
         return jsonify({"error": "Not authorized to view this history entry"}), 403

    return jsonify({"data": history.serialize()}), 200

# GET /purchase-history/ (Read All) is less common than listing for a specific purchase
# GET /purchases/<purchase_id> with include_history=true is usually preferred.

@purchase_history_bp.route("/<int:history_id>", methods=["PUT"])
@token_required
def handle_update_purchase_history(current_user_id, history_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    history_to_update = PurchaseHistory.get_by_id(history_id)
    if not history_to_update:
         return jsonify({"error": "Purchase history entry not found"}), 404

    # Verify ownership via parent purchase
    purchase = Purchase.get_by_id(history_to_update.purchase_id)
    if not purchase or purchase.user_id != current_user_id:
         return jsonify({"error": "Not authorized to update this history entry"}), 403

    # Updating history is generally discouraged for audit trails.

    try:
        updated_history = PurchaseHistory.update(history_id, data)
        if not updated_history: # Should not happen if found above
            return jsonify({"error": "Purchase history entry not found during update"}), 404

        # No commit needed here if model handles it
        return jsonify({
            "message": "Purchase history entry updated successfully.",
            "data": updated_history.serialize()
        }), 200
    except ValueError as ve:
        current_app.logger.warning(f"Purchase history update validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        # Rollback potentially handled in model's update
        current_app.logger.error(f"Failed to update purchase history {history_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to update purchase history due to an internal error."}), 500

@purchase_history_bp.route("/<int:history_id>", methods=["DELETE"])
@token_required
def handle_delete_purchase_history(current_user_id, history_id):
    history_to_delete = PurchaseHistory.get_by_id(history_id)
    if not history_to_delete:
         return jsonify({"error": "Purchase history entry not found"}), 404

    # Verify ownership via parent purchase
    purchase = Purchase.get_by_id(history_to_delete.purchase_id)
    if not purchase or purchase.user_id != current_user_id:
         return jsonify({"error": "Not authorized to delete this history entry"}), 403

    # Deleting history is generally discouraged for audit trails.

    try:
        deleted = PurchaseHistory.delete(history_id)
        if not deleted: # Should not happen if found above
            return jsonify({"error": "Purchase history entry not found during delete"}), 404

        # No commit needed here if model handles it
        return jsonify({"message": "Purchase history entry deleted successfully."}), 200
    except ValueError as ve:
        current_app.logger.warning(f"Purchase history deletion error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        # Rollback potentially handled in model's delete
        current_app.logger.error(f"Failed to delete purchase history {history_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to delete purchase history due to an internal error."}), 500 