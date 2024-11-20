from .common_validators import validate_required_fields, validate_string_length

def validate_category_creation(data):
    errors = []
    
    required_error = validate_required_fields(data, ["name"])
    if required_error:
        errors.append(required_error)
    
    name_error = validate_string_length(data.get("name", ""), "name", 50)
    if name_error:
        errors.append(name_error)
    
    return errors


def validate_category_update(data):
    errors = []
    
    return errors