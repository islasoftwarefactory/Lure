from .common_validators import validate_required_fields, validate_string_length, validate_positive_number

def validate_discount_creation(data):
    errors = []
    
    required_error = validate_required_fields(data, ["name", "description", "value"])
    if required_error:
        errors.append(required_error)
    
    name_error = validate_string_length(data.get("name", ""), "name", 50)
    if name_error:
        errors.append(name_error)
    
    description_error = validate_string_length(data.get("description", ""), "description", 200)
    if description_error:
        errors.append(description_error)
    
    value_error = validate_positive_number(data.get("value"), "value")
    if value_error:
        errors.append(value_error)
    
    return errors