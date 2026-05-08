
-- HRMS Extended Schema

-- 1. Employees Table (Extends Leads or direct entry)
create table if not exists public.employees (
    id uuid primary key default auth.uid(),
    first_name text not null,
    last_name text not null,
    email text unique not null,
    job_title text,
    department text,
    manager_id uuid references public.employees(id),
    joining_date date default current_date,
    status text default 'active', -- active, on_leave, terminated
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Attendance Table
create table if not exists public.attendance (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid references public.employees(id) not null,
    date date default current_date not null,
    clock_in timestamp with time zone,
    clock_out timestamp with time zone,
    status text default 'present', -- present, late, absent
    total_hours numeric(4,2),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(employee_id, date)
);

-- 3. Tasks Table
create table if not exists public.tasks (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    assigned_to uuid references public.employees(id),
    assigned_by uuid references public.employees(id),
    status text default 'todo', -- todo, in_progress, done
    priority text default 'medium', -- low, medium, high, urgent
    due_date timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Leave Requests Table
create table if not exists public.leave_requests (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid references public.employees(id) not null,
    leave_type text not null, -- sick, casual, vacation, unpaid
    start_date date not null,
    end_date date not null,
    reason text,
    status text default 'pending', -- pending, approved, rejected
    approved_by uuid references public.employees(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Documents Table
create table if not exists public.documents (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid references public.employees(id),
    title text not null,
    file_path text not null, -- path in supabase storage
    document_type text, -- offer_letter, identity, payslip, contract
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Allow all for demo, but structure is there)
alter table public.employees enable row level security;
alter table public.attendance enable row level security;
alter table public.tasks enable row level security;
alter table public.leave_requests enable row level security;
alter table public.documents enable row level security;

create policy "Allow all on employees" on public.employees for all using (true);
create policy "Allow all on attendance" on public.attendance for all using (true);
create policy "Allow all on tasks" on public.tasks for all using (true);
create policy "Allow all on leaves" on public.leave_requests for all using (true);
create policy "Allow all on documents" on public.documents for all using (true);
