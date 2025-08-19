import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { useEffect, useState } from 'react';
import { router } from './routes/AppRoutes';
import { store } from './store/store';
import { initializeAuth } from './store/slices/authSlice';
import NotificationContainer from './components/ui/notification';
import LoadingSpinner from './components/LoadingSpinner';
import { SettingsProvider } from './contexts/SettingsContext';
import './App.css';

function AppContent() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initialize auth state from localStorage and fetch user data if token exists
    const initAuth = async () => {
      try {
        await store.dispatch(initializeAuth()).unwrap();
      } catch (error) {
        console.log('Auth initialization failed:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <NotificationContainer />
      <RouterProvider router={router} />
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </Provider>
  );
}

export default App;
