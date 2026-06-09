create table
  public.producciones (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    categoria text not null default 'produccion'::text,
    title text not null,
    tipo text null,
    year text null,
    cover text not null,
    images text[] not null default '{}'::text[],
    fx boolean not null default false,
    constraint producciones_pkey primary key (id)
  ) tablespace pg_default;

-- Permisos públicos de lectura
alter table public.producciones enable row level security;

create policy "Enable read access for all users"
  on public.producciones for select
  using (true);

-- Permisos para usuarios autenticados (Admin)
create policy "Enable insert for authenticated users only"
  on public.producciones for insert
  to authenticated
  with check (true);

create policy "Enable update for authenticated users only"
  on public.producciones for update
  to authenticated
  using (true);

create policy "Enable delete for authenticated users only"
  on public.producciones for delete
  to authenticated
  using (true);
