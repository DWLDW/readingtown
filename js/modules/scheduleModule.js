import { getState, updateState } from '../store.js';
import { registerModule } from './moduleRegistry.js';

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

function teacherOptions(users, currentUser) {
  const teachers = users.filter((u) => u.role === 'teacher');
  if (currentUser.role === 'teacher') {
    return `<option value="${currentUser.id}">${currentUser.name}</option>`;
  }
  return teachers.map((t) => `<option value="${t.id}">${t.name}</option>`).join('');
}

function renderStudentProfile(root, student) {
  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `
    <h3>학생 상세 정보</h3>
    <table>
      <tbody>
        <tr><th>이름</th><td>${student.name}</td></tr>
        <tr><th>성별</th><td>${student.gender || '-'}</td></tr>
        <tr><th>나이</th><td>${student.age || '-'}</td></tr>
        <tr><th>학교</th><td>${student.school || '-'}</td></tr>
        <tr><th>수업레벨</th><td>${student.level || '-'}</td></tr>
        <tr><th>메모</th><td>${student.memo || '-'}</td></tr>
      </tbody>
    </table>`;
  root.append(panel);
}

registerModule({
  id: 'schedule',
  title: '반 관리',
  roles: ['admin', 'teacher'],
  render(root, { rerender, user }) {
    const state = getState();
    const schedules = user.role === 'teacher' ? state.schedules.filter((s) => s.teacherId === user.id) : state.schedules;

    let selectedStudentIds = [];
    let selectedProfileId = null;

    const redraw = () => {
      root.innerHTML = '';

      const panel = document.createElement('div');
      panel.className = 'panel';
      panel.innerHTML = `
        <h3>반 등록</h3>
        <form id="schedule-form" class="grid">
          <label>반 이름<input name="className" required placeholder="예: 중1 영어A" /></label>
          <label>담당 교사
            <select name="teacherId" ${user.role === 'teacher' ? 'disabled' : ''}>${teacherOptions(state.users, user)}</select>
          </label>
          <label>요일
            <select name="day" required>${dayNames.map((n, i) => `<option value="${i}">${n}</option>`).join('')}</select>
          </label>
          <label>시작시간<input type="time" name="start" required /></label>
          <label>종료시간<input type="time" name="end" required /></label>
          <label style="grid-column: 1 / -1;">학생 검색
            <input id="student-search" placeholder="이름/학교/레벨 검색" />
          </label>
          <div id="search-result" style="grid-column: 1 / -1;"></div>
          <div style="grid-column: 1 / -1;"><strong>선택된 학생</strong> <div id="selected-students"></div></div>
          <label><button class="primary" type="submit">반 추가</button></label>
        </form>`;

      root.append(panel);

      const result = panel.querySelector('#search-result');
      const selected = panel.querySelector('#selected-students');

      function drawSelected() {
        selected.innerHTML = selectedStudentIds.length
          ? selectedStudentIds
              .map((id) => {
                const st = state.students.find((x) => x.id === id);
                return `<button type="button" class="ghost student-chip" data-student-id="${id}">${st?.name || id} ✕</button>`;
              })
              .join(' ')
          : '<span class="small">아직 선택된 학생이 없습니다.</span>';

        selected.querySelectorAll('.student-chip').forEach((chip) => {
          chip.addEventListener('click', () => {
            const studentId = chip.dataset.studentId;
            selectedStudentIds = selectedStudentIds.filter((id) => id !== studentId);
            drawSelected();
            drawSearch(panel.querySelector('#student-search').value);
          });
        });
      }

      function drawSearch(keyword = '') {
        const q = keyword.trim().toLowerCase();
        const filtered = state.students.filter((st) => {
          const text = `${st.name} ${st.school || ''} ${st.level || ''}`.toLowerCase();
          return text.includes(q) && !selectedStudentIds.includes(st.id);
        });

        result.innerHTML = filtered.length
          ? filtered
              .map(
                (st) => `<div class="inline-row student-result">
                    <button type="button" class="ghost add-student" data-add-id="${st.id}">추가</button>
                    <button type="button" class="link-btn" data-profile-id="${st.id}">${st.name}</button>
                    <span class="small">${st.school || '-'} / ${st.level || '-'}</span>
                  </div>`
              )
              .join('')
          : '<p class="small">조건에 맞는 학생이 없습니다.</p>';

        result.querySelectorAll('[data-add-id]').forEach((btn) => {
          btn.addEventListener('click', () => {
            selectedStudentIds.push(btn.dataset.addId);
            drawSelected();
            drawSearch(panel.querySelector('#student-search').value);
          });
        });

        result.querySelectorAll('[data-profile-id]').forEach((btn) => {
          btn.addEventListener('click', () => {
            selectedProfileId = btn.dataset.profileId;
            redraw();
          });
        });
      }

      panel.querySelector('#student-search').addEventListener('input', (e) => {
        drawSearch(e.target.value);
      });

      drawSelected();
      drawSearch('');

      panel.querySelector('#schedule-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (selectedStudentIds.length === 0) {
          alert('학생을 최소 1명 선택해주세요.');
          return;
        }

        const fd = new FormData(e.target);
        const className = fd.get('className').toString().trim();
        const teacherId = user.role === 'teacher' ? user.id : fd.get('teacherId').toString();
        const day = Number(fd.get('day'));
        const start = fd.get('start').toString();
        const end = fd.get('end').toString();

        updateState((s) => {
          s.schedules.push({
            id: crypto.randomUUID(),
            className,
            teacherId,
            day,
            start,
            end,
            studentIds: selectedStudentIds,
          });
        });
        rerender();
      });

      const list = document.createElement('div');
      list.className = 'panel';
      list.innerHTML = '<h3>등록된 반</h3>';

      if (schedules.length === 0) {
        list.innerHTML += '<p class="small">아직 등록된 반이 없습니다.</p>';
      } else {
        const table = document.createElement('table');
        table.innerHTML = `
          <thead><tr><th>반</th><th>교사</th><th>요일/시간</th><th>학생수</th><th></th></tr></thead>
          <tbody>
            ${schedules
              .map((s) => {
                const teacher = state.users.find((u) => u.id === s.teacherId);
                return `<tr>
                  <td>${s.className}</td>
                  <td>${teacher?.name || '-'}</td>
                  <td>${dayNames[s.day]} ${s.start}~${s.end}</td>
                  <td>${(s.studentIds || []).length}</td>
                  <td><button class="ghost" data-del-id="${s.id}">삭제</button></td>
                </tr>`;
              })
              .join('')}
          </tbody>`;
        list.append(table);
        table.querySelectorAll('[data-del-id]').forEach((button) => {
          button.addEventListener('click', () => {
            const id = button.dataset.delId;
            updateState((s) => {
              s.schedules = s.schedules.filter((item) => item.id !== id);
              Object.keys(s.sessions).forEach((k) => {
                if (k.startsWith(`${id}_`)) delete s.sessions[k];
              });
            });
            rerender();
          });
        });
      }

      root.append(list);

      if (selectedProfileId) {
        const student = state.students.find((s) => s.id === selectedProfileId);
        if (student) renderStudentProfile(root, student);
      }
    };

    redraw();
  },
});
