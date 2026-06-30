'use client';

import { useState, useCallback } from 'react';

let toastCount = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, description, variant = 'default', duration = 5000 }) => {
    const id = ++toastCount;
    const toast = {
      id,
      title,
      description,
      variant,
      duration,
    };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((props) => {
    return addToast(props);
  }, [addToast]);

  return {
    toasts,
    toast,
    addToast,
    removeToast,
  };
}