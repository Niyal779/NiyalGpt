# NiyalGPT Backend

Express API for Gemini-powered NiyalGPT responses.

## Scripts

```bash
npm install
npm run dev
npm start
```

## Environment

Copy `.env.example` to `.env`, then set `GEMINI_API_KEY`.

```env
PORT=5000
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Get a key from Google AI Studio, then restart the backend.

## API

- `POST /api/chat`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/chats`
- `POST /api/chats`
- `GET /api/chats/:id`
- `POST /api/chats/:id/messages`
- `DELETE /api/chats/:id`
