-- Retire the earlier UUID lookup on installations that already applied it.
drop function if exists public.verify_public_certificate(uuid);
