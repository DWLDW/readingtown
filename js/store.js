const STORAGE_KEY = 'academy-attendance-v2';

const seed = {
  users: [
    { id: 'admin-1', role: 'admin', name: '관리자', loginId: 'admin', password: 'admin123' },
    { id: 'teacher-1', role: 'teacher', name: '김선생', loginId: 'teacher1', password: 'teacher123' },
    { id: 'teacher-2', role: 'teacher', name: '이선생', loginId: 'teacher2', password: 'teacher123' },
    { id: 'student-1', role: 'student', name: '홍길동', loginId: 'student1', password: 'student123' },
    { id: 'student-2', role: 'student', name: '김영희', loginId: 'student2', password: 'student123' },
  ],
  students: [
    {
      id: 'student-1',
      name: '홍길동',
      gender: '남',
      age: 14,
      school: '리딩중학교',
      level: '중급',
      memo: '어휘 테스트 강점',
    },
    {
      id: 'student-2',
      name: '김영희',
      gender: '여',
      age: 13,
      school: '리딩중학교',
      level: '초중급',
      memo: '문법 보강 필요',
    },
  ],
  scoreItems: [
    { id: 'score-attitude', name: '수업태도', maxScore: 5 },
    { id: 'score-homework', name: '과제완료', maxScore: 10 },
  ],
  schedules: [],
  sessions: {},
  customMenus: [],
  currentUserId: null,
};

let state = load();

function ensureStructure(target) {
  target.users ??= [];
  target.students ??= [];
  target.scoreItems ??= [];
  target.schedules ??= [];
  target.sessions ??= {};
  target.customMenus ??= [];
  target.currentUserId ??= null;
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(seed);

    const parsed = JSON.parse(raw);
    const merged = { ...structuredClone(seed), ...parsed };
    ensureStructure(merged);
    return merged;
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
  ensureStructure(state);
  save();
}

export function getCurrentUser() {
  return state.users.find((u) => u.id === state.currentUserId) || null;
}

export function login(loginId, password) {
  const user = state.users.find((u) => u.loginId === loginId && u.password === password);
  if (!user) return null;
  updateState((s) => {
    s.currentUserId = user.id;
  });
  return user;
}

export function logout() {
  updateState((s) => {
    s.currentUserId = null;
  });
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
