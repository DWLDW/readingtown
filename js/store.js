const STORAGE_KEY = 'academy-attendance-v1';

const seed = {
  scoreItems: [
    { id: crypto.randomUUID(), name: '수업태도', maxScore: 5 },
    { id: crypto.randomUUID(), name: '과제완료', maxScore: 10 },
  ],
  schedules: [],
  sessions: {},
  customMenus: [],
};

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(seed);
    return { ...structuredClone(seed), ...JSON.parse(raw) };
  } catch {
    return structuredClone(seed);
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getState() {
  return state;
}

export function updateState(mutator) {
  mutator(state);
  save();
}

export function getSessionKey(scheduleId, date = new Date()) {
  const d = new Date(date);
  const day = d.toISOString().slice(0, 10);
  return `${scheduleId}_${day}`;
}

export function resetAll() {
  state = structuredClone(seed);
  save();
}
