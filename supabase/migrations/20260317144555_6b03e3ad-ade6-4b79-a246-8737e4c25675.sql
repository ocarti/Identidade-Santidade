DROP POLICY IF EXISTS "Anyone can view products" ON public.products;

CREATE POLICY "Admins can view products"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));