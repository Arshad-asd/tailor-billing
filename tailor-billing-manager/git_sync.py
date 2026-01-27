# Git Sync Module - Handles Git operations

import subprocess
import os
import socket
from pathlib import Path
from config import GIT_REPO_PATH

def check_network_connectivity(hostname='github.com', port=443):
    """Check if network connectivity to a host is available"""
    try:
        socket.create_connection((hostname, port), timeout=5)
        return True
    except (socket.gaierror, socket.timeout, OSError):
        return False

def get_remote_url():
    """Get the remote repository URL"""
    result = run_git_command('git remote get-url origin')
    if result['success'] and result['output']:
        return result['output'].strip()
    return None

def run_git_command(command, cwd=None):
    """Run a git command and return the result"""
    if cwd is None:
        cwd = GIT_REPO_PATH
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=60
        )
        return {
            'success': result.returncode == 0,
            'output': result.stdout.strip(),
            'error': result.stderr.strip(),
            'returncode': result.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'output': '',
            'error': 'Git command timed out',
            'returncode': -1
        }
    except Exception as e:
        return {
            'success': False,
            'output': '',
            'error': str(e),
            'returncode': -1
        }

def check_git_installed():
    """Check if Git is installed"""
    result = run_git_command('git --version')
    return result['success']

def check_git_repo():
    """Check if current directory is a git repository"""
    result = run_git_command('git rev-parse --is-inside-work-tree')
    return result['success'] and result['output'] == 'true'

def get_git_status():
    """Get current git status"""
    if not check_git_repo():
        return {
            'success': False,
            'error': 'Not a git repository',
            'is_repo': False
        }
    
    result = run_git_command('git status --short')
    return {
        'success': True,
        'is_repo': True,
        'status': result['output'],
        'has_changes': len(result['output']) > 0
    }

def get_current_branch():
    """Get current git branch"""
    result = run_git_command('git branch --show-current')
    if result['success']:
        return result['output'].strip()
    return None

def get_remote_tracking_branch():
    """Get the remote tracking branch for current branch"""
    current_branch = get_current_branch()
    if not current_branch:
        return None
    
    result = run_git_command(f'git rev-parse --abbrev-ref --symbolic-full-name @{{u}}')
    if result['success'] and result['output']:
        return result['output'].strip()
    
    # Try to get remote branch info
    result = run_git_command(f'git config branch.{current_branch}.remote')
    remote = result['output'].strip() if result['success'] and result['output'] else 'origin'
    
    result = run_git_command(f'git config branch.{current_branch}.merge')
    merge = result['output'].strip() if result['success'] and result['output'] else f'refs/heads/{current_branch}'
    
    if merge.startswith('refs/heads/'):
        merge = merge.replace('refs/heads/', '')
    
    return f"{remote}/{merge}"

def get_branch_info():
    """Get comprehensive branch information"""
    current_branch = get_current_branch()
    if not current_branch:
        return {
            'current_branch': None,
            'remote_branch': None,
            'has_remote': False
        }
    
    remote_branch = get_remote_tracking_branch()
    
    # Check if remote exists
    result = run_git_command('git remote')
    has_remote = result['success'] and len(result['output'].strip()) > 0
    
    return {
        'current_branch': current_branch,
        'remote_branch': remote_branch,
        'has_remote': has_remote
    }

def get_all_branches():
    """Get list of all branches (local and remote)"""
    if not check_git_repo():
        return {
            'success': False,
            'local_branches': [],
            'remote_branches': [],
            'error': 'Not a git repository'
        }
    
    # Get local branches
    local_result = run_git_command('git branch')
    local_branches = []
    if local_result['success']:
        for line in local_result['output'].split('\n'):
            line = line.strip()
            if line:
                # Remove * and spaces
                branch = line.replace('*', '').strip()
                if branch:
                    local_branches.append(branch)
    
    # Get remote branches
    remote_result = run_git_command('git branch -r')
    remote_branches = []
    if remote_result['success']:
        for line in remote_result['output'].split('\n'):
            line = line.strip()
            if line and 'HEAD' not in line:
                # Remove origin/ prefix
                branch = line.replace('origin/', '').strip()
                if branch:
                    remote_branches.append(branch)
    
    # Get all branches (local and remote combined, unique)
    all_branches_result = run_git_command('git branch -a')
    all_branches = []
    if all_branches_result['success']:
        seen = set()
        for line in all_branches_result['output'].split('\n'):
            line = line.strip()
            if line and 'HEAD' not in line:
                # Remove remotes/origin/ and * prefix
                branch = line.replace('*', '').replace('remotes/origin/', '').replace('remotes/', '').strip()
                if branch and branch not in seen:
                    seen.add(branch)
                    all_branches.append(branch)
    
    return {
        'success': True,
        'local_branches': local_branches,
        'remote_branches': remote_branches,
        'all_branches': all_branches
    }

def switch_branch(branch_name):
    """Switch to a different branch"""
    if not check_git_repo():
        return {
            'success': False,
            'error': 'Not a git repository'
        }
    
    # Check if branch exists locally
    check_result = run_git_command(f'git branch --list {branch_name}')
    branch_exists_local = check_result['success'] and len(check_result['output'].strip()) > 0
    
    if branch_exists_local:
        # Switch to existing local branch
        result = run_git_command(f'git checkout {branch_name}')
    else:
        # Try to checkout remote branch (creates local tracking branch)
        result = run_git_command(f'git checkout -b {branch_name} origin/{branch_name}')
        if not result['success']:
            # If that fails, try just creating the branch
            result = run_git_command(f'git checkout -b {branch_name}')
    
    return {
        'success': result['success'],
        'output': result['output'],
        'error': result['error']
    }

def pull_latest_code(branch=None):
    """Pull latest code from remote repository
    
    Args:
        branch: Optional branch name to pull. If None, pulls from current branch's upstream.
    """
    if not check_git_repo():
        return {
            'success': False,
            'error': 'Not a git repository'
        }
    
    # Get branch info
    branch_info = get_branch_info()
    current_branch = branch_info['current_branch']
    remote_branch = branch_info.get('remote_branch')
    
    # First fetch
    fetch_result = run_git_command('git fetch')
    
    # Determine which branch to pull
    if branch and branch != current_branch:
        # Pull specific branch
        pull_command = f'git pull origin {branch}'
        branch_to_pull = branch
    else:
        # Check if upstream is configured
        if remote_branch and remote_branch != 'N/A' and '/' in remote_branch:
            # Upstream is configured, use regular pull
            pull_command = 'git pull'
            branch_to_pull = current_branch
        else:
            # No upstream configured, pull directly from origin/current_branch
            pull_command = f'git pull origin {current_branch}'
            branch_to_pull = f'origin/{current_branch}'
    
    # Execute pull
    pull_result = run_git_command(pull_command)
    
    # If pull failed due to no tracking info, try alternative approach
    if not pull_result['success']:
        error_lower = pull_result['error'].lower()
        if 'no tracking information' in error_lower or 'please specify which branch' in error_lower:
            # Try pulling directly from origin
            if current_branch:
                pull_result = run_git_command(f'git pull origin {current_branch}')
                if pull_result['success']:
                    # Success! Now set upstream for future pulls
                    set_upstream = run_git_command(f'git branch --set-upstream-to=origin/{current_branch} {current_branch}')
                    if set_upstream['success']:
                        # Add note to output
                        if pull_result['output']:
                            pull_result['output'] += f'\n(Upstream tracking set to origin/{current_branch})'
                        else:
                            pull_result['output'] = f'Upstream tracking set to origin/{current_branch}'
    
    return {
        'success': pull_result['success'],
        'output': pull_result['output'],
        'error': pull_result['error'],
        'fetch_output': fetch_result['output'],
        'branch_pulled': branch_to_pull if 'branch_to_pull' in locals() else (branch if branch else current_branch),
        'remote_branch': remote_branch
    }

def sync_from_remote(service_was_running=False, service_manager=None):
    """
    Complete sync process:
    1. Stop service if running
    2. Pull latest code
    3. Optionally run migrations
    4. Restart service if it was running
    """
    steps = []
    errors = []
    
    # Step 1: Check if service is running
    if service_manager:
        status = service_manager.get_service_status()
        service_was_running = (status == 'running')
        steps.append("✓ Checked service status")
    
    # Step 2: Stop service if running
    if service_was_running and service_manager:
        stop_result = service_manager.stop_service()
        if stop_result['success']:
            steps.append("✓ Stopped service")
        else:
            if stop_result.get('access_denied', False):
                errors.append("Access Denied: Failed to stop service. Administrator rights required.")
            else:
                errors.append(f"Failed to stop service: {stop_result['error']}")
            steps.append("✗ Failed to stop service")
    
    # Step 3: Check Git
    if not check_git_installed():
        errors.append("Git is not installed")
        steps.append("✗ Git not found")
        return {
            'success': False,
            'steps': steps,
            'errors': errors
        }
    
    if not check_git_repo():
        errors.append("Current directory is not a git repository")
        steps.append("✗ Not a git repository")
        return {
            'success': False,
            'steps': steps,
            'errors': errors
        }
    
    steps.append("✓ Git repository found")
    
    # Get branch info before pulling
    branch_info = get_branch_info()
    current_branch = branch_info.get('current_branch', 'unknown')
    remote_branch = branch_info.get('remote_branch', 'N/A')
    
    steps.append(f"Current branch: {current_branch}")
    if remote_branch and remote_branch != 'N/A':
        steps.append(f"Pulling from: {remote_branch}")
    
    # Step 4: Check network connectivity before pulling
    remote_url = get_remote_url()
    network_issue = False
    if remote_url:
        # Extract hostname from URL
        hostname = None
        if 'github.com' in remote_url:
            hostname = 'github.com'
        elif 'gitlab.com' in remote_url:
            hostname = 'gitlab.com'
        elif 'bitbucket.org' in remote_url:
            hostname = 'bitbucket.org'
        elif '@' in remote_url and ':' in remote_url:
            # SSH format: git@hostname:path
            try:
                hostname = remote_url.split('@')[1].split(':')[0]
            except:
                pass
        elif 'http' in remote_url or 'https' in remote_url:
            # HTTP format: https://hostname/path
            try:
                from urllib.parse import urlparse
                parsed = urlparse(remote_url)
                hostname = parsed.hostname
            except:
                pass
        
        if hostname:
            if not check_network_connectivity(hostname):
                network_issue = True
                errors.append(f"Network Error: Cannot connect to {hostname}")
                errors.append("Please check:")
                errors.append("  - Internet connection")
                errors.append("  - Firewall settings")
                errors.append("  - DNS resolution")
                errors.append("  - VPN connection (if required)")
                steps.append("✗ Network connectivity check failed")
    
    # Step 5: Pull latest code (only if network is OK)
    if not network_issue:
        pull_result = pull_latest_code()
        if pull_result['success']:
            pulled_branch = pull_result.get('branch_pulled', current_branch)
            steps.append(f"✓ Pulled latest code from {pulled_branch}")
            if pull_result['output']:
                steps.append(f"  → {pull_result['output']}")
        else:
            # Check if it's a network-related error
            error_lower = pull_result['error'].lower()
            if 'could not resolve hostname' in error_lower or 'name or service not known' in error_lower:
                errors.append(f"Network Error: {pull_result['error']}")
                errors.append("Cannot resolve hostname. Check internet connection and DNS settings.")
            elif 'connection timed out' in error_lower or 'connection refused' in error_lower:
                errors.append(f"Network Error: {pull_result['error']}")
                errors.append("Cannot connect to remote server. Check firewall and network settings.")
            else:
                errors.append(f"Git pull failed: {pull_result['error']}")
            steps.append("✗ Git pull failed")
    else:
        # Skip pull if network check failed
        pull_result = {'success': False, 'error': 'Network connectivity check failed'}
        steps.append("✗ Git pull skipped (network issue)")
    
    # Step 6: Restart service if it was running
    
    # Step 7: Restart service if it was running
    if service_was_running and service_manager:
        start_result = service_manager.start_service()
        if start_result['success']:
            steps.append("✓ Restarted service")
        else:
            if start_result.get('access_denied', False):
                errors.append("Access Denied: Failed to restart service. Administrator rights required.")
            else:
                errors.append(f"Failed to restart service: {start_result['error']}")
            steps.append("✗ Failed to restart service")
    
    return {
        'success': len(errors) == 0,
        'steps': steps,
        'errors': errors,
        'pull_output': pull_result.get('output', '')
    }
