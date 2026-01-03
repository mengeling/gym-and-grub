# Database Setup Instructions

To enable workout persistence, you need to create the database tables in Supabase.

## Steps:

1. **Go to your Supabase project dashboard**: https://app.supabase.com

2. **Navigate to SQL Editor**:
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the migration**:
   - Copy the contents of `supabase/migrations/001_create_workouts_tables.sql`
   - Paste it into the SQL editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify the tables were created**:
   - Go to "Table Editor" in the left sidebar
   - You should see three new tables: `workouts`, `exercises`, and `sets`

## What the migration does:

- Creates three tables: `workouts`, `exercises`, and `sets`
- Sets up relationships between tables (foreign keys)
- Enables Row Level Security (RLS) to ensure users can only access their own data
- Creates policies that allow users to:
  - View their own workouts, exercises, and sets
  - Create new workouts, exercises, and sets
  - Update their own workouts, exercises, and sets
  - Delete their own workouts, exercises, and sets

## Security:

All tables have Row Level Security enabled, which means:
- Users can only see and modify their own data
- Each workout is automatically associated with the logged-in user's ID
- Data is completely isolated between users

Once you run this migration, your workouts will be saved to the database and will persist across page refreshes!

