CREATE TABLE public.melhor_envio_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.melhor_envio_tokens ENABLE ROW LEVEL SECURITY;

-- No public access - only edge functions with service role can access
CREATE POLICY "No public access" ON public.melhor_envio_tokens FOR ALL USING (false);