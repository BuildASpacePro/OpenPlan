// Bundle analysis configuration for Astro
export default {
  // Output detailed bundle analysis
  bundleAnalyzer: {
    // Generate HTML report
    analyzerMode: 'static',
    // Open browser automatically  
    openAnalyzer: false,
    // Output file location
    reportFilename: 'bundle-analysis.html',
    // Log level
    logLevel: 'info'
  },
  
  // Performance budgets
  budgets: [
    {
      type: 'initial',
      maximumWarning: '500kb',
      maximumError: '1mb'
    },
    {
      type: 'anyComponentStyle', 
      maximumWarning: '5kb',
      maximumError: '10kb'
    }
  ]
};