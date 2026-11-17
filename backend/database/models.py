
from datetime import datetime, timezone

from backend.database.connection import db


class ContactMessage(db.Model):

    __tablename__ = "contact_messages"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(80),
        nullable=False
    )

    email = db.Column(
        db.String(254),
        nullable=False
    )

    subject = db.Column(
        db.String(100),
        nullable=False
    )

    message = db.Column(
        db.String(2000),
        nullable=False
    )

    status = db.Column(
        db.String(20),
        default="unread",
        nullable=False
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    def __repr__(self):
        return f"<ContactMessage {self.id}: {self.subject}>"


class Admin(db.Model):

    __tablename__ = "admins"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    username = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

    password_hash = db.Column(
        db.String(256),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    def __repr__(self):
        return f"<Admin {self.username}>"
