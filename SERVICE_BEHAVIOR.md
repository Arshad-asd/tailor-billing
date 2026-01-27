# Service Behavior - Shutdown, Restart, and Sleep

This document explains how the Tailor Billing application behaves during system shutdown, restart, and sleep modes.

## Service Configuration

The application is installed as a **Windows Service** using NSSM with the following settings:
- **Startup Type:** Automatic (SERVICE_AUTO_START)
- **Restart on Failure:** Enabled
- **Restart Delay:** 5 seconds

---

## System Shutdown

### What Happens:
- ✅ **Service stops gracefully** when Windows shuts down
- ✅ **All processes are terminated** (backend and frontend)
- ✅ **No data loss** - Django and database handle shutdown properly

### After Shutdown:
- The application is **stopped** and will **NOT** run until the system is powered on again

---

## System Restart

### What Happens:
1. **During Restart:**
   - Service stops gracefully
   - All processes terminate
   - System reboots

2. **After Restart:**
   - ✅ **Service automatically starts** when Windows boots
   - ✅ **Backend starts automatically** on port 8001
   - ✅ **Frontend starts automatically** on port 5173
   - ✅ **No manual intervention needed**

### Verification After Restart:
```powershell
# Check if service is running
nssm status TailorBillingApp

# Should show: SERVICE_RUNNING

# Check if ports are active
netstat -ano | findstr :8001
netstat -ano | findstr :5173
```

---

## Sleep Mode

### What Happens:
- ⚠️ **Service is paused** when system goes to sleep
- ⚠️ **Processes are suspended** (not terminated)
- ⚠️ **Application is not accessible** while sleeping

### After Wake Up:
- ✅ **Service automatically resumes** when system wakes
- ✅ **Backend and frontend resume** automatically
- ✅ **No restart needed**

### Important Note:
If the service doesn't resume properly after sleep, you may need to restart it:
```powershell
nssm restart TailorBillingApp
```

---

## Hibernate Mode

### What Happens:
- ⚠️ **Service stops** (similar to shutdown)
- ⚠️ **All processes terminate**
- ⚠️ **Application is not accessible**

### After Resume from Hibernate:
- ✅ **Service automatically starts** when system resumes
- ✅ **Backend and frontend start automatically**
- ✅ **Works like a restart**

---

## Power Loss / Unexpected Shutdown

### What Happens:
- ⚠️ **Service stops immediately** (no graceful shutdown)
- ⚠️ **Processes are terminated abruptly**

### After Power Restored:
- ✅ **Service automatically starts** when Windows boots
- ✅ **Application resumes automatically**
- ✅ **Database should recover** (PostgreSQL handles this)

### Important:
- Ensure PostgreSQL is also set to auto-start on boot
- Check database integrity after unexpected shutdowns

---

## Service Auto-Start Configuration

The service is configured with:
```batch
nssm set TailorBillingApp Start SERVICE_AUTO_START
```

This means:
- ✅ Starts automatically on Windows boot
- ✅ Starts automatically after system restart
- ✅ Starts automatically after hibernate resume
- ⚠️ Does NOT start during sleep (service is paused, not stopped)

---

## Testing Auto-Start

To verify auto-start works:

1. **Test Restart:**
   ```powershell
   # Restart your computer
   Restart-Computer
   
   # After restart, check service
   nssm status TailorBillingApp
   # Should show: SERVICE_RUNNING
   ```

2. **Test Sleep/Wake:**
   ```powershell
   # Put system to sleep
   # After waking, check service
   nssm status TailorBillingApp
   Get-Content logs\startup.log -Tail 10
   ```

---

## Troubleshooting

### Service Not Starting After Restart

1. **Check service status:**
   ```powershell
   nssm status TailorBillingApp
   ```

2. **Check Windows Event Viewer:**
   - Press `Win + X` → Event Viewer
   - Look for errors related to TailorBillingApp

3. **Check logs:**
   ```powershell
   Get-Content logs\startup-errors.log
   Get-Content logs\service-error.log
   ```

4. **Manually start if needed:**
   ```powershell
   nssm start TailorBillingApp
   ```

### Service Not Resuming After Sleep

1. **Restart the service:**
   ```powershell
   nssm restart TailorBillingApp
   ```

2. **Check if PostgreSQL is running:**
   ```powershell
   Get-Service postgresql*
   ```

3. **Verify ports are available:**
   ```powershell
   netstat -ano | findstr :8001
   netstat -ano | findstr :5173
   ```

---

## Summary

| Event | Application Status | Auto-Restart? |
|-------|-------------------|---------------|
| **System Shutdown** | Stops | No (until next boot) |
| **System Restart** | Stops → Auto-starts on boot | ✅ Yes |
| **Sleep Mode** | Paused | ✅ Resumes on wake |
| **Hibernate** | Stops → Auto-starts on resume | ✅ Yes |
| **Power Loss** | Stops abruptly | ✅ Yes (on boot) |
| **Application Crash** | Stops | ✅ Yes (auto-restart) |

---

## Best Practices

1. **Regular Backups:**
   - Backup database regularly
   - Especially before major updates

2. **Monitor Logs:**
   - Check logs after unexpected shutdowns
   - Verify database integrity

3. **PostgreSQL Auto-Start:**
   - Ensure PostgreSQL service is set to auto-start
   - Check: `Get-Service postgresql*`

4. **Test After Changes:**
   - After system updates, verify service still works
   - Test restart to ensure auto-start functions

---

## Quick Commands

```powershell
# Check service status
nssm status TailorBillingApp

# Manually start (if needed after restart)
nssm start TailorBillingApp

# Check if application is running
netstat -ano | findstr :8001
netstat -ano | findstr :5173

# View recent logs
Get-Content logs\startup.log -Tail 20
```

---

**Last Updated:** January 2026
