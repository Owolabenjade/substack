-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT,
  display_name TEXT,
  is_merchant BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger for auto profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create subscription_plans table for merchant plans
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id_onchain INTEGER,
  name TEXT NOT NULL,
  description TEXT,
  price_stx NUMERIC(18, 6) NOT NULL,
  interval_blocks INTEGER NOT NULL DEFAULT 4320,
  category TEXT NOT NULL DEFAULT 'General',
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscriber_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(2, 1) DEFAULT 4.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Plans policies
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Merchants can view own plans" ON public.subscription_plans
  FOR SELECT USING (merchant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Merchants can insert own plans" ON public.subscription_plans
  FOR INSERT WITH CHECK (merchant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Merchants can update own plans" ON public.subscription_plans
  FOR UPDATE USING (merchant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Merchants can delete own plans" ON public.subscription_plans
  FOR DELETE USING (merchant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  start_block INTEGER,
  last_charged_block INTEGER,
  next_charge_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subscriber_id, plan_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (subscriber_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (subscriber_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (subscriber_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own subscriptions" ON public.subscriptions
  FOR DELETE USING (subscriber_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Merchants can view their plan subscriptions
CREATE POLICY "Merchants can view plan subscriptions" ON public.subscriptions
  FOR SELECT USING (
    plan_id IN (
      SELECT sp.id FROM public.subscription_plans sp
      WHERE sp.merchant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create vault_authorizations table
CREATE TABLE public.vault_authorizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  max_per_period NUMERIC(18, 6) NOT NULL,
  period_length_blocks INTEGER NOT NULL,
  spent_this_period NUMERIC(18, 6) NOT NULL DEFAULT 0,
  period_start_block INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subscriber_id, merchant_id)
);

-- Enable RLS
ALTER TABLE public.vault_authorizations ENABLE ROW LEVEL SECURITY;

-- Authorizations policies
CREATE POLICY "Users can view own authorizations" ON public.vault_authorizations
  FOR SELECT USING (subscriber_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own authorizations" ON public.vault_authorizations
  FOR INSERT WITH CHECK (subscriber_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own authorizations" ON public.vault_authorizations
  FOR UPDATE USING (subscriber_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own authorizations" ON public.vault_authorizations
  FOR DELETE USING (subscriber_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Merchants can view authorizations for them
CREATE POLICY "Merchants can view their authorizations" ON public.vault_authorizations
  FOR SELECT USING (merchant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE TRIGGER update_authorizations_updated_at
  BEFORE UPDATE ON public.vault_authorizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();