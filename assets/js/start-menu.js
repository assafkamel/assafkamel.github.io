/** Start button, its menu and the "Shut Down" screen. */
export function initStartMenu(openWindow) {
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
