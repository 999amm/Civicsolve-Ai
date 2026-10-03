import type { AnalyzeResponse, Project, Challenge } from './types.js';

export interface AppState {
  view: string;
  challenges: Challenge[];
  analysis: AnalyzeResponse | null;
  activeProject: Project | null;
  toast: string | null;
}

export const state: AppState = {
  view: 'dashboard',
  challenges: [],
  analysis: null,
  activeProject: null,
  toast: null
};
