const id = Number(new URLSearchParams(location.search).get('mission') || 1);
const config = CHALLENGES.find(c => c.id === id);
const feedback = document.getElementById('feedback'), submit = document.getElementById('submit');
const street = document.getElementById('streetview'), panel = document.getElementById('guessPanel');
const mapStatus = document.getElementById('mapStatus');
document.getElementById('missionNumber').textContent = String(id).padStart(2, '0');
const send = type => parent.postMessage({ type, id }, location.origin === 'null' ? '*' : location.origin);
document.getElementById('exit').onclick = () => { if (parent === window) location.href = 'index.html'; else send('challenge-close'); };
document.getElementById('finish').onclick = () => { if (parent === window) location.href = 'index.html'; else send('challenge-complete'); };
document.addEventListener('keydown', event => { if (event.key === 'Escape') send('challenge-close'); });
let embed;
try { embed = new URL(config?.streetViewEmbedUrl); } catch {}
const configured = config?.type === 'geo' && Number.isFinite(config.latitude) && Math.abs(config.latitude) <= 90 && Number.isFinite(config.longitude) && Math.abs(config.longitude) <= 180 && Number.isFinite(config.radiusMeters) && config.radiusMeters > 0 && embed?.protocol === 'https:' && embed.hostname === 'www.google.com' && embed.pathname.startsWith('/maps/embed');
if (!configured) {
  feedback.textContent = 'This mission needs its Street View embed URL, target coordinates, and radius in challenges.js.';
  panel.hidden = true;
} else {
  street.src = embed.href; street.hidden = false;
  document.getElementById('restart').onclick = () => { street.src = embed.href; };
  feedback.textContent = `Find the starting location. Get within ${config.radiusMeters} meters to complete the mission.`;
  if (location.protocol === 'file:') {
    mapStatus.hidden = false; mapStatus.textContent = 'Open the site using START-SITE.cmd, VS Code Live Server, or GitHub Pages. Map tiles cannot load reliably from a file URL.';
  } else if (typeof L === 'undefined') {
    mapStatus.hidden = false; mapStatus.textContent = 'Map library failed to load. Check your internet connection and reload.';
  } else {
    const map = L.map('map', { worldCopyJump: true }).setView([25, 0], 2);
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, referrerPolicy: 'strict-origin-when-cross-origin', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors' }).addTo(map);
    tiles.on('tileerror', () => { mapStatus.hidden = false; mapStatus.textContent = 'Map tiles could not load. Check your connection, disable referrer-blocking extensions for this site, then reload.'; });
    new ResizeObserver(() => map.invalidateSize({ pan: false })).observe(document.getElementById('map'));
    document.getElementById('expand').onclick = () => {
      const expanded = panel.classList.toggle('expanded');
      document.getElementById('expand').setAttribute('aria-expanded', String(expanded));
      document.getElementById('expand').textContent = expanded ? '⤡ Smaller map' : '⤢ Expand map';
    };
    let guess, marker, won = false;
    map.on('click', event => {
      if (won) return;
      guess = event.latlng.wrap();
      if (marker) marker.setLatLng(guess);
      else marker = L.circleMarker(guess, { radius: 9, color: '#17291b', weight: 3, fillColor: '#b4ee63', fillOpacity: 1 }).addTo(map);
      submit.disabled = false; submit.textContent = 'GUESS →';
      feedback.textContent = 'Pin placed. Move it with another click, or submit your guess.';
    });
    submit.onclick = () => {
      if (!guess || won) return;
      const distance = distanceMeters(guess, { lat: config.latitude, lng: config.longitude });
      if (distance <= config.radiusMeters) {
        won = true; submit.disabled = true;
        document.getElementById('resultDistance').textContent = `${Math.round(distance)} meters from the starting location.`;
        document.getElementById('result').hidden = false;
        feedback.textContent = 'Location found. Continue to save your completed mission.';
      } else feedback.textContent = `About ${distance >= 1000 ? (distance / 1000).toFixed(1) + ' km' : Math.round(distance) + ' m'} away. Move your pin and try again.`;
    };
    document.addEventListener('keydown', event => { if (event.code === 'Space' && !submit.disabled && event.target.tagName !== 'BUTTON') { event.preventDefault(); submit.click(); } });
  }
}
