# Quick Start - GUI Application

## How to Use the GUI Application

### Step 1: Run the Application

**Option A: Run from Source**
```powershell
cd tailor-billing-manager
python main.py
```

**Option B: Use the Batch File**
```powershell
cd tailor-billing-manager
.\run.bat
```

**Option C: Build and Run Executable**
```powershell
cd tailor-billing-manager
.\build.bat
# Then run: dist\TailorBillingManager.exe
```

### Step 2: Using the Interface

The application window shows:

1. **Service Status** - Current status (Running/Stopped)
2. **Control Buttons:**
   - **Start** - Start the service
   - **Stop** - Stop the service
   - **Restart** - Restart the service
   - **Sync (Git Pull)** - Pull latest code
   - **Refresh Status** - Update status
   - **View Logs** - Open logs folder

3. **Quick Links:**
   - Open Backend/Frontend/Admin in browser
   - Open project/logs folders
   - Run migrations

4. **Log Viewer** - Shows recent application logs

### Step 3: Sync from Git

1. Click **"Sync (Git Pull)"** button
2. Confirm the action
3. The application will:
   - Stop service (if running)
   - Pull latest code
   - Restart service (if it was running)

### Step 4: Build Executable (Optional)

To create a standalone exe file:

```powershell
cd tailor-billing-manager
.\build.bat
```

The exe will be in `dist\TailorBillingManager.exe`

You can:
- Move it anywhere
- Create a desktop shortcut
- Add to startup folder

---

## Troubleshooting

### Application Won't Start

- Check Python: `python --version`
- Install dependencies: `pip install -r requirements.txt`

### Buttons Don't Work

- Run as Administrator (for service operations)
- Check if NSSM is installed: `nssm --version`

### Git Sync Fails

- Check if Git is installed: `git --version`
- Verify you're in a Git repository

---

**That's it! Enjoy the easy-to-use GUI! 🎉**
