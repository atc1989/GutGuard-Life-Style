-- SOURCE OF TRUTH for Production Lifestyle additive schema applied 2026-09-12
-- during Gentrep Change 8 cutover on project rvwseybgimmewuoccecu.
--
-- This file records SQL that was already applied with a targeted session.
-- Do NOT run supabase db push for this file.
-- Do NOT insert a row into supabase_migrations.schema_migrations.
-- Do NOT re-apply on Production unless an operator has proven the objects are
-- missing. Every statement is IF NOT EXISTS / CREATE OR REPLACE / ON CONFLICT.
--
-- Did not replace public.profiles, Auth triggers, or Academy objects.
-- Did not mint cards or backfill real member history.
-- card_no remains nullable.
--
-- Official Lifestyle migration series in supabase/migrations/ still applies to
-- empty/dev databases. Those CREATE TABLE migrations must not be used as a
-- Production apply-log: Production already had a slim public.profiles row.
--
-- Staging (fxdsnacuonfvutdquogb) already had equivalent member columns/tables
-- from earlier work. Staging is missing public.app_roles and
-- public.webhook_events relative to this patch; that gap is documented, not
-- repaired by re-running this file during Change 8 closure.
-- Production additive Lifestyle schema.
-- Does not replace public.profiles, Auth triggers, or Academy objects.
-- Does not mint cards or backfill real member history.
-- Does not insert into supabase_migrations.schema_migrations.
BEGIN;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mobile text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sponsor text DEFAULT 'Ate Marites';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS team text DEFAULT 'GenSan';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS card_no text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phase text DEFAULT 'invited';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS claimed boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pending integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banked integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS days_left integer DEFAULT -1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS capsules_per_day integer DEFAULT 2;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS facebook boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notifications boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS welcome_seen boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'member';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS locale text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

UPDATE public.profiles SET phase = 'invited' WHERE phase IS NULL;
UPDATE public.profiles SET claimed = false WHERE claimed IS NULL;
UPDATE public.profiles SET points = 0 WHERE points IS NULL;
UPDATE public.profiles SET pending = 0 WHERE pending IS NULL;
UPDATE public.profiles SET banked = 0 WHERE banked IS NULL;
UPDATE public.profiles SET days_left = -1 WHERE days_left IS NULL;
UPDATE public.profiles SET capsules_per_day = 2 WHERE capsules_per_day IS NULL;
UPDATE public.profiles SET telegram = false WHERE telegram IS NULL;
UPDATE public.profiles SET facebook = false WHERE facebook IS NULL;
UPDATE public.profiles SET notifications = true WHERE notifications IS NULL;
UPDATE public.profiles SET welcome_seen = false WHERE welcome_seen IS NULL;
UPDATE public.profiles SET role = 'member' WHERE role IS NULL;

ALTER TABLE public.profiles ALTER COLUMN phase SET DEFAULT 'invited';
ALTER TABLE public.profiles ALTER COLUMN phase SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN claimed SET DEFAULT false;
ALTER TABLE public.profiles ALTER COLUMN claimed SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN points SET DEFAULT 0;
ALTER TABLE public.profiles ALTER COLUMN points SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN pending SET DEFAULT 0;
ALTER TABLE public.profiles ALTER COLUMN pending SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN banked SET DEFAULT 0;
ALTER TABLE public.profiles ALTER COLUMN banked SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN days_left SET DEFAULT -1;
ALTER TABLE public.profiles ALTER COLUMN days_left SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN capsules_per_day SET DEFAULT 2;
ALTER TABLE public.profiles ALTER COLUMN capsules_per_day SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN telegram SET DEFAULT false;
ALTER TABLE public.profiles ALTER COLUMN telegram SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN facebook SET DEFAULT false;
ALTER TABLE public.profiles ALTER COLUMN facebook SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN notifications SET DEFAULT true;
ALTER TABLE public.profiles ALTER COLUMN notifications SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN welcome_seen SET DEFAULT false;
ALTER TABLE public.profiles ALTER COLUMN welcome_seen SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'member';
ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_capsules_per_day_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_capsules_per_day_check
      CHECK (capsules_per_day BETWEEN 2 AND 3);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_lower_uidx
  ON public.profiles (lower(email))
  WHERE email IS NOT NULL AND length(btrim(email)) > 0;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_mobile_uidx
  ON public.profiles (mobile);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_card_no_uidx
  ON public.profiles (regexp_replace(btrim(card_no), '\s+'::text, ' '::text, 'g'::text))
  WHERE card_no IS NOT NULL AND btrim(card_no) <> ''::text;

CREATE INDEX IF NOT EXISTS profiles_role_admin_idx
  ON public.profiles (role)
  WHERE role = 'admin'::text;

CREATE TABLE IF NOT EXISTS public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name text NOT NULL,
  handle text,
  stage text NOT NULL CHECK (stage IN ('registered', 'showed', 'bought')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dose_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  log_date date NOT NULL,
  morning boolean NOT NULL DEFAULT false,
  midday boolean NOT NULL DEFAULT false,
  dreams boolean NOT NULL DEFAULT false,
  proof_path text,
  UNIQUE (user_id, log_date)
);

CREATE TABLE IF NOT EXISTS public.base_progress (
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  step_index integer NOT NULL CHECK (step_index BETWEEN 0 AND 4),
  done boolean NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, step_index)
);

CREATE TABLE IF NOT EXISTS public.point_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  kind text NOT NULL,
  amount integer NOT NULL,
  pending boolean NOT NULL DEFAULT false,
  label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  about text NOT NULL,
  relationship text,
  days text NOT NULL,
  capsules text NOT NULL,
  outcomes text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users (id),
  reject_reason text
);

CREATE TABLE IF NOT EXISTS public.app_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  qty integer NOT NULL CHECK (qty BETWEEN 1 AND 6),
  amount_pesos integer NOT NULL CHECK (amount_pesos > 0),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reconciled', 'failed', 'cancelled')),
  maya_payment_id text,
  maya_checkout_id text,
  notes text,
  reconciled_at timestamptz,
  reconciled_by uuid REFERENCES auth.users (id),
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS orders_maya_payment_id_uidx
  ON public.orders (maya_payment_id)
  WHERE maya_payment_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'maya',
  payload_hash text NOT NULL,
  ok boolean NOT NULL DEFAULT false,
  error text,
  maya_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.base_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.lifestyle_identity_taken(p_email text, p_mobile text)
RETURNS TABLE(email_taken boolean, mobile_taken boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE email IS NOT NULL
        AND lower(email) = lower(p_email)
    ),
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE mobile IN (
        p_mobile,
        CASE
          WHEN p_mobile LIKE '+63%' THEN '0' || substring(p_mobile FROM 4)
          ELSE p_mobile
        END,
        CASE
          WHEN p_mobile LIKE '09%' THEN '+63' || substring(p_mobile FROM 2)
          ELSE p_mobile
        END
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.lifestyle_is_admin(p_user uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.app_roles
    WHERE user_id = p_user
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.lifestyle_base_complete(p_user uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT coalesce((
    SELECT count(*) FILTER (WHERE done) = 5
    FROM public.base_progress
    WHERE user_id = p_user
  ), false);
$$;

REVOKE ALL ON FUNCTION public.lifestyle_identity_taken(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lifestyle_identity_taken(text, text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.lifestyle_is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lifestyle_is_admin(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.lifestyle_base_complete(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lifestyle_base_complete(uuid) TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'profiles_select_admin' AND polrelid = 'public.profiles'::regclass
  ) THEN
    CREATE POLICY profiles_select_admin ON public.profiles
      FOR SELECT TO authenticated
      USING (public.lifestyle_is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'invites_all_own' AND polrelid = 'public.invites'::regclass
  ) THEN
    CREATE POLICY invites_all_own ON public.invites
      FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'invites_select_admin' AND polrelid = 'public.invites'::regclass
  ) THEN
    CREATE POLICY invites_select_admin ON public.invites
      FOR SELECT TO authenticated
      USING (public.lifestyle_is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'dose_logs_all_own' AND polrelid = 'public.dose_logs'::regclass
  ) THEN
    CREATE POLICY dose_logs_all_own ON public.dose_logs
      FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'dose_logs_select_admin' AND polrelid = 'public.dose_logs'::regclass
  ) THEN
    CREATE POLICY dose_logs_select_admin ON public.dose_logs
      FOR SELECT TO authenticated
      USING (public.lifestyle_is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'base_progress_all_own' AND polrelid = 'public.base_progress'::regclass
  ) THEN
    CREATE POLICY base_progress_all_own ON public.base_progress
      FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'base_progress_select_admin' AND polrelid = 'public.base_progress'::regclass
  ) THEN
    CREATE POLICY base_progress_select_admin ON public.base_progress
      FOR SELECT TO authenticated
      USING (public.lifestyle_is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'point_events_all_own' AND polrelid = 'public.point_events'::regclass
  ) THEN
    CREATE POLICY point_events_all_own ON public.point_events
      FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'point_events_select_admin' AND polrelid = 'public.point_events'::regclass
  ) THEN
    CREATE POLICY point_events_select_admin ON public.point_events
      FOR SELECT TO authenticated
      USING (public.lifestyle_is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'stories_select_feed' AND polrelid = 'public.stories'::regclass
  ) THEN
    CREATE POLICY stories_select_feed ON public.stories
      FOR SELECT TO authenticated
      USING (
        user_id = auth.uid()
        OR status = 'approved'
        OR public.lifestyle_is_admin()
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'stories_insert_own_pending' AND polrelid = 'public.stories'::regclass
  ) THEN
    CREATE POLICY stories_insert_own_pending ON public.stories
      FOR INSERT TO authenticated
      WITH CHECK (
        user_id = auth.uid()
        AND status = 'pending'
        AND reviewed_at IS NULL
        AND reviewed_by IS NULL
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'stories_update_admin' AND polrelid = 'public.stories'::regclass
  ) THEN
    CREATE POLICY stories_update_admin ON public.stories
      FOR UPDATE TO authenticated
      USING (public.lifestyle_is_admin())
      WITH CHECK (public.lifestyle_is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'stories_select_admin' AND polrelid = 'public.stories'::regclass
  ) THEN
    CREATE POLICY stories_select_admin ON public.stories
      FOR SELECT TO authenticated
      USING (public.lifestyle_is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'app_roles_select_own' AND polrelid = 'public.app_roles'::regclass
  ) THEN
    CREATE POLICY app_roles_select_own ON public.app_roles
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'orders_select_own' AND polrelid = 'public.orders'::regclass
  ) THEN
    CREATE POLICY orders_select_own ON public.orders
      FOR SELECT TO authenticated
      USING (user_id = auth.uid() OR public.lifestyle_is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'orders_insert_own_pending' AND polrelid = 'public.orders'::regclass
  ) THEN
    CREATE POLICY orders_insert_own_pending ON public.orders
      FOR INSERT TO authenticated
      WITH CHECK (
        user_id = auth.uid()
        AND status = 'pending'
        AND reconciled_at IS NULL
        AND reconciled_by IS NULL
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'orders_update_own_cancel' AND polrelid = 'public.orders'::regclass
  ) THEN
    CREATE POLICY orders_update_own_cancel ON public.orders
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid() AND status = 'pending')
      WITH CHECK (
        user_id = auth.uid()
        AND status = 'cancelled'
        AND reconciled_at IS NULL
        AND reconciled_by IS NULL
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'orders_update_admin' AND polrelid = 'public.orders'::regclass
  ) THEN
    CREATE POLICY orders_update_admin ON public.orders
      FOR UPDATE TO authenticated
      USING (public.lifestyle_is_admin())
      WITH CHECK (public.lifestyle_is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'webhook_events_select_admin' AND polrelid = 'public.webhook_events'::regclass
  ) THEN
    CREATE POLICY webhook_events_select_admin ON public.webhook_events
      FOR SELECT TO authenticated
      USING (public.lifestyle_is_admin());
  END IF;
END $$;

REVOKE ALL ON TABLE public.invites FROM anon;
REVOKE ALL ON TABLE public.dose_logs FROM anon;
REVOKE ALL ON TABLE public.base_progress FROM anon;
REVOKE ALL ON TABLE public.point_events FROM anon;
REVOKE ALL ON TABLE public.stories FROM anon;
REVOKE ALL ON TABLE public.app_roles FROM anon;
REVOKE ALL ON TABLE public.orders FROM anon;
REVOKE ALL ON TABLE public.webhook_events FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.invites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.dose_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.base_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.point_events TO authenticated;
GRANT SELECT, INSERT ON TABLE public.stories TO authenticated;
GRANT SELECT ON TABLE public.app_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.orders TO authenticated;
GRANT SELECT ON TABLE public.webhook_events TO authenticated;

GRANT ALL ON TABLE public.invites TO service_role;
GRANT ALL ON TABLE public.dose_logs TO service_role;
GRANT ALL ON TABLE public.base_progress TO service_role;
GRANT ALL ON TABLE public.point_events TO service_role;
GRANT ALL ON TABLE public.stories TO service_role;
GRANT ALL ON TABLE public.app_roles TO service_role;
GRANT ALL ON TABLE public.orders TO service_role;
GRANT ALL ON TABLE public.webhook_events TO service_role;

INSERT INTO storage.buckets (id, name, public)
VALUES ('dose-proofs', 'dose-proofs', false)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'dose_proofs_select_own' AND polrelid = 'storage.objects'::regclass
  ) THEN
    CREATE POLICY dose_proofs_select_own ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = 'dose-proofs'
        AND split_part(name, '/', 1) = auth.uid()::text
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'dose_proofs_insert_own' AND polrelid = 'storage.objects'::regclass
  ) THEN
    CREATE POLICY dose_proofs_insert_own ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'dose-proofs'
        AND split_part(name, '/', 1) = auth.uid()::text
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'dose_proofs_update_own' AND polrelid = 'storage.objects'::regclass
  ) THEN
    CREATE POLICY dose_proofs_update_own ON storage.objects
      FOR UPDATE TO authenticated
      USING (
        bucket_id = 'dose-proofs'
        AND split_part(name, '/', 1) = auth.uid()::text
      )
      WITH CHECK (
        bucket_id = 'dose-proofs'
        AND split_part(name, '/', 1) = auth.uid()::text
      );
  END IF;
END $$;

COMMIT;

