import { api } from './api.js';
import { state } from './state.js';
const navItems = [
    ['dashboard', '◈', 'Dashboard'], ['challenges', '◎', 'Challenges'], ['submit', '＋', 'Submit Problem'], ['matches', '✦', 'AI Matches'],
    ['projects', '▣', 'Projects'], ['impact', '↗', 'Impact'], ['organizations', '◌', 'Organizations'], ['profile', '◍', 'Profile']
];
let selectedChallengeId = 'CH-104';
let analysisStep = 1;
let formData = {
    title: 'Rural drinking-water contamination during monsoon',
    description: 'During the monsoon season, runoff contaminates local drinking-water sources in rural communities. Existing filtration and monitoring systems are insufficient.',
    category: 'Water + Public Health',
    location: 'Maharashtra, India',
    severity: 'HIGH',
    affected: 8400,
    evidence: 'GPS-tagged water samples, gram panchayat complaints, seasonal test logs',
    expertise: ['Environmental Engineering', 'IoT', 'Water Quality', 'Public Health']
};
const $ = (sel) => document.querySelector(sel);
const escape = (value) => String(value ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
function iconFor(status) { return { 'ADOPTED': '◌', 'RESEARCH': '⌁', 'PROTOTYPE': '◇', 'PILOT': '◉', 'IMPACT': '↗' }[status] || '•'; }
function severityClass(s) { return s.toLowerCase(); }
function shell(content) {
    const app = $('#app');
    app.innerHTML = `
    <div class="app-shell">
      <div class="glow-orb glow-1"></div><div class="glow-orb glow-2"></div><div class="grain"></div>
      <div class="layout">
        <aside class="sidebar">
          <div class="brand">
            <div class="brand-mark">CS</div>
            <div class="brand-name">CIVICSOLVE AI <span style="color:var(--lime)">·</span></div>
            <div class="brand-sub">Problem intelligence → collaboration → measurable impact.</div>
          </div>
          <nav class="nav">
            ${navItems.map(([id, ico, label]) => `<button class="nav-btn ${state.view === id ? 'active' : ''}" data-nav="${id}"><span class="nav-icon">${ico}</span>${label}</button>`).join('')}
          </nav>
          <div class="sidebar-bottom"><div class="system-card"><div class="system-label">Civic intelligence</div><div style="margin-top:8px;font-size:11px"><span class="status-dot"></span>Mock AI engine online</div><div style="margin-top:6px;color:#6f837a;font-size:10px">Embeddings · semantic matching · deterministic demo</div></div></div>
        </aside>
        <main class="main">
          <div class="topbar">
            <div class="crumb"><span>CIVICSOLVE AI</span><span>•</span><strong>${escape(pageLabel(state.view))}</strong></div>
            <div class="top-actions"><button class="ghost-btn" data-nav="submit">＋ New problem</button><button class="icon-btn" id="theme-toggle" title="Toggle visual mode">◐</button><button class="icon-btn" title="Demo mode">⌘</button></div>
          </div>
          ${content}
        </main>
      </div>
      ${state.toast ? `<div class="toast">${escape(state.toast)}</div>` : ''}
    </div>`;
    bindGlobal();
}
function pageLabel(view) { return navItems.find(x => x[0] === view)?.[2] || 'Dashboard'; }
function setToast(message) {
    state.toast = message;
    render();
    setTimeout(() => { state.toast = null; render(); }, 2800);
}
function bindGlobal() {
    document.querySelectorAll('[data-nav]').forEach(btn => btn.onclick = () => { state.view = btn.dataset.nav || 'dashboard'; location.hash = state.view; render(); });
    document.querySelector('#theme-toggle')?.addEventListener('click', () => { const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; document.documentElement.dataset.theme = next; localStorage.setItem('civicsolve-theme', next); });
    document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('pointermove', e => {
            const r = card.getBoundingClientRect();
            const dx = (e.clientX - r.left) / r.width - .5;
            const dy = (e.clientY - r.top) / r.height - .5;
            card.style.setProperty('--ry', `${dx * 9}deg`);
            card.style.setProperty('--rx', `${-dy * 8}deg`);
        });
        card.addEventListener('pointerleave', () => { card.style.setProperty('--ry', '0deg'); card.style.setProperty('--rx', '0deg'); });
    });
}
async function renderDashboard() {
    let data;
    try {
        data = await api.dashboard();
        state.challenges = await api.challenges();
    }
    catch {
        return shell(`<div class="empty card pad"><div><h2>Backend not connected</h2><p class="subtitle" style="margin:8px auto 16px">Start FastAPI on <span class="mono">127.0.0.1:8000</span>, then refresh.</p><button class="primary-btn" onclick="location.reload()">Retry</button></div></div>`);
    }
    shell(`
    <div class="page-title">
      <div><div class="eyebrow">Civic operating system · demo mode</div><h1>Turn civic friction into coordinated action.</h1><p class="subtitle">CIVICSOLVE AI transforms messy real-world complaints into structured problem genomes, then routes them to people who can actually build, pilot and measure a solution.</p></div>
      <div class="kpi-pill"><span class="status-dot"></span><span>Live demo environment · 8 seeded challenges</span></div>
    </div>
    <div class="grid metrics">
      ${metricCard('Active challenges', data.metrics.activeChallenges, 'Across 8 seeded civic problem signals')}
      ${metricCard('Problems adopted', data.metrics.problemsAdopted, 'Challenges moved into project work')}
      ${metricCard('Projects in pilot', data.metrics.projectsInPilot, 'Evidence-ready field pilots')}
      ${metricCard('Researchers connected', data.metrics.researchersConnected, 'Matching from expertise graph')}
      ${metricCard('Community impact', `${data.metrics.communityImpact.toLocaleString()}+`, 'People represented in active work')}
    </div>
    <div class="grid dashboard-grid">
      <section class="card pad glass"><div class="section-head"><div><div class="eyebrow">Recent challenges</div><h2>Signals entering the system</h2></div><button class="ghost-btn small-btn" data-nav="challenges">View all</button></div>
        <div class="table"><div class="row head"><div>Challenge</div><div>Severity</div><div>Location</div><div>Stage</div><div></div></div>
          ${data.recent.slice(0, 5).map(c => `<div class="row"><div><div class="row-title">${escape(c.title)}</div><div class="row-sub">${escape(c.category)}</div></div><div><span class="badge ${severityClass(c.severity)}">${c.severity}</span></div><div class="row-sub">${escape(c.location.split(',')[0])}</div><div class="row-sub">${escape(c.status)}</div><button class="ghost-btn small-btn" data-challenge="${c.id}">Open</button></div>`).join('')}
        </div>
      </section>
      <section class="card pad glass"><div class="section-head"><div><div class="eyebrow">Impact pulse</div><h2>Community impact trend</h2></div><div class="smallcaps">last 6 cycles</div></div>
        ${sparkline([22, 31, 29, 44, 56, 69, 82, 94], '94')}
        <div class="inline" style="justify-content:space-between;color:#7a8e84;font-size:10px"><span>Signals are converted into projects faster after semantic matching.</span><span style="color:var(--lime)">+31%</span></div>
      </section>
    </div>
    <div class="grid dashboard-grid-2">
      <section class="card pad glass"><div class="section-head"><div><div class="eyebrow">High priority</div><h2>Needs attention now</h2></div></div>
        <div class="challenge-list">${data.highPriority.slice(0, 3).map(c => `<div class="challenge-card" data-tilt><div><div class="inline"><span class="badge ${severityClass(c.severity)}">${c.severity}</span><span class="mono">${c.id}</span></div><div style="margin-top:7px;font-weight:700;font-size:13px">${escape(c.title)}</div><div class="card-meta"><span class="badge">${escape(c.location)}</span><span class="badge">${c.affected.toLocaleString()} affected</span></div></div><button class="primary-btn small-btn" data-challenge="${c.id}">Inspect →</button></div>`).join('')}</div>
      </section>
      <section class="card pad glass"><div class="section-head"><div><div class="eyebrow">Active projects</div><h2>From adoption to pilot</h2></div><button class="ghost-btn small-btn" data-nav="projects">Workspace</button></div>
        <div class="project-mini">${(data.projects.length ? data.projects : [{ id: 'P-001', name: 'No active projects yet', status: 'ADOPTED', progress: 0 }]).slice(0, 3).map(p => `<div class="project-item"><div class="project-top"><div><div class="row-title">${escape(p.name)}</div><div class="row-sub">${iconFor(p.status)} ${p.status}</div></div><div class="mono">${p.progress || 0}%</div></div><div class="progress"><span style="width:${p.progress || 0}%"></span></div></div>`).join('')}</div>
      </section>
    </div>
    <section class="card pad map-card glass" style="margin-top:14px"><div class="section-head"><div><div class="eyebrow">Geospatial signal layer</div><h2>Maharashtra + India challenge map</h2></div><span class="section-note">Click a pin to inspect the challenge</span></div>${mapMarkup(state.challenges)}</section>
  `);
    bindDashboardEvents();
}
function metricCard(label, value, foot) { return `<div class="card pad metric glass tilt" data-tilt><div class="metric-label">${label}</div><div class="metric-value">${value}</div><div class="metric-foot">${foot}</div></div>`; }
function sparkline(values, last) { const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${88 - v * .66}`).join(' '); return `<div class="spark-wrap"><svg class="sparkline" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#b8f34b" stop-opacity=".18"/><stop offset="1" stop-color="#68e7b5" stop-opacity=".65"/></linearGradient></defs><path d="M 0 90 L ${pts}" fill="none" stroke="url(#g)" stroke-width="2.2" vector-effect="non-scaling-stroke"/><path d="M0 90 L ${pts} L 100 100 L 0 100 Z" fill="url(#g)" opacity=".08"/></svg></div>`; }
function indiaPath() { return `M47,7 C56,13 60,20 60,28 C66,37 63,44 70,51 C64,60 60,66 56,77 C51,74 47,82 41,83 C37,76 31,75 30,66 C24,64 24,55 18,51 C23,43 20,36 29,31 C25,25 32,20 35,16 C37,11 41,10 47,7 Z`; }
function mapMarkup(challenges) {
    const pins = challenges.map(c => `<button class="pin ${c.id === selectedChallengeId ? 'selected' : ''}" title="${escape(c.title)}" style="left:${c.coords.x}%;top:${c.coords.y}%" data-map-pin="${c.id}"></button>`).join('');
    const c = challenges.find(x => x.id === selectedChallengeId) || challenges[0];
    return `<div class="map-area"><div class="map-grid"></div><svg class="india-outline" viewBox="0 0 100 100" aria-hidden="true"><path d="${indiaPath()}"/></svg>${pins}${c ? `<div class="challenge-detail"><div class="smallcaps">${c.id} · selected</div><strong>${escape(c.title)}</strong><div class="card-meta"><span class="badge ${severityClass(c.severity)}">${c.severity}</span><span class="badge">${escape(c.category)}</span></div><div style="margin-top:9px;color:#82978d;font-size:10px;line-height:1.55">${escape(c.location)} · ${c.affected.toLocaleString()} people affected · ${escape(c.status)}</div></div>` : ''}<div class="map-legend"><span><span class="status-dot"></span>active challenge signal</span><span>India view · Maharashtra highlighted by seeded signals</span></div></div>`;
}
function bindDashboardEvents() {
    document.querySelectorAll('[data-challenge]').forEach(btn => btn.onclick = () => { selectedChallengeId = btn.dataset.challenge; const c = state.challenges.find(x => x.id === selectedChallengeId); if (c) {
        state.view = 'challenges';
        render();
    } });
    document.querySelectorAll('[data-map-pin]').forEach(pin => pin.onclick = () => { selectedChallengeId = pin.dataset.mapPin; render(); });
}
function renderChallenges() { shell(`<div class="page-title"><div><div class="eyebrow">Challenge network</div><h1>Every signal gets a path forward.</h1><p class="subtitle">Browse seeded civic problems, inspect the evidence footprint, and jump into adoption without leaving the application.</p></div><button class="primary-btn" data-nav="submit">Submit a problem →</button></div><div class="grid dashboard-grid"><section class="card pad glass"><div class="section-head"><div><div class="eyebrow">All challenges</div><h2>${state.challenges.length} indexed problems</h2></div><span class="kpi-pill">Semantic fingerprint ready</span></div><div class="challenge-list">${state.challenges.map(c => `<div class="challenge-card tilt" data-tilt><div><div class="inline"><span class="mono">${c.id}</span><span class="badge ${severityClass(c.severity)}">${c.severity}</span><span class="badge">${escape(c.category)}</span></div><div style="margin-top:8px;font-size:14px;font-weight:750">${escape(c.title)}</div><div class="row-sub">${escape(c.summary)}</div><div class="card-meta"><span class="badge">⌖ ${escape(c.location)}</span><span class="badge">♧ ${c.affected.toLocaleString()} affected</span><span class="badge">◌ ${escape(c.status)}</span></div></div><div style="display:grid;gap:7px;justify-items:end"><button class="ghost-btn small-btn" data-inspect="${c.id}">Inspect</button><button class="primary-btn small-btn" data-adopt="${c.id}">Adopt challenge</button></div></div>`).join('')}</div></section><section class="card pad glass map-card"><div class="section-head"><div><div class="eyebrow">Map</div><h2>Geographic distribution</h2></div></div>${mapMarkup(state.challenges)}</section></div>`); document.querySelectorAll('[data-inspect]').forEach(b => b.onclick = () => { selectedChallengeId = b.dataset.inspect; state.view = 'submit'; analysisStep = 3; const c = state.challenges.find(x => x.id === selectedChallengeId); if (c)
    formData.title = c.title; render(); }); document.querySelectorAll('[data-adopt]').forEach(b => b.onclick = () => openAdoptModal(b.dataset.adopt)); document.querySelectorAll('[data-map-pin]').forEach(p => p.onclick = () => { selectedChallengeId = p.dataset.mapPin; renderChallenges(); }); }
function renderSubmit() {
    if (analysisStep === 3 && state.analysis)
        return renderGenome();
    const steps = ['Problem', 'Context', 'Evidence'];
    shell(`<div class="page-title"><div><div class="eyebrow">Signal intake</div><h1>Submit a problem. Let the graph do the routing.</h1><p class="subtitle">The intake form is deliberately human-readable; the AI layer turns it into a structured fingerprint after submission.</p></div><div class="kpi-pill">Step ${analysisStep} / 3</div></div><div class="grid form-shell"><section class="card pad glass"><div class="stepper">${steps.map((s, i) => `<div class="step ${analysisStep === i + 1 ? 'active' : ''} ${analysisStep > i + 1 ? 'done' : ''}"><span class="circle">${analysisStep > i + 1 ? '✓' : i + 1}</span>${s}</div>`).join('')}</div>${submitStepMarkup()}</section><aside class="card pad preview-card glass"><div class="eyebrow">AI preview</div><h2>Problem → genome</h2><p class="subtitle" style="margin-top:5px">Watch the structure emerge as you type. This panel is the same artifact the matching engine consumes.</p><div class="preview-orbit" style="margin-top:16px"><div class="scanline"></div><div class="orbit o1"></div><div class="orbit o2"></div><div class="node a"></div><div class="node b"></div><div class="node c"></div><div class="core">PROBLEM<br/>GENOME™</div></div><div class="preview-grid"><div class="genome-item"><span>Domain</span><strong>${escape(formData.category || 'Awaiting signal')}</strong></div><div class="genome-item"><span>Severity</span><strong>${escape(formData.severity)}</strong></div><div class="genome-item"><span>Location</span><strong>${escape(formData.location || 'Awaiting signal')}</strong></div><div class="genome-item"><span>People affected</span><strong>${Number(formData.affected || 0).toLocaleString()}</strong></div></div></aside></div>`);
    bindSubmitEvents();
}
function submitStepMarkup() {
    if (analysisStep === 1)
        return `<div class="form-grid"><div class="field"><label>Problem title</label><input id="f-title" value="${escape(formData.title)}"/></div><div class="field"><label>Problem description</label><textarea id="f-desc">${escape(formData.description)}</textarea></div><div class="two"><div class="field"><label>Category / domain</label><select id="f-cat"><option>Water + Public Health</option><option>Waste & Circular Economy</option><option>Transport & Accessibility</option><option>Climate & Air Quality</option><option>Agriculture & Food Systems</option><option>Education & Sanitation</option><option>Healthcare Access</option></select></div><div class="field"><label>Location</label><input id="f-location" value="${escape(formData.location)}"/></div></div><div class="field"><label>Severity</label><div class="severity-grid">${['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(s => `<button type="button" class="severity-option ${formData.severity === s ? 'selected' : ''}" data-sev="${s}">${s}</button>`).join('')}</div></div><div class="form-actions"><span></span><button class="primary-btn" data-next>Continue →</button></div></div>`;
    if (analysisStep === 2)
        return `<div class="form-grid"><div class="field"><label>People affected</label><input id="f-affected" type="number" value="${formData.affected}"/></div><div class="field"><label>Required expertise</label><div class="expertise">${['Environmental Engineering', 'IoT', 'Water Quality', 'Public Health', 'Data Science', 'Community Organizing', 'Policy'].map(x => `<button type="button" class="chip ${formData.expertise.includes(x) ? 'selected' : ''}" data-exp="${x}">${x}</button>`).join('')}</div></div><div class="field"><label>What evidence exists?</label><textarea id="f-evidence">${escape(formData.evidence)}</textarea></div><div class="field"><label>Optional image upload</label><input id="f-image" type="file" accept="image/*"/><div class="section-note">Demo stores the filename only; no external storage required.</div></div><div class="form-actions"><button class="ghost-btn" data-back>← Back</button><button class="primary-btn" data-next>Review signal →</button></div></div>`;
    return `<div class="form-grid"><div class="analysis-banner"><strong style="color:var(--lime)">Ready for AI analysis.</strong><br/>CIVICSOLVE will generate a deterministic Problem Genome, find semantically similar challenge records, and surface expertise matches.</div>${summaryBlock()}<div class="form-actions"><button class="ghost-btn" data-back>← Edit</button><button class="primary-btn" data-submit>Analyze with AI ✦</button></div></div>`;
}
function summaryBlock() { return `<div class="preview-grid"><div class="genome-item"><span>Title</span><strong>${escape(formData.title)}</strong></div><div class="genome-item"><span>Domain</span><strong>${escape(formData.category)}</strong></div><div class="genome-item"><span>Location</span><strong>${escape(formData.location)}</strong></div><div class="genome-item"><span>Severity</span><strong>${escape(formData.severity)}</strong></div><div class="genome-item" style="grid-column:1/-1"><span>Evidence</span><strong>${escape(formData.evidence)}</strong></div></div>`; }
function bindSubmitEvents() {
    document.querySelectorAll('[data-sev]').forEach(b => b.onclick = () => { formData.severity = b.dataset.sev; renderSubmit(); });
    document.querySelectorAll('[data-exp]').forEach(b => b.onclick = () => { const x = b.dataset.exp; formData.expertise = formData.expertise.includes(x) ? formData.expertise.filter(i => i !== x) : [...formData.expertise, x]; renderSubmit(); });
    $('#f-title')?.addEventListener('input', e => formData.title = e.target.value);
    $('#f-desc')?.addEventListener('input', e => formData.description = e.target.value);
    $('#f-location')?.addEventListener('input', e => formData.location = e.target.value);
    $('#f-cat')?.addEventListener('change', e => formData.category = e.target.value);
    $('#f-affected')?.addEventListener('input', e => formData.affected = Number(e.target.value));
    $('#f-evidence')?.addEventListener('input', e => formData.evidence = e.target.value);
    document.querySelector('[data-next]')?.addEventListener('click', () => { const step = analysisStep + 1; if (analysisStep === 1) {
        formData.title = document.querySelector('#f-title').value;
        formData.description = document.querySelector('#f-desc').value;
        formData.location = document.querySelector('#f-location').value;
        formData.category = document.querySelector('#f-cat').value;
    } if (analysisStep === 2) {
        formData.affected = Number(document.querySelector('#f-affected').value);
        formData.evidence = document.querySelector('#f-evidence').value;
    } analysisStep = step; renderSubmit(); });
    document.querySelector('[data-back]')?.addEventListener('click', () => { analysisStep = Math.max(1, analysisStep - 1); renderSubmit(); });
    document.querySelector('[data-submit]')?.addEventListener('click', runAnalysis);
}
async function runAnalysis() {
    const app = $('#app');
    app.innerHTML = `<div class="app-shell"><div class="glow-orb glow-1"></div><div class="grain"></div><div class="main" style="max-width:820px;margin:0 auto;padding-top:80px"><div class="card pad glass loading"><div class="loader-ring"></div><div class="eyebrow" style="margin-top:22px">AI problem intelligence</div><h2>Building your Problem Genome™</h2><p class="subtitle" style="text-align:center;max-width:470px">Parsing root cause · extracting domain · checking duplicate signals · embedding semantic fingerprint · routing expertise.</p></div></div></div>`;
    await new Promise(r => setTimeout(r, 1250));
    try {
        state.analysis = await api.analyze(formData);
        state.challenges = await api.challenges();
        analysisStep = 3;
        renderGenome();
        setToast('AI analysis complete — semantic matches ready.');
    }
    catch (err) {
        state.view = 'submit';
        analysisStep = 3;
        shell(`<div class="empty card pad"><div><h2>Analysis unavailable</h2><p class="subtitle" style="margin:8px auto 16px">${escape(err instanceof Error ? err.message : 'Unknown error')}</p><button class="primary-btn" data-nav="submit">Back to signal</button></div></div>`);
    }
}
function renderGenome() {
    const a = state.analysis;
    shell(`<div class="page-title"><div><div class="eyebrow">AI analysis complete · Problem Genome™</div><h1>${escape(a.challenge.title)}</h1><p class="subtitle">The submitted narrative has been converted into a structured fingerprint designed for semantic matching, collaboration routing and field execution.</p></div><span class="badge high">${a.genome.severity} PRIORITY</span></div><div class="grid dashboard-grid"><section class="card pad glass"><div class="section-head"><div><div class="eyebrow">Structured fingerprint</div><h2>Problem Genome™</h2></div><span class="kpi-pill">Vector-ready · semantic index</span></div><div class="genome" style="grid-template-columns:1fr 1fr;display:grid">${[['Domain', a.genome.domain], ['Root cause', a.genome.rootCause], ['Severity', a.genome.severity], ['Location', a.genome.location], ['SDG', a.genome.sdg], ['Evidence', a.genome.evidence]].map(([l, v]) => `<div class="genome-item"><span>${l}</span><strong>${escape(v)}</strong></div>`).join('')}<div class="genome-item" style="grid-column:1/-1"><span>Required skills</span><div class="match-tags">${a.genome.skills.map(s => `<span class="chip selected">${escape(s)}</span>`).join('')}</div></div></div><div class="analysis-banner" style="margin-top:12px">${escape(a.genome.semanticNote)}</div></section><section class="card pad glass"><div class="section-head"><div><div class="eyebrow">Semantic matches</div><h2>Similar challenges</h2></div><span class="mono">cosine similarity</span></div><div class="challenge-list">${a.genome.similarities.map(s => `<div class="list-item"><div><div class="row-title">${escape(s.title)}</div><div class="row-sub">${escape(s.id)} · found despite different wording</div></div><strong style="color:var(--lime)">${s.score}%</strong></div>`).join('')}</div><div class="preview-orbit" style="margin-top:14px;height:180px"><div class="orbit o1"></div><div class="orbit o2"></div><div class="core">MATCH<br/>GRAPH</div></div></section></div><div class="card pad glass"><div class="section-head"><div><div class="eyebrow">Next action</div><h2>Route this challenge into the collaboration graph.</h2></div><div class="action-row" style="margin-top:0"><button class="ghost-btn" data-nav="challenges">Back to challenges</button><button class="primary-btn" id="find-matches">Find matching partners ✦</button></div></div></div>`);
    $('#find-matches').onclick = () => { state.view = 'matches'; render(); };
}
function renderMatches() {
    const matches = state.analysis?.matches || [];
    shell(`<div class="page-title"><div><div class="eyebrow">AI routing layer</div><h1>Find the people who can move it.</h1><p class="subtitle">Matches combine semantic problem fit, declared expertise, geography and demo availability. Every score is deterministic so the pitch behaves consistently.</p></div><span class="kpi-pill">${matches.length || 5} high-fit connections</span></div>${state.analysis ? `<div class="analysis-banner" style="margin-bottom:14px"><strong style="color:var(--lime)">${escape(state.analysis.challenge.id)}</strong> · ${escape(state.analysis.challenge.title)} · Problem Genome™ routed to expertise graph.</div>` : ''}<div class="matches-grid">${(matches.length ? matches : defaultMatches()).map(m => `<div class="match-card tilt" data-tilt><div class="match-top"><div><div class="match-type">${escape(m.type)}</div><h3 style="margin-top:7px">${escape(m.name)}</h3></div><div class="match-score">${m.match}%</div></div><p>${escape(m.reason)}</p><div class="match-tags">${m.expertise.map(t => `<span class="chip">${escape(t)}</span>`).join('')}</div><div class="card-meta"><span class="badge">⌖ ${escape(m.location)}</span><span class="badge">◷ ${escape(m.availability)}</span></div><div class="action-row"><button class="ghost-btn small-btn" data-profile="${m.id}">View profile</button><button class="primary-btn small-btn" data-invite="${m.id}">Invite to project</button></div></div>`).join('')}</div><section class="card pad glass" style="margin-top:14px"><div class="section-head"><div><div class="eyebrow">Adoption</div><h2>Ready to turn the signal into a project?</h2></div><button class="primary-btn" id="adopt-from-match">Adopt challenge →</button></div><p class="subtitle" style="margin-top:0">Adoption pre-fills the recommended team, project name and execution workspace.</p></section>`);
    document.querySelectorAll('[data-profile]').forEach(b => b.onclick = () => setToast('Profile view opened in demo mode — organization details surfaced from the seeded graph.'));
    document.querySelectorAll('[data-invite]').forEach(b => b.onclick = () => setToast('Invite staged — partner added to the demo project shortlist.'));
    $('#adopt-from-match')?.addEventListener('click', () => openAdoptModal(state.analysis?.challenge.id || selectedChallengeId));
}
function defaultMatches() { return [{ id: 'U01', name: 'Environmental Engineering Department', type: 'University department', match: 94, expertise: ['Water Systems', 'Environmental Modelling'], reason: 'Direct fit to runoff, filtration and water-quality requirements.', location: 'Aurangabad, Maharashtra', availability: 'Available' }, { id: 'R02', name: 'Public Health Research Group', type: 'Research group', match: 91, expertise: ['Public Health', 'Epidemiology'], reason: 'Strong fit for affected-population measurement and health indicators.', location: 'Pune, Maharashtra', availability: '2 collaborators' }, { id: 'L03', name: 'IoT Water Monitoring Lab', type: 'University lab', match: 87, expertise: ['IoT', 'Sensors', 'Edge ML'], reason: 'Relevant sensing stack for low-cost monsoon monitoring.', location: 'Nashik, Maharashtra', availability: 'Available' }, { id: 'I04', name: 'Water Technology Company', type: 'Industry partner', match: 84, expertise: ['Filtration', 'Water Testing'], reason: 'Can accelerate prototype access and field procurement.', location: 'Mumbai, Maharashtra', availability: 'Pilot partner' }]; }
function openAdoptModal(challengeId) {
    const c = state.challenges.find(x => x.id === challengeId) || state.analysis?.challenge;
    const existing = document.querySelector('.modal-backdrop');
    existing?.remove();
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<div class="modal" data-tilt><div class="modal-head"><div><div class="eyebrow">Create project</div><h2>Adopt challenge</h2></div><button class="icon-btn" id="modal-close">×</button></div><p>Adopting <strong style="color:var(--text)">${escape(c?.title || 'challenge')}</strong> creates a workspace and carries the AI genome into execution.</p><div class="form-grid" style="margin-top:14px"><div class="field"><label>Project name</label><input id="project-name" value="Monsoon Water Safety Initiative"/></div><div class="preview-grid"><div class="genome-item"><span>Status</span><strong>ADOPTED</strong></div><div class="genome-item"><span>Team</span><strong>Environmental Engineering · Public Health · IoT</strong></div></div><div class="form-actions"><button class="ghost-btn" id="modal-cancel">Cancel</button><button class="primary-btn" id="modal-adopt">Create Project →</button></div></div></div>`;
    document.body.appendChild(wrap);
    bindGlobal();
    $('#modal-close').onclick = () => wrap.remove();
    $('#modal-cancel').onclick = () => wrap.remove();
    $('#modal-adopt').onclick = async () => { const name = document.querySelector('#project-name').value.trim() || 'CivicSolve Pilot'; const project = await api.adopt(c?.id || challengeId, name); state.activeProject = project; wrap.remove(); state.view = 'projects'; setToast('Challenge adopted — project workspace created.'); render(); };
}
async function renderProjects() {
    if (!state.activeProject) {
        try {
            const d = await api.dashboard();
            state.activeProject = d.projects[0] || null;
        }
        catch { }
    }
    const p = state.activeProject;
    if (!p)
        return shell(`<div class="empty card pad"><div><h2>No active project yet</h2><p class="subtitle" style="margin:8px auto 16px">Start from a challenge and adopt it to open the workspace.</p><button class="primary-btn" data-nav="challenges">Explore challenges</button></div></div>`);
    shell(`<div class="page-title"><div><div class="eyebrow">Project workspace · ${escape(p.id)}</div><h1>${escape(p.name)}</h1><p class="subtitle">${escape(p.description)}</p></div><div class="inline"><span class="badge">${iconFor(p.status)} ${p.status}</span><span class="mono">${p.progress}% complete</span></div></div><section class="card pad glass"><div class="section-head"><div><div class="eyebrow">Execution timeline</div><h2>Move the project through the field.</h2></div><div class="inline"><button class="ghost-btn small-btn" id="quick-research">Research</button><button class="primary-btn small-btn" id="quick-pilot">Move to Pilot →</button></div></div><div class="timeline">${['PROBLEM', 'TEAM FORMED', 'RESEARCH', 'PROTOTYPE', 'PILOT', 'IMPACT'].map(step => { const order = ['PROBLEM', 'TEAM FORMED', 'RESEARCH', 'PROTOTYPE', 'PILOT', 'IMPACT']; const sIndex = order.indexOf(step); const pIndex = order.indexOf(statusToTimeline(p.status)); return `<div class="timeline-step ${sIndex < pIndex ? 'done' : ''} ${step === statusToTimeline(p.status) ? 'active' : ''}"><div class="dot"></div><small>${step}</small></div>`; }).join('')}</div><div class="progress"><span style="width:${p.progress}%"></span></div></section><div class="grid project-columns"><div class="card pad glass"><div class="section-head"><div><div class="eyebrow">Tasks</div><h2>Field execution checklist</h2></div><span class="mono">${p.tasks.filter(t => t.done).length}/${p.tasks.length} done</span></div><div class="list">${p.tasks.map((t, i) => `<div class="list-item"><div class="inline"><span class="check ${t.done ? 'done' : ''}">${t.done ? '✓' : ''}</span><div><div class="row-title">${escape(t.title)}</div><div class="row-sub">Owner · ${escape(t.owner)}</div></div></div><button class="ghost-btn small-btn" data-task="${i}">${t.done ? 'Undo' : 'Mark done'}</button></div>`).join('')}</div></div><div class="card pad glass"><div class="section-head"><div><div class="eyebrow">Team</div><h2>Collaborators</h2></div></div><div class="avatar-stack">${p.team.map((t, i) => `<div class="avatar" title="${escape(t)}">${t.split(' ').map(x => x[0]).slice(0, 2).join('')}</div>`).join('')}</div><div style="margin-top:12px;color:#92a69d;font-size:11px;line-height:1.6">${p.team.map(t => `<div style="padding:8px 0;border-bottom:1px solid var(--line)">${escape(t)}</div>`).join('')}</div><div class="analysis-banner" style="margin-top:12px">Evidence, comments and milestone updates stay attached to the project—not scattered across chats.</div></div></div><div class="grid dashboard-grid-2"><div class="card pad glass"><div class="section-head"><div><div class="eyebrow">Evidence</div><h2>Pilot-ready artifacts</h2></div></div><div class="list">${p.evidence.map(e => `<div class="list-item"><span style="font-size:11px;color:#a3b7ae">◈ ${escape(e)}</span><span class="badge">attached</span></div>`).join('')}</div></div><div class="card pad glass"><div class="section-head"><div><div class="eyebrow">Activity</div><h2>Project pulse</h2></div></div><div class="list">${p.activity.slice(0, 4).map(a => `<div class="list-item" style="display:block"><div class="row-title">${escape(a.actor)}</div><div class="row-sub" style="line-height:1.45">${escape(a.text)}</div><div class="mono" style="margin-top:5px">${escape(a.time)}</div></div>`).join('')}</div></div></div>`);
    document.querySelectorAll('[data-task]').forEach(b => b.onclick = () => { const i = Number(b.dataset.task); if (state.activeProject?.tasks[i])
        state.activeProject.tasks[i].done = !state.activeProject.tasks[i].done; renderProjects(); setToast('Task checklist updated in the active project.'); });
    $('#quick-research')?.addEventListener('click', () => updateProjectStatus(p.id, 'RESEARCH'));
    $('#quick-pilot')?.addEventListener('click', () => updateProjectStatus(p.id, 'PILOT'));
}
function statusToTimeline(s) { return { ADOPTED: 'PROBLEM', RESEARCH: 'RESEARCH', PROTOTYPE: 'PROTOTYPE', PILOT: 'PILOT', IMPACT: 'IMPACT' }[s]; }
async function updateProjectStatus(id, status) { const updated = await api.updateStatus(id, status); state.activeProject = updated; setToast(`Project moved to ${status}. Impact dashboard refreshed.`); }
async function renderImpact() { let data; try {
    data = await api.impact();
}
catch {
    return shell(`<div class="empty card pad"><div><h2>Impact data unavailable</h2><p class="subtitle">Start FastAPI on port 8000 and reload.</p></div></div>`);
} shell(`<div class="page-title"><div><div class="eyebrow">Outcome intelligence</div><h1>Measure what changed.</h1><p class="subtitle">Impact is the final stage of the workflow: the same data model used to route a problem now shows whether projects created tangible field outcomes.</p></div><span class="kpi-pill"><span class="status-dot"></span>Updated from current demo state</span></div><div class="grid metrics">${Object.entries(data.metrics).map(([k, v]) => metricCard(k.replaceAll('_', ' '), v.toLocaleString(), 'Current CIVICSOLVE demo network')).join('')}</div><div class="impact-grid" style="margin-top:14px"><section class="card pad glass chart"><div class="section-head"><div><div class="eyebrow">Problems by domain</div><h2>Domain mix</h2></div></div><div class="donut" data-label="CIVIC\nSIGNALS"></div><div class="smallcaps" style="text-align:center">Water · Waste · Mobility · Health · Education · Climate</div></section><section class="card pad glass chart"><div class="section-head"><div><div class="eyebrow">Problems by region</div><h2>Regional footprint</h2></div></div><div class="region-bars">${data.region.map(x => `<div class="region-row"><span>${escape(x.label)}</span><div class="region-line"><span style="width:${x.value}%"></span></div><strong style="font-size:10px;color:#b5c7bf">${x.value}</strong></div>`).join('')}</div></section><section class="card pad glass chart"><div class="section-head"><div><div class="eyebrow">Projects by stage</div><h2>Execution pipeline</h2></div></div><div class="bars">${data.stage.map(x => `<div class="bar-col"><div class="bar" style="--h:${Math.max(x.value * 18, 8)}px"></div><div class="bar-label">${escape(x.label)}</div></div>`).join('')}</div></section><section class="card pad glass chart"><div class="section-head"><div><div class="eyebrow">Impact over time</div><h2>People reached</h2></div><span class="badge">pilot trajectory</span></div>${sparkline(data.overTime.map(x => x.value), '')}<div class="section-note">Cumulative people reached across measured pilots.</div></section></div>`); }
function renderOrganizations() { const orgs = [['Environmental Engineering Department', 'University', 'Aurangabad', 'Water Systems · Modelling'], ['Public Health Research Group', 'Research', 'Pune', 'Epidemiology · Health outcomes'], ['JalSetu Foundation', 'NGO', 'Nashik', 'Community water access'], ['MahaUrban Mobility Lab', 'University', 'Mumbai', 'Transit accessibility · GIS'], ['AquaSense Technologies', 'Industry', 'Pune', 'Sensors · Water monitoring'], ['CleanWard Collective', 'NGO', 'Chhatrapati Sambhajinagar', 'Waste segregation · behaviour']]; shell(`<div class="page-title"><div><div class="eyebrow">Collaboration graph</div><h1>Organizations around the problem.</h1><p class="subtitle">A lightweight directory for the demo pitch. In production, this graph can become a permissioned network of institutions, researchers and field partners.</p></div><span class="kpi-pill">${orgs.length} seeded organizations</span></div><div class="matches-grid">${orgs.map((o, i) => `<div class="match-card tilt" data-tilt><div class="match-top"><div><div class="match-type">${o[1]}</div><h3 style="margin-top:7px">${o[0]}</h3></div><div class="badge">0${i + 1}</div></div><p>${o[3]}</p><div class="card-meta"><span class="badge">⌖ ${o[2]}</span><span class="badge">Connected</span></div><div class="action-row"><button class="primary-btn small-btn" onclick="this.textContent='Connected ✓'">View profile</button></div></div>`).join('')}</div>`); }
function renderProfile() { shell(`<div class="page-title"><div><div class="eyebrow">Workspace profile</div><h1>CIVICSOLVE demo operator</h1><p class="subtitle">A demo identity for hackathon judges to understand the operating model.</p></div><span class="kpi-pill">Contributor · Civic Systems</span></div><div class="grid dashboard-grid"><section class="card pad glass"><div class="eyebrow">Role</div><h2 style="margin-top:4px">Problem orchestrator</h2><p class="subtitle">Submits signals, convenes collaborators, moves projects through pilot and verifies impact evidence.</p><div class="preview-grid" style="margin-top:16px"><div class="genome-item"><span>Connection graph</span><strong>27 active entities</strong></div><div class="genome-item"><span>Problems submitted</span><strong>14</strong></div><div class="genome-item"><span>Projects adopted</span><strong>5</strong></div><div class="genome-item"><span>Impact evidence</span><strong>3 pilots</strong></div></div></section><section class="card pad glass"><div class="eyebrow">Build note</div><h2 style="margin-top:4px">Why the genome matters</h2><div class="analysis-banner" style="margin-top:12px">Civic problem descriptions are often messy, local and differently worded. A structured semantic fingerprint gives the network a common language for discovery, matching and measurement.</div></section></div>`); }
function render() {
    if (state.view === 'dashboard')
        void renderDashboard();
    else if (state.view === 'challenges')
        renderChallenges();
    else if (state.view === 'submit')
        renderSubmit();
    else if (state.view === 'matches')
        renderMatches();
    else if (state.view === 'projects')
        void renderProjects();
    else if (state.view === 'impact')
        void renderImpact();
    else if (state.view === 'organizations')
        renderOrganizations();
    else
        renderProfile();
}
// Deep link support: #submit, #matches, etc.
const initial = location.hash.replace('#', '');
if (initial && navItems.some(x => x[0] === initial))
    state.view = initial;
const savedTheme = localStorage.getItem('civicsolve-theme');
if (savedTheme === 'light')
    document.documentElement.dataset.theme = 'light';
window.addEventListener('hashchange', () => { const v = location.hash.replace('#', ''); if (navItems.some(x => x[0] === v)) {
    state.view = v;
    render();
} });
render();
//# sourceMappingURL=main.js.map