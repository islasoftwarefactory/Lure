from flask import request, jsonify, Blueprint
from flask_mail import Mail, Message
from api.contact.model import Contact, create_contact, get_contact, get_all_contacts
from api.utils.jwt.decorators import token_required
import os
from dotenv import load_dotenv

load_dotenv()

blueprint = Blueprint('contact', __name__)
mail = Mail()

@blueprint.route("/create", methods=["POST"])
def create():
    data = request.get_json()

    if not data or not all(field in data for field in ["full_name", "email", "message"]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Criar contato no banco de dados
        contact = create_contact(data)

        # Enviar email
        msg = Message(
            subject=f'Nova Mensagem de Contato - LURE Fashion',
            sender='cmigxell775@gmail.com',
            recipients=['cmigxell775@gmail.com'],
            body=f"""
            ✨ Nova mensagem recebida através do site LURE Fashion ✨
            
            📝 Detalhes do Contato:
            
            Nome Completo: {data['full_name']}
            Email: {data['email']}
            Telefone: {data.get('phone', 'Não informado')}
            
            💬 Mensagem:
            {data['message']}
            
            --
            Esta mensagem foi enviada através do formulário de contato do site LURE Fashion.
            """
        )
        mail.send(msg)

        return jsonify({
            "data": contact.serialize(),
            "message": "Contact message sent successfully and email notification sent."
        }), 201

    except Exception as e:
        return jsonify({"error": f"Failed to process contact: {str(e)}"}), 500

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