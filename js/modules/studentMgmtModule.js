import { getState, updateState } from '../store.js';
import { registerModule } from './moduleRegistry.js';

registerModule({
  id: 'students',
  title: '학생 관리',
  roles: ['admin', 'teacher'],
  render(root, { rerender }) {
    const { students, users } = getState();
    root.innerHTML = '';

    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.innerHTML = `
      <h3>학생 등록</h3>
      <form id="student-form" class="grid">
        <label>이름<input name="name" required /></label>
        <label>성별
          <select name="gender"><option value="남">남</option><option value="여">여</option></select>
        </label>
        <label>나이<input type="number" name="age" min="7" max="30" required /></label>
        <label>학교<input name="school" /></label>
        <label>수업레벨<input name="level" placeholder="예: 초급/중급" /></label>
        <label style="grid-column: 1 / -1;">메모<textarea name="memo" rows="2"></textarea></label>
        <label>학생 로그인ID<input name="loginId" required placeholder="예: student3" /></label>
        <label>학생 비밀번호<input name="password" required placeholder="초기 비밀번호" /></label>
        <label><button class="primary" type="submit">학생 추가</button></label>
      </form>`;

    panel.querySelector('#student-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const id = crypto.randomUUID();
      const loginId = fd.get('loginId').toString().trim();

      if (users.some((u) => u.loginId === loginId)) {
        alert('이미 사용중인 로그인 ID입니다.');
        return;
      }

      updateState((s) => {
        s.students.push({
          id,
          name: fd.get('name').toString().trim(),
          gender: fd.get('gender').toString(),
          age: Number(fd.get('age')),
          school: fd.get('school').toString().trim(),
          level: fd.get('level').toString().trim(),
          memo: fd.get('memo').toString().trim(),
        });
        s.users.push({
          id,
          role: 'student',
          name: fd.get('name').toString().trim(),
          loginId,
          password: fd.get('password').toString(),
        });
      });
      rerender();
    });

    root.append(panel);

    const list = document.createElement('div');
    list.className = 'panel';
    list.innerHTML = `
      <h3>학생 목록</h3>
      <table>
        <thead><tr><th>이름</th><th>성별</th><th>나이</th><th>학교</th><th>레벨</th></tr></thead>
        <tbody>
          ${students
            .map(
              (s) => `<tr>
                <td>${s.name}</td>
                <td>${s.gender || '-'}</td>
                <td>${s.age || '-'}</td>
                <td>${s.school || '-'}</td>
                <td>${s.level || '-'}</td>
              </tr>`
            )
            .join('')}
        </tbody>
      </table>`;

    root.append(list);
  },
});
