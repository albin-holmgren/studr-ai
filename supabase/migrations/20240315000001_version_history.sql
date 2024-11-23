-- Create document versions table
create table public.document_versions (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  document_id uuid references public.documents on delete cascade not null,
  title text not null,
  content jsonb default '{}'::jsonb,
  emoji text,
  version integer not null,
  user_id uuid references public.users on delete cascade not null
);

-- Create document shares table
create table public.document_shares (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  document_id uuid references public.documents on delete cascade not null,
  user_id uuid references public.users on delete cascade not null,
  permission text check (permission in ('view', 'edit', 'admin')) not null,
  email text
);

-- Create document analytics table
create table public.document_analytics (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  document_id uuid references public.documents on delete cascade not null,
  user_id uuid references public.users on delete cascade,
  action text not null,
  metadata jsonb default '{}'::jsonb
);

-- Enable RLS
alter table public.document_versions enable row level security;
alter table public.document_shares enable row level security;
alter table public.document_analytics enable row level security;

-- Document versions policies
create policy "Users can view own document versions"
  on public.document_versions for select
  using (auth.uid() = user_id);

create policy "Users can create document versions"
  on public.document_versions for insert
  with check (auth.uid() = user_id);

-- Document shares policies
create policy "Users can view document shares"
  on public.document_shares for select
  using (
    auth.uid() = user_id or
    exists (
      select 1 from public.documents
      where documents.id = document_shares.document_id
      and documents.user_id = auth.uid()
    )
  );

create policy "Users can manage document shares"
  on public.document_shares for all
  using (
    exists (
      select 1 from public.documents
      where documents.id = document_shares.document_id
      and documents.user_id = auth.uid()
    )
  );

-- Document analytics policies
create policy "Users can view own document analytics"
  on public.document_analytics for select
  using (
    auth.uid() = user_id or
    exists (
      select 1 from public.documents
      where documents.id = document_analytics.document_id
      and documents.user_id = auth.uid()
    )
  );

create policy "Users can create analytics entries"
  on public.document_analytics for insert
  with check (auth.uid() = user_id);