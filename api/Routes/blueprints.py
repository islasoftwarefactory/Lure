from .User.CRUD.create import blueprint as create_user_blueprint
from .User.CRUD.read import blueprint as read_user_blueprint
from .User.CRUD.update import blueprint as update_user_blueprint
from .User.CRUD.delete import blueprint as delete_user_blueprint

from .Address.CRUD.create import blueprint as create_address_blueprint
from .Address.CRUD.read import blueprint as read_address_blueprint
from .Address.CRUD.update import blueprint as update_address_blueprint
from .Address.CRUD.delete import blueprint as delete_address_blueprint

from .Category.CRUD.create import blueprint as create_category_blueprint
from .Category.CRUD.read import blueprint as read_category_blueprint
from .Category.CRUD.update import blueprint as update_category_blueprint
from .Category.CRUD.delete import blueprint as delete_category_blueprint

from .Discount.CRUD.create import blueprint as create_discount_blueprint
from .Discount.CRUD.read import blueprint as read_discount_blueprint
from .Discount.CRUD.update import blueprint as update_discount_blueprint
from .Discount.CRUD.delete import blueprint as delete_discount_blueprint

from .Gender.CRUD.create import blueprint as create_gender_blueprint
from .Gender.CRUD.read import blueprint as read_gender_blueprint
from .Gender.CRUD.update import blueprint as update_gender_blueprint
from .Gender.CRUD.delete import blueprint as delete_gender_blueprint

from .Payment.CRUD.create import blueprint as create_payment_blueprint
from .Payment.CRUD.read import blueprint as read_payment_blueprint
from .Payment.CRUD.update import blueprint as update_payment_blueprint
from .Payment.CRUD.delete import blueprint as delete_payment_blueprint

from .PaymentMethod.CRUD.create import blueprint as create_payment_method_blueprint
from .PaymentMethod.CRUD.read import blueprint as read_payment_method_blueprint
from .PaymentMethod.CRUD.update import blueprint as update_payment_method_blueprint
from .PaymentMethod.CRUD.delete import blueprint as delete_payment_method_blueprint

from .Product.CRUD.create import blueprint as create_product_blueprint
from .Product.CRUD.read import blueprint as read_product_blueprint
from .Product.CRUD.update import blueprint as update_product_blueprint
from .Product.CRUD.delete import blueprint as delete_product_blueprint

from .Size.CRUD.create import blueprint as create_size_blueprint
from .Size.CRUD.read import blueprint as read_size_blueprint
from .Size.CRUD.update import blueprint as update_size_blueprint
from .Size.CRUD.delete import blueprint as delete_size_blueprint

from .Cart.CRUD.create import blueprint as create_cart_blueprint
from .Cart.CRUD.read import blueprint as read_cart_blueprint
from .Cart.CRUD.update import blueprint as update_cart_blueprint
from .Cart.CRUD.delete import blueprint as delete_cart_blueprint

from .ImageCategory.CRUD.create import blueprint as create_image_category
from .ImageCategory.CRUD.read import blueprint as read_image_category
from .ImageCategory.CRUD.update import blueprint as update_image_category
from .ImageCategory.CRUD.delete import blueprint as delete_image_category

from .Auth.anonymous_token import blueprint as anonymous_token_blueprint


def register_blueprints(app):
    app.register_blueprint(create_user_blueprint, url_prefix="/user")
    app.register_blueprint(read_user_blueprint, url_prefix="/user")
    app.register_blueprint(update_user_blueprint, url_prefix="/user")
    app.register_blueprint(delete_user_blueprint, url_prefix="/user")
    app.register_blueprint(anonymous_token_blueprint, url_prefix="/auth")

    app.register_blueprint(create_address_blueprint, url_prefix="/address")
    app.register_blueprint(read_address_blueprint, url_prefix="/address")
    app.register_blueprint(update_address_blueprint, url_prefix="/address")
    app.register_blueprint(delete_address_blueprint, url_prefix="/address")
    
    app.register_blueprint(create_category_blueprint, url_prefix="/category")
    app.register_blueprint(read_category_blueprint, url_prefix="/category")
    app.register_blueprint(update_category_blueprint, url_prefix="/category")
    app.register_blueprint(delete_category_blueprint, url_prefix="/category")
    
    app.register_blueprint(create_discount_blueprint, url_prefix="/discount")
    app.register_blueprint(read_discount_blueprint, url_prefix="/discount")
    app.register_blueprint(update_discount_blueprint, url_prefix="/discount")
    app.register_blueprint(delete_discount_blueprint, url_prefix="/discount")
    
    app.register_blueprint(create_gender_blueprint, url_prefix="/gender")
    app.register_blueprint(read_gender_blueprint, url_prefix="/gender")
    app.register_blueprint(update_gender_blueprint, url_prefix="/gender")
    app.register_blueprint(delete_gender_blueprint, url_prefix="/gender")
    
    app.register_blueprint(create_payment_blueprint, url_prefix="/payment")
    app.register_blueprint(read_payment_blueprint, url_prefix="/payment")
    app.register_blueprint(update_payment_blueprint, url_prefix="/payment")
    app.register_blueprint(delete_payment_blueprint, url_prefix="/payment")
    
    app.register_blueprint(create_payment_method_blueprint, url_prefix="/payment_method")
    app.register_blueprint(read_payment_method_blueprint, url_prefix="/payment_method")
    app.register_blueprint(update_payment_method_blueprint, url_prefix="/payment_method")
    app.register_blueprint(delete_payment_method_blueprint, url_prefix="/payment_method")
    
    app.register_blueprint(create_product_blueprint, url_prefix="/product")
    app.register_blueprint(read_product_blueprint, url_prefix="/product")
    app.register_blueprint(update_product_blueprint, url_prefix="/product")
    app.register_blueprint(delete_product_blueprint, url_prefix="/product")
    
    app.register_blueprint(create_size_blueprint, url_prefix="/size")
    app.register_blueprint(read_size_blueprint, url_prefix="/size")
    app.register_blueprint(update_size_blueprint, url_prefix="/size")
    app.register_blueprint(delete_size_blueprint, url_prefix="/size")

    app.register_blueprint(create_cart_blueprint, url_prefix="/cart")
    app.register_blueprint(read_cart_blueprint, url_prefix="/cart")
    app.register_blueprint(update_cart_blueprint, url_prefix="/cart")
    app.register_blueprint(delete_cart_blueprint, url_prefix="/cart")

    app.register_blueprint(create_image_category, url_prefix="/image_category")
    app.register_blueprint(read_image_category, url_prefix="/image_category")
    app.register_blueprint(update_image_category, url_prefix="/image_category")
    app.register_blueprint(delete_image_category, url_prefix="/image_category")