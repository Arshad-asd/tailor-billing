# Network Troubleshooting Guide

## Common Network Errors During Git Sync

### Error: "Could not resolve hostname github.com"

This error means your computer cannot find the GitHub server. This is usually a network connectivity issue.

## Quick Checks

### 1. Check Internet Connection

```powershell
# Test basic internet connectivity
ping google.com

# Test GitHub specifically
ping github.com
```

**If ping fails:**
- Check your internet connection
- Check network cable/WiFi
- Restart your router/modem

### 2. Check DNS Resolution

```powershell
# Try to resolve GitHub hostname
nslookup github.com

# Or use
Resolve-DnsName github.com
```

**If DNS fails:**
- Try different DNS servers (8.8.8.8, 1.1.1.1)
- Check DNS settings in network adapter
- Restart DNS client service: `net stop dnscache && net start dnscache`

### 3. Check Firewall Settings

Windows Firewall might be blocking Git/SSH connections:

1. Open **Windows Defender Firewall**
2. Check if Git or SSH is blocked
3. Allow Git through firewall if needed

### 4. Check VPN/Proxy

If you're behind a corporate firewall or VPN:

- **VPN**: Ensure VPN is connected and working
- **Proxy**: Configure Git to use proxy:
  ```powershell
  git config --global http.proxy http://proxy.example.com:8080
  git config --global https.proxy https://proxy.example.com:8080
  ```

### 5. Check Git Remote URL

Verify your repository remote URL:

```powershell
git remote -v
```

**Common issues:**
- Wrong URL format
- Using SSH when HTTPS is required (or vice versa)
- Private repository without authentication

## Solutions

### Solution 1: Switch to HTTPS (if using SSH)

If SSH is blocked, switch to HTTPS:

```powershell
# Change remote URL from SSH to HTTPS
git remote set-url origin https://github.com/username/repository.git
```

### Solution 2: Configure SSH (if using SSH)

If you need SSH:

1. **Check SSH connection:**
   ```powershell
   ssh -T git@github.com
   ```

2. **If connection fails, check:**
   - SSH keys are set up correctly
   - SSH agent is running
   - GitHub SSH keys are added to your account

### Solution 3: Use Different DNS

Try using Google DNS or Cloudflare DNS:

1. Open **Network Settings**
2. Go to **Adapter Properties**
3. Select **Internet Protocol Version 4 (TCP/IPv4)**
4. Use these DNS servers:
   - **Preferred:** 8.8.8.8
   - **Alternate:** 8.8.4.4

Or use Cloudflare:
   - **Preferred:** 1.1.1.1
   - **Alternate:** 1.0.0.1

### Solution 4: Check Corporate Firewall

If you're on a corporate network:

- Contact IT department
- Ask them to whitelist `github.com` and `gitlab.com`
- Request proxy configuration if needed

### Solution 5: Test Connection Manually

```powershell
# Test HTTPS connection
curl -I https://github.com

# Test SSH connection (if using SSH)
ssh -T git@github.com
```

## Prevention

### Always Check Network Before Sync

The GUI application now checks network connectivity before attempting to pull. If it detects a network issue, it will:

1. Show a clear error message
2. Provide troubleshooting steps
3. Skip the pull operation (to avoid wasting time)

### Use Offline Mode

If you know you're offline, don't use the Sync feature. The application will still work for:
- Starting/stopping service
- Viewing logs
- Running migrations

## Still Having Issues?

1. **Check Windows Event Viewer** for network errors
2. **Check antivirus software** - might be blocking connections
3. **Try from command line** to see detailed error messages:
   ```powershell
   git pull origin development
   ```
4. **Check Git configuration:**
   ```powershell
   git config --list
   ```

---

**Note**: Network errors are usually temporary. Try again after:
- Checking internet connection
- Restarting network adapter
- Waiting a few minutes (in case of temporary outage)
