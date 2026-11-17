
from flask import Blueprint, jsonify, session, request

from backend.database.models import Admin, ContactMessage
from backend.database.connection import db


admin_bp = Blueprint("admin", __name__)


def verify_admin():

    admin_id = session.get("admin_id")

    if not admin_id:
        return None

    admin = db.session.get(Admin, admin_id)

    if not admin:
        session.clear()
        return None

    return admin


# Check Current Admin Session
@admin_bp.route("/api/admin/me", methods=["GET"])
def admin_me():

    admin = verify_admin()

    if not admin:
        return jsonify({
            "status": "error",
            "message": "Authentication required."
        }), 401

    return jsonify({
        "status": "success",
        "admin": {
            "id": admin.id,
            "username": admin.username
        }
    }), 200


# Dashboard Statistics
@admin_bp.route("/api/admin/dashboard", methods=["GET"])
def admin_dashboard():

    admin = verify_admin()

    if not admin:
        return jsonify({
            "status": "error",
            "message": "Authentication required."
        }), 401

    total_messages = ContactMessage.query.count()

    unread_messages = ContactMessage.query.filter_by(
        status="unread"
    ).count()

    read_messages = ContactMessage.query.filter_by(
        status="read"
    ).count()

    return jsonify({
        "status": "success",
        "dashboard": {
            "admin": admin.username,
            "total_messages": total_messages,
            "unread_messages": unread_messages,
            "read_messages": read_messages
        }
    }), 200


# Get All Contact Messages
@admin_bp.route("/api/admin/messages", methods=["GET"])
def get_messages():

    admin = verify_admin()

    if not admin:
        return jsonify({
            "status": "error",
            "message": "Authentication required."
        }), 401

    messages = ContactMessage.query.order_by(
        ContactMessage.created_at.desc()
    ).all()

    return jsonify({
        "status": "success",
        "messages": [
            {
                "id": message.id,
                "name": message.name,
                "email": message.email,
                "subject": message.subject,
                "message": message.message,
                "status": message.status,
                "created_at": message.created_at.isoformat()
            }
            for message in messages
        ]
    }), 200


# Get Single Message
@admin_bp.route("/api/admin/messages/<int:message_id>", methods=["GET"])
def get_single_message(message_id):

    admin = verify_admin()

    if not admin:
        return jsonify({
            "status": "error",
            "message": "Authentication required."
        }), 401

    message = db.session.get(ContactMessage, message_id)

    if not message:
        return jsonify({
            "status": "error",
            "message": "Message not found."
        }), 404

    return jsonify({
        "status": "success",
        "message": {
            "id": message.id,
            "name": message.name,
            "email": message.email,
            "subject": message.subject,
            "message": message.message,
            "status": message.status,
            "created_at": message.created_at.isoformat()
        }
    }), 200


# Update Message Status
@admin_bp.route(
    "/api/admin/messages/<int:message_id>/status",
    methods=["PATCH"]
)
def update_message_status(message_id):

    admin = verify_admin()

    if not admin:
        return jsonify({
            "status": "error",
            "message": "Authentication required."
        }), 401

    message = db.session.get(ContactMessage, message_id)

    if not message:
        return jsonify({
            "status": "error",
            "message": "Message not found."
        }), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "Invalid request data."
        }), 400

    new_status = data.get("status")

    if new_status not in ["read", "unread"]:
        return jsonify({
            "status": "error",
            "message": "Status must be read or unread."
        }), 400

    message.status = new_status

    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Message status updated.",
        "new_status": new_status
    }), 200


# Delete Contact Message
@admin_bp.route(
    "/api/admin/messages/<int:message_id>",
    methods=["DELETE"]
)
def delete_message(message_id):

    admin = verify_admin()

    if not admin:
        return jsonify({
            "status": "error",
            "message": "Authentication required."
        }), 401

    message = db.session.get(ContactMessage, message_id)

    if not message:
        return jsonify({
            "status": "error",
            "message": "Message not found."
        }), 404

    db.session.delete(message)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Contact message deleted."
    }), 200
