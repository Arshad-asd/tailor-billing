# Service Manager - Handles NSSM service operations

import subprocess
import os
import sys
import ctypes
from pathlib import Path
from config import SERVICE_NAME, NSSM_COMMAND

def is_admin():
    """Check if the script is running with administrator privileges"""
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def request_admin_elevation():
    """Request administrator elevation and restart the script"""
    if is_admin():
        return True
    else:
        # Re-run the program with admin rights
        script_path = sys.argv[0]
        if script_path.endswith('.py'):
            # Running as script
            cmd = f'"{sys.executable}" "{script_path}"'
        else:
            # Running as exe
            cmd = f'"{script_path}"'
        
        try:
            ctypes.windll.shell32.ShellExecuteW(
                None, "runas", sys.executable if script_path.endswith('.py') else script_path,
                script_path if script_path.endswith('.py') else "",
                None, 1
            )
        except Exception:
            # Fallback
            ctypes.windll.shell32.ShellExecuteW(
                None, "runas", script_path, "", None, 1
            )
        return False

class ServiceManager:
    def __init__(self):
        self.service_name = SERVICE_NAME
        self.nssm_command = NSSM_COMMAND
    
    def run_command(self, command, shell=True, capture_output=True):
        """Run a command and return the result"""
        try:
            result = subprocess.run(
                command,
                shell=shell,
                capture_output=capture_output,
                text=True,
                timeout=30
            )
            
            # Check for access denied errors
            error_text = result.stderr.strip() if result.stderr else ""
            output_text = result.stdout.strip() if result.stdout else ""
            combined_error = (error_text + " " + output_text).lower()
            
            is_access_denied = (
                'access is denied' in combined_error or
                'openservice' in combined_error and 'denied' in combined_error or
                'access denied' in combined_error
            )
            
            return {
                'success': result.returncode == 0 and not is_access_denied,
                'output': output_text,
                'error': error_text if error_text else (output_text if is_access_denied else ""),
                'returncode': result.returncode,
                'access_denied': is_access_denied
            }
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'output': '',
                'error': 'Command timed out',
                'returncode': -1,
                'access_denied': False
            }
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': str(e),
                'returncode': -1,
                'access_denied': False
            }

    def _is_not_installed_error(self, result):
        """Check if the error indicates the service is not installed"""
        err = (result.get('error') or '').lower()
        out = (result.get('output') or '').lower()
        combined = err + ' ' + out
        return (
            'does not exist' in combined or
            'not exist' in combined or
            'cannot open service' in combined or
            'not installed' in combined or
            'no installed service' in combined
        )

    def get_service_status(self):
        """Get the current status of the service"""
        result = self.run_command(f'{self.nssm_command} status {self.service_name}')
        if result['success']:
            status = result['output'].strip()
            if 'SERVICE_RUNNING' in status:
                return 'running'
            elif 'SERVICE_STOPPED' in status:
                return 'stopped'
            elif 'SERVICE_PAUSED' in status:
                return 'paused'
            else:
                return 'unknown'
        else:
            # Service might not exist
            if self._is_not_installed_error(result):
                return 'not_installed'
            return 'error'

    def start_service(self):
        """Start the service"""
        result = self.run_command(f'{self.nssm_command} start {self.service_name}')
        if not result['success'] and self._is_not_installed_error(result):
            result['not_installed'] = True
        return result

    def stop_service(self):
        """Stop the service"""
        result = self.run_command(f'{self.nssm_command} stop {self.service_name}')
        if not result['success'] and self._is_not_installed_error(result):
            result['not_installed'] = True
        return result

    def restart_service(self):
        """Restart the service"""
        result = self.run_command(f'{self.nssm_command} restart {self.service_name}')
        if not result['success'] and self._is_not_installed_error(result):
            result['not_installed'] = True
        return result

    def check_nssm_installed(self):
        """Check if NSSM is installed and accessible"""
        result = self.run_command(f'{self.nssm_command} version')
        return result['success']

    def get_service_info(self):
        """Get detailed service information"""
        status = self.get_service_status()
        info = {
            'status': status,
            'name': self.service_name,
            'nssm_installed': self.check_nssm_installed()
        }
        
        # Try to get more details if service exists
        if status != 'not_installed':
            result = self.run_command(f'{self.nssm_command} status {self.service_name}')
            info['status_text'] = result['output']
        
        return info
