---
name: FocusFlow
description: Calm, task-first shared-work management in a precise deep-navy interface.
colors:
  navy-field: "#08142d"
  navy-surface: "#0b1630"
  navy-section: "#0a1834"
  action-blue: "#3b82f6"
  action-blue-hover: "#60a5fa"
  signal-violet: "#a78bfa"
  signal-cyan: "#22d3ee"
  text-primary: "#ffffff"
  text-secondary: "#dbeafe"
  border-subtle: "rgba(147,197,253,0.15)"
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
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.16em"
rounded:
  control: "8px"
  surface: "12px"
  feature: "16px"
spacing:
  compact: "8px"
  control: "12px"
  component: "16px"
  section: "80px"
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

FocusFlow is a quiet, capable workspace for turning shared project activity into a clear next task. A deep navy field keeps the page calm and concentrated; blue light indicates the route forward, while cyan and violet distinguish small task signals without competing for attention.

The system is spacious and task-led rather than dashboard-dense. Large, direct headings establish intent, then contained work evidence—boards, agendas, due dates, and a short process—does the explaining. Depth is present but soft: restrained borders, tonal shifts, and diffuse blue shadows give hierarchy without making the interface feel glossy or ornamental.

**Key Characteristics:**

- Deep navy canvas with slightly lighter, opaque work surfaces.
- Blue is the action color; cyan and violet are sparse status signals.
- Inter typography is compact, clear, and weighted toward actionable hierarchy.
- Rounded 12–16px surfaces and 8px controls keep structure friendly but precise.
- Generous whitespace frames a concrete path from project plan to next task.

**Source evidence:** [PRODUCT.md](PRODUCT.md), [LandingPage.tsx](frontend/src/pages/LandingPage.tsx), [index.css](frontend/src/index.css), and the reviewed render at `C:\Users\USER\AppData\Local\Temp\focusflow-landing-reviewed.png`.

## Colors

The palette uses low-luminance navy layers as the working environment, with a narrow spectrum of blue-led signals reserved for action and task state.

### Primary

- **Forward Blue** (`action-blue`): the decisive action color for primary CTAs, the logo tile, and selected calendar dates. Use its lighter hover companion only for an interactive response.

### Secondary

- **Planning Violet** (`signal-violet`): a limited task-state marker and gradient endpoint; it should remain subordinate to blue actions.

### Tertiary

- **Attention Cyan** (`signal-cyan`): a crisp marker for links, calendar dots, and selected task signals where a small point of attention is useful.

### Neutral

- **Night Field** (`navy-field`): the uninterrupted page canvas.
- **Workbench Navy** (`navy-surface`) and **Section Navy** (`navy-section`): opaque tonal steps that separate the workspace preview and process band from the field.
- **Clear White** (`text-primary`) and **Blue-White** (`text-secondary`): headings use the brightest text; supporting information recedes into blue-white opacity.
- **Blue Mist Border** (`border-subtle`): the 1px boundary for contained surfaces and dividers.

**The Signal Budget Rule.** Blue establishes the primary path. Cyan and violet appear as small, meaningful accents, never as competing page-wide decoration.

## Typography

**Display Font:** Inter (with sans-serif fallback)

**Body Font:** Inter (with sans-serif fallback)

**Character:** Inter provides an economical, modern voice that keeps planning information legible at small sizes while giving the hero and section headings a confident, close-tracked presence.

### Hierarchy

- **Display** (600, `clamp(2.25rem, 6vw, 4.5rem)`, 1.0): centred promise statements and highest-level page intent.
- **Headline** (600, `clamp(1.875rem, 4vw, 2.25rem)`, 1.2): section and callout statements.
- **Title** (600, 1.125–1.25rem, 1.3): workspace pane titles and task-focused headings.
- **Body** (400, 1rem, 1.75): explanatory copy, kept in short, generous line lengths.
- **Label** (500, 0.75rem, `0.16em`, uppercase): compact context markers such as “Today.”

**The Next-Action Hierarchy Rule.** The highest contrast and largest type should make the next decision clear; supporting labels and metadata should stay visibly quieter.

## Layout

The landing page is built around a centred 1280px (`max-w-7xl`) content frame with responsive horizontal insets of 20px, 32px, and 40px. Hero copy is centred in a narrower 768px measure, followed by a wide workspace preview that carries the product proof.

Sections use generous vertical intervals (80px on small screens, 96–112px at large sizes). The workspace preview collapses from three panes to one stacked sequence below the large breakpoint; the process section shifts from a paired explanation/timeline composition to a readable vertical flow. Controls stack before the small breakpoint and become horizontal only when that improves scanability.

## Elevation & Depth

Depth is a hybrid of opaque tonal layering, fine translucent boundaries, and ambient blue glow. The field and surfaces remain dark and solid; shadows highlight a primary action, selected date, logo, or the large product preview rather than lifting every container.

### Shadow Vocabulary

- **Action Glow** (`0 10px 28px rgba(59,130,246,0.30)`): primary CTA emphasis.
- **Brand Glow** (`0 8px 24px rgba(59,130,246,0.35)`): compact identity mark emphasis.
- **Selection Glow** (`0 5px 16px rgba(59,130,246,0.45)`): active calendar day.
- **Preview Lift** (`0 32px 90px rgba(0,0,0,0.42)`): the only large-scale elevation, reserved for the workspace evidence.

**The Opaque Workspace Rule.** Use solid navy layers and quiet 1px translucent borders for structure. Do not use generic glassmorphism or blur-heavy panels.

## Shapes

The geometry is gently rounded and disciplined: 8px controls, 12px compact internal surfaces, and 16px feature containers. Borders are usually 1px and translucent, used to define a boundary without drawing a hard grid. Circular forms are limited to status dots, window controls, and the small brand emblem; buttons and containers are not pills by default.

## Components

### Buttons

**Character:** clear routes forward, never decorative objects.

- **Primary:** 44px high, 8px rounded, Forward Blue fill, white semibold text, 20px horizontal padding, and an ambient blue shadow. Hover lightens the fill to `action-blue-hover`; visible keyboard focus uses a pale blue 2px outline offset from the control.
- **Outline:** 44px high, 8px rounded, transparent background, 1px translucent blue border, and blue-white semibold text. Hover strengthens the border and adds a very low-opacity white fill.
- **Text navigation:** compact 8px rounded hit area with quiet blue-white text; hover may reveal a faint white background, but active navigation stays restrained.

### Containers

**Character:** structured work areas, not a repeated collection of generic cards.

- **Workspace preview:** 16px rounded, opaque Workbench Navy surface, 1px Blue Mist Border, 8–12px outer inset, and Preview Lift. Internal panes divide with the same subtle 1px line.
- **Task detail surface:** 12px rounded with a very low-opacity white fill and 1px subtle border; use for concrete task evidence within a larger work area.
- **Feature callout:** 16px rounded with a restrained blue-to-violet tonal gradient, 1px subtle border, and 24–40px padding. It is a single end-of-flow prompt, not a reusable floating card pattern.

### Workflow Step

The process uses a 40px square, 12px rounded icon holder with blue-toned border and fill, aligned to a thin blue-to-violet vertical connector. The icon, title, and brief description form a clear progression; on the final step, the connector stops.

### Task Row

A task row is an open list item with a 16px circular completion marker, a clear title, subdued project metadata, and a small colored time/status dot. Hover can reveal only a faint white surface tint; the list remains lighter than a full card stack.

### Calendar Selection

The active date is a 28px square with an 8px corner radius, Forward Blue fill, white semibold numeral, and compact blue shadow. Unselected dates remain text-first; a cyan dot can mark task presence without turning every date into a badge.

## Do's and Don'ts

### Do:

- **Do** keep the primary canvas dark navy and make surfaces only incrementally lighter.
- **Do** reserve blue for primary action and selected state; use cyan and violet as sparse task signals.
- **Do** use Inter semibold headings with tight negative tracking and softer blue-white supporting copy.
- **Do** favour one wide, task-specific evidence composition over a grid of generic feature panels.
- **Do** use 8px controls and 12–16px surfaces with 1px translucent boundaries and soft blue shadow only where hierarchy needs it.

### Don't:

- **Don't** introduce generic glass panels, strong backdrop blur, or milky transparency.
- **Don't** turn every container into a card, or turn buttons and tags into pills without a task-state reason.
- **Don't** distribute bright cyan, violet, and blue evenly across a screen; the signal budget is deliberate.
- **Don't** replace task, board, agenda, or due-date evidence with abstract SaaS icon grids or invented product claims.
