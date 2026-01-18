import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Moon, 
  Sun, 
  Monitor, 
  Sidebar, 
  Eye, 
  Bell, 
  Shield, 
  User, 
  Save, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Info,
  Lock,
  Database,
  Globe,
  Mail,
  Smartphone,
  Layout,
  Image,
  Plus,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAppearance } from '../../hooks/useAppearance';
import settingsApi from '../../services/settingsApi';
import adminRoutes from '../../routes/adminRoutes';

export default function Settings() {
  const { 
    settings, 
    updateSettings, 
    saveSettings, 
    resetSettings,
    refreshSidebarItems,
    refreshPageBackgrounds 
  } = useSettings();
  const { theme, colorTheme, changeTheme, changeColorTheme } = useAppearance();
  const [localSettings, setLocalSettings] = useState(settings);

  const [activeTab, setActiveTab] = useState('appearance');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  
  // Sidebar configuration state
  const [sidebarItems, setSidebarItems] = useState([]);
  const [editingSidebarItem, setEditingSidebarItem] = useState(null);
  
  // Background settings state
  const [pageBackgrounds, setPageBackgrounds] = useState({});
  const [editingBackground, setEditingBackground] = useState(null);
  
  // Available routes for selection
  const availableRoutes = adminRoutes
    .filter(route => route.path && route.path !== '')
    .map(route => ({
      path: `/admin/${route.path}`,
      name: route.path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }));

  // Update local settings when context settings or theme state change
  useEffect(() => {
    setLocalSettings(prev => ({
      ...prev,
      ...settings,
      theme: theme || settings.theme,
      colorTheme: colorTheme || settings.colorTheme
    }));
  }, [settings, theme, colorTheme]);

  // Load sidebar items and backgrounds
  useEffect(() => {
    const loadData = async () => {
      try {
        const items = await settingsApi.getActiveSidebarItems();
        setSidebarItems(items);
        
        const backgrounds = await settingsApi.getActivePageBackgrounds();
        const backgroundsObj = {};
        backgrounds.forEach(bg => {
          backgroundsObj[bg.page_route] = bg;
        });
        setPageBackgrounds(backgroundsObj);
      } catch (error) {
        console.error('Error loading settings data:', error);
      }
    };
    loadData();
  }, []);

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    
    // Apply theme changes immediately for better UX
    if (key === 'theme') {
      console.log('Changing theme to:', value);
      changeTheme(value);
    } else if (key === 'colorTheme') {
      console.log('Changing color theme to:', value);
      changeColorTheme(value);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save settings using context
      const result = await saveSettings(localSettings);
      
      if (result.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
        // Update local settings to match the saved context settings
        setLocalSettings(settings);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    resetSettings();
    // Update local settings after reset to match the context
    setTimeout(() => {
      setLocalSettings(settings);
    }, 0);
  };

  const tabs = [
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'sidebar', name: 'Sidebar', icon: Layout },
    { id: 'backgrounds', name: 'Backgrounds', icon: Image },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'data', name: 'Data & Backup', icon: Database },
  ];

  const renderAppearanceTab = () => (
    <div className="space-y-8">
      {/* Theme Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Theme Settings
        </h3>
        
        <div className="space-y-6">
          {/* Theme Mode */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              Theme Mode
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'system', label: 'System', icon: Monitor },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSettingChange('theme', option.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      localSettings.theme === option.value
                        ? 'border-primary bg-primary-light dark:bg-primary-dark/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">{option.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Theme */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              Color Theme
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
                { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
                { value: 'green', label: 'Green', color: 'bg-green-500' },
                { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
                { value: 'red', label: 'Red', color: 'bg-red-500' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSettingChange('colorTheme', option.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    localSettings.colorTheme === option.value
                      ? 'border-primary bg-primary-light dark:bg-primary-dark/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-8 h-8 rounded-full ${option.color}`}></div>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar Settings */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              Sidebar Preferences
            </label>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Sidebar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">Auto-collapse sidebar</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.sidebarCollapsed}
                    onChange={(e) => handleSettingChange('sidebarCollapsed', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary dark:peer-focus:ring-primary-dark rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              Display Options
            </label>
            <div className="space-y-4">
              {[
                { key: 'showNotifications', label: 'Show notification badges', icon: Bell },
                { key: 'showBreadcrumbs', label: 'Show breadcrumb navigation', icon: Eye },
                { key: 'showSearchBar', label: 'Show search bar in header', icon: Eye },
                { key: 'compactMode', label: 'Compact mode (smaller spacing)', icon: Eye },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{option.label}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings[option.key]}
                        onChange={(e) => handleSettingChange(option.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary dark:peer-focus:ring-primary-dark rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notification Preferences
        </h3>
        
        <div className="space-y-6">
          {[
            { key: 'emailNotifications', label: 'Email notifications', icon: Mail, description: 'Receive notifications via email' },
            { key: 'pushNotifications', label: 'Push notifications', icon: Smartphone, description: 'Receive browser push notifications' },
            { key: 'soundNotifications', label: 'Sound notifications', icon: Bell, description: 'Play sound for new notifications' },
          ].map((option) => {
            const Icon = option.icon;
            return (
              <div key={option.key} className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{option.label}</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings[option.key]}
                    onChange={(e) => handleSettingChange(option.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary dark:peer-focus:ring-primary-dark rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Security Settings
        </h3>
        
        <div className="space-y-6">
          {/* Auto Logout */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              Auto Logout (minutes)
            </label>
            <select
              value={localSettings.autoLogout}
              onChange={(e) => handleSettingChange('autoLogout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={0}>Never</option>
            </select>
          </div>

          {/* Security Options */}
          <div className="space-y-4">
            {[
              { key: 'requirePasswordChange', label: 'Require password change every 90 days', icon: Lock },
              { key: 'twoFactorAuth', label: 'Enable two-factor authentication', icon: Shield },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <div key={option.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{option.label}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings[option.key]}
                      onChange={(e) => handleSettingChange(option.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary dark:peer-focus:ring-primary-dark rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Data & Backup Settings
        </h3>
        
        <div className="space-y-6">
          {/* Auto Save */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center space-x-3">
              <Save className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Auto-save changes</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Automatically save form changes</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.autoSave}
                onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary dark:peer-focus:ring-primary-dark rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Data Retention */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              Data Retention Period (days)
            </label>
            <select
              value={localSettings.dataRetention}
              onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={180}>180 days</option>
              <option value={365}>1 year</option>
              <option value={730}>2 years</option>
            </select>
          </div>

          {/* Backup Frequency */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              Backup Frequency
            </label>
            <select
              value={localSettings.backupFrequency}
              onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // Sidebar configuration handlers
  const handleSaveSidebarItem = async (itemData) => {
    try {
      if (editingSidebarItem && editingSidebarItem.id) {
        await settingsApi.updateSidebarItem(editingSidebarItem.id, itemData);
      } else {
        await settingsApi.createSidebarItem(itemData);
      }
      await refreshSidebarItems();
      const items = await settingsApi.getActiveSidebarItems();
      setSidebarItems(items);
      setEditingSidebarItem(null);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error saving sidebar item:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleDeleteSidebarItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sidebar item?')) {
      return;
    }
    try {
      await settingsApi.deleteSidebarItem(id);
      await refreshSidebarItems();
      const items = await settingsApi.getActiveSidebarItems();
      setSidebarItems(items);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error deleting sidebar item:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // Background settings handlers
  const handleSaveBackground = async (backgroundData) => {
    try {
      if (editingBackground && editingBackground.id) {
        await settingsApi.updatePageBackground(editingBackground.id, backgroundData);
      } else {
        await settingsApi.createPageBackground(backgroundData);
      }
      await refreshPageBackgrounds();
      const backgrounds = await settingsApi.getActivePageBackgrounds();
      const backgroundsObj = {};
      backgrounds.forEach(bg => {
        backgroundsObj[bg.page_route] = bg;
      });
      setPageBackgrounds(backgroundsObj);
      setEditingBackground(null);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error saving background:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleDeleteBackground = async (id) => {
    if (!window.confirm('Are you sure you want to delete this background setting?')) {
      return;
    }
    try {
      await settingsApi.deletePageBackground(id);
      await refreshPageBackgrounds();
      const backgrounds = await settingsApi.getActivePageBackgrounds();
      const backgroundsObj = {};
      backgrounds.forEach(bg => {
        backgroundsObj[bg.page_route] = bg;
      });
      setPageBackgrounds(backgroundsObj);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error deleting background:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const renderSidebarTab = () => (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Layout className="w-5 h-5 mr-2" />
            Sidebar Configuration
          </h3>
          <button
            onClick={() => setEditingSidebarItem({})}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Sidebar Items List */}
        <div className="space-y-4">
          {sidebarItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">{item.item_name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{item.route_path}</div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingSidebarItem(item)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteSidebarItem(item.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {sidebarItems.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No sidebar items configured. Click "Add Item" to create one.
            </div>
          )}
        </div>

        {/* Edit/Add Modal */}
        {editingSidebarItem !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingSidebarItem.id ? 'Edit Sidebar Item' : 'Add Sidebar Item'}
                </h4>
                <button
                  onClick={() => setEditingSidebarItem(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  handleSaveSidebarItem({
                    item_key: formData.get('item_key'),
                    item_name: formData.get('item_name'),
                    route_path: formData.get('route_path'),
                    icon_name: formData.get('icon_name') || '',
                    display_order: parseInt(formData.get('display_order') || '0'),
                    is_active: formData.get('is_active') === 'on',
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Item Key (unique identifier)
                  </label>
                  <input
                    type="text"
                    name="item_key"
                    defaultValue={editingSidebarItem.item_key || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    name="item_name"
                    defaultValue={editingSidebarItem.item_name || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Route Path
                  </label>
                  <select
                    name="route_path"
                    defaultValue={editingSidebarItem.route_path || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a route</option>
                    {availableRoutes.map((route) => (
                      <option key={route.path} value={route.path}>
                        {route.name} ({route.path})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    defaultValue={editingSidebarItem.display_order || 0}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={editingSidebarItem.is_active !== false}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active
                  </label>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingSidebarItem(null)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderBackgroundsTab = () => (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Image className="w-5 h-5 mr-2" />
            Page Background Settings
          </h3>
          <button
            onClick={() => setEditingBackground({})}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Background</span>
          </button>
        </div>

        {/* Backgrounds List */}
        <div className="space-y-4">
          {Object.values(pageBackgrounds).map((bg) => (
            <div
              key={bg.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">{bg.page_name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{bg.page_route}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Type: {bg.background_type}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingBackground(bg)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteBackground(bg.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {Object.keys(pageBackgrounds).length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No background settings configured. Click "Add Background" to create one.
            </div>
          )}
        </div>

        {/* Edit/Add Modal */}
        {editingBackground !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingBackground.id ? 'Edit Background' : 'Add Background'}
                </h4>
                <button
                  onClick={() => setEditingBackground(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const backgroundData = {
                    page_route: formData.get('page_route'),
                    page_name: formData.get('page_name'),
                    background_type: formData.get('background_type'),
                    background_color: formData.get('background_color') || null,
                    background_gradient: formData.get('background_gradient') || null,
                    is_active: formData.get('is_active') === 'on',
                  };
                  
                  const imageFile = formData.get('background_image');
                  if (imageFile && imageFile instanceof File && imageFile.size > 0) {
                    backgroundData.background_image = imageFile;
                  }
                  
                  handleSaveBackground(backgroundData);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Page Route
                  </label>
                  <select
                    name="page_route"
                    defaultValue={editingBackground.page_route || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a route</option>
                    {availableRoutes.map((route) => (
                      <option key={route.path} value={route.path}>
                        {route.name} ({route.path})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Page Name
                  </label>
                  <input
                    type="text"
                    name="page_name"
                    defaultValue={editingBackground.page_name || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Background Type
                  </label>
                  <select
                    name="background_type"
                    defaultValue={editingBackground.background_type || 'color'}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="color">Color</option>
                    <option value="image">Image</option>
                    <option value="gradient">Gradient</option>
                  </select>
                </div>
                <div id="color-field">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Background Color (hex or CSS color)
                  </label>
                  <input
                    type="text"
                    name="background_color"
                    defaultValue={editingBackground.background_color || ''}
                    placeholder="#ffffff or white"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div id="image-field">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Background Image
                  </label>
                  <input
                    type="file"
                    name="background_image"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {editingBackground.background_image_url && (
                    <div className="mt-2">
                      <img
                        src={editingBackground.background_image_url}
                        alt="Current background"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
                <div id="gradient-field">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Background Gradient (CSS gradient string)
                  </label>
                  <input
                    type="text"
                    name="background_gradient"
                    defaultValue={editingBackground.background_gradient || ''}
                    placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={editingBackground.is_active !== false}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active
                  </label>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingBackground(null)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return renderAppearanceTab();
      case 'sidebar':
        return renderSidebarTab();
      case 'backgrounds':
        return renderBackgroundsTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'security':
        return renderSecurityTab();
      case 'data':
        return renderDataTab();
      default:
        return renderAppearanceTab();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account and application preferences</p>
        </div>
        
        {/* Save Status */}
        <div className="flex items-center space-x-3">
          {saveStatus === 'success' && (
            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Settings saved!</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Error saving settings</span>
            </div>
          )}
          
          <button
            onClick={handleResetSettings}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-primary-light dark:bg-primary-dark/20 border border-primary dark:border-primary-dark rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-primary-dark dark:text-primary-light">Settings Information</h3>
            <p className="text-sm text-primary-dark dark:text-primary-light mt-1">
              Your settings are automatically saved to your browser's local storage. Theme changes are applied immediately, while other settings may require a page refresh to take full effect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
