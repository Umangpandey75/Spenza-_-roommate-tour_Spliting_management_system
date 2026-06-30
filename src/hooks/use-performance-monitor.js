import { useEffect, useRef } from 'react';

/**
 * Custom hook for monitoring component performance
 * Helps identify components that need memoization
 */
export function usePerformanceMonitor(componentName, dependencies = []) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current += 1;
    const currentTime = Date.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    
    // Log performance data in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 ${componentName} Performance:`, {
        renderCount: renderCount.current,
        timeSinceLastRender: `${timeSinceLastRender}ms`,
        dependencies: dependencies.length,
      });
      
      // Warn about frequent re-renders
      if (renderCount.current > 10 && timeSinceLastRender < 100) {
        console.warn(`⚠️ ${componentName} is re-rendering frequently. Consider memoization.`);
      }
    }
    
    lastRenderTime.current = currentTime;
  });

  return {
    renderCount: renderCount.current,
  };
}

/**
 * Custom hook for measuring expensive operations
 */
export function useOperationTimer(operationName) {
  const timerRef = useRef(null);
  
  const startTimer = () => {
    timerRef.current = performance.now();
  };
  
  const endTimer = () => {
    if (timerRef.current) {
      const duration = performance.now() - timerRef.current;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${operationName} took ${duration.toFixed(2)}ms`);
        
        // Warn about slow operations
        if (duration > 100) {
          console.warn(`🐌 ${operationName} is slow (${duration.toFixed(2)}ms). Consider optimization.`);
        }
      }
      
      timerRef.current = null;
      return duration;
    }
    return 0;
  };
  
  return { startTimer, endTimer };
}