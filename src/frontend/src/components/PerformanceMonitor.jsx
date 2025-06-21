// Performance monitoring component with Web Vitals
import React, { useEffect, useState } from 'react';

export default function PerformanceMonitor({ onMetrics }) {
  const [metrics, setMetrics] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Web Vitals monitoring
    const measureWebVitals = () => {
      // Largest Contentful Paint
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        updateMetric('LCP', Math.round(lastEntry.startTime));
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          updateMetric('FID', Math.round(entry.processingStart - entry.startTime));
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        updateMetric('CLS', Math.round(clsValue * 1000) / 1000);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Time to First Byte
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        updateMetric('TTFB', Math.round(navigation.responseStart - navigation.requestStart));
      }

      // First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        updateMetric('FCP', Math.round(fcpEntry.startTime));
      }

      // Total Blocking Time (approximate)
      const longTasks = performance.getEntriesByType('longtask');
      const tbt = longTasks.reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0);
      updateMetric('TBT', Math.round(tbt));
    };

    const updateMetric = (name, value) => {
      setMetrics(prev => {
        const updated = { ...prev, [name]: value };
        if (onMetrics) onMetrics(updated);
        return updated;
      });
    };

    // Start monitoring after page load
    if (document.readyState === 'complete') {
      measureWebVitals();
    } else {
      window.addEventListener('load', measureWebVitals);
    }

    // API call timing
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const start = performance.now();
      return originalFetch.apply(this, args).then(response => {
        const duration = Math.round(performance.now() - start);
        updateMetric(`API_${args[0].split('/').pop()}`, duration);
        return response;
      });
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [onMetrics]);

  const getMetricColor = (metric, value) => {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
      TBT: { good: 200, poor: 600 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'text-gray-600';
    
    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatValue = (metric, value) => {
    if (metric === 'CLS') return value?.toFixed(3);
    if (typeof value === 'number') return `${value}ms`;
    return value || '-';
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded mb-2"
      >
        📊 Performance {isVisible ? '▼' : '▲'}
      </button>
      
      {isVisible && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-xs max-w-xs">
          <h4 className="font-semibold mb-2">Web Vitals</h4>
          <div className="space-y-1">
            {['LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'TBT'].map(metric => (
              <div key={metric} className="flex justify-between">
                <span className="font-medium">{metric}:</span>
                <span className={getMetricColor(metric, metrics[metric])}>
                  {formatValue(metric, metrics[metric])}
                </span>
              </div>
            ))}
          </div>
          
          {Object.keys(metrics).some(key => key.startsWith('API_')) && (
            <>
              <h4 className="font-semibold mt-3 mb-2">API Calls</h4>
              <div className="space-y-1">
                {Object.entries(metrics)
                  .filter(([key]) => key.startsWith('API_'))
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium">{key.replace('API_', '')}:</span>
                      <span className={value > 1000 ? 'text-red-600' : value > 500 ? 'text-yellow-600' : 'text-green-600'}>
                        {formatValue('', value)}
                      </span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}