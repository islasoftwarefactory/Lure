from flask import Blueprint, request, jsonify, current_app
from api.transaction.method.model import TransactionMethod
from api.utils.jwt.decorators import token_required
import traceback

transaction_method_bp = Blueprint('transaction_method', __name__, url_prefix='/transaction-methods')

@transaction_method_bp.route("", methods=["POST"])
@token_required
def handle_create_transaction_method(current_user_id):
    data = request.get_json()
    if not data or not data.get('name') or not data.get('display_name'):
        return jsonify({"error": "Missing required fields: name and display_name"}), 400

    try:
        new_method = TransactionMethod.create(data)
        return jsonify({
            "message": "Transaction method created successfully.",
            "data": new_method.serialize()
        }), 201
    except ValueError as ve:
        current_app.logger.warning(f"Transaction method creation validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"Failed to create transaction method: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to create transaction method due to an internal error."}), 500

@transaction_method_bp.route("/<int:method_id>", methods=["GET"])
@token_required
def handle_get_transaction_method(current_user_id, method_id):
    method = TransactionMethod.get_by_id(method_id)
    if not method:
        return jsonify({"error": "Transaction method not found"}), 404
    return jsonify({"data": method.serialize()}), 200

@transaction_method_bp.route("/name/<string:name>", methods=["GET"])
@token_required
def handle_get_transaction_method_by_name(current_user_id, name):
    method = TransactionMethod.get_by_name(name)
    if not method:
        return jsonify({"error": f"Transaction method with name '{name}' not found"}), 404
    return jsonify({"data": method.serialize()}), 200

@transaction_method_bp.route("", methods=["GET"])
@token_required
def handle_get_all_transaction_methods(current_user_id):
    try:
        active_only_str = request.args.get('active_only', 'false').lower()
        active_only = active_only_str == 'true'
        methods = TransactionMethod.get_all(active_only=active_only)
        return jsonify({"data": [m.serialize() for m in methods]}), 200
    except Exception as e:
        current_app.logger.error(f"Failed to retrieve transaction methods: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to retrieve transaction methods due to an internal error."}), 500

@transaction_method_bp.route("/<int:method_id>", methods=["PUT"])
@token_required
def handle_update_transaction_method(current_user_id, method_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    try:
        updated_method = TransactionMethod.update(method_id, data)
        if not updated_method:
            return jsonify({"error": "Transaction method not found"}), 404
        return jsonify({
            "message": "Transaction method updated successfully.",
            "data": updated_method.serialize()
        }), 200
    except ValueError as ve:
        current_app.logger.warning(f"Transaction method update validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"Failed to update transaction method {method_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to update transaction method due to an internal error."}), 500

@transaction_method_bp.route("/<int:method_id>", methods=["DELETE"])
@token_required
def handle_delete_transaction_method(current_user_id, method_id):
    try:
        deleted = TransactionMethod.delete(method_id)
        if not deleted:
            return jsonify({"error": "Transaction method not found"}), 404
        return jsonify({"message": "Transaction method deleted successfully."}), 200
    except ValueError as ve:
         current_app.logger.warning(f"Transaction method deletion error: {str(ve)}")
         return jsonify({"error": str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"Failed to delete transaction method {method_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to delete transaction method due to an internal error."}), 500 