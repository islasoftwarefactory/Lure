import os
import stripe
from flask import Blueprint, request, jsonify, current_app
from api.utils.db.connection import db
from api.transaction.payment.model import Transaction
from api.payment_status.model import PaymentStatus
import json
import logging

# Configuração da chave API da Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Blueprint para webhooks da Stripe
stripe_webhook_bp = Blueprint("stripe_webhook", __name__)

# Configuração de logging específico para webhooks
logger = logging.getLogger(__name__)

@stripe_webhook_bp.route("/create", methods=["POST"])
def handle_stripe_webhook():
    """
    Manipula eventos de webhook da Stripe com validação de segurança
    """
    payload = request.get_data()
    sig_header = request.headers.get("Stripe-Signature")
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    # Validação de configuração obrigatória
    if not endpoint_secret:
        logger.error("STRIPE_WEBHOOK_SECRET não configurado")
        return jsonify({"error": "Webhook secret não configurado"}), 500
    
    # Validação do cabeçalho de assinatura
    if not sig_header:
        logger.error("Cabeçalho Stripe-Signature ausente")
        return jsonify({"error": "Assinatura ausente"}), 400

    # Verificação de assinatura do webhook (pula em desenvolvimento)
    if os.getenv("FLASK_ENV") == "development":
        logger.warning("Modo desenvolvimento: Pulando verificação de assinatura")
        try:
            event = json.loads(payload)
        except json.JSONDecodeError as e:
            logger.error(f"Payload JSON inválido: {e}")
            return jsonify({"error": "Payload JSON inválido"}), 400
    else:
        try:
            # Validação segura da assinatura em produção
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except ValueError as e:
            logger.error(f"Payload inválido: {e}")
            return jsonify({"error": "Payload inválido"}), 400
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Assinatura inválida: {e}")
            return jsonify({"error": "Assinatura inválida"}), 400

    # Extração e validação dos dados do evento
    event_type = event.get("type")
    event_id = event.get("id")
    data = event.get("data", {}).get("object", {})
    
    # Validação da estrutura do evento
    if not event_type or not data:
        logger.error(f"Tipo de evento ou dados ausentes no evento {event_id}")
        return jsonify({"error": "Estrutura de evento inválida"}), 400

    logger.info(f"Processando evento Stripe: {event_type} (ID: {event_id})")

    try:
        # Roteamento para handlers específicos de cada tipo de evento
        if event_type == "payment_intent.succeeded":
            result = _handle_payment_succeeded(data, event_id)
        elif event_type == "payment_intent.payment_failed":
            result = _handle_payment_failed(data, event_id)
        else:
            # Log de eventos não tratados (não é erro)
            logger.info(f"Ignorando tipo de evento não tratado: {event_type}")
            return jsonify({"received": True, "message": f"Evento {event_type} ignorado"}), 200
        
        # Resposta baseada no resultado do processamento
        if result:
            return jsonify({"received": True, "processed": True}), 200
        else:
            return jsonify({"received": True, "processed": False}), 200
            
    except Exception as e:
        # Log de erros inesperados no processamento
        logger.error(f"Erro ao processar evento {event_id}: {str(e)}")
        return jsonify({"error": "Erro interno de processamento"}), 500

def _handle_payment_succeeded(payment_intent_data, event_id):
    """
    Processa evento de pagamento bem-sucedido
    """
    pi_id = payment_intent_data.get("id")
    amount = payment_intent_data.get("amount")
    currency = payment_intent_data.get("currency")
    
    # Validação de dados obrigatórios
    if not pi_id:
        logger.error(f"ID do payment_intent ausente no evento {event_id}")
        return False
    
    logger.info(f"Processando pagamento bem-sucedido: {pi_id} - {amount} {currency}")
    
    # Busca da transação no banco de dados
    transaction = Transaction.get_by_gateway_id(pi_id)
    if not transaction:
        logger.warning(f"Transação não encontrada para payment_intent: {pi_id}")
        return False
    
    # Busca do status "Paid" no banco
    paid_status = PaymentStatus.get_by_name("Paid")
    if not paid_status:
        logger.error("Status 'Paid' não encontrado no banco de dados")
        return False
    
    # Atualização da transação com rollback em caso de erro
    try:
        transaction.payment_status_id = paid_status.id
        db.session.commit()
        logger.info(f"Transação {transaction.id} marcada como bem-sucedida para PI {pi_id}")
        return True
    except Exception as e:
        logger.error(f"Erro no banco ao atualizar transação {transaction.id}: {str(e)}")
        db.session.rollback()  # Rollback em caso de erro
        return False

def _handle_payment_failed(payment_intent_data, event_id):
    """
    Processa evento de pagamento falhado
    """
    pi_id = payment_intent_data.get("id")
    failure_reason = payment_intent_data.get("last_payment_error", {}).get("message", "Erro desconhecido")
    
    # Validação de dados obrigatórios
    if not pi_id:
        logger.error(f"ID do payment_intent ausente no evento {event_id}")
        return False
    
    logger.info(f"Processando pagamento falhado: {pi_id} - Motivo: {failure_reason}")
    
    # Busca da transação no banco de dados
    transaction = Transaction.get_by_gateway_id(pi_id)
    if not transaction:
        logger.warning(f"Transação não encontrada para payment_intent: {pi_id}")
        return False
    
    # Busca do status "Failed" no banco (corrigido de "failed" para "Failed")
    failed_status = PaymentStatus.get_by_name("Failed")
    if not failed_status:
        logger.error("Status 'Failed' não encontrado no banco de dados")
        return False
    
    # Atualização da transação com rollback em caso de erro
    try:
        transaction.payment_status_id = failed_status.id
        db.session.commit()
        logger.info(f"Transação {transaction.id} marcada como falhada para PI {pi_id}")
        return True
    except Exception as e:
        logger.error(f"Erro no banco ao atualizar transação {transaction.id}: {str(e)}")
        db.session.rollback()  # Rollback em caso de erro
        return False

@stripe_webhook_bp.route("/health", methods=["GET"])
def webhook_health():
    """
    Endpoint de health check para monitoramento do serviço de webhooks
    """
    return jsonify({
        "status": "healthy",
        "service": "stripe_webhooks",
        "webhook_secret_configured": bool(os.getenv("STRIPE_WEBHOOK_SECRET"))
    }), 200 