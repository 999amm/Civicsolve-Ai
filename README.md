# CIVICSOLVE AI — Hackathon MVP

CIVICSOLVE AI is a working civic-tech application that turns real-world problems into structured **AI Problem Genomes™**, routes them to relevant partners, creates collaborative projects, moves those projects into pilot, and reflects the resulting change in an impact dashboard.

The repo is intentionally dependency-light for the hackathon demo: the frontend is a TypeScript SPA served by Node, while the backend is FastAPI with deterministic mock AI services. The architecture is ready to swap the mock functions for an LLM + embeddings + PostgreSQL/PostGIS stack later.

## Repo layout

```text
/frontend
  index.html
  package.json
  tsconfig.json
  serve.mjs
  /src
    api.ts
    main.ts
    state.ts
    styles.css
    types.ts
/backend
  main.py
  requirements.txt
.env.example
README.md
```

## Requirements

- Node.js 20+
- Python 3.11+

No API keys are required for the demo.

## Run locally

### 1) Backend

```bash
cd backend
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Backend health check:

```text
http://127.0.0.1:8000/api/health
```

### 2) Frontend

Open a second terminal. The compiled demo is included, so no npm install is required just to run it:

```bash
cd frontend
npm run dev
```

To rebuild the TypeScript source after editing it, install the dev dependency and build:

```bash
npm install
npm run build
```

Then open:

```text
http://localhost:3000
```

The build uses TypeScript and emits compiled JS into `frontend/dist`.

## Demo credentials

None. The application is an open local demo.

## Exact 3-minute hackathon demo

**0:00–0:20 — Dashboard**

Show the five headline metrics and the map. Say: “CIVICSOLVE is the coordination layer between a messy civic problem and the organizations capable of solving it.”

**0:20–0:55 — Submit Problem**

Click **Submit Problem**. The form is prefilled with the monsoon drinking-water contamination problem. Walk through the three steps: problem, context, evidence.

**0:55–1:20 — AI Problem Genome™**

Click **Analyze with AI**. The AI processing state runs, then show Domain, Root Cause, Severity, Location, Skills, SDG and Evidence. Point at the similarity scores and explain that semantic matching can catch differently worded versions of the same underlying civic issue.

**1:20–1:50 — AI Matches**

Click **Find matching partners**. Show the 94% Environmental Engineering match, Public Health, IoT Water Monitoring Lab, Industry and NGO examples. Explain that the score is based on the structured genome in the demo.

**1:50–2:15 — Adopt Challenge**

Click **Adopt challenge →**. Keep the suggested project name **Monsoon Water Safety Initiative**, then click **Create Project**.

**2:15–2:45 — Project Workspace**

Show the timeline and project checklist. Click **Move to Pilot →**. The backend updates the project state and the active project progress bar.

**2:45–3:00 — Impact**

Open **Impact**. The metrics now reflect the pilot, showing the end-to-end flow from problem → matching → adoption → project → pilot → impact.

## AI architecture seam

The backend has explicit functions for the eventual real AI layer:

- `analyze_problem()`
- `generate_problem_genome()`
- `find_similar_problems()`
- `match_experts()`
- `generate_next_action()`

The current implementation returns deterministic structured JSON, so the pitch does not depend on secret keys, network access or flaky external services.

## Production path

For a production build, keep the UI contracts and replace the mock layer with:

- FastAPI + PostgreSQL/PostGIS for persistence and geospatial querying
- Embeddings/vector search for semantic problem matching
- LLM structured extraction for the Problem Genome
- Leaflet (or MapLibre) for a true interactive map layer
- Realtime project collaboration and evidence storage
- Role-based access for citizens, NGOs, universities, researchers, industry and government bodies

### One-command demo launcher

After backend dependencies are installed:

```bash
./run_demo.sh
```

This starts FastAPI on `127.0.0.1:8000` and the frontend on `localhost:3000`.
