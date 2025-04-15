from flask import Blueprint, request, jsonify, current_app
from api.payment_status.model import (
    PaymentStatus,
    create as create_payment_status,
    get_by_id as get_payment_status_by_id,
    get_by_name as get_payment_status_by_name,
    get_all as get_all_payment_statuses,
    update as update_payment_status,
    delete as delete_payment_status
)
from api.utils.jwt.decorators import token_required
import traceback

payment_status = Blueprint('payment_status', __name__)

@payment_status.route("", methods=["POST"])
@token_required
def handle_create_payment_status(current_user_id):
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({"error": "Missing required field: name"}), 400

    try:
        new_status = create_payment_status(data)
        return jsonify({
            "message": "Payment status created successfully.",
            "data": new_status.serialize()
        }), 201
    except ValueError as ve:
        current_app.logger.warning(f"Payment status creation validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"Failed to create payment status: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to create payment status due to an internal error."}), 500

@payment_status.route("/<int:status_id>", methods=["GET"])
@token_required
def handle_get_payment_status(current_user_id, status_id):
    status = get_payment_status_by_id(status_id)
    if not status:
        return jsonify({"error": "Payment status not found"}), 404
    return jsonify({"data": status.serialize()}), 200

@payment_status.route("/name/<string:name>", methods=["GET"])
@token_required
def handle_get_payment_status_by_name(current_user_id, name):
    status = get_payment_status_by_name(name)
    if not status:
        return jsonify({"error": f"Payment status with name '{name}' not found"}), 404
    return jsonify({"data": status.serialize()}), 200

@payment_status.route("", methods=["GET"])
@token_required
def handle_get_all_payment_statuses(current_user_id):
    try:
        statuses = get_all_payment_statuses()
        return jsonify({"data": [s.serialize() for s in statuses]}), 200
    except Exception as e:
        current_app.logger.error(f"Failed to retrieve payment statuses: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to retrieve payment statuses due to an internal error."}), 500

@payment_status.route("/<int:status_id>", methods=["PUT"])
@token_required
def handle_update_payment_status(current_user_id, status_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    try:
        updated_status = update_payment_status(status_id, data)
        if not updated_status:
            return jsonify({"error": "Payment status not found"}), 404
        return jsonify({
            "message": "Payment status updated successfully.",
            "data": updated_status.serialize()
        }), 200
    except ValueError as ve:
        current_app.logger.warning(f"Payment status update validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"Failed to update payment status {status_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to update payment status due to an internal error."}), 500

@payment_status.route("/<int:status_id>", methods=["DELETE"])
@token_required
def handle_delete_payment_status(current_user_id, status_id):
    try:
        deleted = delete_payment_status(status_id)
        if not deleted:
            return jsonify({"error": "Payment status not found"}), 404
        return jsonify({"message": "Payment status deleted successfully."}), 200
    except ValueError as ve:
         # Handles case where status is in use
         current_app.logger.warning(f"Payment status deletion error: {str(ve)}")
         return jsonify({"error": str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"Failed to delete payment status {status_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to delete payment status due to an internal error."}), 500 