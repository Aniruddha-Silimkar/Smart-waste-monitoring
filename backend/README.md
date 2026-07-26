# Smart Waste Monitoring Backend

## Running locally

Run `npm i` to install dependencies.

Copy `.env.example` to `.env`, then fill in real values for `MONGO_URI`, `JWT_SECRET`, and `ADMIN_PASSWORD`.

Run `npm start` to start the API.

## Deployment

Set these environment variables in your backend hosting provider:

- `MONGO_URI`
- `JWT_SECRET`
- `ADMIN_PASSWORD`
- `ADMIN_EMAIL`
- `ADMIN_NAME`
- `MODEL_API_URL`
- `PORT`

Run `npm test` before deploying to check JavaScript syntax across the backend.
