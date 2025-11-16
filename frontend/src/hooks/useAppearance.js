import { useTheme } from '../components/them-provider';
import { useSettings } from '../contexts/SettingsContext';
import { useEffect } from 'react';

export const useAppearance = () => {
  const { theme, setTheme, colorTheme, setColorTheme } = useTheme();
  const { settings, updateSettings } = useSettings();

  // Initialize theme from settings on mount and sync changes
  useEffect(() => {
    // Load from adminSettings localStorage first
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.theme && parsed.theme !== theme) {
          setTheme(parsed.theme);
        }
        if (parsed.colorTheme && parsed.colorTheme !== colorTheme) {
          setColorTheme(parsed.colorTheme);
        }
      } catch (error) {
        console.error('Error loading theme settings:', error);
      }
    }
  }, []); // Only run on mount

  // Sync theme changes to both systems
  const changeTheme = (newTheme) => {
    console.log('useAppearance: changeTheme called with:', newTheme);
    setTheme(newTheme);
    updateSettings({ theme: newTheme });
    // Also update the adminSettings localStorage
    const currentSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    localStorage.setItem('adminSettings', JSON.stringify({
      ...currentSettings,
      theme: newTheme
    }));
  };

  const changeColorTheme = (newColorTheme) => {
    setColorTheme(newColorTheme);
    updateSettings({ colorTheme: newColorTheme });
    // Also update the adminSettings localStorage
    const currentSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    localStorage.setItem('adminSettings', JSON.stringify({
      ...currentSettings,
      colorTheme: newColorTheme
    }));
  };

  return {
    theme,
    colorTheme,
    changeTheme,
    changeColorTheme,
    settings,
    updateSettings
  };
}; 