from flask import Blueprint, request, jsonify, current_app
# Importar a CLASSE do modelo
from api.purchases.purchase.model import Purchase
# Importar modelos relacionados para criar itens/histórico
from api.purchases.product.model import PurchaseItem
from api.purchases.history.model import PurchaseHistory
from api.transaction.payment.model import Transaction
from api.payment_status.model import PaymentStatus
from api.transaction.method.model import TransactionMethod
from api.product.model import Product
from api.utils.jwt.decorators import token_required
from api.utils.db.connection import db # Importar db para commit
import traceback
import uuid

# Manter o nome do blueprint como definido no alias em blueprints.py
purchase_bp = Blueprint('purchase', __name__)

@purchase_bp.route("create", methods=["POST"])
@token_required
def handle_create_purchase(current_user_id):
    # --- LOG: Início da Rota ---
    current_app.logger.info(f"--- Rota /purchases/create INICIADA para user_id: {current_user_id} ---")

    data = request.get_json()
    # --- LOG: Dados Recebidos ---
    current_app.logger.debug(f"Dados JSON recebidos: {data}")

    if not data or not data.get('shipping_address_id'):
        current_app.logger.warning("<<< FALHA: shipping_address_id faltando ou JSON inválido.")
        return jsonify({"error": "Missing required field: shipping_address_id"}), 400

    data['user_id'] = current_user_id
    items_data = data.pop('items', [])
    # --- LOG: Itens Extraídos ---
    current_app.logger.debug(f"Itens extraídos para processamento: {items_data}")

    if not items_data:
         current_app.logger.warning("<<< FALHA: Nenhum item fornecido na compra.")
         return jsonify({"error": "Cannot create a purchase without items."}), 400

    # --- LOG: Início Determinação Moeda ---
    determined_currency_id = None
    current_app.logger.info("Etapa 1: Determinando Currency ID a partir do primeiro item...")
    try:
        first_item_data = items_data[0]
        first_product_id = int(first_item_data['product_id'])
        current_app.logger.debug(f"Buscando produto ID: {first_product_id} para obter currency_id.")
        product_for_currency = Product.query.get(first_product_id)
        if not product_for_currency:
             current_app.logger.warning(f"<<< FALHA: Produto {first_product_id} não encontrado.")
             return jsonify({"error": f"Product with ID {first_product_id} not found."}), 400
        if not product_for_currency.currency_id:
             current_app.logger.error(f"<<< ERRO INTERNO: Produto {first_product_id} não tem currency_id configurado!")
             return jsonify({"error": "Internal configuration error: Product is missing currency."}), 500

        determined_currency_id = product_for_currency.currency_id
        current_app.logger.info(f"Currency ID determinada: {determined_currency_id}")

    except (KeyError, IndexError, ValueError, TypeError) as e:
         current_app.logger.error(f"<<< FALHA: Erro ao processar dados do item para determinar moeda: {e}")
         return jsonify({"error": "Invalid or missing product data in items to determine currency."}), 400
    # --- LOG: Fim Determinação Moeda ---

    # --- ADICIONAR ESTA LINHA ---
    # Adicionar o currency_id determinado ao dicionário 'data' ANTES de criar Purchase
    data['currency_id'] = determined_currency_id
    current_app.logger.debug(f"Adicionado currency_id={determined_currency_id} ao dict 'data' para criação.")
    # --- FIM ADIÇÃO ---

    try:
        # --- LOG: Início Criação Purchase ---
        current_app.logger.info("Etapa 2: Criando objeto Purchase...")
        # Agora 'data' contém a currency_id que o Purchase.create espera
        current_app.logger.debug(f"Dados para Purchase.create: {data}")
        new_purchase = Purchase.create(data)
        db.session.add(new_purchase)
        db.session.flush() # Garante ID
        current_app.logger.info(f"Purchase criada na sessão com ID provisório/final: {new_purchase.id}")
        # --- LOG: Fim Criação Purchase ---

        # --- LOG: Início Criação Itens ---
        current_app.logger.info(f"Etapa 3: Criando PurchaseItems ({len(items_data)} itens)...")
        for i, item_data in enumerate(items_data):
            item_data['purchase_id'] = new_purchase.id
            current_app.logger.debug(f"Processando item {i+1}/{len(items_data)}: {item_data}")
            if 'unit_price_at_purchase' not in item_data:
                 # Levanta erro que será pego pelo except ValueError externo
                 raise ValueError(f"Missing 'unit_price_at_purchase' for product {item_data.get('product_id')}")
            PurchaseItem.create(item_data)
            current_app.logger.debug(f"Item {i+1} criado na sessão.")
        current_app.logger.info("Todos os PurchaseItems criados na sessão.")
        # --- LOG: Fim Criação Itens ---

        # --- LOG: Início Cálculo Totais ---
        current_app.logger.info("Etapa 4: Calculando totais da Purchase...")
        new_purchase.calculate_totals()
        db.session.add(new_purchase) # Adiciona atualização
        current_app.logger.info(f"Totais calculados: Subtotal={new_purchase.subtotal}, Total={new_purchase.total_amount}")
        # --- LOG: Fim Cálculo Totais ---

        # --- LOG: Início Criação Transação ---
        current_app.logger.info("Etapa 5: Criando Transação Inicial...")
        current_app.logger.debug("Buscando status 'pending'...")
        pending_status = PaymentStatus.query.filter_by(name='pending').first()
        current_app.logger.debug("Buscando método 'stripe'...")
        stripe_method = TransactionMethod.query.filter_by(name='stripe').first()

        if not pending_status or not stripe_method:
             current_app.logger.error("<<< ERRO INTERNO: Status 'pending' ou método 'stripe' não encontrado no DB.")
             db.session.rollback()
             return jsonify({"error": "Internal configuration error: Default status or method not found."}), 500
        current_app.logger.debug(f"IDs de referência: Status={pending_status.id}, Method={stripe_method.id}")

        fake_gateway_id = f"pi_simulated_{new_purchase.id}"
        initial_transaction_data = {
            'purchase_id': new_purchase.id,
            'user_id': current_user_id,
            'method_id': stripe_method.id,
            'amount': new_purchase.total_amount,
            'currency_id': determined_currency_id,
            'gateway_payment_id': fake_gateway_id,
            'payment_status_id': pending_status.id
        }
        current_app.logger.debug(f"Dados para Transaction.create: {initial_transaction_data}")
        initial_transaction = Transaction.create(initial_transaction_data)
        current_app.logger.info("Transação inicial criada na sessão.")
        # --- LOG: Fim Criação Transação ---

        # --- LOG: Início Criação Histórico ---
        current_app.logger.info("Etapa 6: Criando PurchaseHistory...")
        history_data = {
            "purchase_id": new_purchase.id,
            "event_description": "Purchase created, transaction pending",
            "created_by": f"user:{current_user_id}"
        }
        current_app.logger.debug(f"Dados para PurchaseHistory.create: {history_data}")
        PurchaseHistory.create(history_data)
        current_app.logger.info("PurchaseHistory criado na sessão.")
        # --- LOG: Fim Criação Histórico ---

        # --- LOG: Antes do Commit ---
        current_app.logger.info("Etapa 7: Realizando commit final no banco de dados...")
        db.session.commit()
        current_app.logger.info("Commit realizado com sucesso!")
        # --- LOG: Fim Commit ---

        # --- LOG: Preparando Resposta ---
        current_app.logger.info(f"Preparando resposta JSON para Purchase ID: {new_purchase.id}")
        response_data = new_purchase.serialize(include_items=True, include_transactions=True)
        current_app.logger.debug(f"Dados serializados para resposta: {response_data}")
        current_app.logger.info(f"--- Rota /purchases/create FINALIZADA COM SUCESSO para user_id: {current_user_id} ---")
        # --- LOG: Fim Preparo Resposta ---

        return jsonify({
            "message": "Purchase created successfully.",
            "data": response_data
        }), 201

    except ValueError as ve:
        # --- LOG: Erro de Validação ---
        current_app.logger.error(f"<<< ERRO de Validação (ValueError) capturado: {str(ve)}")
        db.session.rollback()
        current_app.logger.info("Rollback realizado devido a ValueError.")
        current_app.logger.info(f"--- Rota /purchases/create FALHA (ValueError) para user_id: {current_user_id} ---")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        # --- LOG: Erro Inesperado ---
        current_app.logger.error(f"<<< ERRO Inesperado (Exception) capturado: {str(e)}")
        current_app.logger.error(traceback.format_exc()) # Log completo do traceback
        db.session.rollback()
        current_app.logger.info("Rollback realizado devido a Exception.")
        current_app.logger.info(f"--- Rota /purchases/create FALHA (Exception) para user_id: {current_user_id} ---")
        return jsonify({"error": "Failed to create purchase due to an internal server error."}), 500

@purchase_bp.route("/<string:purchase_id>", methods=["GET"])
@token_required
def handle_get_purchase(current_user_id, purchase_id):
    try:
        uuid.UUID(purchase_id)
    except ValueError:
        return jsonify({"error": "Invalid purchase ID format."}), 400

    # Chamar método da classe
    purchase = Purchase.get_by_id(purchase_id)

    if not purchase:
        return jsonify({"error": "Purchase not found"}), 404
    if purchase.user_id != current_user_id:
         return jsonify({"error": "Not authorized to view this purchase"}), 403

    include_items = request.args.get('include_items', 'true').lower() == 'true'
    include_history = request.args.get('include_history', 'false').lower() == 'true'
    include_transactions = request.args.get('include_transactions', 'false').lower() == 'true'

    return jsonify({"data": purchase.serialize(
        include_items=include_items,
        include_history=include_history,
        include_transactions=include_transactions
    )}), 200

@purchase_bp.route("/user/me", methods=["GET"]) # Rota alternativa para pegar compras do usuário logado
@token_required
def handle_get_all_user_purchases(current_user_id):
    try:
        # Chamar método da classe
        purchases = Purchase.get_all_for_user(current_user_id)
        return jsonify({"data": [p.serialize(include_items=False) for p in purchases]}), 200
    except Exception as e:
        current_app.logger.error(f"Failed to retrieve purchases for user {current_user_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to retrieve purchases due to an internal error."}), 500

@purchase_bp.route("/<string:purchase_id>", methods=["PUT"])
@token_required
def handle_update_purchase(current_user_id, purchase_id):
    try:
        uuid.UUID(purchase_id)
    except ValueError:
        return jsonify({"error": "Invalid purchase ID format."}), 400

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    purchase_to_update = Purchase.get_by_id(purchase_id)

    if not purchase_to_update:
         return jsonify({"error": "Purchase not found"}), 404
    if purchase_to_update.user_id != current_user_id:
         return jsonify({"error": "Not authorized to update this purchase"}), 403

    try:
        # Chamar método da classe
        updated_purchase = Purchase.update(purchase_id, data)
        if not updated_purchase:
            return jsonify({"error": "Purchase not found during update"}), 404

        # Adicionar histórico se necessário
        # PurchaseHistory.create({...})
        # db.session.commit()

        return jsonify({
            "message": "Purchase updated successfully.",
            "data": updated_purchase.serialize()
        }), 200
    except ValueError as ve:
        current_app.logger.warning(f"Purchase update validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Failed to update purchase {purchase_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to update purchase due to an internal error."}), 500

# No DELETE route as delete method is commented out in model 