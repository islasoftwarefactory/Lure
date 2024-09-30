from flask import jsonify, Blueprint
from BackEnd.Database.Models.Gender import Gender
from ....Database.connection import db

blueprint = Blueprint('delete_gender', __name__)

@blueprint.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    gender = Gender.query.get(id)
    if gender is None:
        return jsonify({"error": "Gender not found"}), 404

    try:
        db.session.delete(gender)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete gender: {str(e)}"}), 500

    return jsonify({"message": "Gender deleted successfully"}), 200
