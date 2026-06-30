#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import { URL } from 'url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load .env file for local testing
const envPath = path.join(path.dirname(__dirname), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  // Set environment variables if not already set
  Object.keys(envVars).forEach(key => {
    if (!process.env[key]) {
      process.env[key] = envVars[key];
    }
  });
}

console.log('🔍 Checking production environment variables...');

// Check if env vars are properly set in production
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment Variables Check:');
console.log('==========================');
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);

if (supabaseUrl) {
  console.log(`URL Value: ${supabaseUrl}`);
  
  // Validate URL format
  try {
    const url = new URL(supabaseUrl);
    console.log(`URL Protocol: ${url.protocol}`);
    console.log(`URL Host: ${url.hostname}`);
    
    if (url.hostname.includes('supabase.co')) {
      console.log('✅ Valid Supabase URL format');
    } else {
      console.log('⚠️ URL does not appear to be a Supabase URL');
    }
  } catch (error) {
    console.log('❌ Invalid URL format:', error.message);
  }
}

if (supabaseKey) {
  console.log(`Key Length: ${supabaseKey.length} characters`);
  console.log(`Key Prefix: ${supabaseKey.substring(0, 20)}...`);
  
  // Basic JWT validation
  if (supabaseKey.startsWith('eyJ')) {
    console.log('✅ Key appears to be a valid JWT format');
  } else {
    console.log('⚠️ Key does not appear to be in JWT format');
  }
}

console.log('\n🌐 Network Connectivity Test:');
console.log('============================');

if (supabaseUrl) {
  // Test basic connectivity (Node.js environment)
  const parsedUrl = new URL(supabaseUrl);
  
  const options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: '/rest/v1/',
    method: 'GET',
    timeout: 5000,
    headers: {
      'apikey': supabaseKey || '',
      'Authorization': `Bearer ${supabaseKey || ''}`,
      'User-Agent': 'spenza-production-check'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`✅ HTTP Status: ${res.statusCode}`);
    console.log(`✅ Response Headers: ${JSON.stringify(res.headers, null, 2)}`);
    
    if (res.statusCode === 200 || res.statusCode === 401) {
      console.log('✅ Supabase endpoint is reachable');
    } else {
      console.log(`⚠️ Unexpected status code: ${res.statusCode}`);
    }
  });

  req.on('error', (error) => {
    console.log('❌ Network error:', error.message);
  });

  req.on('timeout', () => {
    console.log('❌ Request timeout - network connectivity issues');
    req.destroy();
  });

  req.end();
} else {
  console.log('❌ Cannot test connectivity - SUPABASE_URL not set');
}

console.log('\n🔧 Recommendations:');
console.log('==================');

if (!supabaseUrl || !supabaseKey) {
  console.log('1. Ensure environment variables are set in your production environment');
  console.log('2. Check your deployment platform\'s environment variable configuration');
  console.log('3. Verify the variables are available at build time (NEXT_PUBLIC_ prefix)');
}

console.log('4. Test WebSocket connectivity: wss://*.supabase.co');
console.log('5. Ensure your production server allows outbound HTTPS and WSS connections');
console.log('6. Check Content Security Policy allows connections to *.supabase.co');