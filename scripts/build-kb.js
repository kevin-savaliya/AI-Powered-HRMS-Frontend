import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildKnowledgeBase() {
    const dir = path.join(__dirname, '../Policy_Documents');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.docx'));
    
    let fullText = '';
    
    for (const file of files) {
        console.log('Parsing ' + file + '...');
        const filePath = path.join(dir, file);
        const result = await mammoth.extractRawText({ path: filePath });
        
        const text = result.value.trim().replace(/\r\n/g, '\n');
        
        fullText += '--- DOCUMENT START: ' + file + ' ---\n';
        fullText += text + '\n';
        fullText += '--- DOCUMENT END: ' + file + ' ---\n\n';
    }
    
    const escapedText = fullText.replace(/\`/g, '\\\\`').replace(/\\$/g, '\\\\$');
    const header = '// AUTO-GENERATED KNOWLEDGE BASE\n// Do not edit manually. Run node scripts/build-kb.js to update.\n\nexport const HR_KNOWLEDGE_BASE = `\n';
    const footer = '\n`;\n';
    
    const tsCode = header + escapedText + footer;
    
    const outPath = path.join(__dirname, '../lib/knowledge_base.ts');
    fs.writeFileSync(outPath, tsCode);
    console.log('✅ Knowledge base generated successfully at ' + outPath + ' (Length: ' + fullText.length + ' chars)');
}

buildKnowledgeBase().catch(console.error);
