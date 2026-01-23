-- Create user_activities table to track important user actions
CREATE TABLE IF NOT EXISTS public.user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_type text NOT NULL, -- 'add_to_cart', 'checkout_started', 'checkout_completed', 'added_favorite'
  description text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user_activities
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Users can insert their own activities
CREATE POLICY "Users can create their own activities" 
ON public.user_activities FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all activities
CREATE POLICY "Admins can view all activities" 
ON public.user_activities FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own activities
CREATE POLICY "Users can view their own activities" 
ON public.user_activities FOR SELECT 
USING (auth.uid() = user_id);

-- Add policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add policy for admins to view all orders
CREATE POLICY "Admins can view all orders" 
ON public.orders FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add policy for admins to view all order_items
CREATE POLICY "Admins can view all order_items" 
ON public.order_items FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add policy for admins to view all cart_items
CREATE POLICY "Admins can view all cart_items" 
ON public.cart_items FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add policy for admins to view all products (including inactive)
CREATE POLICY "Admins can view all products including inactive" 
ON public.products FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));