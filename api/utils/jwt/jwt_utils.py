from datetime import datetime, timedelta
from dotenv import load_dotenv
import jwt
import os
from pathlib import Path
from flask import current_app
import traceback

# Load .env - Assuming this path is correct relative to jwt_utils.py
# Consider moving .env loading to your main app entry point for better practice
env_path = Path(__file__).resolve().parent.parent.parent / '.env' # Adjusted path assumption
load_dotenv(dotenv_path=env_path)

# Load JWT config from environment variables at the module level
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", "1440")) # Keep default if needed

# --- Check if JWT_SECRET_KEY was loaded ---
if not JWT_SECRET_KEY:
    # This will stop the application from starting if the key is missing
    raise ValueError("Fatal Error: JWT_SECRET_KEY environment variable not set.")
# --- End Check ---

def generate_token(user_id):
    """Generate a JWT token for a user"""
    current_app.logger.debug(f"Attempting to generate token using module's JWT_SECRET_KEY.")

    try:
        payload = {
            # Use JWT_EXPIRATION_MINUTES loaded from env
            'exp': datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION_MINUTES),
            'iat': datetime.utcnow(),
            'sub': str(user_id)
        }
        # Use the module-level JWT_SECRET_KEY directly
        token = jwt.encode(
            payload,
            JWT_SECRET_KEY,
            algorithm='HS256'
        )
        current_app.logger.debug("Token generated successfully.")
        return token
    except Exception as e:
        error_details = traceback.format_exc()
        current_app.logger.error(f"Error during JWT generation: {str(e)}\n{error_details}")
        return f"Error generating token: {str(e)}"

def verify_token(token):
    """Verify if a token is valid"""
    try:
        # Use the module-level JWT_SECRET_KEY directly
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=['HS256']
        )
        # Return user_id directly upon success, consistent with decorator usage
        return payload['sub']
    except jwt.ExpiredSignatureError:
        current_app.logger.warning("Token verification failed: ExpiredSignatureError")
        # Raise an exception or return None/False as needed by the calling code (decorator)
        # The decorator expects verify_token to return user_id on success or raise error/return None on failure
        raise jwt.ExpiredSignatureError('Token expired. Please log in again.')
    except jwt.InvalidTokenError as e:
        current_app.logger.warning(f"Token verification failed: InvalidTokenError - {str(e)}")
        raise jwt.InvalidTokenError('Invalid token. Please log in again.')


def decode_token(token):
    """Decode a JWT token and return the user_id (handles verification implicitly)"""
    try:
        # Use the module-level JWT_SECRET_KEY directly
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=['HS256']
        )
        return payload['sub']
    except jwt.ExpiredSignatureError:
        raise Exception('Token expired') # Keep raising exceptions as before
    except jwt.InvalidTokenError:
        raise Exception('Invalid token')