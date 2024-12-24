from flask import request, jsonify, Blueprint
from api.discount.model import Discount, create_discount, get_discount, update_discount, delete_discount
from api.utils.jwt.decorators import token_required

blueprint = Blueprint('discount', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
@token_required
def create(current_user_id):
    data = request.get_json()

    if not data or not all(field in data for field in ["name", "description", "value", "allowed_product_id"]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        discount = create_discount(data)
    except Exception as e:
        return jsonify({"error": f"Failed to create discount: {str(e)}"}), 500

    return jsonify({
        "data": discount.serialize(),
        "message": "Discount created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    discount = get_discount(id)
    if discount is None:
        return jsonify({"error": "Discount not found"}), 404

    return jsonify({
        "data": discount.serialize(),
        "message": "Discount retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    discounts = Discount.query.all()
    discounts_data = [discount.serialize() for discount in discounts]

    return jsonify({
        "data": discounts_data,
        "message": "Discounts retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
    data = request.get_json()

    try:
        discount = update_discount(id, data)
        if discount is None:
            return jsonify({"error": "Discount not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to update discount: {str(e)}"}), 500

    return jsonify({
        "data": discount.serialize(),
        "message": "Discount updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    try:
        discount = delete_discount(id)
        if discount is None:
            return jsonify({"error": "Discount not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to delete discount: {str(e)}"}), 500

    return jsonify({
        "message": "Discount deleted successfully."
    }), 200 