from flask import request, jsonify, Blueprint
from api.scraping.model import Scraping, create_scraping, get_scraping, update_scraping, delete_scraping
from api.scraping.type.model import ContactType


blueprint = Blueprint('scraping', __name__)

# Contact Type Routes
@blueprint.route("/contact-types", methods=["GET"])
def get_contact_types():
    """Get all active contact types"""
    contact_types = ContactType.query.filter_by(disabled=False).all()
    return jsonify({
        "data": [ct.serialize() for ct in contact_types],
        "message": "Contact types retrieved successfully."
    }), 200

# Create
@blueprint.route("/create", methods=["POST"])
def create():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Verificar se o contact_type_id é válido
    if "contact_type_id" in data:
        contact_type = ContactType.query.get(data["contact_type_id"])
        if not contact_type:
            return jsonify({"error": "Invalid contact type ID"}), 400
        if contact_type.disabled:
            return jsonify({"error": "This contact type is disabled"}), 400

    try:
        scraping = create_scraping(data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to create scraping entry: {str(e)}"}), 500

    return jsonify({
        "data": scraping.serialize(),
        "message": "Scraping entry created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
def read(id):
    scraping = get_scraping(id)
    if scraping is None:
        return jsonify({"error": "Scraping entry not found"}), 404

    return jsonify({
        "data": scraping.serialize(),
        "message": "Scraping entry retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
def read_all():
    scrapings = Scraping.query.all()
    scrapings_data = [scraping.serialize() for scraping in scrapings]

    return jsonify({
        "data": scrapings_data,
        "message": "Scraping entries retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    data = request.get_json()

    # Verificar se o contact_type_id é válido (se estiver sendo atualizado)
    if "contact_type_id" in data:
        contact_type = ContactType.query.get(data["contact_type_id"])
        if not contact_type:
            return jsonify({"error": "Invalid contact type ID"}), 400
        if contact_type.disabled:
            return jsonify({"error": "This contact type is disabled"}), 400

    try:
        scraping = update_scraping(id, data)
        if scraping is None:
            return jsonify({"error": "Scraping entry not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to update scraping entry: {str(e)}"}), 500

    return jsonify({
        "data": scraping.serialize(),
        "message": "Scraping entry updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    try:
        scraping = delete_scraping(id)
        if scraping is None:
            return jsonify({"error": "Scraping entry not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to delete scraping entry: {str(e)}"}), 500

    return jsonify({
        "message": "Scraping entry deleted successfully."
    }), 200