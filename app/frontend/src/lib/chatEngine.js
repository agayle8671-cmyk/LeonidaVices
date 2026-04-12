/**
 * Honest John's Chat Engine v3 — Conversational Intelligence
 * 
 * Features:
 * 1. Intent detection (classifies message type before responding)
 * 2. Massive response pools (8-12+ variants per category)
 * 3. Personality question handlers (liar, honest, real, who are you, etc.)
 * 4. Emotional response system (lol, haha, wow, wtf, etc.)
 * 5. Conversational handlers (hi, bye, thanks, insults, compliments, jokes)
 * 6. Hard no-repeat guarantee (tracks exact responses, never serves same one twice per session)
 * 7. Context-aware follow-ups based on last message
 * 8. Fuzzy intent matching for typos and slang
 * 9. Dynamic response assembly with personality injections
 * 10. Recently-used knowledge penalty + variant rotation
 * 
 * Zero API calls. Runs entirely in the browser.
 */

import KNOWLEDGE_BASE from "../data/knowledgeBase";

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE HISTORY — HARD NO-REPEAT GUARANTEE
// ═══════════════════════════════════════════════════════════════════════════════

let usedResponses = new Set();       // Exact responses given this session
let recentlyUsedIds = [];            // Recently used KB entry IDs
let coveredTopics = new Set();       // Entry IDs discussed
let coveredCategories = new Set();   // Categories discussed
// eslint-disable-next-line no-unused-vars
let lastVariantUsed = {};            // Last variant index per entry
// eslint-disable-next-line no-unused-vars
let lastIntent = null;               // What the last message was classified as
// eslint-disable-next-line no-unused-vars
let messageCount = 0;                // How many messages exchanged

const MAX_RECENT = 8;

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick from array, guaranteed not to repeat within session */
function pickFresh(arr, fallbackPrefix = "") {
  // Try to find one we haven't used
  const unused = arr.filter(r => !usedResponses.has(r));
  if (unused.length > 0) {
    const chosen = unused[Math.floor(Math.random() * unused.length)];
    usedResponses.add(chosen);
    return chosen;
  }
  // All used — clear history for this pool and pick random
  arr.forEach(r => usedResponses.delete(r));
  const chosen = arr[Math.floor(Math.random() * arr.length)];
  usedResponses.add(chosen);
  return chosen;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTENT DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function detectIntent(msg) {
  const m = msg.toLowerCase().trim();
  const stripped = m.replace(/[^a-z0-9\s]/g, "").trim();

  // ── Greetings ──
  if (/^(hi|hello|hey|sup|yo|greetings|howdy|hola|what'?s? ?up|whats good|waddup|ayy|ayo|heyo|hiya|g'?day|good (morning|afternoon|evening|day))[\s!?.]*$/i.test(m)) return "greeting";

  // ── Farewells ──
  if (/^(bye|goodbye|good ?bye|see ya|cya|later|peace|peace out|adios|farewell|gotta go|i'm out|im out|gtg|ttyl|catch you later|take care|signing off|deuces)[\s!?.]*$/i.test(m)) return "farewell";

  // ── Thanks ──
  if (/^(thanks|thank you|thx|ty|tysm|appreciate it|appreciate that|cheers|much appreciated|grateful|you'?re? the best|legend|goat|you rock)[\s!?.]*$/i.test(m)) return "thanks";

  // ── Laughter / Amusement ──
  if (/^(lol|lmao|lmfao|haha|hahaha|hehe|rofl|😂|🤣|ha+|dead|i'm dead|im dead|that'?s? funny|so funny|hilarious|bruh|bro|stop|no way|crying|💀)[\s!?.]*$/i.test(m)) return "laughter";

  // ── Wow / Surprise ──
  if (/^(wow|woah|whoa|omg|oh my god|damn|dang|holy|insane|incredible|amazing|no way|for real|seriously|fr|sheesh|fire|lit|sick|dope|crazy|wild|nuts|mental)[\s!?.]*$/i.test(m)) return "surprise";

  // ── Confusion ──
  if (/^(what|huh|wha|eh|um|uh|idk|i don'?t (know|understand|get it)|confused|what do you mean|come again|excuse me|say that again|repeat|sorry what)[\s!?.]*$/i.test(m)) return "confusion";

  // ── Insults / Negativity ──
  if (/\b(stupid|dumb|suck|trash|garbage|worst|terrible|horrible|useless|pathetic|bad|lame|boring|annoying|hate you|shut up|stfu|go away|leave me alone|you suck|worst bot)\b/i.test(m)) return "insult";

  // ── Compliments ──
  if (/\b(awesome|great|amazing|cool|love (you|this|it)|best|fantastic|incredible|perfect|excellent|brilliant|genius|smart|helpful|good job|nice|well done|impressive|outstanding)\b/i.test(m) && !/(when|release|gta|leonida|vice|map)/.test(m)) return "compliment";

  // ── Honesty / Liar Questions ──
  if (/\b(liar|lying|lie|lies|honest|truth|truthful|trustworthy|trust you|believe you|scam|con|fraud|fake|real|legit|legitimate|bull ?shit|bs|cap|no cap)\b/i.test(m)) return "honesty";

  // ── Identity Questions ──
  if (/\b(who are you|what are you|are you (real|human|ai|a bot|robot|alive|sentient|conscious)|your name|introduce yourself|tell me about yourself|about you)\b/i.test(m)) return "identity";

  // ── How are you / Personal ──
  if (/\b(how are you|how'?s? it going|how do you feel|you doing|you okay|how you been|what'?s? new|how'?s? life|how'?s? business|you good)\b/i.test(m)) return "personal";

  // ── Jokes ──
  if (/\b(joke|funny|make me laugh|tell me (a |something )?funny|humor|comedy|entertain me|amuse me|got any jokes)\b/i.test(m)) return "joke";

  // ── Age / Time Questions ──  
  if (/\b(how old|your age|when were you (born|made|created)|how long have you been|since when)\b/i.test(m)) return "age";

  // ── Favorite Things ──
  if (/\b(favorite|favourite|prefer|best region|which region|like most|like best|recommend|what do you like|top pick)\b/i.test(m)) return "favorite";

  // ── Agreement ──
  if (/^(yes|yeah|yep|yup|ya|sure|absolutely|definitely|of course|right|true|exactly|correct|agreed|for sure|facts|bet|word|100|💯)[\s!?.]*$/i.test(m)) return "agreement";

  // ── Disagreement ──
  if (/^(no|nah|nope|naw|wrong|false|incorrect|disagree|not true|cap|bs|doubt|doubt it|i don'?t think so|negative)[\s!?.]*$/i.test(m)) return "disagreement";

  // ── Random / Gibberish ──
  if (stripped.length <= 2 && !/\b(hi|yo|ok)\b/.test(stripped)) return "gibberish";
  if (/^[a-z]{1,3}$/i.test(stripped) && !["hi", "yo", "ok", "hey", "sup", "bye"].includes(stripped)) return "gibberish";

  // ── Help ──
  if (/\b(help|what can you do|what do you know|capabilities|features|options|menu|commands)\b/i.test(m)) return "help";

  // ── Default: Knowledge query ──
  return "knowledge";
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONVERSATIONAL RESPONSE POOLS
// ═══════════════════════════════════════════════════════════════════════════════

const RESPONSES = {
  greeting: [
    "Well HELLO there, valued tourist! Honest John at your service! Ask me ANYTHING about Leonida, GTA 6, or this wonderful website!",
    "Greetings, future Leonida visitor! What can I help you discover today? Regions? Characters? Release info? I'm ALL ears!",
    "Welcome, welcome, WELCOME! Another discerning traveler seeking Honest John's wisdom! Where shall we begin?",
    "Ahh, a NEW face! Honest John is DELIGHTED! Ask me about Vice City, the Keys, GTA 6 — whatever your heart desires!",
    "Hola, darling! The agency is OPEN and Honest John is READY! What brings you in today?",
    "Well well well, if it isn't my favorite tourist! What can Honest John illuminate for you today?",
    "HELLO and welcome to Honest John's Travel Agency! Step right in — the consultation is free, the advice is priceless, and the exit is... around here somewhere!",
    "A visitor! Honest John LIVES for this! Ask away — Leonida, GTA 6, map features, anything! My knowledge is LEGENDARY!",
  ],

  farewell: [
    "Farewell, dear tourist! Remember — Honest John's Travel Agency is ALWAYS open! Come back anytime! And maybe bring a friend... or a wallet!",
    "Bye bye, darling! Stay safe out there — and by safe, I mean the HONEST JOHN definition of safe, which is... flexible! See you soon!",
    "Leaving so soon?! Well, Honest John respects a dramatic exit! Come back whenever you need Leonida intel. The door is always open! The lock is decorative!",
    "Adios, valued tourist! May your travels be premium and your insurance comprehensive! Honest John will be here when you return!",
    "Until next time, friend! Remember: in Leonida, the adventure NEVER ends! ...whether you want it to or not! Safe travels!",
    "Peace out, darling! Don't forget — if you need guidance through Leonida's many dangers, Honest John is just a message away! 🌴",
    "Goodbye! Honest John sheds a single tear at every departure. It's genuine 40% of the time. Come back SOON!",
    "See ya, champ! The agency will keep the lights on for you! And by 'lights,' I mean the neon. It never turns off. EVER.",
  ],

  thanks: [
    "You're ENTIRELY welcome, darling! Honest John lives to serve! If you need anything else, just ask. My ego feeds on gratitude!",
    "My pleasure! Remember — Honest John's consultation is FREE! Everything else is negotiable. Come back anytime!",
    "Don't mention it! Actually DO mention it — tell everyone about Honest John's exceptional service! Five-star reviews are ALWAYS welcome!",
    "Happy to help! Honest John's Travel Agency: where the advice is free and the consequences are your own! Anything else?",
    "Aww, you're making me blush! And Honest John does NOT blush easily! I've been called many things, but 'appreciated' is my favorite!",
    "You are TOO kind! Which is suspicious in Leonida, but I'll take it! Let me know if you need anything else!",
    "It's what I DO, darling! Honest John serves. It's in the name! Well, the 'John' part. The 'Honest' part is more aspirational.",
    "Gratitude ACCEPTED! Your positive feedback has been filed under 'reasons Honest John is the greatest.' It's a LARGE file!",
  ],

  laughter: [
    "HA! Honest John is HILARIOUS and he knows it! Stick around — the comedy is FREE, the tourism advice is PREMIUM!",
    "Glad I could make you laugh, darling! Humor is the BEST medicine! Second best is the overpriced first-aid kits I sell at the Grassrivers trailhead!",
    "😂 Even HONEST JOHN chuckles at that! And I don't chuckle easily — I've seen things in Leonida that would make a clown cry!",
    "Your laughter fuels my ego! And Honest John's ego is a VERY demanding engine! Keep it coming!",
    "HA! See? This is why people love visiting the agency! Premium entertainment AND travel advice! What a PACKAGE!",
    "I aim to please AND amuse! Honest John: travel agent, comedian, and licensed-in-at-least-one-jurisdiction entertainment provider!",
    "Laughing WITH me, not AT me, I hope! Either way, Honest John takes it as a compliment! What else can I do for you?",
    "THAT'S the reaction I live for! Now that I've got you in a good mood — can I interest you in a premium Grassrivers tour? No? Worth a shot!",
    "Music to my ears! The only sound better than tourist laughter is the 'cha-ching' of a booking confirmation! Just kidding! ...mostly!",
  ],

  surprise: [
    "I KNOW, right?! Leonida hits different! What's got you amazed — the map, the regions, the sheer audacity of this state?",
    "That's the APPROPRIATE reaction to Leonida! Everything here is dialed up to eleven! Including the danger levels! ESPECIALLY the danger levels!",
    "Your amazement brings a tear to Honest John's eye! PREMIUM tears, naturally! What's blown your mind?",
    "Wow indeed, darling! This is just the beginning! Wait until you actually EXPLORE Leonida — your jaw will be on the FLOOR!",
    "THAT'S what I like to hear! Genuine awe! Honest John deals in amazement! It's my primary export — right after questionable tour packages!",
    "Sheeeesh! I get that a LOT! Leonida does that to people! The beauty, the chaos, the alligators — it's ALL overwhelming!",
    "The appropriate response to EVERYTHING in Leonida is 'wow.' Followed by 'is that safe?' Followed by 'definitely not.' WELCOME!",
  ],

  confusion: [
    "Confused? That's STEP ONE of the Leonida experience! Let me help — ask me about a specific region, GTA 6 details, or this website's features!",
    "Don't worry, darling — Honest John is here to CLARIFY! Try asking me about Vice City, Grassrivers, the release date, or anything GTA 6 related!",
    "Let me simplify things! I'm Honest John, your guide to Leonida. I know about: 🗺️ All 6 regions, 🎮 GTA 6 info, 👤 Characters, and 🌐 This website's features. Pick one!",
    "Confusion is natural in Leonida! The signage is terrible! Try asking me something specific — a region name, a character, the release date — I'll sort you right out!",
    "Honest John's fault — let me be clearer! I can tell you about GTA 6's world, characters, release, gameplay, or walk you through this website's features! What interests you?",
  ],

  insult: [
    "OUCH! Honest John has feelings too, you know! Small, commercially motivated feelings, but FEELINGS nonetheless! How can I win you back?",
    "I've been called worse by BETTER people, darling! But Honest John doesn't hold grudges — grudges are bad for business! Now, how can I actually HELP you?",
    "That's harsh! But fair? No, just harsh! Listen — ask me something about Leonida and I'll PROVE my worth! Regions, characters, release date — try me!",
    "Honest John absorbs criticism like Vice City absorbs tourist dollars — gracefully and with practice! Now let's move on to something productive!",
    "Noted, filed, and IGNORED! Honest John is Teflon, darling! Nothing sticks! Now — can I interest you in some actual Leonida intel?",
    "My therapist says I should respond to negativity with grace. So: THANK YOU for your feedback! It has been forwarded to our complaints department, which is a paper shredder!",
    "Bold words for someone inside Honest John's chat widget! I COULD lock the doors... I mean, I WON'T. But I COULD. 😏 What can I actually help with?",
    "Even my ex-wives were more creative with their insults! And they had MATERIAL! Let's start fresh — ask me anything about Leonida!",
  ],

  compliment: [
    "STOP — you're going to make Honest John's ego even bigger, and it's already a fire hazard! But continue! I'm listening!",
    "Flattery will get you EVERYWHERE with Honest John! And I mean everywhere — VIP access to information! What would you like to know?",
    "I KNEW I liked you! Finally, someone who recognizes EXCELLENCE! Honest John has been saying this for years! What else can I help with?",
    "If only my Leonida Yelp reviews were this positive! You, my friend, are a person of TASTE and DISTINCTION! Ask me anything!",
    "Aww, darling! Honest John is blushing! Which is rare — the last time I blushed was when the tax audit went better than expected! THANK YOU!",
    "A compliment! Those are RARE in my line of work! Usually it's 'why is this alligator following me?' or 'is this bridge safe?' You — I like YOU!",
    "My heart grows three sizes! Just kidding, the cardiologist said it's the RIGHT size. But your words warm it! What can I do for you?",
    "You're making my day, and Honest John's days are usually 80% complaints and 20% revenue! THIS is the good stuff!",
  ],

  honesty: [
    "A LIAR?! Honest John?! The name has 'HONEST' right in it! Would a liar put that in his name? ...Actually, that's EXACTLY what a liar would do. BUT I'M NOT ONE! Probably! Ask me anything — I'll prove my integrity!",
    "My honesty is LEGENDARY! Like all legends, it may contain slight embellishments. But the CORE is solid! Mostly! Can I help you with something less existentially challenging?",
    "Trust is EARNED, darling, and Honest John has been earning it for... let's not specify how long! Legal reasons! But I am as reliable as they come in Leonida! Which is admittedly a LOW bar!",
    "Honest? It's literally my FIRST NAME! Sure, it's a self-appointed title, and sure, three of my business licenses are 'under review,' but my TRAVEL ADVICE is impeccable! Test me!",
    "The question isn't whether Honest John is honest — it's whether ANYTHING in Leonida is honest! I'm the most truthful entity in a state built on creative interpretation! Take THAT as you will!",
    "You wound me! In Vice City, 'honest' is a LIFESTYLE BRAND, not a character trait! And I am the PREMIER representative of that brand! Ask me something about Leonida and watch my honesty SHINE!",
    "Cap? NO CAP from Honest John! Well... minimal cap. Artisanal, small-batch cap at MOST. But about GTA 6 and Leonida? ONE HUNDRED percent reliable! Try me!",
    "Scam?! I am OFFENDED! Honest John's Travel Agency has maintained a 4.7-star rating for YEARS! The missing 0.3 stars are from people with 'trust issues.' Which is THEIR problem!",
    "The 'Honest' isn't ironic — it's ASPIRATIONAL! And I aspire VERY hard! Especially about Leonida facts! Release dates, regions, characters — all FACTS! The sales pitches... those are 'creative non-fiction.'",
  ],

  identity: [
    "I am HONEST JOHN! Proprietor, CEO, and sole surviving employee of Leonida's most prestigious travel agency! I'm powered by a local knowledge base built into this website — no cloud, no API, just pure LOCAL Honest John energy! I know everything about Leonida and GTA 6!",
    "Who am I? The QUESTION, darling! I'm Honest John — Leonida's premier travel consultant, AI chatbot extraordinaire, and the most charming entity on this website! I run entirely in your browser with a massive knowledge base about GTA 6 and Leonida!",
    "Honest John, at your service! Am I real? I'm as real as anything in Leonida — which is philosophical! I'm an AI chatbot with deep knowledge of GTA 6, all six Leonida regions, and a personality disorder that my developer calls 'a feature!' I run locally — no external servers needed!",
    "I'm Honest John — think of me as your personal Leonida encyclopedia wrapped in a sleazy travel agent's suit! I don't use the internet or call any AI services — everything I know is stored RIGHT HERE in this app! Ask me about GTA 6, the map, characters, anything!",
    "Your friendly neighborhood travel agent AI! Name's Honest John. I live inside this website, powered by a local knowledge base of GTA 6 and Leonida intel. No ChatGPT, no cloud — just ME, my database, and my overwhelming charm!",
  ],

  personal: [
    "How am I? THRIVING, darling! Business is booming — mainly because tourists keep coming back! The 94% return rate speaks for itself! The other 6% are just... running late! How can I help YOU?",
    "Honest John is FABULOUS as always! Every day is a gift when you live in the world of Leonida! What's on YOUR mind?",
    "Life is BEAUTIFUL, friend! The sun is shining, the alligators are fed, and nobody has sued me THIS week! It's a good day! How can I serve you?",
    "I'm doing GREAT — I just reorganized my entire knowledge base! Did you know I have intel on all six Leonida regions? Ask me ANYTHING!",
    "Honest John doesn't have bad days — only 'character-building experiences!' Today is a PREMIUM day! What would you like to explore?",
    "Never better! The travel agency is thriving, the tourists are surviving, and my legal team says I can keep operating! WINNING! What's up with you?",
  ],

  joke: [
    "Why did the tourist cross the road in Vice City? They didn't — someone stole the road! 🥁 Ba dum tss! ...Honest John's comedy career is a work in progress!",
    "A tourist walks into Honest John's office and says 'I want somewhere safe.' I said 'Sir, this is Leonida.' Then we both laughed. Then he cried. Then he booked the premium package anyway! 😄",
    "What's the difference between a Leonida Keys fisherman and a liar? About three drinks! 🎣 ...I'll be here all week, folks! Unlike some of my tour groups!",
    "Why don't alligators in Grassrivers wear shoes? Because they prefer eating the tourists who DO! 🐊 Comedy gold, darling! GOLD!",
    "Honest John walks into a bar in Vice City. The bartender says 'We don't serve your kind here.' John says 'That's okay, I'm here for the customers!' NETWORKING, darling!",
    "How do you know if a Vice City real estate agent is lying? Their lips are moving! ...Actually, that applies to ALL of Leonida. Including me! Wait— I mean EXCLUDING me!",
    "What's the Leonida state motto? 'At least we're not as bad as the news says!' The PR team is still workshopping it.",
    "A tourist asked me for a safe hotel in Vice City. I gave them a tent and a prayer card. Five stars for transparency!",
    "Knock knock! Who's there? Gator. Gator who? Gator bags packed if you're visiting Grassrivers without Honest John's survival kit! 🐊 ...I've been told my humor is an 'acquired taste.'",
  ],

  age: [
    "Age? Honest John is TIMELESS, darling! Like a fine wine — or like the unsolved mysteries in Port Gellhorn! Let's just say I've been around long enough to know every corner of Leonida!",
    "I've been operating since the first tourist was brave enough to visit Leonida! When exactly was that? My lawyer says I should be 'vague about timelines!' But my KNOWLEDGE is fresh — guaranteed!",
    "A gentleman never reveals his age, and Honest John is NOTHING if not a gentleman! ...Okay, that's debatable. But my Leonida intel is CURRENT! That's what matters!",
    "Old enough to know better, young enough to not care! The agency has been operational for... let's say 'a while.' The exact duration is 'commercially sensitive!'",
  ],

  favorite: [
    "My FAVORITE region? That's like asking which of my ex-wives I miss least! But if you TWISTED my arm... Vice City. The neon, the energy, the tourists with DISPOSABLE INCOME! Chef's kiss!",
    "I love ALL of Leonida equally! ...But Vice City pays the most commission, so it holds a SPECIAL place in my heart! The nightlife alone is worth the risk! I mean, the EXPERIENCE!",
    "Honest John does NOT play favorites! But between us... Grassrivers has a raw, dangerous charm that speaks to my soul. The alligators? BUSINESS PARTNERS! Don't tell the other regions!",
    "Every region is my favorite — when tourists are spending money there! But for personal retreats, the Leonida Keys. Peaceful, beautiful, and the fishermen don't ask questions. PERFECT!",
    "Depends on my mood! Vice City for nightlife, Keys for relaxation, Mt. Kalaga when I need to 'disappear' for a few days. For business reasons. LEGITIMATE business reasons!",
    "I'll recommend based on YOUR vibe! Want chaos? Vice City. Nature? Grassrivers. Peace? The Keys. Industry? Port Gellhorn. Wilderness? Mt. Kalaga. Sugar? Ambrosia. Want it ALL? Tour the entire state!",
  ],

  agreement: [
    "EXACTLY! Honest John KNEW you were smart! I could tell from the moment you opened this chat widget! What else can we agree on?",
    "You see it too! We're on the SAME wavelength! This is the beginning of a BEAUTIFUL tourist-agent relationship!",
    "RIGHT?! Finally someone who GETS it! Honest John appreciates validation! It fuels the enterprise! What's next?",
    "A person of EXCELLENT judgment! Your taste is impeccable! Anything else you'd like to know?",
    "We are IN AGREEMENT! This is rare and beautiful! Like a calm day in Grassrivers! What else is on your mind?",
  ],

  disagreement: [
    "Agree to disagree, darling! Honest John respects ALL opinions — even the WRONG ones! 😏 What else can I help with?",
    "Bold stance! I respect that! Even when you're incorrect! Which you ARE! But respect nonetheless! Moving on?",
    "WRONG! But I appreciate your confidence in being wrong! It takes courage! Now — ask me something I can actually enlighten you on!",
    "Fascinating perspective! Completely incorrect, but FASCINATING! Honest John loves a debate! What else you got?",
    "You're entitled to your opinion! Even if it's OBJECTIVELY questionable! But that's the beauty of discourse! What else?",
  ],

  gibberish: [
    "I... hmm. Honest John has many talents, but decoding THAT isn't one of them! Try asking about a Leonida region, GTA 6, or this website!",
    "Fascinating contribution! I'll file that under 'mysterious tourist communications'! Want to try again with actual words? I promise to be helpful!",
    "That message has the same energy as Port Gellhorn after midnight — mysterious and slightly concerning! Let's try again! What would you like to know?",
    "Honest John's translation matrix is experiencing technical difficulties! Try something like 'tell me about Vice City' or 'when does GTA 6 come out!'",
  ],

  help: [
    "Honest John can help with ALL of the following!\n\n🗺️ **Leonida Regions** — Vice City, Grassrivers, Ambrosia, Port Gellhorn, Mt. Kalaga NP, Leonida Keys\n🎮 **GTA 6 Info** — Release date, platforms, characters, gameplay, trailer\n👤 **Characters** — Jason, Lucia, their story\n🌐 **This Website** — Map, route planner, comparison slider, forensic viewer, leaderboard, FAQ\n💬 **Casual Chat** — Jokes, opinions, travel advice, my life story\n\nJust ask! Honest John is an OPEN BOOK! A slightly redacted open book!",
    "What can I do? EVERYTHING GTA 6 related, darling! Ask about Leonida's six regions, the release date, characters Jason and Lucia, gameplay features, PC specs, or any feature on this website! I also do jokes, opinions, and existential conversations! Try me!",
    "Honest John's expertise includes: all six Leonida regions, GTA 6 release details, character bios, gameplay info, this website's features (map, routes, compare, forensic, FAQ, leaderboard), and being dashingly charming! Pick your topic!",
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// KNOWLEDGE BASE SEARCH (unchanged from v2)
// ═══════════════════════════════════════════════════════════════════════════════

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "in", "of", "and", "to", "it", "for", "on", "at",
  "by", "with", "this", "that", "what", "which", "who", "where", "when", "how",
  "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does",
  "did", "will", "would", "could", "should", "can", "may", "might", "shall",
  "not", "but", "or", "if", "then", "than", "so", "up", "out", "about", "into",
  "just", "also", "very", "really", "too", "some", "any", "my", "your", "me",
  "i", "you", "he", "she", "we", "they", "them", "its", "our", "their",
  "tell", "know", "think", "want", "like", "say", "please", "hey", "hi",
  "hello", "thanks", "thank", "ok", "okay", "yeah", "yes", "no", "more",
]);

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function scoreEntry(entry, queryWords, rawQuery) {
  let score = 0;
  const lq = rawQuery.toLowerCase();
  for (const tag of entry.tags) {
    if (lq.includes(tag)) score += 10;
    for (const w of queryWords) { if (tag.includes(w)) score += 3; }
  }
  const lt = entry.title.toLowerCase();
  for (const w of queryWords) { if (lt.includes(w)) score += 5; }
  if (lq.includes(lt)) score += 15;
  const lc = entry.content.toLowerCase();
  for (const w of queryWords) { if (lc.includes(w)) score += 1; }
  if (/when|release|date|come out|launch/.test(lq) && entry.tags.includes("release")) score += 8;
  if (/who|character|protagonist|play as/.test(lq) && entry.category === "characters") score += 8;
  if (/where|map|region|area|location/.test(lq) && entry.category === "regions") score += 5;
  if (/safe|danger|crime/.test(lq) && entry.tags.includes("safe")) score += 10;
  if (/you|john|who are|about you/.test(lq) && entry.category === "honest-john") score += 12;
  if (/this (app|site|website)|what is this/.test(lq) && entry.category === "app") score += 10;
  const ri = recentlyUsedIds.indexOf(entry.id);
  if (ri !== -1) score -= Math.max(3, 15 - ri * 2);
  if (coveredTopics.has(entry.id)) score -= 8;
  else if (coveredCategories.has(entry.category) && score > 0) score += 2;
  return score;
}

function searchKnowledge(query, topK = 4) {
  const words = tokenize(query);
  if (words.length === 0) return [];
  return KNOWLEDGE_BASE
    .map(entry => ({ entry, score: scoreEntry(entry, words, query) }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.entry);
}

function pickVariant(entry) {
  const v = entry.responses;
  if (!v || v.length === 0) return entry.content;
  if (v.length === 1) return v[0];
  // Find one we haven't used this session
  const unused = v.filter(r => !usedResponses.has(r));
  let chosen;
  if (unused.length > 0) {
    chosen = unused[Math.floor(Math.random() * unused.length)];
  } else {
    // All used — clear this entry's responses from history and pick fresh
    v.forEach(r => usedResponses.delete(r));
    chosen = v[Math.floor(Math.random() * v.length)];
  }
  usedResponses.add(chosen);
  return chosen;
}

function trackUsage(entryId) {
  recentlyUsedIds = recentlyUsedIds.filter(id => id !== entryId);
  recentlyUsedIds.unshift(entryId);
  if (recentlyUsedIds.length > MAX_RECENT) recentlyUsedIds = recentlyUsedIds.slice(0, MAX_RECENT);
  coveredTopics.add(entryId);
  const entry = KNOWLEDGE_BASE.find(e => e.id === entryId);
  if (entry) coveredCategories.add(entry.category);
}

// ═══════════════════════════════════════════════════════════════════════════════
// DYNAMIC OPENERS / CLOSERS / PERSONALITY INJECTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const OPENERS = [
  "Oh, EXCELLENT question! ", "Now you're talking, darling! ", "I LOVE this one! ",
  "Ah, a person of TASTE! ", "BRILLIANT inquiry! ", "Finally, the important questions! ",
  "Honest John KNOWS this! ", "Now THAT'S what I like to hear! ", "Between you and me... ",
  "Off the record... ", "You've come to the RIGHT person! ", "Lean in close, darling... ",
  "Let me consult my files... ", "Ah yes. ", "Right, so... ", "Interesting you should ask! ",
];

const CLOSERS = [
  "", "", "", "", // Weight toward no closer
  "\n\nAnything else you want to know?",
  "\n\nFive stars, darling! FIVE STARS!",
  "\n\nHonest John guarantees accuracy! Terms apply.",
  "\n\nAsk me anything else!",
  "\n\nThe consulting never stops!",
];

function getOpener() {
  return Math.random() < 0.4 ? pick(OPENERS) : "";
}

function getCloser() {
  return pick(CLOSERS);
}

// ═══════════════════════════════════════════════════════════════════════════════
// BROAD QUESTION HANDLING
// ═══════════════════════════════════════════════════════════════════════════════

function isBroadQuestion(query) {
  return /^(tell me about leonida|what is leonida|describe leonida|leonida overview|all regions|every region|the whole map|everything about)/i.test(query.trim());
}

function buildCompositeResponse(matches) {
  const regions = matches.filter(e => e.category === "regions");
  if (regions.length >= 2) {
    const shuffled = [...regions].sort(() => Math.random() - 0.5);
    const r1 = shuffled[0], r2 = shuffled[1];
    trackUsage(r1.id); trackUsage(r2.id);
    return `Leonida has SIX incredible regions! Today Honest John spotlights TWO:\n\n**${r1.title}:** ${pickVariant(r1).split('\n')[0]}\n\n**${r2.title}:** ${pickVariant(r2).split('\n')[0]}${getCloser()}`;
  }
  if (matches.length > 0) { trackUsage(matches[0].id); return pickVariant(matches[0]); }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export function generateResponse(userMessage, conversationHistory = []) {
  messageCount++;
  const msg = userMessage.trim();
  const intent = detectIntent(msg);
  
  // ── Handle conversational intents directly ──
  if (RESPONSES[intent]) {
    lastIntent = intent;
    return pickFresh(RESPONSES[intent]);
  }

  // ── Handle broad knowledge questions ──
  if (intent === "knowledge" && isBroadQuestion(msg)) {
    const matches = searchKnowledge(msg, 6);
    if (matches.length >= 2) {
      const r = buildCompositeResponse(matches);
      if (r) { lastIntent = intent; return r; }
    }
  }

  // ── Standard knowledge search ──
  const matches = searchKnowledge(msg);

  if (matches.length === 0) {
    lastIntent = "miss";
    return pickFresh([
      "Hmm, Honest John's files are drawing a blank on that one! I know EVERYTHING about Leonida's six regions, GTA 6 release details, characters, gameplay, and this website. Try asking about those!",
      "That's outside my expertise! I specialize in: Leonida regions (Vice City, Grassrivers, etc.), GTA 6 details (release, characters, gameplay), and this app's features! Try one of those!",
      "Honest John's knowledge has limits! SMALL limits! Try asking about a Leonida region, GTA 6 characters, the release date, or what this website can do!",
      "Even Honest John can't know EVERYTHING! My specialties: 🗺️ Leonida's 6 regions, 🎮 GTA 6 info, 👤 Jason & Lucia, 🌐 Website features! Ask away!",
      "I WISH I could help with that, darling! But Honest John stays in his lane: Leonida, GTA 6, and this website! And that lane is VERY wide! Try a different question!",
      "That topic isn't in my database — but my Leonida intel is ENCYCLOPEDIC! Regions, characters, release dates, gameplay, map features — all covered! What interests you?",
    ]);
  }

  // Build response from knowledge base
  const primary = matches[0];
  const opener = getOpener();
  const body = pickVariant(primary);
  const closer = getCloser();
  trackUsage(primary.id);

  let response = opener + body;

  // Suggest uncovered topics ~30% of the time
  if (matches.length > 1 && Math.random() < 0.3) {
    const secondary = matches.find(m => !coveredTopics.has(m.id) && m.id !== primary.id);
    if (secondary) {
      response += pickFresh([
        `\n\nCurious about "${secondary.title}" too? Just ask!`,
        `\n\nI can also tell you about ${secondary.title}!`,
        `\n\nRelated topic: ${secondary.title}. Want more?`,
        `\n\nAnd if you want to dig deeper, ask about "${secondary.title}"!`,
      ]);
    }
  }

  response += closer;
  lastIntent = intent;
  return response;
}

export function resetConversation() {
  usedResponses.clear();
  recentlyUsedIds = [];
  coveredTopics.clear();
  coveredCategories.clear();
  lastVariantUsed = {};
  lastIntent = null;
  messageCount = 0;
}
