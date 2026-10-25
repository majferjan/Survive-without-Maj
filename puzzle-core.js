function scoreWord(guess, answer) {
  const result = Array(answer.length).fill('absent'), remaining = answer.split('');
  [...guess].forEach((letter, i) => { if (letter === answer[i]) { result[i] = 'correct'; remaining[i] = null; } });
  [...guess].forEach((letter, i) => {
    if (result[i] === 'correct') return;
    const at = remaining.indexOf(letter);
    if (at >= 0) { result[i] = 'present'; remaining[at] = null; }
  });
  return result;
}
function distanceMeters(a, b) {
  const rad = degrees => degrees * Math.PI / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}
