# Build script to create executable from the GUI application

import subprocess
import sys
import os
from pathlib import Path

def build_exe():
    """Build the executable using PyInstaller"""
    
    print("=" * 50)
    print("Building Tailor Billing Manager Executable")
    print("=" * 50)
    print()
    
    # Check if PyInstaller is installed
    try:
        import PyInstaller
        print("✓ PyInstaller found")
    except ImportError:
        print("Installing PyInstaller...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pyinstaller"], check=True)
        print("✓ PyInstaller installed")
    
    # Get current directory
    script_dir = Path(__file__).parent
    main_script = script_dir / "main.py"
    
    if not main_script.exists():
        print(f"ERROR: {main_script} not found!")
        return False
    
    print(f"Building from: {main_script}")
    print()
    
    # PyInstaller command - use python -m PyInstaller for better compatibility
    cmd = [
        sys.executable,                 # Use the same Python interpreter
        "-m", "PyInstaller",            # Run PyInstaller as a module
        "--onefile",                    # Single executable file
        "--windowed",                    # Hide console window (no terminal)
        "--name", "TailorBillingManager",  # Executable name
        "--hidden-import", "tkinter",
        "--hidden-import", "tkinter.ttk",
        "--hidden-import", "tkinter.scrolledtext",
        "--hidden-import", "tkinter.messagebox",
        "--hidden-import", "subprocess",
        "--hidden-import", "threading",
        "--hidden-import", "webbrowser",
        "--hidden-import", "pathlib",
        "--hidden-import", "datetime",
        "--hidden-import", "ctypes",
        "--hidden-import", "socket",
        "--hidden-import", "urllib.parse",
        "--hidden-import", "config",      # Local module
        "--hidden-import", "service_manager",  # Local module
        "--hidden-import", "git_sync",     # Local module
        "--collect-all", "tkinter",        # Collect all tkinter data files
        "--clean",                      # Clean cache
        str(main_script)
    ]
    
    try:
        print("Running PyInstaller...")
        print(" ".join(cmd))
        print()
        
        result = subprocess.run(cmd, cwd=script_dir, check=True)
        
        print()
        print("=" * 50)
        print("Build Complete!")
        print("=" * 50)
        print()
        print(f"Executable location: {script_dir / 'dist' / 'TailorBillingManager.exe'}")
        print()
        print("You can now run: TailorBillingManager.exe")
        print()
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"ERROR: Build failed with return code {e.returncode}")
        return False
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    try:
        success = build_exe()
        if not success:
            print("\nPress any key to exit...")
            try:
                input()  # Wait for user input
            except:
                pass
            sys.exit(1)
        else:
            print("\nPress any key to exit...")
            try:
                input()  # Wait for user input
            except:
                pass
    except KeyboardInterrupt:
        print("\n\nBuild cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nUnexpected error: {e}")
        print("Press any key to exit...")
        try:
            input()
        except:
            pass
        sys.exit(1)
