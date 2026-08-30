# SAGASU 探す

### AI-powered job discovery

> **探す (sagasu)** — to search, to look for.

SAGASU is a personal job discovery tool designed to automate the repetitive parts of finding a job.

Instead of manually searching across multiple job boards, opening dozens of listings, comparing requirements with your CV, and keeping track of applications, SAGASU aims to do the searching and filtering for you.

```text
Your Profile
     │
     ▼
   SAGASU
     │
     ├── Discover jobs
     ├── Remove duplicates
     ├── Match your skills
     ├── Rank opportunities
     └── Prepare applications
             │
             ▼
        You decide
        where to apply
```

## Status

**Early development — Frontend**

The current repository contains the SAGASU frontend.

The backend, job ingestion pipeline, matching engine, and AI services are planned as separate components.

### Current

* [x] Initial frontend
* [x] Job discovery UI
* [x] Job listing interface
* [x] Job detail interface
* [x] Profile-oriented UI
* [ ] Backend API
* [ ] Database
* [ ] Job source integrations
* [ ] Job deduplication
* [ ] Job matching engine
* [ ] AI job analysis
* [ ] Application tracking
* [ ] Application generation
* [ ] Browser-assisted applications

---

## Why SAGASU?

Job hunting contains a surprising amount of repetitive work.

```text
Search
  ↓
Open listing
  ↓
Read requirements
  ↓
Compare with CV
  ↓
Save / Ignore
  ↓
Repeat
```

SAGASU is built around a different workflow:

```text
Define your profile once
        ↓
SAGASU searches
        ↓
SAGASU filters
        ↓
SAGASU ranks
        ↓
You review
        ↓
You apply
```

The goal isn't to apply to as many jobs as possible.

The goal is to find **better opportunities with less manual searching**.

---

## Vision

SAGASU is intended to evolve from a job discovery interface into a personal job-search agent.

### Discovery

Find relevant opportunities across multiple sources.

### Matching

Compare job requirements against the user's actual skills and experience.

### Intelligence

Explain why a job is a good or bad match.

### Preparation

Help prepare resumes, cover letters, and application answers.

### Automation

Eventually assist with repetitive application workflows while keeping the user in control.

---

## Architecture

SAGASU is designed as a separated frontend/backend system.

```text
┌──────────────────────┐
│     SAGASU Web       │
│                      │
│ Svelte + TypeScript  │
└──────────┬───────────┘
           │
        HTTP API
           │
           ▼
┌──────────────────────┐
│     SAGASU API       │
│                      │
│    Bun + Elysia      │
└──────────┬───────────┘
           │
     ┌─────┼─────┐
     ▼     ▼     ▼
 PostgreSQL Queue  AI
```

The frontend and backend are intentionally separate applications.

This allows the frontend to evolve independently from the job ingestion, matching, and automation systems.

---

## Tech Stack

### Frontend

* [Svelte](https://svelte.dev/)
* TypeScript
* Vite

### Planned Backend

* Bun
* Elysia
* TypeScript
* PostgreSQL

### Planned Infrastructure

* Background job queue
* AI provider
* Object storage
* Playwright for browser-assisted applications

---

## Project Structure

The repository is currently focused on the frontend.

The planned architecture is:

```text
sagasu/
│
├── apps/
│   ├── web/                 # Svelte frontend
│   └── api/                 # Bun + Elysia backend
│
├── packages/
│   ├── api-contract/        # Shared API schemas
│   └── shared/
│
└── docs/
    ├── PRD.md
    └── design.md
```

The frontend and backend will communicate through a versioned API rather than sharing implementation details.

---

## Roadmap

### Phase 1 — Foundation

* [x] Frontend foundation
* [x] Job discovery interface
* [ ] Profile management
* [ ] API contract

### Phase 2 — Job Discovery

* [ ] Backend API
* [ ] PostgreSQL
* [ ] Job source adapters
* [ ] Job normalization
* [ ] Deduplication

### Phase 3 — Matching

* [ ] Skill extraction
* [ ] Deterministic job scoring
* [ ] Match explanations
* [ ] Advanced filtering

### Phase 4 — AI

* [ ] AI job analysis
* [ ] Semantic matching
* [ ] Resume tailoring
* [ ] Cover letter generation
* [ ] Application answer generation

### Phase 5 — Automation

* [ ] Scheduled job discovery
* [ ] Notifications
* [ ] Application tracking
* [ ] Playwright-assisted applications
* [ ] Human-approved submission

---

## Design Principles

### Deterministic before AI

Use conventional software for things that can be reliably calculated:

* validation
* filtering
* scoring
* deduplication
* state transitions

Use AI where semantic reasoning is actually useful:

* understanding job descriptions
* explaining compatibility
* generating application materials
* semantic matching

### Human-in-the-loop

SAGASU should assist with applications, not blindly spam them.

The intended flow is:

```text
SAGASU finds
      ↓
SAGASU analyzes
      ↓
SAGASU prepares
      ↓
You review
      ↓
You approve
```

### API-first

Frontend and backend should remain independently deployable.

---

## Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/christofelkev/sagasunih.git
cd sagasunih

npm install
```

Start the development server:

```bash
npm run dev
```

> The exact commands may change as the project structure evolves.

---

## Documentation

Project documentation lives in [`docs/`](./docs/).

* [`PRD.md`](./docs/PRD.md) — product requirements and roadmap
* [`design.md`](./docs/design.md) — technical architecture and design decisions

---

## Project Status

SAGASU is currently a personal project in active development.

The frontend is being built first to establish the product experience before implementing the backend and automation infrastructure.

> **Search less. Find better.**
>
> **SAGASU 探す**
