from flask import Blueprint, request, jsonify, current_app
from api.payment_status.model import PaymentStatus
from api.utils.security.jwt.decorators import token_required
import traceback

# Renomeado para payment_status_blueprint, nome interno 'payment_status'
payment_status_blueprint = Blueprint('payment_status', __name__)

# Decoradores atualizados para usar payment_status_blueprint
@payment_status_blueprint.route("", methods=["POST"])
@token_required
def handle_create_payment_status(current_user_id):
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({"error": "Missing required field: name"}), 400

    try:
        new_status = PaymentStatus.create(data)
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

# Decoradores atualizados para usar payment_status_blueprint
@payment_status_blueprint.route("/<int:status_id>", methods=["GET"])
@token_required
def handle_get_payment_status(current_user_id, status_id):
    status = PaymentStatus.get_by_id(status_id)
    if not status:
        return jsonify({"error": "Payment status not found"}), 404
    return jsonify({"data": status.serialize()}), 200

# Decoradores atualizados para usar payment_status_blueprint
@payment_status_blueprint.route("/name/<string:name>", methods=["GET"])
@token_required
def handle_get_payment_status_by_name(current_user_id, name):
    status = PaymentStatus.get_by_name(name)
    if not status:
        return jsonify({"error": f"Payment status with name '{name}' not found"}), 404
    return jsonify({"data": status.serialize()}), 200

# Decoradores atualizados para usar payment_status_blueprint
@payment_status_blueprint.route("", methods=["GET"])
@token_required
def handle_get_all_payment_statuses(current_user_id):
    try:
        statuses = PaymentStatus.get_all()
        return jsonify({"data": [s.serialize() for s in statuses]}), 200
    except Exception as e:
        current_app.logger.error(f"Failed to retrieve payment statuses: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to retrieve payment statuses due to an internal error."}), 500

# Decoradores atualizados para usar payment_status_blueprint
@payment_status_blueprint.route("/<int:status_id>", methods=["PUT"])
@token_required
def handle_update_payment_status(current_user_id, status_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    try:
        updated_status = PaymentStatus.update(status_id, data)
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

# Decoradores atualizados para usar payment_status_blueprint
@payment_status_blueprint.route("/<int:status_id>", methods=["DELETE"])
@token_required
def handle_delete_payment_status(current_user_id, status_id):
    try:
        deleted = PaymentStatus.delete(status_id)
        if not deleted:
            return jsonify({"error": "Payment status not found"}), 404
        return jsonify({"message": "Payment status deleted successfully."}), 200
    except ValueError as ve:
         current_app.logger.warning(f"Payment status deletion error: {str(ve)}")
         return jsonify({"error": str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"Failed to delete payment status {status_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to delete payment status due to an internal error."}), 500
