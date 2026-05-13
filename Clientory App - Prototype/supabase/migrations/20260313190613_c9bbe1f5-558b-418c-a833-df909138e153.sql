-- Create beta waitlist leads table
CREATE TABLE public.beta_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT NOT NULL,
  website TEXT NOT NULL,
  linkedin TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.beta_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public lead capture form)
CREATE POLICY "Anyone can submit a beta lead"
  ON public.beta_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);