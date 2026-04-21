-- Habilita extensoes necessarias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove job anterior se existir (idempotente)
DO $$
BEGIN
  PERFORM cron.unschedule('abandoned-cart-email-daily');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Agenda chamada diaria as 13h UTC (10h Brasilia) para a edge function
SELECT cron.schedule(
  'abandoned-cart-email-daily',
  '0 13 * * *',
  $$
  SELECT net.http_post(
    url := 'https://tjbydqkbcoqhmxitqazq.supabase.co/functions/v1/abandoned-cart-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqYnlkcWtiY29xaG14aXRxYXpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwODc2NTUsImV4cCI6MjA4MTY2MzY1NX0.9CtHvefB0yNuzsMdGFB5UL0EsZtN6SzCoccJTJrWfu8"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);