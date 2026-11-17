
import os
from pathlib import Path

# Project root directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Database directory
DATABASE_DIR = BASE_DIR / "data"

# Create data directory if it does not exist
DATABASE_DIR.mkdir(exist_ok=True)

# Database file path
DATABASE_PATH = DATABASE_DIR / "typemaster.db"


class Config:

    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "typemaster-development-secret-key"
    )

    SQLALCHEMY_DATABASE_URI = (
        f"sqlite:///{DATABASE_PATH.as_posix()}"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
