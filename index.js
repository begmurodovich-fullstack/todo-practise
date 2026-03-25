const addBtn = document.getElementById('addBtn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const taskList = document.getElementById('taskList');
const taskInput = document.getElementById('taskInput');
const tasksCount = document.getElementById('tasksCount');
const filterButtons = document.querySelectorAll('.filter-btn');
const emptyMessage = document.getElementById('emptyMessage');
const themeToggle = document.getElementById('themeToggle');
const progressRing = document.querySelector('.ring-progress');
const progressText = document.querySelector('.progress-text');

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
  updateProgress();
}

function shakeInput() {
  taskInput.style.animation = 'shake 0.4s ease';
  setTimeout(() => taskInput.style.animation = '', 400);
}

function createTask(text, completed) {
  const li = document.createElement('li');

  const checkboxWrapper = document.createElement('div');
  checkboxWrapper.className = 'checkbox-wrapper';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = completed;

  const checkboxCustom = document.createElement('div');
  checkboxCustom.className = 'checkbox-custom';
  checkboxCustom.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>`;

  checkboxWrapper.appendChild(checkbox);
  checkboxWrapper.appendChild(checkboxCustom);

  const span = document.createElement('span');
  span.textContent = text;

  const removeBtn = document.createElement('button');
  removeBtn.className = 'delete';
  removeBtn.innerHTML = `<svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  removeBtn.setAttribute('aria-label', 'Delete task');

  if (completed) li.classList.add('completed');

  checkbox.addEventListener('change', () => {
    li.classList.toggle('completed');
    saveTasks();
    applyFilter(currentFilter);
    updateStats();
    updateProgress();
  });

  removeBtn.addEventListener('click', () => {
    li.classList.add('removing');
    setTimeout(() => {
      li.remove();
      saveTasks();
      applyFilter(currentFilter);
      updateStats();
      updateProgress();
    }, 300);
  });

  span.addEventListener('dblclick', () => editTask(span, li));

  li.appendChild(checkboxWrapper);
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
  if (completed.length === 0) return;

  completed.forEach(li => li.classList.add('removing'));
  setTimeout(() => {
    completed.forEach(li => li.remove());
    saveTasks();
    applyFilter(currentFilter);
    updateStats();
    updateProgress();
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
    updateProgress();
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
  updateProgress();
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
  const totalTasks = document.querySelectorAll('#taskList li').length;
  const activeTasks = document.querySelectorAll('#taskList li:not(.completed)').length;
  tasksCount.textContent = activeTasks;
  updateEmptyMessage();
}

function updateProgress() {
  const totalTasks = document.querySelectorAll('#taskList li').length;
  const completedTasks = document.querySelectorAll('#taskList li.completed').length;
  
  if (totalTasks === 0) {
    progressRing.style.strokeDashoffset = 125.6;
    progressText.textContent = '0%';
    return;
  }

  const percent = Math.round((completedTasks / totalTasks) * 100);
  const offset = 125.6 - (125.6 * percent / 100);
  
  progressRing.style.strokeDashoffset = offset;
  progressText.textContent = `${percent}%`;
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
  const iconPath = isLight 
    ? 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'
    : 'M12 3v1M12 20v1M4.22 4.22l.71.71M18.36 18.36l.71.71M1 12h1M22 12h1M4.22 19.78l.71-.71M18.36 5.64l.71-.71';
  
  themeToggle.querySelector('svg').innerHTML = `<path d="${iconPath}"/>`;
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.querySelector('svg').innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  } else {
    themeToggle.querySelector('svg').innerHTML = '<path d="M12 3v1M12 20v1M4.22 4.22l.71.71M18.36 18.36l.71.71M1 12h1M22 12h1M4.22 19.78l.71-.71M18.36 5.64l.71-.71"/>';
  }
}

const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  #taskInput.shake {
    animation: shake 0.4s ease;
    border-color: var(--accent-danger) !important;
  }
`;
document.head.appendChild(style);

init();
