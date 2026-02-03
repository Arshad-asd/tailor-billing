# Tailor Billing Manager – Setup on New Computer

Use this guide after cloning the repo on a new computer to set up and run the GUI application.

---

## 1. Prerequisites

Install these **before** running the manager:

### Python 3.10 or higher

1. Download: https://www.python.org/downloads/
2. During install, check **“Add Python to PATH”**
3. Verify:
   ```powershell
   python --version
   ```

### Git

1. Download: https://git-scm.com/download/win  
2. Use default options  
3. Verify:
   ```powershell
   git --version
   ```

### NSSM (for service Start/Stop/Restart)

Only needed if you use the Windows service for the Tailor Billing app.

**Option A – Chocolatey**
```powershell
choco install nssm -y
```

**Option B – Manual**
1. Download: https://nssm.cc/download  
2. Extract and add the `win64` folder to PATH (or use full path to `nssm.exe`)

Verify:
```powershell
nssm --version
```

---

## 2. Clone the Repo (if not done yet)

```powershell
cd C:\Users\YourName\Desktop\projects
git clone <your-repo-url> tailor-billing
cd tailor-billing
```

If already cloned, just go to the project folder:

```powershell
cd C:\Users\YourName\Desktop\projects\tailor-billing
```

---

## 3. Set Up Tailor Billing Manager (GUI)

All steps are from the **project root** (the folder that contains `tailor-billing-manager`).

### Step 1: Go to the manager folder

```powershell
cd tailor-billing-manager
```

### Step 2: Install Python dependencies

```powershell
pip install -r requirements.txt
```

This installs PyInstaller (mainly for building the exe). The GUI uses built-in Python modules (tkinter, etc.), so no extra packages are required to **run** the app.

### Step 3: Run the application

**Option A – From source (recommended for first run)**

```powershell
python main.py
```

**Option B – Using the batch file**

```powershell
.\run.bat
```

The GUI window should open.

---

## 4. (Optional) Build the executable

To get a single `.exe` you can run without Python:

```powershell
cd tailor-billing-manager
.\build.bat
```

When it finishes:

- Exe path: `tailor-billing-manager\dist\TailorBillingManager.exe`
- You can copy this file anywhere and double‑click to run
- For service operations (Start/Stop/Restart), right‑click the exe → **Run as administrator**

---

## 5. Using the manager

- **Start / Stop / Restart** – Controls the Tailor Billing Windows service (needs NSSM and often “Run as administrator”).
- **Sync (Git Pull)** – Stops service, pulls latest code, restarts service if it was running.
- **Refresh Status** – Updates service and Git branch status.
- **View Logs / Backend Logs** – Opens or shows project logs.
- **Quick Links** – Open backend, frontend, admin, project folder, run migrations.

If you get “Access is denied” on service actions, run the app (or the exe) **as Administrator**.

---

## 6. Checklist – New computer

| Step | Action | Verify |
|------|--------|--------|
| 1 | Install Python 3.10+ (with “Add to PATH”) | `python --version` |
| 2 | Install Git | `git --version` |
| 3 | (Optional) Install NSSM for service control | `nssm --version` |
| 4 | Clone repo and `cd` into project | You are in `tailor-billing` |
| 5 | `cd tailor-billing-manager` | You are in `tailor-billing-manager` |
| 6 | `pip install -r requirements.txt` | No errors |
| 7 | `python main.py` | GUI opens |
| 8 | (Optional) `.\build.bat` | `dist\TailorBillingManager.exe` exists |

---

## 7. Troubleshooting

### “Python is not recognized”
- Reinstall Python and check **“Add Python to PATH”**, or add Python’s install folder to the system PATH manually.

### “Not a Git repo” or Git branch not showing
- Open the manager from the **project root** (or run the exe from the project folder / after having opened that folder). The app looks for the repo in the current directory or parent folders.

### Service buttons do nothing or “Access is denied”
- Install NSSM and ensure it’s on PATH.
- Right‑click the app (or exe) and choose **Run as administrator**.

### “Git pull” or “Sync” fails
- Check: `git --version`, `git remote -v`, and network (e.g. can reach GitHub).
- See `NETWORK_TROUBLESHOOTING.md` in the same folder if needed.

### Want to run the main Tailor Billing app as a Windows service
- That is separate from the manager. Use the project’s **install-service.bat** (from the repo root) and the main setup docs for the backend/frontend and NSSM service install.

---

## Summary

On a new computer after cloning:

1. Install **Python**, **Git**, and (optional) **NSSM**.
2. `cd tailor-billing-manager`
3. `pip install -r requirements.txt`
4. `python main.py` (or `.\run.bat`).

Optional: run `.\build.bat` to create `TailorBillingManager.exe`. For service control, run the app or exe as Administrator.
