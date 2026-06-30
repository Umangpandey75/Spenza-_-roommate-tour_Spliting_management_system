import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook for managing keyboard navigation within a container
 * Supports arrow keys, Tab, Enter, and Escape
 */
export function useKeyboardNavigation({
  containerRef,
  selector = '[tabindex], button, input, select, textarea, a[href]',
  onEscape,
  onEnter,
  wrap = true,
  direction = 'both', // 'horizontal', 'vertical', 'both'
}) {
  const currentIndexRef = useRef(-1);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const elements = Array.from(
      containerRef.current.querySelectorAll(selector)
    ).filter(el => 
      !el.disabled && 
      !el.hasAttribute('aria-hidden') &&
      el.offsetParent !== null // visible elements only
    );
    
    return elements;
  }, [containerRef, selector]);

  const focusElement = useCallback((index) => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    let targetIndex = index;
    
    if (wrap) {
      if (targetIndex < 0) targetIndex = elements.length - 1;
      if (targetIndex >= elements.length) targetIndex = 0;
    } else {
      targetIndex = Math.max(0, Math.min(targetIndex, elements.length - 1));
    }

    const element = elements[targetIndex];
    if (element) {
      element.focus();
      currentIndexRef.current = targetIndex;
    }
  }, [getFocusableElements, wrap]);

  const handleKeyDown = useCallback((event) => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const currentElement = document.activeElement;
    const currentIndex = elements.indexOf(currentElement);
    currentIndexRef.current = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        if (direction === 'vertical' || direction === 'both') {
          event.preventDefault();
          focusElement(currentIndex + 1);
        }
        break;
        
      case 'ArrowUp':
        if (direction === 'vertical' || direction === 'both') {
          event.preventDefault();
          focusElement(currentIndex - 1);
        }
        break;
        
      case 'ArrowRight':
        if (direction === 'horizontal' || direction === 'both') {
          event.preventDefault();
          focusElement(currentIndex + 1);
        }
        break;
        
      case 'ArrowLeft':
        if (direction === 'horizontal' || direction === 'both') {
          event.preventDefault();
          focusElement(currentIndex - 1);
        }
        break;
        
      case 'Home':
        event.preventDefault();
        focusElement(0);
        break;
        
      case 'End':
        event.preventDefault();
        focusElement(elements.length - 1);
        break;
        
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter(currentElement, currentIndex);
        }
        break;
        
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape(currentElement, currentIndex);
        }
        break;
    }
  }, [getFocusableElements, focusElement, direction, onEnter, onEscape]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, handleKeyDown]);

  return {
    focusFirst: () => focusElement(0),
    focusLast: () => focusElement(getFocusableElements().length - 1),
    focusNext: () => focusElement(currentIndexRef.current + 1),
    focusPrevious: () => focusElement(currentIndexRef.current - 1),
    getCurrentIndex: () => currentIndexRef.current,
    getElementCount: () => getFocusableElements().length,
  };
}