// Leonida Platinum Atlas — boot, filters, spoiler rule, view switching and deep links.
// Deep links (also used for screenshots): ?view=checklist|roadmap|missables, ?open=<id>,
// ?grade=<grade>, ?kind=<kind>, ?seed=13 (marks 13 early trophies earned for a demo),
// ?spoilers=off (reveals hidden story trophies).
import { loadEarned, saveEarned, exportEarned, parseImport, SEED_IDS } from './store.js';
import { trophyRow, renderDetail, renderRoadmap, renderMissables } from './views.js';

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

let earned = loadEarned();
if (params.get('seed') === '13' && earned.size === 0) {
  earned = new Set(SEED_IDS);
  saveEarned(earned);
}

const state = {
  view: params.get('view') || 'checklist',
  search: '',
  kind: params.get('kind') || 'all',
  grade: params.get('grade') || 'all',
  missableOnly: false,
  earnedOnly: false,
  spoilers: params.get('spoilers') !== 'off',
  selectedId: Number(params.get('open')) || 17,
};
if (!byId.has(state.selectedId)) state.selectedId = trophies[0].id;

const list = document.getElementById('trophyList');
const pane = document.getElementById('detailPane');
const searchInput = document.getElementById('search');
const kindSelect = document.getElementById('kind');
const gradeSelect = document.getElementById('grade');
const missableBox = document.getElementById('missableOnly');
const earnedBox = document.getElementById('earnedOnly');
const spoilerBox = document.getElementById('spoilers');
kindSelect.value = state.kind;
gradeSelect.value = state.grade;
spoilerBox.checked = state.spoilers;

function isHidden(t) {
  return state.spoilers && t.hidden && !earned.has(t.id);
}

function visibleTrophies() {
  const q = state.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.kind !== 'all' && t.kind !== state.kind) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.missableOnly && !t.missable) return false;
    if (state.earnedOnly && !earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderProgress() {
  document.getElementById('earnedCount').textContent = String(earned.size);
  document.getElementById('barFill').style.width = (earned.size / trophies.length * 100).toFixed(1) + '%';
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const total = trophies.filter((t) => t.grade === g).length;
    const done = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    return done + '/' + total + ' ' + g;
  });
  document.getElementById('gradeCounts').textContent = counts.join(' · ');
  const next = trophies.find((t) => !earned.has(t.id) && t.stage === 1) || trophies.find((t) => !earned.has(t.id));
  document.getElementById('nextUp').textContent = next ? 'Next up: ' + next.name : 'Platinum earned — Leonida Legend.';
}

function renderList() {
  const shown = visibleTrophies();
  list.replaceChildren();
  for (const t of shown) {
    list.append(trophyRow(t, earned, isHidden(t), toggleEarned, selectTrophy, state.selectedId));
  }
  document.getElementById('resultCount').textContent = shown.length + ' of 55 trophies shown' +
    (state.missableOnly ? ' — missables only' : '') +
    (state.spoilers ? ' — story spoilers hidden until earned' : '');
}

function renderDetailView() {
  const t = byId.get(state.selectedId);
  const prev = trophies[(trophies.indexOf(t) + trophies.length - 1) % trophies.length];
  const next = trophies[(trophies.indexOf(t) + 1) % trophies.length];
  renderDetail(pane, t, earned, isHidden(t), toggleEarned,
    () => selectTrophy(prev.id), () => selectTrophy(next.id));
}

function renderRoadmapView() {
  renderRoadmap(document.getElementById('roadmapStages'), trophies, earned, openFromRoadmap);
}

function renderMissablesView() {
  renderMissables(document.getElementById('missableList'), trophies, earned, openFromRoadmap);
}

function openFromRoadmap(id) {
  selectTrophy(id);
  switchView('checklist');
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetailView();
  renderRoadmapView();
  renderMissablesView();
}

function toggleEarned(id, on) {
  if (on) earned.add(id);
  else earned.delete(id);
  saveEarned(earned);
  renderAll();
}

function selectTrophy(id) {
  state.selectedId = id;
  renderList();
  renderDetailView();
  pane.scrollIntoView({ block: 'nearest' });
}

function switchView(view) {
  state.view = view;
  for (const btn of document.querySelectorAll('.view-btn')) {
    btn.classList.toggle('active', btn.dataset.view === view);
  }
  document.getElementById('view-checklist').hidden = view !== 'checklist';
  document.getElementById('view-roadmap').hidden = view !== 'roadmap';
  document.getElementById('view-missables').hidden = view !== 'missables';
  document.getElementById('toolbar').style.display = view === 'checklist' ? '' : 'none';
  document.getElementById('resultCount').style.display = view === 'checklist' ? '' : 'none';
}

for (const btn of document.querySelectorAll('.view-btn')) {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
}
searchInput.addEventListener('input', () => { state.search = searchInput.value; renderList(); });
kindSelect.addEventListener('change', () => { state.kind = kindSelect.value; renderList(); });
gradeSelect.addEventListener('change', () => { state.grade = gradeSelect.value; renderList(); });
missableBox.addEventListener('change', () => { state.missableOnly = missableBox.checked; renderList(); });
earnedBox.addEventListener('change', () => { state.earnedOnly = earnedBox.checked; renderList(); });
spoilerBox.addEventListener('change', () => { state.spoilers = spoilerBox.checked; renderAll(); });
document.getElementById('exportBtn').addEventListener('click', () => exportEarned(earned));
document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    earned = parseImport(await file.text(), trophies.map((t) => t.id));
    saveEarned(earned);
    renderAll();
  } catch (err) {
    alert('Could not import that file: ' + err.message);
  }
  e.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned ticks?')) {
    earned = new Set();
    saveEarned(earned);
    renderAll();
  }
});

switchView(['checklist', 'roadmap', 'missables'].includes(state.view) ? state.view : 'checklist');
renderAll();
