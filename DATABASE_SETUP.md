# Database Setup Instructions

To set up the database for Gym and Grub, you need to run the initial schema migration in Supabase.

## Steps:

1. **Go to your Supabase project dashboard**: https://app.supabase.com

2. **Navigate to SQL Editor**:
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **If you have existing tables** (getting "already exists" errors):
   - First run `supabase/migrations/000_cleanup.sql` to drop existing tables
   - ⚠️ **WARNING**: This will delete all data! Only use in development.

4. **Run the initial schema migration**:
   - Copy the contents of `supabase/migrations/000_initial_schema.sql`
   - Paste it into the SQL editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify the tables were created**:
   - Go to "Table Editor" in the left sidebar
   - You should see the following tables:
     - `workouts`
     - `exercises`
     - `sets`
     - `subscriptions`
     - `workout_templates`
     - `template_exercises`
     - `body_measurements`
     - `exercise_database`

## What the migration does:

The initial schema creates all the necessary tables and includes:

- **Workout tracking**: `workouts`, `exercises`, `sets` tables with RPE, rest timers, muscle groups, and more
- **Subscriptions**: Payment and subscription management
- **Workout templates**: Save and reuse workout routines
- **Body measurements**: Track weight, body fat, and measurements
- **Exercise database**: Pre-defined exercises with search functionality (60+ exercises pre-populated)

All tables have Row Level Security (RLS) enabled, which means:
- Users can only see and modify their own data
- Each workout/template is automatically associated with the logged-in user's ID
- Data is completely isolated between users
- The exercise database is readable by all authenticated users

## Migration Strategy

- **Development/Pre-production**: Use the single `000_initial_schema.sql` file
- **Post-deployment**: After your first production deployment, create separate numbered migration files for any schema changes (e.g., `005_add_new_feature.sql`)

Once you run this migration, all features will be available!
