-- Meal Reminders
CREATE TABLE IF NOT EXISTS public.meal_reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE,
    reminder_time TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('cardio', 'strength', 'yoga', 'hiit', 'flexibility')),
    muscle_group TEXT,
    duration INTEGER DEFAULT 10,
    calories_burn INTEGER DEFAULT 0,
    difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    equipment TEXT[] DEFAULT '{}',
    instructions TEXT,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meditations
CREATE TABLE IF NOT EXISTS public.meditations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('guided', 'breathing', 'mantra', 'mindfulness', 'body_scan', 'loving_kindness')),
    duration INTEGER DEFAULT 5,
    benefits TEXT[] DEFAULT '{}',
    instructions TEXT,
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Symptom Analyses
CREATE TABLE IF NOT EXISTS public.symptom_analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    symptoms TEXT[],
    severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
    duration TEXT,
    possible_conditions TEXT[],
    home_remedies TEXT[],
    doctor_advice TEXT,
    emergency BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS weight INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT;

-- Add RLS Policies
ALTER TABLE public.meal_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meditations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meal reminders" ON public.meal_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal reminders" ON public.meal_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meal reminders" ON public.meal_reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meal reminders" ON public.meal_reminders FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own exercises" ON public.exercises FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exercises" ON public.exercises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exercises" ON public.exercises FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exercises" ON public.exercises FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own meditations" ON public.meditations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meditations" ON public.meditations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meditations" ON public.meditations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meditations" ON public.meditations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own symptom analyses" ON public.symptom_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own symptom analyses" ON public.symptom_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own symptom analyses" ON public.symptom_analyses FOR DELETE USING (auth.uid() = user_id);
