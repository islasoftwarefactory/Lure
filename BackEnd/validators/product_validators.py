from .common_validators import validate_required_fields, validate_string_length, validate_positive_number

def validate_product_creation(data):
    errors = []
    
    required_error = validate_required_fields(data, ["name", "price", "description", "inventory"])
    if required_error:
        errors.append(required_error)
    
    name_error = validate_string_length(data.get("name", ""), "name", 100)
    if name_error:
        errors.append(name_error)
    
    description_error = validate_string_length(data.get("description", ""), "description", 500)
    if description_error:
        errors.append(description_error)
    
    price_error = validate_positive_number(data.get("price"), "price")
    if price_error:
        errors.append(price_error)
    
    inventory_error = validate_positive_number(data.get("inventory"), "inventory")
    if inventory_error:
        errors.append(inventory_error)
    
    return errors