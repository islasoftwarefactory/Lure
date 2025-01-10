from flask import request, jsonify, Blueprint
from api.scraping.model import Scraping, create_scraping, get_scraping, update_scraping, delete_scraping
from api.utils.jwt.decorators import token_required

blueprint = Blueprint('scraping', __name__)

# Create
@blueprint.route("/create", methods=["POST"])
def create():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        scraping = create_scraping(data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to create scraping entry: {str(e)}"}), 500

    return jsonify({
        "data": scraping.serialize(),
        "message": "Scraping entry created successfully."
    }), 201

# Read
@blueprint.route("/read/<int:id>", methods=["GET"])
@token_required
def read(current_user_id, id):
    scraping = get_scraping(id)
    if scraping is None:
        return jsonify({"error": "Scraping entry not found"}), 404

    return jsonify({
        "data": scraping.serialize(),
        "message": "Scraping entry retrieved successfully."
    }), 200

@blueprint.route("/read/all", methods=["GET"])
@token_required
def read_all(current_user_id):
    scrapings = Scraping.query.all()
    scrapings_data = [scraping.serialize() for scraping in scrapings]

    return jsonify({
        "data": scrapings_data,
        "message": "Scraping entries retrieved successfully."
    }), 200

# Update
@blueprint.route("/update/<int:id>", methods=["PUT"])
@token_required
def update(current_user_id, id):
    data = request.get_json()

    try:
        scraping = update_scraping(id, data)
        if scraping is None:
            return jsonify({"error": "Scraping entry not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to update scraping entry: {str(e)}"}), 500

    return jsonify({
        "data": scraping.serialize(),
        "message": "Scraping entry updated successfully."
    }), 200

# Delete
@blueprint.route("/delete/<int:id>", methods=["DELETE"])
@token_required
def delete(current_user_id, id):
    try:
        scraping = delete_scraping(id)
        if scraping is None:
            return jsonify({"error": "Scraping entry not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to delete scraping entry: {str(e)}"}), 500

    return jsonify({
        "message": "Scraping entry deleted successfully."
    }), 200