import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((variant, title, description = '') => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      variant,
      title,
      description,
      visible: true
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (title, description) => showToast('success', title, description),
    error: (title, description) => showToast('error', title, description),
    info: (title, description) => showToast('info', title, description),
    warning: (title, description) => showToast('warning', title, description),
  };

  return {
    toast,
    toasts,
    removeToast
  };
};
