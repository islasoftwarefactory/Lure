from flask import request, jsonify, Blueprint
from api.Database.Models.Discount import Discount
from api.Database.connection import db
from api.validators.discount_validators import validate_discount_creation, validate_discount_update
from api.utils.decorators import token_required

blueprint = Blueprint('discount', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
@token_required
def create(current_user_id):
    data = request.get_json()

    validation_errors = validate_discount_creation(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    discount = Discount(
        name=data["name"],
        description=data["description"],
        discount_percent=data["discount_percent"],
        start_date=data["start_date"],
        end_date=data["end_date"]
    )

    try:
        db.session.add(discount)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create discount: {str(e)}"}), 500

    return jsonify({
        "data": discount.serialize(),
        "message": "Discount created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    discount = Discount.query.get(id)
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
    discount = Discount.query.get(id)
    if discount is None:
        return jsonify({"error": "Discount not found"}), 404

    data = request.get_json()

    validation_errors = validate_discount_update(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    for field in ("name", "description", "discount_percent", "start_date", "end_date"):
        if field in data:
            setattr(discount, field, data[field])

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update discount: {str(e)}"}), 500

    return jsonify({
        "data": discount.serialize(),
        "message": "Discount updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    discount = Discount.query.get(id)
    if discount is None:
        return jsonify({"error": "Discount not found"}), 404

    try:
        db.session.delete(discount)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete discount: {str(e)}"}), 500

    return jsonify({
        "message": "Discount deleted successfully."
    }), 200 