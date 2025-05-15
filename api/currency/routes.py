from flask import Blueprint, request, jsonify, current_app
from api.currency.model import Currency
from api.utils.security.jwt.decorators import token_required
import traceback

currency_bp = Blueprint('currency', __name__)

@currency_bp.route("", methods=["POST"])
@token_required
def handle_create_currency(current_user_id):
    data = request.get_json()
    if not data or not data.get('code') or not data.get('name'):
        return jsonify({"error": "Missing required fields: code and name"}), 400

    try:
        new_currency = Currency.create(data)
        return jsonify({
            "message": "Currency created successfully.",
            "data": new_currency.serialize()
        }), 201
    except ValueError as ve:
        current_app.logger.warning(f"Currency creation validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"Failed to create currency: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to create currency due to an internal error."}), 500

@currency_bp.route("/<int:currency_id>", methods=["GET"])
@token_required
def handle_get_currency(current_user_id, currency_id):
    currency = Currency.get_by_id(currency_id)
    if not currency:
        return jsonify({"error": "Currency not found"}), 404
    return jsonify({"data": currency.serialize()}), 200

@currency_bp.route("/code/<code>", methods=["GET"])
@token_required
def handle_get_currency_by_code(current_user_id, code):
    currency = Currency.get_by_code(code)
    if not currency:
        return jsonify({"error": f"Currency with code '{code}' not found"}), 404
    return jsonify({"data": currency.serialize()}), 200

@currency_bp.route("", methods=["GET"])
@token_required
def handle_get_all_currencies(current_user_id):
    try:
        active_only_str = request.args.get('active_only', 'false').lower()
        active_only = active_only_str == 'true'
        currencies = Currency.get_all(active_only=active_only)
        return jsonify({"data": [c.serialize() for c in currencies]}), 200
    except Exception as e:
        current_app.logger.error(f"Failed to retrieve currencies: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to retrieve currencies due to an internal error."}), 500

@currency_bp.route("/<int:currency_id>", methods=["PUT"])
@token_required
def handle_update_currency(current_user_id, currency_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    try:
        updated_currency = Currency.update(currency_id, data)
        if not updated_currency:
            return jsonify({"error": "Currency not found"}), 404
        return jsonify({
            "message": "Currency updated successfully.",
            "data": updated_currency.serialize()
        }), 200
    except ValueError as ve:
        current_app.logger.warning(f"Currency update validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"Failed to update currency {currency_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to update currency due to an internal error."}), 500

@currency_bp.route("/<int:currency_id>", methods=["DELETE"])
@token_required
def handle_delete_currency(current_user_id, currency_id):
    try:
        deleted = Currency.delete(currency_id)
        if not deleted:
            return jsonify({"error": "Currency not found"}), 404
        return jsonify({"message": "Currency deleted successfully."}), 200
    except ValueError as ve:
         current_app.logger.warning(f"Currency deletion error: {str(ve)}")
         return jsonify({"error": str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"Failed to delete currency {currency_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to delete currency due to an internal error."}), 500 