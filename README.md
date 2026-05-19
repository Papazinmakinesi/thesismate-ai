# ThesisMate AI

A portfolio-grade Next.js app for thesis research management, built with TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## Features

- Academic workflow dashboard
- Source management with PDF/DOCX upload support
- Supervisor comment tracking
- Chapter checklist analysis
- Literature matrix export
- AI assistant mock integration

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and update `DATABASE_URL`.

3. Generate Prisma client and push schema:

```bash
npm run prisma:generate
npm run prisma:db:push
```

4. Seed sample data:

```bash
npm run seed
```

5. Start development server:

```bash
npm run dev
```

## Notes

- The current MVP scaffold includes the dashboard, navigation structure, and account login/register workflow.
- Google and Facebook login buttons are included as a mocked provider workflow for local development.
- AI responses are mocked until an OpenAI-compatible API key is configured.
- File upload parsing uses `pdf-parse` and `mammoth` in the backend.
