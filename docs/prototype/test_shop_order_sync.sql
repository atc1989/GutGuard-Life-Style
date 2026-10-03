-- Test for 20261003000000_shop_order_sync.sql. Run on a THROWAWAY database only (it inserts users).
-- Needs the Lifestyle migrations 1-6 and Supabase-like roles. Expected output: see Addendum 05, Part C, task 3.
\set ON_ERROR_STOP 1
\pset format unaligned
\pset tuples_only on
insert into auth.users(id,email) values ('00000000-0000-0000-0000-00000000000a','ana@x.ph'),('00000000-0000-0000-0000-00000000000b','ben@x.ph'),('00000000-0000-0000-0000-00000000000c','cy@x.ph');
insert into public.profiles(id,name,mobile,email,card_no) values ('00000000-0000-0000-0000-00000000000a','Ana','+63 917 000 0001','ana@x.ph','C1');
set role service_role; set request.jwt.claim.role = 'service_role';
-- 1 watch for Ana (email match)
select 'watch paid applied', public.lifestyle_apply_shop_order('{"order_code":"GG-1","event":"paid","at":"2026-10-01","email":"ANA@x.ph","mobile":"x","items":[{"id":"watch","qty":1}]}');
select 'again (idempotent)', public.lifestyle_apply_shop_order('{"order_code":"GG-1","event":"paid","at":"2026-10-01","email":"ana@x.ph","items":[{"id":"watch","qty":1}]}');
select 'ana stage/points', lifestyle_stage, points from public.profiles where name='Ana';
select 'watch delivered', public.lifestyle_apply_shop_order('{"order_code":"GG-1","event":"delivered","at":"2026-10-03","email":"ana@x.ph","items":[{"id":"watch","qty":1}]}');
select 'ana stage/trial', lifestyle_stage, trial_started_on from public.profiles where name='Ana';
-- 2 plan for Ana by mobile only
select 'plan', public.lifestyle_apply_shop_order('{"order_code":"GG-2","event":"paid","at":"2026-10-04","mobile":"09170000001","items":[{"id":"plan-full-monthly","qty":1}]}');
select 'ana plan', lifestyle_stage, plan_goal, plan_cadence, plan_status, plan_started_on, points from public.profiles where name='Ana';
-- 3 late delivered of watch must not lower stage
select 'late', public.lifestyle_apply_shop_order('{"order_code":"GG-1","event":"delivered","at":"2026-10-09","email":"ana@x.ph","items":[{"id":"watch","qty":1}]}');
select 'ana still member', lifestyle_stage from public.profiles where name='Ana';
-- 4 gift: Ana pays a Watch for Ben who has no profile yet
select 'gift', public.lifestyle_apply_shop_order('{"order_code":"GG-3","event":"paid","at":"2026-10-05","email":"ana@x.ph","for_other":true,"recipient_mobile":"0918 222 3333","items":[{"id":"watch","qty":1}]}');
select 'ana points after gift', points from public.profiles where name='Ana';
-- 5 unknown buyer: Cy, pack of 2 bottles
select 'cy waits', public.lifestyle_apply_shop_order('{"order_code":"GG-4","event":"paid","at":"2026-10-05","email":"cy@x.ph","mobile":"09190000009","items":[{"id":"bottle","qty":2},{"id":"peak","qty":1}]}');
select 'waiting rows', count(*) from public.shop_order_sync where applied_at is null;
-- anon / authenticated cannot call apply
reset role; set role authenticated; set request.jwt.claim.role='authenticated';
do $$ begin perform public.lifestyle_apply_shop_order('{"order_code":"X","event":"paid"}'); raise exception 'SHOULD FAIL'; exception when insufficient_privilege then raise notice 'auth blocked ok'; end $$;
-- Ben signs up and claims
reset role; set request.jwt.claim.role = 'service_role';
insert into public.profiles(id,name,mobile,email,card_no) values ('00000000-0000-0000-0000-00000000000b','Ben','09182223333','ben@x.ph','C2');
insert into public.profiles(id,name,mobile,email,card_no) values ('00000000-0000-0000-0000-00000000000c','Cy','09190000009','cy@x.ph','C3');
set role authenticated; set request.jwt.claim.role='authenticated'; set request.jwt.claim.sub='00000000-0000-0000-0000-00000000000b';
select 'ben claims', public.lifestyle_claim_shop_orders();
set request.jwt.claim.sub='00000000-0000-0000-0000-00000000000c';
select 'cy claims', public.lifestyle_claim_shop_orders();
select 'cy claims again', public.lifestyle_claim_shop_orders();
reset role;
select 'final', name, lifestyle_stage, points from public.profiles order by name;
select 'events', user_id is not null, amount, source_ref from public.point_events order by source_ref;
select 'waiting rows', count(*) from public.shop_order_sync where applied_at is null;
-- renewal of an active plan: points only, plan dates unchanged
set role service_role; set request.jwt.claim.role = 'service_role';
select 'renewal', public.lifestyle_apply_shop_order('{"order_code":"GG-5","event":"paid","at":"2026-11-01","email":"ana@x.ph","items":[{"id":"plan-full-monthly","qty":1}]}');
reset role;
select 'ana after renewal', plan_started_on, plan_skips, points from public.profiles where name='Ana';
