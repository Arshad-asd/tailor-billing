# GUI Application Design - Tailor Billing Manager

## Overview

A Windows desktop application (exe) that provides a user-friendly interface to:
- ✅ Start the application
- ✅ Stop the application
- ✅ Restart the application
- ✅ Sync (Pull latest code from Git repository)
- ✅ View application status
- ✅ View logs
- ✅ Check service status

## Technology Options

### Option 1: Python + Tkinter (Recommended)
- **Pros:**
  - Easy to develop
  - Cross-platform
  - Can use existing Python environment
  - Small executable size with PyInstaller
- **Cons:**
  - Basic UI (but functional)
- **Estimated Development Time:** 2-3 hours

### Option 2: Python + PyQt5/PySide6
- **Pros:**
  - Modern, professional UI
  - More features
- **Cons:**
  - Larger executable size
  - More complex
- **Estimated Development Time:** 4-5 hours

### Option 3: Electron (Node.js)
- **Pros:**
  - Modern web-based UI
  - Very customizable
- **Cons:**
  - Large executable size (~100MB+)
  - Requires Node.js
- **Estimated Development Time:** 5-6 hours

### Option 4: C# WinForms/WPF
- **Pros:**
  - Native Windows application
  - Professional look
  - Small executable
- **Cons:**
  - Requires .NET Framework
  - Windows only
- **Estimated Development Time:** 4-5 hours

## Recommended: Python + Tkinter

I recommend **Python + Tkinter** because:
1. You already have Python installed
2. Easy to maintain and update
3. Can be packaged as a single exe file
4. Quick to develop
5. Lightweight

## Application Features

### Main Window Features:

1. **Service Status Display**
   - Current status (Running/Stopped)
   - Last sync time
   - Service uptime

2. **Control Buttons**
   - 🟢 **Start** - Start the service
   - 🔴 **Stop** - Stop the service
   - 🔄 **Restart** - Restart the service
   - 🔁 **Sync** - Pull latest code from Git
   - 📊 **Status** - Refresh status

3. **Information Panel**
   - Backend URL: http://localhost:8001
   - Frontend URL: http://localhost:5173
   - Service name: TailorBillingApp
   - Last sync: [timestamp]

4. **Log Viewer**
   - Recent log entries
   - Error highlights
   - Auto-refresh option

5. **Quick Actions**
   - Open Backend in Browser
   - Open Frontend in Browser
   - View Logs Folder
   - Open Project Folder

## Application Workflow

### Sync (Git Pull) Process:
1. User clicks "Sync" button
2. Application:
   - Stops the service (if running)
   - Navigates to project directory
   - Runs `git pull` command
   - Shows progress/output
   - Optionally runs migrations if needed
   - Restarts the service (if it was running before)

### Start/Stop/Restart:
- Directly calls NSSM commands
- Shows status updates
- Displays success/error messages

## File Structure

```
tailor-billing-manager/
├── main.py                 # Main application file
├── service_manager.py      # Service control functions
├── git_sync.py            # Git sync functionality
├── ui.py                   # UI components
├── config.py               # Configuration
├── requirements.txt        # Python dependencies
├── build_exe.py           # Script to build exe
└── README.md              # Usage instructions
```

## User Interface Mockup

```
┌─────────────────────────────────────────────┐
│  Tailor Billing Application Manager         │
├─────────────────────────────────────────────┤
│                                             │
│  Status: 🟢 Running                         │
│  Service: TailorBillingApp                  │
│  Last Sync: 2026-01-27 18:30:00           │
│                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐        │
│  │ Start  │ │  Stop   │ │ Restart│        │
│  └────────┘ └────────┘ └────────┘        │
│                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐        │
│  │  Sync  │ │ Status │ │  Logs  │        │
│  └────────┘ └────────┘ └────────┘        │
│                                             │
│  Quick Links:                               │
│  [Open Backend] [Open Frontend]            │
│  [View Logs] [Project Folder]              │
│                                             │
│  Recent Logs:                               │
│  ┌─────────────────────────────────────┐  │
│  │ [2026-01-27 18:30:00] Service...   │  │
│  │ [2026-01-27 18:29:45] Backend...   │  │
│  │ [2026-01-27 18:29:30] Frontend...  │  │
│  └─────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

## Implementation Details

### Dependencies Needed:
- `tkinter` (built-in with Python)
- `subprocess` (built-in) - for running commands
- `threading` (built-in) - for non-blocking operations
- `PyInstaller` - to create exe file

### Key Functions:

1. **Service Control:**
   ```python
   def start_service()
   def stop_service()
   def restart_service()
   def get_service_status()
   ```

2. **Git Sync:**
   ```python
   def sync_from_git()
   def check_git_status()
   def pull_latest_code()
   ```

3. **UI Updates:**
   ```python
   def update_status()
   def refresh_logs()
   def show_notification()
   ```

## Building the Executable

After development, we'll create a single exe file:

```powershell
pip install pyinstaller
pyinstaller --onefile --windowed --name "TailorBillingManager" main.py
```

This creates: `TailorBillingManager.exe`

## Security Considerations

- The exe will need to run with appropriate permissions
- Git operations require git to be installed
- Service operations require admin rights (can request elevation)

## Distribution

- Single exe file (~10-15 MB)
- No installation needed
- Can be placed anywhere
- Can be added to startup folder for auto-launch

---

## Next Steps

If you approve this design, I will:

1. ✅ Create the Python application with Tkinter
2. ✅ Implement all control functions
3. ✅ Add Git sync functionality
4. ✅ Create build script for exe
5. ✅ Test all features
6. ✅ Create usage documentation

**Estimated Total Time:** 2-3 hours of development

---

**Would you like me to proceed with implementing this GUI application?**
