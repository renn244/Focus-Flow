# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Students and small project teams who need a simple shared place to organise
work, assign tasks, and know what needs attention next.

## Product Purpose

FocusFlow helps a team move from a project board to an actionable personal
worklist. Success means a user can organise a project, assign dated work, and
quickly understand their next tasks.

## Positioning

FocusFlow combines project boards with a personal, due-date-focused dashboard
in one deliberately small student-project application.

## Operating Context

Users sign in, create projects and teams, arrange tasks on boards, assign work,
set due dates, and return to see their current agenda. The project will also
support task comments, attachments, and a project activity trail.

## Capabilities and Constraints

- Existing stack: React/Vite frontend and Nest/MongoDB backend.
- The scope deliberately excludes billing, pricing, analytics, marketing
  claims, and queue/microservice audit infrastructure.
- `audit-backend` remains standalone; the main app will later use a direct
  in-process audit log.
- The public entry page must lead to real sign-up and login routes.
- Attachment storage remains an open implementation decision.

## Brand Commitments

- Product name: FocusFlow.
- The login/sign-up visual language is the reference for the app: deep navy
  surfaces with restrained blue, purple, and cyan accents.
- Copy must be honest about currently supported or planned core workflow;
  invented enterprise, AI, integration, billing, or user-count claims are not
  allowed.

## Evidence on Hand

- Working frontend and backend source in this repository.
- Existing auth pages at `frontend/src/pages/Login.tsx` and the related auth
  routes.
- Existing project, board, task, and due-date implementation.
- No customer testimonials, usage metrics, partner logos, or product imagery
  are available; future pages must not fabricate them.

## Product Principles

- Prioritise a clear next action over broad reporting.
- Keep the feature set small and genuinely functional.
- Make shared work understandable without enterprise complexity.
- Use one coherent FocusFlow identity across authentication and product pages.
