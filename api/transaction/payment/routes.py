from flask import Blueprint, request, jsonify, current_app
# Importar a CLASSE do modelo
from api.transaction.payment.model import Transaction
# Importar Purchase para verificação
from api.purchases.purchase.model import Purchase
from api.utils.security.jwt.decorators import token_required
from api.utils.db.connection import db # Importar db para commit
import traceback
import uuid

# Manter o nome do blueprint como definido no alias em blueprints.py
transaction_bp = Blueprint('transaction', __name__)

@transaction_bp.route("", methods=["POST"])
@token_required
def handle_create_transaction(current_user_id):
    data = request.get_json()
    required_fields = ["purchase_id", "method_id", "amount", "currency_id"]
    if not data or not all(field in data for field in required_fields):
        return jsonify({"error": f"Missing one or more required fields: {', '.join(required_fields)}"}), 400

    purchase = Purchase.get_by_id(data["purchase_id"])
    if not purchase:
         return jsonify({"error": "Purchase not found"}), 404
    # Idealmente, apenas o sistema ou admin criaria transações diretamente
    # if purchase.user_id != current_user_id: ...

    try:
        # Chamar método da classe
        new_transaction = Transaction.create(data)
        # Commit já é feito no método create do Transaction model
        return jsonify({
            "message": "Transaction created successfully.",
            "data": new_transaction.serialize()
        }), 201
    except ValueError as ve:
        current_app.logger.warning(f"Transaction creation validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        # Rollback já feito no model
        current_app.logger.error(f"Failed to create transaction: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to create transaction due to an internal error."}), 500

@transaction_bp.route("/<int:transaction_id>", methods=["GET"])
@token_required
def handle_get_transaction(current_user_id, transaction_id):
    # Chamar método da classe
    transaction = Transaction.get_by_id(transaction_id)
    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404

    purchase = Purchase.get_by_id(transaction.purchase_id)
    if not purchase or purchase.user_id != current_user_id:
         return jsonify({"error": "Not authorized to view this transaction"}), 403

    return jsonify({"data": transaction.serialize()}), 200

@transaction_bp.route("/gateway/<string:gateway_id>", methods=["GET"])
@token_required
def handle_get_transaction_by_gateway_id(current_user_id, gateway_id):
    current_app.logger.info(f"--- Rota GET /gateway/{gateway_id} INICIADA ---")
    current_app.logger.debug(f"Buscando transação com gateway_id: {gateway_id}")
    transaction = Transaction.get_by_gateway_id(gateway_id)

    if not transaction:
        current_app.logger.warning(f"<<< FALHA 404: Transação não encontrada para gateway_id: {gateway_id}")
        return jsonify({"error": f"Transaction with gateway ID '{gateway_id}' not found"}), 404
    current_app.logger.info(f"Transação encontrada: ID={transaction.id}, PurchaseID={transaction.purchase_id}")

    current_app.logger.debug(f"Buscando Purchase com ID: {transaction.purchase_id}")
    purchase = Purchase.get_by_id(transaction.purchase_id)

    # --- LOGS DE DEPURAÇÃO CRÍTICOS ---
    if purchase:
        current_app.logger.info(f"Purchase encontrada: ID={purchase.id}, UserID DENTRO DA PURCHASE={purchase.user_id}")
    else:
        current_app.logger.warning(f"Purchase com ID {transaction.purchase_id} NÃO foi encontrada no banco de dados!")

    current_app.logger.info(f"Verificando autorização: UserID da Purchase ({purchase.user_id if purchase else 'N/A'}) vs UserID do Token ({current_user_id})")
    # --- FIM LOGS DE DEPURAÇÃO ---

    if not purchase or purchase.user_id != current_user_id:
         current_app.logger.warning(f"<<< FALHA 403: Usuário {current_user_id} não autorizado para Purchase com UserID {purchase.user_id if purchase else 'N/A'}.")
         return jsonify({"error": "Not authorized to view this transaction"}), 403

    current_app.logger.info(f"Autorização OK. Retornando dados da transação {transaction.id}.")
    current_app.logger.info(f"--- Rota GET /gateway/{gateway_id} FINALIZADA COM SUCESSO ---")
    return jsonify({"data": transaction.serialize()}), 200

@transaction_bp.route("/purchase/<string:purchase_id>", methods=["GET"])
@token_required
def handle_get_all_transactions_for_purchase(current_user_id, purchase_id):
    try:
        uuid.UUID(purchase_id)
    except ValueError:
        return jsonify({"error": "Invalid purchase ID format."}), 400

    purchase = Purchase.get_by_id(purchase_id)
    if not purchase or purchase.user_id != current_user_id:
        return jsonify({"error": "Purchase not found or not authorized"}), 403

    try:
        # Chamar método da classe
        transactions = Transaction.get_all_for_purchase(purchase_id)
        return jsonify({"data": [t.serialize() for t in transactions]}), 200
    except Exception as e:
        current_app.logger.error(f"Failed to retrieve transactions for purchase {purchase_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to retrieve transactions due to an internal error."}), 500

@transaction_bp.route("/", methods=["GET"])
@token_required
def handle_get_all_transactions(current_user_id):
    """
    Retrieves all transaction records.
    Primarily for admin dashboard use.
    TODO: Add proper admin authorization check.
    """
    current_app.logger.info(f"--- Rota GET /purchase-transaction/ (handle_get_all_transactions) INICIADA por user_id: {current_user_id} ---")
    try:
        # Get all transactions, newest first
        transactions = Transaction.query.order_by(Transaction.created_at.desc()).all()
        
        # NOTE: The transaction serializer may need to be enhanced to include
        # relational data like user info for the dashboard.
        serialized_transactions = [t.serialize() for t in transactions]

        current_app.logger.info(f"Retornando {len(serialized_transactions)} transações totais.")
        return jsonify({"data": serialized_transactions}), 200
    except Exception as e:
        current_app.logger.error(f"Failed to retrieve all transactions: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"error": "Failed to retrieve all transactions due to an internal error."}), 500

@transaction_bp.route("/<int:transaction_id>", methods=["PUT"])
@token_required
def handle_update_transaction(current_user_id, transaction_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    transaction_to_update = Transaction.get_by_id(transaction_id)
    if not transaction_to_update:
         return jsonify({"error": "Transaction not found"}), 404

    purchase = Purchase.get_by_id(transaction_to_update.purchase_id)
    # Permitir admin/sistema atualizar, mesmo que não seja dono?
    # if not purchase or purchase.user_id != current_user_id: ...

    try:
        # Chamar método da classe
        updated_transaction = Transaction.update(transaction_id, data)
        if not updated_transaction:
            return jsonify({"error": "Transaction not found during update"}), 404

        return jsonify({
            "message": "Transaction updated successfully.",
            "data": updated_transaction.serialize()
        }), 200
    except ValueError as ve:
        current_app.logger.warning(f"Transaction update validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        # Rollback feito no model
        current_app.logger.error(f"Failed to update transaction {transaction_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to update transaction due to an internal error."}), 500

# No DELETE route for transactions usually 