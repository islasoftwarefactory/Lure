from flask import Blueprint, request, jsonify, current_app
# Importar a CLASSE do modelo
from api.purchases.purchase.model import Purchase
# Importar modelos relacionados para criar itens/histórico
from api.purchases.product.model import PurchaseItem
from api.purchases.history.model import PurchaseHistory
from api.utils.jwt.decorators import token_required
from api.utils.db.connection import db # Importar db para commit
import traceback
import uuid

# Manter o nome do blueprint como definido no alias em blueprints.py
purchase_bp = Blueprint('purchase', __name__)

@purchase_bp.route("", methods=["POST"])
@token_required
def handle_create_purchase(current_user_id):
    data = request.get_json()
    if not data or not data.get('shipping_address_id'):
        return jsonify({"error": "Missing required field: shipping_address_id"}), 400

    data['user_id'] = current_user_id
    items_data = data.pop('items', [])

    try:
        # Chamar método da classe
        new_purchase = Purchase.create(data)
        db.session.add(new_purchase)
        db.session.flush() # Garante que new_purchase.id esteja disponível

        if not items_data:
             raise ValueError("Cannot create a purchase without items.")

        for item_data in items_data:
            item_data['purchase_id'] = new_purchase.id
            # Idealmente, buscar preço real do produto aqui
            if 'unit_price_at_purchase' not in item_data:
                 raise ValueError(f"Missing 'unit_price_at_purchase' for product {item_data.get('product_id')}")
            # Chamar método da classe
            PurchaseItem.create(item_data) # Adiciona à sessão, mas não commita ainda

        new_purchase.calculate_totals()
        db.session.add(new_purchase) # Adiciona a atualização dos totais

        # Chamar método da classe
        PurchaseHistory.create({
            "purchase_id": new_purchase.id,
            "event_description": "Purchase created", # Exemplo de descrição
            "created_by": f"user:{current_user_id}"
        })

        db.session.commit() # Commit tudo junto: Purchase, Items, History

        return jsonify({
            "message": "Purchase created successfully.",
            "data": new_purchase.serialize(include_items=True)
        }), 201
    except ValueError as ve:
        db.session.rollback()
        current_app.logger.warning(f"Purchase creation validation error: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Failed to create purchase: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to create purchase due to an internal error."}), 500

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