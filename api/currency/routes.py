from flask import Blueprint, request, jsonify, current_app
from api.currency.model import (
    Currency,
    create as create_currency,
    get_by_id as get_currency_by_id,
    get_by_code as get_currency_by_code,
    get_all as get_all_currencies,
    update as update_currency,
    delete as delete_currency
)
from api.utils.jwt.decorators import token_required
import traceback

currency_blueprint = Blueprint('currency', __name__,)

@currency_blueprint.route("", methods=["POST"])
@token_required
def handle_create_currency(current_user_id):
    data = request.get_json()
    if not data or not data.get('code') or not data.get('name'):
        return jsonify({"error": "Missing required fields: code and name"}), 400

    try:
        new_currency = create_currency(data)
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

@currency_blueprint.route("/<int:currency_id>", methods=["GET"])
@token_required
def handle_get_currency(current_user_id, currency_id):
    currency = get_currency_by_id(currency_id)
    if not currency:
        return jsonify({"error": "Currency not found"}), 404
    return jsonify({"data": currency.serialize()}), 200

@currency_blueprint.route("/code/<code>", methods=["GET"])
@token_required
def handle_get_currency_by_code(current_user_id, code):
    currency = get_currency_by_code(code)
    if not currency:
        return jsonify({"error": f"Currency with code '{code}' not found"}), 404
    return jsonify({"data": currency.serialize()}), 200

@currency_blueprint.route("", methods=["GET"])
@token_required
def handle_get_all_currencies(current_user_id):
    try:
        active_only_str = request.args.get('active_only', 'false').lower()
        active_only = active_only_str == 'true'
        currencies = get_all_currencies(active_only=active_only)
        return jsonify({"data": [c.serialize() for c in currencies]}), 200
    except Exception as e:
        current_app.logger.error(f"Failed to retrieve currencies: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to retrieve currencies due to an internal error."}), 500

@currency_blueprint.route("/<int:currency_id>", methods=["PUT"])
@token_required
def handle_update_currency(current_user_id, currency_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    try:
        updated_currency = update_currency(currency_id, data)
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

@currency_blueprint.route("/<int:currency_id>", methods=["DELETE"])
@token_required
def handle_delete_currency(current_user_id, currency_id):
    try:
        deleted = delete_currency(currency_id)
        if not deleted:
            return jsonify({"error": "Currency not found"}), 404
        return jsonify({"message": "Currency deleted successfully."}), 200
    except ValueError as ve:
         # Handles case where currency is in use
         current_app.logger.warning(f"Currency deletion error: {str(ve)}")
         return jsonify({"error": str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"Failed to delete currency {currency_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to delete currency due to an internal error."}), 500 