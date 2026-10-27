// Fill each word with your own five-letter answer (A-Z). No original answers remain.
// Change version when replacing puzzles to start fresh browser progress.
const CHALLENGE_SETTINGS = {
  version: 'my-puzzles-1',
  // Positive moves the photo RIGHT; negative moves it LEFT (desktop pixels).
  backgroundOffsetX: 100,
  countdownTarget: '2026-11-01T08:45:00+01:00',
  timedUnlocks: false,
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
    "word": "KLARA"
  },
  {
    "id": 4,
    "type": "geo",
    "streetViewEmbedUrl": "https://www.google.com/maps/embed?pb=!4v1793037992601!6m8!1m7!1sCAoSHENJQUJJaEIzLTJIU05DU0JMQ09hWHN2M0w0cVk.!2m2!1d50.76977714801142!2d14.48408954571432!3f130.88191911735004!4f2.0499464618753223!5f0.7820865974627469"
  },
  {
    "id": 5,
    "type": "geo",
    "streetViewEmbedUrl": "https://www.google.com/maps/embed?pb=!4v1793131922528!6m8!1m7!1sxKzujcTRaft_Jliz6oEoxg!2m2!1d55.69199265286787!2d12.58724127082603!3f221.08219996900573!4f-11.277005743511893!5f0.7820865974627469"
  },
  {
    "id": 6,
    "type": "geo",
    "streetViewEmbedUrl": "https://www.google.com/maps/embed?pb=!4v1793132111138!6m8!1m7!1slEOVJ3bcYqOqnNM9JKWrKQ!2m2!1d49.87634214605348!2d14.8938139287048!3f353.9852991404943!4f-2.3219371341885875!5f0.7820865974627469"
  },
  {
    "id": 7,
    "type": "wordle",
    "word": "DRESS"
  },
  {
    "id": 8,
    "type": "text",
    "message": "You have been doing challenges for long enough, i think you need a treat <3. Look under there!!! Underwear :)",
    "answer": "Bueno"
  },
  {
    "id": 9,
    "type": "wordle",
    "word": "Chess"
  },
  {
    "id": 10,
    "type": "geo",
    "streetViewEmbedUrl": "https://www.google.com/maps/embed?pb=!4v1793132265724!6m8!1m7!1sf_cSwV9ZO72IH1RpivsuPg!2m2!1d45.9322108700424!2d14.68532203613944!3f159.13597086585034!4f-15.002849816870295!5f0.7820865974627469"
  },
  {
    "id": 11,
    "type": "wordle",
    "word": "JUICY"
  },
  {
    "id": 12,
    "type": "text",
    "message": "Another pitstop time :) I think you will require a leap of faith to find this one, but hats off for you if you do <3",
    "answer": "Chess"
  },
  {
    "id": 13,
    "type": "geo",
    "streetViewEmbedUrl": "https://www.google.com/maps/embed?pb=!4v1793134217151!6m8!1m7!1sxidMNnRlQQEfnBNZoBdSdg!2m2!1d45.51303076691035!2d13.58605810281551!3f214.21145198368848!4f-28.18017325274799!5f0.7820865974627469"
  },
  {
    "id": 14,
    "type": "text",
    "message": "Now only thing left to do is to brush your teeth and hop in the cosy fresh bed of ours and ill meet you soon. Miluju te Klárko <3",
    "answer": "Taky te miluju <3"
  }
];

// To replace a word challenge with geography, use:
// { id: 1, type: 'geo', streetViewEmbedUrl: 'PASTE_STREET_VIEW_EMBED_LINK_HERE' }
// Paste the iframe src URL from your chosen Street View embed.

// Coordinates are extracted from the embed link. Every location uses a 300-meter radius.
