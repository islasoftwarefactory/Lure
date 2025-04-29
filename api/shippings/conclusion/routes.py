from flask import request, jsonify, Blueprint, current_app
from api.shippings.conclusion.model import ShippingConclusion, create_shipping_conclusion, update_shipping_conclusion, delete_shipping_conclusion, find_shipping_conclusion_by_id
from api.utils.jwt.decorators import token_required

blueprint = Blueprint('shipping_conclusion', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
@token_required
def create():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    try:
        shipping_conclusion = create_shipping_conclusion(data)
        return jsonify({
            "data": shipping_conclusion.serialize(),
            "message": "Shipping conclusion created successfully."
        }), 201
    except Exception as e:
        current_app.logger.error(f"Error creating shipping conclusion: {str(e)}")
        return jsonify({"error": str(e)}), 400

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(id):
    shipping_conclusion = find_shipping_conclusion_by_id(id)
    if shipping_conclusion is None:
        return jsonify({"error": "Shipping conclusion not found"}), 404

    return jsonify({
        "data": shipping_conclusion.serialize(),
        "message": "Shipping conclusion retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    try:
        shipping_conclusion = update_shipping_conclusion(id, data)
        if shipping_conclusion is None:
            return jsonify({"error": "Shipping conclusion not found"}), 404

        return jsonify({
            "data": shipping_conclusion.serialize(),
            "message": "Shipping conclusion updated successfully."
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error updating shipping conclusion: {str(e)}")
        return jsonify({"error": str(e)}), 400

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(id):
    deleted = delete_shipping_conclusion(id)
    if not deleted:
        return jsonify({"error": "Shipping conclusion not found"}), 404

    return jsonify({
        "message": "Shipping conclusion deleted successfully."
    }), 200
