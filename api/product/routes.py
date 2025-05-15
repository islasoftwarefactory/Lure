from flask import request, jsonify, Blueprint, current_app
from api.product.model import Product, create_product, get_product, update_product, delete_product
from api.currency.model import Currency
from api.utils.security.jwt.decorators import token_required
import traceback

blueprint = Blueprint('product', __name__, url_prefix='/products')

# Create
@blueprint.route("/create", methods=["POST"])
@token_required
def create(current_user_id):
    data = request.get_json()

    required_fields = ["name", "price", "currency_id", "size_id", "description", "inventory", "category_id", "gender_id"]
    if not data or not all(field in data for field in required_fields):
        missing = [field for field in required_fields if field not in data]
        current_app.logger.warning(f"Tentativa de criar produto com campos faltando: {', '.join(missing)}")
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    currency_id_to_check = data.get('currency_id')
    if currency_id_to_check is None:
        return jsonify({"error": "Missing required field: currency_id"}), 400

    try:
        currency = Currency.query.get(int(currency_id_to_check))
    except (ValueError, TypeError):
        current_app.logger.warning(f"Valor inválido recebido para currency_id: {currency_id_to_check}")
        return jsonify({"error": f"Invalid format for currency_id: must be an integer."}), 400

    if not currency:
        current_app.logger.warning(f"Tentativa de criar produto com currency_id inválido: {currency_id_to_check}")
        return jsonify({"error": f"Invalid currency_id: {currency_id_to_check} not found."}), 400

    try:
        product = create_product(data)
    except ValueError as ve:
        current_app.logger.error(f"Erro de validação ao criar produto: {str(ve)}")
        return jsonify({"error": f"Failed to create product: {str(ve)}"}), 400
    except Exception as e:
        current_app.logger.error(f"Erro inesperado ao criar produto: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": f"Failed to create product due to an internal server error."}), 500

    current_app.logger.info(f"Produto ID {product.id} criado com sucesso.")
    return jsonify({
        "data": product.serialize(),
        "message": "Product created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    product = get_product(id)
    if product is None:
        return jsonify({"error": "Product not found"}), 404

    return jsonify({
        "data": product.serialize(),
        "message": "Product retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    products = Product.query.all()
    products_data = [product.serialize() for product in products]

    return jsonify({
        "data": products_data,
        "message": "Products retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    if 'currency_id' in data:
        currency_id_to_check = data.get('currency_id')
        if currency_id_to_check is None:
            return jsonify({"error": "currency_id cannot be set to null."}), 400
        try:
            currency = Currency.query.get(int(currency_id_to_check))
            if not currency:
                current_app.logger.warning(f"Tentativa de atualizar produto {id} com currency_id inválido: {currency_id_to_check}")
                return jsonify({"error": f"Invalid currency_id: {currency_id_to_check} not found."}), 400
        except (ValueError, TypeError):
            current_app.logger.warning(f"Valor inválido recebido para currency_id na atualização: {currency_id_to_check}")
            return jsonify({"error": f"Invalid format for currency_id: must be an integer."}), 400

    try:
        product = update_product(id, data)
        if product is None:
            return jsonify({"error": "Product not found"}), 404
    except ValueError as ve:
        current_app.logger.error(f"Erro de validação ao atualizar produto {id}: {str(ve)}")
        return jsonify({"error": f"Failed to update product: {str(ve)}"}), 400
    except Exception as e:
        current_app.logger.error(f"Erro inesperado ao atualizar produto {id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": f"Failed to update product due to an internal server error."}), 500

    current_app.logger.info(f"Produto ID {id} atualizado com sucesso.")
    return jsonify({
        "data": product.serialize(),
        "message": "Product updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    try:
        product = delete_product(id)
        if product is None:
            return jsonify({"error": "Product not found"}), 404
    except Exception as e:
        current_app.logger.error(f"Erro inesperado ao deletar produto {id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": f"Failed to delete product due to an internal server error."}), 500

    current_app.logger.info(f"Produto ID {id} deletado com sucesso.")
    return jsonify({
        "message": "Product deleted successfully."
    }), 200 