# Configuration file for Tailor Billing Manager

import os
import sys
from pathlib import Path

# Helper function to find project root from a starting path
def find_project_root(start_path):
    """Find project root by looking for .git folder or backend/frontend folders"""
    start_path = Path(start_path).resolve()
    current = start_path
    
    # Check up to 10 levels up
    for _ in range(10):
        # Check for .git folder (definitive marker)
        if (current / ".git").exists():
            return current
        # Check for backend and frontend folders (project structure)
        if (current / "backend").exists() and (current / "frontend").exists():
            return current
        # Check if we've reached the filesystem root
        parent = current.parent
        if parent == current:  # Reached root
            break
        current = parent
    
    return None

# Detect if running as PyInstaller executable
def get_base_path():
    """Get the base path, handling both script and exe execution"""
    if getattr(sys, 'frozen', False):
        # Running as compiled exe (PyInstaller)
        # First, try current working directory (most reliable - user's intent)
        cwd = Path.cwd()
        project_root = find_project_root(cwd)
        if project_root:
            return project_root
        
        # If CWD doesn't work, try exe location
        exe_dir = Path(sys.executable).resolve().parent
        
        # Check if exe is in tailor-billing-manager/dist folder
        if exe_dir.name == "dist":
            # Go up to tailor-billing-manager, then to project root
            parent = exe_dir.parent
            if parent.name == "tailor-billing-manager":
                project_root = find_project_root(parent.parent)
                if project_root:
                    return project_root
        
        # Try to find project root from exe location
        project_root = find_project_root(exe_dir)
        if project_root:
            return project_root
        
        # Fallback: return exe directory (user can move exe to project root)
        return exe_dir
    else:
        # Running as Python script
        SCRIPT_DIR = Path(__file__).resolve().parent
        # If we're in tailor-billing-manager folder, go up one level to project root
        if SCRIPT_DIR.name == "tailor-billing-manager":
            return SCRIPT_DIR.parent
        else:
            return SCRIPT_DIR

# Get project root
PROJECT_ROOT = get_base_path()

# Validate project root - check for common markers
def validate_project_root(path):
    """Validate that the path looks like the project root"""
    path = Path(path)
    # Check for .git folder or backend/frontend folders
    has_git = (path / ".git").exists()
    has_backend = (path / "backend").exists()
    has_frontend = (path / "frontend").exists()
    return has_git or (has_backend and has_frontend)

# If project root doesn't look valid, try to find it
if not validate_project_root(PROJECT_ROOT):
    # Try common locations
    possible_paths = [
        Path.home() / "Desktop" / "projects" / "tailor-billing",
        Path("C:/Users") / os.getenv("USERNAME", "USER") / "Desktop" / "projects" / "tailor-billing",
        Path.cwd(),  # Current working directory
    ]
    
    for possible_path in possible_paths:
        if possible_path.exists() and validate_project_root(possible_path):
            PROJECT_ROOT = possible_path
            break

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
