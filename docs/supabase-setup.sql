-- M-Power Print / Drop 01 — designs table
-- Run this once in the Supabase SQL Editor for your new project.

create table if not exists designs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text default '',
  category text default '',
  tags text[] default '{}',
  garments text[] not null default '{t-shirts,hoodies,long-sleeve}',
  colors text[] not null default '{}',
  prices jsonb,                       -- e.g. {"t-shirts": 2800, "hoodies": 4500}  (cents)
  featured boolean not null default false,
  published boolean not null default false,
  display_order int not null default 100,
  front_image text default '',        -- storage path, e.g. designs/my-slug/front.webp
  back_image text default '',
  model_image text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table designs enable row level security;

-- Anyone (including the anonymous public site) can read published designs.
create policy "public can read published" on designs
  for select using (published = true);

-- Only a signed-in user can read drafts, insert, update or delete.
create policy "signed-in users manage everything" on designs
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Storage bucket for design photos.
insert into storage.buckets (id, name, public) values ('designs', 'designs', true)
  on conflict (id) do nothing;

create policy "public can view design photos" on storage.objects
  for select using (bucket_id = 'designs');

create policy "signed-in users can upload design photos" on storage.objects
  for insert with check (bucket_id = 'designs' and auth.role() = 'authenticated');

create policy "signed-in users can replace design photos" on storage.objects
  for update using (bucket_id = 'designs' and auth.role() = 'authenticated');

create policy "signed-in users can delete design photos" on storage.objects
  for delete using (bucket_id = 'designs' and auth.role() = 'authenticated');
