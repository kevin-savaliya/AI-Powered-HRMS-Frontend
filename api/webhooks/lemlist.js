export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // For now, just return a success response for any webhook request
  // In a real implementation, you would process the webhook payload
  if (req.method === 'POST') {
    console.log('Received Lemlist webhook:', req.body);
    return res.status(200).json({ received: true });
  }

  // For other methods, return method not allowed
  res.status(405).json({ error: 'Method not allowed' });
}