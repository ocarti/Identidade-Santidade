
-- 1. Drop the unrestricted public INSERT policies
DROP POLICY IF EXISTS "Anyone can insert registrations" ON public.registrations;
DROP POLICY IF EXISTS "Anyone can insert sales" ON public.sales;

-- 2. Replace with service-role-only insert (edge functions use service role key)
-- No public INSERT policy needed since edge functions bypass RLS with service role

-- 3. Harden has_role function to only allow checking own role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
      AND role = _role
      AND _user_id = auth.uid()
  )
$$;
