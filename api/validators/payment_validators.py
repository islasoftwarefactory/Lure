from .common_validators import validate_required_fields, validate_positive_number, validate_string_length

def validate_payment_creation(data):
    errors = []
    
    required_error = validate_required_fields(data, ["total", "checkout_url", "status"])
    if required_error:
        errors.append(required_error)
    
    total_error = validate_positive_number(data.get("total"), "total")
    if total_error:
        errors.append(total_error)
    
    checkout_url_error = validate_string_length(data.get("checkout_url", ""), "checkout_url", 255)
    if checkout_url_error:
        errors.append(checkout_url_error)
    
    status_error = validate_string_length(data.get("status", ""), "status", 50)
    if status_error:
        errors.append(status_error)
    
    return errors

def validate_payment_update(data):
    errors = []
    
    return errors