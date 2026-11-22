// Repeatable entries: add and remove rows in list sections
const list = document.querySelector('[data-list]');
const template = document.getElementById('row-template');

document.querySelector('[data-add]')?.addEventListener('click', () => {
  list.insertAdjacentHTML('beforeend', template.innerHTML.replaceAll('__i__', Date.now()));
  list.lastElementChild.querySelector('input, textarea')?.focus();
});

document.addEventListener('click', (e) => {
  const remove = e.target.closest('[data-remove]');
  if (remove) remove.closest('.row').remove();
});

// Ask before destructive actions
document.addEventListener('submit', (e) => {
  const message = e.target.dataset.confirm;
  if (message && !confirm(message)) e.preventDefault();
});
