import { getState } from '../store.js';
import { registerModule } from './moduleRegistry.js';

registerModule({
  id: 'student-portal',
  title: '내 성적 조회',
  roles: ['student'],
  render(root, { user }) {
    const state = getState();
    root.innerHTML = '';

    const myClasses = state.schedules.filter((s) => (s.studentIds || []).includes(user.id));

    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.innerHTML = `<h3>${user.name} 학생 성적 조회</h3>`;

    if (!myClasses.length) {
      panel.innerHTML += '<p class="small">배정된 반이 없습니다.</p>';
      root.append(panel);
      return;
    }

    const scoreRows = [];
    Object.entries(state.sessions).forEach(([sessionKey, session]) => {
      const scheduleId = sessionKey.split('_')[0];
      const schedule = state.schedules.find((s) => s.id === scheduleId);
      if (!schedule || !(schedule.studentIds || []).includes(user.id)) return;

      const date = sessionKey.split('_')[1];
      const scoreMap = session.scores?.[user.id] || {};
      const attendance = session.attendance?.[user.id] || '-';
      scoreRows.push({ schedule, date, scoreMap, attendance });
    });

    panel.innerHTML += `
      <table>
        <thead><tr><th>일자</th><th>반</th><th>출석</th><th>점수 상세</th></tr></thead>
        <tbody>
          ${scoreRows
            .map((row) => {
              const detail = state.scoreItems
                .map((item) => `${item.name}: ${row.scoreMap[item.id] ?? '-'} / ${item.maxScore}`)
                .join('<br/>');
              return `<tr>
                <td>${row.date}</td>
                <td>${row.schedule.className}</td>
                <td>${row.attendance}</td>
                <td>${detail}</td>
              </tr>`;
            })
            .join('') || '<tr><td colspan="4">아직 기록된 수업 결과가 없습니다.</td></tr>'}
        </tbody>
      </table>`;

    root.append(panel);
  },
});
