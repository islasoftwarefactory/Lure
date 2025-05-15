from flask import request, jsonify, Blueprint
from api.scraping.type.model import ContactType
from api.utils.db.connection import db
from flask import current_app

blueprint = Blueprint('contact_type', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
def create():
    """Create a new contact type"""
    print(f"Endpoint: {request.endpoint}")  # Debug print
    print(f"Path: {request.path}")         # Debug print
    data = request.get_json()
    
    if not data or "name" not in data:
        return jsonify({"error": "Name is required"}), 400
        
    # Verificar se já existe um tipo com este nome
    existing = ContactType.query.filter_by(name=data["name"]).first()
    if existing:
        return jsonify({"error": "Contact type with this name already exists"}), 400
    
    try:
        # Converter o valor de disabled para boolean
        disabled_value = False
        if "disabled" in data:
            if isinstance(data["disabled"], str):
                disabled_value = data["disabled"].lower() in ['true', '1', 't', 'y', 'yes']
            else:
                disabled_value = bool(data["disabled"])

        contact_type = ContactType(
            name=data["name"],
            disabled=disabled_value
        )
        db.session.add(contact_type)
        db.session.commit()
        
        return jsonify({
            "data": contact_type.serialize(),
            "message": "Contact type created successfully"
        }), 201
        
    except Exception as e:
        db.session.rollback()
        error_message = f"Failed to create contact type. Error: {str(e)}"
        current_app.logger.error(error_message)
        return jsonify({"error": error_message}), 500

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
def read(id):
    """Get a specific contact type"""
    contact_type = ContactType.query.get(id)
    if not contact_type:
        return jsonify({"error": "Contact type not found"}), 404
        
    return jsonify({
        "data": contact_type.serialize(),
        "message": "Contact type retrieved successfully"
    }), 200

@blueprint.route("/read/all", methods=["GET"])
def read_all():
    """Get all contact types"""
    contact_types = ContactType.query.all()
    return jsonify({
        "data": [ct.serialize() for ct in contact_types],
        "message": "Contact types retrieved successfully"
    }), 200

@blueprint.route("/read/active", methods=["GET"])
def read_active():
    """Get all active contact types"""
    contact_types = ContactType.query.filter_by(disabled=False).all()
    return jsonify({
        "data": [ct.serialize() for ct in contact_types],
        "message": "Active contact types retrieved successfully"
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
def update(id):
    """Update a contact type"""
    contact_type = ContactType.query.get(id)
    if not contact_type:
        return jsonify({"error": "Contact type not found"}), 404
        
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    try:
        # Verificar se o novo nome já existe (se estiver sendo atualizado)
        if "name" in data and data["name"] != contact_type.name:
            existing = ContactType.query.filter_by(name=data["name"]).first()
            if existing:
                return jsonify({"error": "Contact type with this name already exists"}), 400
            contact_type.name = data["name"]
            
        if "disabled" in data:
            contact_type.disabled = data["disabled"]
            
        db.session.commit()
        
        return jsonify({
            "data": contact_type.serialize(),
            "message": "Contact type updated successfully"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating contact type: {str(e)}")
        return jsonify({"error": "Failed to update contact type"}), 500

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    """Delete a contact type"""
    contact_type = ContactType.query.get(id)
    if not contact_type:
        return jsonify({"error": "Contact type not found"}), 404
        
    try:
        # Verificar se existem scrapings usando este tipo
        if contact_type.scrapings:
            # Ao invés de deletar, apenas desabilita
            contact_type.disabled = True
            db.session.commit()
            return jsonify({
                "message": "Contact type has associated records. It has been disabled instead of deleted."
            }), 200
        
        db.session.delete(contact_type)
        db.session.commit()
        
        return jsonify({
            "message": "Contact type deleted successfully"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting contact type: {str(e)}")
        return jsonify({"error": "Failed to delete contact type"}), 500 