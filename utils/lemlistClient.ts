import { Lead } from '../types';

// Use environment variables for Lemlist configuration
const LEMLIST_CAMPAIGN_ID = process.env.REACT_APP_LEMLIST_CAMPAIGN_ID || 'cam_tkiZsKa4PLBYAC3ud';
// This is only used as fallback for dev, actual API key is handled server-side
const LEMLIST_API_KEY = process.env.REACT_APP_LEMLIST_API_KEY || 'Basic OmIxNGUzOTFkY2ZjZjIxY2U2YmM5OTVhYTk1NzBkNTAw'; // Fallback for dev

export interface LemlistSyncResult {
  success: boolean;
  lemlistId?: string;
  lemlistContactId?: string;
}

// Constant send user ID as provided in the requirements
const SEND_USER_ID = 'usr_sov9PYN294xFaTM3o';

export const syncLeadToLemlist = async (lead: Lead): Promise<LemlistSyncResult> => {
  // Construct payload to match the curl request requirements exactly
  const payload: any = {
    email: lead.email || `missing_${lead.id}@nexus-sep.com`, // Ensure valid email field
    firstName: lead.firstName,
    lastName: lead.lastName || '', // Ensure string, even if empty
    companyName: lead.company,
    jobTitle: lead.title,
    linkedinUrl: lead.linkedinUrl,
    phone: "+33 123456789", // Use format from curl example
    timezone: "Europe/Paris",
    contactOwner: "24pai008@sxca.edu.in" // Hardcoded owner as requested
  };

  console.log(`[Lemlist] Syncing lead ${lead.id} to campaign ${LEMLIST_CAMPAIGN_ID}...`);
  console.log(`[Lemlist] Payload:`, payload);

  // Use the local proxy endpoint configured in vite.config.ts
  const targetUrl = `/api/lemlist/api/campaigns/${LEMLIST_CAMPAIGN_ID}/leads/`;

  try {
    const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    
    console.log(`[Lemlist] Proxy fetch response: ${response.status}`);
    if (response.ok) {
        console.log(`[Lemlist] Successfully synced via Local Proxy`);
        // Try to parse the response to extract lead IDs if available
        try {
            const responseData = await response.json();
            console.log(`[Lemlist] API response:`, responseData);
            
            // Extract lemlistId and contactId from response if available
            let lemlistId: string | undefined;
            let lemlistContactId: string | undefined;
            
            if (responseData && typeof responseData === 'object') {
                // Based on the example response provided, the fields are:
                lemlistId = responseData._id; // Lead ID from the response
                lemlistContactId = responseData.contactId; // Contact ID from the response
            }
            
            return {
                success: true,
                lemlistId,
                lemlistContactId
            };
        } catch (parseErr) {
            console.log('[Lemlist] Could not parse API response, but request was successful');
            return {
                success: true
            };
        }
    } else {
        const errorText = await response.text();
        console.error(`[Lemlist] Local proxy fetch failed with status ${response.status}:`, errorText);
        return {
            success: false
        };
    }
  } catch (err) {
    console.error('[Lemlist] Local proxy fetch failed...', err);
    return {
        success: false
    };
  }
};

// Function to send LinkedIn message via Lemlist API
export const sendLinkedInMessage = async (leadId: string | undefined, contactId: string | undefined, message: string): Promise<boolean> => {
  // Check if we have the required IDs
  if (!leadId || !contactId) {
    console.error('[Lemlist] Missing leadId or contactId to send LinkedIn message');
    return false;
  }
  
  // Construct payload for sending LinkedIn message
  const payload = {
    sendUserId: SEND_USER_ID,
    leadId,
    contactId,
    message
  };
  
  console.log(`[Lemlist] Sending LinkedIn message to lead ${leadId} with contact ${contactId}`);
  
  const targetUrl = `/api/lemlist/api/inbox/linkedin`;
  
  try {
    const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    
    console.log(`[Lemlist] Send message response: ${response.status}`);
    if (response.ok) {
        console.log(`[Lemlist] Successfully sent LinkedIn message via Local Proxy`);
        return true;
    } else {
        const errorText = await response.text();
        console.error(`[Lemlist] Send message failed with status ${response.status}:`, errorText);
        return false;
    }
  } catch (err) {
    console.error('[Lemlist] Send message request failed...', err);
    return false;
  }
};