# ByteChat

Real-time chat app: React + Tailwind + Hero UI on the front, Node/Express + Socket.io + MongoDB on the back,
Clerk for sign-in and ImageKit for photo/video messages. It ships as **one Docker image** that serves both the API and the website.
,
```
backend/    Express API, Socket.io, Mongoose models, Clerk webhook
frontend/   React (Vite) app
Dockerfile  builds both and serves them from one container
render.yaml one-click Render blueprint
```

## 1. Accounts you need (all have free tiers)

| Service | What for | Where to get the values |
| --- | --- | --- |
| MongoDB Atlas | database | Connect -> Drivers -> connection string. Network Access: allow `0.0.0.0/0` (or your host's IPs) |
| Clerk | sign-in | API keys page: publishable + secret key |
| ImageKit | photo/video uploads (optional) | Developer options -> private key |

## 2. Run locally

```bash
# backend
cd backend
cp .env.example .env      # fill it in
npm install
npm run dev               # http://localhost:3000

# frontend (second terminal)
cd frontend
cp .env.example .env      # add the Clerk publishable key
npm install
npm run dev               # http://localhost:5173 (proxies /api and /socket.io to :3000)
```

Open http://localhost:5173, sign up with two different accounts (second one in a private window) and chat.
`FRONTEND_URL` in `backend/.env` must be exactly `http://localhost:5173` (http, not https).

## 3. Deploy (Render, Docker)

1. Push this repo to GitHub (make sure no `.env` file is committed).
2. Render -> **New -> Blueprint** -> select the repo (it reads `render.yaml`).
3. Fill the environment variables when asked:

| Variable | Value |
| --- | --- |
| `MONGO_URI` | Atlas connection string |
| `CLERK_PUBLISHABLE_KEY` and `VITE_CLERK_PUBLISHABLE_KEY` | the same publishable key (the second one is baked into the frontend at build time) |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_WEBHOOK_SIGNING_SECRET` | from step 4 (can be added after the first deploy) |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key (without it text chat works, media uploads return an error) |
| `FRONTEND_URL` | your public URL, e.g. `https://bytechat.onrender.com` |

4. **Clerk webhook** (keeps names/avatars in sync and removes deleted users): Clerk dashboard -> Webhooks -> Add endpoint
   `https://<your-url>/api/webhooks/clerk`, subscribe to `user.created`, `user.updated`, `user.deleted`, copy the *Signing secret*
   into `CLERK_WEBHOOK_SIGNING_SECRET`. Chat works even before this: a new user's profile is fetched from Clerk on first login.
5. Health check is `GET /health`. In production a cron job pings it every 14 minutes so the free tier does not sleep.

Any other host that runs Docker works the same way (Railway, Fly.io, a VPS):

```bash
docker build --build-arg VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx -t bytechat .
docker run -p 3001:3001 --env-file backend/.env -e NODE_ENV=production bytechat
```

Use your Clerk **production** keys (`pk_live_` / `sk_live_`) for a real launch and add your domain in Clerk.

## Notes

- Sockets are authenticated with the Clerk session token, so nobody can listen in on another user's messages.
- Uploads: images and videos up to 25 MB, stored on ImageKit.
- Change the app name in one place: `frontend/src/components/AppLogo.jsx` (`APP_NAME`) plus `frontend/index.html`.
