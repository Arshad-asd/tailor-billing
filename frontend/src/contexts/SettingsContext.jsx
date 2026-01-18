import { createContext, useContext, useState, useEffect } from 'react';
import settingsApi from '../services/settingsApi';

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
    
    // Sidebar Configuration (loaded from API)
    sidebarItems: [],
    
    // Page Background Settings (loaded from API)
    pageBackgrounds: {},
  });

  const [loading, setLoading] = useState(true);

  // Load settings from localStorage and API on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load local settings first
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings);
            setSettings(prev => ({ ...prev, ...parsed }));
          } catch (error) {
            console.error('Error loading local settings:', error);
          }
        }

        // Load sidebar items from API
        try {
          const sidebarItems = await settingsApi.getActiveSidebarItems();
          setSettings(prev => ({ ...prev, sidebarItems }));
        } catch (error) {
          console.error('Error loading sidebar items:', error);
          // Keep default empty array if API fails
        }

        // Load page backgrounds from API
        try {
          const pageBackgrounds = await settingsApi.getActivePageBackgrounds();
          // Convert array to object keyed by route for easier lookup
          const backgroundsObj = {};
          pageBackgrounds.forEach(bg => {
            backgroundsObj[bg.page_route] = bg;
          });
          setSettings(prev => ({ ...prev, pageBackgrounds: backgroundsObj }));
        } catch (error) {
          console.error('Error loading page backgrounds:', error);
          // Keep default empty object if API fails
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
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

  // Refresh sidebar items from API
  const refreshSidebarItems = async () => {
    try {
      const sidebarItems = await settingsApi.getActiveSidebarItems();
      setSettings(prev => ({ ...prev, sidebarItems }));
      return { success: true };
    } catch (error) {
      console.error('Error refreshing sidebar items:', error);
      return { success: false, error };
    }
  };

  // Refresh page backgrounds from API
  const refreshPageBackgrounds = async () => {
    try {
      const pageBackgrounds = await settingsApi.getActivePageBackgrounds();
      const backgroundsObj = {};
      pageBackgrounds.forEach(bg => {
        backgroundsObj[bg.page_route] = bg;
      });
      setSettings(prev => ({ ...prev, pageBackgrounds: backgroundsObj }));
      return { success: true };
    } catch (error) {
      console.error('Error refreshing page backgrounds:', error);
      return { success: false, error };
    }
  };

  // Get background for a specific route
  const getPageBackground = (route) => {
    return settings.pageBackgrounds[route] || null;
  };

  const value = {
    settings,
    loading,
    updateSettings,
    saveSettings,
    resetSettings,
    refreshSidebarItems,
    refreshPageBackgrounds,
    getPageBackground,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
