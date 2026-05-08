
-- AI Chatbot RAG Schema

-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. Knowledge Base Table
create table if not exists public.knowledge_base (
    id uuid primary key default gen_random_uuid(),
    content text not null,
    embedding vector(768), -- Gemini embedding-004 uses 768 dimensions
    document_type text, 
    allowed_roles text[], -- e.g. ['admin', 'hr', 'employee']
    metadata jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Chat Logs Table
create table if not exists public.chat_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.employees(id),
    role text not null,
    question text not null,
    answer text not null,
    timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. RAG Search Function
create or replace function match_knowledge_base (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_allowed_roles text[]
)
returns table (
  id uuid,
  content text,
  document_type text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    kb.id,
    kb.content,
    kb.document_type,
    1 - (kb.embedding <=> query_embedding) as similarity
  from knowledge_base kb
  where 1 - (kb.embedding <=> query_embedding) > match_threshold
    and kb.allowed_roles && p_allowed_roles
  order by kb.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 5. Enable RLS
alter table public.knowledge_base enable row level security;
alter table public.chat_logs enable row level security;

-- 6. Basic Policies (Allow all for internal system, or refine as needed)
create policy "Allow read on knowledge_base" on public.knowledge_base for select using (true);
create policy "Allow insert on chat_logs" on public.chat_logs for insert with check (true);
create policy "Allow read on own chat_logs" on public.chat_logs for select using (auth.uid() = user_id);

-- 7. Secure SQL Runner for AI (SELECT ONLY)
create or replace function run_sql_query(sql_query text)
returns jsonb
language plpgsql
security definer -- Runs with elevated permissions to access all tables needed
as $$
declare
    result jsonb;
begin
    -- STRICT SECURITY: Only allow SELECT queries
    if lower(sql_query) !~ '^select\s+' then
        raise exception 'Only SELECT queries are allowed.';
    end if;
    
    -- Further sanitization to prevent multi-statement or destructive keywords
    if lower(sql_query) ~ '(delete|update|insert|drop|truncate|alter|grant|revoke)' then
        raise exception 'Unauthorized keyword detected in SQL query.';
    end if;

    execute 'select jsonb_agg(t) from (' || sql_query || ') t' into result;
    return result;
end;
$$;
