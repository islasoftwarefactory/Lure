from flask import request, jsonify, Blueprint
from api.contact.model import Contact, create_contact, get_contact, get_all_contacts
from api.utils.security.jwt.decorators import token_required
blueprint = Blueprint('contact', __name__)

@blueprint.route("/create", methods=["POST"])
def create():
    data = request.get_json()

    if not data or not all(field in data for field in ["full_name", "email", "message"]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        contact = create_contact(data)
    except Exception as e:
        return jsonify({"error": f"Failed to create contact: {str(e)}"}), 500

    return jsonify({
        "data": contact.serialize(),
        "message": "Contact message sent successfully."
    }), 201

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    contacts = get_all_contacts()
    contacts_data = [contact.serialize() for contact in contacts]

    return jsonify({
        "data": contacts_data,
        "message": "Contacts retrieved successfully."
    }), 200

@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    contact = get_contact(id)
    if contact is None:
        return jsonify({"error": "Contact not found"}), 404

    return jsonify({
        "data": contact.serialize(),
        "message": "Contact retrieved successfully."
    }), 200 