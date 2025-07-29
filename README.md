# AI Fitness Assistant - Web Application

A modern, responsive web application for an AI-powered fitness assistant built with Next.js, TypeScript, TailwindCSS, and Supabase.

## Features

- 🎯 **Modern UI/UX** - Clean, professional design with dark/light mode
- 🔐 **Authentication** - Email/password and Google OAuth via Supabase
- 💬 **Real-time Chat** - Interactive chat interface with your AI fitness assistant
- 📱 **Responsive Design** - Mobile-first approach, works on all devices
- 🎨 **Smooth Animations** - Framer Motion powered transitions and effects
- 🛡️ **Protected Routes** - Secure chat access for authenticated users only

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **Authentication**: Supabase Auth (Email + Google OAuth)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Backend**: Python FastAPI (fitness_rag_agent)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and anon key
3. Update the `.env.local` file with your credentials
4. Enable Google OAuth in Authentication > Providers (optional)

### 4. Backend Setup

Make sure your Python FastAPI backend is running:

```bash
cd ../fitness_rag_agent
python app.py
```

The backend should be available at `http://localhost:8000`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   └── signup/        # Signup page
│   ├── chat/              # Protected chat page
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ChatBox.tsx        # Main chat interface
│   ├── MessageBubble.tsx  # Individual message component
│   ├── HeroSection.tsx    # Landing page hero
│   ├── FeaturesSection.tsx # Features showcase
│   ├── Navbar.tsx         # Navigation bar
│   ├── Footer.tsx         # Footer component
│   └── DarkModeToggle.tsx # Theme switcher
├── lib/                   # Utility libraries
│   ├── supabase.ts        # Supabase client
│   ├── auth.ts            # Auth helpers
│   └── theme-context.tsx  # Theme provider
└── middleware.ts          # Route protection
```

## Pages

- **`/`** - Landing page with hero section and features
- **`/auth/login`** - User login with email/password and Google OAuth
- **`/auth/signup`** - User registration
- **`/chat`** - Protected chat interface (requires authentication)

## Key Features

### Authentication
- Email/password authentication
- Google OAuth integration
- Protected routes with middleware
- Persistent login state

### Chat Interface
- Real-time messaging with AI assistant
- Message history
- Loading states and error handling
- Responsive design

### Theme Support
- Dark/light mode toggle
- System preference detection
- Persistent theme selection

### Responsive Design
- Mobile-first approach
- Tailwind CSS for styling
- Smooth animations and transitions

## API Integration

The frontend communicates with the Python FastAPI backend at `http://localhost:8000/chat`:

```typescript
// Example chat request
const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
  message: userMessage
})
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details