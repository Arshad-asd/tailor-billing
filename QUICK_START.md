# Quick Start Guide - New System Setup

This is a simplified step-by-step guide for setting up the Tailor Billing application on a completely new Windows system.

## ⚡ Quick Setup (30-45 minutes)

### Step 1: Install Prerequisites (15 minutes)

Install these in order:

1. **Python 3.10+**
   - Download: https://www.python.org/downloads/
   - ✅ **IMPORTANT:** Check "Add Python to PATH" during installation
   - Verify: Open PowerShell and type `python --version`

2. **Node.js 16+**
   - Download: https://nodejs.org/ (LTS version)
   - Install with default settings
   - Verify: `node --version` and `npm --version`

3. **PostgreSQL**
   - Download: https://www.postgresql.org/download/windows/
   - Install with default settings
   - **Remember the postgres password you set!**
   - Verify: `psql --version`

4. **NSSM** (for Windows service)
   ```powershell
   choco install nssm -y
   ```
   Or download from: https://nssm.cc/download

---

### Step 2: Get the Project (5 minutes)

1. Copy the project folder to your desired location:
   ```
   C:\Users\YourUsername\Desktop\projects\tailor-billing
   ```

2. Open PowerShell and navigate to the project:
   ```powershell
   cd "C:\Users\YourUsername\Desktop\projects\tailor-billing"
   ```

---

### Step 3: Configure Database (5 minutes)

1. **Create the database:**
   ```powershell
   # Open PostgreSQL command line
   psql -U postgres
   ```
   
   Then in PostgreSQL:
   ```sql
   CREATE DATABASE tailor_billing_db;
   \q
   ```

2. **Configure environment file:**
   ```powershell
   cd backend\core
   copy .env.example .env
   notepad .env
   ```
   
   Edit these values in `.env`:
   ```env
   DB_NAME=tailor_billing_db
   DB_USER=postgres
   DB_PASSWORD=your-postgres-password-here
   ```

---

### Step 4: Setup Backend (10 minutes)

```powershell
# Go back to project root
cd C:\Users\YourUsername\Desktop\projects\tailor-billing

# Run setup script
.\setup-backend.ps1
```

This will:
- Create virtual environment
- Install all Python dependencies
- Take 5-10 minutes depending on internet speed

---

### Step 5: Setup Frontend (5 minutes)

```powershell
cd frontend
npm install
```

Wait for installation to complete.

---

### Step 6: Run Migrations (2 minutes)

```powershell
# Go back to project root
cd ..

# Run migration script
.\run-migrations.ps1
```

Choose option **3** (Both - make migrations then migrate)

---

### Step 7: Install Windows Service (5 minutes)

1. **Open PowerShell as Administrator**
   - Right-click PowerShell → "Run as administrator"

2. **Navigate to project:**
   ```powershell
   cd "C:\Users\YourUsername\Desktop\projects\tailor-billing"
   ```

3. **Install service:**
   ```powershell
   .\install-service.bat
   ```

4. **Start service:**
   ```powershell
   nssm start TailorBillingApp
   ```

---

### Step 8: Verify Everything Works (2 minutes)

1. **Check service status:**
   ```powershell
   nssm status TailorBillingApp
   ```
   Should show: `SERVICE_RUNNING`

2. **Test in browser:**
   - Backend: http://localhost:8001/api
   - Frontend: http://localhost:5173

3. **Check logs if needed:**
   ```powershell
   Get-Content logs\startup.log -Tail 10
   ```

---

## ✅ Setup Complete!

Your application is now:
- ✅ Running 24/7
- ✅ Auto-starts on system boot
- ✅ Auto-restarts if it crashes
- ✅ Accessible at http://localhost:5173

---

## 🆘 If Something Goes Wrong

### Service Not Starting?

```powershell
# Check logs
Get-Content logs\backend-errors.log -Tail 20

# Common issues:
# 1. Virtual environment not created → Run .\setup-backend.ps1
# 2. Database not created → Create database in PostgreSQL
# 3. Wrong database password → Check backend\core\.env
```

### Backend Not Working?

```powershell
# Test database connection
cd backend
.\venv\Scripts\python.exe manage.py check --database default

# Check if Django is installed
.\venv\Scripts\python.exe -c "import django; print(django.__version__)"
```

### Frontend Not Working?

```powershell
# Reinstall dependencies
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
```

---

## 📚 More Help

- **Detailed Guide:** See [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Service Management:** See [AUTO_START_SETUP.md](AUTO_START_SETUP.md)
- **Logs Location:** `logs\` directory

---

## 🎯 Common Commands After Setup

```powershell
# Start service
nssm start TailorBillingApp

# Stop service
nssm stop TailorBillingApp

# Restart service
nssm restart TailorBillingApp

# Run migrations
.\run-migrations.ps1

# View logs
Get-Content logs\startup.log -Tail 20
```

---

**That's it! Your application is ready to use! 🎉**
