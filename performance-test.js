#!/usr/bin/env node

/**
 * Performance Testing Script for Mission Planning Application
 * Tests all major endpoints and measures response times
 */

const fs = require('fs');
const path = require('path');

class PerformanceTester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.frontendUrl = 'http://localhost:4321';
    this.results = [];
    this.startTime = Date.now();
  }

  async testApiEndpoint(endpoint, description, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const startTime = performance.now();
    
    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined
      });
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      const success = response.ok;
      
      this.results.push({
        endpoint,
        description,
        duration,
        success,
        status: response.status,
        size: response.headers.get('content-length') || 'unknown'
      });
      
      console.log(`✓ ${description}: ${duration}ms (${response.status})`);
      return { success, duration, response };
      
    } catch (error) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      this.results.push({
        endpoint,
        description,
        duration,
        success: false,
        error: error.message
      });
      
      console.log(`✗ ${description}: ${duration}ms (ERROR: ${error.message})`);
      return { success: false, duration, error };
    }
  }

  async testFrontendPage(path, description) {
    const url = `${this.frontendUrl}${path}`;
    const startTime = performance.now();
    
    try {
      const response = await fetch(url);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      const success = response.ok;
      
      this.results.push({
        endpoint: path,
        description: `Frontend: ${description}`,
        duration,
        success,
        status: response.status,
        type: 'frontend'
      });
      
      console.log(`✓ Frontend ${description}: ${duration}ms (${response.status})`);
      return { success, duration };
      
    } catch (error) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      console.log(`✗ Frontend ${description}: ${duration}ms (ERROR: ${error.message})`);
      return { success: false, duration, error };
    }
  }

  async runBasicApiTests() {
    console.log('\n🔧 Testing Basic API Endpoints...');
    
    await this.testApiEndpoint('/api/auth/setup-status', 'Setup Status Check');
    await this.testApiEndpoint('/api/satellites', 'Get All Satellites');
    await this.testApiEndpoint('/api/groundstations', 'Get Ground Stations');
    await this.testApiEndpoint('/api/targets', 'Get Targets');
    await this.testApiEndpoint('/api/satellites/positions/current', 'Current Satellite Positions');
    await this.testApiEndpoint('/api/timeline', 'Timeline Events');
  }

  async runFrontendTests() {
    console.log('\n🌐 Testing Frontend Pages...');
    
    await this.testFrontendPage('/', 'Main Page');
    await this.testFrontendPage('/satellites', 'Satellites Page');
    await this.testFrontendPage('/timeline', 'Timeline Page');
    await this.testFrontendPage('/groundstations', 'Ground Stations Page');
    await this.testFrontendPage('/targets', 'Targets Page');
  }

  async runLoadTests() {
    console.log('\n⚡ Running Load Tests...');
    
    // Test concurrent requests
    const concurrentTests = [
      this.testApiEndpoint('/api/satellites', 'Concurrent Satellites 1'),
      this.testApiEndpoint('/api/satellites', 'Concurrent Satellites 2'),
      this.testApiEndpoint('/api/satellites', 'Concurrent Satellites 3'),
      this.testApiEndpoint('/api/satellites/positions/current', 'Concurrent Positions 1'),
      this.testApiEndpoint('/api/satellites/positions/current', 'Concurrent Positions 2')
    ];
    
    await Promise.all(concurrentTests);
  }

  async runHeavyEndpointTests() {
    console.log('\n🏋️ Testing Heavy Endpoints...');
    
    // Test the most demanding endpoints
    await this.testApiEndpoint('/api/satellites/positions/current', 'Satellite Positions (Heavy)');
    await this.testApiEndpoint('/api/timeline', 'Timeline Data (Heavy)');
    
    // Test database-heavy operations
    await this.testApiEndpoint('/api/satellites', 'Database Query (All Satellites)');
    await this.testApiEndpoint('/api/groundstations', 'Database Query (All Ground Stations)');
  }

  generateReport() {
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;
    
    const apiTests = this.results.filter(r => r.type !== 'frontend');
    const frontendTests = this.results.filter(r => r.type === 'frontend');
    
    const avgApiTime = apiTests.length > 0 ? 
      Math.round(apiTests.reduce((sum, r) => sum + r.duration, 0) / apiTests.length) : 0;
    
    const avgFrontendTime = frontendTests.length > 0 ? 
      Math.round(frontendTests.reduce((sum, r) => sum + r.duration, 0) / frontendTests.length) : 0;
    
    const slowestTests = this.results
      .filter(r => r.success)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
    
    const report = {
      summary: {
        totalTests,
        successfulTests,
        failedTests,
        successRate: Math.round((successfulTests / totalTests) * 100),
        avgApiTime,
        avgFrontendTime,
        testDuration: Math.round((Date.now() - this.startTime) / 1000)
      },
      slowestEndpoints: slowestTests,
      allResults: this.results,
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    const slowEndpoints = this.results.filter(r => r.success && r.duration > 500); // Lowered threshold after optimizations
    const verySlowEndpoints = this.results.filter(r => r.success && r.duration > 1000); // Lowered threshold
    
    if (verySlowEndpoints.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'Very slow endpoints detected',
        details: verySlowEndpoints.map(e => `${e.description}: ${e.duration}ms`),
        suggestions: [
          'Add database connection pooling',
          'Implement Redis caching for frequently accessed data',
          'Optimize database queries with proper indexing',
          'Consider API response compression'
        ]
      });
    }
    
    if (slowEndpoints.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        issue: 'Slow endpoints detected',
        details: slowEndpoints.map(e => `${e.description}: ${e.duration}ms`),
        suggestions: [
          'Implement request batching',
          'Add response caching headers',
          'Optimize payload sizes',
          'Consider lazy loading for non-critical data'
        ]
      });
    }
    
    const failedTests = this.results.filter(r => !r.success);
    if (failedTests.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'Failed endpoints detected',
        details: failedTests.map(e => `${e.description}: ${e.error || 'Unknown error'}`),
        suggestions: [
          'Check service availability',
          'Verify authentication requirements',
          'Review error handling and logging'
        ]
      });
    }
    
    return recommendations;
  }

  async run() {
    console.log('🚀 Starting Performance Tests...');
    console.log(`Testing API: ${this.baseUrl}`);
    console.log(`Testing Frontend: ${this.frontendUrl}`);
    console.log('=' .repeat(50));
    
    await this.runBasicApiTests();
    await this.runFrontendTests();
    await this.runHeavyEndpointTests();
    await this.runLoadTests();
    
    console.log('\n📊 Generating Report...');
    const report = this.generateReport();
    
    // Save detailed report
    const reportPath = path.join(__dirname, 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Print summary
    console.log('\n' + '=' .repeat(50));
    console.log('📈 PERFORMANCE TEST RESULTS');
    console.log('=' .repeat(50));
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Success Rate: ${report.summary.successRate}%`);
    console.log(`Average API Response: ${report.summary.avgApiTime}ms`);
    console.log(`Average Frontend Load: ${report.summary.avgFrontendTime}ms`);
    console.log(`Test Duration: ${report.summary.testDuration}s`);
    
    console.log('\n🐌 Slowest Endpoints:');
    report.slowestEndpoints.forEach((test, i) => {
      console.log(`${i + 1}. ${test.description}: ${test.duration}ms`);
    });
    
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach((rec, i) => {
      console.log(`\n${i + 1}. [${rec.priority}] ${rec.issue}`);
      rec.suggestions.forEach(suggestion => {
        console.log(`   • ${suggestion}`);
      });
    });
    
    console.log(`\n📋 Detailed report saved to: ${reportPath}`);
    
    return report;
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.run().catch(console.error);
}

module.exports = PerformanceTester;