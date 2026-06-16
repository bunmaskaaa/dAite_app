# dAite App

> AI matchmaker for intentional daters. You just show up.

## Stack

- **Frontend:** React Native (Expo)
- **Backend:** FastAPI + Python
- **Auth + DB:** Supabase (OTP email auth, PostgreSQL + pgvector)
- **AI:** Anthropic Claude API (agentic onboarding + matching)
- **Hosting:** Render (backend), Expo (mobile)

## Screens

- [x] Splash
- [x] Welcome
- [x] Auth (OTP email)
- [ ] Onboarding (Claude agent conversation)
- [ ] Match feed
- [ ] Match detail
- [ ] Anti-ghosting layer
- [ ] Profile

## Getting Started

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone.

## Project Structure

```
dAite_app/
├── src/
│   ├── screens/       # One file per screen
│   ├── components/    # Reusable UI components
│   ├── theme/         # Colors, typography, spacing
│   ├── hooks/         # Custom hooks
│   └── lib/           # Supabase client, API calls
├── App.tsx            # Root navigator
└── app.json           # Expo config
```
