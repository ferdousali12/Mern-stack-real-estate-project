# Ferdous Estate

A MERN real-estate app: Express + MongoDB API in `api/`, React + Vite client in `client/`.

## Setup

1. Install dependencies:

   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. Create your environment file (never commit it):

   ```powershell
   Copy-Item .env.example .env
   ```

   Then set `JWT_SECRET` to a long random value. Set `MONGO_URI` if you are not using a local MongoDB at `mongodb://127.0.0.1:27017/estate`.

3. Start both servers in separate terminals:

   ```bash
   npm run dev                 # API on http://localhost:3000
   cd client && npm run dev    # Vite client, proxies /api to port 3000
   ```

## Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `JWT_SECRET` | Yes | — | Signs the auth cookie token |
| `MONGO_URI` | No | `mongodb://127.0.0.1:27017/estate` | MongoDB connection string |
| `NODE_ENV` | No | `development` | `production` enables the `Secure` cookie flag |

## API overview

- `POST /api/auth/signup`, `POST /api/auth/signin`, `POST /api/auth/signout`, `GET /api/auth/me`
- `PUT /api/user/:userId/update` — requires auth, owner only
- `GET /api/listing/get`, `GET /api/listing/:id`
- `POST /api/listing/create`, `PUT /api/listing/update/:id`, `DELETE /api/listing/delete/:id` — require auth, owner only for update/delete

`GET /api/listing/get` supports `searchTerm`, `offer`, `furnished`, `parking`, `type`, `minPrice`, `maxPrice`, `beds`, `baths`, `sort`, `limit`, and `startIndex`.

## Notes

- Signup and signin both set an httpOnly `access_token` cookie; the client stores the user in React context and rehydrates it via `/api/auth/me`.
- `/profile`, `/create-listing`, and `/update-listing/:id` are protected on the client by `RequireAuth`; the API independently verifies the cookie on every protected route.
- Client checks: `cd client && npm run lint` and `npm run build`.
