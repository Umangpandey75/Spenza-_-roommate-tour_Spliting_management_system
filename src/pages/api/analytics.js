/**
 * Analytics endpoint for Web Vitals and custom metrics
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const metric = req.body;
    
    // Validate metric data
    if (!metric.name || typeof metric.value !== 'number') {
      return res.status(400).json({ error: 'Invalid metric data' });
    }

    // Log metric (in production, send to your analytics service)
    console.log('Web Vital:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      timestamp: new Date().toISOString(),
      url: metric.url,
    });

    // Send to analytics service (Google Analytics, Mixpanel, etc.)
    // Example for Google Analytics 4:
    // if (process.env.GA_MEASUREMENT_ID) {
    //   await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`, {
    //     method: 'POST',
    //     body: JSON.stringify({
    //       client_id: metric.id,
    //       events: [{
    //         name: 'web_vital',
    //         params: {
    //           metric_name: metric.name,
    //           metric_value: metric.value,
    //           metric_rating: metric.rating,
    //         }
    //       }]
    //     })
    //   });
    // }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}