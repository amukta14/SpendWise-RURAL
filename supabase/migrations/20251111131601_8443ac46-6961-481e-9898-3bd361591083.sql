-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone_number TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'te', 'hi')),
  village TEXT,
  monthly_income DECIMAL(10, 2),
  profile_created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  icon TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('farming', 'household', 'business', 'general')),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_mode TEXT NOT NULL DEFAULT 'cash' CHECK (payment_mode IN ('cash', 'upi', 'credit', 'other')),
  notes TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create budgets table
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (cycle IN ('monthly', 'weekly')),
  amount DECIMAL(10, 2) NOT NULL,
  spent DECIMAL(10, 2) NOT NULL DEFAULT 0,
  remaining DECIMAL(10, 2) NOT NULL,
  warnings_triggered INTEGER NOT NULL DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create insights table
CREATE TABLE public.insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month DATE NOT NULL,
  top_category_id UUID REFERENCES public.categories(id),
  highest_expense DECIMAL(10, 2),
  total_spent DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_savings_estimate DECIMAL(10, 2),
  suggestions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for categories (readable by all authenticated users, only admins can modify)
CREATE POLICY "Categories are viewable by authenticated users"
  ON public.categories FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS Policies for expenses
CREATE POLICY "Users can view their own expenses"
  ON public.expenses FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own expenses"
  ON public.expenses FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own expenses"
  ON public.expenses FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for budgets
CREATE POLICY "Users can view their own budgets"
  ON public.budgets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own budgets"
  ON public.budgets FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own budgets"
  ON public.budgets FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for insights
CREATE POLICY "Users can view their own insights"
  ON public.insights FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own insights"
  ON public.insights FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default rural categories
INSERT INTO public.categories (name_en, name_te, name_hi, icon, type, is_default) VALUES
  ('Food & Groceries', 'ఆహారం & కిరాణా', 'भोजन और किराना', 'ShoppingBasket', 'household', true),
  ('Transport', 'రవాణా', 'यातायात', 'Bus', 'general', true),
  ('Farming Inputs', 'వ్యవసాయ పదార్థాలు', 'कृषि सामग्री', 'Tractor', 'farming', true),
  ('Seeds', 'విత్తనాలు', 'बीज', 'Sprout', 'farming', true),
  ('Fertilizer', 'ఎరువులు', 'उर्वरक', 'Leaf', 'farming', true),
  ('Livestock Feed', 'పశువుల ఆహారం', 'पशु चारा', 'Wheat', 'farming', true),
  ('Medical', 'వైద్యం', 'चिकित्सा', 'Heart', 'household', true),
  ('Education', 'విద్య', 'शिक्षा', 'GraduationCap', 'household', true),
  ('Water & Motor Repair', 'నీరు & మోటార్ మరమ్మత్తు', 'पानी और मोटर मरम्मत', 'Droplet', 'farming', true),
  ('Utilities', 'యుటిలిటీస్', 'उपयोगिताओं', 'Zap', 'household', true),
  ('House Rent', 'ఇంటి అద్దె', 'घर का किराया', 'Home', 'household', true),
  ('Livestock', 'పశువులు', 'पशुधन', 'Cow', 'farming', true),
  ('Miscellaneous', 'ఇతరాలు', 'विविध', 'MoreHorizontal', 'general', true);

-- Create indexes for better performance
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_expenses_date ON public.expenses(date);
CREATE INDEX idx_expenses_category_id ON public.expenses(category_id);
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_insights_user_id ON public.insights(user_id);
