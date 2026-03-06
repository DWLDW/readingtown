import { getCurrentUser, getState, login, logout } from './store.js';
import { getModules, registerModule } from './modules/moduleRegistry.js';
import './modules/scheduleModule.js';
import './modules/classroomModule.js';
import './modules/masterModule.js';
import './modules/studentMgmtModule.js';
import './modules/studentPortalModule.js';

const menuEl = document.querySelector('#menu');
const rootEl = document.querySelector('#module-root');
const authEl = document.querySelector('#auth-area');

let activeId = 'classroom';

function buildDynamicModules() {
  const { customMenus } = getState();
  customMenus.forEach((menu) => {
    if (getModules().some((m) => m.id === menu.id)) return;
    registerModule({
      id: menu.id,
      title: menu.title,
      roles: menu.roles || ['admin'],
      render(root) {
        root.innerHTML = `<div class="panel"><h3>${menu.title}</h3><p>${menu.description || '이 메뉴는 마스터 설정에서 생성된 확장 모듈입니다. 이 영역에 원하는 기능을 연결하세요.'}</p></div>`;
      },
    });
  });
}

function renderLoginScreen() {
  menuEl.innerHTML = '';
  rootEl.innerHTML = `
    <div class="panel">
      <h3>로그인</h3>
      <p class="small">권한에 따라 메뉴가 다르게 보입니다.</p>
      <form id="login-form" class="grid">
        <label>아이디<input name="loginId" required placeholder="admin / teacher1 / student1" /></label>
        <label>비밀번호<input type="password" name="password" required placeholder="admin123 / teacher123 / student123" /></label>
        <label><button class="primary" type="submit">로그인</button></label>
      </form>
      <p class="small">데모 계정: 관리자(admin/admin123), 교사(teacher1/teacher123), 학생(student1/student123)</p>
      <p class="small" id="login-error"></p>
    </div>`;

  rootEl.querySelector('#login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const user = login(fd.get('loginId').toString().trim(), fd.get('password').toString());
    if (!user) {
      rootEl.querySelector('#login-error').textContent = '로그인 정보가 올바르지 않습니다.';
      return;
    }
    activeId = user.role === 'student' ? 'student-portal' : 'classroom';
    draw();
  });
}

function renderAuthArea(user) {
  if (!user) {
    authEl.innerHTML = '<span class="small">로그인 필요</span>';
    return;
  }

  authEl.innerHTML = `
    <div class="inline-row">
      <span class="pill">${user.role}</span>
      <strong>${user.name}</strong>
      <button class="ghost" id="logout-btn">로그아웃</button>
    </div>`;

  authEl.querySelector('#logout-btn').addEventListener('click', () => {
    logout();
    draw();
  });
}

function draw() {
  buildDynamicModules();
  const user = getCurrentUser();
  renderAuthArea(user);

  if (!user) {
    renderLoginScreen();
    return;
  }

  const modules = getModules().filter((m) => !m.roles || m.roles.includes(user.role));
  if (!modules.some((m) => m.id === activeId)) activeId = modules[0]?.id;

  menuEl.innerHTML = '';
  modules.forEach((module) => {
    const btn = document.createElement('button');
    btn.textContent = module.title;
    btn.className = module.id === activeId ? 'active' : '';
    btn.addEventListener('click', () => {
      activeId = module.id;
      draw();
    });
    menuEl.append(btn);
  });

  const current = modules.find((m) => m.id === activeId);
  current?.render(rootEl, { rerender: draw, user });
}

draw();
