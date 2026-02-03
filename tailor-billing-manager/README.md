# Tailor Billing Manager - GUI Application

A user-friendly Windows desktop application to manage your Tailor Billing application service.

## Features

- ✅ **Start/Stop/Restart** - Control the application service with one click
- ✅ **Git Sync** - Pull latest code from repository automatically
- ✅ **Status Monitoring** - Real-time service status display
- ✅ **Log Viewer** - View recent application logs
- ✅ **Quick Links** - Open backend, frontend, and admin in browser
- ✅ **Run Migrations** - Execute database migrations from the GUI

## Requirements

- Python 3.10 or higher
- NSSM installed (for service management)
- Git installed (for sync functionality)

## New Computer? Cloned the Repo?

See **[SETUP_NEW_COMPUTER.md](SETUP_NEW_COMPUTER.md)** for step-by-step setup on a fresh clone.

## Installation

### Option 1: Run from Source

1. **Install dependencies:**
   ```powershell
   cd tailor-billing-manager
   pip install -r requirements.txt
   ```

2. **Run the application:**
   ```powershell
   python main.py
   ```

### Option 2: Build Executable

1. **Build the exe:**
   ```powershell
   cd tailor-billing-manager
   python build_exe.py
   ```

2. **Find the executable:**
   - Location: `dist\TailorBillingManager.exe`
   - You can move this exe anywhere and run it

## Usage

### Starting the Application

1. **Double-click** `TailorBillingManager.exe` (or run `python main.py`)

2. The window will show:
   - Current service status
   - Control buttons
   - Recent logs
   - Quick action links

### Using the Controls

- **Start** - Starts the Tailor Billing service
- **Stop** - Stops the service
- **Restart** - Restarts the service
- **Sync (Git Pull)** - Pulls latest code from repository
- **Refresh Status** - Updates the status display
- **View Logs** - Opens logs folder

### Git Sync Process

When you click "Sync (Git Pull)":

1. Service stops (if running)
2. Latest code is pulled from Git
3. Service restarts (if it was running before)
4. Progress is shown in the status bar

## Configuration

Edit `config.py` to customize:
- Project paths
- Service name
- URLs
- Refresh interval

## Troubleshooting

### Application Won't Start

- Check if Python is installed: `python --version`
- Check if all files are in the `tailor-billing-manager` folder

### Service Operations Fail

- Ensure NSSM is installed: `nssm --version`
- Run the application as Administrator for service operations

### Git Sync Fails

- Check if Git is installed: `git --version`
- Verify you're in a Git repository
- Check your Git credentials

### Executable Not Working

- Try running from source: `python main.py`
- Check if PyInstaller created the exe correctly
- Ensure all dependencies are included

## Building the Executable

```powershell
# Install PyInstaller
pip install pyinstaller

# Build
python build_exe.py

# Or manually
pyinstaller --onefile --windowed --name "TailorBillingManager" main.py
```

The executable will be in the `dist` folder.

## File Structure

```
tailor-billing-manager/
├── main.py              # Main application
├── service_manager.py   # Service control functions
├── git_sync.py         # Git operations
├── config.py           # Configuration
├── build_exe.py        # Build script
├── requirements.txt    # Dependencies
└── README.md          # This file
```

## Notes

- The application auto-refreshes status every 5 seconds
- All operations run in background threads (UI stays responsive)
- Logs are read from the `logs` directory in the project root
- Service operations require appropriate permissions

---

**Version:** 1.0  
**Last Updated:** January 2026
