# Council of LLMs

A multi-agent AI debate arena where 5 AI personalities clash to ideate the best project concept for you.

## Getting Started

### 1. Set up your environment

Create a `.env.local` file in the root of the project:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Get your free API key at [openrouter.ai/keys](https://openrouter.ai/keys). No billing required for free tier models.

> Never commit `.env.local` to version control. It is already in `.gitignore` by default.

### 2. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenRouter Docs](https://openrouter.ai/docs)

## Deploy on Vercel

Add `OPENROUTER_API_KEY` as an environment variable in your [Vercel project settings](https://vercel.com/docs/environment-variables) before deploying.
