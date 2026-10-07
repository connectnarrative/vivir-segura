-- Run only in Vivir Segura's dedicated Supabase project.
-- This file is deployment preparation, not an applied migration.
begin;
create table public.properties (
 id uuid primary key default gen_random_uuid(),
 reference text not null unique check(reference ~ '^VS-[0-9]{3,}$'),
 slug text not null unique,
 status text not null default 'Borrador' check(status in ('Borrador','Disponible','Reservada','Vendida')),
 public_data jsonb not null default '{}'::jsonb,
 owner_name text not null default '',
 internal_notes text not null default '',
 commission numeric not null default 0 check(commission >= 0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.team_members(user_id uuid primary key references auth.users(id) on delete cascade, role text not null check(role in ('admin','agent')),active boolean not null default true,created_at timestamptz not null default now());
create table public.owners(id uuid primary key default gen_random_uuid(),name text not null,phone text,email text,notes text,created_at timestamptz not null default now());
create table public.property_media(id uuid primary key default gen_random_uuid(),property_id uuid not null references public.properties(id) on delete cascade,url text not null,kind text not null default 'photo',caption_es text,caption_en text,sort_order integer not null default 0,visibility text not null default 'public' check(visibility in ('public','hidden','private')));
create table public.property_features(id uuid primary key default gen_random_uuid(),property_id uuid not null references public.properties(id) on delete cascade,label_es text not null,label_en text,sort_order integer not null default 0);
create table public.property_locations(property_id uuid primary key references public.properties(id) on delete cascade,country text not null default 'Colombia',department text,city text,neighborhood text,private_address text,public_latitude numeric,public_longitude numeric,approximate boolean not null default true);
create table public.property_documents(id uuid primary key default gen_random_uuid(),property_id uuid not null references public.properties(id) on delete cascade,storage_path text not null,title text not null,status text not null default 'pendiente',created_at timestamptz not null default now());
create table public.leads (
 id uuid primary key,
 kind text not null check(kind in ('consulta','visita','vendedor','comprador')),
 name text not null check(length(name) between 2 and 150), phone text not null,
 email text not null default '',property_ref text,
 details jsonb not null default '{}'::jsonb,
 stage text not null default 'NUEVO' check(stage in ('NUEVO','CONTACTADO','CALIFICADO','VISITA','OFERTA','NEGOCIACIÓN','CERRADO','PERDIDO')),
 created_at timestamptz not null default now()
);
create index leads_stage_created_idx on public.leads(stage,created_at desc);
create index leads_phone_created_idx on public.leads(phone,created_at desc);
create table public.lead_activities(id uuid primary key default gen_random_uuid(),lead_id uuid not null references public.leads(id) on delete cascade,content text not null,created_at timestamptz not null default now());
create index lead_activities_lead_idx on public.lead_activities(lead_id,created_at desc);
create table public.viewing_requests(id uuid primary key default gen_random_uuid(),lead_id uuid not null references public.leads(id) on delete cascade,property_ref text,preferred_date date,preferred_time time,status text not null default 'solicitada',created_at timestamptz not null default now());
create table public.seller_submissions(id uuid primary key default gen_random_uuid(),lead_id uuid not null references public.leads(id) on delete cascade,property_type text,location text,asking_price text,created_at timestamptz not null default now());
create table public.buyer_requirements(id uuid primary key default gen_random_uuid(),lead_id uuid not null references public.leads(id) on delete cascade,property_type text,location text,budget text,purpose text,created_at timestamptz not null default now());
-- Zero direct client access to private CRM, owner and document records.
revoke all on all tables in schema public from anon,authenticated;
grant usage on schema public to anon,authenticated,service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
alter table public.properties enable row level security;
alter table public.team_members enable row level security;
alter table public.owners enable row level security;
alter table public.property_media enable row level security;
alter table public.property_features enable row level security;
alter table public.property_locations enable row level security;
alter table public.property_documents enable row level security;
alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;
alter table public.viewing_requests enable row level security;
alter table public.seller_submissions enable row level security;
alter table public.buyer_requirements enable row level security;
-- Only public catalog columns are granted; notes, commission and owner are excluded.
grant select(reference,slug,status,public_data) on public.properties to anon,authenticated;
create policy published_properties on public.properties for select to anon,authenticated using (status <> 'Borrador');
create view public.public_properties with(security_invoker=true) as select reference,slug,status,public_data from public.properties where status <> 'Borrador';
grant select on public.public_properties to anon,authenticated;
-- Private documents never use public buckets.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('property-documents','property-documents',false,10485760,array['application/pdf','image/jpeg','image/png']);
-- No client write policies: all management writes go through authenticated server endpoints.
commit;
