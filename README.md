# HR Workflow Designer

A frontend prototype for designing, configuring, validating, and simulating HR workflows such as onboarding, leave approval, and document verification.

## Architecture

The app is built with `React`, `Vite`, `Zustand`, and `React Flow`.

- `src/App.jsx`
  Composes the main workspace layout: sidebar, canvas, node configuration, insights, and simulation.
- `src/hooks/useWorkflow.js`
  Central workflow store for nodes, edges, selection, template loading, auto-layout, validation state, and canvas interaction handling.
- `src/components/canvas`
  React Flow canvas integration, drag/drop node creation, quick add actions, minimap, and zoom controls.
- `src/components/forms`
  Dynamic node configuration UI that changes fields based on the selected node type.
- `src/components/sidebar`
  Workflow starter templates and node palette.
- `src/components/simulation`
  Serializes the workflow, runs the mocked simulation flow, and displays execution logs.
- `src/components/insights`
  Shows lightweight workflow metrics and readiness indicators.
- `src/services`
  Mock API layer for automation actions and simulation responses.
- `src/utils/validation.js`
  Graph and form validation logic for required structure and field checks.

State is intentionally centralized in Zustand so the canvas, form panel, and simulation panel all react to the same source of truth.

## How To Run

### Prerequisites

- `Node.js` 18+ recommended
- `npm`

### Install

```bash
npm install
```

### Start the app

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

### Production build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Design Decisions

- `React Flow` was chosen because the problem is inherently graph-based and benefits from direct node/edge interaction.
- `Zustand` keeps the workflow graph, selection, validation, and simulation state simple without introducing heavy boilerplate.
- The backend is mocked through a service layer so the UI can later be connected to real APIs without rewriting the components.
- Workflow starter templates were added to make the prototype immediately usable for evaluators instead of starting from a blank screen every time.
- Validation was kept centralized instead of scattered across components so the rules stay easy to extend.
- The canvas drag logic was intentionally optimized to avoid recomputing heavy state on every mouse move, which prevents white-screen crashes while moving cards.

## What they completed vs. what they would add with more time

### What Was Completed

- Drag-and-drop workflow canvas using React Flow
- Start, task, approval, automated, and end node types
- Dynamic node configuration panel
- Edge creation and node deletion
- Workflow starter templates
- Graph validation for core workflow rules
- Mock automation API and mock simulation API
- Simulation panel with serialized workflow JSON and execution logs
- Mini-map and zoom controls
- Auto-layout / auto-arrange support
- Dashboard-style insights panel
- Fix for canvas white-screen behavior during node dragging
- Export and Import workflow JSON state
- Undo and redo history functionality with state checkpointing
- Dual theme support (Dark and Light modes) with glassmorphic aesthetic architecture

### What I Would Add With More Time

- Persistent backend storage for workflows
- Branch conditions on edges such as approve/reject/fallback
- Collaborative editing or presence indicators
- More advanced auto-layout using a dedicated layout engine such as ELK or Dagre
- Better test coverage with unit tests and end-to-end interaction tests
- Accessibility improvements and keyboard-first canvas controls
- Workflow execution playback that highlights active nodes step by step
