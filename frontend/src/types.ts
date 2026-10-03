export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProjectStatus = 'ADOPTED' | 'RESEARCH' | 'PROTOTYPE' | 'PILOT' | 'IMPACT';

export interface Challenge {
  id: string;
  title: string;
  category: string;
  location: string;
  severity: Severity;
  affected: number;
  status: string;
  summary: string;
  coords: { x: number; y: number };
}

export interface Genome {
  domain: string;
  rootCause: string;
  severity: Severity;
  location: string;
  skills: string[];
  sdg: string;
  evidence: string;
  semanticNote: string;
  similarities: { title: string; score: number; id: string }[];
}

export interface Match {
  id: string;
  name: string;
  type: string;
  match: number;
  expertise: string[];
  reason: string;
  location: string;
  availability: string;
}

export interface Project {
  id: string;
  name: string;
  challengeId: string;
  description: string;
  status: ProjectStatus;
  team: string[];
  progress: number;
  tasks: { title: string; owner: string; done: boolean }[];
  evidence: string[];
  activity: { actor: string; text: string; time: string }[];
}

export interface DashboardData {
  metrics: {
    activeChallenges: number;
    problemsAdopted: number;
    projectsInPilot: number;
    researchersConnected: number;
    communityImpact: number;
  };
  recent: Challenge[];
  highPriority: Challenge[];
  projects: Project[];
}

export interface ImpactData {
  metrics: Record<string, number>;
  domain: { label: string; value: number }[];
  region: { label: string; value: number }[];
  stage: { label: string; value: number }[];
  overTime: { label: string; value: number }[];
}

export interface AnalyzeResponse {
  challenge: Challenge;
  genome: Genome;
  matches: Match[];
}
