// ============================================================
//  EDIT THIS FILE to make the gift yours. Everything on the
//  page (names, messages, song) comes from here.
// ============================================================

const config = {
  // Shown above the title: "For <recipient>"
  recipient: 'my sweet Dina',

  // Text on the closed gift screen
  teaser: 'Something small gift is waiting for you',
  hint: 'Tap the gift to open it',

  // Big title inside the card
  title: "This only for you sweet Dina",

  // The message. Each item is typed out one after another.
  messages: [
    "I want to say that you are a very beautiful person and I love having you by my side, your smile and your laughter.",
    'I want you to always be happy and strong, and not to dwell on the past. I want you to be even closer to me.',
    'I used the song you love and created this website just for you because I want to send you a message.',
    'I\'m always by your side and I\'ll never let you be sad, and I\'ll never leave you. Don\'t forget that.',
  ],

  // Signature at the end
  signature: 'With love, someone who cares, love you',

  // Music
  song: {
    // Put your own file in the /public folder and set its name here.
    // If the file is missing, a built-in melody plays instead.
    file: 'song.mp3',
    title: 'Your favorite song',
    artist: 'Made for you',
    // Start the music automatically when the gift is opened
    autoplayOnOpen: true,
  },
};

export default config;
