import { useAppearance } from '../hooks/useAppearance';

export default function AppearanceDemo() {
  const { theme, colorTheme, changeTheme, changeColorTheme } = useAppearance();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Theme Demo</h2>
      
      <div className="space-y-2">
        <p>Current Theme: <span className="font-bold">{theme}</span></p>
        <p>Current Color Theme: <span className="font-bold">{colorTheme}</span></p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Theme Mode:</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => changeTheme('light')}
            className={`px-3 py-1 rounded ${theme === 'light' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            Light
          </button>
          <button 
            onClick={() => changeTheme('dark')}
            className={`px-3 py-1 rounded ${theme === 'dark' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            Dark
          </button>
          <button 
            onClick={() => changeTheme('system')}
            className={`px-3 py-1 rounded ${theme === 'system' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            System
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Color Theme:</h3>
        <div className="flex space-x-2">
          {['orange', 'blue', 'green', 'purple', 'red'].map((color) => (
            <button
              key={color}
              onClick={() => changeColorTheme(color)}
              className={`px-3 py-1 rounded ${colorTheme === color ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Theme Test Elements:</h3>
        <div className="space-y-2">
          <button className="bg-primary text-white px-4 py-2 rounded">
            Primary Button
          </button>
          <div className="bg-primary-light p-4 rounded">
            Primary Light Background
          </div>
          <div className="text-primary font-bold">
            Primary Text Color
          </div>
        </div>
      </div>
    </div>
  );
} 