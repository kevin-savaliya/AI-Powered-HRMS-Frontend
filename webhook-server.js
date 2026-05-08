const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for potential large payloads

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Webhook endpoint for Lemlist
app.post('/api/webhooks/lemlist', async (req, res) => {
  try {
    console.log('Received Lemlist webhook:', req.body);
    
    // Check if this is a LinkedIn reply event
    if (req.body.type === 'linkedinReplied' || req.body.event === 'linkedinReplied') {
      const { leadId, contactId, message, sender, timestamp, subject } = req.body;
      
      // Validate required fields
      if (!leadId || !message) {
        console.error('Missing required fields in webhook payload:', req.body);
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Store the message in your database
      const { error } = await supabase
        .from('messages')
        .insert([{
          lead_id: leadId,
          sender: 'lead', // Lead sent this message
          content: message,
          channel: 'LINKEDIN',
          timestamp: timestamp || new Date().toISOString()
        }]);
      
      if (error) {
        console.error('Error storing message:', error);
        return res.status(500).json({ error: 'Failed to store message' });
      }
      
      // Update the lead's last message and stage if needed
      await supabase
        .from('leads')
        .update({ 
          last_message: message,
          stage: 'replied', // Update stage to replied
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);
      
      console.log(`Stored LinkedIn reply from lead ${leadId}`);
    }
    
    // Respond to Lemlist that the webhook was received successfully
    res.status(200).json({ message: 'Webhook received and processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Lemlist Webhook Server is running' });
});

app.listen(port, () => {
  console.log(`Lemlist webhook server running at http://localhost:${port}`);
  console.log(`Use this URL for your webhook: http://localhost:${port}/api/webhooks/lemlist`);
  console.log(`If using ngrok, replace localhost with your ngrok URL`);
});

module.exports = app;