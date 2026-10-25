# Your custom challenge site

Open this folder in VS Code. Double-click START-SITE.cmd or use Live Server to preview over HTTP; do not open index.html as a file URL. No build or installation is required for deployment.

## Create your 16 word challenges

Open challenges.js. Each mission has an empty `word` field: fill it with your own five-letter answer using A–Z. All 16 missions are Wordle-style by default. Unconfigured missions display a setup message; no original answers or clues have been retained as puzzle content.

The game accepts dictionary guesses plus your custom answer, handles repeated letters, saves guesses, and completes the mission automatically when solved. Six unsuccessful guesses allow a retry without revealing the answer.

Change `version` in challenges.js after replacing your puzzle set to start fresh progress. Existing progress from the downloaded site is not reused.

## Countdown and unlocking

The countdown is set to **1 November 2026 at 08:45 in Ljubljana**, explicitly `2026-11-01T08:45:00+01:00`.

The 16 missions unlock every 26 minutes from 31 October 2026 at 17:30 through 1 November at 00:00 (Ljubljana time). The first unlocks at 17:30; the last unlocks at midnight. `unlockStart` and `unlockEnd` set this interval; `timedUnlocks: false` removes time restrictions. Missions still require completion of the preceding mission. To preview an individual word game while creating it, open `majdle.html?mission=1` on your local server, replacing 1 with its mission number.

## Optional location challenge

Replace any one mission object in challenges.js with this structure (keep its id):

```js
{
  id: 1,
  type: 'geo',
  streetViewEmbedUrl: '',
  latitude: null,
  longitude: null,
  radiusMeters: 250
}
```

Supply the coordinates of your chosen starting location and a matching Street View embed URL. In Google Maps, choose a Street View panorama, open its sharing/embedding option, and copy the URL from the embed HTML's `src` attribute into `streetViewEmbedUrl`. Use an `https://www.google.com/maps/embed...` URL, not a shortened sharing link or the whole iframe markup. Alternatively, use the documented Maps Embed API streetview URL with your own configured API key.

The player explores Street View and clicks an OpenStreetMap map to place a pin. Check location measures the distance to the starting point. A guess within `radiusMeters` completes the mission; other guesses show distance and allow retrying. The target is not marked on the guessing map. The game opens in a large modal with a Street View canvas and expandable guessing map. Its header visually covers the embedded location/address card; Google attribution remains visible. Other labels within Street View imagery/navigation are controlled by Google. This is a casual game, not an exact FreeGuessr replica.

Preview a configured location directly at `geo.html?mission=1`. Internet access is required for Street View, Leaflet, map tiles, and the original web fonts. If the map library fails to load, the page displays a connection message. A valid, accessible Street View embed must be supplied before the panorama can be tested.

References: [Leaflet quick start](https://leafletjs.com/examples/quick-start/), [Google Maps sharing and embedding](https://support.google.com/maps/answer/7101463), [Maps Embed API](https://developers.google.com/maps/documentation/embed/embedding-map).

## Files and uploading

- index.html: main page text and structure.
- style.css: main page layout and colors.
- challenges.js: your new words, schedule, and optional location configuration.
- majdle.html, wordle.js, wordle.css, words.js: word-game page, behavior, appearance, and accepted-guess dictionary.
- geo.html, geo.js: location-game variant.
- puzzle-core.js: letter scoring and distance calculation.
- assets/: background and decorative pattern only.

Upload all these HTML, CSS, and JavaScript files plus assets/ to your static host, keeping index.html at the root. The ZIP is a deployment snapshot; after editing, upload the edited folder or create a fresh ZIP. The ZIP intentionally excludes documentation and tests.

This is a browser-only project: your new answers and target coordinates live in its source files. The normal game UI does not reveal the word on failure. This folder and its ZIP no longer contain the original puzzle clues, designated answers, or puzzle media; the general accepted-guess dictionary and visual background are retained.

## Verification

Run `node tests.cjs` for scoring, geographic distance, countdown, configuration, and JavaScript syntax checks. Verified in-browser: Street View loading, hidden address card, map tile loading over localhost, pin placement, distance feedback, and map expansion.

## GitHub Pages

Repository: https://github.com/majferjan/Survive-without-Maj

The .github/workflows/pages.yml workflow publishes the static site when main is updated. In repository Settings → Pages, choose GitHub Actions as the source. The expected site address is https://majferjan.github.io/Survive-without-Maj/ once deployment succeeds. Relative asset URLs support this repository subpath.

The workflow publishes only HTML, CSS, JavaScript, and assets; local server scripts, tests, ZIPs, and screenshots are excluded. Source files and the background photo are part of this repository.

OpenStreetMap needs a valid web referrer. GitHub Pages and the included localhost server supply one; file URLs do not. Do not suppress referrers with browser extensions. The code does not proxy or bypass tile-service restrictions.

The game layout follows the controls described in the [FreeGuessr guide](https://freeguessr.com/geo-guide/en/guide/controls.html). [OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/) and [GitHub Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
