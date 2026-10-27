// A reset invalidates every already-open game, including pages restored with Back.
const progressResetKey = `challenge-reset-${CHALLENGE_SETTINGS.version}`;
function readProgressResetToken() {
  try { return localStorage.getItem(progressResetKey); } catch { return null; }
}
const progressSessionToken = readProgressResetToken();
function progressSessionCurrent() {
  return readProgressResetToken() === progressSessionToken;
}
function refreshAfterProgressReset() {
  if (!progressSessionCurrent()) location.reload();
}
window.addEventListener('storage', event => {
  if (event.key === progressResetKey || event.key === null) refreshAfterProgressReset();
});
window.addEventListener('pageshow', refreshAfterProgressReset);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refreshAfterProgressReset();
});
