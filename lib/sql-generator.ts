
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI((import.meta.env.VITE_GEMINI_API_KEY || '').trim());
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

const SCHEMA_CONTEXT = `
  Tables and Columns:
  1. employees (id, first_name, last_name, email, job_title, department, joining_date, status)
  2. attendance (id, employee_id, date, clock_in, clock_out, status, total_hours)
  3. tasks (id, title, description, assigned_to, assigned_by, status, priority, due_date)
  4. leave_requests (id, employee_id, leave_type, start_date, end_date, reason, status, approved_by)

  Rules for SQL Generation:
  - Respond ONLY with the SQL query. No explanation.
  - Use READ-ONLY SELECT queries.
  - For PERSONAL DATA queries (User Role: EMPLOYEE), ALWAYS filter by employee_id = 'USER_ID_PLACEHOLDER'.
  - For ANALYTICS queries (User Role: HR/ADMIN), use aggregations like COUNT, AVG, SUM.
  - Join tables when necessary (e.g. employee name for a task).
  - Use standard PostgreSQL syntax.
`;

const sqlCache = new Map<string, string>();

/**
 * Generate a safe SQL query based on natural language and user role
 */
export async function generateSecureSQL(question: string, userRole: string, userId: string): Promise<string> {
  const cacheKey = `${userRole}:${question.trim().toLowerCase()}`;
  if (sqlCache.has(cacheKey)) {
    let cachedSql = sqlCache.get(cacheKey)!;
    return cachedSql.replace('USER_ID_PLACEHOLDER', userId);
  }

  const prompt = `
    ${SCHEMA_CONTEXT}
    
    User Role: ${userRole.toUpperCase()}
    User ID: ${userId}
    Question: "${question}"
    
    Category: ${userRole === 'employee' ? 'Personal Data' : 'Team Analytics'}
    
    Generate the SQL query. ${userRole === 'employee' ? "Ensure you filter by employee_id or id to match the User ID." : ""}
  `;

  const result = await model.generateContent(prompt);
  let sql = result.response.text().replace(/```sql|```/g, '').trim();

  // Basic security sanitization
  if (sql.toLowerCase().includes('drop') || sql.toLowerCase().includes('delete') || sql.toLowerCase().includes('update') || sql.toLowerCase().includes('insert')) {
    throw new Error('Unauthorized SQL operation detected.');
  }

  // Cache the generated SQL (with placeholder still intact if applicable)
  sqlCache.set(cacheKey, sql);
  
  // Keep cache size manageable
  if (sqlCache.size > 100) {
    const firstKey = sqlCache.keys().next().value;
    if (firstKey) sqlCache.delete(firstKey);
  }

  // Replace placeholder with actual ID if the model used it
  sql = sql.replace('USER_ID_PLACEHOLDER', userId);

  return sql;
}
