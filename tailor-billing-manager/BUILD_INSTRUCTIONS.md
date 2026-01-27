# How to Build the Executable

## Quick Method (Recommended)

**Double-click `build.bat`** in the `tailor-billing-manager` folder.

The batch file will:
1. Check if Python is installed
2. Install PyInstaller if needed
3. Build the executable
4. Show you where the exe file is located

## Alternative Methods

### Method 1: Using Command Prompt

1. Open **Command Prompt** or **PowerShell**
2. Navigate to the folder:
   ```cmd
   cd C:\Users\USER\Desktop\projects\tailor-billing\tailor-billing-manager
   ```
3. Run:
   ```cmd
   build.bat
   ```

### Method 2: Using Python Directly

1. Open **Command Prompt** or **PowerShell**
2. Navigate to the folder:
   ```cmd
   cd C:\Users\USER\Desktop\projects\tailor-billing\tailor-billing-manager
   ```
3. Run:
   ```cmd
   python build_exe.py
   ```

### Method 3: Right-Click Method

1. **Right-click** on `build.bat`
2. Select **"Run as administrator"** (optional, but recommended)
3. The build will start

## Troubleshooting

### If Double-Click Doesn't Work

**Problem:** Double-clicking `build.bat` doesn't open anything or closes immediately.

**Solutions:**

1. **Check File Association:**
   - Right-click `build.bat`
   - Select "Open with" → Choose "Command Prompt" or "Windows Command Processor"

2. **Run from Command Prompt:**
   ```cmd
   cd C:\Users\USER\Desktop\projects\tailor-billing\tailor-billing-manager
   build.bat
   ```

3. **Check if Python is Installed:**
   ```cmd
   python --version
   ```
   If this shows an error, install Python first.

4. **Run Python Script Directly:**
   ```cmd
   python build_exe.py
   ```

### If Python Script Doesn't Open

**Problem:** Double-clicking `build_exe.py` doesn't work.

**Solution:**
- Python scripts (`.py` files) need to be run from command line
- Use `build.bat` instead, or run: `python build_exe.py` from command prompt

### Common Errors

**Error: "Python is not recognized"**
- Install Python from https://www.python.org/
- Make sure to check "Add Python to PATH" during installation
- Restart your computer after installation

**Error: "pip is not recognized"**
- Python might not be installed correctly
- Try: `python -m ensurepip --upgrade`

**Error: "PyInstaller not found"**
- Run: `pip install pyinstaller`
- Then try building again

## Build Time

- **First build:** 2-5 minutes (PyInstaller needs to package everything)
- **Subsequent builds:** 1-3 minutes (faster with cache)

## Output Location

After successful build, find the executable at:
```
tailor-billing-manager\dist\TailorBillingManager.exe
```

## What to Do After Building

1. **Test the executable:**
   - Double-click `TailorBillingManager.exe` in the `dist` folder
   - Make sure it opens and works

2. **Move it:**
   - You can move the exe file anywhere
   - It doesn't need Python to run

3. **Create shortcut:**
   - Right-click the exe → "Create shortcut"
   - Move shortcut to desktop

4. **Run as Administrator (for service operations):**
   - Right-click exe → "Run as administrator"
   - Or set shortcut to always run as admin

---

**Need Help?** If the build still doesn't work, check:
1. Python is installed: `python --version`
2. You're in the correct folder
3. All files are present in `tailor-billing-manager` folder
