# FocusFlow

FocusFlow is a small project-management app for students and small teams. You plan the work on a shared board, give tasks an owner and a date, and every person gets a personal **My work** page that shows what is overdue, due today and coming up this week, across all of their projects.

## Features

- **Projects and boards**: several boards per project, columns you name yourself, drag and drop for tasks and columns.
- **Tasks**: owner, priority, due date and tags. Descriptions and dates are optional. Checklists show progress on the card.
- **My work and agenda**: overdue, today and next 7 days, a week strip and month calendar. Inside a project the agenda stays docked beside the board.
- **Project views**: Board, My list, Calendar, Team, Notes and Settings.
- **Notes**: headings, checklists, code, images, and `#` to link a task. Pin notes, compare versions and restore an older one.
- **Task conversations**: rich-text comments, attachments (PDF, images, Word, text, up to 5 MB) and the task's own history.
- **Team and roles**: owner, admin and member, plus an activity log of every change in a project.
- **Live updates**: board changes and who is online appear without refreshing.
- **Search**: `Ctrl K` jumps to any project or task.
- **Accounts**: username and password or GitHub, email confirmation, password reset, profile and avatar.
- **Two-step sign-in**: an authenticator app (with a code by email as a fallback), turned on in Settings.
- **Discord**: optional bot that posts new tasks, finished work, new notes and a daily summary to a channel.

## Tech stack

| Part | Built with |
| --- | --- |
| Frontend | React 19, Vite, TypeScript, TanStack Router and Query, Tailwind CSS, shadcn/ui, Tiptap, dnd-kit, Framer Motion |
| Backend | NestJS 11, MongoDB with Mongoose, Passport (JWT, local, GitHub), Socket.IO, Nodemailer, discord.js |
| Tests | Jest (backend), Vitest and Testing Library (frontend) |

## Running it locally

You need **Node.js 20+** and a **MongoDB** database (MongoDB Atlas or a local install).

```bash
# 1. Backend (http://localhost:5000)
cd backend
npm install
cp .env.example .env    # then fill in MONGODB_URI and JWT_SECRET at least
npm run start:dev

# 2. Frontend (http://localhost:5173), in a second terminal
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173 and create an account. The API documentation (Swagger) is at http://localhost:5000/docs.

### Settings

Every setting is listed with a comment in [`backend/.env.example`](backend/.env.example) and [`frontend/.env.example`](frontend/.env.example).

- **Required:** `MONGODB_URI` and `JWT_SECRET`.
- **Email** (`SMTP_*`) sends the email confirmation, password reset and two-step sign-in codes. Without it the app still works, but those emails aren't sent. With Gmail, use an [app password](https://myaccount.google.com/apppasswords), not your normal password.
- **GitHub sign-in**, **Discord** and **Sentry** are optional.

## Scripts

| Where | Command | What it does |
| --- | --- | --- |
| backend | `npm run start:dev` | Run the API with reload on save |
| backend | `npm test` | Unit tests (Jest) |
| backend | `npm run build` / `npm run start:prod` | Production build and run |
| backend | `npm run seed:qa` | Create a local QA account with sample data |
| frontend | `npm run dev` | Run the app with hot reload |
| frontend | `npm test` | Component and unit tests (Vitest) |
| frontend | `npm run build` | Type-check and build for production |
| frontend | `npm run lint` | ESLint |

## Project layout

```
backend/   NestJS API: auth, projects, boards, columns, tasks, notes,
           comments, attachments, team, audit log, Discord integration
frontend/  React app: landing and sign-in pages, app shell, project
           workspace, My work dashboard, settings
```

## Known limitations

- Two-step sign-in applies to password accounts. GitHub accounts rely on GitHub's own security.
- Images placed inside notes stay on disk when their project is deleted. Everything else in the project is removed.
- Uploaded files are stored on the server's disk (`backend/uploads`), so a hosted setup needs persistent storage.
