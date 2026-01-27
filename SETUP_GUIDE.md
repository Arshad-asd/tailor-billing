# Tailor Billing Application - Complete Setup Guide

> **👉 For a simpler quick-start guide, see [QUICK_START.md](QUICK_START.md)**

This guide will help you set up the Tailor Billing application on a new Windows system from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Setup](#database-setup)
4. [Service Installation](#service-installation)
5. [Verification](#verification)
6. [Daily Operations](#daily-operations)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

Before starting, ensure you have the following installed:

1. **Python 3.10 or higher**
   - Download from: https://www.python.org/downloads/
   - During installation, check "Add Python to PATH"
   - Verify installation:
     ```powershell
     python --version
     ```

2. **Node.js 16 or higher**
   - Download from: https://nodejs.org/
   - Install the LTS version
   - Verify installation:
     ```powershell
     node --version
     npm --version
     ```

3. **PostgreSQL Database**
   - Download from: https://www.postgresql.org/download/windows/
   - Install PostgreSQL with default settings
   - Remember the postgres user password you set during installation
   - Verify installation:
     ```powershell
     psql --version
     ```

4. **NSSM (Non-Sucking Service Manager)**
   - Download from: https://nssm.cc/download
   - Extract the ZIP file
   - Add `nssm.exe` (64-bit) to your system PATH, OR
   - Place `nssm.exe` in the project root directory
   - Or install via Chocolatey:
     ```powershell
     choco install nssm -y
     ```

### System Requirements

- Windows 10/11 or Windows Server 2016+
- At least 4GB RAM
- At least 2GB free disk space
- Administrator access (for service installation)

---

## Initial Setup

### Step 1: Clone or Copy the Project

If you have the project files, place them in a location like:
```
C:\Users\YourUsername\Desktop\projects\tailor-billing
```

Or clone from your repository:
```powershell
git clone <your-repository-url>
cd tailor-billing
```

### Step 2: Configure Environment Variables

1. Navigate to the backend directory:
   ```powershell
   cd backend\core
   ```

2. Copy the example environment file:
   ```powershell
   copy .env.example .env
   ```

3. Edit `.env` file with your database credentials:
   ```env
   # Django Settings
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1

   # Database Settings
   DB_ENGINE=django.db.backends.postgresql
   DB_NAME=tailor_billing_db
   DB_USER=postgres
   DB_PASSWORD=your-postgres-password
   DB_HOST=localhost
   DB_PORT=5432

   # Email Settings
   EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
   EMAIL_HOST=localhost
   EMAIL_PORT=1025
   EMAIL_USE_TLS=False
   EMAIL_USE_SSL=False
   DEFAULT_FROM_EMAIL=noreply@tailorbilling.com

   # JWT Settings
   JWT_ACCESS_TOKEN_LIFETIME=60
   JWT_REFRESH_TOKEN_LIFETIME=1440

   # CORS Settings
   CORS_ALLOW_ALL_ORIGINS=True
   CORS_ALLOW_CREDENTIALS=True
   ```

### Step 3: Create Virtual Environment and Install Dependencies

Run the setup script:

```powershell
cd C:\Users\YourUsername\Desktop\projects\tailor-billing
.\setup-backend.ps1
```

This script will:
- Create a Python virtual environment
- Install all backend dependencies from `requirements.txt`
- Set up the Python environment

**Manual Alternative:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Install Frontend Dependencies

```powershell
cd frontend
npm install
```

---

## Database Setup

### Step 1: Create PostgreSQL Database

1. Open PostgreSQL command line or pgAdmin
2. Create a new database:
   ```sql
   CREATE DATABASE tailor_billing_db;
   ```
   Or using command line:
   ```powershell
   psql -U postgres
   CREATE DATABASE tailor_billing_db;
   \q
   ```

### Step 2: Run Database Migrations

```powershell
cd C:\Users\YourUsername\Desktop\projects\tailor-billing
.\run-migrations.ps1
```

Choose option **3** (Both - make migrations then migrate)

**Manual Alternative:**
```powershell
cd backend
.\venv\Scripts\python.exe manage.py makemigrations
.\venv\Scripts\python.exe manage.py migrate
```

### Step 3: Create Superuser (Optional)

```powershell
cd backend
.\venv\Scripts\python.exe manage.py createsuperuser
```

Follow the prompts to create an admin user.

---

## Service Installation

### Step 1: Install NSSM (if not already installed)

```powershell
# Using Chocolatey
choco install nssm -y

# Or download manually from https://nssm.cc/download
# Extract and add to PATH or place in project root
```

### Step 2: Install the Windows Service

1. **Open PowerShell as Administrator**
   - Right-click on PowerShell
   - Select "Run as administrator"

2. **Navigate to project directory:**
   ```powershell
   cd C:\Users\YourUsername\Desktop\projects\tailor-billing
   ```

3. **Run the installation script:**
   ```powershell
   .\install-service.bat
   ```

   Or right-click `install-service.bat` and select "Run as administrator"

4. **Verify installation:**
   ```powershell
   nssm status TailorBillingApp
   ```
   
   Should show: `SERVICE_RUNNING` or `SERVICE_STOPPED`

### Step 3: Start the Service

```powershell
nssm start TailorBillingApp
```

### Step 4: Verify Service Status

```powershell
nssm status TailorBillingApp
```

Should show: `SERVICE_RUNNING`

---

## Verification

### Step 1: Check Service Status

```powershell
nssm status TailorBillingApp
```

### Step 2: Check Application Ports

```powershell
# Check backend (port 8001)
netstat -ano | findstr :8001

# Check frontend (port 5173)
netstat -ano | findstr :5173
```

### Step 3: Test Application Access

1. **Backend API:**
   - Open browser: `http://localhost:8001/api`
   - Should show API response or Django REST framework interface

2. **Frontend Application:**
   - Open browser: `http://localhost:5173`
   - Should show the Tailor Billing application

### Step 4: Check Logs

```powershell
# View startup logs
Get-Content logs\startup.log -Tail 20

# View error logs
Get-Content logs\startup-errors.log -Tail 20

# View backend errors
Get-Content logs\backend-errors.log -Tail 20
```

---

## Daily Operations

### Starting the Service

```powershell
nssm start TailorBillingApp
```

### Stopping the Service

```powershell
nssm stop TailorBillingApp
```

### Restarting the Service

```powershell
nssm restart TailorBillingApp
```

### Running Migrations

When you make changes to models:

```powershell
cd C:\Users\YourUsername\Desktop\projects\tailor-billing
.\run-migrations.ps1
```

Choose:
- **1** - Make migrations (create migration files)
- **2** - Apply migrations (update database)
- **3** - Both (recommended)
- **4** - Show migration status

### Viewing Logs

```powershell
# Startup logs
Get-Content logs\startup.log -Tail 50

# Error logs
Get-Content logs\startup-errors.log -Tail 50

# Backend errors
Get-Content logs\backend-errors.log -Tail 50

# Service output
Get-Content logs\service-output.log -Tail 50
```

### Updating Dependencies

**Backend:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt --upgrade
```

**Frontend:**
```powershell
cd frontend
npm update
```

---

## Troubleshooting

### Service Won't Start

1. **Check if NSSM is installed:**
   ```powershell
   nssm --version
   ```

2. **Check service logs:**
   ```powershell
   Get-Content logs\service-error.log
   Get-Content logs\startup-errors.log
   ```

3. **Verify virtual environment exists:**
   ```powershell
   Test-Path backend\venv\Scripts\python.exe
   ```

4. **Reinstall service:**
   ```powershell
   nssm stop TailorBillingApp
   nssm remove TailorBillingApp confirm
   .\install-service.bat
   ```

### Backend Not Running

1. **Check if Python is found:**
   ```powershell
   backend\venv\Scripts\python.exe --version
   ```

2. **Check Django installation:**
   ```powershell
   cd backend
   .\venv\Scripts\python.exe -c "import django; print(django.__version__)"
   ```

3. **Check database connection:**
   ```powershell
   cd backend
   .\venv\Scripts\python.exe manage.py check --database default
   ```

4. **View backend errors:**
   ```powershell
   Get-Content logs\backend-errors.log -Tail 30
   ```

### Frontend Not Running

1. **Check if Node.js is installed:**
   ```powershell
   node --version
   npm --version
   ```

2. **Reinstall frontend dependencies:**
   ```powershell
   cd frontend
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

3. **Check if port 5173 is in use:**
   ```powershell
   netstat -ano | findstr :5173
   ```

### Database Connection Issues

1. **Verify PostgreSQL is running:**
   ```powershell
   Get-Service postgresql*
   ```

2. **Test database connection:**
   ```powershell
   psql -U postgres -d tailor_billing_db -c "SELECT version();"
   ```

3. **Check .env file:**
   ```powershell
   Get-Content backend\core\.env
   ```
   Verify database credentials match your PostgreSQL setup.

### Port Already in Use

If ports 8001 or 5173 are already in use:

1. **Find process using the port:**
   ```powershell
   netstat -ano | findstr :8001
   ```

2. **Stop the process:**
   ```powershell
   Stop-Process -Id <PID> -Force
   ```

3. **Or change the port in:**
   - Backend: Edit `start-application-simple.ps1` (change `8001` to another port)
   - Frontend: Edit `frontend\vite.config.js` or `package.json`

---

## Quick Reference

### Service Management

| Action | Command |
|--------|---------|
| Install Service | `.\install-service.bat` (as Admin) |
| Uninstall Service | `.\uninstall-service.bat` (as Admin) |
| Start Service | `nssm start TailorBillingApp` |
| Stop Service | `nssm stop TailorBillingApp` |
| Restart Service | `nssm restart TailorBillingApp` |
| Check Status | `nssm status TailorBillingApp` |
| View Service Settings | `nssm edit TailorBillingApp` |

### Application URLs

- **Backend API:** http://localhost:8001/api
- **Frontend App:** http://localhost:5173
- **Django Admin:** http://localhost:8001/admin

### Important Files

- **Service Script:** `start-application-simple.ps1`
- **Environment Config:** `backend\core\.env`
- **Migration Script:** `run-migrations.ps1`
- **Setup Script:** `setup-backend.ps1`
- **Logs Directory:** `logs\`

### Common Commands

```powershell
# Run migrations
.\run-migrations.ps1

# Setup backend (first time)
.\setup-backend.ps1

# Manual start (for testing)
.\start-application.ps1

# Stop application
.\stop-application.ps1

# View logs
Get-Content logs\startup.log -Tail 20
```

---

## Post-Installation Checklist

- [ ] Python installed and in PATH
- [ ] Node.js installed and in PATH
- [ ] PostgreSQL installed and running
- [ ] Database created
- [ ] Virtual environment created
- [ ] Dependencies installed (backend and frontend)
- [ ] Environment variables configured (.env file)
- [ ] Database migrations applied
- [ ] NSSM installed
- [ ] Windows service installed
- [ ] Service running successfully
- [ ] Backend accessible at http://localhost:8001
- [ ] Frontend accessible at http://localhost:5173
- [ ] Logs directory created and accessible

---

## Support

If you encounter issues:

1. Check the logs in `logs\` directory
2. Review Windows Event Viewer
3. Verify all prerequisites are installed correctly
4. Ensure all paths in scripts match your system
5. Check that PostgreSQL service is running
6. Verify firewall isn't blocking ports 8001 and 5173

---

**Last Updated:** January 2026
