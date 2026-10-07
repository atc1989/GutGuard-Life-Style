-- Test for 20261003000000_shop_order_sync.sql. Run on a THROWAWAY database only (it inserts users).
-- Needs Lifestyle migrations 1-6 and Supabase roles. Expected output: test_shop_order_sync.expected.txt
\set ON_ERROR_STOP 1
\pset format unaligned
\pset tuples_only on
-- Ana: confirmed email. Ben, Cy: added later. Eve: an attacker who copies Cy's email on her profile.
insert into auth.users(id,email,email_confirmed_at) values
 ('00000000-0000-0000-0000-00000000000a','ana@x.ph',now()),('00000000-0000-0000-0000-00000000000b','ben@x.ph',now()),
 ('00000000-0000-0000-0000-00000000000c','cy@x.ph',now()),('00000000-0000-0000-0000-00000000000e','eve@x.ph',now());
insert into public.profiles(id,name,mobile,email,card_no) values ('00000000-0000-0000-0000-00000000000a','Ana','+63 917 000 0001','ana@x.ph','C1');
set role service_role; set request.jwt.claim.role = 'service_role';
select '01 watch paid', public.lifestyle_apply_shop_order('{"order_code":"GG-1","event":"paid","at":"2026-10-01","email":"ANA@x.ph","mobile":"x","items":[{"id":"watch","qty":1,"caps":10}]}');
select '02 same again', public.lifestyle_apply_shop_order('{"order_code":"GG-1","event":"paid","at":"2026-10-01","email":"ana@x.ph","items":[{"id":"watch","qty":1,"caps":10}]}');
reset role; select '03 ana', lifestyle_stage, points from public.profiles where name='Ana'; set role service_role;
select '04 delivered', public.lifestyle_apply_shop_order('{"order_code":"GG-1","event":"delivered","at":"2026-10-03","email":"ana@x.ph","items":[{"id":"watch","qty":1,"caps":10}]}');
reset role; select '05 ana', lifestyle_stage, trial_started_on from public.profiles where name='Ana'; set role service_role;
select '06 plan by email', public.lifestyle_apply_shop_order('{"order_code":"GG-2","event":"paid","at":"2026-10-04","email":"ana@x.ph","mobile":"09170000001","items":[{"id":"plan-full-monthly","qty":1,"caps":180}]}');
reset role; select '07 ana', lifestyle_stage, plan_goal, plan_cadence, plan_status, plan_started_on, points from public.profiles where name='Ana'; set role service_role;
select '08 gift for Ben', public.lifestyle_apply_shop_order('{"order_code":"GG-3","event":"paid","at":"2026-10-05","email":"ana@x.ph","for_other":true,"recipient_mobile":"0918 222 3333","items":[{"id":"watch","qty":1,"caps":10}]}');
select '09 Cy (no account) bottles+peak', public.lifestyle_apply_shop_order('{"order_code":"GG-4","event":"paid","at":"2026-10-05","email":"cy@x.ph","mobile":"09190000009","items":[{"id":"bottle","qty":2,"caps":30},{"id":"peak","qty":1,"caps":330}]}');
select '10 old-shop order, old id, no caps', public.lifestyle_apply_shop_order('{"order_code":"GG-OLD","event":"paid","at":"2026-10-05","email":"ana@x.ph","items":[{"id":"trial-bottle","qty":1}]}');
select '11 renewal, quarterly', public.lifestyle_apply_shop_order('{"order_code":"GG-5","event":"paid","at":"2026-11-01","email":"ana@x.ph","items":[{"id":"plan-full-quarterly","qty":1,"caps":540}]}');
reset role; select '12 ana after renewal (start unchanged)', plan_started_on, plan_cadence, points from public.profiles where name='Ana';
-- members cannot call the website function
set role authenticated; set request.jwt.claim.role='authenticated';
do $$ begin perform public.lifestyle_apply_shop_order('{"order_code":"X","event":"paid"}'); raise exception 'SHOULD FAIL'; exception when insufficient_privilege then raise notice '13 member blocked from apply: ok'; end $$;
-- Eve signs up first and sets her PROFILE email to Cy's (her log-in email stays eve@): no points
reset role; set request.jwt.claim.role = 'service_role';
insert into public.profiles(id,name,mobile,email,card_no) values ('00000000-0000-0000-0000-00000000000e','Eve','09175550000','cy@x.ph','C9');
set role authenticated; set request.jwt.claim.role='authenticated'; set request.jwt.claim.sub='00000000-0000-0000-0000-00000000000e';
select '14 eve claims', public.lifestyle_claim_shop_orders();
reset role; select '15 eve points', points from public.profiles where name='Eve';
-- Ben and Cy sign up (Eve's profile email moved away first, unique index)
update public.profiles set email = 'eve@x.ph' where name='Eve';
set request.jwt.claim.role = 'service_role';
insert into public.profiles(id,name,mobile,email,card_no) values ('00000000-0000-0000-0000-00000000000b','Ben','09182223333','ben@x.ph','C2');
insert into public.profiles(id,name,mobile,email,card_no) values ('00000000-0000-0000-0000-00000000000c','Cy','09190000009','cy@x.ph','C3');
set role authenticated; set request.jwt.claim.role='authenticated'; set request.jwt.claim.sub='00000000-0000-0000-0000-00000000000b';
select '16 ben claims', public.lifestyle_claim_shop_orders();
set request.jwt.claim.sub='00000000-0000-0000-0000-00000000000c';
select '17 cy claims', public.lifestyle_claim_shop_orders();
select '18 cy again', public.lifestyle_claim_shop_orders();
-- refund of Cy's order: points back once; stage stays
reset role; set role service_role; set request.jwt.claim.role = 'service_role';
select '19 refund', public.lifestyle_apply_shop_order('{"order_code":"GG-4","event":"refunded","at":"2026-10-08"}');
select '20 refund again', public.lifestyle_apply_shop_order('{"order_code":"GG-4","event":"refunded","at":"2026-10-08"}');
-- refund before the buyer ever signed up: the points are never given
select '21 Dee pays', public.lifestyle_apply_shop_order('{"order_code":"GG-6","event":"paid","email":"dee@x.ph","items":[{"id":"grow","qty":1,"caps":90}]}');
select '22 Dee refunded', public.lifestyle_apply_shop_order('{"order_code":"GG-6","event":"refunded"}');
reset role;
insert into auth.users(id,email,email_confirmed_at) values ('00000000-0000-0000-0000-00000000000d','dee@x.ph',now());
insert into public.profiles(id,name,mobile,email,card_no) values ('00000000-0000-0000-0000-00000000000d','Dee','09170001111','dee@x.ph','C4');
set role authenticated; set request.jwt.claim.role='authenticated'; set request.jwt.claim.sub='00000000-0000-0000-0000-00000000000d';
select '23 dee claims', public.lifestyle_claim_shop_orders();
reset role;
select '24 final', name, lifestyle_stage, points from public.profiles order by name;
select '25 events', amount, source_ref from public.point_events order by source_ref;
select '26 waiting', count(*) from public.shop_order_sync where applied_at is null;
-- refund arrives BEFORE the paid call (paid sync was failing): the E-Points are never given
set role service_role; set request.jwt.claim.role = 'service_role';
select '27 refund first', public.lifestyle_apply_shop_order('{"order_code":"GG-7","event":"refunded","email":"ana@x.ph","items":[{"id":"peak","qty":1,"caps":330}]}');
select '28 then paid', public.lifestyle_apply_shop_order('{"order_code":"GG-7","event":"paid","email":"ana@x.ph","items":[{"id":"peak","qty":1,"caps":330}]}');
reset role; select '29 ana points unchanged', points from public.profiles where name='Ana';
-- refund after the member spent the points: never below 0
update public.profiles set points = 5 where name='Ana';
set role service_role; set request.jwt.claim.role = 'service_role';
select '30 refund GG-5 (54 given)', public.lifestyle_apply_shop_order('{"order_code":"GG-5","event":"refunded"}');
reset role; select '31 ana points', points from public.profiles where name='Ana';
select '32 refund row', amount from public.point_events where source_ref = 'shop:GG-5:refund';
-- a task 5 renewal order paid while the plan is paused does not change the plan
update public.profiles set plan_status = 'paused', plan_paused_until = '2026-12-01' where name='Ana';
set role service_role; set request.jwt.claim.role = 'service_role';
select '33 renewal while paused', public.lifestyle_apply_shop_order('{"order_code":"GG-8","event":"paid","at":"2026-11-05","email":"ana@x.ph","renewal_due":"2026-11-04","items":[{"id":"plan-full-monthly","qty":1,"caps":180}]}');
reset role; select '34 ana plan', plan_status, plan_paused_until, plan_started_on, points from public.profiles where name='Ana';
