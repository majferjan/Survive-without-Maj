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

// All geography missions use the same tolerance.
const GEO_RADIUS_METERS = 300;
function parseStreetViewLink(value) {
  if (typeof value !== 'string') return null;
  // Also accept Google's complete Copy HTML snippet, not just its src URL.
  const source = value.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1] || value.trim();
  let url;
  try { url = new URL(source.replace(/&amp;/g, '&')); } catch { return null; }
  if (url.protocol !== 'https:' || url.hostname !== 'www.google.com') return null;
  let lat, lng;
  if (url.pathname === '/maps/embed') {
    const payload = url.searchParams.get('pb') || '';
    // A Street View embed carries its starting coordinates in the 2m2 record.
    if (!payload.includes('!6m8!')) return null;
    const number = '(-?\\d+(?:\\.\\d+)?)';
    const coordinates = payload.match(new RegExp('!2m2!1d' + number + '!2d' + number + '(?:!|$)'));
    if (!coordinates) return null;
    lat = Number(coordinates[1]); lng = Number(coordinates[2]);
  } else if (url.pathname === '/maps/embed/v1/streetview') {
    const location = (url.searchParams.get('location') || '').split(',');
    if (location.length !== 2 || location.some(part => !part.trim())) return null;
    lat = Number(location[0]); lng = Number(location[1]);
  } else return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { url: url.href, lat, lng };
}
