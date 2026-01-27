# Tailor Billing Application

A comprehensive billing and management system for tailor shops.

## Quick Start

### For New System Setup

**👉 NEW USERS: Start with [QUICK_START.md](QUICK_START.md) - Simple step-by-step guide**

**👉 For detailed instructions: See [SETUP_GUIDE.md](SETUP_GUIDE.md)**

### Quick Setup (If Prerequisites are Installed)

1. **Setup Backend:**
   ```powershell
   .\setup-backend.ps1
   ```

2. **Install Service:**
   ```powershell
   # Run as Administrator
   .\install-service.bat
   ```

3. **Start Service:**
   ```powershell
   nssm start TailorBillingApp
   ```

## Application URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8001/api
- **Admin Panel:** http://localhost:8001/admin

## Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup guide for new systems
- **[AUTO_START_SETUP.md](AUTO_START_SETUP.md)** - Auto-start and service configuration
- **[GUI Application](tailor-billing-manager/)** - Desktop GUI for managing the application

## Service Management

```powershell
# Start service
nssm start TailorBillingApp

# Stop service
nssm stop TailorBillingApp

# Restart service
nssm restart TailorBillingApp

# Check status
nssm status TailorBillingApp
```

## Running Migrations

```powershell
.\run-migrations.ps1
```

## Project Structure

```
tailor-billing/
├── backend/              # Django backend application
│   ├── apps/            # Django apps
│   ├── core/            # Core settings and configuration
│   └── manage.py        # Django management script
├── frontend/            # React/Vite frontend application
├── logs/                # Application logs
├── install-service.bat  # Service installation script
├── setup-backend.ps1    # Backend setup script
├── run-migrations.ps1   # Migration helper script
└── SETUP_GUIDE.md       # Complete setup documentation
```

## Requirements

- Python 3.10+
- Node.js 16+
- PostgreSQL
- NSSM (for Windows service)

## Support

For issues or questions, check:
1. `SETUP_GUIDE.md` - Complete setup instructions
2. `logs/` directory - Application logs
3. Windows Event Viewer - System logs

---

**Version:** 1.0  
**Last Updated:** January 2026
