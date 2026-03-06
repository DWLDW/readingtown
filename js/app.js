import { getState } from './store.js';
import { getModules, registerModule } from './modules/moduleRegistry.js';
import './modules/scheduleModule.js';
import './modules/classroomModule.js';
import './modules/masterModule.js';

const menuEl = document.querySelector('#menu');
const rootEl = document.querySelector('#module-root');

let activeId = 'classroom';

function buildDynamicModules() {
  const { customMenus } = getState();
  customMenus.forEach((menu) => {
    if (getModules().some((m) => m.id === menu.id)) return;
    registerModule({
      id: menu.id,
      title: menu.title,
      render(root) {
        root.innerHTML = `<div class="panel"><h3>${menu.title}</h3><p>${menu.description || '이 메뉴는 마스터 설정에서 생성된 확장 모듈입니다. 이 영역에 원하는 기능을 연결하세요.'}</p></div>`;
      },
    });
  });
}

function draw() {
  buildDynamicModules();
  const modules = getModules();
  if (!modules.some((m) => m.id === activeId)) {
    activeId = modules[0]?.id;
  }

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
  current?.render(rootEl, { rerender: draw });
}

draw();
