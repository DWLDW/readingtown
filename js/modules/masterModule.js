import { getState, resetAll, updateState } from '../store.js';
import { registerModule } from './moduleRegistry.js';

function makePanel(title) {
  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `<h3>${title}</h3>`;
  return panel;
}

function renderScoreItems(root, rerender) {
  const panel = makePanel('마스터: 평가 항목 관리');
  const state = getState();

  panel.insertAdjacentHTML(
    'beforeend',
    `<form id="score-item-form" class="grid">
      <label>항목명<input name="name" required placeholder="예: 수업참여" /></label>
      <label>만점<input type="number" name="maxScore" min="1" required value="10" /></label>
      <label style="justify-content:end"><button class="primary" type="submit">항목 추가</button></label>
    </form>`
  );

  const table = document.createElement('table');
  table.innerHTML = `
    <thead><tr><th>항목명</th><th>만점</th><th></th></tr></thead>
    <tbody>
      ${state.scoreItems
        .map(
          (item) => `<tr>
            <td>${item.name}</td>
            <td>${item.maxScore}</td>
            <td><button class="ghost" data-del-id="${item.id}">삭제</button></td>
          </tr>`
        )
        .join('')}
    </tbody>`;

  panel.append(table);

  panel.querySelector('#score-item-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get('name')?.toString().trim();
    const maxScore = Number(fd.get('maxScore'));
    if (!name || !maxScore) return;

    updateState((s) => {
      s.scoreItems.push({ id: crypto.randomUUID(), name, maxScore });
    });
    rerender();
  });

  table.querySelectorAll('[data-del-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.delId;
      updateState((s) => {
        s.scoreItems = s.scoreItems.filter((x) => x.id !== id);
      });
      rerender();
    });
  });

  root.append(panel);
}

function renderMenuAdmin(root, rerender) {
  const panel = makePanel('마스터: 사용자 메뉴(모듈) 추가');
  const { customMenus } = getState();

  panel.insertAdjacentHTML(
    'beforeend',
    `<p class="small">새로운 메뉴를 생성해 이후 기능을 연결할 수 있습니다.</p>
     <form id="menu-form" class="grid">
      <label>메뉴 ID<input name="id" required placeholder="예: counseling" pattern="[a-z0-9-]+" /></label>
      <label>메뉴명<input name="title" required placeholder="예: 상담기록" /></label>
      <label>권한
        <select name="roles" multiple size="3">
          <option value="admin" selected>관리자</option>
          <option value="teacher">교사</option>
          <option value="student">학생</option>
        </select>
      </label>
      <label>설명<textarea name="description" rows="1" placeholder="간단한 안내"></textarea></label>
      <label style="justify-content:end"><button class="primary" type="submit">메뉴 추가</button></label>
     </form>
     <div>${customMenus.map((m) => `<span class="pill">${m.title} (${(m.roles || []).join(',')})</span>`).join('')}</div>`
  );

  panel.querySelector('#menu-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = fd.get('id')?.toString().trim();
    const title = fd.get('title')?.toString().trim();
    const description = fd.get('description')?.toString().trim();
    const roles = fd.getAll('roles').map((r) => r.toString());

    if (!id || !title) return;

    updateState((s) => {
      if (s.customMenus.some((x) => x.id === id)) return;
      s.customMenus.push({ id, title, description, roles: roles.length ? roles : ['admin'] });
    });
    rerender();
  });

  root.append(panel);
}

function renderDanger(root, rerender) {
  const panel = makePanel('초기화');
  panel.innerHTML += `<p class="small">데모 데이터 및 입력값을 모두 지웁니다.</p><button class="ghost" id="reset-all">전체 초기화</button>`;
  panel.querySelector('#reset-all').addEventListener('click', () => {
    if (!confirm('전체 데이터를 초기화할까요?')) return;
    resetAll();
    rerender();
  });
  root.append(panel);
}

registerModule({
  id: 'master',
  title: '마스터 설정',
  roles: ['admin'],
  render(root, { rerender }) {
    root.innerHTML = '';
    renderScoreItems(root, rerender);
    renderMenuAdmin(root, rerender);
    renderDanger(root, rerender);
  },
});
