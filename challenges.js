// Fill each word with your own five-letter answer (A-Z). No original answers remain.
// Change version when replacing puzzles to start fresh browser progress.
const CHALLENGE_SETTINGS = {
  version: 'my-puzzles-1',
  // Positive moves the photo RIGHT; negative moves it LEFT (desktop pixels).
  backgroundOffsetX: 0,
  countdownTarget: '2026-11-01T08:45:00+01:00',
  timedUnlocks: true,
  unlockStart: '2026-10-24T17:30:00+01:00',
  unlockEnd: '2026-10-25T00:00:00+01:00'
};
const CHALLENGES = [
  {
    "id": 1,
    "type": "wordle",
    "word": "BLISS"
  },
  {
    id: 2,
    type: 'geo',
    streetViewEmbedUrl: 'https://www.google.com/maps/embed?pb=!4v1792929587488!6m8!1m7!1s9g8WOaaxe5RDzj8o2ah6Gg!2m2!1d50.68811568425743!2d14.76173964878918!3f264.9477429116344!4f-29.22096189071086!5f0.7820865974627469',
  },
  {
    "id": 3,
    "type": "wordle",
    "word": "AEROS"
  },
  {
    "id": 4,
    "type": "geo",
    "streetViewEmbedUrl": "https://www.google.com/maps/embed?pb=!4v1793037992601!6m8!1m7!1sCAoSHENJQUJJaEIzLTJIU05DU0JMQ09hWHN2M0w0cVk.!2m2!1d50.76977714801142!2d14.48408954571432!3f130.88191911735004!4f2.0499464618753223!5f0.7820865974627469"
  },
  {
    "id": 5,
    "type": "wordle",
    "word": ""
  },
  {
    "id": 6,
    "type": "wordle",
    "word": ""
  },
  {
    "id": 7,
    "type": "wordle",
    "word": ""
  },
  {
    "id": 8,
    "type": "wordle",
    "word": ""
  },
  {
    "id": 9,
    "type": "wordle",
    "word": ""
  },
  {
    "id": 10,
    "type": "wordle",
    "word": ""
  },
  {
    "id": 11,
    "type": "wordle",
    "word": ""
  },
  {
    "id": 12,
    "type": "wordle",
    "word": ""
  },
  {
    "id": 13,
    "type": "wordle",
    "word": ""
  },
  {
    "id": 14,
    "type": "wordle",
    "word": ""
  },
  {
    "id": 15,
    "type": "wordle",
    "word": ""
  },
  {
    "id": 16,
    "type": "wordle",
    "word": ""
  }
];

// To replace a word challenge with geography, use:
// { id: 1, type: 'geo', streetViewEmbedUrl: 'PASTE_STREET_VIEW_EMBED_LINK_HERE' }
// Paste the iframe src URL from your chosen Street View embed.

// Coordinates are extracted from the embed link. Every location uses a 300-meter radius.
