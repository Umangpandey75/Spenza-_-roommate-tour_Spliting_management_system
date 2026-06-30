/**
 * Error logging API endpoint
 */
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const errorData = req.body;
    
    // Validate error data
    if (!errorData.message || !errorData.timestamp) {
      return res.status(400).json({ error: 'Invalid error data' });
    }

    // Rate limiting check (implement proper rate limiting in production)
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Log to Supabase (optional - create an errors table)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // In production, you might want to store errors in a separate logging service
    // like LogRocket, DataDog, or a dedicated error tracking table
    
    console.error('Client Error:', {
      ...errorData,
      clientIp,
      headers: req.headers,
    });

    // Optionally store in database
    // await supabase.from('error_logs').insert({
    //   message: errorData.message,
    //   stack: errorData.stack,
    //   user_agent: errorData.userAgent,
    //   url: errorData.url,
    //   user_id: errorData.userId,
    //   client_ip: clientIp,
    //   created_at: new Date().toISOString(),
    // });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error logging failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}