begin;

create table if not exists packages (
  id uuid not null primary key default gen_random_uuid(),
  created_at timestamptz not null default current_timestamp,
  title text not null,
  description text null,
  size decimal(4, 2) not null,
  metadata jsonb null
);

create table if not exists package_trail(
  id uuid not null primary key default gen_random_uuid(),
  created_at timestamptz not null default current_timestamp,
  package_id uuid not null,
  current_state jsonb not null,
  foreign key (package_id) references packages on delete cascade
);

commit;