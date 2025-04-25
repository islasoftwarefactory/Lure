from flask import request, jsonify, Blueprint
from api.cart.model import Cart, create_cart, get_cart, update_cart, delete_cart
from api.size.model import Size
from api.utils.jwt.decorators import token_required, optional_token_required
from flask import current_app

blueprint = Blueprint('cart', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
@optional_token_required
def create(current_user_id=None):
    # --- Log 1: Dados recebidos ---
    try:
        data = request.get_json()
        current_app.logger.info(f"[CART CREATE / START] Received data: {data}") # Log inicial
    except Exception as e:
        current_app.logger.error(f"[CART CREATE / ERROR] Failed to parse JSON body: {str(e)}")
        return jsonify({"error": "Invalid JSON data"}), 400
    # --- Fim Log 1 ---

    # Validação
    if not data or "product_id" not in data or "size" not in data:
        error_msg = "Missing required fields (product_id, size)"
        current_app.logger.warning(f"[CART CREATE / VALIDATION FAIL] {error_msg}. Data received: {data}")
        return jsonify({"error": error_msg}), 400

    try:
        # --- Log 2: Extraindo nome do tamanho ---
        size_name = data['size']
        current_app.logger.info(f"[CART CREATE / SIZE LOOKUP] Attempting to find size for name: '{size_name}'")
        # --- Fim Log 2 ---

        # Buscar Size ID
        size_object = Size.query.filter_by(name=size_name).first()

        # --- Log 3: Resultado da busca do tamanho ---
        if not size_object:
            error_msg = f"Invalid size provided: {size_name}"
            current_app.logger.warning(f"[CART CREATE / SIZE NOT FOUND] {error_msg}")
            return jsonify({"error": error_msg}), 400
        else:
            found_size_id = size_object.id
            current_app.logger.info(f"[CART CREATE / SIZE FOUND] Found size '{size_name}' with ID: {found_size_id}")
        # --- Fim Log 3 ---

        # Preparar dados para o modelo
        cart_data = {
            "user_id": current_user_id,
            "product_id": data["product_id"],
            "size_id": found_size_id,
            "quantity": data.get("quantity", 1),
            "status": True
        }

        # --- Log 4: Dados antes de chamar create_cart ---
        current_app.logger.info(f"[CART CREATE / PREPARED DATA] Data being passed to create_cart: {cart_data}")
        # --- Fim Log 4 ---

        # Chamar a função de criação do modelo
        cart = create_cart(cart_data) # create_cart já tem logs internos

        # --- Log 5: Dados serializados antes da resposta ---
        serialized_cart = cart.serialize()
        current_app.logger.info(f"[CART CREATE / SUCCESS] Cart created. Serialized data for response: {serialized_cart}")
        # --- Fim Log 5 ---

        return jsonify({
            "data": serialized_cart,
            "message": "Cart created successfully."
        }), 201

    except Exception as e:
        # --- Log 6: Erro geral no processo ---
        # O logger dentro de create_cart deve pegar erros específicos da DB
        # Este pega erros na lógica da rota (busca de size, etc.)
        current_app.logger.error(f"[CART CREATE / ERROR] Unexpected error during cart creation process: {str(e)}", exc_info=True) # exc_info=True adiciona traceback
        # --- Fim Log 6 ---
        return jsonify({"error": f"Failed to create cart: An internal error occurred."}), 500 # Mensagem genérica para o cliente

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    cart = get_cart(id)
    if cart is None:
        return jsonify({"error": "Cart not found"}), 404

    return jsonify({
        "data": cart.serialize(),
        "message": "Cart retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    carts = Cart.query.filter_by(user_id=current_user_id, status=True).all()
    carts_data = [cart.serialize() for cart in carts]

    return jsonify({
        "data": carts_data,
        "message": "User cart retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
    data = request.get_json()

    try:
        cart = update_cart(id, data)
        if cart is None:
            return jsonify({"error": "Cart not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to update cart: {str(e)}"}), 500

    return jsonify({
        "data": cart.serialize(),
        "message": "Cart updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    try:
        cart = delete_cart(id)
        if cart is None:
            return jsonify({"error": "Cart not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to delete cart: {str(e)}"}), 500

    return jsonify({
        "message": "Cart deleted successfully."
    }), 200

@blueprint.route("/migrate", methods=["POST"])
@token_required
def migrate_anonymous_cart(current_user_id):
    """Migrate anonymous cart items to user's cart after login"""
    data = request.get_json()
    anonymous_cart_items = data.get("cart_items", [])
    
    migrated_items = []
    try:
        for item in anonymous_cart_items:
            cart_data = {
                "user_id": current_user_id,
                "product_id": item["product_id"],
                "size_id": item["size_id"],
                "quantity": item["quantity"],
                "status": True
            }
            cart = create_cart(cart_data)
            migrated_items.append(cart.serialize())
            
        return jsonify({
            "data": migrated_items,
            "message": "Cart items migrated successfully"
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to migrate cart items: {str(e)}"}), 500