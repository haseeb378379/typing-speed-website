
from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash

from backend.database.models import Admin


auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/api/admin/login", methods=["POST"])
def admin_login():

    if session.get("admin_id"):
        return jsonify({
            "status": "success",
            "message": "Already logged in."
        }), 200

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "Invalid request data."
        }), 400

    username = str(data.get("username", "")).strip()
    password = data.get("password", "")

    if not username or not isinstance(password, str) or not password:
        return jsonify({
            "status": "error",
            "message": "Username and password are required."
        }), 400

    admin = Admin.query.filter_by(
        username=username
    ).first()

    if not admin or not check_password_hash(
        admin.password_hash, password
    ):
        return jsonify({
            "status": "error",
            "message": "Invalid username or password."
        }), 401

    session.clear()
    session["admin_id"] = admin.id

    return jsonify({
        "status": "success",
        "message": "Admin login successful."
    }), 200


@auth_bp.route("/api/admin/logout", methods=["POST"])
def admin_logout():

    session.clear()

    return jsonify({
        "status": "success",
        "message": "Admin logout successful."
    }), 200


@auth_bp.route("/api/admin/me", methods=["GET"])
def admin_me():

    admin_id = session.get("admin_id")

    if not admin_id:
        return jsonify({
            "status": "error",
            "message": "Authentication required."
        }), 401

    admin = Admin.query.get(admin_id)

    if not admin:
        session.clear()

        return jsonify({
            "status": "error",
            "message": "Admin account not found."
        }), 401

    return jsonify({
        "status": "success",
        "admin": {
            "id": admin.id,
            "username": admin.username
        }
    }), 200
