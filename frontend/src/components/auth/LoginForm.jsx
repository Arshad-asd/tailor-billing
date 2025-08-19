import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login selection page
    navigate('/login');
  }, [navigate]);

  return null;
};

export default LoginForm;
