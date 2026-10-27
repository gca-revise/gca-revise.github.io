-- DRAFT, NOT APPLIED. Reject unexpected fields in a saved progress record.
-- The record must be a JSON object whose top-level fields are only the ones the app saves.
-- Keep this list in step with the app: if a new saved field is added in web/js (storage.js, points.js),
-- add it here first, or saving will fail for signed-in students.

create or replace function public.progress_fields_ok(state jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(state) = 'object'
    and not exists (
      select 1 from jsonb_object_keys(state) as k
      where k <> all (array['stats', 'sound', 'retired', 'pts', 'mode', 'lessons', 'lessonWrong'])
    );
$$;

-- NOT VALID: checks new and changed rows only (the two test accounts' rows are left alone).
alter table public.user_progress
  add constraint state_has_known_fields check (public.progress_fields_ok(state)) not valid;
