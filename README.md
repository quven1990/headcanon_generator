# Headcanon Forge - AI Headcanon Generator

## About

Headcanon Forge is an AI-powered headcanon generator for writers, fanfiction creators, and RPG players. Generate character backstories, personality traits, and relationship dynamics, then browse community creations in Explore.

**Live site:** https://www.headcanonforge.com/

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Hosting:** Cloudflare Workers (OpenNext)
- **Database:** Cloudflare D1
- **Auth:** Google OAuth (custom session + D1)
- **AI:** SiliconFlow API
- **Analytics:** Google Analytics + Plausible

## Local Development

```bash
pnpm install
cp .dev.vars.example .dev.vars   # fill in credentials
pnpm dev                         # Next.js dev server
pnpm preview                     # Cloudflare Workers local preview
```

### Required environment variables (`.dev.vars`)

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `SILICONFLOW_API_KEY` | AI generation |
| `SILICONFLOW_MODEL` | AI model name |
| `OAUTH_REDIRECT_URI` | OAuth callback URL |
| `NEXT_PUBLIC_SITE_URL` | Site URL |

### Production secrets (Cloudflare Dashboard)

**Workers & Pages → headcanon-generator → Settings → Variables and Secrets**

Set the same variables as above. `SILICONFLOW_API_KEY` and Google secrets should be **Secrets**, not plain text.

```bash
pnpm run d1:migrate:remote
pnpm run deploy:cloudflare
```

## Features

- Character & relationship headcanon generation (Google sign-in required)
- Community Explore gallery (public shared generations)
- Blog section with writing guides

---

**Powered by AI · For creative inspiration only**
