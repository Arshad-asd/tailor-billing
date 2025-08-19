import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { LogOut, AlertTriangle } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, isExpired = false, navigate }) => {
  const dispatch = useDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout API fails, clear local state and redirect
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
      onClose();
    }
  };

  const handleCancel = () => {
    if (isExpired) {
      // If token is expired, force logout
      handleLogout();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isExpired ? (
              <>
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>Session Expired</span>
              </>
            ) : (
              <>
                <LogOut className="w-5 h-5" />
                <span>Confirm Logout</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isExpired 
              ? "Your session has expired. You will be logged out for security reasons."
              : "Are you sure you want to logout? You will need to login again to access the system."
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex space-x-2">
          {!isExpired && (
            <Button variant="outline" onClick={onClose} disabled={isLoggingOut}>
              Cancel
            </Button>
          )}
          <Button 
            variant={isExpired ? "destructive" : "default"}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : (isExpired ? "OK" : "Logout")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutModal; 