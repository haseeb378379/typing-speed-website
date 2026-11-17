
import re

from flask import Blueprint, request, jsonify

from backend.database.connection import db
from backend.database.models import ContactMessage


contact_bp = Blueprint("contact", __name__)


@contact_bp.route("/api/contact", methods=["POST"])
def submit_contact():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "Invalid request data."
        }), 400

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    subject = str(data.get("subject", "")).strip()
    message = str(data.get("message", "")).strip()

    # Validate required fields
    if not all([name, email, subject, message]):
        return jsonify({
            "status": "error",
            "message": "All fields are required."
        }), 400

    # Validate name
    if len(name) < 2 or len(name) > 80:
        return jsonify({
            "status": "error",
            "message": "Name must be between 2 and 80 characters."
        }), 400

    # Validate email
    if len(email) > 254 or not re.fullmatch(
        r"[^@\s]+@[^@\s]+\.[^@\s]+", email
    ):
        return jsonify({
            "status": "error",
            "message": "Please enter a valid email address."
        }), 400

    # Validate subject
    allowed_subjects = [
        "General Inquiry",
        "Technical Support",
        "Feedback",
        "Other"
    ]

    if subject not in allowed_subjects:
        return jsonify({
            "status": "error",
            "message": "Please select a valid subject."
        }), 400

    # Validate message
    if len(message) < 10 or len(message) > 2000:
        return jsonify({
            "status": "error",
            "message": "Message must be between 10 and 2000 characters."
        }), 400

    # Create database record
    new_message = ContactMessage(
        name=name,
        email=email,
        subject=subject,
        message=message
    )

    try:
        db.session.add(new_message)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Your message has been received successfully!"
        }), 201

    except Exception:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Unable to send your message. Please try again."
        }), 500
