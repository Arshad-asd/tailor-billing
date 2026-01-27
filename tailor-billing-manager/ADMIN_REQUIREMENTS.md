# Administrator Rights Required

## Why Administrator Rights?

The Tailor Billing Manager needs Administrator privileges to:
- **Start** the Windows service
- **Stop** the Windows service
- **Restart** the Windows service
- **Sync from Git** (which requires stopping/starting the service)

This is because NSSM (Non-Sucking Service Manager) requires elevated permissions to manage Windows services.

## How to Run as Administrator

### Option 1: Right-Click Method

1. **Find the application:**
   - If running from source: `tailor-billing-manager\main.py`
   - If using exe: `TailorBillingManager.exe`

2. **Right-click** on the file

3. **Select** "Run as administrator"

4. **Click** "Yes" when Windows asks for permission

### Option 2: From Command Prompt

```powershell
# Navigate to the folder
cd tailor-billing-manager

# Run as admin (PowerShell)
Start-Process python -ArgumentList "main.py" -Verb RunAs

# Or if using exe
Start-Process ".\dist\TailorBillingManager.exe" -Verb RunAs
```

### Option 3: Use the Built-in Restart Feature

When you get an "Access Denied" error:

1. Click **"Yes"** when asked to restart as Administrator
2. The application will close and reopen with admin rights
3. You may need to click "Yes" on the Windows UAC prompt

## Verifying Admin Status

When the application is running, check the top-right corner:
- **🛡️ Running as Administrator** = You have admin rights ✅
- **⚠️ Not running as Administrator** = You need to restart as admin ⚠️

## Troubleshooting

### Still Getting "Access Denied" Even as Admin?

1. **Check NSSM installation:**
   ```powershell
   nssm --version
   ```

2. **Verify service exists:**
   ```powershell
   nssm status TailorBillingApp
   ```

3. **Check Windows Event Viewer** for detailed error messages

4. **Try running NSSM commands directly** in an admin PowerShell:
   ```powershell
   nssm start TailorBillingApp
   ```

### Application Won't Restart as Admin

1. **Manually run as admin** using Option 1 or 2 above
2. **Check Windows UAC settings** - make sure UAC is not completely disabled
3. **Check antivirus** - some antivirus software blocks elevation requests

## Best Practice

**Recommended:** Always run the application as Administrator from the start if you plan to manage the service.

You can:
1. Create a desktop shortcut
2. Right-click the shortcut → Properties
3. Check "Run as administrator"
4. Click OK

Now double-clicking the shortcut will always run as admin!

---

**Note:** The application will show a warning if you're not running as admin, but you can still view status and logs without admin rights.
