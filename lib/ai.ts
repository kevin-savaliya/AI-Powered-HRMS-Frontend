
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI((import.meta.env.VITE_GEMINI_API_KEY || '').trim());

// Model names (Using gemini-2.5-flash as it is the only supported model for this AI Studio key)
const CHAT_MODEL = 'gemini-2.5-flash';
const EMBED_MODEL = 'gemini-embedding-001';

/**
 * Helper for exponential backoff retries and Rate Limit backoffs
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2, delay = 4000): Promise<T> {
    let lastError: any;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            const errorMsg = error?.message || '';

            // Check if it's a Rate Limit error
            if (errorMsg.includes('429') || errorMsg.includes('Too Many Requests') || errorMsg.includes('quota')) {
                if (i === maxRetries) break; // Don't sleep if this was the last attempt
                
                // Try to parse Google's exact requested delay, otherwise use exponential default
                let waitTime = delay * (i + 1);
                const delayMatch = errorMsg.match(/retryDelay(?:["':\s]*)([\d.]+)s/);
                if (delayMatch && delayMatch[1]) {
                    // Google says exactly how many seconds to wait (+1 to be safe)
                    waitTime = (parseFloat(delayMatch[1]) + 1) * 1000;
                } else {
                    // Cap default delay to safe max
                    waitTime = Math.min(waitTime, 15000); 
                }

                console.warn(`[AI System] Rate limit hit. Retrying in ${Math.round(waitTime/1000)}s...`);
                await new Promise(res => setTimeout(res, waitTime));
                continue;
            }
            throw error; // If not a rate limit error, throw immediately
        }
    }
    throw lastError;
}

/**
 * Get embedding for a text string using Gemini
 */
export async function getEmbedding(text: string): Promise<number[]> {
    return withRetry(async () => {
        const model = genAI.getGenerativeModel({ model: EMBED_MODEL });
        const result = await model.embedContent(text);
        return result.embedding.values;
    });
}

/**
 * Chat with Gemini using context from RAG or SQL
 */
export async function generateAIResponse(
    question: string,
    context: string,
    userRole: string,
    history: { role: 'user' | 'model'; parts: { text: string }[] }[] = []
) {
    return withRetry(async () => {
        const model = genAI.getGenerativeModel({
            model: CHAT_MODEL,
            systemInstruction: `
      You are an Intelligent HR Assistant for a company. 
      You help employees, HR, and admins with their queries using the provided context.
      
      RULES:
      1. Use ONLY the provided context (Policy or DB Data) to answer.
      2. If the answer is not in the context, say: "I do not have information about this in company records."
      3. Your role: Assistant. User role: ${userRole.toUpperCase()}.
      4. Respect Role-Based Access:
         - EMPLOYEES: Only see their own data (leaves, attendance). Access core policies.
         - HR: See team stats, leave summaries. Cannot change system config.
         - ADMIN: Full access to all analytics and documents.
      5. FORMATTING: Use Markdown for clean responses. Use tables or lists when appropriate.
      6. Be professional, concise, and helpful.
      7. No hallucinations. If context says "Value: 0", report 0.
      
      CONTEXT:
      ${context}
    `
        });

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(question);
        return result.response.text();
    });
}

/**
 * Chat with Gemini using context from RAG or SQL (Streaming version)
 */
export async function* generateAIResponseStream(
    question: string,
    context: string,
    userRole: string,
    history: { role: 'user' | 'model'; parts: { text: string }[] }[] = []
) {
    const model = genAI.getGenerativeModel({
        model: CHAT_MODEL,
        systemInstruction: `
      You are an Intelligent HR Assistant for a company. 
      You help employees, HR, and admins with their queries using the provided context.
      
      RULES:
      1. Use ONLY the provided context (Policy or DB Data) to answer.
      2. If the answer is not in the context, say: "I do not have information about this in company records."
      3. Your role: Assistant. User role: ${userRole.toUpperCase()}.
      4. Respect Role-Based Access:
         - EMPLOYEES: Only see their own data (leaves, attendance). Access core policies.
         - HR: See team stats, leave summaries. Cannot change system config (Settings).
         - ADMIN: Full access to all analytics and documents.
      5. FORMATTING: Use Markdown for clean responses. Use tables or lists when appropriate.
      6. Be professional, concise, and helpful.
      7. No hallucinations. If context says "Value: 0", report 0.
      
      CONTEXT:
      ${context}
    `
    });

    const chat = model.startChat({ history });

    // We retry the initial connection which is the likely point of 429
    const result = await withRetry(() => chat.sendMessageStream(question));

    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        yield chunkText;
    }
}

export async function detectIntent(question: string): Promise<'policy' | 'data' | 'analytics' | 'general'> {
    const text = question.toLowerCase();

    // 1. Policy Intent (HR policies, rules, company documents, leave policies, etc.)
    if (
        text.includes('policy') || text.includes('rules') || text.includes('handbook') || 
        text.includes('holiday') || text.includes('guidelines') || text.includes('working hours') ||
        text.includes('office') || text.includes('notice period') || text.includes('code of conduct') ||
        text.includes('salary') || text.includes('recruitment') || text.includes('hiring') ||
        text.includes('process') || text.includes('compensation') || text.includes('benefits') ||
        text.includes('offer letter') || text.includes('documents') || text.includes('procedure')
    ) {
        return 'policy';
    }

    // 2. Analytics Intent (Managerial, totals, counts, averages across the company)
    if (
        text.includes('total') || text.includes('average') || text.includes('how many employees') || 
        text.includes('count') || text.includes('department stats') || text.includes('company performance') ||
        text.includes('leave utilization') || text.includes('hired') || text.includes('retention')
    ) {
        return 'analytics';
    }

    // 3. Data Intent (Personal actions: my attendance, my tasks, my leaves)
    if (
        text.includes('my') || text.includes('i ') || text.includes('me ') || 
        text.includes('attendance') || text.includes('clock') || text.includes('task') || 
        text.includes('leave balance') || text.includes('pending') || text.includes('salary') ||
        text.includes('who am i') || text.includes('profile')
    ) {
        return 'data';
    }

    // Fallback to General
    return 'general';
}
