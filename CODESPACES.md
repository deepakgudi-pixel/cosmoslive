# CosmosLive Codespaces Setup

Use this when you want the dev server, file watcher, Next cache, and backend API to run on GitHub's cloud machine instead of your laptop.

## First Run

1. Push this repo to GitHub with the `.devcontainer` config.
2. Open the repo on GitHub.
3. Choose `Code` -> `Codespaces` -> `Create codespace`.
4. Wait for the setup command to finish.
5. Run:

```bash
npm run dev:codespaces
```

The frontend opens on forwarded port `3000`. The backend runs on forwarded port `4000`.

## Environment Variables

Add these in GitHub Codespaces secrets or create the matching env files inside the Codespace:

- `frontend/.env.local`
- `backend/.env`

Use the existing `.env.example` files as the template.

The Codespaces dev script automatically sets:

- `FRONTEND_URL`
- `NEXT_PUBLIC_API_URL`

So the browser calls the cloud backend URL, not your Mac's `localhost`.
