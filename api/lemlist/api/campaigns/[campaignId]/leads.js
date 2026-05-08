export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse the request body if it exists
  let body;
  if (req.body) {
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body;
    }
  } else {
    body = {};
  }

  try {
    // Get the campaign ID from the query parameters
    const { campaignId } = req.query;
    
    // Log incoming request for debugging
    console.log('Lemlist API Proxy - Incoming request:', {
      method: req.method,
      campaignId,
      headers: req.headers,
      body: body
    });

    // Construct the target URL for the Lemlist API
    const targetUrl = `https://api.lemlist.com/api/campaigns/${campaignId}/leads/`;

    // Prepare headers
    // Use the environment variable for Lemlist API key instead of the client-provided one
    const apiKey = process.env.LEMLIST_API_KEY || req.headers.authorization;
    
    if (!apiKey) {
      console.error('Lemlist API key is missing!');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Lemlist API key is not configured'
      });
    }
    
    // Ensure the Authorization header has the correct format
    // Check if the API key is already properly formatted as Basic auth
    let authHeader;
    if (apiKey.startsWith('Basic ')) {
      authHeader = apiKey; // Already formatted correctly
    } else {
      // The API key might be the raw token, so we need to format it
      // For Lemlist, this should be properly base64 encoded
      authHeader = `Basic ${apiKey}`;
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    };

    // Make the request to the Lemlist API
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    // Log the response for debugging
    console.log('Lemlist API Proxy - Response status:', response.status);
    
    // Get the response from the Lemlist API
    let data;
    try {
      // Clone the response to allow multiple reads
      const responseClone = response.clone();
      data = await responseClone.json();
      // Return the response from Lemlist API to the client
      res.status(response.status).json(data);
    } catch (parseError) {
      // If response is not JSON, return as text from the original response
      const text = await response.text();
      console.log('Lemlist API Proxy - Response text:', text);
      res.status(response.status).send(text);
    }
  } catch (error) {
    console.error('Error proxying to Lemlist API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}