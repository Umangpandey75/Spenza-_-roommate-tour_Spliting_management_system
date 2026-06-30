#!/usr/bin/env node

/**
 * Performance check script for Group Expense Splitter
 * Runs various performance tests and reports metrics
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Running Performance Checks...\n');

// 1. Bundle Size Analysis
console.log('📦 Checking bundle size...');
try {
  const buildOutput = execSync('npm run build', { encoding: 'utf8' });
  console.log('✅ Build completed successfully');
  
  // Extract bundle size information
  const sizeRegex = /(\d+(?:\.\d+)?)\s*(kB|MB)/g;
  const sizes = [...buildOutput.matchAll(sizeRegex)];
  
  if (sizes.length > 0) {
    console.log('📊 Bundle sizes:');
    sizes.forEach((match, index) => {
      console.log(`   - Chunk ${index + 1}: ${match[1]} ${match[2]}`);
    });
  }
} catch (error) {
  console.log('❌ Build failed:', error.message);
}

// 2. Test Performance
console.log('\n🧪 Running performance tests...');
try {
  const testOutput = execSync('npm run test:run -- --reporter=verbose', { encoding: 'utf8' });
  
  // Extract test timing information
  const timeRegex = /Duration\s+(\d+(?:\.\d+)?)s/;
  const match = testOutput.match(timeRegex);
  
  if (match) {
    const duration = parseFloat(match[1]);
    console.log(`✅ Tests completed in ${duration}s`);
    
    if (duration > 60) {
      console.log('⚠️  Tests are taking longer than expected (>60s)');
    } else {
      console.log('✅ Test performance is good');
    }
  }
} catch (error) {
  console.log('❌ Tests failed or had issues');
}

// 3. Code Quality Checks
console.log('\n🔍 Checking code quality...');
try {
  execSync('npm run lint', { encoding: 'utf8' });
  console.log('✅ Linting passed');
} catch (error) {
  console.log('⚠️  Linting issues found');
}

// 4. Dependency Analysis
console.log('\n📋 Analyzing dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const depCount = Object.keys(packageJson.dependencies || {}).length;
const devDepCount = Object.keys(packageJson.devDependencies || {}).length;

console.log(`📦 Production dependencies: ${depCount}`);
console.log(`🛠️  Development dependencies: ${devDepCount}`);

if (depCount > 20) {
  console.log('⚠️  High number of production dependencies. Consider optimization.');
} else {
  console.log('✅ Dependency count is reasonable');
}

// 5. File Size Analysis
console.log('\n📁 Analyzing source file sizes...');
const srcDir = path.join(__dirname, '../src');

function getDirectorySize(dir) {
  let totalSize = 0;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      totalSize += getDirectorySize(filePath);
    } else {
      totalSize += fs.statSync(filePath).size;
    }
  }
  
  return totalSize;
}

try {
  const srcSize = getDirectorySize(srcDir);
  const srcSizeKB = (srcSize / 1024).toFixed(2);
  console.log(`📊 Source code size: ${srcSizeKB} KB`);
  
  if (srcSize > 500 * 1024) { // 500KB
    console.log('⚠️  Source code is getting large. Consider code splitting.');
  } else {
    console.log('✅ Source code size is reasonable');
  }
} catch (error) {
  console.log('❌ Could not analyze source file sizes');
}

// 6. Performance Recommendations
console.log('\n💡 Performance Recommendations:');
console.log('   - Use React.memo for expensive components');
console.log('   - Implement virtual scrolling for large lists');
console.log('   - Use dynamic imports for code splitting');
console.log('   - Optimize images with next/image');
console.log('   - Consider service worker for caching');

console.log('\n✨ Performance check completed!');

// 7. Generate Performance Report
const report = {
  timestamp: new Date().toISOString(),
  bundleSize: 'Check build output above',
  dependencies: {
    production: depCount,
    development: devDepCount
  },
  sourceSize: `${(getDirectorySize(srcDir) / 1024).toFixed(2)} KB`,
  recommendations: [
    'Implement virtual scrolling',
    'Add service worker',
    'Optimize bundle splitting',
    'Monitor memory usage'
  ]
};

fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));
console.log('📄 Performance report saved to performance-report.json');