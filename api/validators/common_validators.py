from typing import Any, List, Tuple

def validate_string_length(value: str, max_length: int) -> Tuple[bool, str]:
    if len(value) > max_length:
        return False, f"O valor excede o limite de {max_length} caracteres. Atualmente tem {len(value)} caracteres."
    return True, ""

def validate_required_field(value: Any) -> Tuple[bool, str]:
    if value is None or (isinstance(value, str) and value.strip() == ""):
        return False, "Este campo é obrigatório."
    return True, ""

def validate_enum(value: str, valid_options: List[str]) -> Tuple[bool, str]:
    if value not in valid_options:
        return False, f"Valor inválido. Opções válidas são: {', '.join(valid_options)}."
    return True, ""

def validate_required_fields(data, required_fields):
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return f"Missing required fields: {', '.join(missing_fields)}"
    return None

def validate_string_length(value, field_name, max_length):
    if len(value) > max_length:
        return f"{field_name} must be at most {max_length} characters long"
    return None

def validate_positive_number(value, field_name):
    if not isinstance(value, (int, float)) or value <= 0:
        return f"{field_name} must be a positive number"
    return None