# AI Fitness & Nutrition Planner

A comprehensive Next.js application for fitness and nutrition planning with AI-powered features including chatbot assistance, meal planning, and workout generation.

## 🚀 Features

### Core Features
- **AI Chat Assistant**: Interactive chatbot powered by Gemini API for personalized fitness advice
- **AI Chef**: Generate detailed meal plans with recipes and macro breakdowns
- **Personal Profile**: Save and manage your workout plans and meal plans
- **Plan Management**: Save AI-generated plans and access them anytime

### Technical Features
- User authentication with Supabase
- Responsive design with dark/light mode toggle
- Real-time chat interface with animations
- Plan saving and retrieval system
- Row-level security for user data

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages (login/signup)
│   ├── chat/              # AI chat interface
│   ├── chef/              # AI meal planning page
│   ├── profile/           # User profile and saved plans
│   └── api/               # API routes
│       ├── auth/          # Authentication endpoints
│       ├── generate-meal-plan/    # Meal plan generation
│       └── generate-workout-plan/ # Workout plan generation
├── components/            # Reusable React components
│   ├── ChatBox.tsx        # Main chat interface
│   ├── MealPlanCard.tsx   # Meal plan display component
│   ├── WorkoutPlanCard.tsx # Workout plan display component
│   ├── ProfileTabs.tsx    # Profile navigation tabs
│   ├── SavePlanButton.tsx # Plan saving functionality
│   └── ...               # Other UI components
├── lib/                  # Utility functions and configurations
│   └── supabase.ts       # Supabase client configuration
└── middleware.ts         # Next.js middleware for auth
```

## 🗄️ Database Schema

### Tables
- **meal_plans**: Stores user meal plans with ingredients and recipes
- **workout_plans**: Stores user workout plans with exercises and splits

### Security
- Row Level Security (RLS) enabled
- Users can only access their own data
- Automatic user association via auth.uid()

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Gemini API key

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd gym_chatbot
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API (for existing RAG system)
NEXT_PUBLIC_API_URL=your_backend_api_url

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Set up the database:**
Run the SQL migration in your Supabase dashboard:
```bash
# Execute the contents of supabase_migration.sql in your Supabase SQL editor
```

5. **Run the development server:**
```bash
npm run dev
```

6. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the migration SQL to create tables
3. Enable Row Level Security
4. Get your project URL and anon key

### Gemini API Setup
1. Get a Gemini API key from Google AI Studio
2. Add it to your environment variables
3. The API is used for generating meal and workout plans

## 📱 Pages & Routes

### Public Routes
- `/` - Landing page with features overview
- `/auth/login` - User login
- `/auth/signup` - User registration

### Protected Routes (require authentication)
- `/chat` - AI fitness chat assistant
- `/chef` - AI meal plan generator
- `/profile` - User profile with saved plans

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme toggle with system preference detection
- **Animations**: Smooth transitions using Framer Motion
- **Modern Design**: Clean interface with Tailwind CSS
- **Accessibility**: ARIA labels and keyboard navigation

## 🔒 Security Features

- **Authentication**: Secure user auth with Supabase
- **Row Level Security**: Database-level access control
- **API Protection**: Server-side API key management
- **Input Validation**: Form validation and sanitization

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
The application can be deployed on any Next.js-compatible hosting service like Netlify, Railway, or self-hosted solutions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🔮 Future Enhancements

- PDF export for workout and meal plans
- Progress tracking and analytics
- Social features and plan sharing
- Integration with fitness trackers
- Advanced nutrition analysis
- Recipe API integration (Spoonacular/Edamam)