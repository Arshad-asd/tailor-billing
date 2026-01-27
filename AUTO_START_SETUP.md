# Auto-Start Setup Guide for Tailor Billing Application

> **For complete setup on a new system, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**

This guide will help you set up your Tailor Billing application to automatically start on system boot and automatically restart if it crashes or the PC restarts.

## Overview

The application consists of:
- **Backend**: Django server running on `http://localhost:8001`
- **Frontend**: React/Vite server running on `http://localhost:5173`

## Method 1: Using NSSM (Recommended - Windows Service)

This method installs the application as a Windows service, which provides the best reliability and automatic restart capabilities.

### Prerequisites

1. **NSSM (Non-Sucking Service Manager)**
   - Download from: https://nssm.cc/download
   - Extract the ZIP file
   - Add NSSM to your system PATH, OR
   - Place `nssm.exe` (64-bit version) in the project root directory

### Installation Steps

1. **Download and Setup NSSM**
   ```powershell
   # Option 1: Download manually from https://nssm.cc/download
   # Option 2: Use Chocolatey (if installed)
   choco install nssm
   ```

2. **Run the Installation Script**
   - Right-click on `install-service.bat`
   - Select **"Run as administrator"**
   - Follow the prompts

3. **Verify Installation**
   - Open Services (Win + R, type `services.msc`)
   - Look for "Tailor Billing Application"
   - It should be set to "Automatic" startup type

### Service Management

**Using NSSM commands:**
```batch
# Start service
nssm start TailorBillingApp

# Stop service
nssm stop TailorBillingApp

# Restart service
nssm restart TailorBillingApp

# Check status
nssm status TailorBillingApp

# View/edit service settings
nssm edit TailorBillingApp
```

**Using Windows Services:**
- Press `Win + R`, type `services.msc`
- Find "Tailor Billing Application"
- Right-click to Start/Stop/Restart

### Logs

Service logs are saved to:
- Output: `logs\service-output.log`
- Errors: `logs\service-error.log`

### Uninstallation

Run `uninstall-service.bat` as Administrator to remove the service.

---

## Method 2: Using Windows Task Scheduler (Alternative)

This method uses Windows Task Scheduler to start the application on boot.

### Setup Steps

1. **Open Task Scheduler**
   - Press `Win + R`, type `taskschd.msc`

2. **Create Basic Task**
   - Click "Create Basic Task" in the right panel
   - Name: "Tailor Billing App"
   - Description: "Auto-start Tailor Billing Application"

3. **Configure Trigger**
   - Select "When the computer starts"
   - Click Next

4. **Configure Action**
   - Select "Start a program"
   - Program/script: `powershell.exe`
   - Add arguments: `-ExecutionPolicy Bypass -NoProfile -File "C:\Users\USER\Desktop\projects\tailor-billing\start-application.ps1"`
   - Start in: `C:\Users\USER\Desktop\projects\tailor-billing`

5. **Finish Setup**
   - Check "Open the Properties dialog..."
   - Click Finish

6. **Configure Properties**
   - In Properties dialog:
     - General tab: Check "Run whether user is logged on or not" and "Run with highest privileges"
     - Conditions tab: Uncheck "Start the task only if the computer is on AC power"
     - Settings tab: 
       - Check "If the task fails, restart every: 1 minute"
       - Set "Attempt to restart up to: 10 times"

---

## Method 3: Manual Startup Script (For Testing)

For testing or manual control, you can use the PowerShell script directly:

```powershell
# Run the startup script
.\start-application.ps1
```

This will:
- Start both backend and frontend servers
- Monitor them and restart if they crash
- Keep running until you press Ctrl+C

---

## Troubleshooting

### Service Won't Start

1. **Check Logs**
   - Review `logs\service-output.log` and `logs\service-error.log`

2. **Verify Paths**
   - Ensure Python and Node.js are in your system PATH
   - Check that virtual environment exists (if used)

3. **Check Dependencies**
   ```powershell
   # Test Python
   python --version
   
   # Test Node.js
   node --version
   
   # Test Django
   cd backend
   python manage.py --version
   
   # Test Frontend
   cd ..\frontend
   npm --version
   ```

### Service Starts But Application Doesn't Work

1. **Check Ports**
   - Ensure ports 8001 and 5173 are not in use
   ```powershell
   netstat -ano | findstr :8001
   netstat -ano | findstr :5173
   ```

2. **Check Database**
   - Ensure PostgreSQL is running
   - Verify database connection settings in `backend\core\.env`

3. **Check Firewall**
   - Windows Firewall might be blocking the ports
   - Add exceptions for ports 8001 and 5173

### Application Crashes Frequently

1. **Check System Resources**
   - Ensure sufficient RAM and disk space
   - Check Windows Event Viewer for system errors

2. **Review Application Logs**
   - Check Django logs in backend
   - Check browser console for frontend errors

3. **Update Dependencies**
   ```powershell
   # Backend
   cd backend
   pip install -r requirements.txt --upgrade
   
   # Frontend
   cd ..\frontend
   npm update
   ```

---

## Configuration

### Change Ports

If you need to change the ports:

**Backend (Django):**
- Edit `start-application.ps1` or `start-application-simple.ps1`
- Change `runserver 0.0.0.0:8001` to your desired port

**Frontend (Vite):**
- Edit `frontend\vite.config.js` (if exists) or
- Modify the npm script in `package.json`

### Virtual Environment

If using a virtual environment:
- Ensure the path in the scripts matches your venv location
- Default path: `backend\venv`

---

## Best Practices

1. **Regular Backups**
   - Backup your database regularly
   - Keep environment files secure

2. **Monitoring**
   - Check logs periodically
   - Set up email alerts for critical errors (optional)

3. **Updates**
   - Keep Python, Node.js, and dependencies updated
   - Test updates in a development environment first

4. **Security**
   - Don't expose the application to the internet without proper security
   - Use strong passwords for database and admin accounts
   - Keep DEBUG=False in production

---

## Support

If you encounter issues:
1. Check the logs in `logs\` directory
2. Review Windows Event Viewer
3. Verify all prerequisites are installed
4. Ensure all paths in scripts are correct for your system

---

## Quick Reference

| Action | Command |
|--------|---------|
| Install Service | Run `install-service.bat` as Admin |
| Uninstall Service | Run `uninstall-service.bat` as Admin |
| Start Service | `nssm start TailorBillingApp` |
| Stop Service | `nssm stop TailorBillingApp` |
| Restart Service | `nssm restart TailorBillingApp` |
| View Status | `nssm status TailorBillingApp` |
| Manual Start | `.\start-application.ps1` |

---

**Last Updated**: January 2026
