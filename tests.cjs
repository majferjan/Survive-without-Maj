const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
for (const f of fs.readdirSync('.').filter(f => f.endsWith('.js'))) new vm.Script(fs.readFileSync(f, 'utf8'), {filename:f});
const context = vm.createContext({});
vm.runInContext(fs.readFileSync('puzzle-core.js','utf8') + fs.readFileSync('challenges.js','utf8'), context);
const run = code => vm.runInContext(code, context);
const challengeCount = run('CHALLENGES.length');
assert.ok(challengeCount > 0, 'Add at least one challenge.');
assert.equal(run('CHALLENGES.every(c => Number.isInteger(c.id) && c.id > 0)'), true, 'Mission IDs must be positive integers.');
assert.equal(run('new Set(CHALLENGES.map(c => c.id)).size'), challengeCount, 'Mission IDs must be unique.');
assert.equal(run("CHALLENGES.every(c => c.type === 'geo' || (c.type === 'text' && typeof c.message === 'string' && typeof c.answer === 'string') || (c.type === 'wordle' && (c.word === '' || /^[a-z]{5}$/i.test(c.word))))"),true);
assert.equal(run("textAnswerMatches('  HELLO   there  ', 'Hello there')"),true);
assert.equal(run("textAnswerMatches('', '  ')"),false);
assert.equal(run("textAnswerMatches('hello there!', 'hello there')"),false);
assert.equal(run("textAnswerMatches('wrong', 'correct')"),false);
assert.equal(run('Number.isFinite(Date.parse(CHALLENGE_SETTINGS.countdownTarget))'), true, 'Countdown target must be a valid date.');
assert.equal(run('Number.isFinite(Date.parse(CHALLENGE_SETTINGS.unlockStart)) && Date.parse(CHALLENGE_SETTINGS.unlockEnd) >= Date.parse(CHALLENGE_SETTINGS.unlockStart)'), true, 'Unlock dates must be valid and end at or after the start.');
assert.equal(run("scoreWord('allee', 'apple').join(',')"),'correct,present,absent,absent,correct');
assert.equal(run("scoreWord('apple', 'apple').every(s => s === 'correct')"),true);
assert.equal(run("distanceMeters({lat:0,lng:0},{lat:0,lng:0})"),0);
assert.ok(Math.abs(run("distanceMeters({lat:0,lng:0},{lat:0,lng:1})")-111195)<1);
assert.ok(run("distanceMeters({lat:0,lng:179.999},{lat:0,lng:-179.999})")<250);
for(const f of fs.readdirSync('.').filter(f=> /\.(html|css)$/.test(f))) {
  const source=fs.readFileSync(f,'utf8');
  for(const match of source.matchAll(/(?:src|href)=["']([^"']+)["']|url\(["']?([^\s"')]+)["']?\)/g)) {
    const ref=match[1]||match[2];
    if(/^(https?:|#|data:)/.test(ref)) continue;
    assert.ok(fs.existsSync(ref), `${f}: missing ${ref}`);
  }
}
for(const f of ['cat.jpg','painting.jpeg','mission16.mpeg']) assert.ok(!fs.existsSync('assets/'+f));
console.log('PASS: syntax, valid challenge configurations, countdown timezone, repeated-letter scoring, distance calculations, local references, and removed media.');

// Exercise the actual schedule functions, including exact release boundaries.
vm.runInContext("CHALLENGE_SETTINGS.unlockStart = '2026-10-31T17:30:00+01:00'; CHALLENGE_SETTINGS.unlockEnd = '2026-11-01T00:00:00+01:00'; CHALLENGE_SETTINGS.timedUnlocks = true;", context);
const schedule = fs.readFileSync('script.js', 'utf8').split('function unlockTime')[1].split('function render()')[0];
vm.runInContext('function unlockTime' + schedule, context);
assert.equal(run('unlockTime(0)'), Date.parse('2026-10-31T17:30:00+01:00'));
if (challengeCount > 1) assert.equal(run('unlockTime(' + (challengeCount - 1) + ')'), Date.parse('2026-11-01T00:00:00+01:00'));
for(let i=1;i<challengeCount;i++) assert.ok(Math.abs(run('unlockTime('+i+') - unlockTime('+(i-1)+')') - 390*60*1000/(challengeCount-1)) < 1);
for(let i=0;i<challengeCount;i++){
  vm.runInContext('Date.now = () => unlockTime('+i+') - 1',context);
  assert.equal(run('timeUnlocked('+i+')'),false);
  vm.runInContext('Date.now = () => unlockTime('+i+')',context);
  assert.equal(run('timeUnlocked('+i+')'),true);
}
console.log('PASS: all configured unlock boundaries, evenly spaced releases, first and last releases.');

// Link parsing uses synthetic coordinates, never logs puzzle locations.
context.URL = URL;
assert.equal(run('GEO_RADIUS_METERS'),300);
assert.equal(run("parseStreetViewLink('https://www.google.com/maps/embed?pb=!6m8!1m7!1stest!2m2!1d12.5!2d-45.25!3f0').lng"),-45.25);
assert.equal(run("parseStreetViewLink('https://www.google.com/maps/embed/v1/streetview?location=0,0').lat"),0);
assert.equal(run("parseStreetViewLink('https://maps.app.goo.gl/example')"),null);
assert.equal(run("parseStreetViewLink('https://www.google.com/maps/embed?pb=!6m8!2m2!1d91!2d0')"),null);
assert.equal(run("parseStreetViewLink('https://example.com/maps/embed?pb=!6m8!2m2!1d1!2d2')"),null);
assert.equal(run("CHALLENGES.filter(c=>c.type==='geo').every(c=>parseStreetViewLink(c.streetViewEmbedUrl)!==null)"),true);
console.log('PASS: fixed 300m radius, coordinate extraction, invalid-link rejection, existing geography links.');
