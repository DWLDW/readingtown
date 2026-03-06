import { getSessionKey, getState, updateState } from '../store.js';
import { registerModule } from './moduleRegistry.js';

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function hhmmToMin(v) {
  const [h, m] = v.split(':').map(Number);
  return h * 60 + m;
}

function classLabel(s, teacherName) {
  return `${s.className} / ${teacherName} (${s.start}~${s.end})`;
}

registerModule({
  id: 'classroom',
  title: '출석·채점',
  roles: ['admin', 'teacher'],
  render(root, { rerender, user }) {
    root.innerHTML = '';
    const state = getState();

    const baseClasses = user.role === 'teacher' ? state.schedules.filter((s) => s.teacherId === user.id) : state.schedules;
    const today = new Date().getDay();
    const current = nowMinutes();

    const nowClasses = baseClasses.filter(
      (s) => s.day === today && hhmmToMin(s.start) <= current && current <= hhmmToMin(s.end)
    );

    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.innerHTML = `
      <h3>해당 시간대 수업 확인</h3>
      <p class="small">현재 시간 수업을 우선 노출합니다. 없으면 담당 수업 전체를 보여줍니다.</p>
      <div class="inline-row">
        <select id="class-select"></select>
        <button class="ghost" id="refresh-now">현재시간 다시 확인</button>
      </div>`;

    const classes = nowClasses.length ? nowClasses : baseClasses;
    const select = panel.querySelector('#class-select');

    select.innerHTML = classes.length
      ? classes
          .map((s) => {
            const teacher = state.users.find((u) => u.id === s.teacherId);
            return `<option value="${s.id}">${classLabel(s, teacher?.name || '-')}</option>`;
          })
          .join('')
      : '<option>등록된 수업이 없습니다</option>';

    panel.querySelector('#refresh-now').addEventListener('click', rerender);
    root.append(panel);

    if (!classes.length) return;

    const selectedClass = classes.find((s) => s.id === select.value) || classes[0];
    const sessionKey = getSessionKey(selectedClass.id);

    if (!state.sessions[sessionKey]) {
      updateState((s) => {
        s.sessions[sessionKey] = { attendance: {}, scores: {} };
      });
    }

    const detail = document.createElement('div');
    detail.className = 'panel';
    detail.innerHTML = `<h3>출석 및 점수 입력: ${selectedClass.className}</h3>`;

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>학생명</th>
          <th>출석</th>
          ${state.scoreItems.map((item) => `<th>${item.name} (${item.maxScore})</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${(selectedClass.studentIds || [])
          .map((studentId) => {
            const student = state.students.find((st) => st.id === studentId);
            const session = getState().sessions[sessionKey] || { attendance: {}, scores: {} };
            const currentAttendance = session.attendance[studentId] || 'present';
            const scoreCells = state.scoreItems
              .map((item) => {
                const score = session.scores?.[studentId]?.[item.id] ?? '';
                return `<td><input data-score-student="${studentId}" data-score-item="${item.id}" type="number" min="0" max="${item.maxScore}" value="${score}" style="width:72px;" /></td>`;
              })
              .join('');
            return `
              <tr>
                <td>${student?.name || studentId}</td>
                <td>
                  <select data-attendance="${studentId}">
                    <option value="present" ${currentAttendance === 'present' ? 'selected' : ''}>출석</option>
                    <option value="late" ${currentAttendance === 'late' ? 'selected' : ''}>지각</option>
                    <option value="absent" ${currentAttendance === 'absent' ? 'selected' : ''}>결석</option>
                  </select>
                </td>
                ${scoreCells}
              </tr>`;
          })
          .join('')}
      </tbody>`;

    table.querySelectorAll('[data-attendance]').forEach((el) => {
      el.addEventListener('change', () => {
        const studentId = el.dataset.attendance;
        updateState((s) => {
          s.sessions[sessionKey] ??= { attendance: {}, scores: {} };
          s.sessions[sessionKey].attendance[studentId] = el.value;
        });
      });
    });

    table.querySelectorAll('[data-score-student]').forEach((el) => {
      el.addEventListener('change', () => {
        const studentId = el.dataset.scoreStudent;
        const itemId = el.dataset.scoreItem;
        const value = el.value === '' ? '' : Number(el.value);

        updateState((s) => {
          s.sessions[sessionKey] ??= { attendance: {}, scores: {} };
          s.sessions[sessionKey].scores[studentId] ??= {};
          if (value === '') {
            delete s.sessions[sessionKey].scores[studentId][itemId];
          } else {
            s.sessions[sessionKey].scores[studentId][itemId] = value;
          }
        });
      });
    });

    detail.append(table);
    root.append(detail);

    select.addEventListener('change', rerender);
  },
});
