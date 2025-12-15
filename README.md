# G.C.E. O/L Study Helper

This project now includes a lightweight backend so that planner data, timeline milestones, and other on-page changes persist across refreshes.

## Frontend overview
- Static multi-page site served from the project root (`index.html`, `planner.html`, etc.).
- Shared logic lives in `app.js`, which now syncs planner snapshots, logged hours, and revision timeline state with the backend.
- You can override the API target by defining `window.__OL_API_BASE_URL__` before loading `app.js`, but it defaults to `http://localhost:4000/api`.

## Backend setup
1. **Install dependencies**
   ```powershell
   cd server
   npm install
   ```
2. **Configure environment variables**
   - Copy `.env.example` to `.env` inside the `server` folder.
   - Update `MONGODB_URI` with your MongoDB connection string.
   - Optional: set `ALLOWED_ORIGINS` (comma-separated) if you plan to host the frontend from a specific origin. Empty value allows any origin, and `file://` usage is always permitted.
3. **Run the API**
   ```powershell
   npm run dev
   ```
   The server listens on `PORT` (default `4000`). If you don't provide `MONGODB_URI` and no local MongoDB daemon is available, the backend automatically spins up an **in-memory** MongoDB instance (via `mongodb-memory-server`). This is handy for demos, but data is wiped every time you restart the server. Point `MONGODB_URI` to a persistent database to keep your planner history.

## API surface
- `GET /api/state/:userId` — fetch persisted planner + tools state (auto-creates a document on first access).
- `PUT /api/state/:userId/planner` — persist planner-specific state (`loggedHours`, `weeklyGoal`, `snapshots`, `lastPlan`).
- `PUT /api/state/:userId/tools` — persist tool data such as the revision timeline checkboxes.

All endpoints expect/return JSON. The frontend currently uses a single logical user id (`default-user`), but you can extend this to support authenticated users or multiple profiles.

## Development tips
- Run the backend before testing planner updates or timeline checkboxes; otherwise, the UI will continue to work locally but display a console warning that sync is unavailable.
- When editing frontend files, use a local HTTP server (such as VS Code Live Server) instead of opening HTML via `file://` to avoid CORS issues when you start hosting the site remotely.
- The backend clamps stored hour values between 0 and 200 and limits planner snapshots to the five most recent entries.
