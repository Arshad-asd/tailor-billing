import { useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/uiSlice';

let notificationId = 0;

const generateId = () => {
  return `notification_${Date.now()}_${notificationId++}`;
};

export const useNotification = () => {
  const dispatch = useDispatch();

  const showNotification = ({ type, title, message, duration = 5000 }) => {
    const id = generateId();
    dispatch(addNotification({ id, type, title, message, duration }));
    return id;
  };

  const showSuccess = (title, message, duration) => {
    return showNotification({ type: 'success', title, message, duration });
  };

  const showError = (title, message, duration) => {
    return showNotification({ type: 'error', title, message, duration });
  };

  const showWarning = (title, message, duration) => {
    return showNotification({ type: 'warning', title, message, duration });
  };

  const showInfo = (title, message, duration) => {
    return showNotification({ type: 'info', title, message, duration });
  };

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}; 