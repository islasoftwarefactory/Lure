import os
import stripe
from flask import Blueprint, request, jsonify, current_app
from api.utils.db.connection import db
from api.transaction.payment.model import Transaction
from api.payment_status.model import PaymentStatus
import json

# Configure Stripe API key
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Blueprint for Stripe webhooks
tmp = Blueprint
stripe_webhook_bp = Blueprint("stripe_webhook", __name__)

@stripe_webhook_bp.route("/create", methods=["POST"])
def handle_stripe_webhook():
    payload = request.get_data()
    sig_header = request.headers.get("Stripe-Signature")
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    # Em desenvolvimento, pule a verificação de assinatura
    if os.getenv("FLASK_ENV") == "development":
        event = json.loads(payload)
    else:
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except ValueError as e:
            current_app.logger.error(f"Invalid payload: {e}")
            return jsonify({"error": "Invalid payload"}), 400
        except stripe.error.SignatureVerificationError as e:
            current_app.logger.error(f"Invalid signature: {e}")
            return jsonify({"error": "Invalid signature"}), 400

    event_type = event["type"]
    data = event["data"]["object"]
    current_app.logger.info(f"Received Stripe event: {event_type}")

    # Handle PaymentIntent events
    if event_type == "payment_intent.succeeded":
        pi_id = data.get("id")
        transaction = Transaction.get_by_gateway_id(pi_id)
        if transaction:
            status = PaymentStatus.get_by_name("Paid")
            if status:
                transaction.payment_status_id = status.id
                db.session.commit()
                current_app.logger.info(f"Transaction {transaction.id} marked succeeded.")
    elif event_type == "payment_intent.payment_failed":
        pi_id = data.get("id")
        transaction = Transaction.get_by_gateway_id(pi_id)
        if transaction:
            status = PaymentStatus.get_by_name("failed")
            if status:
                transaction.payment_status_id = status.id
                db.session.commit()
                current_app.logger.info(f"Transaction {transaction.id} marked failed.")
    else:
        current_app.logger.info(f"Ignoring event type: {event_type}")

    return jsonify({"received": True}), 200 