import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, title, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (title, message) => addToast({ title, message, type: 'success' }),
    info: (title, message) => addToast({ title, message, type: 'info' }),
    swap: (title, message) => addToast({ title, message, type: 'swap' }),
    warning: (title, message) => addToast({ title, message, type: 'warning' }),
    remove: removeToast,
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

export function useToastList() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastList must be used within a ToastProvider');
  }
  return { toasts: context.toasts, removeToast: context.removeToast };
}
