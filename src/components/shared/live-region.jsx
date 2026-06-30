'use client';

import { useEffect, useRef } from 'react';

/**
 * Live region component for screen reader announcements
 * Provides polite and assertive announcement capabilities
 */
export function LiveRegion({ 
  message, 
  priority = 'polite', // 'polite' | 'assertive'
  clearDelay = 1000 
}) {
  const regionRef = useRef(null);

  useEffect(() => {
    if (message && regionRef.current) {
      regionRef.current.textContent = message;
      
      // Clear the message after delay to prevent repeated announcements
      if (clearDelay > 0) {
        const timer = setTimeout(() => {
          if (regionRef.current) {
            regionRef.current.textContent = '';
          }
        }, clearDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [message, clearDelay]);

  return (
    <div
      ref={regionRef}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    />
  );
}

/**
 * Hook for managing live region announcements
 */
export function useLiveRegion() {
  const announceRef = useRef(null);

  const announce = (message, priority = 'polite') => {
    if (announceRef.current) {
      announceRef.current.announce(message, priority);
    }
  };

  const LiveRegionProvider = ({ children }) => {
    const politeRef = useRef(null);
    const assertiveRef = useRef(null);

    announceRef.current = {
      announce: (message, priority) => {
        const targetRef = priority === 'assertive' ? assertiveRef : politeRef;
        if (targetRef.current) {
          targetRef.current.textContent = message;
          setTimeout(() => {
            if (targetRef.current) {
              targetRef.current.textContent = '';
            }
          }, 1000);
        }
      }
    };

    return (
      <>
        {children}
        <div
          ref={politeRef}
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
        <div
          ref={assertiveRef}
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
        />
      </>
    );
  };

  return { announce, LiveRegionProvider };
}