from typing import Optional
from flask import current_app
from api.user.model import User, create_user, find_user_by_email
from api.auth_providers.model import get_auth_provider_by_name

def create_ghost_user(email: str, name: str) -> User:
    """
    Cria um usuário ghost para checkout sem login.
    Primeiro verifica se já existe um usuário ghost com o mesmo email.
    """
    ghost_provider = get_auth_provider_by_name('Ghost')
    if not ghost_provider:
        raise ValueError("Provedor Ghost não encontrado. Execute create_tables.py primeiro.")
    
    # Verificar se já existe um usuário ghost com este email
    existing_ghost = User.query.filter_by(
        email=email, 
        auth_provider_id=ghost_provider.id,
        provider_id=None
    ).first()
    
    if existing_ghost:
        current_app.logger.info(f"Reutilizando usuário ghost existente para email: {email}")
        return existing_ghost
    
    # Criar novo usuário ghost
    ghost_data = {
        'name': name,
        'email': email,
        'auth_provider_id': ghost_provider.id,
        'provider_id': None
    }
    
    ghost_user = create_user(ghost_data)
    current_app.logger.info(f"Usuário ghost criado para email: {email}")
    return ghost_user

def find_or_create_ghost_user(email: str, name: str) -> User:
    """
    Busca ou cria um usuário ghost.
    Wrapper convenience function.
    """
    return create_ghost_user(email, name)