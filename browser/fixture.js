import { applyTheme, readChoice, saveChoice, watchChoice } from '/theme.js';
import { SYSTEM_THEME, THEME_CATALOG, applyThemeVariables, findTheme } from '/themes.js';

const select = document.querySelector('#theme');
const grid = document.querySelector('.ky-appearance-grid');
for (const theme of [SYSTEM_THEME, ...THEME_CATALOG]) {
  if (![...select.options].some(option => option.value === theme.id)) select.add(new Option(theme.name, theme.id));
  const card = document.createElement('label');
  card.className = 'ky-appearance-option';
  const radio = document.createElement('input');
  Object.assign(radio, { type: 'radio', name: 'appearance', value: theme.id, className: 'ky-appearance-radio' });
  const preview = document.createElement('span');
  preview.className = 'ky-appearance-preview';
  preview.dataset.kyPreview = theme.id;
  preview.setAttribute('aria-hidden', 'true');
  const name = document.createElement('span');
  name.className = 'ky-appearance-name';
  name.textContent = theme.name;
  const mode = document.createElement('small');
  mode.className = 'ky-appearance-mode';
  mode.textContent = theme.scheme === 'system' ? 'Light or dark' : theme.scheme === 'light' ? 'Light' : 'Dark';
  card.append(radio, preview, name, mode);
  grid.append(card);
}
function render() {
  const choice = readChoice('fixture-theme') || 'system';
  select.value = choice;
  for (const radio of document.querySelectorAll('.ky-appearance-radio')) radio.checked = radio.value === choice;
  applyThemeVariables('system');
  if (choice === 'legacy') {
    delete document.documentElement.dataset.kyTheme;
    document.documentElement.dataset.theme = 'legacy';
  } else if (choice !== 'system' && !choice.startsWith('busnes-') && findTheme(choice)) {
    delete document.documentElement.dataset.kyTheme;
    document.documentElement.dataset.theme = choice;
    applyThemeVariables(choice);
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
