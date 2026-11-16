# Taskflow — Task Manager

A clean, responsive task manager built with React, TypeScript and Vite. It is ready to push to GitHub and deploy on Vercel.

## Features
- Create, edit and delete tasks
- Start dates, due dates, priorities and status
- Track progress from 0–100%
- Add progress updates to a task activity timeline
- Dashboard metrics, search and status filters
- Overdue and due-soon indicators
- Data persists in the browser using `localStorage`
- Responsive layout for desktop and mobile

## Run locally
Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## Build
```bash
npm run build
npm run preview
```

## Deploy with GitHub + Vercel
1. Create a new GitHub repository.
2. Extract this ZIP and push the contents of this folder to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial Taskflow app"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   git push -u origin main
   ```
3. In Vercel, choose **Add New → Project** and import that GitHub repository.
4. Vercel should detect Vite automatically. Use:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
5. Click **Deploy**. Future pushes to `main` will trigger deployments.

## Important data note
This starter stores tasks in the current browser's local storage. That means your data stays on that browser/device and is not shared across devices or users. For multi-device sync, sign-in, reminders by email/push, or team collaboration, connect a database/auth provider such as Supabase and add a scheduled notification service. Browser-local storage does not send notifications when the app is closed.

## Project structure
```
src/
  App.tsx       Main dashboard and task interactions
  main.tsx      React entry point
  styles.css    App styling
```
