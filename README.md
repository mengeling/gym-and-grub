# Gym and Grub - Complete Fitness & Nutrition Tracker

A comprehensive health and fitness tracking application that combines the power of **Strong** (gym tracking) and **Nutritionix** (nutrition tracking) into one seamless platform. Built with Next.js, Supabase, and Lightning Network payments.

## 🎯 Overview

Gym and Grub is your all-in-one solution for tracking workouts, nutrition, and body measurements. Whether you're a bodybuilder, powerlifter, athlete, or fitness enthusiast, this app helps you reach your goals with detailed tracking and analytics.

## ✨ Features

### 🏋️ Gym Logbook (Strong-inspired)
- **Advanced Workout Tracking**
  - Create and log unlimited workout sessions
  - Track exercises with sets, reps, weights, RPE, and rest times
  - Built-in rest timer between sets
  - Exercise notes and custom ordering
  - Superset grouping for advanced training

- **Exercise Database**
  - 60+ pre-loaded exercises across all muscle groups
  - Organized by category (Chest, Back, Shoulders, Arms, Legs, Core)
  - Search and filter by name, category, muscle group, and equipment
  - Add custom exercises

- **Workout Templates**
  - Save workouts as reusable templates
  - Quick-start workouts from saved templates
  - Edit and delete templates
  - Template exercises with default sets/reps/weights

- **Performance Analytics**
  - Calculate estimated 1RM using Epley formula
  - Track total volume (sets × reps × weight)
  - Warmup set calculator with progressive loads
  - View completed sets and exercise statistics

- **Data Export**
  - Export workouts to CSV format
  - Full workout history with all details

### 🍎 Nutrition Tracker (Nutritionix-inspired)
- **Comprehensive Food Database**
  - 100+ verified foods with complete nutritional information
  - Foods organized by category (Fruits, Vegetables, Protein, Grains, Dairy, etc.)
  - Search by food name, brand, or category
  - Support for branded foods and custom entries

- **Meal Logging**
  - Log meals by type (Breakfast, Lunch, Dinner, Snack)
  - Search food database for quick logging
  - Adjust serving sizes with multipliers
  - Manual entry for custom foods
  - Track calories and macros (protein, carbs, fat, fiber, sugar, sodium)

- **Daily Nutrition Goals**
  - Customizable calorie and macro targets
  - Real-time progress tracking
  - Visual progress bars for all macros
  - Meal history with timestamps
  - Daily nutrition summaries

- **Nutrition Analytics**
  - Track total calories consumed vs goal
  - Monitor protein, carbs, and fat intake
  - See remaining calories at a glance
  - Color-coded progress indicators

### 📊 Body Measurements & Progress
- **Comprehensive Body Tracking**
  - Weight tracking with trend analysis
  - Body fat percentage monitoring
  - Body measurements (chest, waist, hips, arms, thighs, calves)
  - Date-based measurement history

- **Progress Visualization**
  - Interactive weight and body fat charts
  - View trends over time
  - Compare current vs previous measurements
  - Track changes and progress

- **Measurement History**
  - Complete log of all measurements
  - Add notes to each entry
  - Delete old entries
  - Filter and sort by date

### ⚡ Premium Features
- **Lightning Network Subscriptions**
  - Monthly ($9.99/month) and Yearly ($99.99/year) plans
  - Pay with Bitcoin via Lightning Network
  - Powered by Bark SDK from second.tech
  - QR code for easy mobile payments
  - Real-time payment status tracking

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router) - React framework with SSR
- **React 19.2** - UI library
- **TypeScript 5.9** - Type safety and better DX
- **Tailwind CSS 3.4** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible UI components
- **Lucide React** - Icon system
- **Recharts 3.6** - Data visualization and charts

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication & user management
- **Server-side rendering** with Next.js

### Payments
- **Bark SDK** - Lightning Network payment processing
- **Bitcoin Lightning** - Fast, low-fee payments
- **QR Codes** - Mobile-friendly payment scanning

### State Management
- **React Context API** - Auth state
- **React Hooks** - Component state
- **Supabase Real-time** - Database sync

## 📁 Database Schema

### Workout Tables
- `workouts` - User workout sessions
- `exercises` - Exercises within workouts
- `sets` - Individual sets with reps/weight/RPE
- `workout_templates` - Saved workout templates
- `template_exercises` - Exercises in templates
- `exercise_database` - 60+ pre-populated exercises

### Nutrition Tables
- `food_database` - 100+ foods with nutritional info
- `meals` - User meal logs
- `daily_nutrition` - Daily totals and goals
- `nutrition_preferences` - User nutrition settings
- `meal_templates` - Saved meal templates
- `meal_template_items` - Foods in meal templates

### Progress Tables
- `body_measurements` - Weight, body fat, measurements
- `subscriptions` - Payment and subscription records

All tables have **Row Level Security (RLS)** enabled, ensuring users can only access their own data.

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Supabase account** (free tier works)
- **Bark CLI** (optional, for payment testing)

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd gym-and-grub
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up Supabase:**
   - Create a project at [supabase.com](https://supabase.com)
   - Go to Project Settings > API
   - Copy your Project URL and anon key
   - Create `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
   ```

4. **Set up the database:**
   - See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions
   - Run the migrations in `supabase/migrations/`:
     - `000_initial_schema.sql` - Core tables (workouts, exercises, etc.)
     - `001_nutrition_schema.sql` - Nutrition tables
     - `002_populate_food_database.sql` - Populate food database

5. **Run the development server:**
```bash
npm run dev
```

6. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Sign up for a new account
   - Start tracking your fitness journey!

## 🏗️ Project Structure

```
gym-and-grub/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── payment/              # Payment endpoints
│   │   │   ├── create-invoice/   # Create Lightning invoice
│   │   │   └── status/           # Check payment status
│   │   └── subscription/         # Subscription management
│   ├── login/                    # Login page
│   ├── signup/                   # Signup page
│   ├── layout.tsx                # Root layout with auth
│   ├── page.tsx                  # Main dashboard
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── auth/                     # Auth components
│   ├── gym-logbook.tsx           # Gym tracking (1683 lines)
│   ├── calorie-tracker.tsx       # Nutrition tracking
│   ├── body-measurements.tsx     # Body stats tracking
│   ├── payment.tsx               # Premium subscriptions
│   ├── profile-dialog.tsx        # User profile
│   └── user-account-menu.tsx     # Account dropdown
├── contexts/
│   └── auth-context.tsx          # Auth state management
├── lib/
│   ├── supabase/                 # Supabase clients
│   ├── types.ts                  # TypeScript types
│   └── utils.ts                  # Helper functions (1RM, volume, etc.)
├── supabase/
│   └── migrations/               # Database migrations
│       ├── 000_initial_schema.sql
│       ├── 001_nutrition_schema.sql
│       └── 002_populate_food_database.sql
└── middleware.ts                 # Auth middleware
```

## 🎨 Key Components

### Gym Logbook
The most comprehensive component with 1683 lines of code, featuring:
- Full workout CRUD operations
- Exercise database integration
- Set tracking with RPE and rest timers
- Template management
- 1RM calculations and volume tracking
- CSV export functionality

### Nutrition Tracker
Complete nutrition tracking with:
- Food database search (100+ foods)
- Meal logging with serving sizes
- Real-time macro tracking
- Daily goals and progress
- Meal history and analytics

### Body Measurements
Track your physical progress:
- Weight and body fat trends
- Body measurement tracking
- Progress charts and visualization
- Historical data management

## 🔒 Security Features

- **Row Level Security (RLS)** on all database tables
- **Server-side authentication** with Supabase
- **Protected API routes** with middleware
- **Secure session management**
- **User data isolation** - users can only access their own data

## 📊 Data Privacy

- All user data is private and isolated
- RLS policies ensure data security
- No data sharing between users
- Secure authentication flow
- HTTPS-only in production

## 🌟 Future Enhancements

- **Analytics Dashboard** - Advanced charts and insights
- **Social Features** - Share workouts and meals
- **Mobile App** - Native iOS/Android apps
- **Barcode Scanning** - Quick food logging
- **Recipe Builder** - Create custom recipes
- **Workout Programs** - Pre-built training programs
- **AI Recommendations** - Personalized suggestions
- **Progress Photos** - Visual progress tracking
- **Integration** - Sync with Apple Health, Fitbit, etc.
- **Export** - PDF reports and data export

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- **Strong App** - Inspiration for gym tracking features
- **Nutritionix** - Inspiration for nutrition tracking
- **shadcn/ui** - Beautiful UI components
- **Supabase** - Amazing backend platform
- **Bark SDK** - Lightning Network payments
- **second.tech** - Bitcoin infrastructure

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Built with ❤️ for the fitness community**
