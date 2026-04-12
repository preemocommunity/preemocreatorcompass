-- Add creator_id to brands table (links dashboard brands to CreatorScout creators)
alter table brands add column if not exists creator_id uuid;

-- Creators table (CreatorScout profiles)
create table if not exists creators (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  bio text default '',
  niches text[] default '{}',
  platforms text[] default '{}',
  followers text default '',
  style text[] default '{}',
  collab_prefs text[] default '{}',
  location text default 'Bali, Indonesia',
  brand_id uuid references brands(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Collab opportunities (Scout results)
create table if not exists collab_opportunities (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references creators(id) on delete cascade,
  business_name text not null,
  business_category text default '',
  business_location text default '',
  business_instagram text default '',
  fit_score integer default 0,
  fit_reason text default '',
  collab_idea text default '',
  estimated_value text default '',
  contact_type text default '',
  emoji text default '🏢',
  status text default 'new',
  created_at timestamp with time zone default now()
);

-- Outreach messages
create table if not exists outreach_messages (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references creators(id) on delete cascade,
  opportunity_id uuid references collab_opportunities(id) on delete cascade,
  message_text text not null,
  platform text default '',
  sent_at timestamp with time zone,
  response_received boolean default false,
  created_at timestamp with time zone default now()
);

-- RLS policies
alter table creators enable row level security;
alter table collab_opportunities enable row level security;
alter table outreach_messages enable row level security;

create policy "Allow all on creators" on creators for all using (true) with check (true);
create policy "Allow all on collab_opportunities" on collab_opportunities for all using (true) with check (true);
create policy "Allow all on outreach_messages" on outreach_messages for all using (true) with check (true);
