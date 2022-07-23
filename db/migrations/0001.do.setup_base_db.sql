begin;

create or replace function capture_package_current_state ()
	returns trigger
	as $$
begin
	insert into package_trail (package_id, current_state)
		values(NEW.id, row_to_json(NEW));
	return NEW;
end;
$$
language 'plpgsql';

create table if not exists packages (
  id uuid not null primary key default gen_random_uuid(),
  created_at timestamptz not null default current_timestamp,
  title text not null,
  description text null,
  size numeric not null,
  picked_up_at timestamptz null,
  delivered_at timestamptz null,
  status text null
);

create table if not exists package_trail(
  id uuid not null primary key default gen_random_uuid(),
  created_at timestamptz not null default current_timestamp,
  package_id uuid not null,
  current_state jsonb not null,
  foreign key (package_id) references packages on delete cascade
);


create trigger package_updated after update 
on packages for each row execute procedure
capture_package_current_state();

create trigger package_created after insert 
on packages for each row execute procedure
capture_package_current_state();

COMMIT;