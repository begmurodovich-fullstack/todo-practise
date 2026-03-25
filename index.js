const addBtn = document.getElementById('addBtn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const taskList = document.getElementById('taskList');
const taskInput = document.getElementById('taskInput');
const tasksCount = document.getElementById('tasksCount');
const filterButtons = document.querySelectorAll('.filter-btn');
const emptyMessage = document.getElementById('emptyMessage');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');

let currentFilter = 'all';

function init() {
  loadTheme();
  loadTasks();
  setupEventListeners();
}

function setupEventListeners() {
  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
  });

  addBtn.addEventListener('click', addTask);

  clearCompletedBtn.addEventListener('click', clearCompleted);

  deleteAllBtn.addEventListener('click', deleteAll);

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      currentFilter = button.dataset.filter;
      applyFilter(currentFilter);
    });
  });

  themeToggle.addEventListener('click', toggleTheme);
}

function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText === '') {
    shakeInput();
    return;
  }

  createTask(taskText, false);
  taskInput.value = '';
  saveTasks();
  applyFilter(currentFilter);
  updateStats();
}

function shakeInput() {
  taskInput.style.animation = 'shake 0.4s ease';
  setTimeout(() => taskInput.style.animation = '', 400);
}

function createTask(text, completed) {
  const li = document.createElement('li');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = completed;

  const span = document.createElement('span');
  span.textContent = text;

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '✕';
  removeBtn.classList.add('delete');

  if (completed) li.classList.add('completed');

  checkbox.addEventListener('change', () => {
    li.classList.toggle('completed');
    saveTasks();
    applyFilter(currentFilter);
    updateStats();
  });

  removeBtn.addEventListener('click', () => {
    li.classList.add('removing');
    setTimeout(() => {
      li.remove();
      saveTasks();
      applyFilter(currentFilter);
      updateStats();
    }, 300);
  });

  span.addEventListener('dblclick', () => editTask(span, li));

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(removeBtn);
  taskList.appendChild(li);
}

function editTask(span, li) {
  const oldText = span.textContent;
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.value = oldText;
  editInput.classList.add('edit-input');

  li.replaceChild(editInput, span);
  editInput.focus();
  editInput.select();

  function saveEdit() {
    const newText = editInput.value.trim();
    span.textContent = newText === '' ? oldText : newText;
    if (li.contains(editInput)) {
      li.replaceChild(span, editInput);
    }
    saveTasks();
  }

  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') {
      editInput.value = oldText;
      saveEdit();
    }
  });

  editInput.addEventListener('blur', saveEdit);
}

function clearCompleted() {
  const completed = document.querySelectorAll('#taskList li.completed');
  completed.forEach(li => {
    li.classList.add('removing');
  });
  setTimeout(() => {
    completed.forEach(li => li.remove());
    saveTasks();
    applyFilter(currentFilter);
    updateStats();
  }, 300);
}

function deleteAll() {
  const allTasks = document.querySelectorAll('#taskList li');
  if (allTasks.length === 0) return;

  allTasks.forEach(li => li.classList.add('removing'));
  setTimeout(() => {
    taskList.innerHTML = '';
    saveTasks();
    applyFilter(currentFilter);
    updateStats();
  }, 300);
}

function saveTasks() {
  const tasks = [];
  document.querySelectorAll('#taskList li').forEach(li => {
    const text = li.querySelector('span')?.textContent || '';
    const completed = li.querySelector('input[type="checkbox"]').checked;
    tasks.push({ text, completed });
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  try {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => createTask(task.text, task.completed));
  } catch (e) {
    console.error('Error loading tasks:', e);
    localStorage.removeItem('tasks');
  }
  applyFilter(currentFilter);
  updateStats();
}

function applyFilter(filter) {
  const allTasks = document.querySelectorAll('#taskList li');

  allTasks.forEach(li => {
    li.classList.remove('hidden');

    if (filter === 'active' && li.classList.contains('completed')) {
      li.classList.add('hidden');
    }

    if (filter === 'completed' && !li.classList.contains('completed')) {
      li.classList.add('hidden');
    }
  });

  updateEmptyMessage();
}

function updateStats() {
  const activeTasks = document.querySelectorAll('#taskList li:not(.completed)').length;
  tasksCount.textContent = activeTasks;
  updateEmptyMessage();
}

function updateEmptyMessage() {
  const visibleTasks = document.querySelectorAll('#taskList li:not(.hidden)');
  if (visibleTasks.length === 0) {
    emptyMessage.classList.add('visible');
  } else {
    emptyMessage.classList.remove('visible');
  }
}

function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  themeIcon.textContent = isLight ? '☀️' : '🌙';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    themeIcon.textContent = '☀️';
  }
}

const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);

init();
