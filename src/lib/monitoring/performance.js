/**
 * Performance monitoring and analytics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.isClient = typeof window !== 'undefined';
    
    if (this.isClient) {
      this.initWebVitals();
    }
  }

  /**
   * Initialize Web Vitals monitoring
   */
  async initWebVitals() {
    try {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
      
      getCLS(this.sendToAnalytics.bind(this));
      getFID(this.sendToAnalytics.bind(this));
      getFCP(this.sendToAnalytics.bind(this));
      getLCP(this.sendToAnalytics.bind(this));
      getTTFB(this.sendToAnalytics.bind(this));
    } catch (error) {
      console.warn('Web Vitals not available:', error);
    }
  }

  /**
   * Send metrics to analytics service
   */
  sendToAnalytics(metric) {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      delta: metric.delta,
      rating: metric.rating,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    // Send to your analytics service
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', body);
    } else {
      fetch('/api/analytics', {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(console.error);
    }
  }

  /**
   * Track custom performance metrics
   */
  trackMetric(name, value, tags = {}) {
    const metric = {
      name,
      value,
      tags,
      timestamp: Date.now(),
    };

    this.metrics.set(name, metric);

    // Send to monitoring service
    this.sendCustomMetric(metric);
  }

  /**
   * Send custom metrics to monitoring service
   */
  async sendCustomMetric(metric) {
    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      console.error('Failed to send custom metric:', error);
    }
  }

  /**
   * Track user interactions
   */
  trackInteraction(action, category = 'user', label = '') {
    this.trackMetric('user_interaction', 1, {
      action,
      category,
      label,
    });
  }

  /**
   * Track API call performance
   */
  trackApiCall(endpoint, duration, status) {
    this.trackMetric('api_call', duration, {
      endpoint,
      status,
    });
  }

  /**
   * Track component render performance
   */
  trackComponentRender(componentName, renderTime) {
    this.trackMetric('component_render', renderTime, {
      component: componentName,
    });
  }

  /**
   * Track memory usage
   */
  trackMemoryUsage() {
    if (this.isClient && performance.memory) {
      const memory = performance.memory;
      this.trackMetric('memory_usage', memory.usedJSHeapSize, {
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      });
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    return {
      metrics: Array.from(this.metrics.values()),
      navigation: this.isClient ? performance.getEntriesByType('navigation')[0] : null,
      resources: this.isClient ? performance.getEntriesByType('resource') : [],
      memory: this.isClient && performance.memory ? performance.memory : null,
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance tracking
import { useEffect } from 'react';

export function usePerformanceTracking(componentName) {
  const startTime = performance.now();

  useEffect(() => {
    return () => {
      const renderTime = performance.now() - startTime;
      performanceMonitor.trackComponentRender(componentName, renderTime);
    };
  }, [componentName, startTime]);
}