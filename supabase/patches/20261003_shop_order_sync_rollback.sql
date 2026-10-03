-- Undo 20261003000000_shop_order_sync.sql (back-end task 3).
-- E-Points already given stay given (point_events rows and profiles.points are not changed back).
begin;
drop function if exists public.lifestyle_claim_shop_orders();
drop function if exists public.lifestyle_apply_shop_order(jsonb);
drop function if exists public.lifestyle_try_shop_order(text, text);
drop function if exists public.lifestyle_match_profile(text, text);
drop function if exists public.lifestyle_shop_points(jsonb);
drop function if exists public.lifestyle_stage_rank(text);
drop table if exists public.shop_order_sync;
-- keep point_events.source_ref: it stops the same order paying twice if task 3 is applied again
commit;
