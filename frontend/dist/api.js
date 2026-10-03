import { API_BASE } from './generated-config.js';
const API = API_BASE;
async function request(path, options) {
    const response = await fetch(`${API}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) }
    });
    if (!response.ok)
        throw new Error(`API ${response.status}: ${await response.text()}`);
    return response.json();
}
export const api = {
    dashboard: () => request('/dashboard'),
    challenges: () => request('/challenges'),
    matches: () => request('/matches'),
    analyze: (payload) => request('/problems/analyze', { method: 'POST', body: JSON.stringify(payload) }),
    adopt: (challengeId, projectName) => request('/projects/adopt', { method: 'POST', body: JSON.stringify({ challenge_id: challengeId, project_name: projectName }) }),
    project: (id) => request(`/projects/${id}`),
    updateStatus: (id, status) => request(`/projects/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
    impact: () => request('/impact')
};
//# sourceMappingURL=api.js.map