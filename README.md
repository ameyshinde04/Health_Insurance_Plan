
<div align="center">
  <img width="800" alt="InsurePlan Explorer" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# InsurePlan Explorer

A comprehensive insurance plan exploration tool featuring:
- Smart analytics and plan comparisons
- AI-driven insurance advisor chatbot (Gemini API)
- User authentication (Supabase, Firebase)

## Features
- Browse and compare health insurance plans
- Get instant AI-powered plan recommendations
- Fast: Optimized backend for quick AI responses
- Deployed on Vercel via GitHub

## Tech Stack
- React + TypeScript (frontend)
- Gemini API (AI chatbot)
- Supabase & Firebase (auth, data)
- Vercel (deployment)

## Local Development

**Prerequisites:** Node.js (v18+ recommended)

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/your-username/insureplan-explorer.git
   cd insureplan-explorer
   npm install
   ```
2. Create a `.env.local` file in the root directory and add your keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   ...
   ```
   **Never commit your API keys to GitHub!**
3. Start the development server:
   ```bash
   npm run dev
   ```
   The app runs at http://localhost:3000

## Deployment (Vercel + GitHub)
1. Push your code to a GitHub repository
2. Connect your repo to Vercel (https://vercel.com/import)
3. Set all required environment variables in Vercel dashboard
4. Deploy! Vercel will handle builds and hosting automatically

## License
MIT
