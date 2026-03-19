const oldKey = 'caldav-tasks-settings';
const newKey = 'chiri-settings';

if (!localStorage.getItem(newKey) && localStorage.getItem(oldKey)) {
  localStorage.setItem(newKey, localStorage.getItem(oldKey)!);
  localStorage.removeItem(oldKey);
}
