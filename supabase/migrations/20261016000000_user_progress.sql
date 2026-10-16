-- One row per signed-in student: their saved progress (the same data the app keeps on the device today).
-- No names or emails are stored here; the link to the person is only the sign-in user id (auth.users).
create table public.user_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint state_is_small check (pg_column_size(state) < 200000)
);

-- Row-level security: a student can only ever see and change their own row.
alter table public.user_progress enable row level security;

create policy "read own progress" on public.user_progress
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "create own progress" on public.user_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "update own progress" on public.user_progress
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "delete own progress" on public.user_progress
  for delete to authenticated using ((select auth.uid()) = user_id);
