
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const GEMINI_KEY = process.env.VITE_GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_KEY) {
    console.error('Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const embedModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

const DOCUMENTS_DIR = './Policy_Documents';
const sleep = ms => new Promise(res => setTimeout(res, ms));

async function processFile(filePath) {
    const fileName = path.basename(filePath);
    console.log(`\n📄 Processing: ${fileName}...`);

    try {
        const buffer = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value;

        // Chunking by double newline or significant length
        const chunks = text.split('\n\n').map(c => c.trim()).filter(c => c.length > 50);
        console.log(`Found ${chunks.length} significant chunks.`);

        const BATCH_SIZE = 5;
        let batch = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];

            try {
                process.stdout.write(`- Embedding chunk ${i + 1}/${chunks.length}... `);
                const embedResult = await embedModel.embedContent(chunk);
                const embedding = embedResult.embedding.values;
                console.log('✅');

                batch.push({
                    content: chunk,
                    embedding: embedding,
                    document_type: 'policy',
                    allowed_roles: ['admin', 'hr', 'employee'],
                    metadata: { source: fileName }
                });

                if (batch.length >= BATCH_SIZE || i === chunks.length - 1) {
                    console.log(`🚀 Uploading batch of ${batch.length}...`);
                    const { error } = await supabase.from('knowledge_base').insert(batch);
                    if (error) throw error;
                    batch = [];
                    await sleep(500); // Cooldown for Supabase
                }

                await sleep(300); // Cooldown for Gemini
            } catch (err) {
                console.error(`\n❌ Error at chunk ${i + 1}: ${err.message}`);
                // Wait longer on error then continue
                await sleep(2000);
            }
        }

        console.log(`✅ Successfully ingested ${fileName}`);
    } catch (err) {
        console.error(`❌ Error processing ${fileName}:`, err.message);
    }
}

async function main() {
    const files = fs.readdirSync(DOCUMENTS_DIR).filter(f => f.endsWith('.docx'));
    for (const file of files) {
        await processFile(path.join(DOCUMENTS_DIR, file));
    }
    console.log('\n🌟 Ingestion complete!');
}

main();
