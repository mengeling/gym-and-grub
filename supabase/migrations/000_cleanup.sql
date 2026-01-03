-- Cleanup script to drop all tables and policies
-- Use this ONLY in development to start fresh
-- WARNING: This will delete all data!

-- Drop policies first (they depend on tables)
DROP POLICY IF EXISTS "Users can view their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can create their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can update their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can delete their own workouts" ON workouts;

DROP POLICY IF EXISTS "Users can view exercises for their workouts" ON exercises;
DROP POLICY IF EXISTS "Users can create exercises for their workouts" ON exercises;
DROP POLICY IF EXISTS "Users can update exercises for their workouts" ON exercises;
DROP POLICY IF EXISTS "Users can delete exercises for their workouts" ON exercises;

DROP POLICY IF EXISTS "Users can view sets for their exercises" ON sets;
DROP POLICY IF EXISTS "Users can create sets for their exercises" ON sets;
DROP POLICY IF EXISTS "Users can update sets for their exercises" ON sets;
DROP POLICY IF EXISTS "Users can delete sets for their exercises" ON sets;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can create their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;

DROP POLICY IF EXISTS "Users can view their own workout templates" ON workout_templates;
DROP POLICY IF EXISTS "Users can create their own workout templates" ON workout_templates;
DROP POLICY IF EXISTS "Users can update their own workout templates" ON workout_templates;
DROP POLICY IF EXISTS "Users can delete their own workout templates" ON workout_templates;

DROP POLICY IF EXISTS "Users can view template exercises for their templates" ON template_exercises;
DROP POLICY IF EXISTS "Users can create template exercises for their templates" ON template_exercises;
DROP POLICY IF EXISTS "Users can update template exercises for their templates" ON template_exercises;
DROP POLICY IF EXISTS "Users can delete template exercises for their templates" ON template_exercises;

DROP POLICY IF EXISTS "Users can view their own body measurements" ON body_measurements;
DROP POLICY IF EXISTS "Users can create their own body measurements" ON body_measurements;
DROP POLICY IF EXISTS "Users can update their own body measurements" ON body_measurements;
DROP POLICY IF EXISTS "Users can delete their own body measurements" ON body_measurements;

DROP POLICY IF EXISTS "Anyone can view exercises" ON exercise_database;

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS template_exercises CASCADE;
DROP TABLE IF EXISTS workout_templates CASCADE;
DROP TABLE IF EXISTS sets CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS workouts CASCADE;
DROP TABLE IF EXISTS body_measurements CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS exercise_database CASCADE;

