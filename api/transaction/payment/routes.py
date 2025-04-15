from flask import Blueprint, request, jsonify, current_app
from api.transaction.payment.model import ( # Assuming model.py is in this folder
    Transaction,
    create as create_transaction,
    get_by_id as get_transaction_by_id,
    get_by_gateway_id as get_transaction_by_gateway_id,
    get_all_for_purchase as get_all_transactions_for_purchase,
    update as update_transaction
    # No delete method typically for transactions
)
# Need Purchase model to verify ownership
from api.purchases.purchase.model import get_purchase_by_id
from api.utils.jwt.decorators import token_required
import traceback
import uuid

transaction_blueprint = Blueprint('transaction', __name__, url_prefix='/transactions')

# POST route is usually internal, triggered by payment flow/webhooks.
# Included here for completeness if manual creation is needed (e.g., admin).
@transaction_blueprint.route("", methods=["POST"])
@token_required
def handle_create_transaction(current_user_id):
    data = request.get_json()
    required_fields = ["purchase_id", "method_id", "amount", "currency_id"] # Assuming currency_id now
    if not data or not all(field in data for field in required_fields):
        return jsonify({"error": f"Missing one or more required fields: {', '.join(required_fields)}"}), 400

    # Verify purchase exists and belongs to user initiating (if applicable, might be system action)
    purchase = get_purchase_by_id(data["purchase_id"])
    if not purchase:
         return jsonify({"error": "Purchase not found"}), 404
    # Add authorization check if needed:
    # if purchase.user_id != current_user_id:
    #     return jsonify({"error": "Not authorized for this purchase"}), 403

    try:
        new_transaction = create_transaction(data)
        return jsonify({
            "message": "Transaction created successfully.",
            "data": new_transaction.serialize()
        }), 201
    except ValueError as ve:
        current_app.logger.warning(f"Transaction creation validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        # Rollback handled in model create
        current_app.logger.error(f"Failed to create transaction: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to create transaction due to an internal error."}), 500

@transaction_blueprint.route("/<int:transaction_id>", methods=["GET"])
@token_required
def handle_get_transaction(current_user_id, transaction_id):
    transaction = get_transaction_by_id(transaction_id)
    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404

    # Verify ownership via parent purchase
    purchase = get_purchase_by_id(transaction.purchase_id)
    if not purchase or purchase.user_id != current_user_id:
         return jsonify({"error": "Not authorized to view this transaction"}), 403

    return jsonify({"data": transaction.serialize()}), 200

@transaction_blueprint.route("/gateway/<string:gateway_id>", methods=["GET"])
@token_required
def handle_get_transaction_by_gateway_id(current_user_id, gateway_id):
    transaction = get_transaction_by_gateway_id(gateway_id)
    if not transaction:
        return jsonify({"error": f"Transaction with gateway ID '{gateway_id}' not found"}), 404

    # Verify ownership via parent purchase
    purchase = get_purchase_by_id(transaction.purchase_id)
    if not purchase or purchase.user_id != current_user_id:
        return jsonify({"error": "Not authorized to view this transaction"}), 403

    return jsonify({"data": transaction.serialize()}), 200

@transaction_blueprint.route("/purchase/<string:purchase_id>", methods=["GET"])
@token_required
def handle_get_all_transactions_for_purchase(current_user_id, purchase_id):
    try:
        uuid.UUID(purchase_id) # Validate UUID format
    except ValueError:
        return jsonify({"error": "Invalid purchase ID format."}), 400

    # Verify purchase exists and belongs to user
    purchase = get_purchase_by_id(purchase_id)
    if not purchase or purchase.user_id != current_user_id:
        return jsonify({"error": "Purchase not found or not authorized"}), 403

    try:
        transactions = get_all_transactions_for_purchase(purchase_id)
        return jsonify({"data": [t.serialize() for t in transactions]}), 200
    except Exception as e:
        current_app.logger.error(f"Failed to retrieve transactions for purchase {purchase_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to retrieve transactions due to an internal error."}), 500

@transaction_blueprint.route("/<int:transaction_id>", methods=["PUT"])
@token_required
def handle_update_transaction(current_user_id, transaction_id):
    # Updates are usually internal via webhooks, but providing endpoint if needed.
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    transaction_to_update = get_transaction_by_id(transaction_id)
    if not transaction_to_update:
         return jsonify({"error": "Transaction not found"}), 404

    # Verify ownership via parent purchase (maybe admin should bypass?)
    purchase = get_purchase_by_id(transaction_to_update.purchase_id)
    if not purchase or purchase.user_id != current_user_id:
         return jsonify({"error": "Not authorized to update this transaction"}), 403

    # Restrict fields that can be updated via API? (e.g., only status?)

    try:
        updated_transaction = update_transaction(transaction_id, data)
        if not updated_transaction: # Should not happen if found above
            return jsonify({"error": "Transaction not found during update"}), 404

        # Trigger other actions based on status change if needed

        return jsonify({
            "message": "Transaction updated successfully.",
            "data": updated_transaction.serialize()
        }), 200
    except ValueError as ve:
        current_app.logger.warning(f"Transaction update validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        # Rollback potentially handled in model's update
        current_app.logger.error(f"Failed to update transaction {transaction_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to update transaction due to an internal error."}), 500

# No DELETE route for transactions usually 