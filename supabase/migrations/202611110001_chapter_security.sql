begin;

-- Assign chapter_role only in trusted Auth app_metadata. User-editable metadata is ignored.
create function public.is_chapter_staff() returns boolean
language sql stable security invoker set search_path = ''
as $$ select coalesce(auth.jwt()->'app_metadata'->>'chapter_role' in ('admin','organizer'), false) $$;
revoke all on function public.is_chapter_staff() from public;
grant execute on function public.is_chapter_staff() to anon, authenticated;

alter table public.event_registrations enable row level security;
revoke all on public.event_registrations from public, anon, authenticated;
grant select on public.event_registrations to authenticated;
create policy chapter_registrations_guard on public.event_registrations as restrictive
  for all to public using (public.is_chapter_staff()) with check (public.is_chapter_staff());
create policy chapter_registrations_read on public.event_registrations
  for select to authenticated using (public.is_chapter_staff());

-- Preserve existing public read policies. Restrictive policies also constrain older permissive grants.
do $$
declare tbl text;
begin
  foreach tbl in array array['noticias','eventos'] loop
    execute format('alter table public.%I enable row level security', tbl);
    execute format('create policy chapter_staff_write on public.%I for all to authenticated using (public.is_chapter_staff()) with check (public.is_chapter_staff())', tbl);
    execute format('create policy chapter_insert_guard on public.%I as restrictive for insert to public with check (public.is_chapter_staff())', tbl);
    execute format('create policy chapter_update_guard on public.%I as restrictive for update to public using (public.is_chapter_staff()) with check (public.is_chapter_staff())', tbl);
    execute format('create policy chapter_delete_guard on public.%I as restrictive for delete to public using (public.is_chapter_staff())', tbl);
  end loop;
end $$;

create policy chapter_storage_insert on storage.objects as restrictive for insert to public
  with check (bucket_id not in ('noticias','eventos') or public.is_chapter_staff());
create policy chapter_storage_update on storage.objects as restrictive for update to public
  using (bucket_id not in ('noticias','eventos') or public.is_chapter_staff())
  with check (bucket_id not in ('noticias','eventos') or public.is_chapter_staff());
create policy chapter_storage_delete on storage.objects as restrictive for delete to public
  using (bucket_id not in ('noticias','eventos') or public.is_chapter_staff());
create policy chapter_storage_staff on storage.objects for all to authenticated
  using (bucket_id in ('noticias','eventos') and public.is_chapter_staff())
  with check (bucket_id in ('noticias','eventos') and public.is_chapter_staff());
update storage.buckets set file_size_limit = least(coalesce(file_size_limit, 10485760),10485760),
  allowed_mime_types = array(select t from unnest(array['image/jpeg','image/png','image/gif','image/webp']) as t
    where allowed_mime_types is null or t = any(allowed_mime_types) or 'image/*' = any(allowed_mime_types))
  where id in ('noticias','eventos');

alter table public.certificados enable row level security;
revoke all on public.certificados from public, anon, authenticated;
create policy chapter_certificate_guard on public.certificados as restrictive for all to public
  using (public.is_chapter_staff()) with check (public.is_chapter_staff());
create table public.request_quotas (
  key_hash text primary key, minute timestamptz not null, used integer not null
);
alter table public.request_quotas enable row level security;
revoke all on public.request_quotas from public, anon, authenticated;
create index request_quotas_minute_idx on public.request_quotas (minute);
create function public.consume_request_quota(key_hash text, quota integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  t timestamptz := date_trunc('minute',now());
  count_used integer;
begin
  delete from public.request_quotas q where q.minute < t - interval '2 minutes';
  insert into public.request_quotas as q values ($1,t,1)
    on conflict on constraint request_quotas_pkey do update
    set used = case when q.minute = excluded.minute then least(q.used + 1,$2 + 1) else 1 end,
        minute = excluded.minute returning used into count_used;
  return count_used <= $2;
end $$;
revoke all on function public.consume_request_quota(text,integer) from public, anon, authenticated;
grant execute on function public.consume_request_quota(text,integer) to service_role;

commit;
