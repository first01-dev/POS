import toast from 'react-hot-toast';
import { clearAllLocalStorage, getLocalStorage } from './StorageUtils';

/**
 * Auto logout user & disconnect EDC when token expires.
 * @param onEDCDisconnect - Callback function to disconnect EDC device.
 */
const initAutoLogout = (onEDCDisconnect?: () => void) => {
  setInterval(() => {
    const token = getLocalStorage('token');
    if (!token) {
      if (window.location.pathname !== '/' && window.location.pathname !== '/logout') {
        clearAllLocalStorage();
        toast.error('Session expired. Please login again.');

        if (onEDCDisconnect) {
          onEDCDisconnect();
        }

        window.location.href = '/';
      }
    }
  }, 1000);
};

export default initAutoLogout;
