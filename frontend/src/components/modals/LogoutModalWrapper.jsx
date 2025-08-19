import { useNavigate } from 'react-router-dom';
import LogoutModal from './LogoutModal';

const LogoutModalWrapper = ({ isOpen, onClose, isExpired = false }) => {
  const navigate = useNavigate();

  return (
    <LogoutModal
      isOpen={isOpen}
      onClose={onClose}
      isExpired={isExpired}
      navigate={navigate}
    />
  );
};

export default LogoutModalWrapper; 