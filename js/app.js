import { loadTodos, saveTodos } from './store.js';

const formEl = document.querySelector('#todo-form');
const inputEl = document.querySelector('#todo-input');
const listEl = document.querySelector('#todo-list');

let todos = loadTodos();

function render() {
  listEl.innerHTML = '';

  todos.forEach((todo, index) => {
    const item = document.createElement('li');
    item.className = 'todo-item';
    item.innerHTML = `
      <span>${todo}</span>
      <button type="button" data-index="${index}">삭제</button>
    `;
    listEl.append(item);
  });
}

formEl.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = inputEl.value.trim();
  if (!value) return;

  todos = [...todos, value];
  saveTodos(todos);
  inputEl.value = '';
  render();
});

listEl.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-index]');
  if (!button) return;

  const index = Number(button.dataset.index);
  todos = todos.filter((_, i) => i !== index);
  saveTodos(todos);
  render();
});

render();
