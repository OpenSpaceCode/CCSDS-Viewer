// Keeps the page across a refresh. sessionStorage lasts as long as the browser tab, so closing the app starts it fresh.
// Storage can be unavailable or full (private windows, blocked site data): the page then simply starts from its defaults.
const SESSION_KEY = 'ccsds-viewer.session';

function sessionRead() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
}

function sessionWrite(data) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch (e) { /* not kept across a refresh */ }
}
