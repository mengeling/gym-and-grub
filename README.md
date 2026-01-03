# Gym and Grub - Gym Logbook & Calorie Tracker

A comprehensive health tracking application built with Next.js, featuring a gym logbook, calorie tracker, and Lightning payment integration powered by the Bark SDK from second.tech.

## Features

### 🏋️ Gym Logbook
- Create and manage workout sessions
- Track exercises with sets, reps, and weights
- Mark sets as complete/pending
- View workout history
- Comprehensive workout tracking interface

### 🍎 Calorie Tracker
- Log daily meals and snacks
- Track calories, protein, carbs, and fats
- Set daily calorie targets
- Visual progress indicators
- Macro nutrient breakdown

### ⚡ Premium Features (Bark SDK Integration)
- Monthly and yearly subscription plans
- Lightning Network payments via Bark SDK
- Secure payment processing
- Subscription management

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication & Database**: Supabase
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS (v3)
- **Icons**: Lucide React
- **Payments**: Bark SDK (second.tech)
- **TypeScript**: Full type safety

## Features

### 🔐 Authentication
- Email/password authentication via Supabase
- Protected routes
- Secure session management
- Sign up and sign in pages

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works fine)
- Bark CLI (for payment processing - optional for development)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd gym-and-grub
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings > API
   - Copy your Project URL and anon/public key
   - Create a `.env.local` file in the root directory:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   ```
   - **Set up the database tables**: See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for instructions on running the SQL migration to create the required tables

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.
   - You'll be redirected to the login page
   - Create an account to get started!

## Bark SDK Setup (for Payments)

To enable payment functionality, you'll need to set up the Bark SDK:

1. **Install Bark CLI** (if not already installed):
```bash
curl https://gitlab.com/ark-bitcoin/bark/releases/download/bark-0.1.0-beta.4/bark-0.1.0-beta.4-linux-x86_64 --output bark
chmod +x bark
sudo cp bark /usr/local/bin/
```

2. **Create a wallet** (for signet/testnet):
```bash
bark create --signet --ark ark.signet.2nd.dev --esplora esplora.signet.2nd.dev
```

3. **Configure API routes** to use your bark instance:
   - Update `app/api/payment/create-invoice/route.ts` with your bark server endpoint
   - Update `app/api/payment/status/[paymentId]/route.ts` with your payment status checking logic

### Payment Integration Notes

The payment system is set up to work with Bark SDK. The API routes include:
- Invoice creation endpoint (`/api/payment/create-invoice`)
- Payment status checking endpoint (`/api/payment/status/[paymentId]`)

For production use:
- Replace mock invoices with real Bark SDK integration
- Set up webhook handlers for payment confirmations
- Implement proper database storage for payment records
- Add authentication and user management
- Use real-time exchange rates for USD to sats conversion

## Project Structure

```
gym-and-grub/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   └── payment/         # Payment endpoints
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── gym-logbook.tsx      # Gym logbook feature
│   ├── calorie-tracker.tsx  # Calorie tracker feature
│   └── payment.tsx          # Payment component
├── lib/                     # Utility functions
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # Helper functions
└── components.json          # shadcn configuration
```

## Development

The app uses:
- **shadcn/ui** for UI components
- **Tailwind CSS** for styling
- **TypeScript** for type safety
- **React Hooks** for state management

### Adding New shadcn Components

To add new shadcn components, you can use the shadcn CLI or manually add them to `components/ui/`.

## Features in Detail

### Gym Logbook
- Create multiple workouts
- Add exercises to workouts
- Track sets, reps, and weights per exercise
- Mark individual sets as complete
- View workout history with detailed breakdowns

### Calorie Tracker
- Log meals throughout the day
- Track calories and macronutrients (protein, carbs, fat)
- Set customizable daily calorie targets
- Visual progress bars showing calorie consumption
- Daily meal log with time stamps

### Premium Subscription
- Monthly ($9.99) and Yearly ($99.99) plans
- Lightning Network payment processing
- Real-time payment status updates
- Secure invoice generation

## Future Enhancements

- User authentication and profiles
- Data persistence with database
- Progress charts and analytics
- Meal database integration
- Workout templates
- Social features (share workouts)
- Mobile app version
- Export data (CSV, PDF)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

