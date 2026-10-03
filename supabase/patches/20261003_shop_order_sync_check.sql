-- Addendum 05, task 3: run after 20261003000000_shop_order_sync.sql. Every row must say ok = true.
select 'point_events.source_ref is unique' as test,
       exists (select 1 from pg_indexes where indexname = 'point_events_source_ref_key') as ok
union all
select 'shop_order_sync: RLS on',
       coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.shop_order_sync')), false)
union all
select 'apply: service role only',
       coalesce(has_function_privilege('service_role', to_regprocedure('public.lifestyle_apply_shop_order(jsonb)'), 'execute')
            and not has_function_privilege('authenticated', to_regprocedure('public.lifestyle_apply_shop_order(jsonb)'), 'execute')
            and not has_function_privilege('anon', to_regprocedure('public.lifestyle_apply_shop_order(jsonb)'), 'execute'), false)
union all
select 'claim: members only',
       coalesce(has_function_privilege('authenticated', to_regprocedure('public.lifestyle_claim_shop_orders()'), 'execute')
            and not has_function_privilege('anon', to_regprocedure('public.lifestyle_claim_shop_orders()'), 'execute'), false)
union all
select 'points rule: Peak + 2 Bottles = 39',
       public.lifestyle_shop_points('[{"id":"peak","qty":1,"caps":330},{"id":"bottle","qty":2,"caps":30}]') = 39;
