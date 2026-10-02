create extension if not exists pg_trgm;
create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.recipes (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null default '',
  category text not null default 'Другое',
  image_url text,
  source_url text,
  prep_minutes integer not null default 30 check (prep_minutes between 1 and 600),
  rating numeric(2,1) not null default 0 check (rating between 0 and 5),
  servings integer not null default 2 check (servings between 1 and 100),
  difficulty text not null default 'Легко' check (difficulty in ('Легко','Средне','Сложно')),
  source text not null default 'user' check (source in ('user','catalog','ai')),
  cache_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ingredients (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  name text not null,
  measure text not null default '',
  position integer not null default 0
);
create table if not exists public.steps (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  instruction text not null,
  image_url text,
  position integer not null default 0
);
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create table if not exists public.ratings (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null check (score between 1 and 5),
  unique (recipe_id, author_id)
);
create table if not exists public.favorites (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (recipe_id, user_id)
);
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  recipe_id uuid references public.recipes(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 500),
  status text not null default 'open' check (status in ('open','resolved','dismissed')),
  created_at timestamptz not null default now(),
  check (num_nonnulls(recipe_id, comment_id) = 1)
);

create index if not exists recipes_title_trgm_idx on public.recipes using gin (title gin_trgm_ops);
create index if not exists recipes_category_idx on public.recipes(category);
create index if not exists recipes_created_idx on public.recipes(created_at desc);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
create or replace function public.search_recipes(search_query text) returns setof public.recipes language sql stable as $$
  select * from public.recipes where title % search_query or title ilike '%' || search_query || '%' order by similarity(title, search_query) desc limit 30;
$$;
create or replace function public.refresh_recipe_rating() returns trigger language plpgsql security definer set search_path = public as $$
declare
  target_recipe uuid := coalesce(new.recipe_id, old.recipe_id);
begin
  update public.recipes set rating = coalesce((select round(avg(score)::numeric, 1) from public.ratings where recipe_id = target_recipe), 0) where id = target_recipe;
  return coalesce(new, old);
end;
$$;
drop trigger if exists ratings_refresh_recipe_rating on public.ratings;
create trigger ratings_refresh_recipe_rating after insert or update or delete on public.ratings for each row execute function public.refresh_recipe_rating();
create or replace function public.create_profile_for_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'name', '')) on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.create_profile_for_user();

alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.ingredients enable row level security;
alter table public.steps enable row level security;
alter table public.comments enable row level security;
alter table public.ratings enable row level security;
alter table public.favorites enable row level security;
alter table public.reports enable row level security;

create policy "profiles are public" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update using ((auth.uid() = id and role = 'user') or public.is_admin()) with check ((auth.uid() = id and role = 'user') or public.is_admin());
create policy "recipes are public" on public.recipes for select using (true);
create policy "signed-in users create recipes" on public.recipes for insert to authenticated with check (auth.uid() = author_id);
create policy "owners update recipes" on public.recipes for update to authenticated using (auth.uid() = author_id or public.is_admin()) with check (auth.uid() = author_id or public.is_admin());
create policy "owners and admins delete recipes" on public.recipes for delete to authenticated using (auth.uid() = author_id or public.is_admin());
create policy "ingredients are public" on public.ingredients for select using (true);
create policy "recipe owners manage ingredients" on public.ingredients for all to authenticated using (exists (select 1 from public.recipes r where r.id = recipe_id and (r.author_id = auth.uid() or public.is_admin()))) with check (exists (select 1 from public.recipes r where r.id = recipe_id and (r.author_id = auth.uid() or public.is_admin())));
create policy "steps are public" on public.steps for select using (true);
create policy "recipe owners manage steps" on public.steps for all to authenticated using (exists (select 1 from public.recipes r where r.id = recipe_id and (r.author_id = auth.uid() or public.is_admin()))) with check (exists (select 1 from public.recipes r where r.id = recipe_id and (r.author_id = auth.uid() or public.is_admin())));
create policy "comments are public" on public.comments for select using (true);
create policy "signed-in users create comments" on public.comments for insert to authenticated with check (auth.uid() = author_id);
create policy "owners and admins delete comments" on public.comments for delete to authenticated using (auth.uid() = author_id or public.is_admin());
create policy "ratings are public" on public.ratings for select using (true);
create policy "users manage own ratings" on public.ratings for all to authenticated using (auth.uid() = author_id or public.is_admin()) with check (auth.uid() = author_id);
create policy "favorites are private to owner" on public.favorites for select to authenticated using (auth.uid() = user_id or public.is_admin());
create policy "users manage own favorites" on public.favorites for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users submit reports" on public.reports for insert to authenticated with check (auth.uid() = reporter_id);
create policy "admins review reports" on public.reports for select to authenticated using (public.is_admin());
create policy "admins manage reports" on public.reports for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins remove reports" on public.reports for delete to authenticated using (public.is_admin());

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types) values ('recipe-photos','recipe-photos',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict (id) do nothing;
create policy "recipe photos are public" on storage.objects for select using (bucket_id = 'recipe-photos');
create policy "signed-in users upload recipe photos" on storage.objects for insert to authenticated with check (bucket_id = 'recipe-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "owners delete recipe photos" on storage.objects for delete to authenticated using (bucket_id = 'recipe-photos' and auth.uid()::text = (storage.foldername(name))[1]);