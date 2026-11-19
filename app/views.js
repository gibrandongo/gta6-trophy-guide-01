// Rendering: checklist rows, the guide detail pane, the roadmap and the missables page.
export const KIND_LABELS = {
  platinum: 'Platinum', story: 'Story', mission: 'Story mission', side: 'Side strand',
  collectible: 'Collectible', activity: 'Activity', combat: 'Combat & heist',
  money: 'Money & property', world: 'Exploring Leonida',
};

export const STAGES = [
  { n: 1, title: 'Play the story', text: 'Chapters 1–4, the opening mission and the finale, plus the six named story missions. These unlock the map, the contacts and the side strands — do them first, in order.' },
  { n: 2, title: 'Finish every strand', text: 'The final missions for Andy, Kenton, Billy, Randy and Tyrone, the 8 stranger strands, and Bret’s unique-animal hunt. Start strands as they appear; do not leave all of them to the end.' },
  { n: 3, title: 'Learn Leonida', text: 'Explore all 52 areas, meditate at 18 spots, collect 3 card sets, WAiNK It at 100 locations, discover 100 vehicles, bowl at Kolt & Associates, buy the 8 garages and register 10 vehicles with Scooter Bros — plus the Ocean Beach cocktail.' },
  { n: 4, title: 'Master activities & combat', text: '250 stunts, all 9 activity types, gold in all 42 Shooting Range challenges, drone-race wins at 14 locations, 20 different race wins, the fishing challenge against Cal, one arcade game, 50 challenges, and the combat set: Combat Focus, VCIA, the Rhinos, the jewelry store, 5 bank vaults, the armored truck, one illegal operation per gang, the showroom smash and the melee drive-by.' },
  { n: 5, title: 'Money, choices & clean-up', text: 'The partner runs (Hot Together, Retail Therapy), the two choice trophies, the two odd ones out, $250,000 laundered and $100,000 spent — then 100% completion, and the platinum.' },
];

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function gradeBadge(grade) {
  return el('span', 'badge ' + grade, grade);
}

function badgesFor(t, earned) {
  const wrap = el('span', 'badges');
  wrap.append(gradeBadge(t.grade));
  wrap.append(el('span', 'badge kind', KIND_LABELS[t.kind] || t.kind));
  if (t.target) wrap.append(el('span', 'badge target', 'Target: ' + t.target));
  if (t.missable) wrap.append(el('span', 'badge missable', 'Missable — plan ahead'));
  if (earned.has(t.id)) wrap.append(el('span', 'badge earned-badge', 'Earned'));
  return wrap;
}

export function trophyRow(t, earned, hidden, onToggle, onSelect, selectedId) {
  const li = el('li', 'trophy' + (earned.has(t.id) ? ' earned' : '') + (t.id === selectedId ? ' selected' : ''));
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', 'Mark ' + (hidden ? 'hidden trophy' : t.name) + ' as earned');
  box.addEventListener('change', (e) => { e.stopPropagation(); onToggle(t.id, box.checked); });
  box.addEventListener('click', (e) => e.stopPropagation());
  li.append(box);
  const body = el('div', 'trophy-body');
  if (hidden) {
    body.append(el('div', 'trophy-name', 'Hidden story trophy #' + t.id));
    body.append(el('p', 'trophy-desc', 'A story trophy — its name and description stay hidden until you earn it. Tick it off when it pops.'));
    body.append(el('p', 'trophy-guide-snippet', 'Spoiler protection is on. Turn off “Hide story spoilers” above to reveal this trophy.'));
  } else {
    body.append(el('div', 'trophy-name', t.name));
    body.append(el('p', 'trophy-desc', 'Official: ' + t.description));
    body.append(el('p', 'trophy-guide-snippet', t.guide));
  }
  body.append(badgesFor(t, earned));
  li.append(body);
  li.addEventListener('click', () => onSelect(t.id));
  return li;
}

export function renderDetail(pane, t, earned, hidden, onToggle, onPrev, onNext) {
  pane.replaceChildren();
  if (!t) {
    pane.append(el('p', 'detail-empty', 'Pick a trophy on the left to read its full guide here.'));
    return;
  }
  const title = el('h2', null, hidden ? 'Hidden story trophy #' + t.id : t.name);
  pane.append(title);
  pane.append(badgesFor(t, earned));
  pane.append(el('p', 'detail-official', hidden ? 'Official description hidden until earned.' : 'Official description: “' + t.description + '”'));
  pane.append(el('h3', null, 'Guide — in our own words'));
  pane.append(el('p', 'detail-guide', hidden ? 'Hidden until earned. This is a story trophy: play the story mission it names and it pops when the mission ends.' : t.guide));
  if (t.missable) {
    pane.append(el('h3', null, 'Missable — read this first'));
    pane.append(el('p', null, 'This one hinges on a single attempt or a single run. Read the guide above, plan the attempt, and do not start it unprepared.'));
  }
  pane.append(el('h3', null, 'Sources'));
  pane.append(el('p', 'detail-source', t.source));
  const toggle = el('button', null, earned.has(t.id) ? 'Mark as not earned' : 'Mark as earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => onToggle(t.id, !earned.has(t.id)));
  pane.append(toggle);
  const nav = el('div', 'detail-nav');
  const prev = el('button', null, '← Previous trophy');
  const next = el('button', null, 'Next trophy →');
  prev.type = 'button';
  next.type = 'button';
  prev.addEventListener('click', onPrev);
  next.addEventListener('click', onNext);
  nav.append(prev, next);
  pane.append(nav);
}

export function renderRoadmap(host, trophies, earned, onOpen) {
  host.replaceChildren();
  for (const stage of STAGES) {
    const card = el('article', 'stage');
    const members = trophies.filter((t) => t.stage === stage.n);
    const done = members.filter((t) => earned.has(t.id)).length;
    const h = el('h3', null, 'Stage ' + stage.n + ': ' + stage.title + ' ');
    h.append(el('span', 'stage-count', done + ' of ' + members.length + ' earned'));
    card.append(h);
    card.append(el('p', null, stage.text));
    const chips = el('div', 'chips');
    for (const t of members) {
      const chip = el('button', 'chip' + (earned.has(t.id) ? ' done' : ''), (earned.has(t.id) ? '✓ ' : '') + t.name + ' (' + t.grade + ')');
      chip.type = 'button';
      chip.addEventListener('click', () => onOpen(t.id));
      chips.append(chip);
    }
    card.append(chips);
    host.append(card);
  }
}

export function renderMissables(host, trophies, earned, onOpen) {
  host.replaceChildren();
  const list = trophies.filter((t) => t.missable);
  for (const t of list) {
    const card = el('article', 'missable-card');
    card.append(el('h3', null, t.name));
    card.append(el('p', 'trophy-desc', 'Official: ' + t.description));
    card.append(el('p', null, t.guide));
    card.append(badgesFor(t, earned));
    const btn = el('button', null, 'Open the full guide →');
    btn.type = 'button';
    btn.addEventListener('click', () => onOpen(t.id));
    card.append(btn);
    host.append(card);
  }
  host.append(el('p', 'missable-note', 'Why only these 9? Every other trophy is a story mission named in its description, or a cumulative count (stunts, races, cards, areas) that never runs out. The 9 above are the only ones whose official descriptions describe a single attempt, a single continuous run, or a choice.'));
}
