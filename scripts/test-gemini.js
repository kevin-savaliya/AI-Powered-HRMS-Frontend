
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function testGemini() {
    const apiKey = process.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
        console.error('❌ Error: VITE_GEMINI_API_KEY is missing or not set in .env');
        return;
    }

    console.log('🔍 Testing Gemini 2.0 Flash Connectivity...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    try {
        const result = await model.generateContent("Say 'Gemini 2.0 is connected'");
        console.log('✅ Success! Response:', result.response.text());
        console.log('\nYour API key now works with the updated model (gemini-2.0-flash).');
    } catch (error) {
        console.error('\n❌ Connection Failed!');
        console.error('Error Details:', error.message);
    }
}

testGemini();
