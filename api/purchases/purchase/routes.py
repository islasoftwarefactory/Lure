from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.exc import SQLAlchemyError
from api.utils.db.connection import db
from api.utils.security.jwt.decorators import token_required
from api.user.model import User
from api.address.model import Address # Para buscar o endereço de entrega
from api.product.model import Product # Para buscar o produto e sua moeda/preço
from api.currency.model import Currency # Para buscar a moeda
from .model import Purchase # SEU MODELO DE PURCHASE
from api.purchases.product.model import PurchaseItem # Para criar os itens da compra
from api.transaction.payment.model import Transaction # Para registrar a transação
from api.transaction.method.model import TransactionMethod # Para o método de pagamento (Stripe)
from api.payment_status.model import PaymentStatus # Para o status inicial (pending)
from api.purchases.history.model import PurchaseHistory # Para o histórico inicial
from decimal import Decimal
import stripe
import os
import uuid
from dotenv import load_dotenv
import traceback # Para logs de erro mais detalhados

# Carrega as variáveis de ambiente do arquivo .env
# Idealmente, isso é feito uma vez na inicialização do app (api/app.py)
load_dotenv() 

# Configure a chave da API Stripe globalmente
# Idealmente, isso é feito uma vez na inicialização do app (api/app.py)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Mantendo o nome do blueprint como no seu projeto original
purchase_bp = Blueprint('purchase', __name__,) # [ Original: purchase_bp ]

@purchase_bp.route('/create', methods=['POST']) # [ Original: /create ]
@token_required
def handle_create_purchase(current_user_id):
    current_app.logger.info(f"--- Rota /purchase/create INICIADA para user_id: {current_user_id} ---")
    data = request.get_json()
    current_app.logger.debug(f"Dados JSON recebidos: {data}")

    if not data:
        current_app.logger.warning("<<< FALHA: JSON não fornecido ou inválido.")
        return jsonify({"error": "Request body must be JSON"}), 400

    items_data = data.get('items')
    shipping_address_id = data.get('shipping_address_id')
    
    # Estes valores agora virão do frontend
    shipping_cost_str = data.get('shipping_cost', "0.00") # Default para "0.00" se não fornecido
    taxes_str = data.get('taxes', "0.00") # Default para "0.00" se não fornecido

    if not items_data:
        current_app.logger.warning("<<< FALHA: Nenhum item fornecido na compra.")
        return jsonify({"error": "No items provided for purchase"}), 400
    if not shipping_address_id:
        current_app.logger.warning("<<< FALHA: shipping_address_id faltando.")
        return jsonify({"error": "Shipping address ID is required"}), 400

    user = User.query.get(current_user_id)
    if not user:
        current_app.logger.error(f"<<< FALHA CRÍTICA: Usuário ID {current_user_id} (do token) não encontrado no DB.")
        return jsonify({"error": "Authenticated user not found"}), 404 # Erro mais apropriado

    shipping_address = Address.query.get(shipping_address_id)
    if not shipping_address or shipping_address.user_id != user.id:
        current_app.logger.warning(f"<<< FALHA: Endereço de entrega ID {shipping_address_id} inválido ou não pertence ao usuário.")
        return jsonify({"error": "Invalid shipping address or not owned by user"}), 400
    
    determined_currency_id = None
    try:
        first_item_data = items_data[0]
        first_product_id = int(first_item_data['product_id'])
        product_for_currency = Product.query.get(first_product_id)
        if not product_for_currency:
            current_app.logger.warning(f"<<< FALHA: Produto {first_product_id} (do primeiro item) não encontrado.")
            return jsonify({"error": f"Product with ID {first_product_id} not found."}), 404
        if not product_for_currency.currency_id:
            current_app.logger.error(f"<<< ERRO INTERNO: Produto {first_product_id} não tem currency_id configurado!")
            return jsonify({"error": "Internal configuration error: Product is missing currency information."}), 500
        determined_currency_id = product_for_currency.currency_id
        currency_object = Currency.query.get(determined_currency_id)
        if not currency_object:
            current_app.logger.error(f"<<< ERRO INTERNO: Currency ID {determined_currency_id} (do produto) não encontrado na tabela de moedas.")
            return jsonify({"error": f"Internal configuration error: Currency with ID {determined_currency_id} not found."}), 500
        currency_code_for_stripe = currency_object.code.lower()
        current_app.logger.info(f"Currency ID {determined_currency_id} ({currency_code_for_stripe}) determinada para a compra.")
    except (KeyError, IndexError, ValueError, TypeError) as e:
        current_app.logger.error(f"<<< FALHA: Erro ao processar dados do item para determinar moeda: {e}")
        return jsonify({"error": "Invalid or missing product data in items to determine currency."}), 400

    session = db.session()
    try:
        # Usando o método create do seu modelo Purchase
        # Certifique-se que Purchase.create() NÃO faz commit()
        # Ele deve apenas retornar a instância para ser adicionada à sessão.
        # O payload do Purchase.create precisa ser ajustado se ele não espera 'items' diretamente.
        # Conforme seu model.py, Purchase.create espera: user_id, currency_id, subtotal, shipping_cost, taxes, total_amount
        # Vamos calcular isso ANTES de chamar Purchase.create
        
        temp_subtotal = Decimal('0.00')
        processed_purchase_items = []

        for item_data in items_data:
            product_id = item_data.get('product_id')
            quantity = item_data.get('quantity')
            # unit_price_at_purchase DEVE vir do frontend, baseado no preço que o usuário viu
            unit_price_str = item_data.get('unit_price_at_purchase')

            if not product_id or not isinstance(quantity, int) or quantity <= 0 or unit_price_str is None:
                current_app.logger.warning(f"<<< FALHA: Dados de item inválidos: {item_data}")
                raise ValueError("Invalid item data: product_id, quantity, and unit_price_at_purchase are required.")

            product = Product.query.get(product_id)
            if not product:
                current_app.logger.warning(f"<<< FALHA: Produto ID {product_id} não encontrado no DB.")
                raise ValueError(f"Product with ID {product_id} not found")
            
            # Aqui é um bom lugar para verificar o estoque, se essa lógica for reintroduzida
            # if product.stock < quantity:
            #     raise ValueError(f"Not enough stock for product {product.name}")

            unit_price = Decimal(str(unit_price_str)) # Converter string para Decimal
            item_total_price = unit_price * Decimal(quantity)
            temp_subtotal += item_total_price

            # Adicionamos à lista para criar PurchaseItem depois que Purchase tiver ID
            processed_purchase_items.append({
                "product_id": product.id,
                "size_id": item_data.get('size_id'), # Assumindo que size_id vem do frontend
                "quantity": quantity,
                "unit_price_at_purchase": unit_price,
                # product.stock -= quantity # Lógica de estoque movida/removida conforme sua observação
            })
        
        # Converter shipping_cost e taxes para Decimal
        try:
            shipping_cost = Decimal(shipping_cost_str)
            taxes = Decimal(taxes_str)
        except Exception: # decimal.InvalidOperation
            current_app.logger.warning(f"<<< FALHA: shipping_cost ou taxes com formato inválido: '{shipping_cost_str}', '{taxes_str}'")
            raise ValueError("Invalid format for shipping_cost or taxes. Must be valid numbers.")

        temp_total_amount = temp_subtotal + shipping_cost + taxes
        
        purchase_data_for_model = {
            "user_id": user.id,
            "currency_id": determined_currency_id,
            "shipping_address_id": shipping_address.id, # Adicionado, se seu Purchase model precisar
            "subtotal": temp_subtotal,
            "shipping_cost": shipping_cost,
            "taxes": taxes,
            "total_amount": temp_total_amount,
        }
        current_app.logger.debug(f"Dados para Purchase.create: {purchase_data_for_model}")
        new_purchase = Purchase.create(purchase_data_for_model) # .create() do seu modelo
        session.add(new_purchase)
        session.flush() 
        current_app.logger.info(f"Purchase ID {new_purchase.id} adicionada à sessão.")

        for item_detail in processed_purchase_items:
            item_detail_for_model = {
                "purchase_id": new_purchase.id,
                "product_id": item_detail["product_id"],
                "size_id": item_detail["size_id"], # Adicione size_id
                "quantity": item_detail["quantity"],
                "unit_price_at_purchase": item_detail["unit_price_at_purchase"]
            }
            # Usando o método create do PurchaseItem model
            new_pi = PurchaseItem.create(item_detail_for_model)
            session.add(new_pi)
        current_app.logger.info(f"{len(processed_purchase_items)} PurchaseItems adicionados à sessão para Purchase ID {new_purchase.id}.")

        # -- Stripe PaymentIntent Creation --
        try:
            amount_in_cents = int(new_purchase.total_amount * 100)
            current_app.logger.debug(f"Criando PaymentIntent para Stripe: Valor={amount_in_cents} {currency_code_for_stripe}")
            
            payment_intent_params = {
                'amount': amount_in_cents,
                'currency': currency_code_for_stripe,
                'metadata': {
                    'purchase_id': str(new_purchase.id),
                    'user_id': str(user.id)
                },
                'description': f'Lure E-commerce Purchase ID: {new_purchase.id}',
                'automatic_payment_methods': {'enabled': True},
            }
            payment_intent = stripe.PaymentIntent.create(**payment_intent_params)
            current_app.logger.info(f"PaymentIntent {payment_intent.id} criado na Stripe.")
            current_app.logger.info(f"→ [Stripe] PI criado: id={payment_intent.id}, secret={payment_intent.client_secret[:5]}…")
        except stripe.error.StripeError as e:
            current_app.logger.error(f"Erro da Stripe ao criar PaymentIntent: {str(e)}")
            session.rollback()
            return jsonify({"error": f"Stripe error: {str(e)}"}), 500
        except Exception as e:
            current_app.logger.error(f"Erro genérico ao criar PaymentIntent: {str(e)} \n{traceback.format_exc()}")
            session.rollback()
            return jsonify({"error": f"Error creating PaymentIntent: {str(e)}"}), 500

        # -- Local Transaction Record --
        pending_status = PaymentStatus.query.filter_by(name="Pending").first()
        # O ID 'c1b9f8f0-5c0c-4c9f-8c7b-9d6b4e2f3a1d' é "Credit Card" no seu setup inicial
        # Seria melhor ter um método "Stripe" ou "Online Payment"
        transaction_method = TransactionMethod.query.filter_by(name="stripe").first() 
        if not transaction_method: # Fallback se "stripe" não existir, use "Credit Card"
             transaction_method = TransactionMethod.query.get('c1b9f8f0-5c0c-4c9f-8c7b-9d6b4e2f3a1d')

        if not pending_status or not transaction_method:
            current_app.logger.error("<<< ERRO INTERNO: Status 'Pending' ou método de transação 'stripe'/'Credit Card' não encontrado.")
            session.rollback()
            return jsonify({"error": "Internal configuration error for transaction status/method."}), 500
        
        # Seu Transaction.create pode precisar ser ajustado para aceitar user_id
        transaction_data_for_model = {
            "purchase_id": new_purchase.id,
            "user_id": user.id, # Adicionando user_id
            "method_id": transaction_method.id,
            "amount": new_purchase.total_amount,
            "currency_id": determined_currency_id, 
            "gateway_payment_id": payment_intent.id,
            "payment_status_id": pending_status.id
        }
        current_app.logger.debug(f"Dados para Transaction.create: {transaction_data_for_model}")
        # Usando o método create do Transaction model
        new_transaction = Transaction.create(transaction_data_for_model)
        session.add(new_transaction)
        current_app.logger.info(f"Transaction local {new_transaction.id} (gateway: {payment_intent.id}) adicionada à sessão.")

        # -- Purchase History --
        history_data_for_model = {
            "purchase_id": new_purchase.id,
            "user_id": user.id, # Adicionando user_id, se seu PurchaseHistory.create suportar
            "status_description": "Order placed by customer. Awaiting payment confirmation from Stripe.",
            "created_by": f"user:{user.id}" # Exemplo
        }
        current_app.logger.debug(f"Dados para PurchaseHistory.create: {history_data_for_model}")
        # Usando o método create do PurchaseHistory model
        new_history_entry = PurchaseHistory.create(history_data_for_model)
        session.add(new_history_entry)
        current_app.logger.info(f"PurchaseHistory {new_history_entry.id} adicionado à sessão.")
        
        # Limpeza do carrinho (opcional, pode ser movido para após confirmação de pagamento via webhook)
        # cart = Cart.query.filter_by(user_id=user.id).first()
        # if cart:
        #     CartItem.query.filter_by(cart_id=cart.id).delete()

        session.commit()
        current_app.logger.info(f"Commit da Purchase ID {new_purchase.id} e entidades relacionadas realizado com sucesso.")

        return jsonify({
            "message": "Purchase intent created successfully. Please confirm payment.",
            "purchase_id": str(new_purchase.id),
            "client_secret": payment_intent.client_secret,
            "total_amount": str(new_purchase.total_amount),
            "currency": currency_code_for_stripe.upper(),
            "shipping_cost": float(new_purchase.shipping_cost),
            "taxes": float(new_purchase.taxes)
        }), 201

    except ValueError as ve: # Erros de validação de dados
        current_app.logger.error(f"<<< ERRO de Validação (ValueError) durante criação da compra: {str(ve)} \n{traceback.format_exc()}")
        if session: session.rollback()
        return jsonify({"error": str(ve)}), 400
    except SQLAlchemyError as e: # Erros específicos do SQLAlchemy (ex: constraint violations)
        current_app.logger.error(f"<<< ERRO de Banco de Dados (SQLAlchemyError) durante criação da compra: {str(e)} \n{traceback.format_exc()}")
        if session: session.rollback()
        return jsonify({"error": "Database error during purchase creation.", "details": str(e)}), 500
    except Exception as e: # Outros erros inesperados
        current_app.logger.error(f"<<< ERRO Inesperado (Exception) durante criação da compra: {str(e)} \n{traceback.format_exc()}")
        if session: session.rollback()
        return jsonify({"error": "An unexpected error occurred.", "details": str(e)}), 500
    finally:
        if session: session.close()


# As rotas GET para /<purchase_id> e /user/me permanecem as mesmas do código anterior
# Se precisar delas ajustadas também, me avise.
# Por enquanto, focarei apenas na rota /create que é o ponto da integração Stripe.

# Rota GET para buscar uma compra específica (mantida do seu código original, sem alterações)
@purchase_bp.route("/<string:purchase_id>", methods=["GET"])
@token_required
def get_purchase_details(current_user_id, purchase_id): # Nome da função original era handle_get_purchase
    try:
        uuid.UUID(purchase_id) # Valida se é um UUID válido
    except ValueError:
        return jsonify({"error": "Invalid purchase ID format."}), 400

    purchase = Purchase.get_by_id(purchase_id) # Usando o método de classe do seu modelo

    if not purchase:
        return jsonify({"error": "Purchase not found"}), 404
    if purchase.user_id != current_user_id: # Proteção de acesso
         return jsonify({"error": "Not authorized to view this purchase"}), 403

    # Parâmetros de query para incluir dados relacionados
    include_items = request.args.get('include_items', 'true').lower() == 'true'
    include_history = request.args.get('include_history', 'false').lower() == 'true'
    include_transactions = request.args.get('include_transactions', 'false').lower() == 'true'
    include_shipping = request.args.get('include_shipping', 'false').lower() == 'true'
    # Adicionado include_address
    include_address = request.args.get('include_address', 'false').lower() == 'true'


    # Adapte o método serialize para aceitar include_address
    # Se o seu `Purchase.serialize` não tiver `include_address`, você precisará adicioná-lo
    # ou serializar o endereço separadamente aqui.
    # Assumindo que serialize foi atualizado:
    serialized_data = purchase.serialize(
        include_items=include_items,
        include_history=include_history,
        include_transactions=include_transactions,
        include_shipping=include_shipping
        # include_address=include_address # Descomente se serialize for atualizado
    )

    # Se serialize não lida com endereço e include_address=True:
    if include_address and purchase.shipping_address_id:
        address = Address.query.get(purchase.shipping_address_id)
        if address:
            serialized_data['address'] = address.serialize() # Assumindo que Address tem serialize()

    return jsonify({"data": serialized_data}), 200


# Rota GET para buscar todas as compras de um usuário (mantida do seu código original, sem alterações)
@purchase_bp.route("/user/me", methods=["GET"])
@token_required
def get_user_purchases(current_user_id): # Nome da função original era handle_get_all_user_purchases
    try:
        purchases = Purchase.get_all_for_user(current_user_id)
        # Parâmetros de query opcionais para serialização
        include_shipping = request.args.get('include_shipping', 'false').lower() == 'true'
        include_transactions = request.args.get('include_transactions', 'true').lower() == 'true'
        include_items = request.args.get('include_items', 'true').lower() == 'true'
        include_address = request.args.get('include_address', 'false').lower() == 'true'

        serialized_purchases = []
        for p in purchases:
            data = p.serialize(
                include_items=include_items,
                include_transactions=include_transactions,
                include_shipping=include_shipping
            )
            # Incluir endereço de entrega se solicitado
            if include_address and p.shipping_address_id:
                addr = Address.query.get(p.shipping_address_id)
                if addr:
                    data['shipping_address'] = addr.serialize()
            serialized_purchases.append(data)
        return jsonify({"data": serialized_purchases}), 200
    except Exception as e:
        current_app.logger.error(f"Failed to retrieve purchases for user {current_user_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to retrieve purchases due to an internal error."}), 500


@purchase_bp.route('/', methods=['GET'])
@token_required
def get_all_purchases(current_user_id):
    """
    Retrieves all purchase records.
    Primarily for admin dashboard use.
    TODO: Add admin role verification.
    """
    current_app.logger.info(f"--- Rota GET /purchase/ (get_all_purchases) INICIADA por user_id: {current_user_id} ---")
    try:
        # Parameters to control the amount of related data returned
        include_items = request.args.get('include_items', 'true').lower() == 'true'
        include_transactions = request.args.get('include_transactions', 'true').lower() == 'true'
        include_address = request.args.get('include_address', 'true').lower() == 'true'

        all_purchases = Purchase.query.order_by(Purchase.created_at.desc()).all()
        
        serialized_data = []
        for p in all_purchases:
            data = p.serialize(
                include_items=include_items,
                include_transactions=include_transactions,
                include_address=include_address
            )
            serialized_data.append(data)

        current_app.logger.info(f"Retornando {len(serialized_data)} compras totais.")
        return jsonify({"data": serialized_data}), 200
        
    except Exception as e:
        current_app.logger.error(f"Erro ao buscar todas as compras: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"error": "Failed to retrieve all purchases due to an internal error."}), 500