# Tailor Billing Application Manager - Main GUI Application

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import threading
import webbrowser
import os
import sys
import ctypes
from pathlib import Path
from datetime import datetime
import subprocess

from config import *
from service_manager import ServiceManager, is_admin, request_admin_elevation
from git_sync import sync_from_remote, check_git_installed, get_current_branch, get_git_status, get_branch_info, get_all_branches, switch_branch

class TailorBillingManager:
    def __init__(self, root):
        self.root = root
        self.root.title(WINDOW_TITLE)
        self.root.geometry(WINDOW_SIZE)
        self.root.resizable(True, True)
        
        # Initialize managers
        self.service_manager = ServiceManager()
        
        # State variables
        self.service_status = "unknown"
        self.last_sync_time = None
        self.is_syncing = False
        
        # Create UI
        self.create_ui()
        
        # Start auto-refresh
        self.refresh_status()
        self.auto_refresh()
        
    def show_access_denied_error(self, operation):
        """Show access denied error with option to restart as admin"""
        # Check if already admin
        if is_admin():
            msg = (
                f"Access Denied!\n\n"
                f"Even though you're running as Administrator, the operation failed.\n"
                f"This might be due to:\n"
                f"- Service permissions issue\n"
                f"- NSSM not properly installed\n"
                f"- Service not found\n\n"
                f"Error: Access Denied"
            )
            messagebox.showerror("Access Denied", msg)
            return
        
        msg = (
            f"Access Denied!\n\n"
            f"To {operation} the service, you need Administrator privileges.\n\n"
            f"Options:\n"
            f"1. Right-click the application and select 'Run as administrator'\n"
            f"2. Or click 'Yes' below to restart with admin rights\n\n"
            f"Note: The application will close and reopen with admin privileges."
        )
        
        if messagebox.askyesno("Administrator Rights Required", msg + "\n\nRestart as Administrator now?"):
            # Request elevation - this will restart the app as admin
            try:
                request_admin_elevation()
                # Close current window (app will restart as admin)
                self.root.quit()
                self.root.destroy()
            except Exception as e:
                messagebox.showerror("Error", f"Failed to restart as Administrator:\n{str(e)}\n\nPlease manually run as Administrator.")
        else:
            messagebox.showinfo("Info", "Please run the application as Administrator to perform this operation.")
    
    def create_ui(self):
        """Create the user interface"""
        
        # Main container with better padding
        main_frame = ttk.Frame(self.root, padding="15")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)
        
        # Header Frame with Title and Admin Status
        header_frame = ttk.Frame(main_frame)
        header_frame.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=(0, 15))
        header_frame.columnconfigure(0, weight=1)
        
        # Title
        title_label = ttk.Label(
            header_frame, 
            text="Tailor Billing Application Manager",
            font=("Segoe UI", 18, "bold")
        )
        title_label.grid(row=0, column=0, sticky=tk.W)
        
        # Admin status indicator with better styling
        admin_status = "🛡️ Running as Administrator" if is_admin() else "⚠️ Not running as Administrator"
        admin_label = ttk.Label(
            header_frame,
            text=admin_status,
            font=("Segoe UI", 10, "bold"),
            foreground=COLOR_RUNNING if is_admin() else COLOR_WARNING
        )
        admin_label.grid(row=0, column=1, sticky=tk.E, padx=(10, 0))
        
        # Status Frame - Improved styling
        status_frame = ttk.LabelFrame(main_frame, text="  Service Status  ", padding="15")
        status_frame.grid(row=1, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        status_frame.columnconfigure(1, weight=1)
        
        self.status_label = ttk.Label(status_frame, text="Checking...", font=("Segoe UI", 12, "bold"))
        self.status_label.grid(row=0, column=0, columnspan=2, pady=(0, 10))
        
        # Service info with better spacing
        ttk.Label(status_frame, text="Service:", font=("Segoe UI", 9)).grid(row=1, column=0, sticky=tk.W, pady=4)
        ttk.Label(status_frame, text=SERVICE_NAME, font=("Segoe UI", 9, "bold")).grid(row=1, column=1, sticky=tk.W, pady=4)
        
        # Git Branch row with switch button
        ttk.Label(status_frame, text="Git Branch:", font=("Segoe UI", 9)).grid(row=2, column=0, sticky=tk.W, pady=4)
        branch_frame = ttk.Frame(status_frame)
        branch_frame.grid(row=2, column=1, sticky=tk.W, pady=4)
        self.branch_label = ttk.Label(branch_frame, text="Checking...", foreground=COLOR_INFO, font=("Segoe UI", 9))
        self.branch_label.grid(row=0, column=0, sticky=tk.W, padx=(0, 5))
        self.switch_branch_btn = ttk.Button(branch_frame, text="🔄 Switch", command=self.show_branch_switcher, width=12)
        self.switch_branch_btn.grid(row=0, column=1, sticky=tk.W)
        
        ttk.Label(status_frame, text="Last Sync:", font=("Segoe UI", 9)).grid(row=3, column=0, sticky=tk.W, pady=4)
        self.sync_time_label = ttk.Label(status_frame, text="Never", font=("Segoe UI", 9))
        self.sync_time_label.grid(row=3, column=1, sticky=tk.W, pady=4)
        
        # Administrator Controls Frame - NEW SECTION
        admin_frame = ttk.LabelFrame(main_frame, text="  Administrator Controls  ", padding="12")
        admin_frame.grid(row=2, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        
        # Admin buttons with distinct styling
        self.admin_run_btn = ttk.Button(
            admin_frame, 
            text="🛡️ Run as Administrator", 
            command=self.restart_as_admin,
            width=22
        )
        self.admin_run_btn.grid(row=0, column=0, padx=5, pady=5)
        
        self.admin_stop_btn = ttk.Button(
            admin_frame, 
            text="🛡️ Stop (Admin)", 
            command=self.stop_service_admin,
            width=22
        )
        self.admin_stop_btn.grid(row=0, column=1, padx=5, pady=5)
        
        # Show admin status hint
        admin_hint = ttk.Label(
            admin_frame,
            text="⚠️ Service operations require Administrator privileges",
            font=("Segoe UI", 8),
            foreground=COLOR_WARNING
        )
        admin_hint.grid(row=1, column=0, columnspan=2, pady=(5, 0))
        
        # Control Buttons Frame - Improved layout
        control_frame = ttk.LabelFrame(main_frame, text="  Service Controls  ", padding="12")
        control_frame.grid(row=3, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        
        # First row - Primary controls
        self.start_btn = ttk.Button(control_frame, text="▶ Start Service", command=self.start_service, width=18)
        self.start_btn.grid(row=0, column=0, padx=5, pady=5)
        
        self.stop_btn = ttk.Button(control_frame, text="⏹ Stop Service", command=self.stop_service, width=18)
        self.stop_btn.grid(row=0, column=1, padx=5, pady=5)
        
        self.restart_btn = ttk.Button(control_frame, text="🔄 Restart Service", command=self.restart_service, width=18)
        self.restart_btn.grid(row=0, column=2, padx=5, pady=5)
        
        # Second row - Secondary controls
        self.sync_btn = ttk.Button(control_frame, text="🔁 Sync (Git Pull)", command=self.sync_from_git, width=18)
        self.sync_btn.grid(row=1, column=0, padx=5, pady=5)
        
        self.refresh_btn = ttk.Button(control_frame, text="📊 Refresh Status", command=self.refresh_status, width=18)
        self.refresh_btn.grid(row=1, column=1, padx=5, pady=5)
        
        self.logs_btn = ttk.Button(control_frame, text="📋 View Logs", command=self.view_logs, width=18)
        self.logs_btn.grid(row=1, column=2, padx=5, pady=5)
        
        # Backend logs button
        self.backend_logs_btn = ttk.Button(control_frame, text="🔍 Backend Logs", command=self.view_backend_logs, width=18)
        self.backend_logs_btn.grid(row=2, column=0, padx=5, pady=5)
        
        # Quick Links Frame - Better organization
        links_frame = ttk.LabelFrame(main_frame, text="  Quick Links  ", padding="12")
        links_frame.grid(row=4, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        
        # Application links
        ttk.Label(links_frame, text="Applications:", font=("Segoe UI", 9, "bold")).grid(row=0, column=0, sticky=tk.W, pady=(0, 5))
        ttk.Button(links_frame, text="🌐 Open Backend", command=lambda: webbrowser.open(BACKEND_URL), width=18).grid(row=1, column=0, padx=5, pady=3)
        ttk.Button(links_frame, text="🌐 Open Frontend", command=lambda: webbrowser.open(FRONTEND_URL), width=18).grid(row=1, column=1, padx=5, pady=3)
        ttk.Button(links_frame, text="🔐 Open Admin", command=lambda: webbrowser.open(ADMIN_URL), width=18).grid(row=1, column=2, padx=5, pady=3)
        
        # System links
        ttk.Label(links_frame, text="System:", font=("Segoe UI", 9, "bold")).grid(row=2, column=0, sticky=tk.W, pady=(10, 5))
        ttk.Button(links_frame, text="📁 Logs Folder", command=self.open_logs_folder, width=18).grid(row=3, column=0, padx=5, pady=3)
        ttk.Button(links_frame, text="📂 Project Folder", command=self.open_project_folder, width=18).grid(row=3, column=1, padx=5, pady=3)
        ttk.Button(links_frame, text="⚙️ Run Migrations", command=self.run_migrations, width=18).grid(row=3, column=2, padx=5, pady=3)
        
        # Log Viewer Frame - Enhanced with log type selector
        log_frame = ttk.LabelFrame(main_frame, text="  Log Viewer  ", padding="12")
        log_frame.grid(row=5, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 10))
        log_frame.columnconfigure(0, weight=1)
        log_frame.rowconfigure(1, weight=1)
        main_frame.rowconfigure(5, weight=1)
        
        # Log type selector frame
        log_selector_frame = ttk.Frame(log_frame)
        log_selector_frame.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        
        ttk.Label(log_selector_frame, text="View:", font=("Segoe UI", 9)).pack(side=tk.LEFT, padx=(0, 5))
        
        self.log_type_var = tk.StringVar(value="startup")
        log_types = [
            ("Startup Log", "startup"),
            ("Backend Errors", "backend"),
            ("Service Output", "service_output"),
            ("Service Errors", "service_error"),
            ("Startup Errors", "startup_error")
        ]
        
        for text, value in log_types:
            ttk.Radiobutton(
                log_selector_frame,
                text=text,
                variable=self.log_type_var,
                value=value,
                command=self.update_logs
            ).pack(side=tk.LEFT, padx=5)
        
        # Refresh log button
        refresh_log_btn = ttk.Button(log_selector_frame, text="🔄 Refresh", command=self.update_logs, width=12)
        refresh_log_btn.pack(side=tk.RIGHT, padx=(5, 0))
        
        # Terminal-style log viewer with color support
        self.log_text = scrolledtext.ScrolledText(
            log_frame, 
            height=12, 
            wrap=tk.NONE,  # No word wrap for terminal-like appearance
            font=("Consolas", 9),
            bg="#1e1e1e",  # Dark background like terminal
            fg="#d4d4d4",  # Light text
            insertbackground="#ffffff",  # White cursor
            selectbackground="#264f78",  # Selection color
            selectforeground="#ffffff"
        )
        self.log_text.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure text tags for color coding
        self.log_text.tag_configure("timestamp", foreground="#608b4e")  # Green
        self.log_text.tag_configure("method", foreground="#569cd6")  # Blue
        self.log_text.tag_configure("path", foreground="#ce9178")  # Orange
        self.log_text.tag_configure("status_2xx", foreground="#4ec9b0")  # Cyan (success)
        self.log_text.tag_configure("status_3xx", foreground="#dcdcaa")  # Yellow (redirect)
        self.log_text.tag_configure("status_4xx", foreground="#f48771")  # Red-orange (client error)
        self.log_text.tag_configure("status_5xx", foreground="#f48771")  # Red-orange (server error)
        self.log_text.tag_configure("error", foreground="#f48771", background="#3f1f1f")  # Red with dark bg
        self.log_text.tag_configure("warning", foreground="#dcdcaa", background="#3f3f1f")  # Yellow with dark bg
        self.log_text.tag_configure("info", foreground="#4ec9b0")  # Cyan
        self.log_text.tag_configure("debug", foreground="#808080")  # Gray
        self.log_text.tag_configure("http_header", foreground="#c586c0")  # Purple
        self.log_text.tag_configure("number", foreground="#b5cea8")  # Light green
        
        # Progress bar (hidden by default)
        self.progress = ttk.Progressbar(main_frame, mode='indeterminate', length=400)
        self.progress.grid(row=6, column=0, sticky=(tk.W, tk.E), pady=(0, 5))
        self.progress.grid_remove()
        
        # Status bar - Enhanced
        self.status_bar = ttk.Label(
            main_frame, 
            text="Ready", 
            relief=tk.SUNKEN, 
            anchor=tk.W,
            font=("Segoe UI", 9),
            padding=5
        )
        self.status_bar.grid(row=7, column=0, sticky=(tk.W, tk.E))
    
    def restart_as_admin(self):
        """Restart the application as Administrator"""
        if is_admin():
            messagebox.showinfo("Info", "You are already running as Administrator!")
            return
        
        if messagebox.askyesno("Restart as Administrator", 
            "This will close the application and restart it with Administrator privileges.\n\n"
            "Continue?"):
            try:
                request_admin_elevation()
                self.root.quit()
                self.root.destroy()
            except Exception as e:
                messagebox.showerror("Error", f"Failed to restart as Administrator:\n{str(e)}\n\nPlease manually run as Administrator.")
    
    def stop_service_admin(self):
        """Stop service with admin privileges check"""
        if not is_admin():
            if messagebox.askyesno("Administrator Required", 
                "Stopping the service requires Administrator privileges.\n\n"
                "Would you like to restart the application as Administrator?"):
                self.restart_as_admin()
            return
        
        self.stop_service()
    
    def show_branch_switcher(self):
        """Show dialog to switch Git branches"""
        if not check_git_installed():
            messagebox.showerror("Error", "Git is not installed or not in PATH!")
            return
        
        # Get all branches
        branches_info = get_all_branches()
        if not branches_info['success']:
            messagebox.showerror("Error", branches_info.get('error', 'Failed to get branches'))
            return
        
        all_branches = branches_info.get('all_branches', [])
        if not all_branches:
            messagebox.showwarning("Warning", "No branches found!")
            return
        
        # Get current branch
        current_branch = get_current_branch()
        
        # Create branch selection dialog
        branch_window = tk.Toplevel(self.root)
        branch_window.title("Switch Git Branch")
        branch_window.geometry("500x400")
        branch_window.resizable(False, False)
        branch_window.transient(self.root)
        branch_window.grab_set()
        
        # Center the window
        branch_window.update_idletasks()
        x = (branch_window.winfo_screenwidth() // 2) - (500 // 2)
        y = (branch_window.winfo_screenheight() // 2) - (400 // 2)
        branch_window.geometry(f"500x400+{x}+{y}")
        
        # Main frame
        main_dialog_frame = ttk.Frame(branch_window, padding="15")
        main_dialog_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        title_label = ttk.Label(
            main_dialog_frame,
            text="Select Branch to Switch",
            font=("Segoe UI", 12, "bold")
        )
        title_label.pack(pady=(0, 10))
        
        # Current branch info
        if current_branch:
            current_label = ttk.Label(
                main_dialog_frame,
                text=f"Current Branch: {current_branch}",
                font=("Segoe UI", 9, "bold"),
                foreground=COLOR_INFO
            )
            current_label.pack(pady=(0, 10))
        
        # Listbox with scrollbar
        list_frame = ttk.Frame(main_dialog_frame)
        list_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        scrollbar = ttk.Scrollbar(list_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        branch_listbox = tk.Listbox(
            list_frame,
            font=("Consolas", 10),
            yscrollcommand=scrollbar.set,
            height=12
        )
        branch_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=branch_listbox.yview)
        
        # Populate listbox
        selected_branch = [None]
        for branch in sorted(all_branches):
            display_text = branch
            if branch == current_branch:
                display_text = f"✓ {branch} (current)"
            branch_listbox.insert(tk.END, display_text)
        
        # Select current branch if exists
        if current_branch and current_branch in all_branches:
            try:
                idx = sorted(all_branches).index(current_branch)
                branch_listbox.selection_set(idx)
                branch_listbox.see(idx)
            except:
                pass
        
        # Double-click handler
        def on_double_click(event):
            selection = branch_listbox.curselection()
            if selection:
                idx = selection[0]
                branch = sorted(all_branches)[idx]
                selected_branch[0] = branch
                switch_branch_action()
        
        branch_listbox.bind('<Double-Button-1>', on_double_click)
        
        # Button frame
        button_frame = ttk.Frame(main_dialog_frame)
        button_frame.pack(fill=tk.X, pady=(10, 0))
        
        def switch_branch_action():
            selection = branch_listbox.curselection()
            if not selection:
                messagebox.showwarning("Warning", "Please select a branch!")
                return
            
            idx = selection[0]
            branch = sorted(all_branches)[idx]
            
            if branch == current_branch:
                messagebox.showinfo("Info", f"You are already on branch: {branch}")
                branch_window.destroy()
                return
            
            # Confirm switch
            if not messagebox.askyesno("Confirm Switch", 
                f"Switch to branch: {branch}?\n\n"
                f"This will:\n"
                f"1. Stop the service (if running)\n"
                f"2. Switch to {branch}\n"
                f"3. Restart the service (if it was running)\n\n"
                f"Continue?"):
                return
            
            branch_window.destroy()
            
            # Switch branch in background
            def do_switch():
                self.progress.grid()
                self.progress.start()
                self.status_bar.config(text=f"Switching to branch: {branch}...")
                
                # Stop service if running
                service_was_running = False
                if self.service_manager:
                    status = self.service_manager.get_service_status()
                    service_was_running = (status == 'running')
                    if service_was_running:
                        self.service_manager.stop_service()
                
                # Switch branch
                result = switch_branch(branch)
                
                self.progress.stop()
                self.progress.grid_remove()
                
                if result['success']:
                    messagebox.showinfo("Success", f"Switched to branch: {branch}")
                    # Restart service if it was running
                    if service_was_running and self.service_manager:
                        self.service_manager.start_service()
                    # Refresh status
                    self.root.after(0, self.refresh_status)
                else:
                    messagebox.showerror("Error", f"Failed to switch branch:\n{result['error']}")
                    # Restart service if it was running
                    if service_was_running and self.service_manager:
                        self.service_manager.start_service()
                
                self.root.after(0, lambda: self.status_bar.config(text="Ready"))
            
            threading.Thread(target=do_switch, daemon=True).start()
        
        switch_btn = ttk.Button(button_frame, text="Switch Branch", command=switch_branch_action, width=15)
        switch_btn.pack(side=tk.LEFT, padx=5)
        
        cancel_btn = ttk.Button(button_frame, text="Cancel", command=branch_window.destroy, width=15)
        cancel_btn.pack(side=tk.RIGHT, padx=5)
        
        # Focus on listbox
        branch_listbox.focus_set()
        
    def update_status_display(self):
        """Update the status display"""
        if self.service_status == 'running':
            self.status_label.config(text="🟢 Running", foreground=COLOR_RUNNING)
            self.start_btn.config(state='disabled')
            self.stop_btn.config(state='normal')
        elif self.service_status == 'stopped':
            self.status_label.config(text="🔴 Stopped", foreground=COLOR_STOPPED)
            self.start_btn.config(state='normal')
            self.stop_btn.config(state='disabled')
        elif self.service_status == 'paused':
            self.status_label.config(text="⏸ Paused", foreground=COLOR_WARNING)
            self.start_btn.config(state='normal')
            self.stop_btn.config(state='normal')
        elif self.service_status == 'not_installed':
            self.status_label.config(text="⚠ Not Installed", foreground=COLOR_WARNING)
            self.start_btn.config(state='disabled')
            self.stop_btn.config(state='disabled')
        else:
            self.status_label.config(text="❓ Unknown", foreground=COLOR_INFO)
            self.start_btn.config(state='normal')
            self.stop_btn.config(state='normal')
        
        if self.last_sync_time:
            self.sync_time_label.config(text=self.last_sync_time.strftime("%Y-%m-%d %H:%M:%S"))
        else:
            self.sync_time_label.config(text="Never")
    
    def refresh_status(self):
        """Refresh the service status"""
        def do_refresh():
            self.status_bar.config(text="Refreshing status...")
            self.service_status = self.service_manager.get_service_status()
            
            # Update branch info
            branch_info = get_branch_info()
            current_branch = branch_info.get('current_branch', 'N/A')
            remote_branch = branch_info.get('remote_branch', '')
            
            if current_branch and current_branch != 'N/A':
                branch_text = current_branch
                if remote_branch and remote_branch != 'N/A':
                    branch_text += f" → {remote_branch}"
                self.root.after(0, lambda: self.branch_label.config(text=branch_text))
            else:
                self.root.after(0, lambda: self.branch_label.config(text="Not a Git repo"))
            
            self.root.after(0, self.update_status_display)
            self.root.after(0, self.update_logs)
            self.root.after(0, lambda: self.status_bar.config(text="Ready"))
        
        threading.Thread(target=do_refresh, daemon=True).start()
    
    def start_service(self):
        """Start the service"""
        def do_start():
            self.progress.grid()
            self.progress.start()
            self.status_bar.config(text="Starting service...")
            self.start_btn.config(state='disabled')
            
            result = self.service_manager.start_service()
            
            self.progress.stop()
            self.progress.grid_remove()
            
            if result['success']:
                messagebox.showinfo("Success", "Service started successfully!")
                self.service_status = 'running'
            else:
                if result.get('access_denied', False):
                    self.show_access_denied_error("start")
                else:
                    messagebox.showerror("Error", f"Failed to start service:\n{result['error']}")
            
            self.root.after(0, self.update_status_display)
            self.root.after(0, lambda: self.status_bar.config(text="Ready"))
            self.root.after(0, self.refresh_status)
        
        threading.Thread(target=do_start, daemon=True).start()
    
    def stop_service(self):
        """Stop the service"""
        if not messagebox.askyesno("Confirm", "Are you sure you want to stop the service?"):
            return
        
        def do_stop():
            self.progress.grid()
            self.progress.start()
            self.status_bar.config(text="Stopping service...")
            self.stop_btn.config(state='disabled')
            
            result = self.service_manager.stop_service()
            
            self.progress.stop()
            self.progress.grid_remove()
            
            if result['success']:
                messagebox.showinfo("Success", "Service stopped successfully!")
                self.service_status = 'stopped'
            else:
                if result.get('access_denied', False):
                    self.show_access_denied_error("stop")
                else:
                    messagebox.showerror("Error", f"Failed to stop service:\n{result['error']}")
            
            self.root.after(0, self.update_status_display)
            self.root.after(0, lambda: self.status_bar.config(text="Ready"))
            self.root.after(0, self.refresh_status)
        
        threading.Thread(target=do_stop, daemon=True).start()
    
    def restart_service(self):
        """Restart the service"""
        def do_restart():
            self.progress.grid()
            self.progress.start()
            self.status_bar.config(text="Restarting service...")
            self.restart_btn.config(state='disabled')
            
            result = self.service_manager.restart_service()
            
            self.progress.stop()
            self.progress.grid_remove()
            
            if result['success']:
                messagebox.showinfo("Success", "Service restarted successfully!")
                self.service_status = 'running'
            else:
                if result.get('access_denied', False):
                    self.show_access_denied_error("restart")
                else:
                    messagebox.showerror("Error", f"Failed to restart service:\n{result['error']}")
            
            self.root.after(0, self.update_status_display)
            self.root.after(0, lambda: self.status_bar.config(text="Ready"))
            self.root.after(0, self.refresh_status)
        
        threading.Thread(target=do_restart, daemon=True).start()
    
    def sync_from_git(self):
        """Sync from Git repository"""
        if self.is_syncing:
            messagebox.showwarning("Warning", "Sync operation is already in progress!")
            return
        
        if not check_git_installed():
            messagebox.showerror("Error", "Git is not installed or not in PATH!")
            return
        
        # Get branch info for confirmation
        branch_info = get_branch_info()
        current_branch = branch_info.get('current_branch', 'unknown')
        remote_branch = branch_info.get('remote_branch', 'N/A')
        
        confirm_msg = (
            "This will:\n"
            "1. Stop the service (if running)\n"
            "2. Pull latest code from Git\n"
            "3. Restart the service (if it was running)\n\n"
        )
        
        if current_branch and current_branch != 'unknown':
            confirm_msg += f"Current Branch: {current_branch}\n"
            if remote_branch and remote_branch != 'N/A':
                confirm_msg += f"Pulling from: {remote_branch}\n"
            else:
                confirm_msg += f"Pulling from: origin/{current_branch}\n"
            confirm_msg += "\n"
        
        confirm_msg += "Continue?"
        
        if not messagebox.askyesno("Confirm Sync", confirm_msg):
            return
        
        def do_sync():
            self.is_syncing = True
            self.progress.grid()
            self.progress.start()
            self.status_bar.config(text="Syncing from Git repository...")
            self.sync_btn.config(state='disabled')
            
            result = sync_from_remote(
                service_was_running=(self.service_status == 'running'),
                service_manager=self.service_manager
            )
            
            self.progress.stop()
            self.progress.grid_remove()
            self.is_syncing = False
            self.sync_btn.config(state='normal')
            
            # Update sync time
            if result['success']:
                self.last_sync_time = datetime.now()
            
            # Show result
            message = "Sync completed!\n\n"
            message += "\n".join(result['steps'])
            if result['errors']:
                message += "\n\nErrors:\n" + "\n".join(result['errors'])
            
            # Check for specific error types
            has_access_denied = any('access' in err.lower() and 'denied' in err.lower() for err in result.get('errors', []))
            has_network_error = any('network' in err.lower() or 'could not resolve' in err.lower() or 'connection' in err.lower() for err in result.get('errors', []))
            
            if result['success']:
                messagebox.showinfo("Sync Complete", message)
            else:
                if has_access_denied:
                    self.show_access_denied_error("sync")
                elif has_network_error:
                    # Show network error with troubleshooting tips
                    network_msg = message + "\n\n" + "="*50 + "\n\nTroubleshooting Network Issues:\n\n"
                    network_msg += "1. Check Internet Connection\n"
                    network_msg += "   - Try opening github.com in your browser\n"
                    network_msg += "   - Check if other websites load\n\n"
                    network_msg += "2. Check DNS Settings\n"
                    network_msg += "   - Try: ping github.com\n"
                    network_msg += "   - Check DNS server configuration\n\n"
                    network_msg += "3. Check Firewall/VPN\n"
                    network_msg += "   - Ensure firewall allows Git/SSH connections\n"
                    network_msg += "   - Check if VPN is required and connected\n\n"
                    network_msg += "4. Check Git Remote URL\n"
                    network_msg += "   - Verify: git remote -v\n"
                    network_msg += "   - Ensure URL is correct\n"
                    messagebox.showerror("Network Error - Sync Failed", network_msg)
                else:
                    messagebox.showerror("Sync Failed", message)
            
            self.root.after(0, self.update_status_display)
            self.root.after(0, lambda: self.status_bar.config(text="Ready"))
            self.root.after(0, self.refresh_status)
        
        threading.Thread(target=do_sync, daemon=True).start()
    
    def format_log_line(self, line):
        """Format a log line with terminal-style color coding"""
        import re
        
        # CRITICAL FIX: Remove spaces between individual characters
        # The log file has spaces between every character like "G E T" instead of "GET"
        # We need to intelligently remove these while preserving intentional spaces
        
        # Simple but effective approach: Remove spaces between characters that are part of the same token
        # A token is: alphanumeric chars, slashes, dots, underscores, hyphens, colons grouped together
        
        # Strategy: Find sequences of space-separated single characters that should be together
        # and join them, while preserving spaces between different tokens
        
        # Fix the most common pattern: spaces between every character in words/paths
        # Pattern: char space char space char... (repeated pattern)
        # We'll use a more aggressive approach for known patterns
        
        # Fix HTTP methods first (common case)
        line = re.sub(r'\b([Gg])\s+([Ee])\s+([Tt])\b', r'GET', line)
        line = re.sub(r'\b([Pp])\s+([Oo])\s+([Ss])\s+([Tt])\b', r'POST', line)
        line = re.sub(r'\b([Hh])\s+([Tt])\s+([Tt])\s+([Pp])\b', r'HTTP', line)
        
        # Fix paths: "/ s t a t i c / f i l e . j s" -> "/static/file.js"
        # Match pattern: / followed by space-separated chars ending with /
        def fix_path(match):
            path_content = match.group(1)
            # Remove all spaces from path content
            return '/' + path_content.replace(' ', '')
        
        # Fix paths in quotes: "G E T / s t a t i c / f i l e . j s H T T P / 1 . 1"
        # This is the HTTP request line format
        quoted_pattern = r'"([^"]+)"'
        def fix_quoted_content(match):
            content = match.group(1)
            # Split into parts: method, path, HTTP version
            # Method is usually at start: G E T or P O S T
            content = re.sub(r'\b([A-Za-z])\s+([A-Za-z])\s+([A-Za-z])\b', r'\1\2\3', content)  # 3-char words
            content = re.sub(r'\b([A-Za-z])\s+([A-Za-z])\s+([A-Za-z])\s+([A-Za-z])\b', r'\1\2\3\4', content)  # 4-char words
            # Fix path: remove spaces between path characters
            content = re.sub(r'/\s+([^/\s]+(?:\s+[^/\s]+)*)', lambda m: '/' + m.group(1).replace(' ', ''), content)
            # Fix HTTP version
            content = re.sub(r'H\s*T\s*T\s*P\s*/\s*(\d)\s*\.\s*(\d)', r'HTTP/\1.\2', content, flags=re.IGNORECASE)
            return '"' + content + '"'
        
        line = re.sub(quoted_pattern, fix_quoted_content, line)
        
        # Fix timestamps: "[ 2 7 / J a n / 2 0 2 6 1 9 : 5 7 : 2 8 ]"
        # Pattern: [ followed by space-separated date/time components
        bracket_pattern = r'\[([^\]]+)\]'
        def fix_bracket_content(match):
            content = match.group(1)
            # Fix date: "2 7 / J a n / 2 0 2 6"
            content = re.sub(r'(\d)\s+(\d)\s*/\s*([A-Za-z])\s+([a-z])\s+([a-z])\s*/\s*(\d)\s+(\d)\s+(\d)\s+(\d)', 
                           r'\1\2/\3\4\5/\6\7\8\9', content)
            # Fix time: "1 9 : 5 7 : 2 8"
            content = re.sub(r'(\d)\s+(\d)\s*:\s*(\d)\s+(\d)\s*:\s*(\d)\s+(\d)', r'\1\2:\3\4:\5\6', content)
            # Fix any remaining number spacing
            content = re.sub(r'(\d)\s+(\d)', r'\1\2', content)
            return '[' + content + ']'
        
        line = re.sub(bracket_pattern, fix_bracket_content, line)
        
        # Fix status codes and standalone numbers: "3 0 4" -> "304"
        line = re.sub(r'\b(\d)\s+(\d)\s+(\d)\b', r'\1\2\3', line)
        line = re.sub(r'\b(\d)\s+(\d)\b', r'\1\2', line)
        
        # Final cleanup: replace multiple spaces with single space
        line = re.sub(r' +', ' ', line)
        line = line.rstrip()
        
        # Skip empty lines
        if not line.strip():
            self.log_text.insert(tk.END, "\n")
            return
        
        # Header lines (box drawing)
        if "╔" in line or "╚" in line or "═" in line:
            self.log_text.insert(tk.END, line + "\n", "info")
            return
        
        # Django/HTTP access log format: [DD/Mon/YYYY HH:MM:SS] "METHOD /path HTTP/1.1" STATUS SIZE
        # More flexible pattern to handle variations
        http_pattern = r'\[(\d{2}/\w{3}/\d{4} \d{2}:\d{2}:\d{2})\]\s+"(\w+)\s+([^\s"]+)\s+HTTP/[\d.]+"\s+(\d+)\s+(\d+)'
        http_match = re.search(http_pattern, line)
        
        if http_match:
            timestamp, method, path, status, size = http_match.groups()
            status_int = int(status)
            
            # Build the formatted line with proper spacing
            formatted_line = f"[{timestamp}] \"{method} {path} HTTP/1.1\" {status} {size}"
            
            # Insert with color coding - insert whole segments at once to avoid spacing issues
            start_idx = 0
            
            # Timestamp
            ts_start = formatted_line.find('[')
            ts_end = formatted_line.find(']', ts_start) + 1
            if ts_start >= 0:
                self.log_text.insert(tk.END, formatted_line[ts_start:ts_end] + " ", "timestamp")
                start_idx = ts_end + 1
            
            # Method
            method_start = formatted_line.find('"', start_idx)
            method_end = formatted_line.find(' ', method_start + 1)
            if method_start >= 0 and method_end > method_start:
                self.log_text.insert(tk.END, formatted_line[method_start:method_end+1], "method")
                start_idx = method_end + 1
            
            # Path
            path_start = start_idx
            path_end = formatted_line.find(' HTTP/', path_start)
            if path_end > path_start:
                self.log_text.insert(tk.END, formatted_line[path_start:path_end], "path")
                start_idx = path_end
            
            # HTTP version
            http_start = formatted_line.find(' HTTP/', start_idx)
            http_end = formatted_line.find('"', http_start) + 1
            if http_start >= 0:
                self.log_text.insert(tk.END, formatted_line[http_start:http_end+1] + " ", "http_header")
                start_idx = http_end + 2
            
            # Status code
            status_start = start_idx
            status_end = formatted_line.find(' ', status_start)
            if status_end > status_start:
                status_code = formatted_line[status_start:status_end]
                # Color code status
                if 200 <= status_int < 300:
                    self.log_text.insert(tk.END, status_code + " ", "status_2xx")
                elif 300 <= status_int < 400:
                    self.log_text.insert(tk.END, status_code + " ", "status_3xx")
                elif 400 <= status_int < 500:
                    self.log_text.insert(tk.END, status_code + " ", "status_4xx")
                elif 500 <= status_int < 600:
                    self.log_text.insert(tk.END, status_code + " ", "status_5xx")
                else:
                    self.log_text.insert(tk.END, status_code + " ", "number")
                start_idx = status_end + 1
            
            # Size
            if start_idx < len(formatted_line):
                self.log_text.insert(tk.END, formatted_line[start_idx:], "number")
            
            self.log_text.insert(tk.END, "\n")
            return
        
        # Python/Django log format: [timestamp] LEVEL message
        django_log_pattern = r'\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}[^\]]*)\]\s+(\w+):\s+(.+)'
        django_match = re.match(django_log_pattern, line)
        
        if django_match:
            timestamp, level, message = django_match.groups()
            level_upper = level.upper()
            message = message.strip()  # Clean message
            
            # Insert timestamp
            self.log_text.insert(tk.END, f"[{timestamp}] ", "timestamp")
            
            # Color code by log level
            if 'ERROR' in level_upper or 'CRITICAL' in level_upper:
                self.log_text.insert(tk.END, f"{level}: ", "error")
                self.log_text.insert(tk.END, f"{message}\n", "error")
            elif 'WARNING' in level_upper or 'WARN' in level_upper:
                self.log_text.insert(tk.END, f"{level}: ", "warning")
                self.log_text.insert(tk.END, f"{message}\n", "warning")
            elif 'INFO' in level_upper:
                self.log_text.insert(tk.END, f"{level}: ", "info")
                self.log_text.insert(tk.END, f"{message}\n")
            elif 'DEBUG' in level_upper:
                self.log_text.insert(tk.END, f"{level}: ", "debug")
                self.log_text.insert(tk.END, f"{message}\n", "debug")
            else:
                self.log_text.insert(tk.END, f"{level}: {message}\n")
            return
        
        # Python traceback/error output format
        # Clean up traceback lines
        if line.strip().startswith("File ") or line.strip().startswith("Traceback") or "  File " in line:
            # Clean up indentation and extra spaces
            cleaned = re.sub(r'^(\s*)', '', line)  # Remove leading spaces but preserve structure
            cleaned = re.sub(r' +', ' ', cleaned)  # Replace multiple spaces with single
            self.log_text.insert(tk.END, cleaned + "\n", "error")
            return
        
        # PowerShell/Python error output - clean up
        if "At line:" in line or "FullFullyQualifiedErrorId" in line or "CategoryInfo" in line:
            # Clean up PowerShell error format
            cleaned = re.sub(r' +', ' ', line).strip()
            self.log_text.insert(tk.END, cleaned + "\n", "error")
            return
        
        # Error patterns - check for keywords
        line_upper = line.upper()
        if any(keyword in line_upper for keyword in ['ERROR', 'EXCEPTION', 'TRACEBACK', 'FAILED', 'FAILURE']):
            cleaned = re.sub(r' +', ' ', line).strip()
            self.log_text.insert(tk.END, cleaned + "\n", "error")
            return
        elif any(keyword in line_upper for keyword in ['WARNING', 'WARN']):
            cleaned = re.sub(r' +', ' ', line).strip()
            self.log_text.insert(tk.END, cleaned + "\n", "warning")
            return
        elif 'INFO' in line_upper:
            cleaned = re.sub(r' +', ' ', line).strip()
            self.log_text.insert(tk.END, cleaned + "\n", "info")
            return
        elif 'DEBUG' in line_upper:
            cleaned = re.sub(r' +', ' ', line).strip()
            self.log_text.insert(tk.END, cleaned + "\n", "debug")
            return
        
        # Lines starting with common prefixes
        if line.strip().startswith("Starting") or line.strip().startswith("Started"):
            cleaned = re.sub(r' +', ' ', line).strip()
            self.log_text.insert(tk.END, cleaned + "\n", "info")
            return
        
        # Default: clean and insert as plain text
        cleaned = re.sub(r' +', ' ', line).strip()
        if cleaned:
            self.log_text.insert(tk.END, cleaned + "\n")
    
    def update_logs(self):
        """Update the log viewer based on selected log type with terminal-style formatting"""
        self.log_text.delete(1.0, tk.END)
        
        log_type = self.log_type_var.get()
        log_file = None
        
        # Determine which log file to read
        if log_type == "startup":
            log_file = STARTUP_LOG
            log_name = "Startup Log"
        elif log_type == "backend":
            log_file = BACKEND_ERROR_LOG
            log_name = "Backend Error Log"
        elif log_type == "service_output":
            log_file = SERVICE_OUTPUT_LOG
            log_name = "Service Output Log"
        elif log_type == "service_error":
            log_file = SERVICE_ERROR_LOG
            log_name = "Service Error Log"
        elif log_type == "startup_error":
            log_file = STARTUP_ERROR_LOG
            log_name = "Startup Error Log"
        
        if log_file and log_file.exists():
            try:
                with open(log_file, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = f.readlines()
                    # Show last 100 lines for better visibility
                    recent_lines = lines[-100:] if len(lines) > 100 else lines
                    if recent_lines:
                        # Insert header
                        header = f"╔═══ {log_name} (Last {len(recent_lines)} lines) ═══╗\n"
                        self.log_text.insert(tk.END, header, "info")
                        self.log_text.insert(tk.END, "╚" + "═" * (len(header) - 3) + "╝\n\n", "info")
                        
                        # Format and insert each line
                        for line in recent_lines:
                            self.format_log_line(line)
                    else:
                        self.log_text.insert(tk.END, f"⚠ {log_name} is empty.\n", "warning")
            except Exception as e:
                error_msg = f"✗ Error reading {log_name}: {e}\n"
                self.log_text.insert(tk.END, error_msg, "error")
        else:
            if log_file:
                self.log_text.insert(tk.END, f"⚠ {log_name} not found.\n", "warning")
                self.log_text.insert(tk.END, f"   Expected: {log_file}\n", "info")
                self.log_text.insert(tk.END, "   Logs will appear here once the service starts.\n", "info")
            else:
                self.log_text.insert(tk.END, "⚠ No log file selected.\n", "warning")
        
        # Scroll to bottom
        self.log_text.see(tk.END)
    
    def view_logs(self):
        """Open logs folder in file explorer"""
        if LOGS_DIR.exists():
            os.startfile(LOGS_DIR)
        else:
            messagebox.showwarning("Warning", "Logs directory not found!")
    
    def view_backend_logs(self):
        """Switch log viewer to backend logs and scroll to it"""
        # Switch to backend log type
        self.log_type_var.set("backend")
        # Update the log display
        self.update_logs()
        # Scroll the main window to show log viewer
        self.root.update_idletasks()
        # Try to focus on log viewer
        self.log_text.focus_set()
    
    def open_project_folder(self):
        """Open project folder in file explorer"""
        os.startfile(PROJECT_ROOT)
    
    def open_logs_folder(self):
        """Open logs folder"""
        self.view_logs()
    
    def run_migrations(self):
        """Run database migrations"""
        if not messagebox.askyesno("Run Migrations", 
            "This will run Django migrations.\n"
            "Make sure the service is stopped before running migrations.\n\n"
            "Continue?"):
            return
        
        def do_migrations():
            self.progress.grid()
            self.progress.start()
            self.status_bar.config(text="Running migrations...")
            
            # Check if venv exists
            if not VENV_PYTHON.exists():
                self.progress.stop()
                self.progress.grid_remove()
                messagebox.showerror("Error", "Virtual environment not found!\nPlease run setup-backend.ps1 first.")
                self.root.after(0, lambda: self.status_bar.config(text="Ready"))
                return
            
            # Run migrations
            try:
                result = subprocess.run(
                    [str(VENV_PYTHON), "manage.py", "migrate"],
                    cwd=str(BACKEND_DIR),
                    capture_output=True,
                    text=True,
                    timeout=120
                )
                
                self.progress.stop()
                self.progress.grid_remove()
                
                if result.returncode == 0:
                    messagebox.showinfo("Success", "Migrations completed successfully!")
                else:
                    messagebox.showerror("Error", f"Migration failed:\n{result.stderr}")
                
            except Exception as e:
                self.progress.stop()
                self.progress.grid_remove()
                messagebox.showerror("Error", f"Failed to run migrations:\n{str(e)}")
            
            self.root.after(0, lambda: self.status_bar.config(text="Ready"))
        
        threading.Thread(target=do_migrations, daemon=True).start()
    
    def auto_refresh(self):
        """Auto-refresh status every few seconds"""
        self.refresh_status()
        self.root.after(REFRESH_INTERVAL, self.auto_refresh)

def main():
    try:
        root = tk.Tk()
        app = TailorBillingManager(root)
        root.mainloop()
    except Exception as e:
        # Show error in console if available, otherwise show messagebox
        import traceback
        error_msg = f"Error starting application:\n{str(e)}\n\n{traceback.format_exc()}"
        print(error_msg)
        try:
            messagebox.showerror("Application Error", error_msg)
        except:
            # If messagebox fails, at least print to console
            print("Could not show error dialog. Error details above.")
        raise

if __name__ == "__main__":
    main()
