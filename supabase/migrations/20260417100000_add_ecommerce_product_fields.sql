-- Extend products table for e-commerce catalog
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS imagem_url text,
  ADD COLUMN IF NOT EXISTS estoque integer,
  ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;

-- Allow public read of active products
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'products_public_read') THEN
    CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (ativo = true);
  END IF;
END $$;
