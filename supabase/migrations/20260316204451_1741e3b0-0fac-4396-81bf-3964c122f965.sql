-- Add columns for multi-registration support
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS order_id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS qr_code_token uuid DEFAULT gen_random_uuid() UNIQUE,
  ADD COLUMN IF NOT EXISTS transfer_token uuid DEFAULT gen_random_uuid() UNIQUE,
  ADD COLUMN IF NOT EXISTS buyer_email text;

-- Index for order lookups
CREATE INDEX IF NOT EXISTS idx_registrations_order_id ON public.registrations(order_id);

-- Index for transfer token lookups
CREATE INDEX IF NOT EXISTS idx_registrations_transfer_token ON public.registrations(transfer_token);

-- Index for QR code validation
CREATE INDEX IF NOT EXISTS idx_registrations_qr_code_token ON public.registrations(qr_code_token);