import pytest
from ..utils.jwt_utils import generate_token, verify_token
import os
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

def test_generate_and_verify_token():
    user_id = 1
    token = generate_token(user_id)
    assert token is not None
    
    decoded_user_id = verify_token(token)
    assert decoded_user_id == user_id

def test_invalid_token():
    invalid_token = "invalid.token.here"
    decoded_user_id = verify_token(invalid_token)
    assert decoded_user_id is None

# Add more tests as needed