---
version: 1
slug: "frontend-src-components-layout-appshell-tsx"
primary_target: "frontend/src/components/layout/AppShell.tsx"
related_targets: ["frontend/src/pages/projects/ProjectsDashboard.tsx","frontend/src/pages/projects/ProjectWorkSpace/ProjectWorkspace.tsx","frontend/src/pages/projects/AllProjects.tsx","frontend/src/pages/UserSettings.tsx"]
---

# App shell surface brief

- **Mode:** Operate
- **Scope:** the signed-in shell and its pages: My work (`/projects`), project workspace (`/projects/$projectId`), All projects (`/projects/all`), Settings (`/settings`). Auth and landing pages are out of scope.
- **Audience and job:** students and small teams juggling 2–6 projects, switching often within a session. They open the app to see what is due, jump from a task to its board, and come back without losing their agenda.
- **Task:** know what is due (overdue / today / next 7 days), open a task, move work on a board, switch project.
- **Untouched:** board drag and drop, columns, task dialogs, sockets, routes, data shown.
- **Must work on phones.**
- **Decided:** dock collapsed state persists in localStorage (per browser, falls back to open). Ctrl K command palette jumps to projects and tasks only, no actions yet. User's own tasks on the board are marked with avatar/"You", never a coloured side border.
- **Header split (build decision):** the board picker and the primary "New task" button sit on a board row under the project header, not in the project header itself, because boards are per project and task creation targets the open board's first column. The project header carries project-level controls only (members, Activity, view tabs).
- **Chosen sketch:** `.impeccable/mocks/decision/docked-agenda.html`.

## Direction contract

THESIS: Your personal agenda never leaves the screen; it docks beside whichever project you open. Refuses the category default of a dashboard page you must navigate back to, and the generic left nav list with a separate "My tasks" page.

OWN-WORLD: FocusFlow's Night Desk: navy #08142d top bar and #0b1630 agenda dock with blue-white text, light #f4f6fb work canvas with white board columns. Blue #3b82f6 only for action and selection; cyan/violet sparse signals; project colour only as small dots. Inter throughout, tabular numerals for dates and times. 8px controls, 12px surfaces, 1px borders, neutral offset shadows, no glow.

STORY: The visitor sees today's work first, opens a project from a tab, keeps the agenda in view while moving cards, and spots which agenda items live on the open board.

FIRST VIEWPORT: 56px navy top bar: brand, "My work" tab, one tab per active project (colour dot, truncated name), overflow "+N more", search button with Ctrl K hint, avatar menu. Below: 340px navy dock (heading "My agenda", date, segmented Overdue/Today/7 days with counts, task rows with project dot and due time; rows on the open board marked "On this board") and the light work area: project name, board picker, members, Activity, primary "+ Task", Board/Calendar/Team underline tabs, then columns. Primary action is the blue "+ Task" in the work header.

FORM: Docked agenda, position 3 on the ranked surface list (dealt). Signature move: the dock's "On this board" link between personal agenda and the open board. seed:f75f0f93707f0e02

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
