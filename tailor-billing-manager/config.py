# Configuration file for Tailor Billing Manager

import os
from pathlib import Path

# Default project path (can be changed in settings)
# This assumes the manager is in the project root or one level up
SCRIPT_DIR = Path(__file__).resolve().parent
# If we're in tailor-billing-manager folder, go up one level to project root
if SCRIPT_DIR.name == "tailor-billing-manager":
    PROJECT_ROOT = SCRIPT_DIR.parent
else:
    PROJECT_ROOT = SCRIPT_DIR

# Service configuration
SERVICE_NAME = "TailorBillingApp"
NSSM_COMMAND = "nssm"  # Assumes nssm is in PATH

# Application URLs
BACKEND_URL = "http://localhost:8001"
FRONTEND_URL = "http://localhost:5173"
ADMIN_URL = "http://localhost:8001/admin"

# Paths
BACKEND_DIR = PROJECT_ROOT / "backend"
FRONTEND_DIR = PROJECT_ROOT / "frontend"
LOGS_DIR = PROJECT_ROOT / "logs"
VENV_PYTHON = BACKEND_DIR / "venv" / "Scripts" / "python.exe"

# Log files
STARTUP_LOG = LOGS_DIR / "startup.log"
STARTUP_ERROR_LOG = LOGS_DIR / "startup-errors.log"
BACKEND_ERROR_LOG = LOGS_DIR / "backend-errors.log"
SERVICE_OUTPUT_LOG = LOGS_DIR / "service-output.log"
SERVICE_ERROR_LOG = LOGS_DIR / "service-error.log"

# Git configuration
GIT_REPO_PATH = PROJECT_ROOT

# UI Configuration
WINDOW_TITLE = "Tailor Billing Application Manager"
WINDOW_SIZE = "700x800"
REFRESH_INTERVAL = 5000  # milliseconds

# Colors
COLOR_RUNNING = "#28a745"  # Green
COLOR_STOPPED = "#dc3545"  # Red
COLOR_WARNING = "#ffc107"  # Yellow
COLOR_INFO = "#17a2b8"     # Blue
COLOR_ADMIN = "#6f42c1"    # Purple
COLOR_BG_LIGHT = "#f8f9fa" # Light gray background
COLOR_BORDER = "#dee2e6"   # Border gray
