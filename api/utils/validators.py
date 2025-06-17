"""
Shared validation utilities for the application
"""
import re
from typing import Dict, Tuple

# Allowed email providers for validation
ALLOWED_EMAIL_PROVIDERS = {
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
    'aol.com',
    'mail.com',
    'zoho.com',
    'protonmail.com',
    'gmx.com'
}

def validate_email_format(email: str) -> Tuple[bool, str]:
    """
    Validates basic email format using regex
    Args:
        email: The email address to validate
    Returns:
        tuple: (is_valid, error_message)
    """
    if not email or not isinstance(email, str):
        return False, "Email is required"
    
    # Basic email regex pattern
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(email_pattern, email):
        return False, "Invalid email format"
    
    return True, ""

def validate_email_provider(email: str) -> Tuple[bool, str]:
    """
    Validates if the email provider is in the allowed list
    Args:
        email: The email address to validate
    Returns:
        tuple: (is_valid, error_message)
    """
    try:
        # Extract domain from email
        domain = email.split('@')[1].lower()
        if domain not in ALLOWED_EMAIL_PROVIDERS:
            return False, f"Email provider '{domain}' is not allowed. Please use one of: {', '.join(sorted(ALLOWED_EMAIL_PROVIDERS))}"
        return True, ""
    except IndexError:
        return False, "Invalid email format"

def validate_email_complete(email: str) -> Tuple[bool, str]:
    """
    Complete email validation including format and provider
    Args:
        email: The email address to validate
    Returns:
        tuple: (is_valid, error_message)
    """
    # First check format
    is_valid_format, format_error = validate_email_format(email)
    if not is_valid_format:
        return False, format_error
    
    # Then check provider
    is_valid_provider, provider_error = validate_email_provider(email)
    if not is_valid_provider:
        return False, provider_error
    
    return True, ""

def validate_contact_data(data: Dict) -> Tuple[bool, str]:
    """
    Validates contact form data
    Args:
        data: Dictionary containing contact form data
    Returns:
        tuple: (is_valid, error_message)
    """
    required_fields = ["full_name", "email", "message"]
    
    # Check required fields
    for field in required_fields:
        if field not in data or not data[field]:
            return False, f"Missing required field: {field}"
    
    # Validate email
    is_valid_email, email_error = validate_email_complete(data["email"])
    if not is_valid_email:
        return False, email_error
    
    # Validate name length
    if len(data["full_name"].strip()) < 2:
        return False, "Full name must be at least 2 characters"
    
    # Validate message length
    if len(data["message"].strip()) < 10:
        return False, "Message must be at least 10 characters"
    
    return True, "" 