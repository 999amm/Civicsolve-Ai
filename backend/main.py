from __future__ import annotations

from copy import deepcopy
from typing import Any
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="CIVICSOLVE AI Mock API", version="1.0.0")
raw_origins = os.getenv("CORS_ORIGINS", "http://127.0.0.1:3000,http://localhost:3000")
allowed_origins = [item.strip() for item in raw_origins.split(",") if item.strip()]
allow_all_origins = "*" in allowed_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all_origins else allowed_origins,
    allow_credentials=not allow_all_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

CHALLENGES: list[dict[str, Any]] = [
    {"id":"CH-104","title":"Rural drinking-water contamination during monsoon","category":"Water + Public Health","location":"Maharashtra, India","severity":"HIGH","affected":8400,"status":"ACTIVE","summary":"Seasonal runoff contaminates local drinking-water sources; filtration and monitoring coverage is insufficient.","coords":{"x":52,"y":42}},
    {"id":"CH-102","title":"Waste segregation gaps in urban wards","category":"Waste & Circular Economy","location":"Chhatrapati Sambhajinagar, Maharashtra","severity":"HIGH","affected":18600,"status":"ACTIVE","summary":"Household segregation is inconsistent and ward-level collection routes are not optimized for separated streams.","coords":{"x":51,"y":50}},
    {"id":"CH-099","title":"Flood-prone road infrastructure near low-lying colonies","category":"Climate + Infrastructure","location":"Pune, Maharashtra","severity":"CRITICAL","affected":12500,"status":"ACTIVE","summary":"Repeated monsoon waterlogging blocks ambulances, school routes and access to essential services.","coords":{"x":50,"y":46}},
    {"id":"CH-097","title":"Rural healthcare access across last-mile villages","category":"Healthcare Access","location":"Nashik, Maharashtra","severity":"HIGH","affected":22100,"status":"ACTIVE","summary":"Patients travel long distances for diagnostics and specialist consultation, causing delayed care.","coords":{"x":46,"y":44}},
    {"id":"CH-094","title":"Agricultural crop disease detection for small farms","category":"Agriculture & Food Systems","location":"Kolhapur, Maharashtra","severity":"MEDIUM","affected":9700,"status":"ACTIVE","summary":"Late identification of crop disease increases yield loss where agronomy support is intermittent.","coords":{"x":49,"y":56}},
    {"id":"CH-091","title":"Public transport accessibility for disabled commuters","category":"Transport & Accessibility","location":"Mumbai, Maharashtra","severity":"HIGH","affected":14300,"status":"ACTIVE","summary":"First/last-mile gaps and inconsistent accessibility data make trip planning unreliable.","coords":{"x":43,"y":51}},
    {"id":"CH-088","title":"School sanitation and handwashing consistency","category":"Education & Sanitation","location":"Jalgaon, Maharashtra","severity":"MEDIUM","affected":6100,"status":"ACTIVE","summary":"Schools report uneven availability of functional handwash stations and consumables.","coords":{"x":51,"y":36}},
    {"id":"CH-082","title":"Local air-quality monitoring around traffic corridors","category":"Climate & Air Quality","location":"Nagpur, Maharashtra","severity":"MEDIUM","affected":19800,"status":"ACTIVE","summary":"Public monitoring is sparse around congestion corridors, limiting hyperlocal awareness and action.","coords":{"x":64,"y":39}},
]

MATCHES = [
    {"id":"U01","name":"Environmental Engineering Department","type":"University department","match":94,"expertise":["Water Systems","Environmental Modelling"],"reason":"Direct fit to runoff, filtration and water-quality requirements.","location":"Aurangabad, Maharashtra","availability":"Available"},
    {"id":"R02","name":"Public Health Research Group","type":"Research group","match":91,"expertise":["Public Health","Epidemiology"],"reason":"Strong fit for affected-population measurement and health indicators.","location":"Pune, Maharashtra","availability":"2 collaborators"},
    {"id":"L03","name":"IoT Water Monitoring Lab","type":"University lab","match":87,"expertise":["IoT","Sensors","Edge ML"],"reason":"Relevant sensing stack for low-cost monsoon monitoring.","location":"Nashik, Maharashtra","availability":"Available"},
    {"id":"I04","name":"Water Technology Company","type":"Industry partner","match":84,"expertise":["Filtration","Water Testing"],"reason":"Can accelerate prototype access and field procurement.","location":"Mumbai, Maharashtra","availability":"Pilot partner"},
    {"id":"N05","name":"JalSetu Foundation","type":"NGO","match":81,"expertise":["Community Health","Rural Programs"],"reason":"Field presence supports community consent, sample collection and pilot adoption.","location":"Nashik, Maharashtra","availability":"Field team ready"},
]

PROJECTS: dict[str, dict[str, Any]] = {}

class AnalyzePayload(BaseModel):
    title: str
    description: str
    category: str
    location: str
    severity: str
    affected: int = Field(ge=0)
    evidence: str
    expertise: list[str] = []

class AdoptPayload(BaseModel):
    challenge_id: str
    project_name: str

class StatusPayload(BaseModel):
    status: str

def analyze_problem(payload: AnalyzePayload) -> dict[str, Any]:
    """Mock AI service: same interface can later be replaced by a real LLM/embedding pipeline."""
    title = payload.title.lower()
    water = "water" in title or "drinking" in title or "contamin" in title or "filtration" in payload.description.lower()
    genome = generate_problem_genome(payload, water=water)
    similarities = find_similar_problems(genome)
    matches = match_experts(genome)
    challenge = {
        "id":"CH-DEMO-01", "title":payload.title, "category":payload.category, "location":payload.location,
        "severity":payload.severity, "affected":payload.affected, "status":"SUBMITTED",
        "summary":payload.description[:180] + ("…" if len(payload.description)>180 else ""), "coords":{"x":52,"y":43}
    }
    if not any(c["id"]==challenge["id"] for c in CHALLENGES): CHALLENGES.insert(0, challenge)
    return {"challenge":deepcopy(challenge),"genome":genome,"matches":matches}

def generate_problem_genome(payload: AnalyzePayload, water: bool = False) -> dict[str, Any]:
    if water:
        skills = payload.expertise or ["Environmental Engineering","IoT","Water Quality","Public Health"]
        return {
            "domain":"Water + Public Health", "rootCause":"Runoff → filtration gap → low monitoring coverage",
            "severity":payload.severity, "location":payload.location, "skills":skills,
            "sdg":"SDG 6 — Clean Water and Sanitation", "evidence":payload.evidence or "GPS + submitted evidence",
            "semanticNote":"Semantic matching looks beyond exact keywords, so differently worded water-quality, filtration and monitoring problems can still connect to the same evidence and expertise graph.",
            "similarities":[{"title":"Water contamination monitoring","score":92,"id":"CH-082"},{"title":"Rural filtration failure","score":87,"id":"CH-097"},{"title":"Monsoon water quality","score":81,"id":"CH-104"}],
        }
    return {
        "domain":payload.category, "rootCause":"Recurring service gap with weak local sensing / coordination",
        "severity":payload.severity, "location":payload.location, "skills":payload.expertise or ["Data Science","Community Organizing"],
        "sdg":"SDG 11 — Sustainable Cities and Communities", "evidence":payload.evidence or "Submitted evidence",
        "semanticNote":"The demo converts the narrative into a consistent schema that can be indexed for semantic retrieval and collaboration routing.",
        "similarities":[{"title":"Related civic service challenge","score":88,"id":"CH-099"},{"title":"Community infrastructure gap","score":82,"id":"CH-102"},{"title":"Local monitoring need","score":76,"id":"CH-088"}],
    }

def find_similar_problems(genome: dict[str, Any]) -> list[dict[str, Any]]:
    return genome["similarities"]

def match_experts(genome: dict[str, Any]) -> list[dict[str, Any]]:
    # Deterministic scores are intentionally stable for the live pitch.
    return deepcopy(MATCHES)

def generate_next_action(project: dict[str, Any]) -> str:
    return "Move to pilot" if project["status"] in {"ADOPTED","RESEARCH","PROTOTYPE"} else "Attach impact evidence"

def project_payload(challenge: dict[str, Any], project_name: str) -> dict[str, Any]:
    return {
        "id": f"P-{100 + len(PROJECTS) + 1}", "name": project_name, "challengeId": challenge["id"],
        "description": f"A cross-disciplinary field project responding to: {challenge['title']}", "status":"ADOPTED", "team":["Environmental Engineering","Public Health","IoT"], "progress":18,
        "tasks":[
            {"title":"Validate root-cause assumptions with field evidence","owner":"Research lead","done":True},
            {"title":"Define low-cost monitoring prototype","owner":"IoT lab","done":False},
            {"title":"Run community baseline survey","owner":"NGO partner","done":False},
            {"title":"Set pilot success metrics","owner":"Impact lead","done":False},
        ],
        "evidence":["GPS-tagged sample set","Community baseline survey","Prototype test log"],
        "activity":[
            {"actor":"CIVICSOLVE AI","text":"Problem Genome attached to project.","time":"just now"},
            {"actor":"Project lead","text":"Team formed from 94%+ semantic matches.","time":"2 min ago"},
        ],
    }

@app.get("/")
def root(): return {"service":"CIVICSOLVE AI", "status":"ok", "docs":"/docs"}

@app.get("/api/health")
def health(): return {"status":"ok","service":"civicsolve-ai-mock-api"}

@app.get("/api/challenges")
def challenges(): return deepcopy(CHALLENGES)

@app.get("/api/matches")
def matches(): return deepcopy(MATCHES)

@app.get("/api/dashboard")
def dashboard():
    pilots = sum(1 for p in PROJECTS.values() if p["status"]=="PILOT")
    adopted = len(PROJECTS)
    impact = 41200 + pilots*1200
    return {"metrics":{"activeChallenges":len(CHALLENGES),"problemsAdopted":adopted,"projectsInPilot":pilots,"researchersConnected":18 + adopted*3,"communityImpact":impact},"recent":deepcopy(CHALLENGES[:5]),"highPriority":deepcopy([c for c in CHALLENGES if c["severity"] in {"HIGH","CRITICAL"}][:4]),"projects":deepcopy(list(PROJECTS.values()))}

@app.post("/api/problems/analyze")
def analyze(payload: AnalyzePayload): return analyze_problem(payload)

@app.post("/api/projects/adopt")
def adopt(payload: AdoptPayload):
    challenge = next((c for c in CHALLENGES if c["id"]==payload.challenge_id), CHALLENGES[0])
    project = project_payload(challenge, payload.project_name)
    PROJECTS[project["id"]] = project
    return deepcopy(project)

@app.get("/api/projects/{project_id}")
def project(project_id: str): return deepcopy(PROJECTS[project_id])

@app.post("/api/projects/{project_id}/status")
def update_status(project_id: str, payload: StatusPayload):
    project = PROJECTS[project_id]
    project["status"] = payload.status
    project["progress"] = {"ADOPTED":18,"RESEARCH":38,"PROTOTYPE":63,"PILOT":82,"IMPACT":100}.get(payload.status, project["progress"])
    project["activity"].insert(0,{"actor":"Project lead","text":f"Status moved to {payload.status}. Next action: {generate_next_action(project)}.","time":"just now"})
    return deepcopy(project)

@app.get("/api/impact")
def impact():
    pilots = sum(1 for p in PROJECTS.values() if p["status"]=="PILOT")
    adopted = len(PROJECTS)
    people = 41200 + pilots*1200
    return {
        "metrics":{"problems_submitted":len(CHALLENGES),"problems_matched":len(CHALLENGES)+7,"challenges_adopted":adopted+4,"projects_created":adopted+4,"pilots_completed":pilots,"people_impacted":people},
        "domain":[{"label":"Water","value":6},{"label":"Waste","value":5},{"label":"Mobility","value":4},{"label":"Health","value":7},{"label":"Education","value":3},{"label":"Climate","value":5}],
        "region":[{"label":"Maharashtra","value":88},{"label":"Gujarat","value":46},{"label":"Karnataka","value":39},{"label":"Telangana","value":32},{"label":"MP","value":27}],
        "stage":[{"label":"Problem","value":8},{"label":"Adopted","value":4},{"label":"Research","value":3},{"label":"Prototype","value":2},{"label":"Pilot","value":max(1,pilots)},{"label":"Impact","value":5}],
        "overTime":[{"label":"Apr","value":8},{"label":"May","value":16},{"label":"Jun","value":24},{"label":"Jul","value":36},{"label":"Aug","value":61},{"label":"Sep","value":people//700},{"label":"Oct","value":people//600}],
    }
