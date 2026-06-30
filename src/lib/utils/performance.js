/**
 * Performance optimization utilities
 */

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';

/**
 * Debounce hook for expensive operations
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

/**
 * Memoized calculation hook
 * @param {Function} calculation - Calculation function
 * @param {Array} dependencies - Dependencies array
 * @returns {any} Memoized result
 */
export function useMemoizedCalculation(calculation, dependencies) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => {
    const start = performance.now();
    const result = calculation();
    const end = performance.now();
    
    if (end - start > 100) {
      console.warn(`Slow calculation detected: ${end - start}ms`);
    }
    
    return result;
  }, dependencies);
}

/**
 * Throttle function for frequent events
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Lazy load component wrapper
 * @param {Function} importFunc - Dynamic import function
 * @returns {React.Component} Lazy loaded component
 */
export function createLazyComponent(importFunc) {
  return React.lazy(() => 
    importFunc().catch(err => {
      console.error('Failed to load component:', err);
      return { default: () => React.createElement('div', null, 'Failed to load component') };
    })
  );
}

/**
 * Virtual scrolling hook for large lists
 * @param {Array} items - Array of items
 * @param {number} itemHeight - Height of each item
 * @param {number} containerHeight - Height of container
 * @returns {Object} Virtual scrolling data
 */
export function useVirtualScroll(items, itemHeight, containerHeight) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);
  
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight,
    onScroll: (e) => setScrollTop(e.target.scrollTop)
  };
}

/**
 * Performance monitoring hook
 * @param {string} componentName - Name of component to monitor
 */
export function usePerformanceMonitor(componentName) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());
  
  useEffect(() => {
    renderCount.current += 1;
    const renderTime = performance.now() - startTime.current;
    
    if (renderTime > 16) { // More than one frame
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms (render #${renderCount.current})`);
    }
    
    startTime.current = performance.now();
  });
}