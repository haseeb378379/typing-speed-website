from dotenv import load_dotenv

load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS

from backend.config import Config
from backend.database.connection import init_db
from backend.database.models import ContactMessage, Admin
from backend.routes.contact import contact_bp
from backend.routes.auth import auth_bp
from backend.routes.admin import admin_bp


# Create Flask application
app = Flask(__name__)

# Load configuration
app.config.from_object(Config)

# Enable CORS for development
CORS(app, supports_credentials=True)

# Session security settings
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False

# Initialize database
init_db(app)

# Register blueprints
app.register_blueprint(contact_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)


@app.route("/")
def home():
    return jsonify({
        "status": "success",
        "message": "TypeMaster Backend is running!"
    })


if __name__ == "__main__":
    app.run(debug=True)