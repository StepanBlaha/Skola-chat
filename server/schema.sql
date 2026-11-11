create table messages (
  id bigint generated always as identity primary key,
  name text not null,
  text text not null,
  color text not null,
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

create policy "Anyone can read messages" on messages for select using (true);
create policy "Anyone can add messages" on messages for insert with check (true);
