from api.address.routes import blueprint as address_blueprint
from api.cart.routes import blueprint as cart_blueprint
from api.category.routes import blueprint as category_blueprint
from api.gender.routes import blueprint as gender_blueprint
from api.image_category.routes import blueprint as image_category_blueprint
from api.scraping.routes import blueprint as scraping_blueprint
from api.user.routes import blueprint as user_blueprint
from api.product.routes import blueprint as product_blueprint
from api.scraping.type.routes import blueprint as scraping_type_blueprint
frmo api.payment_status.routes import blueprint as payment_status
from api.contact.routes import blueprint as contact_blueprint
from api.currency.routes import blueprint as currency_blueprint
from api.purchases.history import blueprint as purchase_history_blueprint
from api.purchases.product import blueprint as purchase_item_blueprint
from api.purchases.purchase import blueprint as purchase_blueprint
from api.transaction.payment import blueprint as transaction_blueprint
from api.transaction.method import blueprint as transaction_method_blueprint

def register_blueprints(app):
    app.register_blueprint(address_blueprint, url_prefix='/address')
    app.register_blueprint(cart_blueprint, url_prefix='/cart')
    app.register_blueprint(category_blueprint, url_prefix='/category')
    app.register_blueprint(gender_blueprint, url_prefix='/gender')
    app.register_blueprint(image_category_blueprint, url_prefix='/image-category') 
    app.register_blueprint(user_blueprint, url_prefix='/user')
    app.register_blueprint(product_blueprint, url_prefix='/product')
    app.register_blueprint(scraping_blueprint, url_prefix='/scraping')
    app.register_blueprint(scraping_type_blueprint, url_prefix='/contact_type')
    app.register_blueprint(contact_blueprint, url_prefix='/contact')  
    app.register_blueprint(payment_status, url_prefix='/payment-statuses')
    app.register_blueprint(currency_blueprint, url_prefix='/currencies')
    app.register_blueprint(purchase_history_blueprint, url_prefix='/purchase_history')
    app.register_blueprint(purchase_item_blueprint, url_prefix='/purchase_item')
    app.register_blueprint(purchase_blueprint, url_prefix='/purchase')
    app.register_blueprint(transaction_blueprint, url_prefix='/purchase')
    app.register_blueprint(transaction_method_blueprint, url_prefix='/purchase')
