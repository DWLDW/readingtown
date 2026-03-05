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

function formatSessionLabel(s) {
  return `${s.className} / ${s.teacher} (${s.start}~${s.end})`;
}

registerModule({
  id: 'classroom',
  title: '출석·채점',
  render(root, { rerender }) {
    root.innerHTML = '';
    const state = getState();

    const today = new Date().getDay();
    const current = nowMinutes();
    const todayClasses = state.schedules.filter(
      (s) => s.day === today && hhmmToMin(s.start) <= current && current <= hhmmToMin(s.end)
    );

    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.innerHTML = `
      <h3>해당 시간대 수업 확인</h3>
      <p class="small">현재 시간에 해당하는 수업만 자동 노출됩니다. 필요 시 전체 수업에서 선택할 수도 있습니다.</p>
      <div class="inline-row">
        <select id="class-select"></select>
        <button class="ghost" id="refresh-now">현재시간 다시 확인</button>
      </div>
    `;

    const classes = todayClasses.length ? todayClasses : state.schedules;
    const select = panel.querySelector('#class-select');
    select.innerHTML = classes.length
      ? classes.map((s) => `<option value="${s.id}">${formatSessionLabel(s)}</option>`).join('')
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
          ${state.scoreItems.map((i) => `<th>${i.name} (${i.maxScore})</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${selectedClass.students
          .map((st) => {
            const session = getState().sessions[sessionKey] || { attendance: {}, scores: {} };
            const currentAttendance = session.attendance[st.id] || 'present';
            const scoreCells = state.scoreItems
              .map((item) => {
                const score = session.scores?.[st.id]?.[item.id] ?? '';
                return `<td><input data-score-student="${st.id}" data-score-item="${item.id}" type="number" min="0" max="${item.maxScore}" value="${score}" style="width:72px;" /></td>`;
              })
              .join('');
            return `
              <tr>
                <td>${st.name}</td>
                <td>
                  <select data-attendance="${st.id}">
                    <option value="present" ${currentAttendance === 'present' ? 'selected' : ''}>출석</option>
                    <option value="late" ${currentAttendance === 'late' ? 'selected' : ''}>지각</option>
                    <option value="absent" ${currentAttendance === 'absent' ? 'selected' : ''}>결석</option>
                  </select>
                </td>
                ${scoreCells}
              </tr>
            `;
          })
          .join('')}
      </tbody>
    `;

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
