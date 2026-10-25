// Delete only this puzzle set's saved progress on the current website origin.
// This script defines a function; loading it never deletes anything automatically.
function resetChallengeProgress(storage = localStorage, version = CHALLENGE_SETTINGS.version) {
  const completionKey = `custom-challenges-${version}`;
  const wordlePrefix = `wordle-${version}-`;
  const keys = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key === completionKey || key?.startsWith(wordlePrefix)) keys.push(key);
  }
  keys.forEach(key => storage.removeItem(key));
  return keys.length;
}
const resetButton = typeof document !== 'undefined' && document.getElementById('resetProgress');
if (resetButton) resetButton.onclick = () => {
  try {
    const count = resetChallengeProgress();
    document.getElementById('resetStatus').textContent = `Progress reset (${count} saved entries removed). Close other game tabs, then reopen the site.`;
  } catch {
    document.getElementById('resetStatus').textContent = 'Browser storage is unavailable. Check your browser privacy settings.';
  }
};
