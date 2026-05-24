# NiyalGPT

NiyalGPT is a full-stack AI chatbot web application with a premium dark/blue chat UI, Gemini API responses, local chat history, custom assistant personalities, Markdown/code rendering, copy actions, and deployment-ready configuration.

## Folder Structure

```text
NiyalGpt/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
    .env.example
    package.json
  frontend/
    src/
      components/
      context/
      pages/
      utils/
    .env.example
    package.json
  package.json
  README.md
```

## Setup

1. Install root tooling, then app dependencies:

```bash
npm install
npm run install:all
```

2. Copy environment files:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

3. Add your Gemini API key in `backend/.env`.

4. Start both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

## Gemini API Setup With XAMPP

For the direct browser UI in `index.html`, use the PHP API included in `api/`.

1. Copy `api/config.example.php` to `api/config.php`.
2. Add your real Gemini API key:

```php
return [
    'gemini_api_key' => 'YOUR_REAL_GEMINI_API_KEY',
    'gemini_model' => 'gemini-2.5-flash'
];
```

3. Start Apache from XAMPP.
4. Open:

```text
http://localhost/NiyalGpt/
```

Do not open with `file:///...` when using the PHP API.

## Gemini API Setup With Netlify

Netlify does not run PHP, so hosted chat uses the included Netlify Function:

```text
/.netlify/functions/chat
```

In Netlify dashboard:

1. Open your site.
2. Go to `Site configuration`.
3. Go to `Environment variables`.
4. Add:

```text
GEMINI_API_KEY = your_real_gemini_api_key
GEMINI_MODEL = gemini-2.5-flash
```

5. Redeploy the site.

## Optional Node Backend

Create `backend/.env` if you want to use the Node backend instead:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Run the backend:

```bash
cd backend
npm install
npm run dev
```

Open the root `index.html` directly or serve the frontend with any local static server. The browser app calls `http://localhost:5000/api/chat`.

## Deployment

- Deploy `frontend` to Vercel or Netlify.
- Deploy `backend` to Render, Railway, Fly.io, or any Node host.
- Set `VITE_API_URL` in the frontend deployment to your backend URL.
- Set `CLIENT_URL` in the backend deployment to your frontend URL.

## Credits

available now:[Niyal Rahaman](https://niyalgpt.netlify.app/)

Designed & Developed by [Niyal Rahaman](https://niyal.netlify.app/)
