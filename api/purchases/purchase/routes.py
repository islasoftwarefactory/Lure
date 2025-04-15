from flask import Blueprint, request, jsonify, current_app
from api.purchases.purchase.model import (
    Purchase,
    create as create_purchase,
    get_by_id as get_purchase_by_id,
    get_all_for_user as get_all_purchases_for_user,
    update as update_purchase
    # delete is commented out in model, so no route for it by default
)
# Import other related models if needed for item/history creation within purchase flow
from api.purchases.product.model import create as create_purchase_item
from api.purchases.history.model import create as create_purchase_history
from api.utils.jwt.decorators import token_required
import traceback
import uuid

purchase_blueprint = Blueprint('purchase', __name__, url_prefix='/purchases')

@purchase_blueprint.route("", methods=["POST"])
@token_required
def handle_create_purchase(current_user_id):
    data = request.get_json()
    if not data or not data.get('shipping_address_id'):
        return jsonify({"error": "Missing required field: shipping_address_id"}), 400

    data['user_id'] = current_user_id
    items_data = data.pop('items', []) # Expect items in the request body

    try:
        new_purchase = create_purchase(data)
        # Usually, items would be added here before commit
        # This is a simplified example; a service layer would handle this better
        db.session.add(new_purchase) # Add purchase first to get ID if needed
        db.session.flush() # Assign ID

        # Example: Add items - Real app might need price lookup etc.
        # for item_data in items_data:
        #     item_data['purchase_id'] = new_purchase.id
        #     # Fetch unit_price_at_purchase from Product model here
        #     # create_purchase_item(item_data)

        # new_purchase.calculate_totals() # Calculate after adding items

        # Example: Create initial history entry
        # create_purchase_history({
        #     "purchase_id": new_purchase.id,
        #     "event_description": "Purchase created.", # Or based on status
        #     "created_by": f"user:{current_user_id}"
        # })

        db.session.commit() # Commit purchase, items, history together

        return jsonify({
            "message": "Purchase created successfully.",
            "data": new_purchase.serialize(include_items=True) # Return items too
        }), 201
    except ValueError as ve:
        current_app.logger.warning(f"Purchase creation validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        db.session.rollback() # Rollback if anything failed
        current_app.logger.error(f"Failed to create purchase: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to create purchase due to an internal error."}), 500

@purchase_blueprint.route("/<string:purchase_id>", methods=["GET"])
@token_required
def handle_get_purchase(current_user_id, purchase_id):
    try:
        # Validate UUID format
        uuid.UUID(purchase_id)
    except ValueError:
        return jsonify({"error": "Invalid purchase ID format."}), 400

    purchase = get_purchase_by_id(purchase_id)

    if not purchase:
        return jsonify({"error": "Purchase not found"}), 404
    # Ensure the user requesting owns the purchase
    if purchase.user_id != current_user_id:
         return jsonify({"error": "Not authorized to view this purchase"}), 403

    # Choose which related data to include in the response
    include_items = request.args.get('include_items', 'true').lower() == 'true'
    include_history = request.args.get('include_history', 'false').lower() == 'true'
    include_transactions = request.args.get('include_transactions', 'false').lower() == 'true'

    return jsonify({"data": purchase.serialize(
        include_items=include_items,
        include_history=include_history,
        include_transactions=include_transactions
    )}), 200

@purchase_blueprint.route("", methods=["GET"])
@token_required
def handle_get_all_user_purchases(current_user_id):
    try:
        purchases = get_all_purchases_for_user(current_user_id)
        # Serialize without items by default for listing
        return jsonify({"data": [p.serialize(include_items=False) for p in purchases]}), 200
    except Exception as e:
        current_app.logger.error(f"Failed to retrieve purchases for user {current_user_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to retrieve purchases due to an internal error."}), 500

@purchase_blueprint.route("/<string:purchase_id>", methods=["PUT"])
@token_required
def handle_update_purchase(current_user_id, purchase_id):
    try:
        uuid.UUID(purchase_id)
    except ValueError:
        return jsonify({"error": "Invalid purchase ID format."}), 400

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    purchase_to_update = get_purchase_by_id(purchase_id)

    if not purchase_to_update:
         return jsonify({"error": "Purchase not found"}), 404
    if purchase_to_update.user_id != current_user_id:
         return jsonify({"error": "Not authorized to update this purchase"}), 403

    # Prevent updating certain fields after creation? Add business logic here.

    try:
        updated_purchase = update_purchase(purchase_id, data)
        if not updated_purchase: # Should not happen if found above, but safe check
            return jsonify({"error": "Purchase not found during update"}), 404

        # Add history entry for update if needed
        # create_purchase_history({...})
        # db.session.commit()

        return jsonify({
            "message": "Purchase updated successfully.",
            "data": updated_purchase.serialize()
        }), 200
    except ValueError as ve:
        current_app.logger.warning(f"Purchase update validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        # Rollback already handled in model's update if needed
        current_app.logger.error(f"Failed to update purchase {purchase_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to update purchase due to an internal error."}), 500

# No DELETE route as delete method is commented out in model 