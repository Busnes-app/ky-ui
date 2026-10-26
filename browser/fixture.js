import { applyTheme, readChoice, saveChoice, watchChoice } from '/theme.js';

const select = document.querySelector('#theme');
function render() {
  const choice = readChoice('fixture-theme') || 'system';
  select.value = choice;
  for (const radio of document.querySelectorAll('.ky-appearance-radio')) radio.checked = radio.value === choice;
  if (choice === 'legacy') {
    delete document.documentElement.dataset.kyTheme;
    document.documentElement.dataset.theme = 'legacy';
  } else {
    delete document.documentElement.dataset.theme;
    applyTheme(choice, { persist: false });
  }
}
select.addEventListener('change', () => { saveChoice('fixture-theme', select.value); render(); });
for (const radio of document.querySelectorAll('.ky-appearance-radio')) {
  radio.addEventListener('change', () => { saveChoice('fixture-theme', radio.value); render(); });
}
watchChoice('fixture-theme', render, () => !['system', null].includes(readChoice('fixture-theme')));
render();
for (const button of document.querySelectorAll('nav button:not(:disabled)')) {
  button.addEventListener('click', () => {
    document.querySelector('[aria-current]')?.removeAttribute('aria-current');
    button.setAttribute('aria-current', 'page');
  });
}
document.querySelector('#open').addEventListener('click', () => document.querySelector('dialog').showModal());
