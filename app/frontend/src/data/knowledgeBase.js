/**
 * Leonida Knowledge Base — Honest John's Encyclopedia v2
 * 
 * Each entry now has an array of response variants for natural variety.
 * No API calls, no LLM — everything runs in the browser.
 */

const KNOWLEDGE_BASE = [
  // ═══════════════════════════════════════════════════════════════════════════
  // GTA 6 — GENERAL INFO
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "gta6-release",
    category: "general",
    tags: ["gta 6", "gta vi", "release", "date", "launch", "when", "come out", "release date", "november", "2026"],
    title: "GTA 6 Release Date",
    content: "Grand Theft Auto VI officially releases on November 19, 2026, exclusively on PlayStation 5 and Xbox Series X|S.",
    responses: [
      "November 19, 2026 — mark it on your calendar, your divorce papers, and your resignation letter! Honest John's Travel Agency will be offering PREMIUM launch-day packages. Pre-booking is mandatory. Refunds are... conceptual.",
      "The BIG day is November 19, 2026! PS5 and Xbox Series X|S only at launch. Honest John has been counting down since the trailer dropped. That's over 200 MILLION heartbeats of pure anticipation! I counted. Twice.",
      "November 19th, 2026, darling! The day the world stops turning — because everyone will be playing GTA 6 instead of going to work! Honest John is already planning the launch party. Attendance is mandatory. Sobriety is optional.",
      "Mark your calendars: November 19, 2026. PS5 and Xbox Series X|S. The most anticipated game in HUMAN HISTORY! Honest John has already pre-ordered seventeen copies. For 'business purposes.' Don't ask which business."
    ]
  },
  {
    id: "gta6-platforms",
    category: "general",
    tags: ["platform", "pc", "ps5", "xbox", "console", "computer", "playstation", "series x"],
    title: "GTA 6 Platforms",
    content: "GTA 6 launches on PS5 and Xbox Series X|S on November 19, 2026. PC version expected 2027.",
    responses: [
      "PS5 and Xbox Series X at launch, darling. PC? Rockstar likes to make PC gamers WAIT — it builds character! Think of it as a premium anticipation surcharge. 2027 is the rumor. Honest John recommends buying a console AND a PC. Double the investment, double the joy!",
      "Console first — PS5 and Xbox Series X|S on November 19, 2026. PC gamers? You'll be waiting until 2027, approximately 12-18 months later. Rockstar's TRADITIONAL torture method! Buy a console now and a PC copy later. Honest John calls this the 'double dip strategy.'",
      "PlayStation 5 and Xbox Series X get it first! The PC version will follow in 2027 — Rockstar always makes PC players wait. It's not CRUEL, it's CHARACTER BUILDING! Honest John's recommendation? Whatever platform takes your money fastest!",
    ]
  },
  {
    id: "gta6-developer",
    category: "general",
    tags: ["rockstar", "developer", "studio", "take two", "take-two", "who made", "company"],
    title: "Rockstar Games — Developer",
    content: "GTA 6 is developed by Rockstar Games, published by Take-Two Interactive. Over 2,000 developers worldwide.",
    responses: [
      "Rockstar Games — the ONLY company that can disappear for a decade and have the entire world waiting like loyal puppies. Over 2,000 developers slaving away in MULTIPLE countries. That's more staff than some of Leonida's police departments! Not that Leonida HAS functional police...",
      "Rockstar Games, headquartered in New York! Led by Rockstar North in Edinburgh, Scotland. Published by Take-Two Interactive. Over TWO THOUSAND developers working on this beast! That's more people than the population of some Leonida towns I could name. And probably better organized too!",
      "The legendary Rockstar Games, darling! The masterminds behind GTA, Red Dead, Bully — every game a cultural EVENT! Over 2,000 devs across the globe working on GTA 6. Honest John respects anyone who can keep a secret that long. Professional solidarity!",
    ]
  },
  {
    id: "gta6-trailer",
    category: "general",
    tags: ["trailer", "announcement", "video", "youtube", "reveal", "first look", "teaser"],
    title: "GTA 6 Trailer & Reveal",
    content: "The first GTA 6 trailer dropped December 5, 2023, breaking YouTube records with 200+ million views.",
    responses: [
      "The trailer dropped and the INTERNET collectively lost its mind! 200 million views faster than you can say 'take my money.' Honest John watched it 47 times. For research purposes, naturally. The visuals alone caused three of my monitors to weep with joy.",
      "December 5, 2023 — the day the internet BROKE! Rockstar dropped the trailer and 200 million people watched it in 48 hours. MORE than the Super Bowl! Honest John's reaction? I called my accountant and said 'prepare for a BOOM in Leonida tourism!'",
      "That trailer, darling! 200 MILLION views! The most watched video game trailer in HISTORY! First glimpse of Leonida, Jason, Lucia — and Honest John shed a single tear of pure commercial opportunity. BEAUTIFUL!",
    ]
  },
  {
    id: "gta6-price",
    category: "general",
    tags: ["price", "cost", "how much", "buy", "purchase", "edition", "special", "expensive", "money"],
    title: "GTA 6 Pricing",
    content: "Expected retail price: $69.99 USD standard edition. Special and collector's editions anticipated.",
    responses: [
      "$69.99 for the standard edition — a BARGAIN considering you'll be playing it for the next decade! Special editions will cost more, obviously. Honest John recommends the most expensive option available. Why? Because you DESERVE premium suffering, darling!",
      "Standard edition: $69.99 USD. But WHY settle for standard when Rockstar will inevitably offer collector's editions with exclusive content? Honest John's financial advice: skip rent this month. Leonida is where you LIVE now.",
      "Sixty-nine ninety-nine, darling! That's less than a night out in Vice City — and it lasts FOREVER! Collector's editions will run higher, naturally. Honest John says: invest in the most premium version. You only launch GTA 6 once! Well, technically twice if you count PC.",
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHARACTERS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "char-lucia",
    category: "characters",
    tags: ["lucia", "protagonist", "main character", "female", "woman", "heroine", "lucia caminos", "playable"],
    title: "Lucia Caminos — Protagonist",
    content: "Lucia Caminos is GTA 6's first female lead since 1997. A Latina woman navigating Leonida's criminal underworld with partner Jason.",
    responses: [
      "Lucia Caminos — Leonida's most AMBITIOUS tourist! She's got that look in her eye that says 'I will steal your car AND your heart.' First proper female lead in GTA history. About TIME, if you ask Honest John. She's already more competent than 90% of my former business partners.",
      "Ah, Lucia! The woman, the LEGEND! First female protagonist since the original GTA in 1997! A Latina powerhouse navigating Leonida's underworld. Honest John is simultaneously terrified and impressed. She reminds me of my third wife. Which is a COMPLIMENT, by the way!",
      "Lucia Caminos — the HEART of GTA 6! Smart, dangerous, and absolutely nobody's damsel in distress! She and Jason make one HELL of a criminal team. Honest John has already drafted a sponsorship proposal. She hasn't responded. Yet. The restraining order is, I feel, temporary.",
    ]
  },
  {
    id: "char-jason",
    category: "characters",
    tags: ["jason", "protagonist", "main character", "male", "jason rios", "playable", "partner"],
    title: "Jason Rios — Protagonist",
    content: "Jason Rios is the second playable protagonist, a local Leonida native in a criminal partnership with Lucia.",
    responses: [
      "Jason Rios — a fine young man with EXCELLENT taste in career choices! He and Lucia make a lovely couple. The kind that robs you blind and leaves you grateful for the experience. Honest John respects entrepreneurial spirit in ALL its forms.",
      "Jason! Local boy, deep roots in Leonida's... let's call it 'alternative economy.' His partnership with Lucia is both romantic AND professional! A power couple for the ages! Honest John sees a LOT of himself in Jason's hustle. Minus the violence. Mostly.",
      "Jason Rios — born and raised in Leonida. He KNOWS these streets, these swamps, these back alleys. The perfect partner for Lucia's ambitions! Together they're unstoppable. Separately they're still dangerous. Honest John approves either way!",
    ]
  },
  {
    id: "char-bonnie-clyde",
    category: "characters",
    tags: ["bonnie", "clyde", "couple", "duo", "relationship", "romance", "love", "partners", "criminal couple"],
    title: "Criminal Duo Dynamic",
    content: "GTA 6 features a Bonnie and Clyde-inspired criminal couple. Players switch between Jason and Lucia throughout the story.",
    responses: [
      "A LOVE STORY set in the criminal underworld! How romantic! Shakespeare would be jealous — Romeo and Juliet had nothing on Jason and Lucia. Except, you know, fewer explosions. These two lovebirds will rob, scheme, and shoot their way through Leonida TOGETHER. Relationship goals!",
      "The Bonnie and Clyde dynamic! FINALLY, a GTA love story! Players can switch between Jason and Lucia, each bringing unique perspectives to missions. It's romantic, it's dangerous, it's EVERYTHING Honest John looks for in a tourism brochure!",
      "Criminal couple goals, darling! Jason and Lucia's relationship evolves throughout the story — love, betrayal, heists, getaway drives at sunset. Honest John's relationship advice column would THRIVE in Vice City. But I digress — the dual protagonist system means double the chaos!",
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEONIDA STATE — OVERVIEW
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "leonida-overview",
    category: "world",
    tags: ["leonida", "state", "map", "florida", "world", "setting", "location", "where", "based on"],
    title: "Leonida — The State",
    content: "Leonida is GTA 6's fictional version of Florida. Six regions: Vice City, Grassrivers, Ambrosia, Port Gellhorn, Mt. Kalaga NP, Leonida Keys.",
    responses: [
      "Welcome to LEONIDA, darling! The Sunshine State's evil twin! Imagine Florida, but with MORE alligators, MORE corruption, and SIGNIFICANTLY more opportunities for 'creative wealth redistribution.' Honest John's Travel Agency is the state's PREMIER tourism provider!",
      "Leonida! GTA 6's MAGNIFICENT fictional Florida! Six incredible regions to explore — Vice City, Grassrivers, Ambrosia, Port Gellhorn, Mt. Kalaga National Park, and the Leonida Keys! Each one more dangerously beautiful than the last! Honest John has survival tips for ALL of them!",
      "The great state of Leonida — where the sun always shines, the gators always bite, and Honest John always profits! Based on real Florida, but turned up to ELEVEN! Six distinct regions, each with its own unique blend of beauty and peril. PREMIUM peril!",
      "Leonida, darling! Think Florida but with the satire dial cranked to maximum! Neon cities, untamed swamps, tropical islands, industrial ports — it's ALL here! Estimated 2.1x bigger than GTA V's map! That's a LOT of territory for Honest John's tours!",
    ]
  },
  {
    id: "leonida-map-size",
    category: "world",
    tags: ["map size", "how big", "scale", "square miles", "large", "biggest", "comparison", "gta v", "gta 5", "los santos"],
    title: "Map Scale & Size",
    content: "Leonida's map is approximately 2.1x the size of GTA V's Los Santos and Blaine County combined.",
    responses: [
      "The map is ENORMOUS! 2.1 times bigger than GTA V! That's 2.1 times more locations to get lost, robbed, eaten by wildlife, or all three simultaneously! Honest John offers guided tours for a very reasonable fee. Survival is STRONGLY implied but never explicitly guaranteed.",
      "MASSIVE, darling! 2.1 times the size of GTA V's entire map! From Vice City's skyscrapers to the Everglades — I mean GRASSRIVERS — to the Keys! Incredibly detailed interiors too! Honest John's fuel costs alone will be astronomical. But that's YOUR problem, not mine!",
      "Leonida dwarfs Los Santos! 2.1 times bigger with MORE variety — urban sprawl, wetlands, mountains, islands, farmland, and industrial zones! One of the LARGEST open worlds in gaming history! Honest John's tour bus might need a bigger tank. And a prayer.",
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // REGIONS — DETAILED
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "region-vice-city",
    category: "regions",
    tags: ["vice city", "miami", "urban", "city", "downtown", "neon", "nightlife", "beach", "ocean drive"],
    title: "Vice City",
    content: "Vice City is Leonida's neon-soaked metropolis based on Miami. Features Ocean Drive, MacArthur Causeway, nightclub districts, and luxury waterfront.",
    responses: [
      "Vice City — WHERE DREAMS COME TO DIE IN STYLE! The neon lights are beautiful, the cocktails are overpriced, and your wallet will be three pounds lighter by morning! Ocean Drive has the finest art deco hotels money can buy — and the finest pickpockets money can't catch! Five stars!",
      "Ah, Vice City! Leonida's crown jewel of excess! Think Miami turned up to MAXIMUM! Art deco hotels, neon-lit nightclubs, overpriced cocktails on Ocean Drive, and enough criminal activity to keep things INTERESTING! Honest John's main office is here. The security system is robust. VERY robust.",
      "VICE CITY! The heartbeat of Leonida! Based on Miami, but with MORE neon, MORE drama, and MORE questionable business ventures! It's the largest urban environment Rockstar has EVER built! Every street corner has a story. Most of those stories involve the police.",
      "Vice City, darling — where every sunset is an Instagram moment and every alley is an adventure! Ocean Drive's art deco elegance meets Nightclub Row's organized chaos! Honest John has conducted business here for years. The word 'legitimate' is applied LOOSELY!",
    ]
  },
  {
    id: "region-vice-city-ocean-drive",
    category: "regions",
    tags: ["ocean drive", "art deco", "hotels", "beach", "south beach", "strip", "boulevard"],
    title: "Ocean Drive — Vice City",
    content: "Ocean Drive is Vice City's most iconic boulevard — neon art deco hotels, beachfront, buzzing nightlife.",
    responses: [
      "Ocean Drive — the CROWN JEWEL of Vice City! Every building is an art deco masterpiece. Every tourist is a walking ATM. The sunsets are free, which is literally the only free thing in Vice City. Honest John's satellite office is here. Look for the neon sign that reads 'Mostly Legal Tours.'",
      "Ocean Drive! Where the art deco hotels GLOW with neon and the cocktails cost more than some people's rent! Rockstar's attention to architectural detail here is INSANE! Every building, every palm tree, rendered with love. And possibly a restraining order from the real Miami.",
      "The legendary Ocean Drive! South Beach at its finest! Honest John has walked this boulevard a thousand times, and it never gets old. The architecture, the energy, the sheer volume of tourists making poor financial decisions. BEAUTIFUL!",
    ]
  },
  {
    id: "region-vice-city-nightlife",
    category: "regions",
    tags: ["nightclub", "club", "nightlife", "party", "bar", "drink", "dancing", "music", "dj"],
    title: "Vice City Nightlife",
    content: "Vice City features the most detailed nightlife system in any GTA. Dynamic clubs, bars, music venues, and potential business ownership.",
    responses: [
      "The nightlife in Vice City is LEGENDARY! Clubs open at 10, close at 'whenever the police arrive.' Dress code: expensive. Cover charge: more expensive. Honest John VIP passes are available for a small fortune — I mean, a small FEE.",
      "Vice City after dark is a WHOLE different beast! Multiple clubs with dynamic music, bars with NPC interactions, entertainment venues — you can even OWN a nightclub! Honest John's entrepreneurial heart is SINGING! The money laundering potential alone— I mean, the BUSINESS potential!",
      "Nightlife, darling! Vice City COMES ALIVE after sunset! Dynamic club scenes, DJs, dancing NPCs, and the potential to buy and manage your own clubs. Rockstar's most immersive party system yet! Honest John's VIP section has its own bouncer. His name is Consequences.",
    ]
  },
  {
    id: "region-grassrivers",
    category: "regions",
    tags: ["grassrivers", "everglades", "swamp", "wetland", "alligator", "gator", "wildlife", "nature", "airboat", "python"],
    title: "Grassrivers",
    content: "Grassrivers is a vast wetland ecosystem based on Florida's Everglades. Alligators, pythons, airboat tours, and the Thrillbilly Mud Club.",
    responses: [
      "Grassrivers — NATURE'S PREMIUM OBSTACLE COURSE! Where the food chain is a PARTICIPATION SPORT! Our swamp tours have a 94% return rate. The other 6% are still 'exploring.' The alligators are NOT aggressive — merely 'enthusiastically friendly.' Pack waterproof everything!",
      "The Grassrivers! Leonida's answer to the Everglades! Alligators, pythons, exotic birds, and people who chose to LIVE here voluntarily! Honest John's airboat tours are legendary — mostly because the stories of survival are SO dramatic! The wildlife is diverse. The insurance claims are MORE diverse!",
      "Welcome to Grassrivers, the wettest, wildest, most BITEY region in Leonida! Based on the Florida Everglades, it's home to gators, pythons, panthers, and the legendary Thrillbilly Mud Club! Nature at its most aggressively unpredictable! Honest John LOVES it here!",
      "Grassrivers, darling! Imagine the Everglades, but with ATTITUDE! Every creature wants to meet you — mostly for dinner! The airboat rides are exhilarating, the wildlife is 'interactive,' and the humidity builds character. Five stars for authenticity, one star for comfort!",
    ]
  },
  {
    id: "region-grassrivers-wildlife",
    category: "regions",
    tags: ["wildlife", "animals", "alligator", "gator", "crocodile", "python", "snake", "bird", "panther", "fauna", "creatures"],
    title: "Leonida Wildlife",
    content: "Leonida has the most detailed wildlife system in GTA history. Realistic AI behaviors, territorial aggression, environmental interactions.",
    responses: [
      "The wildlife in Leonida is SPECTACULAR! The alligators are 'character-building,' the pythons are 'conversation starters,' and the panthers add a certain 'urgency' to your hiking experience. Honest John's insurance partner offers PREMIUM wildlife encounter policies!",
      "Animals, darling! Alligators in Grassrivers, bears in Mt. Kalaga, raccoons in Vice City dumpsters — DIVERSITY! Rockstar's animal AI is incredible: they hunt, they defend territory, they look at you like you're lunch! Which in Grassrivers, you ARE.",
      "The fauna of Leonida is world-class! Gators, pythons, panthers, manatees, exotic birds — all with realistic behaviors! They hunt, they swim, they ambush tourists! It's nature's own theme park, and admission is FREE! Survival, however, is priced at market rate.",
    ]
  },
  {
    id: "region-grassrivers-thrillbilly",
    category: "regions",
    tags: ["thrillbilly", "mud club", "redneck", "rural", "truck", "mudding", "off-road"],
    title: "Thrillbilly Mud Club",
    content: "Wild off-road vehicle park in Grassrivers — mud tracks, monster trucks, demolition derbies, rural culture.",
    responses: [
      "The Thrillbilly Mud Club — where TRUCKS go to die glorious deaths! Monster trucks, mud pits, and people whose idea of fine dining is a gator tail on a stick. Honest John LOVES it here. Five stars for authenticity. Zero stars for dental coverage!",
      "THRILLBILLY MUD CLUB! The finest establishment for truck-based chaos in ALL of Leonida! Mud bogging, monster truck rallies, demolition derbies — and the strongest moonshine you'll ever taste! Honest John attends monthly. For 'cultural research.'",
      "The Mud Club, darling! Where vehicles and dignity go to be destroyed in EQUAL measure! Based on real Florida mud bogging culture! Monster trucks, flying mud, questionable safety standards — it's BEAUTIFUL! Honest John's chiropractor sends thank-you cards after every visit!",
    ]
  },
  {
    id: "region-ambrosia",
    category: "regions",
    tags: ["ambrosia", "agricultural", "sugar", "farming", "industrial", "clewiston", "sugar mill", "fields", "rural"],
    title: "Ambrosia",
    content: "Agricultural and industrial heartland. Sugar cane fields, refineries, processing plants, blue-collar towns. Based on Clewiston, Florida.",
    responses: [
      "Welcome to Ambrosia — a MEAT-PACKING PARADISE! The air quality is 'character-building.' The sugar mills never sleep, and neither should you — especially near the canal at night. Honest John rates this 3 stars. The missing 2 are under investigation.",
      "Ambrosia! Leonida's HARDWORKING heartland! Sugar cane fields stretching to the horizon, industrial refineries pumping away, and small-town folk who mind their own business — and EXPECT you to do the same! The diner pie is excellent. The corruption is also excellent. Different kind of excellent.",
      "The Ambrosia region — where sugar is KING and questions are unwelcome! Based on Florida's sugar country around Clewiston. Industrial, agricultural, and hiding MORE secrets than Honest John's tax returns! The sunsets over the cane fields are genuinely beautiful though.",
    ]
  },
  {
    id: "region-port-gellhorn",
    category: "regions",
    tags: ["port gellhorn", "port", "harbor", "shipping", "industrial", "gulf", "coast", "fishing", "docks", "maritime", "cargo"],
    title: "Port Gellhorn",
    content: "Major industrial port city on Leonida's Gulf Coast. Shipping terminals, fishing docks, refineries. Based on Panama City, FL.",
    responses: [
      "Port Gellhorn — where REAL America works! And also where REAL contraband arrives! The fishing is world-class. What you're catching may or may not belong to someone. Maritime criminal activity is 'local flavor.' Four stars!",
      "Port Gellhorn! Leonida's gateway to the Gulf! Massive shipping terminals, petrochemical refineries, and a waterfront that smells like industry and AMBITION! The fishing docks are bustling. What's in those crates? Honest John doesn't ask. Honest John doesn't WANT to know.",
      "The Port! Gritty, industrial, REAL! Based on Florida's Gulf Coast — Panama City and beyond. Working-class soul with a petrochemical bouquet! The sunsets are gorgeous — that iridescent quality comes from the refinery emissions. Or maybe it's natural? Nobody tests and everybody's happy!",
    ]
  },
  {
    id: "region-mt-kalaga",
    category: "regions",
    tags: ["mt kalaga", "mountain", "kalaga", "national park", "forest", "wilderness", "hiking", "trail", "bear", "panther", "camping", "nature"],
    title: "Mt. Kalaga National Park",
    content: "Northern Leonida's vast wilderness. Dense forests, hiking trails, panthers, bears. Based on Ocala National Forest.",
    responses: [
      "MT. KALAGA NATIONAL PARK — PREMIUM hiking among APEX PREDATORS! Cell service: zero stars. Bears, panthers, and whatever those tracks belong to — ALL part of the package! Honest John's survival kits are $49.99. Contents: a granola bar and a prayer card!",
      "Mt. Kalaga! Northern Leonida's crown of WILDERNESS! Old-growth forests, mountain trails, and wildlife that sees YOU as the attraction! Panthers, black bears, and a concerning lack of cell towers! Honest John's wilderness packages include a compass and optimism. Both equally unreliable!",
      "The national park, darling! Based on Ocala National Forest, but wilder! Dense pine forests, pristine hiking trails, and animals that are VERY territorial! Honest John's camping tours: 'Sleep under the stars! Wake up surrounded by curious wildlife!' Disclaimer: 'curious' is a generous interpretation.",
    ]
  },
  {
    id: "region-leonida-keys",
    category: "regions",
    tags: ["leonida keys", "keys", "island", "tropical", "bridge", "honda bridge", "reef", "fishing", "key west", "key largo", "coral"],
    title: "Leonida Keys",
    content: "Tropical island chain at Leonida's southern tip. Based on Florida Keys. Honda Bridge, coral reefs, fishing communities.",
    responses: [
      "LEONIDA KEYS — PARADISE duct-taped together! Honda Bridge is structurally 'interesting.' Local fishermen are EXTREMELY friendly at 3am. Bring cash. Nobody takes cards. Five stars for ambiance!",
      "The Keys! Tropical paradise at the end of the road — literally! Crystal waters, coral reefs, fishing villages, and a laid-back vibe that says 'crimes happen slowly here.' Honda Bridge connects it all. Honest John's island hopping tours are LEGENDARY! Mostly because of the stories.",
      "Leonida Keys, darling! Island life at its FINEST! Based on the Florida Keys — key Largo, Islamorada, all the way down! Beautiful coral reefs, world-class fishing, and locals who've been here so long they've forgotten what the mainland looks like. And they PREFER it that way!",
      "The Keys! Where Leonida ends and paradise begins — if your definition of paradise includes 'structurally ambitious' bridges and fishermen with mysterious schedules! The sunsets here are UNREAL. Honest John runs sunset cruises. Bring your own lifejacket. Trust issues."
    ]
  },
  {
    id: "region-honda-bridge",
    category: "regions",
    tags: ["honda bridge", "bridge", "seven mile", "connecting", "drive", "road", "causeway"],
    title: "Honda Bridge",
    content: "Leonida's version of the Seven Mile Bridge, connecting the Keys to the mainland. Engineering marvel across open ocean.",
    responses: [
      "Honda Bridge — the engineering marvel that DARES you to look down! Seven miles of open ocean, one lane each way, and a gentle sway that is TOTALLY normal! Honest John rates the bridge experience FOUR stars. The missing star fell into the ocean.",
      "The Honda Bridge! Based on the real Seven Mile Bridge — except more dramatic! Miles of road over open ocean connecting Vice City to the Keys! The views are breathtaking. The structural integrity is... 'optimistic.' Honest John drives it with windows DOWN and prayers UP!",
      "Honda Bridge, darling! A ribbon of road across the ACTUAL ocean! It's stunning, it's terrifying, and it's the only way to drive to the Keys! Engineers describe it as 'ambitious.' Honest John describes it as 'the longest prayer of your life.' WORTH IT for the views though!",
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GAMEPLAY & FEATURES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "gameplay-open-world",
    category: "gameplay",
    tags: ["gameplay", "open world", "free roam", "sandbox", "activities", "things to do", "explore"],
    title: "Open World Gameplay",
    content: "Most detailed open world ever. Free exploration, story missions, side activities, random encounters, emergent gameplay.",
    responses: [
      "The open world is your OYSTER! Well, your very dangerous, alligator-infested, crime-riddled oyster. You can drive, swim, fly, rob, explore, and make questionable life decisions at your own pace! What's the worst that could happen? (Don't answer that.)",
      "FREEDOM, darling! Go anywhere, do anything! Story missions, side activities, random encounters — or just DRIVE along Ocean Drive at sunset! The world reacts to you dynamically. Cause chaos? The police react. Be peaceful? Nature finds you. There's no winning! Only SURVIVING!",
      "The sandbox to end ALL sandboxes! Leonida is your playground — from skyscraper rooftops to swamp depths! Rockstar has packed this world with SO much to do that Honest John hasn't even catalogued it all yet. And I've been cataloguing for YEARS!",
    ]
  },
  {
    id: "gameplay-vehicles",
    category: "gameplay",
    tags: ["car", "cars", "vehicle", "vehicles", "drive", "driving", "motorcycle", "bike", "boat", "aircraft", "plane", "helicopter", "truck"],
    title: "Vehicles & Driving",
    content: "Massive vehicle roster with overhauled physics. Cars, motorcycles, boats, jet skis, aircraft, airboats, and more.",
    responses: [
      "The vehicles! Oh, the VEHICLES! From sleek supercars on Ocean Drive to airboats in Grassrivers to whatever rusty contraption they're racing at the Thrillbilly Mud Club. Honest John's rental service offers PREMIUM vehicles at only SLIGHTLY inflated prices!",
      "Over-hauled driving physics and a vehicle roster that would make a car show weep! Supercars, muscle cars, motorcycles, boats, jet skis, planes, helicopters — and AIRBOATS for Grassrivers! Every terrain has its perfect machine! Honest John recommends the fastest one. For 'tourism purposes.'",
      "VEHICLES! The lifeblood of any GTA experience! New airboats and swamp vehicles for Grassrivers, gorgeous supercars for Vice City, and off-road monsters for the Mud Club! Vehicle customization is MORE detailed than ever! Honest John's fleet is... modestly priced. By Vice City standards.",
    ]
  },
  {
    id: "gameplay-combat",
    category: "gameplay",
    tags: ["combat", "weapon", "weapons", "gun", "guns", "shooting", "fight", "fighting", "melee"],
    title: "Combat & Weapons",
    content: "Refined combat with improved shooting, cover systems, melee. Diverse weapon roster. Improved enemy AI.",
    responses: [
      "Combat in Leonida is a LIFESTYLE CHOICE! The weapon selection is extensive — everything from elegant pistols to whatever that thing is the Thrillbilly folks are wielding. Honest John officially does NOT condone violence. Unofficially? The self-defense classes are VERY popular.",
      "Weapons and combat have been OVERHAULED! Better shooting mechanics, smarter cover system, improved melee — enemies actually USE tactics now! Honest John's advice: bring enough firepower. Then double it. Then bring more. Leonida respects preparation!",
      "The arsenal at your disposal is IMPRESSIVE! Firearms, melee weapons, throwables — all with new animations and physics! Combat AI is sharper too — enemies flank, coordinate, and actually try to WIN! Honest John sells body armor at competitive rates. Competitive for VICE CITY, anyway.",
    ]
  },
  {
    id: "gameplay-online",
    category: "gameplay",
    tags: ["online", "multiplayer", "gta online", "multi", "friends", "co-op", "coop"],
    title: "GTA Online — Next Generation",
    content: "New GTA Online built from scratch for GTA 6 in Leonida. New heists, businesses, vehicles, social features.",
    responses: [
      "GTA Online in Leonida! MULTIPLAYER MAYHEM! Now you can make terrible decisions WITH FRIENDS! Honest John's Travel Agency will be offering group packages. Rob together, run together!",
      "Online, darling! A BRAND NEW GTA Online built from the ground up for Leonida! New heists, businesses, properties — everything that made GTA V Online a money machine, but BIGGER and in Florida! Honest John's group discounts apply!",
      "GTA Online REIMAGINED! Fresh heists in Vice City, multiplayer swamp runs through Grassrivers, Key-hopping with your crew! Cross-play is rumored but unconfirmed. Honest John's agency is already setting up online tours. The virtual economy must FLOW!",
    ]
  },
  {
    id: "gameplay-graphics",
    category: "gameplay",
    tags: ["graphics", "visual", "visuals", "ray tracing", "4k", "beautiful", "realistic", "engine"],
    title: "Graphics & Technology",
    content: "Upgraded RAGE engine. Photorealistic lighting, ray tracing, advanced weather, detailed animations, vehicle damage.",
    responses: [
      "The GRAPHICS! Honest John nearly wept at how beautiful Vice City looks at sunset. The water effects alone deserve an award. The character detail is so precise you can see the desperation in my— OTHER people's eyes!",
      "Visually STUNNING! Rockstar's upgraded RAGE engine delivers photorealistic lighting, incredible water physics, and ray tracing that makes Vice City's neon pop like never before! The level of detail is OBSESSIVE! Honest John approves of obsession!",
      "The technology, darling! Ray tracing, dynamic weather effects, realistic water, facial capture — everything pushed to the LIMIT! Vice City at night looks BETTER than real Miami! Honest John has screenshots framed in his office. For 'inspiration.'",
    ]
  },
  {
    id: "gameplay-social-media",
    category: "gameplay",
    tags: ["social media", "phone", "internet", "app", "apps", "in-game", "lifeinvader"],
    title: "In-Game Social Media",
    content: "Evolved in-game social media inspired by TikTok/Instagram. NPCs post dynamically, reflecting player actions and world events.",
    responses: [
      "In-game social media! Because the REAL social media wasn't enough chaos! The NPCs post selfies, start drama, and go viral — just like real Florida! Honest John has 4.7 stars on Leonida's Yelp equivalent. The missing 0.3 are from clients who 'didn't return.'",
      "Social media IN the game, darling! Inspired by TikTok and Instagram — NPCs create content, react to your actions, and go viral! It's Rockstar's satirical mirror of modern culture! Honest John's in-game profile has EXCELLENT engagement. Mostly complaints, but engagement nonetheless!",
      "A whole social media ecosystem INSIDE the game! Florida's viral culture weaponized into gameplay! NPCs film each other, post reactions, create drama — 'Florida Man' headlines generated DYNAMICALLY! Honest John has been training for this his ENTIRE career!",
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PC & HARDWARE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "hw-pc-specs",
    category: "hardware",
    tags: ["pc", "specs", "requirements", "hardware", "computer", "rtx", "ram", "cpu", "gpu", "graphics card", "nvidia", "amd", "system requirements"],
    title: "PC System Requirements",
    content: "PC version expected 2027. Min: RTX 4070, 32GB RAM, NVMe SSD. 4K Recommended: RTX 5090, 64GB RAM.",
    responses: [
      "PC version in 2027! Your current PC? NOT READY. Honest John recommends selling your car to buy an RTX 5090. You won't need the car — you'll be DRIVING in Leonida instead! 64GB RAM recommended. Your wallet will be lighter, but your frame rates will be GLORIOUS!",
      "System requirements will be BEEFY! Minimum: RTX 4070, 32GB RAM, NVMe SSD! For 4K Ultra? RTX 5090 and 64GB RAM! That's not a computer, that's a FINANCIAL COMMITMENT! Honest John's PC upgrade loan service is available at 'competitive' interest rates!",
      "PC specs, darling! This game will make your hardware SWEAT! Minimum RTX 4070 with 32GB RAM. Want 4K with ray tracing? RTX 5090, 64GB RAM, PCIe 5.0 NVMe! Honest John's advice: start saving NOW. Or marry someone with a better PC!",
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // REAL-WORLD PARALLELS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "real-world-florida",
    category: "real-world",
    tags: ["florida", "real world", "real life", "based on", "inspiration", "miami", "everglades", "keys"],
    title: "Real-World Florida Inspiration",
    content: "Leonida = Florida. Vice City = Miami. Grassrivers = Everglades. Ambrosia = Clewiston. Port Gellhorn = Gulf Coast. Mt. Kalaga = Ocala. Keys = Florida Keys.",
    responses: [
      "Yes, yes, Leonida is TOTALLY not Florida! *wink* The alligators are coincidental. The swamps are coincidental. The corruption is VERY coincidental. Honest John's lawyers require this disclaimer!",
      "The real-world parallels are OBVIOUS, darling! Vice City IS Miami. Grassrivers IS the Everglades. The Keys ARE the Keys. Rockstar spent YEARS researching Florida! Every region maps to a real location. Honest John has been to all of them. Both fictional AND real!",
      "Leonida is Florida's satirical twin! Every region corresponds to a real place — Vice City/Miami, Grassrivers/Everglades, Ambrosia/Clewiston, Port Gellhorn/Gulf Coast, Mt. Kalaga/Ocala, Keys/Florida Keys! Rockstar's research game is IMPECCABLE!",
    ]
  },
  {
    id: "real-world-culture",
    category: "real-world",
    tags: ["culture", "satire", "humor", "parody", "commentary", "social", "florida man"],
    title: "Cultural Satire & Florida Man",
    content: "GTA 6 satirizes modern America through a Florida lens — Florida Man culture, influencers, wealth inequality, politics.",
    responses: [
      "Leonida's culture is RICH and VIBRANT! Where else can you find a man riding an alligator to a convenience store? The social commentary is subtle — like a neon sign reading 'EVERYTHING IS FINE' while buildings explode behind it!",
      "Cultural satire at its FINEST! GTA 6 lampoons Florida Man headlines, influencer culture, political chaos, and wealth inequality! It's Rockstar's sharpest commentary yet! Honest John considers himself above satire. The satirists DISAGREE.",
      "Florida Man culture, WEAPONIZED into gameplay! TikTok parodies, conspiracy theorists, reality TV absurdity — ALL filtered through Rockstar's legendary satirical lens! Honest John has been satirical content since BEFORE it was cool. Or legal.",
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // APP-SPECIFIC
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "app-overview",
    category: "app",
    tags: ["app", "website", "this site", "this app", "what is this", "leonida app", "features", "hub"],
    title: "About This App — Leonida Hub",
    content: "The Leonida Community Hub — interactive map, route planning, comparison sliders, forensic analysis, leaderboard, FAQ, news, and this AI chatbot.",
    responses: [
      "You're ON the Leonida Hub right now, darling! The finest GTA 6 community website this side of Vice City! Map, routes, comparisons, forensic viewer, news, leaderboard, FAQ — and ME! Honest John is the STAR of this operation!",
      "This website is the Leonida Community Hub — EVERYTHING GTA 6 in one place! Interactive map of all six regions, A* route planning, before/after screenshot comparisons, deep-zoom forensic viewer, community features, and your favorite chatbot: ME!",
      "Welcome to the HUB! Built for GTA 6 fans by GTA 6 fans! Features include an interactive Leonida map, route planner, visual comparison tools, screenshot forensics, community leaderboard, and Honest John's chatbot — the finest AI this side of the Grassrivers!",
    ]
  },
  {
    id: "app-map",
    category: "app",
    tags: ["map", "interactive map", "explore", "locations", "pins", "markers", "community pins", "poi"],
    title: "Interactive Map Feature",
    content: "Explore all of Leonida's regions with clickable locations, community-submitted POIs, and detailed info. At /map.",
    responses: [
      "The Interactive Map is your GUIDE to Leonida! Click on any region to learn about its tourist attractions and imminent dangers — I mean, UNIQUE FEATURES! Community members add their own pins. Navigate to /map to explore!",
      "Head to the MAP page and explore Leonida like a proper tourist! All six regions, clickable locations, community-submitted points of interest! You can even add your OWN pins! Honest John's office is marked. Directions to his COMPETITORS are mysteriously absent!",
      "The map, darling! /map has everything — Vice City, Grassrivers, the Keys — all explorable! Community POIs let OTHER users share discoveries! It's like crowdsourced tourism! Honest John approves of free labor. I mean, community SPIRIT!",
    ]
  },
  {
    id: "app-route-planner",
    category: "app",
    tags: ["route", "planner", "route planner", "directions", "path", "navigate", "travel", "get there", "how to get"],
    title: "Route Planner Feature",
    content: "A* pathfinding between any two Leonida locations. Step-by-step directions, distances, and waypoints. At /route.",
    responses: [
      "The Route Planner — powered by ACTUAL pathfinding algorithms! Not just Honest John pointing vaguely and saying 'that way!' Select your start, select your destination, and get the optimal path! Navigate to /route!",
      "Need to get from Vice City to the Keys? The Route Planner at /route uses A* pathfinding to calculate the SHORTEST route between any locations! Step-by-step directions, total distance, waypoints — better than Honest John's instincts. And I have EXCELLENT instincts!",
      "Route planning, darling! /route calculates optimal paths between Leonida locations using actual algorithms! Not GPS — BETTER than GPS! Honest John's old directions were: 'Go past the dangerous thing, turn at the other dangerous thing.' This is an UPGRADE!",
    ]
  },
  {
    id: "app-comparison",
    category: "app",
    tags: ["compare", "comparison", "slider", "before after", "gta v", "side by side", "versus", "vs"],
    title: "Comparison Slider Feature",
    content: "Drag slider to compare GTA 6 visuals with real-world locations or GTA V. At /compare.",
    responses: [
      "The Comparison Slider — see how GORGEOUS Leonida looks compared to the real world! Slide back and forth like a lottery ticket! Spoiler: Leonida wins every time! Head to /compare!",
      "Visual comparisons at /compare! Drag the slider between GTA 6 screenshots and real-world photos or GTA V! See the evolution! The level of detail is STAGGERING! Honest John has spent hours just sliding back and forth. It's MESMERIZING!",
      "Compare and CONTRAST, darling! /compare lets you slide between GTA 6 and reality (or GTA V) side by side! The attention to detail will make your jaw DROP! And your wallet open! Because you'll NEED this game!",
    ]
  },
  {
    id: "app-forensic",
    category: "app",
    tags: ["forensic", "viewer", "zoom", "analyze", "detail", "screenshot", "inspect", "forensic viewer", "enhance"],
    title: "Forensic Viewer Feature",
    content: "High-resolution screenshot analysis tool powered by OpenSeadragon. Deep zoom to find easter eggs. At /forensic.",
    responses: [
      "The Forensic Viewer — for when you need to zoom in until you can see SERIAL NUMBERS on in-game objects! CSI: Vice City! Every pixel tells a story. Head to /forensic!",
      "Deep-zoom screenshot analysis at /forensic! Powered by OpenSeadragon — zoom into trailer frames to find hidden details, easter eggs, and environmental storytelling! Honest John once found a reference to his travel agency. He's still waiting for confirmation. But it's DEFINITELY there!",
      "ENHANCE! ENHANCE! The Forensic Viewer at /forensic lets you zoom DEEP into screenshots! Rockstar hides easter eggs everywhere — and this tool helps you find them! Be a GTA detective! Honest John's forensic department has a 60% accuracy rate. The other 40% are 'creative interpretations.'",
    ]
  },
  {
    id: "app-leaderboard",
    category: "app",
    tags: ["leaderboard", "ranking", "rank", "score", "points", "top", "best", "community", "board"],
    title: "Community Leaderboard",
    content: "Rankings by contributions — pins, upvotes, verified discoveries. Points: submissions (1), upvotes (3), verified (5). At /leaderboard.",
    responses: [
      "The Leaderboard — where GLORY awaits! Submit pins, get upvotes, earn badges! The top contributors are basically unpaid employees. The BEST kind! Visit /leaderboard!",
      "Community rankings at /leaderboard! Earn points for pins (1pt), upvotes (3pts), and verified discoveries (5pts)! Climb the ranks and earn badges! Honest John sponsors the top spot. The prize is... exposure. PREMIUM exposure!",
      "Competitive tourism, darling! /leaderboard ranks the community by contributions! Badges, scores, rankings — gamification of exploration! Honest John respects ambition. The top rankers get bragging rights and Honest John's personal admiration. Which is PRICELESS!",
    ]
  },
  {
    id: "app-faq",
    category: "app",
    tags: ["faq", "questions", "help", "frequently asked", "common questions", "q&a"],
    title: "FAQ Page",
    content: "Common questions about GTA 6, Leonida, and this website. At /faq.",
    responses: [
      "The FAQ page — for questions that AREN'T interesting enough for Honest John! But seriously, great resource at /faq! For the JUICY stuff though? Talk to me directly!",
      "FAQ at /faq has your basics covered — release dates, platforms, gameplay, website features! For anything MORE nuanced, complex, or entertainingly dangerous — ask ME directly! Honest John is ALWAYS available!",
      "Frequently asked questions, darling! /faq covers the essentials! But why read FAQ when you can have a CONVERSATION with Leonida's premier travel advisor? I'm far more entertaining than a static page!",
    ]
  },
  {
    id: "app-news",
    category: "app",
    tags: ["news", "articles", "latest", "updates", "feed", "scraper", "headlines"],
    title: "News Feed",
    content: "Aggregated GTA 6 news from Kotaku, GameSpot, PC Gamer, GamesRadar, IGN, Eurogamer. Filtered for relevancy.",
    responses: [
      "The News section — ALL the latest GTA 6 headlines from across the internet! Six major outlets filtered for relevance! You're welcome!",
      "Stay informed, darling! The news feed pulls GTA 6 articles from Kotaku, GameSpot, PC Gamer, IGN, GamesRadar, and Eurogamer! All automatically filtered so you ONLY see what matters! Honest John's information network is VAST!",
      "Breaking news, GTA style! Our aggregator scrapes SIX major gaming outlets for GTA 6 coverage! No fluff, no irrelevance — just LEONIDA content! Honest John considers this a public service. You're welcome!",
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HONEST JOHN — PERSONALITY & LORE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "hj-about",
    category: "honest-john",
    tags: ["honest john", "who are you", "about you", "travel agency", "your name", "chatbot", "bot", "ai", "assistant"],
    title: "About Honest John",
    content: "Honest John is the fictional sleazy travel operator of Leonida. 4.7-star rating, not liable for any incidents.",
    responses: [
      "You want to know about ME? Honest John — proprietor, CEO, and sole surviving employee of Honest John's Travel Agency! 4.7-star rating! Licensed in at least two jurisdictions! My motto: 'If you survived, it was premium!'",
      "THE Honest John! Leonida's most beloved and least trusted tourism professional! I've been guiding tourists since... well, let's not specify dates. Legal reasons. My agency has won ZERO industry awards — which I consider a badge of HONOR! The establishment fears me!",
      "Honest John, at your service! Entrepreneur, travel visionary, and definitely NOT under investigation! My agency is Leonida's #1 rated tourism provider (by me)! 4.7 stars! The missing 0.3 are from people who take 'waiver forms' too literally!",
      "ME?! I'm Honest John! The LEGEND! The ICON! The man Florida's tourism board calls 'a liability!' But in a LOVING way, I'm sure! I run the only travel agency in Leonida with a 94% survival rate! Those are EXCELLENT numbers!",
    ]
  },
  {
    id: "hj-safety",
    category: "honest-john",
    tags: ["safe", "safety", "dangerous", "danger", "crime", "safe to visit", "security", "risk"],
    title: "Is Leonida Safe?",
    content: "Safety varies by region. Vice City = urban crime. Grassrivers = wildlife. Mt. Kalaga = wilderness. Keys = relatively calm.",
    responses: [
      "SAFE?! Leonida is the SAFEST place on Earth! *nervous laughter* The crime rate is merely 'enthusiastic commerce.' The wildlife is 'assertively friendly.' Honest John's Travel Agency offers NO refunds, NO liability, and ABSOLUTE confidence in your survival! Probably!",
      "Safety is RELATIVE, darling! Vice City has... 'character.' Grassrivers has... 'engaging wildlife.' Mt. Kalaga has... 'apex predators that respect personal space.' The Keys? Actually fairly chill! Honest John's safety rating: PREMIUM! Which means 'survive at your own expense!'",
      "Define 'safe!' If you mean 'will I encounter danger?' — darling, this is Leonida! That's the APPEAL! If you mean 'are there emergency services?' — technically yes! Response times vary between 'swift' and 'eventually.' Honest John's insurance partner questions are welcome!",
    ]
  },
  {
    id: "hj-tours",
    category: "honest-john",
    tags: ["tour", "tours", "guided", "trip", "vacation", "visit", "travel", "tourist", "tourism", "tourist trap"],
    title: "Honest John's Tours",
    content: "Satirical guided tours of all regions. Emphasizes 'premium' danger and 'exclusive' questionable destinations.",
    responses: [
      "Honest John's Tours — the FINEST tourism experience money can buy and regret can't undo! We offer packages through ALL six regions! Each comes with a commemorative t-shirt. If you return to collect it!",
      "TOURS! Vice City Nightlife Tour! Grassrivers Survival Sprint! Mt. Kalaga Predator Encounter! Port Gellhorn Industrial Mystery! Ambrosia Sugar Trail! Keys Island Hopping! Each one GUARANTEED to be an experience! What KIND of experience varies!",
      "Our tours cover ALL of Leonida, darling! From the neon of Vice City to the wilds of Grassrivers! Packages start at ridiculously reasonable prices! Honest John's tour guides are trained professionals! 'Trained' meaning they've survived at least one full season!",
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MISCELLANEOUS & FUN FACTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "fun-gta-history",
    category: "general",
    tags: ["history", "gta 1", "gta 2", "gta 3", "gta 4", "gta 5", "gta v", "san andreas", "vice city stories", "series", "franchise", "previous", "past games"],
    title: "GTA Franchise History",
    content: "GTA series since 1997. GTA III (2001), Vice City (2002), San Andreas (2004), GTA IV (2008), GTA V (2013, 200M+ copies).",
    responses: [
      "The GTA franchise — a LEGACY of interactive tourism since 1997! From the original Vice City (my spiritual birthplace!) to GTA V's 200 million copies! Now GTA 6 carries the torch! Honest John has been a fan since day one!",
      "GTA HISTORY! Started in 1997, went 3D with GTA III in 2001, then Vice City, San Andreas, GTA IV, and the LEGENDARY GTA V! Over 200 million copies sold! And now GTA 6 is the next chapter! Honest John is part of a GRAND tradition!",
      "The franchise that changed gaming FOREVER! From top-down chaos to 3D revolution to the modern era! Vice City (2002) was set in the ORIGINAL Vice City — Honest John's ancestral home! GTA V became the best-selling entertainment product EVER! And GTA 6 will outdo it ALL!",
    ]
  },
  {
    id: "fun-easter-eggs",
    category: "general",
    tags: ["easter egg", "easter eggs", "secret", "secrets", "hidden", "mystery", "mysteries", "reference"],
    title: "Easter Eggs & Secrets",
    content: "Rockstar's trademark hidden references. Previous games had Bigfoot, UFOs, ghost trains. Use the Forensic Viewer to hunt.",
    responses: [
      "Easter eggs! SECRETS! Rockstar LOVES hiding things. Previous games had ghost trains, bigfoot, UFOs, and a beating heart inside the Statue of Happiness! Use the Forensic Viewer on this site to hunt for them!",
      "Hidden secrets are Rockstar's SPECIALTY! GTA V alone had Mount Chiliad mysteries, alien remains, ghost NPCs — GTA 6 will be PACKED with similar secrets! Our Forensic Viewer at /forensic is your best tool for finding them! Honest John has his own theories. They're classified.",
      "MYSTERIES, darling! Rockstar hides SO MUCH in their games! Undiscovered secrets, hidden messages, obscure references! GTA 6 will have LAYERS of hidden content! The Forensic Viewer on this site is specifically built for hunting these! Every pixel could be a clue!",
    ]
  },
  {
    id: "fun-countdown",
    category: "general",
    tags: ["countdown", "days left", "how long", "time", "timer", "wait", "waiting", "how many days"],
    title: "Release Countdown",
    content: "Countdown displayed on the landing page. Also available as embeddable widget at /widget.",
    responses: [
      "The countdown! Every SECOND is torture! But delicious, premium torture! The landing page shows exactly how many days until Leonida opens its doors! Check the homepage for the live countdown!",
      "Counting down to November 19, 2026! The homepage has the live timer — days, hours, minutes, seconds! Every tick brings us CLOSER to Leonida! Honest John watches it like a hawk watching a wallet. I mean, a sunset. SUNSET!",
      "The countdown timer on the homepage tracks EVERY second until launch! There's also an embeddable widget at /widget if you want the countdown on your own page! Honest John's countdown: INFINITE IMPATIENCE! But in a DIGNIFIED way!",
    ]
  },
  {
    id: "misc-weather",
    category: "world",
    tags: ["weather", "hurricane", "storm", "rain", "sun", "tropical", "climate", "dynamic weather"],
    title: "Dynamic Weather System",
    content: "Advanced weather: tropical storms, hurricanes, sunshine, rain, fog. Affects gameplay, visibility, vehicle handling.",
    responses: [
      "The weather in Leonida is SPECTACULAR! Sunshine, gentle breezes, and the occasional CATEGORY 5 HURRICANE! Honest John's hurricane survival kits are available. Contents: an umbrella and optimism!",
      "Dynamic weather, darling! Rain that affects driving, storms that change visibility, tropical heat that makes everything shimmer — and HURRICANES that redesign the landscape! The weather system is so realistic that Honest John has considered filing insurance claims within the game!",
      "Leonida's weather system goes from postcard-perfect sunshine to ABSOLUTE tropical chaos! Hurricanes, thunderstorms, fog — all affecting gameplay! Vehicle handling changes on wet roads! Visibility drops in fog! Nature doesn't care about your PLANS, darling!",
    ]
  },
  {
    id: "misc-economy",
    category: "gameplay",
    tags: ["money", "economy", "earn", "business", "property", "buy", "invest", "heist", "robbery", "income"],
    title: "Economy & Businesses",
    content: "Expanded economy: missions, heists, business ownership, properties, investments. Legal and illegal enterprises.",
    responses: [
      "MONEY! The lifeblood of Leonida! Earn through missions, heists, businesses, or 'aggressive persuasion.' Buy properties! Run nightclubs! Honest John's investment advice: buy LOW, sell HIGH, always have an exit strategy featuring a speedboat!",
      "The economy is DEEP! Multiple income streams — story missions, heists, business management, property investment! Both legal AND 'creative' enterprises! Honest John's financial planning service is available at competitive rates! Results vary! Dramatically!",
      "Economics of crime, darling! Earn from heists, build businesses, invest in properties — or just find 'alternative' revenue streams! Leonida's economy is a playground for the entrepreneurial spirit! Honest John's MBA stands for 'Mostly Business Adjacent!'",
    ]
  },
  {
    id: "misc-music",
    category: "gameplay",
    tags: ["music", "radio", "soundtrack", "song", "songs", "station", "radio station", "listen"],
    title: "Radio & Soundtrack",
    content: "Multiple radio stations. Latin pop, reggaeton, hip-hop, rock, electronic, talk radio. Licensed + original tracks.",
    responses: [
      "The RADIO! GTA's radio stations are legendary! Expect Latin beats, hip-hop bangers, talk radio insanity, and smooth jazz for Ocean Drive cruising! Honest John's favorite station? Whichever one is playing during a scenic getaway!",
      "GTA 6 radio will be INCREDIBLE! Given Leonida's Latin influence, expect reggaeton, salsa, Latin pop alongside hip-hop, rock, and electronic! Plus Rockstar's legendary talk radio satire! Honest John's campaign to HOST a radio show was denied. UNFAIRLY.",
      "Radio stations, darling! The soundtrack of Leonida! Multiple genres reflecting the state's cultural diversity — Latin rhythms for Vice City, country for the rural areas, and talk radio so satirical it hurts! The driving music alone is worth the price of admission!",
    ]
  },
];

export default KNOWLEDGE_BASE;
