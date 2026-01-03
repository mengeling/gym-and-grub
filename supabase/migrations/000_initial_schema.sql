-- Initial database schema for Gym and Grub
-- This combines all migrations into a single initial schema
-- Use separate migrations only after first deployment

-- ============================================
-- WORKOUTS, EXERCISES, AND SETS
-- ============================================

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  muscle_groups TEXT[],
  superset_group INTEGER,
  exercise_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sets table
CREATE TABLE IF NOT EXISTS sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  reps INTEGER NOT NULL,
  weight DECIMAL(10, 2) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  rpe DECIMAL(3, 1) CHECK (rpe IS NULL OR (rpe >= 0 AND rpe <= 10)),
  rest_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL, -- 'monthly' or 'yearly'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'expired', 'cancelled'
  amount DECIMAL(10, 2) NOT NULL,
  payment_id TEXT NOT NULL UNIQUE, -- The payment ID from our payment system
  invoice TEXT, -- Lightning invoice string
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WORKOUT TEMPLATES
-- ============================================

-- Create workout templates table
CREATE TABLE IF NOT EXISTS workout_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create template exercises table
CREATE TABLE IF NOT EXISTS template_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  muscle_groups TEXT[],
  superset_group INTEGER,
  exercise_order INTEGER DEFAULT 0,
  default_sets INTEGER DEFAULT 3,
  default_reps INTEGER DEFAULT 10,
  default_weight DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BODY MEASUREMENTS
-- ============================================

-- Create body measurements table
CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  weight DECIMAL(6, 2), -- in lbs or kg
  body_fat_percentage DECIMAL(5, 2), -- percentage
  measurements JSONB, -- Store flexible measurements like chest, waist, arms, etc.
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EXERCISE DATABASE (PRE-DEFINED EXERCISES)
-- ============================================

-- Create exercise database table (predefined exercises)
CREATE TABLE IF NOT EXISTS exercise_database (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- e.g., "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"
  muscle_groups TEXT[] NOT NULL,
  equipment TEXT, -- e.g., "Barbell", "Dumbbell", "Bodyweight", "Machine", "Cable"
  instructions TEXT, -- Optional instructions/notes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_database ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - WORKOUTS
-- ============================================

CREATE POLICY "Users can view their own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - EXERCISES
-- ============================================

CREATE POLICY "Users can view exercises for their workouts"
  ON exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create exercises for their workouts"
  ON exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update exercises for their workouts"
  ON exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete exercises for their workouts"
  ON exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES - SETS
-- ============================================

CREATE POLICY "Users can view sets for their exercises"
  ON sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = sets.exercise_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sets for their exercises"
  ON sets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = sets.exercise_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sets for their exercises"
  ON sets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = sets.exercise_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sets for their exercises"
  ON sets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = sets.exercise_id
      AND workouts.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES - SUBSCRIPTIONS
-- ============================================

CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - WORKOUT TEMPLATES
-- ============================================

CREATE POLICY "Users can view their own workout templates"
  ON workout_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workout templates"
  ON workout_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout templates"
  ON workout_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout templates"
  ON workout_templates FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - TEMPLATE EXERCISES
-- ============================================

CREATE POLICY "Users can view template exercises for their templates"
  ON template_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_templates
      WHERE workout_templates.id = template_exercises.template_id
      AND workout_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create template exercises for their templates"
  ON template_exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_templates
      WHERE workout_templates.id = template_exercises.template_id
      AND workout_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update template exercises for their templates"
  ON template_exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_templates
      WHERE workout_templates.id = template_exercises.template_id
      AND workout_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete template exercises for their templates"
  ON template_exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_templates
      WHERE workout_templates.id = template_exercises.template_id
      AND workout_templates.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES - BODY MEASUREMENTS
-- ============================================

CREATE POLICY "Users can view their own body measurements"
  ON body_measurements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own body measurements"
  ON body_measurements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own body measurements"
  ON body_measurements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own body measurements"
  ON body_measurements FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - EXERCISE DATABASE
-- ============================================

CREATE POLICY "Anyone can view exercises"
  ON exercise_database FOR SELECT
  USING (true);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS workouts_user_id_idx ON workouts(user_id);
CREATE INDEX IF NOT EXISTS exercises_workout_id_idx ON exercises(workout_id);
CREATE INDEX IF NOT EXISTS exercises_workout_id_order_idx ON exercises(workout_id, exercise_order);
CREATE INDEX IF NOT EXISTS sets_exercise_id_idx ON sets(exercise_id);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);
CREATE INDEX IF NOT EXISTS subscriptions_payment_id_idx ON subscriptions(payment_id);
CREATE INDEX IF NOT EXISTS workout_templates_user_id_idx ON workout_templates(user_id);
CREATE INDEX IF NOT EXISTS template_exercises_template_id_idx ON template_exercises(template_id);
CREATE INDEX IF NOT EXISTS body_measurements_user_id_idx ON body_measurements(user_id);
CREATE INDEX IF NOT EXISTS body_measurements_date_idx ON body_measurements(date);
CREATE INDEX IF NOT EXISTS exercise_database_name_idx ON exercise_database(name);
CREATE INDEX IF NOT EXISTS exercise_database_category_idx ON exercise_database(category);
CREATE INDEX IF NOT EXISTS exercise_database_muscle_groups_idx ON exercise_database USING GIN(muscle_groups);

-- ============================================
-- EXERCISE DATABASE - INITIAL DATA
-- ============================================

INSERT INTO exercise_database (name, category, muscle_groups, equipment) VALUES
-- Chest Exercises
('Bench Press', 'Chest', ARRAY['Chest', 'Triceps', 'Shoulders'], 'Barbell'),
('Dumbbell Bench Press', 'Chest', ARRAY['Chest', 'Triceps', 'Shoulders'], 'Dumbbell'),
('Incline Bench Press', 'Chest', ARRAY['Chest', 'Triceps', 'Shoulders'], 'Barbell'),
('Incline Dumbbell Press', 'Chest', ARRAY['Chest', 'Triceps', 'Shoulders'], 'Dumbbell'),
('Decline Bench Press', 'Chest', ARRAY['Chest', 'Triceps'], 'Barbell'),
('Push-ups', 'Chest', ARRAY['Chest', 'Triceps', 'Shoulders'], 'Bodyweight'),
('Dumbbell Flyes', 'Chest', ARRAY['Chest'], 'Dumbbell'),
('Cable Crossover', 'Chest', ARRAY['Chest'], 'Cable'),
('Chest Dips', 'Chest', ARRAY['Chest', 'Triceps'], 'Bodyweight'),
('Pec Deck', 'Chest', ARRAY['Chest'], 'Machine'),

-- Back Exercises
('Deadlift', 'Back', ARRAY['Back', 'Legs', 'Glutes', 'Hamstrings'], 'Barbell'),
('Barbell Row', 'Back', ARRAY['Back', 'Biceps'], 'Barbell'),
('Dumbbell Row', 'Back', ARRAY['Back', 'Biceps'], 'Dumbbell'),
('Pull-ups', 'Back', ARRAY['Back', 'Biceps', 'Lats'], 'Bodyweight'),
('Chin-ups', 'Back', ARRAY['Back', 'Biceps', 'Lats'], 'Bodyweight'),
('Lat Pulldown', 'Back', ARRAY['Back', 'Lats', 'Biceps'], 'Machine'),
('Cable Row', 'Back', ARRAY['Back', 'Biceps'], 'Cable'),
('T-Bar Row', 'Back', ARRAY['Back', 'Biceps'], 'Barbell'),
('Face Pulls', 'Back', ARRAY['Back', 'Shoulders', 'Traps'], 'Cable'),
('Shrugs', 'Back', ARRAY['Traps'], 'Barbell'),
('Romanian Deadlift', 'Back', ARRAY['Back', 'Hamstrings', 'Glutes'], 'Barbell'),

-- Shoulder Exercises
('Overhead Press', 'Shoulders', ARRAY['Shoulders', 'Triceps'], 'Barbell'),
('Dumbbell Shoulder Press', 'Shoulders', ARRAY['Shoulders', 'Triceps'], 'Dumbbell'),
('Lateral Raises', 'Shoulders', ARRAY['Shoulders'], 'Dumbbell'),
('Front Raises', 'Shoulders', ARRAY['Shoulders'], 'Dumbbell'),
('Rear Delt Flyes', 'Shoulders', ARRAY['Shoulders'], 'Dumbbell'),
('Upright Row', 'Shoulders', ARRAY['Shoulders', 'Traps'], 'Barbell'),
('Arnold Press', 'Shoulders', ARRAY['Shoulders', 'Triceps'], 'Dumbbell'),
('Cable Lateral Raise', 'Shoulders', ARRAY['Shoulders'], 'Cable'),

-- Bicep Exercises
('Barbell Curl', 'Arms', ARRAY['Biceps'], 'Barbell'),
('Dumbbell Curl', 'Arms', ARRAY['Biceps'], 'Dumbbell'),
('Hammer Curl', 'Arms', ARRAY['Biceps', 'Forearms'], 'Dumbbell'),
('Cable Curl', 'Arms', ARRAY['Biceps'], 'Cable'),
('Preacher Curl', 'Arms', ARRAY['Biceps'], 'Barbell'),
('Concentration Curl', 'Arms', ARRAY['Biceps'], 'Dumbbell'),

-- Tricep Exercises
('Close-Grip Bench Press', 'Arms', ARRAY['Triceps', 'Chest'], 'Barbell'),
('Tricep Dips', 'Arms', ARRAY['Triceps'], 'Bodyweight'),
('Overhead Tricep Extension', 'Arms', ARRAY['Triceps'], 'Dumbbell'),
('Tricep Pushdown', 'Arms', ARRAY['Triceps'], 'Cable'),
('Diamond Push-ups', 'Arms', ARRAY['Triceps', 'Chest'], 'Bodyweight'),
('Skull Crushers', 'Arms', ARRAY['Triceps'], 'Barbell'),

-- Leg Exercises
('Squat', 'Legs', ARRAY['Legs', 'Quadriceps', 'Glutes'], 'Barbell'),
('Front Squat', 'Legs', ARRAY['Legs', 'Quadriceps', 'Glutes'], 'Barbell'),
('Bulgarian Split Squat', 'Legs', ARRAY['Quadriceps', 'Glutes'], 'Dumbbell'),
('Leg Press', 'Legs', ARRAY['Quadriceps', 'Glutes'], 'Machine'),
('Leg Extension', 'Legs', ARRAY['Quadriceps'], 'Machine'),
('Leg Curl', 'Legs', ARRAY['Hamstrings'], 'Machine'),
('Walking Lunge', 'Legs', ARRAY['Quadriceps', 'Glutes'], 'Dumbbell'),
('Reverse Lunge', 'Legs', ARRAY['Quadriceps', 'Glutes'], 'Dumbbell'),
('Calf Raise', 'Legs', ARRAY['Calves'], 'Machine'),
('Standing Calf Raise', 'Legs', ARRAY['Calves'], 'Barbell'),

-- Glute Exercises
('Hip Thrust', 'Legs', ARRAY['Glutes', 'Hamstrings'], 'Barbell'),
('Glute Bridge', 'Legs', ARRAY['Glutes', 'Hamstrings'], 'Bodyweight'),

-- Core Exercises
('Plank', 'Core', ARRAY['Abs'], 'Bodyweight'),
('Sit-ups', 'Core', ARRAY['Abs'], 'Bodyweight'),
('Crunches', 'Core', ARRAY['Abs'], 'Bodyweight'),
('Russian Twists', 'Core', ARRAY['Abs'], 'Bodyweight'),
('Leg Raises', 'Core', ARRAY['Abs'], 'Bodyweight'),
('Dead Bug', 'Core', ARRAY['Abs'], 'Bodyweight'),
('Mountain Climbers', 'Core', ARRAY['Abs'], 'Bodyweight'),
('Ab Wheel Rollout', 'Core', ARRAY['Abs'], 'Bodyweight'),
('Cable Crunch', 'Core', ARRAY['Abs'], 'Cable')

ON CONFLICT (name) DO NOTHING;

