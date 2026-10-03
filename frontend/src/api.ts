import type { AnalyzeResponse, DashboardData, ImpactData, Match, Project, Challenge } from './types.js';
import { API_BASE } from './generated-config.js';

const API = API_BASE;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) }
  });
  if (!response.ok) throw new Error(`API ${response.status}: ${await response.text()}`);
  return response.json() as Promise<T>;
}

export const api = {
  dashboard: () => request<DashboardData>('/dashboard'),
  challenges: () => request<Challenge[]>('/challenges'),
  matches: () => request<Match[]>('/matches'),
  analyze: (payload: unknown) => request<AnalyzeResponse>('/problems/analyze', { method: 'POST', body: JSON.stringify(payload) }),
  adopt: (challengeId: string, projectName: string) => request<Project>('/projects/adopt', { method: 'POST', body: JSON.stringify({ challenge_id: challengeId, project_name: projectName }) }),
  project: (id: string) => request<Project>(`/projects/${id}`),
  updateStatus: (id: string, status: string) => request<Project>(`/projects/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
  impact: () => request<ImpactData>('/impact')
};
