(() => {
const isMobile = () => matchMedia('(max-width:700px)').matches;

/** Opens, focuses, drags, minimizes, maximizes and closes the desktop windows. */
class WindowManager {
  constructor(windows, taskContainer) {
    this.z = 10;
    this.windows = [...windows];
    this.tasks = new Map();
    this.windows.forEach((win, i) => this.#build(win, i, taskContainer));
  }

  open(id) {
    const win = document.getElementById(id);
    win.hidden = false;
    win.classList.remove('min');
    this.tasks.get(win).hidden = false;
    this.focus(win);
  }

  focus(win) {
    for (const w of this.windows) {
      w.classList.remove('active');
      this.tasks.get(w).classList.remove('on');
    }
    win.classList.add('active');
    this.tasks.get(win).classList.add('on');
    win.style.zIndex = ++this.z;
  }

  minimize(win) {
    win.classList.add('min');
    win.classList.remove('active');
    this.tasks.get(win).classList.remove('on');
  }

  close(win) {
    win.hidden = true;
    win.classList.remove('active', 'max');
    this.tasks.get(win).hidden = true;
  }

  #build(win, index, taskContainer) {
    const { title, icon } = win.dataset;

    const bar = document.createElement('div');
    bar.className = 'titlebar';
    bar.innerHTML = `<span aria-hidden="true">${icon}</span><span class="ttl">${title}</span>
      <button data-act="min" aria-label="Minimize">_</button>
      <button data-act="max" aria-label="Maximize">□</button>
      <button data-act="close" aria-label="Close">✕</button>`;
    win.prepend(bar);

    const task = document.createElement('button');
    task.className = 'task';
    task.hidden = true;
    task.textContent = `${icon} ${title}`;
    task.addEventListener('click', () => {
      const showing = win.classList.contains('active') && !win.classList.contains('min');
      showing ? this.minimize(win) : this.open(win.id);
    });
    taskContainer.append(task);
    this.tasks.set(win, task);

    win.style.left = `${130 + index * 30}px`;
    win.style.top = `${24 + index * 30}px`;
    win.addEventListener('pointerdown', () => this.focus(win));

    bar.addEventListener('click', (e) => {
      const action = e.target.closest('button')?.dataset.act;
      if (action === 'min') this.minimize(win);
      if (action === 'max') win.classList.toggle('max');
      if (action === 'close') this.close(win);
    });
    bar.addEventListener('dblclick', (e) => {
      if (!e.target.closest('button') && !isMobile()) win.classList.toggle('max');
    });
    bar.addEventListener('pointerdown', (e) => this.#drag(win, e));
  }

  #drag(win, e) {
    if (e.target.closest('button') || win.classList.contains('max') || isMobile()) return;
    const rect = win.getBoundingClientRect();
    const dx = e.clientX - rect.left;
    const dy = e.clientY - rect.top;

    const move = (ev) => {
      win.style.left = `${Math.max(0, Math.min(innerWidth - 80, ev.clientX - dx))}px`;
      win.style.top = `${Math.max(0, Math.min(innerHeight - 70, ev.clientY - dy))}px`;
    };
    const stop = () => {
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', stop);
    };
    addEventListener('pointermove', move);
    addEventListener('pointerup', stop);
  }
}

/** Start button, its menu and the "Shut Down" screen. */
function initStartMenu(openWindow) {
  const menu = document.getElementById('start-menu');
  const button = document.getElementById('start');
  const off = document.getElementById('off');

  const setOpen = (open) => {
    menu.hidden = !open;
    button.classList.toggle('on', open);
  };

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(menu.hidden);
  });
  menu.querySelectorAll('[data-win]').forEach((item) =>
    item.addEventListener('click', () => {
      openWindow(item.dataset.win);
      setOpen(false);
    })
  );
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  document.getElementById('shutdown').addEventListener('click', () => {
    setOpen(false);
    off.hidden = false;
  });
  off.addEventListener('click', () => (off.hidden = true));
}


const manager = new WindowManager(
  document.querySelectorAll('.win'),
  document.getElementById('tasks')
);
const open = (id) => manager.open(id);

// Desktop icons: double-click to open, single tap on touch screens
const icons = document.querySelectorAll('.icon');
const touchLike = () => matchMedia('(max-width:700px), (pointer:coarse)').matches;
icons.forEach((icon) => {
  icon.addEventListener('click', () => {
    if (touchLike()) return open(icon.dataset.win);
    icons.forEach((i) => i.classList.remove('sel'));
    icon.classList.add('sel');
  });
  icon.addEventListener('dblclick', () => open(icon.dataset.win));
  icon.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') open(icon.dataset.win);
  });
});

initStartMenu(open);

// Taskbar clock
const clock = document.getElementById('clock');
const tick = () => {
  clock.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};
tick();
setInterval(tick, 15000);

open('about');

})();
