from .common_validators import validate_string_length, validate_required_field, validate_enum
from typing import Dict, List, Tuple

def validate_user_name(name: str) -> Tuple[bool, str]:
    is_valid, message = validate_required_field(name)
    if not is_valid:
        return False, message
    
    return validate_string_length(name, 40)

def validate_user_email(email: str) -> Tuple[bool, str]:
    is_valid, message = validate_required_field(email)
    if not is_valid:
        return False, message
    
    return validate_string_length(email, 256)

def validate_user_photo(photo: str) -> Tuple[bool, str]:
    if photo is None:
        return True, ""  # Photo is optional
    return validate_string_length(photo, 256)

def validate_sso_type(sso_type: str) -> Tuple[bool, str]:
    is_valid, message = validate_required_field(sso_type)
    if not is_valid:
        return False, message
    
    return validate_enum(sso_type, ['Google', 'Apple'])

def validate_user_creation(user_data: Dict) -> List[str]:
    errors = []

    name_valid, name_message = validate_user_name(user_data.get('name'))
    if not name_valid:
        errors.append(f"Nome: {name_message}")

    email_valid, email_message = validate_user_email(user_data.get('email'))
    if not email_valid:
        errors.append(f"Email: {email_message}")

    photo_valid, photo_message = validate_user_photo(user_data.get('photo'))
    if not photo_valid:
        errors.append(f"Foto: {photo_message}")

    sso_valid, sso_message = validate_sso_type(user_data.get('sso_type'))
    if not sso_valid:
        errors.append(f"Tipo de SSO: {sso_message}")

    return errors

def validate_user_update(user_data: Dict) -> List[str]:
    errors = []

    if 'name' in user_data:
        name_valid, name_message = validate_user_name(user_data['name'])
        if not name_valid:
            errors.append(f"Nome: {name_message}")

    if 'email' in user_data:
        email_valid, email_message = validate_user_email(user_data['email'])
        if not email_valid:
            errors.append(f"Email: {email_message}")

    if 'photo' in user_data:
        photo_valid, photo_message = validate_user_photo(user_data['photo'])
        if not photo_valid:
            errors.append(f"Foto: {photo_message}")

    if 'sso_type' in user_data:
        sso_valid, sso_message = validate_sso_type(user_data['sso_type'])
        if not sso_valid:
            errors.append(f"Tipo de SSO: {sso_message}")

    return errors