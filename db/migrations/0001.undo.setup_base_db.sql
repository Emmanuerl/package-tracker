begin;

drop table if exists package_trail;

drop table if exists packages cascade;

drop function capture_package_current_state;

commit;