from flask import jsonify, Blueprint
from BackEnd.Database.Models.Product import Product

blueprint = Blueprint('delete_product', __name__)

@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    product = Product.query.get(id)
    if product is None:
        return jsonify({"error": "Product not found"}), 404

    try:
        db.session.delete(product)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete product: {str(e)}"}), 500

    return jsonify({"message": "Product deleted successfully"}), 200
