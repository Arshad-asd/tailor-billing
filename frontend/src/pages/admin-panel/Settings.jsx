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
  X,
  LayoutDashboard,
  ClipboardList,
  Package,
  Package2,
  Truck,
  DollarSign,
  BarChart3,
  Users,
  Receipt,
  FileText,
  Building2,
  Ruler,
  ShoppingCart,
  Scissors,
  ChevronDown,
  ChevronUp,
  Search
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
  const [selectedSidebarRoute, setSelectedSidebarRoute] = useState('');
  const [sidebarItemName, setSidebarItemName] = useState('');
  const [sidebarItemKey, setSidebarItemKey] = useState('');
  const [showSidebarRouteDropdown, setShowSidebarRouteDropdown] = useState(false);
  const [sidebarRouteSearchQuery, setSidebarRouteSearchQuery] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  // Background settings state
  const [pageBackgrounds, setPageBackgrounds] = useState([]);
  const [editingBackground, setEditingBackground] = useState(null);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [selectedBackgroundType, setSelectedBackgroundType] = useState('color');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [previewImage, setPreviewImage] = useState(null);
  const [gradientColors, setGradientColors] = useState({ start: '#667eea', end: '#764ba2' });
  const [selectedRoute, setSelectedRoute] = useState('');
  const [pageName, setPageName] = useState('');
  const [showRouteDropdown, setShowRouteDropdown] = useState(false);
  const [routeSearchQuery, setRouteSearchQuery] = useState('');
  
  // Route mapping with icons and display names
  const routeMapping = {
    'dashboard': { name: 'Dashboard', icon: LayoutDashboard },
    'job-orders': { name: 'Job Orders', icon: ClipboardList },
    'measurements': { name: 'Measurements', icon: Ruler },
    'materials': { name: 'Materials', icon: Package },
    'inventory': { name: 'Inventory', icon: Package2 },
    'delivery': { name: 'Delivery', icon: Truck },
    'sales': { name: 'Sales', icon: DollarSign },
    'daily-report': { name: 'Daily Report', icon: BarChart3 },
    'purchase': { name: 'Purchase', icon: ShoppingCart },
    'receipt': { name: 'Receipt', icon: Receipt },
    'customers': { name: 'Customers', icon: Users },
    'services': { name: 'Services', icon: Scissors },
    'settings': { name: 'Settings', icon: SettingsIcon },
    'reports': { name: 'Reports', icon: FileText },
    'company-details': { name: 'Company Details', icon: Building2 },
  };

  // Available routes for selection with icons and names
  const availableRoutes = adminRoutes
    .filter(route => route.path && route.path !== '')
    .map(route => {
      const mapping = routeMapping[route.path] || {
        name: route.path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        icon: LayoutDashboard
      };
      return {
        path: `/admin/${route.path}`,
        name: mapping.name,
        icon: mapping.icon,
        routeKey: route.path
      };
    });

  // Available icons for sidebar items
  const availableIcons = [
    { name: 'LayoutDashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { name: 'ClipboardList', icon: ClipboardList, label: 'Clipboard' },
    { name: 'Package', icon: Package, label: 'Package' },
    { name: 'Package2', icon: Package2, label: 'Package 2' },
    { name: 'Truck', icon: Truck, label: 'Truck' },
    { name: 'DollarSign', icon: DollarSign, label: 'Dollar' },
    { name: 'BarChart3', icon: BarChart3, label: 'Chart' },
    { name: 'Settings', icon: SettingsIcon, label: 'Settings' },
    { name: 'Users', icon: Users, label: 'Users' },
    { name: 'Receipt', icon: Receipt, label: 'Receipt' },
    { name: 'FileText', icon: FileText, label: 'File' },
    { name: 'Building2', icon: Building2, label: 'Building' },
    { name: 'Ruler', icon: Ruler, label: 'Ruler' },
    { name: 'ShoppingCart', icon: ShoppingCart, label: 'Cart' },
    { name: 'Scissors', icon: Scissors, label: 'Scissors' },
    { name: 'Bell', icon: Bell, label: 'Bell' },
    { name: 'Search', icon: Search, label: 'Search' },
    { name: 'User', icon: User, label: 'User' },
    { name: 'Shield', icon: Shield, label: 'Shield' },
    { name: 'Database', icon: Database, label: 'Database' },
    { name: 'Mail', icon: Mail, label: 'Mail' },
    { name: 'Globe', icon: Globe, label: 'Globe' },
    { name: 'Eye', icon: Eye, label: 'Eye' },
    { name: 'Palette', icon: Palette, label: 'Palette' },
  ];

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
        const items = await settingsApi.getSidebarItems();
        setSidebarItems(items);
        
        const backgrounds = await settingsApi.getPageBackgrounds();
        setPageBackgrounds(backgrounds);
      } catch (error) {
        console.error('Error loading settings data:', error);
      }
    };
    loadData();
  }, []);

  // Initialize sidebar form state when editing
  useEffect(() => {
    if (editingSidebarItem) {
      setSelectedSidebarRoute(editingSidebarItem.route_path || '');
      setSidebarItemName(editingSidebarItem.item_name || '');
      setSidebarItemKey(editingSidebarItem.item_key || '');
      setSelectedIcon(editingSidebarItem.icon_name || '');
      setShowSidebarRouteDropdown(false);
      setShowIconPicker(false);
      setSidebarRouteSearchQuery('');
    } else {
      setSelectedSidebarRoute('');
      setSidebarItemName('');
      setSidebarItemKey('');
      setSelectedIcon('');
      setShowSidebarRouteDropdown(false);
      setShowIconPicker(false);
      setSidebarRouteSearchQuery('');
    }
  }, [editingSidebarItem]);

  // Auto-fill sidebar item name and key when route is selected
  const handleSidebarRouteSelect = (route) => {
    setSelectedSidebarRoute(route.path);
    setSidebarItemName(route.name);
    setSidebarItemKey(route.routeKey);
    setShowSidebarRouteDropdown(false);
    setSidebarRouteSearchQuery('');
  };

  // Initialize form state when editing background
  useEffect(() => {
    if (editingBackground) {
      const bgType = editingBackground.background_type || 'color';
      setSelectedBackgroundType(bgType);
      setSelectedColor(editingBackground.background_color || '#ffffff');
      setGradientColors({
        start: editingBackground.background_gradient?.match(/#[0-9a-fA-F]{6}/)?.[0] || '#667eea',
        end: editingBackground.background_gradient?.match(/#[0-9a-fA-F]{6}/g)?.[1] || '#764ba2'
      });
      setPreviewImage(editingBackground.background_image_url || null);
      setSelectedRoute(editingBackground.page_route || '');
      setPageName(editingBackground.page_name || '');
      setShowRouteDropdown(false);
      setRouteSearchQuery('');
    } else {
      setSelectedBackgroundType('color');
      setSelectedColor('#ffffff');
      setGradientColors({ start: '#667eea', end: '#764ba2' });
      setPreviewImage(null);
      setSelectedRoute('');
      setPageName('');
      setShowRouteDropdown(false);
      setRouteSearchQuery('');
    }
  }, [editingBackground]);

  // Auto-fill page name when route is selected
  const handleRouteSelect = (route) => {
    setSelectedRoute(route.path);
    setPageName(route.name);
    setShowRouteDropdown(false);
    setRouteSearchQuery('');
  };

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
        const items = await settingsApi.getSidebarItems();
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
        const items = await settingsApi.getSidebarItems();
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
      const backgrounds = await settingsApi.getPageBackgrounds();
      setPageBackgrounds(backgrounds);
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
      const backgrounds = await settingsApi.getPageBackgrounds();
      setPageBackgrounds(backgrounds);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error deleting background:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const renderSidebarTab = () => {
    // Get icon component from name
    const getIconComponent = (iconName) => {
      const iconObj = availableIcons.find(i => i.name === iconName);
      return iconObj ? iconObj.icon : LayoutDashboard;
    };

    return (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sidebarItems.map((item) => {
              const ItemIcon = getIconComponent(item.icon_name);
              const routeKey = item.route_path?.replace('/admin/', '') || '';
              const routeInfo = routeMapping[routeKey] || { name: item.item_name, icon: LayoutDashboard };
              
              return (
                <div
                  key={item.id}
                  className={`group relative border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg ${
                    item.is_active 
                      ? 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800' 
                      : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 opacity-75'
                  }`}
                >
                  {/* Header with Icon */}
                  <div className="p-4 bg-gradient-to-r from-primary-light to-primary dark:from-primary-dark/20 dark:to-primary-dark/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                          <ItemIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                            {item.item_name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            Order: {item.display_order || 0}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.is_active 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-500 text-white'
                      }`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Route:</span>
                        <span className="text-gray-900 dark:text-white font-mono text-xs truncate flex-1">
                          {item.route_path}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Key:</span>
                        <span className="text-gray-900 dark:text-white font-mono text-xs truncate flex-1">
                          {item.item_key}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Icon:</span>
                        <span className="text-gray-900 dark:text-white text-xs truncate flex-1">
                          {item.icon_name || 'Default'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setEditingSidebarItem(item)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit sidebar item"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSidebarItem(item.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete sidebar item"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {sidebarItems.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <Layout className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">
                No sidebar items configured
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                Click "Add Item" to create your first sidebar item
              </p>
              <button
                onClick={() => setEditingSidebarItem({})}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>
          )}

        {/* Edit/Add Modal */}
        {editingSidebarItem !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                    item_key: sidebarItemKey,
                    item_name: sidebarItemName,
                    route_path: selectedSidebarRoute,
                    icon_name: selectedIcon || '',
                    display_order: parseInt(formData.get('display_order') || '0'),
                    is_active: formData.get('is_active') === 'on',
                  });
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Page Route
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowSidebarRouteDropdown(!showSidebarRouteDropdown)}
                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-between hover:border-primary transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          {selectedSidebarRoute ? (
                            <>
                              {(() => {
                                const route = availableRoutes.find(r => r.path === selectedSidebarRoute);
                                const Icon = route?.icon || LayoutDashboard;
                                return (
                                  <>
                                    <Icon className="w-5 h-5 text-primary" />
                                    <span>{route?.name || 'Select a route'}</span>
                                  </>
                                );
                              })()}
                            </>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">Select a route</span>
                          )}
                        </div>
                        {showSidebarRouteDropdown ? (
                          <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                      
                      {showSidebarRouteDropdown && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => {
                              setShowSidebarRouteDropdown(false);
                              setSidebarRouteSearchQuery('');
                            }}
                          />
                          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden flex flex-col">
                            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Search routes..."
                                  value={sidebarRouteSearchQuery}
                                  onChange={(e) => setSidebarRouteSearchQuery(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>
                            </div>
                            <div className="overflow-y-auto max-h-64">
                              {availableRoutes
                                .filter(route => 
                                  route.name.toLowerCase().includes(sidebarRouteSearchQuery.toLowerCase()) ||
                                  route.path.toLowerCase().includes(sidebarRouteSearchQuery.toLowerCase())
                                )
                                .map((route) => {
                                  const Icon = route.icon;
                                  const isSelected = selectedSidebarRoute === route.path;
                                  return (
                                    <button
                                      key={route.path}
                                      type="button"
                                      onClick={() => handleSidebarRouteSelect(route)}
                                      className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                        isSelected ? 'bg-primary-light dark:bg-primary-dark/20' : ''
                                      }`}
                                    >
                                      <Icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`} />
                                      <div className="flex-1 text-left min-w-0">
                                        <div className={`font-medium truncate ${isSelected ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                                          {route.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                          {route.path}
                                        </div>
                                      </div>
                                      {isSelected && (
                                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              {availableRoutes.filter(route => 
                                route.name.toLowerCase().includes(sidebarRouteSearchQuery.toLowerCase()) ||
                                route.path.toLowerCase().includes(sidebarRouteSearchQuery.toLowerCase())
                              ).length === 0 && (
                                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                  No routes found matching "{sidebarRouteSearchQuery}"
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Item Name
                    </label>
                    <input
                      type="text"
                      name="item_name"
                      value={sidebarItemName}
                      onChange={(e) => setSidebarItemName(e.target.value)}
                      required
                      placeholder="Item name will auto-fill from selected route"
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Item Key (unique identifier)
                    </label>
                    <input
                      type="text"
                      name="item_key"
                      value={sidebarItemKey}
                      onChange={(e) => setSidebarItemKey(e.target.value)}
                      required
                      placeholder="Item key will auto-fill from selected route"
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="display_order"
                      defaultValue={editingSidebarItem.display_order || 0}
                      min="0"
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Icon Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowIconPicker(!showIconPicker)}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-between hover:border-primary transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        {selectedIcon ? (
                          <>
                            {(() => {
                              const iconObj = availableIcons.find(i => i.name === selectedIcon);
                              const Icon = iconObj?.icon || LayoutDashboard;
                              return (
                                <>
                                  <Icon className="w-5 h-5 text-primary" />
                                  <span>{iconObj?.label || selectedIcon}</span>
                                </>
                              );
                            })()}
                          </>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Select an icon</span>
                        )}
                      </div>
                      {showIconPicker ? (
                        <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                    
                    {showIconPicker && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => {
                            setShowIconPicker(false);
                          }}
                        />
                        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden flex flex-col">
                          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search icons..."
                                onClick={(e) => e.stopPropagation()}
                                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          </div>
                          <div className="overflow-y-auto max-h-64 p-2">
                            <div className="grid grid-cols-6 gap-2">
                              {availableIcons.map((iconObj) => {
                                const Icon = iconObj.icon;
                                const isSelected = selectedIcon === iconObj.name;
                                return (
                                  <button
                                    key={iconObj.name}
                                    type="button"
                                    onClick={() => {
                                      setSelectedIcon(iconObj.name);
                                      setShowIconPicker(false);
                                    }}
                                    className={`p-3 rounded-lg border-2 transition-all hover:border-primary ${
                                      isSelected 
                                        ? 'border-primary bg-primary-light dark:bg-primary-dark/20' 
                                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                    title={iconObj.label}
                                  >
                                    <Icon className={`w-5 h-5 mx-auto ${isSelected ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`} />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={editingSidebarItem.is_active !== false}
                    className="mr-2 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active
                  </label>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
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
  };

  const renderBackgroundsTab = () => {
    // Filter backgrounds based on showOnlyActive
    const filteredBackgrounds = showOnlyActive 
      ? pageBackgrounds.filter(bg => bg.is_active) 
      : pageBackgrounds;

    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Image className="w-5 h-5 mr-2" />
              Page Background Settings
            </h3>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyActive}
                  onChange={(e) => setShowOnlyActive(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show only active</span>
              </label>
              <button
                onClick={() => setEditingBackground({})}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Background</span>
              </button>
            </div>
          </div>

          {/* Backgrounds List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBackgrounds.map((bg) => {
              // Get route icon
              const routeKey = bg.page_route?.replace('/admin/', '') || '';
              const routeInfo = routeMapping[routeKey] || { name: bg.page_name, icon: LayoutDashboard };
              const RouteIcon = routeInfo.icon;
              
              // Get background preview style
              const getBackgroundStyle = () => {
                if (bg.background_type === 'color' && bg.background_color) {
                  return { backgroundColor: bg.background_color };
                } else if (bg.background_type === 'gradient' && bg.background_gradient) {
                  return { background: bg.background_gradient };
                } else if (bg.background_type === 'image' && bg.background_image_url) {
                  return { 
                    backgroundImage: `url(${bg.background_image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  };
                }
                return { backgroundColor: '#f3f4f6' };
              };

              return (
                <div
                  key={bg.id}
                  className={`group relative border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg ${
                    bg.is_active 
                      ? 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800' 
                      : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 opacity-75'
                  }`}
                >
                  {/* Background Preview */}
                  <div 
                    className="h-32 w-full relative"
                    style={getBackgroundStyle()}
                  >
                    {/* Overlay for better text visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full shadow-sm ${
                        bg.is_active 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-500 text-white'
                      }`}>
                        {bg.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-black/50 text-white backdrop-blur-sm">
                        {bg.background_type?.charAt(0).toUpperCase() + bg.background_type?.slice(1) || 'Color'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className="p-2 bg-primary-light dark:bg-primary-dark/20 rounded-lg flex-shrink-0">
                          <RouteIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                            {bg.page_name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {bg.page_route}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Background Details */}
                    <div className="space-y-2 mb-4">
                      {bg.background_type === 'color' && bg.background_color && (
                        <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                          <div 
                            className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: bg.background_color }}
                          />
                          <span className="truncate">{bg.background_color}</span>
                        </div>
                      )}
                      {bg.background_type === 'gradient' && bg.background_gradient && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          Gradient
                        </div>
                      )}
                      {bg.background_type === 'image' && bg.background_image_url && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate flex items-center space-x-1">
                          <Image className="w-3 h-3" />
                          <span>Image</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setEditingBackground(bg)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit background"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteBackground(bg.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete background"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredBackgrounds.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <Image className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">
                {showOnlyActive 
                  ? 'No active background settings found' 
                  : 'No background settings configured'}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                {showOnlyActive 
                  ? 'Try unchecking "Show only active" to see all backgrounds' 
                  : 'Click "Add Background" to create your first background setting'}
              </p>
              {!showOnlyActive && (
                <button
                  onClick={() => setEditingBackground({})}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors inline-flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Background</span>
                </button>
              )}
            </div>
          )}

        {/* Edit/Add Modal */}
        {editingBackground !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  let backgroundData = {
                    page_route: selectedRoute,
                    page_name: pageName,
                    background_type: selectedBackgroundType,
                    is_active: formData.get('is_active') === 'on',
                  };
                  
                  if (selectedBackgroundType === 'color') {
                    backgroundData.background_color = selectedColor;
                  } else if (selectedBackgroundType === 'gradient') {
                    backgroundData.background_gradient = `linear-gradient(135deg, ${gradientColors.start} 0%, ${gradientColors.end} 100%)`;
                  } else if (selectedBackgroundType === 'image') {
                    const imageFile = formData.get('background_image');
                    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
                      backgroundData.background_image = imageFile;
                    }
                  }
                  
                  handleSaveBackground(backgroundData);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Page Route
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowRouteDropdown(!showRouteDropdown)}
                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-between hover:border-primary transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          {selectedRoute ? (
                            <>
                              {(() => {
                                const route = availableRoutes.find(r => r.path === selectedRoute);
                                const Icon = route?.icon || LayoutDashboard;
                                return (
                                  <>
                                    <Icon className="w-5 h-5 text-primary" />
                                    <span>{route?.name || 'Select a route'}</span>
                                  </>
                                );
                              })()}
                            </>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">Select a route</span>
                          )}
                        </div>
                          {showRouteDropdown ? (
                            <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          )}
                      </button>
                      
                      {showRouteDropdown && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => {
                              setShowRouteDropdown(false);
                              setRouteSearchQuery('');
                            }}
                          />
                          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden flex flex-col">
                            {/* Search Input */}
                            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Search routes..."
                                  value={routeSearchQuery}
                                  onChange={(e) => setRouteSearchQuery(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>
                            </div>
                            
                            {/* Routes List */}
                            <div className="overflow-y-auto max-h-64">
                              {availableRoutes
                                .filter(route => 
                                  route.name.toLowerCase().includes(routeSearchQuery.toLowerCase()) ||
                                  route.path.toLowerCase().includes(routeSearchQuery.toLowerCase())
                                )
                                .map((route) => {
                                  const Icon = route.icon;
                                  const isSelected = selectedRoute === route.path;
                                  return (
                                    <button
                                      key={route.path}
                                      type="button"
                                      onClick={() => handleRouteSelect(route)}
                                      className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                        isSelected ? 'bg-primary-light dark:bg-primary-dark/20' : ''
                                      }`}
                                    >
                                      <Icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`} />
                                      <div className="flex-1 text-left min-w-0">
                                        <div className={`font-medium truncate ${isSelected ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                                          {route.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                          {route.path}
                                        </div>
                                      </div>
                                      {isSelected && (
                                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              {availableRoutes.filter(route => 
                                route.name.toLowerCase().includes(routeSearchQuery.toLowerCase()) ||
                                route.path.toLowerCase().includes(routeSearchQuery.toLowerCase())
                              ).length === 0 && (
                                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                  No routes found matching "{routeSearchQuery}"
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <input
                      type="hidden"
                      name="page_route"
                      value={selectedRoute}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Page Name
                    </label>
                    <input
                      type="text"
                      name="page_name"
                      value={pageName}
                      onChange={(e) => setPageName(e.target.value)}
                      required
                      placeholder="Page name will auto-fill from selected route"
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Background Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Background Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'color', label: 'Color', icon: Palette },
                      { value: 'gradient', label: 'Gradient', icon: Layout },
                      { value: 'image', label: 'Image', icon: Image },
                    ].map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setSelectedBackgroundType(type.value)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedBackgroundType === type.value
                              ? 'border-primary bg-primary-light dark:bg-primary-dark/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white text-sm">{type.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Picker Section */}
                {selectedBackgroundType === 'color' && (
                  <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Color
                    </label>
                    
                    {/* Color Preview */}
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-20 h-20 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: selectedColor }}
                      />
                      <div className="flex-1">
                        <input
                          type="color"
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          className="w-full h-10 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          placeholder="#ffffff"
                          className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Color Palette */}
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Quick Select Colors
                      </label>
                      <div className="grid grid-cols-8 gap-2">
                        {[
                          '#ffffff', '#000000', '#f3f4f6', '#1f2937',
                          '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
                          '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
                          '#f97316', '#6366f1', '#14b8a6', '#eab308',
                        ].map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={`w-10 h-10 rounded-lg border-2 transition-all ${
                              selectedColor === color
                                ? 'border-primary ring-2 ring-primary ring-offset-2'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Gradient Builder Section */}
                {selectedBackgroundType === 'gradient' && (
                  <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gradient Colors
                    </label>
                    
                    {/* Gradient Preview */}
                    <div 
                      className="w-full h-24 rounded-lg border-2 border-gray-300 dark:border-gray-600 mb-4"
                      style={{ background: `linear-gradient(135deg, ${gradientColors.start} 0%, ${gradientColors.end} 100%)` }}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Start Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={gradientColors.start}
                            onChange={(e) => setGradientColors(prev => ({ ...prev, start: e.target.value }))}
                            className="w-12 h-10 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={gradientColors.start}
                            onChange={(e) => setGradientColors(prev => ({ ...prev, start: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">
                          End Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={gradientColors.end}
                            onChange={(e) => setGradientColors(prev => ({ ...prev, end: e.target.value }))}
                            className="w-12 h-10 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={gradientColors.end}
                            onChange={(e) => setGradientColors(prev => ({ ...prev, end: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preset Gradients */}
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Preset Gradients
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { start: '#667eea', end: '#764ba2', name: 'Purple' },
                          { start: '#f093fb', end: '#f5576c', name: 'Pink' },
                          { start: '#4facfe', end: '#00f2fe', name: 'Blue' },
                          { start: '#43e97b', end: '#38f9d7', name: 'Green' },
                          { start: '#fa709a', end: '#fee140', name: 'Sunset' },
                          { start: '#30cfd0', end: '#330867', name: 'Ocean' },
                          { start: '#a8edea', end: '#fed6e3', name: 'Soft' },
                          { start: '#ff9a9e', end: '#fecfef', name: 'Rose' },
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setGradientColors({ start: preset.start, end: preset.end })}
                            className="relative h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-primary transition-all overflow-hidden group"
                            style={{ background: `linear-gradient(135deg, ${preset.start} 0%, ${preset.end} 100%)` }}
                            title={preset.name}
                          >
                            <span className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                              {preset.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Upload Section */}
                {selectedBackgroundType === 'image' && (
                  <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Background Image
                    </label>
                    <div className="space-y-3">
                      <input
                        type="file"
                        name="background_image"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPreviewImage(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer"
                      />
                      {(previewImage || editingBackground.background_image_url) && (
                        <div className="mt-2">
                          <img
                            src={previewImage || editingBackground.background_image_url}
                            alt="Background preview"
                            className="w-full h-48 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
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
  };

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
