-- Add UPDATE policy for orders table (edge functions with service_role bypass RLS,
-- but this ensures correctness if auth context changes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Service can update orders'
  ) THEN
    EXECUTE 'CREATE POLICY "Service can update orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true)';
  END IF;
END $$;
