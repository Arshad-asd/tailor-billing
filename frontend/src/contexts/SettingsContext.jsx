import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    // Theme Settings
    theme: 'system', // 'light', 'dark', 'system'
    colorTheme: 'orange', // 'orange', 'blue', 'green', 'purple', 'red'
    sidebarCollapsed: false,
    sidebarWidth: 256,
    
    // Display Settings
    showNotifications: true,
    showBreadcrumbs: true,
    showSearchBar: true,
    compactMode: false,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    soundNotifications: false,
    
    // Security Settings
    autoLogout: 30, // minutes
    requirePasswordChange: false,
    twoFactorAuth: false,
    
    // Data Settings
    autoSave: true,
    dataRetention: 365, // days
    backupFrequency: 'daily', // 'daily', 'weekly', 'monthly'
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Theme changes are now handled by the ThemeProvider and useAppearance hook

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const saveSettings = async (newSettings = null) => {
    const settingsToSave = newSettings || settings;
    
    try {
      // Save to localStorage
      localStorage.setItem('adminSettings', JSON.stringify(settingsToSave));
      
      // Update state if new settings were passed
      if (newSettings) {
        setSettings(prev => ({ ...prev, ...newSettings }));
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error saving settings:', error);
      return { success: false, error };
    }
  };

  const resetSettings = () => {
    const defaultSettings = {
      theme: 'system',
      colorTheme: 'orange',
      sidebarCollapsed: false,
      sidebarWidth: 256,
      showNotifications: true,
      showBreadcrumbs: true,
      showSearchBar: true,
      compactMode: false,
      emailNotifications: true,
      pushNotifications: true,
      soundNotifications: false,
      autoLogout: 30,
      requirePasswordChange: false,
      twoFactorAuth: false,
      autoSave: true,
      dataRetention: 365,
      backupFrequency: 'daily',
    };
    
    setSettings(defaultSettings);
    localStorage.setItem('adminSettings', JSON.stringify(defaultSettings));
  };

  const value = {
    settings,
    updateSettings,
    saveSettings,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
