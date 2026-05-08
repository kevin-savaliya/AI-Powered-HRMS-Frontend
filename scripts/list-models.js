
import dotenv from 'dotenv';

dotenv.config();

async function listModels() {
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log('🔍 Listing available Gemini models...');
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error('❌ API Error:', data.error.message);
            return;
        }

        console.log('✅ Available Models:');
        data.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
    } catch (error) {
        console.error('❌ Fetch Error:', error.message);
    }
}

listModels();
