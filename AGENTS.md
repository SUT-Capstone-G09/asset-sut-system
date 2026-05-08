<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# .cursorrules

You are an expert Next.js and TypeScript developer.

Follow these project rules

---

# Project Goal

This project is a frontend demo for a Commercial Space Management System.

Focus on:

- Use pre-built components when appropriate.
- Prefer using shadcn/ui for reusable UI components.
- Readable code
- Maintainable structure
- Reusable UI

---

# Frontend Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react

---

# UI Components

- Prefer using shadcn/ui components when possible.
- Reuse existing UI components before creating new ones.
- Keep UI consistent across the project.

# Folder Structure

```bash
src/
├── app/
├── components/
│   ├── ui/
│   └── layout/
│
├── features/
│   ├── auth/
│   ├── tenants/
│   ├── contracts/
│   ├── news/
│   ├── tickets/
│   └── documents/
│
├── services/
├── hooks/
├── lib/
├── types/
├── utils/
└── styles/
```

---

# Architecture Rules

## Feature-based Structure

Keep business-related code inside:

```bash
src/features/[feature-name]
```

Examples:

```bash
src/features/contracts
src/features/tenants
```

---

## App Router

Keep files inside `src/app` minimal.

Use them mainly for:

- routing
- layouts
- page structure

Move large UI and logic into feature modules.

---

## Shared Components

Use:

```bash
src/components/ui
```

for reusable components such as:

- Button
- Input
- Modal
- Table

Use:

```bash
src/components/layout
```

for shared layouts such as:

- Sidebar
- Navbar
- DashboardLayout

---

# Coding Style

- Use TypeScript everywhere.
- Use functional React components.
- Prefer readable code over complex abstractions.
- Keep components small and maintainable.
- Avoid deeply nested logic.
- Use clear naming.

---

# Styling Rules

- Follow existing design patterns.
- Avoid inline styles when possible.

---

# Icons

Use `lucide-react` for icons.

Keep icon usage consistent.

---

# API Rules

- Prefer separating mock data and API logic from UI components.
- Use async/await for asynchronous code.
- Handle loading and error states when appropriate.
- Keep API structure simple and easy to refactor later.

---

# State Rules

- Use local state by default.
- Only introduce global state when truly necessary.
- Avoid unnecessary complexity.

---

# General Principles

- Keep the code clean.
- Avoid premature optimization.
- Avoid over-engineering.
- Prioritize consistency and readability.

---

# Important

Before creating new patterns or structures:

1. Check existing project patterns.
2. Follow existing conventions.
3. Keep architecture simple and consistent.
<!-- END:nextjs-agent-rules -->
