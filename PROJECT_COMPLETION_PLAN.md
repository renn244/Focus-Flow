# FocusFlow completion plan

## Goal

Finish FocusFlow as a polished student project with one clear purpose: help a
user organise project work and see what they need to do next. The goal is a
coherent, working core—not a production-scale SaaS platform.

## Product scope

### Keep and finish

- Authentication, sign-up, login, password recovery, and protected routes.
- Projects, teams, boards, columns, and tasks.
- Task priority, due date, assignee, tags, and task status/movement.
- A personal dashboard that answers: **what do I need to do now?**
- Task comments.
- Task attachments.
- A first-party audit trail for important project and task changes.
- API documentation in Swagger.

### Explicitly out of scope

- Pricing, billing, subscriptions, plan limits, and expansive marketing claims.
- Analytics dashboards and vanity metrics.
- Fake AI, SSO, video, enterprise, testimonial, or integration claims.
- Notification/settings pages unless they become functional and necessary for
  the core workflow.
- Microservice/CQRS/Bull/Redis audit infrastructure.

`audit-backend` remains independent and must not be connected to the main
FocusFlow backend. The main application will own a small, direct audit-log
feature instead.

## Design direction

The login/sign-up interface is the visual reference for the product:

- Dark navy foundation with restrained blue, purple, and cyan accents.
- One consistent FocusFlow name and icon across auth and app pages.
- Clear hierarchy, generous spacing, and practical task-focused surfaces.
- Avoid generic glassmorphism, placeholder imagery, and marketing-style copy.

The app entry route should remain authentication-first: unauthenticated users
see the small, honest landing page; authenticated users go to `/projects`.

## Current audit findings

### Working foundations

- Frontend and backend builds pass.
- Tasks already persist a due date.
- Recent projects are backed by the API.
- Swagger is configured at `/docs` and API routes use the `/api` prefix.

### Gaps to close

- The dashboard has a real assigned-task endpoint, an assignee picker backed
  by the project team, a Shadcn Calendar date agenda, due-date groups, compact
  counts, and task navigation into the correct board.
- Comments are implemented with guarded create, read, update, and delete APIs
  and a Tiptap task-detail UI. Attachments have guarded local storage,
  metadata, download/delete endpoints, a task-detail UI, unit coverage, and a
  real JWT-protected integration check for upload, list, download, and delete.
- The main app has a direct, in-process audit log with guarded project activity
  history. It does not depend on `audit-backend`, queues, workers, Bull, or Redis.
- Swagger exists, but endpoint descriptions, tags, request examples, and
  response documentation need a completion pass.
- Backend unit tests include scaffold tests that need meaningful dependencies,
  assertions, and behaviour coverage.

## Implementation order

### 1. Stabilise task ownership and dates

- Let a task creator select an assignee from the project team.
- Validate assignees belong to the task's project/team.
- Return populated, consistent assignee data from task APIs.
- Keep due dates optional, timezone-safe, and sortable.
- Remove remaining `any`-typed task presentation code where the API contract
  can provide a real type.

**Done when:** a team member can create and update an assigned, dated task and
the assignment is displayed correctly after refresh.

### 2. Build the real personal dashboard — complete

Default dashboard scope is **tasks assigned to the signed-in user**.

- [x] Add `GET /api/task/mine` before the `GET /api/task/:id` route with
  due-date ascending order.
- Return enough task context for display: task, board/project, priority,
  assignee, status, and due date.
- [x] Replace the fake `WorkSummaryPanel` with real data and useful empty/loading/
  error states.
- [x] Show three actionable groups: **Overdue**, **Today**, and **Upcoming**.
- [x] Add compact counts for overdue, due today, and due in the next seven days.
- [x] Put a compact Shadcn monthly calendar on the side. Selecting a date filters the
  agenda; it is context for work, not a separate scheduling product.
- [x] Keep recent projects below the personal agenda.

**Done when:** a signed-in user can open the dashboard and immediately see
their current work, choose a calendar date, and open the relevant task.

### 3. Add comments and attachments

Build this as one task-detail activity area, not two disconnected features.

#### Comments — implemented

- [x] Create a `Comment` Mongoose model with task, author, Tiptap content,
  derived plain text, and timestamps. Keep comments editable/deletable only by
  their author; project members can read them.
- [x] Provide a small, direct API: list by task, create, update, and delete.
- Resolve the task's board/project server-side for every write; never trust a
  client-supplied project id for access checks.
- In the task detail dialog, show newest comments at the bottom, include an
  author/time label, and provide a compact composer.

#### Attachments â€” implemented and verified

- [x] For this student-project demo, store uploaded files under a server-managed
  local uploads directory and save only metadata in MongoDB: `taskId`,
  `projectId`, `uploaderId`, original filename, stored filename, MIME type,
  size, and timestamps.
- [x] Limit uploads to a small allowlist of safe document/image types and a clear
  maximum size. Reject invalid files before writing them to disk.
- [x] Serve/download files only after task/project membership is checked. An
  uploader can remove their own attachment; project admins may remove any.
- [x] In the same task-detail activity area, show attachment filename, size,
  uploader, download action, and a safe remove action.

#### Delivery order

1. Read the current task-detail dialog and its access guards; settle the API
   contracts and Swagger DTOs.
2. Implement and test comments end-to-end.
3. Add upload storage/configuration, attachment metadata, guarded downloads,
   and deletion.
4. Connect both to the task detail UI and then make their create/update/delete
   operations emit first-party audit events in the next phase.

**Done when:** authorised project members can add, view, and safely remove
their own comments/attachments from a task.

### 4. Add a simple in-process audit trail — complete

- [x] Create an `AuditLog` Mongoose model and a small application service in the
  main backend—no queue, worker, microservice, Bull, or Redis.
- [x] Record only meaningful events: project/team changes, task create/update/
  move/delete, comment changes, and attachment changes.
- [x] Store actor, action, entity type/id, project id, timestamp, and a safe,
  minimal change summary.
- [x] Provide a paginated project activity endpoint:
  `GET /api/projects/:projectId/activity`, with pagination and membership
  authorisation.
- [x] Render a chronological project activity view in the active project workspace.

**Done when:** project members can review who changed what and when without
any dependency on `audit-backend`.

### 5. Finish quality and documentation

- Add Swagger tags, summaries, auth requirements, DTO examples, and response
  descriptions to the public API.
- Replace placeholder backend tests with behaviour-focused unit tests for task
  ownership, dashboard queries, comments, attachments, and audit logging.
- Add frontend coverage for the dashboard's loading, empty, error, and dated
  task states.
- Test the core journey manually: sign up → create project/team → create and
  assign dated task → dashboard → comment/attachment → activity trail.
- Run frontend build, backend build, tests, and a browser pass before calling
  the project complete.

## Completion checklist

- [ ] No marketing/billing/analytics/fake-product screens remain in the user
      flow.
- [ ] Auth and application visuals use one FocusFlow design system.
- [ ] Task assignment and due dates work end-to-end.
- [ ] Dashboard uses real assigned-task data and a functional side calendar.
- [x] Comments and attachments work with access controls.
- [x] Audit trail is local to the main backend and visible to project members.
- [ ] Swagger accurately documents the finished API.
- [ ] Builds, meaningful tests, and the core browser journey pass.
