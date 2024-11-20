from flask import jsonify, Blueprint
from api.Database.Models.Size import Size

blueprint = Blueprint('read_size', __name__)

@blueprint.route("/read/<int:id>", methods=["GET"])
def read(id):
    size = Size.query.get(id)
    if size is None:
        return jsonify({"error": "Size not found"}), 404

    return jsonify({
        "data": size.serialize(),
        "message": "Size retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
def read_all():
    sizes = Size.query.all()
    sizes_data = [size.serialize() for size in sizes]

    return jsonify({
        "data": sizes_data,
        "message": "Sizes retrieved successfully."
    }), 200
