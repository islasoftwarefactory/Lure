from flask import jsonify, Blueprint
from api.Database.Models.Size import Size

blueprint = Blueprint('delete_size', __name__)

@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    size = Size.query.get(id)
    if size is None:
        return jsonify({"error": "Size not found"}), 404

    try:
        db.session.delete(size)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete size: {str(e)}"}), 500

    return jsonify({"message": "Size deleted successfully"}), 200
