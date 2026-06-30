/**
 * Health check endpoint for monitoring and load balancers
 */
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {}
  };

  try {
    // Database connectivity check
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const { data, error } = await supabase.from('groups').select('count').limit(1);
      
      if (error) throw error;
      
      checks.checks.database = {
        status: 'healthy',
        responseTime: Date.now() - startTime
      };
    } catch (dbError) {
      checks.checks.database = {
        status: 'unhealthy',
        error: dbError.message,
        responseTime: Date.now() - startTime
      };
      checks.status = 'degraded';
    }

    // Memory check
    const memoryUsage = process.memoryUsage();
    const memoryThreshold = 500 * 1024 * 1024; // 500MB threshold
    
    checks.checks.memory = {
      status: memoryUsage.heapUsed < memoryThreshold ? 'healthy' : 'warning',
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      threshold: memoryThreshold
    };

    // Overall health determination
    const unhealthyChecks = Object.values(checks.checks).filter(check => check.status === 'unhealthy');
    if (unhealthyChecks.length > 0) {
      checks.status = 'unhealthy';
      return res.status(503).json(checks);
    }

    const warningChecks = Object.values(checks.checks).filter(check => check.status === 'warning');
    if (warningChecks.length > 0) {
      checks.status = 'degraded';
    }

    res.status(200).json(checks);
  } catch (error) {
    checks.status = 'unhealthy';
    checks.error = error.message;
    res.status(503).json(checks);
  }
}