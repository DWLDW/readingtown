import { getState, updateState } from '../store.js';
import { registerModule } from './moduleRegistry.js';

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

function toStudents(raw) {
  return raw
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({ id: crypto.randomUUID(), name }));
}

registerModule({
  id: 'schedule',
  title: '시간표 관리',
  render(root, { rerender }) {
    const { schedules } = getState();
    root.innerHTML = '';

    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.innerHTML = `
      <h3>시간표/반 등록</h3>
      <form id="schedule-form" class="grid">
        <label>반 이름<input name="className" required placeholder="예: 중1 영어A" /></label>
        <label>교사명<input name="teacher" required placeholder="예: 김선생" /></label>
        <label>요일
          <select name="day" required>
            ${dayNames.map((n, i) => `<option value="${i}">${n}</option>`).join('')}
          </select>
        </label>
        <label>시작시간<input type="time" name="start" required /></label>
        <label>종료시간<input type="time" name="end" required /></label>
        <label style="grid-column: 1 / -1;">학생명단 (쉼표 구분)
          <textarea name="students" required rows="2" placeholder="홍길동, 김영희, 이민수"></textarea>
        </label>
        <label><button class="primary" type="submit">시간표 추가</button></label>
      </form>
    `;

    panel.querySelector('#schedule-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const className = fd.get('className').toString().trim();
      const teacher = fd.get('teacher').toString().trim();
      const day = Number(fd.get('day'));
      const start = fd.get('start').toString();
      const end = fd.get('end').toString();
      const students = toStudents(fd.get('students').toString());
      if (!className || !teacher || !start || !end || students.length === 0) return;

      updateState((s) => {
        s.schedules.push({
          id: crypto.randomUUID(),
          className,
          teacher,
          day,
          start,
          end,
          students,
        });
      });
      rerender();
    });

    root.append(panel);

    const list = document.createElement('div');
    list.className = 'panel';
    list.innerHTML = '<h3>등록된 시간표</h3>';

    if (schedules.length === 0) {
      list.innerHTML += '<p class="small">아직 등록된 수업이 없습니다.</p>';
    } else {
      const table = document.createElement('table');
      table.innerHTML = `
        <thead><tr><th>반</th><th>교사</th><th>요일/시간</th><th>학생수</th><th></th></tr></thead>
        <tbody>
          ${schedules
            .map(
              (s) => `<tr>
                <td>${s.className}</td>
                <td>${s.teacher}</td>
                <td>${dayNames[s.day]} ${s.start}~${s.end}</td>
                <td>${s.students.length}</td>
                <td><button class="ghost" data-del-id="${s.id}">삭제</button></td>
              </tr>`
            )
            .join('')}
        </tbody>
      `;
      list.append(table);
      table.querySelectorAll('[data-del-id]').forEach((button) => {
        button.addEventListener('click', () => {
          const id = button.dataset.delId;
          updateState((state) => {
            state.schedules = state.schedules.filter((s) => s.id !== id);
            Object.keys(state.sessions).forEach((k) => {
              if (k.startsWith(`${id}_`)) delete state.sessions[k];
            });
          });
          rerender();
        });
      });
    }
    root.append(list);
  },
});
