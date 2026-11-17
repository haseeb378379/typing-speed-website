
from getpass import getpass

from werkzeug.security import generate_password_hash

from backend.main import app
from backend.database.connection import db
from backend.database.models import Admin


def create_admin():

    with app.app_context():

        username = input("Enter admin username: ").strip()

        if not username or len(username) > 50:
            print("Invalid username!")
            return

        existing_admin = Admin.query.filter_by(
            username=username
        ).first()

        if existing_admin:
            print("This username already exists!")
            return

        password = getpass("Enter admin password: ")
        confirm_password = getpass("Confirm admin password: ")

        if len(password) < 12:
            print("Password must be at least 12 characters!")
            return

        if password != confirm_password:
            print("Passwords do not match!")
            return

        admin = Admin(
            username=username,
            password_hash=generate_password_hash(password)
        )

        db.session.add(admin)
        db.session.commit()

        print("Admin account created successfully!")


if __name__ == "__main__":
    create_admin()
