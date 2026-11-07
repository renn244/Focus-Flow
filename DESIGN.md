---
name: FocusFlow
description: Calm, task-first shared-work management in a precise deep-navy interface.
colors:
  navy-field: "#08142d"
  navy-surface: "#0b1630"
  navy-section: "#0a1834"
  shell-hover: "#132449"
  action-blue: "#3b82f6"
  action-blue-hover: "#60a5fa"
  action-blue-strong: "#2563eb"
  signal-violet: "#a78bfa"
  signal-cyan: "#22d3ee"
  text-primary: "#ffffff"
  text-secondary: "#dbeafe"
  shell-muted: "#9db0d3"
  border-subtle: "rgba(147,197,253,0.15)"
  shell-border: "rgb(147 197 253 / 16%)"
  work-canvas: "#f4f6fb"
  work-lane: "#e9eef6"
  work-card: "#ffffff"
  ink: "#15233b"
  ink-muted: "#58677d"
  fill-muted: "#eef2f7"
  fill-hover: "#eef3fc"
  line: "#dfe5ef"
  line-input: "#cbd5e1"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  page-title:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  ui:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
    letterSpacing: "0em"
  meta:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "0em"
    fontFeature: "tnum"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.16em"
rounded:
  dot: "3px"
  inset: "6px"
  control: "8px"
  surface: "12px"
  feature: "16px"
spacing:
  compact: "8px"
  control: "12px"
  component: "16px"
  page-block: "28px"
  section: "80px"
  top-bar: "56px"
  dock: "340px"
components:
  button-primary:
    backgroundColor: "{colors.action-blue}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-work-primary:
    backgroundColor: "{colors.action-blue-strong}"
    textColor: "{colors.text-primary}"
    typography: "{typography.ui}"
    rounded: "{rounded.inset}"
    padding: "0 16px"
    height: "36px"
  button-work-outline:
    backgroundColor: "{colors.work-canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.inset}"
    padding: "0 16px"
    height: "36px"
  shell-top-bar:
    backgroundColor: "{colors.navy-field}"
    textColor: "{colors.text-secondary}"
    height: "{spacing.top-bar}"
  shell-dock:
    backgroundColor: "{colors.navy-surface}"
    textColor: "{colors.text-secondary}"
    width: "{spacing.dock}"
  agenda-row:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    typography: "{typography.ui}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  agenda-row-hover:
    backgroundColor: "{colors.shell-hover}"
  board-lane:
    backgroundColor: "{colors.work-lane}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "12px"
  task-card:
    backgroundColor: "{colors.work-card}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.control}"
    padding: "12px"
  work-panel:
    backgroundColor: "{colors.work-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "12px 20px"
  surface-workspace:
    backgroundColor: "{colors.navy-surface}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.feature}"
    padding: "12px"
  surface-callout:
    backgroundColor: "linear-gradient(135deg, rgba(59,130,246,0.15), #112956, rgba(139,92,246,0.10))"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.feature}"
    padding: "36px 24px"
---

# Design System: FocusFlow

## Overview

**Creative North Star: "The Focused Night Desk"**

FocusFlow is a quiet, capable workspace for turning shared project activity into a clear next task. A deep navy field keeps the brand calm and concentrated; blue light indicates the route forward, while cyan and violet distinguish small task signals without competing for attention.

The system has two registers that share one identity. The landing page is the desk at night: a full navy canvas, large close-tracked headings, and a single wide piece of workspace evidence lifted by soft blue light. The signed-in app keeps the navy as its frame (the 56px top bar, the docked agenda, the mobile agenda drawer, the selected day) and opens the long-session work area onto a light, cool canvas with white cards and pale lanes, so boards and task lists stay readable for hours. Depth in the app is neutral and offset, never glowing.

The app is task-led and moderately dense: dates, times and counts carry the hierarchy, set in tabular numerals; project identity appears only as small coloured dots; the personal agenda stays docked beside whichever project is open.

**Key Characteristics:**

- Navy carries the identity: the landing canvas and the signed-in shell (top bar, agenda dock, drawer).
- Long-session work areas sit on a light canvas (`work-canvas`) with white cards and pale lanes.
- Two blues with two jobs: lighter blue marks and selects; deeper blue fills buttons that carry white text.
- Inter throughout; tabular numerals for every date, time and count.
- 8px controls, 12px surfaces, 1px borders; neutral offset shadows in the app, blue glow only on the landing page.

**Source evidence:** [PRODUCT.md](PRODUCT.md), [LandingPage.tsx](frontend/src/pages/LandingPage.tsx), [index.css](frontend/src/index.css), [AppShell.tsx](frontend/src/components/layout/AppShell.tsx), [TopBar.tsx](frontend/src/components/layout/TopBar.tsx), [AgendaPanel.tsx](frontend/src/components/layout/AgendaPanel.tsx), [ProjectsDashboard.tsx](frontend/src/pages/projects/ProjectsDashboard.tsx), [ProjectWorkspace.tsx](frontend/src/pages/projects/ProjectWorkSpace/ProjectWorkspace.tsx), [ColumnCard.tsx](frontend/src/features/projectWorkSpace/components/Column/ColumnCard.tsx), [TaskCard.tsx](frontend/src/features/projectWorkSpace/components/Task/TaskCard.tsx), and the reviewed renders in `.impeccable/review/`.

## Colors

Low-luminance navy layers carry the identity and the shell; a cool light layer carries the work; a narrow blue-led spectrum is reserved for action, selection and task state.

### Primary

- **Forward Blue** (`action-blue`): the mark of selection and accent. In the navy shell it is the active top-bar tab underline, the selected agenda range, the "On this board" row tint (14% alpha), and the focus outline everywhere (`--shell-accent`). In the light work area it is the active view-tab underline. On the landing page it also fills CTAs, the logo tile and the selected calendar date; its hover companion `action-blue-hover` belongs to those landing fills only.
- **Deep Forward Blue** (`action-blue-strong`): the fill for primary buttons in the app ("New task", "Create a project", "Create a board"), the app brand tile, and blue text links and accents on light surfaces. It exists because white text needs it: white on Deep Forward Blue reaches about 5.2:1, white on Forward Blue only about 3.7:1.

### Secondary

- **Planning Violet** (`signal-violet`): a limited task-state marker and landing gradient endpoint; it stays subordinate to blue actions.

### Tertiary

- **Attention Cyan** (`signal-cyan`): a crisp landing marker for links, calendar dots and selected task signals. The app does not use it as a system colour.

### Neutral

- **Night Field** (`navy-field`): the landing canvas and the app top bar (`--shell`).
- **Workbench Navy** (`navy-surface`): the landing workspace preview, the app agenda dock and mobile agenda drawer (`--shell-raised`). **Section Navy** (`navy-section`) is the landing process band.
- **Shell Hover Navy** (`shell-hover`): hover fill for agenda rows, icon buttons and the mobile project picker inside the shell.
- **Clear White** (`text-primary`) and **Blue-White** (`text-secondary`): brightest text for headings, task titles and active tabs on navy; Blue-White for shell body text.
- **Shell Mist** (`shell-muted`): inactive tabs, dates, project names and icon buttons in the shell.
- **Blue Mist Border** (`border-subtle`, landing) and **Shell Border** (`shell-border`, app): the 1px translucent blue boundary on navy.
- **Work Canvas** (`work-canvas`): the app page background behind boards and dashboards.
- **Lane Grey-Blue** (`work-lane`): board column lanes, one step darker than the canvas so white cards read against them.
- **Card White** (`work-card`): task cards, dashboard panels, the workspace header band, popovers.
- **Ink** (`ink`) and **Ink Muted** (`ink-muted`): primary and secondary text on light surfaces.
- **Muted Fill** (`fill-muted`) and **Hover Tint** (`fill-hover`): segmented-control troughs and quiet hover fills on light.
- **Hairline** (`line`) and **Input Stroke** (`line-input`): 1px dividers and borders on light; field strokes.

Task state in the app uses Tailwind status tints rather than system colours: overdue is red (`red-300` on navy, `red-600/700` on light), due today is `blue-700` on light, and priority chips use 50-step tint fills with a 1px inset ring in emerald (low), amber (medium) and red (high).

**The Navy Frame Rule.** Navy is the frame, not the floor, of the signed-in app: top bar, agenda dock, agenda drawer, and the selected day tile. Long-session work areas (boards, task lists, calendars, settings forms) sit on Work Canvas and Card White.

**The Two Blues Rule.** Forward Blue marks (underlines, rings, tints, selected states, focus). Deep Forward Blue fills anything that carries white text on a light surface. Don't swap them.

**The Project Dot Rule.** A project's own colour appears only as a small dot (8–12px, 3px corners) beside its name, or as a short bar under a day in the week strip. Never as a fill, a card side border, or a header band.

**The Signal Budget Rule.** Blue establishes the primary path. Cyan and violet appear as small, meaningful accents, never as competing page-wide decoration.

## Typography

**Display Font:** Inter (with sans-serif fallback)

**Body Font:** Inter (with sans-serif fallback)

**Character:** Inter is the bound brand face (recorded as a deliberate detector exception in `.impeccable/config.json`). It keeps dense planning information legible at 11–14px and gives landing headlines a confident, close-tracked presence.

### Hierarchy

- **Display** (600, `clamp(2.25rem, 6vw, 4.5rem)`, 1.0, -0.04em): landing hero promise only.
- **Headline** (600, `clamp(1.875rem, 4vw, 2.25rem)`, 1.2, -0.035em): landing section and callout statements.
- **Page Title** (600, 24px rising to 28px at `sm`, -0.025em): the one h1 per app page: the date on My work, "All projects", the project name (20px rising to 24px in the workspace header).
- **Title** (600, 16–18px, 0em): panel headings ("My agenda", "My tasks"), the board picker (18px), column names (14px).
- **Body** (400, 1rem, 1.75): landing explanatory copy in short line lengths.
- **UI** (500, 14px): task titles, tabs, buttons, list rows; the working voice of the app.
- **Meta** (400–500, 12px, tabular numerals): due times, dates, counts, project names under a task. Chips step down to 11px semibold.
- **Label** (500, 0.75rem, 0.16em, uppercase): landing preview only; see Don'ts.

**The Tracking Split Rule.** Negative tracking belongs to display sizes. The app base layer resets h1–h4, buttons and fields to 0em; only the page h1 takes -0.025em. Landing headings keep -0.035em to -0.04em.

**The Tabular Time Rule.** Every date, time and count (`time` elements and `.tabular-nums`) is set with tabular numerals so agenda columns and counters never jitter.

**The Next-Action Hierarchy Rule.** The highest contrast and largest type should make the next decision clear; supporting labels and metadata should stay visibly quieter.

## Layout

**Landing.** A centred 1280px content frame with 20/32/40px insets. Hero copy sits in a 768px measure, followed by a wide workspace preview. Sections use 80px vertical intervals on small screens and 96–112px at large sizes; the preview collapses from three panes to one stack below 1024px.

**Signed-in shell.** A sticky 56px navy top bar spans the viewport: brand, "My work" tab, up to five project tabs (three below `xl`, four below `2xl`) with the open project always among the first three, an overflow "+N more" menu, an All-projects icon tab, then a search trigger (176–224px wide with a Ctrl K hint) and the avatar. Below 768px the tabs collapse into a single project picker.

In the project workspace a 340px agenda dock sits left of the work area from 1024px up, sticky beneath the top bar at full remaining height; it collapses to a 56px rail showing overdue and today counts, and that choice persists. Below 1024px the dock becomes a left drawer (`min(22rem, 88vw)`) opened from an "Agenda" button on the view-tab row.

**Work area.** Page content uses a 16/24/32px inset with a 28px top block. My work is capped at 1400px: a heading block, a 7-day strip (7 equal columns, 6–8px gaps), then a task panel beside a 320px aside (calendar, projects) that stacks below 1024px. The board fills up to 1600px: lanes stack one per row on phones, two per row from 640px, and from 1024px become a horizontal row of lanes at least 240px wide that scrolls sideways. Lane and card gaps are 16px and 8–12px.

## Elevation & Depth

The two registers use different depth. The landing page is a hybrid of opaque navy layering, fine translucent borders and ambient blue glow on its few hero elements. The signed-in app is flat at rest and uses neutral slate-tinted offset shadows that grow only with interaction, plus tonal steps (canvas, lane, card) for structure. Navy shell surfaces have no shadow except the mobile drawer.

### Shadow Vocabulary

Landing only:

- **Action Glow** (`0 10px 28px rgba(59,130,246,0.30)`): landing primary CTA.
- **Brand Glow** (`0 8px 24px rgba(59,130,246,0.35)`): landing logo tile.
- **Selection Glow** (`0 5px 16px rgba(59,130,246,0.45)`): landing preview's selected calendar date.
- **Preview Lift** (`0 32px 90px rgba(0,0,0,0.42)`): the landing workspace evidence.

Signed-in app:

- **Card Rest** (`0 1px 2px rgb(15 23 42 / 0.06)`): task cards at rest.
- **Card Hover** (`0 4px 12px rgb(15 23 42 / 0.08)`): task card hover, with the border stepping to slate-300.
- **Drag Lift** (`0 12px 32px rgb(15 23 42 / 0.18)`): a card or lane while dragged; the lane overlay also takes a 1px blue-400 ring.
- **Segment Raise** (`0 1px 2px rgb(15 23 42 / 0.1)`): the selected segment in a light segmented control.
- **Drawer Cast** (`8px 0 32px rgb(0 0 0 / 0.35)`): the mobile agenda drawer over a 60% navy scrim.

**The No-Glow Workspace Rule.** Signed-in surfaces never use coloured or blue-tinted shadows. Elevation in the app is a neutral offset that answers interaction (hover, drag, overlay).

**The Opaque Workspace Rule.** Use solid layers and quiet 1px borders for structure. Do not use generic glassmorphism or blur-heavy panels.

## Shapes

Gently rounded and disciplined. Project dots use 3px corners (squared, not circles); nested items inside a group and the shared button primitive use 6px; standalone shell controls, agenda rows, task cards and segmented troughs use 8px; lanes, dashboard panels and day tiles use 12px; landing feature containers use 16px. Borders are 1px: translucent blue on navy, `line` on light, dashed for empty states. Full circles are reserved for avatars, column status dots and the "You" ownership chip; buttons and tags are not pills.

## Components

### Buttons

**Character:** clear routes forward, never decorative objects.

- **Landing primary:** 44px high, 8px rounded, Forward Blue fill, white semibold text, 20px horizontal padding, Action Glow. Hover lifts to `action-blue-hover`; focus is a pale blue 2px outline offset from the control. White text on this fill sits below 4.5:1; it is incumbent landing drift, not a pattern for new surfaces.
- **Landing outline:** 44px high, 8px rounded, transparent, 1px translucent blue border, Blue-White semibold text; hover strengthens the border and adds a faint white fill.
- **App primary:** 36px high, 6px rounded, Deep Forward Blue fill, white 14px medium text, 16px padding (12px beside an icon), a leading 16px icon when it creates something. Hover drops to 90% opacity of the fill; focus adds a 3px ring. One per work header ("New task").
- **App outline / ghost:** outline is 36px on the canvas colour with a 1px hairline ("Add column"); ghost is text-only with a Hover Tint fill, used for lane "Add task" rows and 28–32px icon buttons (drag handle, options).
- **Shell icon button:** 32px square, 6px rounded, Shell Mist icon, Shell Hover Navy fill and white icon on hover.

### Navigation

- **Top-bar tabs:** full-height 14px medium text in Shell Mist; hover and active go white; active carries a 2px Forward Blue underline inset 12px from each side. Project tabs lead with their dot and truncate at 160px.
- **View tabs (light):** 40px high, 14px medium, 2px bottom border in Forward Blue when selected, Ink Muted otherwise; icons hide below 640px.
- **Mobile picker:** 36px, 8px rounded trigger in white text with a chevron; the menu lists My work, every project with its dot, then All projects.
- **Command palette:** a 576px dialog set 18% from the top with a 48px search field, 6px rounded items with Hover Tint selection, project dots and tabular open-task counts, and a keyboard-hint footer.

### Segmented Range

A three-way range switch (Overdue, Today, 7 days) with counts. On navy: an 8px trough at 6% white with 32px, 6px rounded segments; the selected segment is a solid Deep Forward Blue fill with white text (about 5.2:1); unselected is Shell Mist, and a non-zero overdue count turns red-300. On light (My tasks): a Muted Fill trough with 28px segments; the selected segment is Card White with Segment Raise.

### Agenda Row

The dock's task row: an 8px rounded button with 12px by 10px padding, a two-line-clamped white 14px title, a 12px meta line (project dot, project name) and a right-aligned tabular due time (red-300 when overdue). Hover fills Shell Hover Navy. A row whose task is on the open board takes a 14% Forward Blue tint and appends "On this board" in blue-300: the link between the personal agenda and the board.

### Board Lane and Task Card

- **Lane:** 12px rounded Lane Grey-Blue column with 12px padding, a 10px status dot in the column's colour, a 14px semibold title, a tabular count, a ghost "Add task" row, and the card stack.
- **Task card:** 8px rounded Card White with a 1px hairline, 12px padding and Card Rest. A 14px medium title (two-line clamp, links to blue on hover), optional 12px muted description, 11px slate tag chips (4px rounded), then a footer: priority chip, due date with a calendar icon (red-600 overdue, blue-700 semibold "Today"), and at the far end either a "You" chip (blue-50 fill, blue-700 text, full round) or the assignee's 24px avatar. Ownership is marked only this way.

### Week Strip

Seven 12px rounded day tiles: Card White with a hairline by default, slate-300 border on hover. The selected day becomes a navy tile (Night Field fill, white numeral, Shell Mist weekday). Each tile shows up to four short project-colour bars and a "+N" overflow.

### Work Panel

Dashboard sections are 12px rounded Card White panels with a 1px hairline, a header row (16px semibold title, controls) divided from a `divide-y` list of rows that tint slate-50 on hover. Empty states are centred text with one next-step link or button; board and agenda empty states use a dashed border.

### Landing Containers

- **Workspace preview:** 16px rounded Workbench Navy, 1px Blue Mist Border, 8–12px inset, Preview Lift.
- **Feature callout:** 16px rounded, restrained blue-to-violet tonal gradient, 1px subtle border, 24–40px padding; a single end-of-flow prompt.
- **Workflow step:** a 40px, 12px rounded icon holder with a blue-toned border and fill on a thin blue-to-violet connector.

## Do's and Don'ts

### Do:

- **Do** keep navy as the identity: the landing canvas, the app top bar, the agenda dock and drawer, and the selected day tile.
- **Do** put long-session work (boards, task lists, calendars, forms) on Work Canvas with Card White panels and Lane Grey-Blue lanes.
- **Do** fill white-text buttons on light surfaces with Deep Forward Blue (#2563eb), and use Forward Blue (#3b82f6) for underlines, rings, tints and selection.
- **Do** set every date, time and count in tabular numerals.
- **Do** mark the user's own tasks with the "You" chip or their avatar.
- **Do** use 8px controls and 12px surfaces with 1px borders; in the app, neutral offset shadows that grow only with hover or drag.
- **Do** keep negative tracking for landing display sizes and the page h1 (-0.025em); everything else in the app sits at 0em.

### Don't:

- **Don't** use blue or coloured glows in the signed-in app; glow is a landing-page device only.
- **Don't** fill a project's colour across cards, headers or side borders; project colour is a small dot or day bar.
- **Don't** put small white text on Forward Blue (#3b82f6); it reads at about 3.7:1.
- **Don't** add uppercase, letter-spaced kicker labels above app headings; the uppercase Label style stays confined to the landing preview it shipped in.
- **Don't** introduce generic glass panels, strong backdrop blur, or milky transparency.
- **Don't** turn buttons and tags into pills without a task-state reason.
- **Don't** distribute bright cyan, violet, and blue evenly across a screen; the signal budget is deliberate.
- **Don't** replace task, board, agenda, or due-date evidence with abstract SaaS icon grids or invented product claims.
