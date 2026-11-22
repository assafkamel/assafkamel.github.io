import { WindowManager } from './window-manager.js';
import { initStartMenu } from './start-menu.js';

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
