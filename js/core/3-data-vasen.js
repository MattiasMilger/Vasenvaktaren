// =============================================================================
// 3-data-vasen.js - All Väsen Species Definitions
// =============================================================================

const VASEN_SPECIES = {
    // Oknytt Family
    'Landvatte': {
        name: 'Landvätte',
        internalName: 'Landvatte',
        description: 'The unseen protector of a patch of ground, hill, or wilderness. They ensure the land\'s prosperity and punish trespassers.',
        family: FAMILIES.OKNYTT,
        element: ELEMENTS.EARTH,
        rarity: RARITIES.COMMON,
        abilities: ['Torch Strike', 'Landslide', 'Burning Insult', 'Loki\'s Betrayal'],
        tamingItem: 'Sturdy Spade',
        image: 'assets/vasen/landvatte.png'
    },
    'Gardstomte': {
        name: 'Gårdstomte',
        internalName: 'Gardstomte',
        description: 'A sharp‑eyed, temperamental guardian of the yard, barns, and gardens. It tends animals and tools, rewarding tidy grounds and punishing neglect.',
        family: FAMILIES.OKNYTT,
        element: ELEMENTS.NATURE,
        rarity: RARITIES.COMMON,
        abilities: ['Torch Strike', 'Vine Whip', 'Smithing', 'Giantsbane'],
        tamingItem: 'Garden Rake',
        image: 'assets/vasen/gardstomte.png'
    },
    'Hustomte': {
        name: 'Hustomte',
        internalName: 'Hustomte',
        description: 'A watchful steward dwelling in the house, often near the hearth. It keeps the home safe, but hates dirt and laziness. Offerings of porridge ensure its loyalty.',
        family: FAMILIES.OKNYTT,
        element: ELEMENTS.FIRE,
        rarity: RARITIES.COMMON,
        abilities: ['Torch Strike', 'Flaming Skewer', 'Burning Insult', 'Loki\'s Betrayal'],
        tamingItem: 'Warm Tomtegrot',
        image: 'assets/vasen/hustomte.png'
    },
    'Brunnsgubbe': {
        name: 'Brunnsgubbe',
        internalName: 'Brunnsgubbe',
        description: 'A reclusive warden of the village well. He keeps the water pure and the spring flowing, but demands cleanliness. Defile his domain and he will sour the water.',
        family: FAMILIES.OKNYTT,
        element: ELEMENTS.WATER,
        rarity: RARITIES.UNCOMMON,
        abilities: ['Sinkhole', 'Tidal Wave', 'Skald\'s Mead', 'Freya\'s Tears'],
        tamingItem: 'Water Bucket',
        image: 'assets/vasen/brunnsgubbe.png'
    },
    'Pyssling': {
        name: 'Pyssling',
        internalName: 'Pyssling',
        description: 'A tiny, quick-footed helper bound to the raft. Helpful when respected, troublesome when ignored.',
        family: FAMILIES.OKNYTT,
        element: ELEMENTS.WIND,
        rarity: RARITIES.UNCOMMON,
        abilities: ['Wailing Cry', 'Wind Gust', 'Burning Insult', 'Giantsbane'],
        tamingItem: 'Attic Key',
        image: 'assets/vasen/pyssling.png'
    },

    // Vålnad Family
    'Nattramn': {
        name: 'Nattramn',
        internalName: 'Nattramn',
        description: 'The shrieking, spectral form of a raven. It is the restless spirit of a soul denied peace, whose shadow spread ill omen.',
        family: FAMILIES.VALNAD,
        element: ELEMENTS.WIND,
        rarity: RARITIES.COMMON,
        abilities: ['Storm Claw', 'Icicle Spear', 'Burning Insult', 'Sky Dive'],
        tamingItem: 'Black Feather',
        image: 'assets/vasen/nattramn.png'
    },
    'Myling': {
        name: 'Myling',
        internalName: 'Myling',
        description: 'A perpetually wailing, agonized spirit of a forsaken infant, abandoned or wrongfully slain before receiving a proper burial.',
        family: FAMILIES.VALNAD,
        element: ELEMENTS.EARTH,
        rarity: RARITIES.COMMON,
        abilities: ['Wailing Cry', 'Sinkhole', 'Burning Insult', 'Loki\'s Betrayal'],
        tamingItem: 'Burial Flowers',
        image: 'assets/vasen/myling.png'
    },
    'Irrbloss': {
        name: 'Irrbloss',
        internalName: 'Irrbloss',
        description: 'A ghastly, hovering light that leads travelers astray into bogs and darkness. Said to be the souls of greedy men trapped between realms.',
        family: FAMILIES.VALNAD,
        element: ELEMENTS.FIRE,
        rarity: RARITIES.UNCOMMON,
        abilities: ['Fire Breath', 'Tidal Wave', 'Elven Light', 'Wailing Cry'],
        tamingItem: 'Ghastly Lantern',
        image: 'assets/vasen/irrbloss.png'
    },
    'Strandvaskare': {
        name: 'Strandvaskare',
        internalName: 'Strandvaskare',
        description: 'The tormented spirit of a drowned sailor, forever haunting the coast. It lures ships to the reef with mournful cries and deceptive lights.',
        family: FAMILIES.VALNAD,
        element: ELEMENTS.WATER,
        rarity: RARITIES.COMMON,
        abilities: ['Drown', 'Tidal Wave', 'Skald\'s Mead', 'Freya\'s Tears'],
        tamingItem: 'Damp Seaweed',
        image: 'assets/vasen/strandvaskare.png'
    },
    'Draug': {
        name: 'Draug',
        internalName: 'Draug',
        description: 'A pale, bloated corpse that refuses to rest in its grave. The Draug possesses a twisted physical strength and radiates a chilling aura.',
        family: FAMILIES.VALNAD,
        element: ELEMENTS.NATURE,
        rarity: RARITIES.UNCOMMON,
        abilities: ['Ground Stomp', 'Drown', 'Wild Bite', 'Tyr\'s Sacrifice'],
        tamingItem: 'Mound Root',
        image: 'assets/vasen/draug.png'
    },

    // Odjur Family
    'Backahast': {
        name: 'Bäckahäst',
        internalName: 'Backahast',
        description: 'A deceptive, shimmering white horse that offers a tempting ride. Once mounted, it gallops into the deep current to ensure its victim drowns.',
        family: FAMILIES.ODJUR,
        element: ELEMENTS.WATER,
        rarity: RARITIES.UNCOMMON,
        abilities: ['Drown', 'Ground Stomp', 'Thick Coat', 'Wild Bite'],
        tamingItem: 'Drenched Saddle',
        image: 'assets/vasen/backahast.png'
    },
    'Gloson': {
        name: 'Gloson',
        internalName: 'Gloson',
        description: 'A fearsome, gigantic sow with eyes of burning embers. Its monstrous weight travels silently only under the deepest night.',
        family: FAMILIES.ODJUR,
        element: ELEMENTS.FIRE,
        rarity: RARITIES.UNCOMMON,
        abilities: ['Ground Stomp', 'Flaming Skewer', 'Thick Coat', 'Wild Bite'],
        tamingItem: 'Delicate Truffle',
        image: 'assets/vasen/gloson.png'
    },
    'Bjara': {
        name: 'Bjära',
        internalName: 'Bjara',
        description: 'A supernatural construct resembling a hare, fashioned from wood shavings, yarn, and hair. It steals milk from the land and carries it back to its master.',
        family: FAMILIES.ODJUR,
        element: ELEMENTS.NATURE,
        rarity: RARITIES.UNCOMMON,
        abilities: ['Storm Claw', 'Wild Bite', 'Drown', 'Rotvalta'],
        tamingItem: 'Cursed Yarn',
        image: 'assets/vasen/bjara.png'
    },
    'Fenrir': {
        name: 'Fenrir',
        internalName: 'Fenrir',
        description: 'The monstrous wolf bound by the gods. He is destined to shatter his shackles and devour the sun and moon at the end of the world.',
        family: FAMILIES.ODJUR,
        element: ELEMENTS.EARTH,
        rarity: RARITIES.MYTHICAL,
        abilities: ['Storm Claw', 'Wild Bite', 'Thick Coat', 'Ground Stomp'],
        tamingItem: 'Broken Chain',
        image: 'assets/vasen/fenrir.png'
    },
    'Rasvelg': {
        name: 'Räsvelg',
        internalName: 'Rasvelg',
        description: 'A massive eagle perched at the edge of the world. The beating of its colossal wings generates violent winds that sweep across the earth.',
        family: FAMILIES.ODJUR,
        element: ELEMENTS.WIND,
        rarity: RARITIES.MYTHICAL,
        abilities: ['Storm Claw', 'Icicle Spear', 'Thick Coat', 'Sky Dive'],
        tamingItem: 'Eagle Quill',
        image: 'assets/vasen/rasvelg.png'
    },

    // Troll Family
    'Bergatroll': {
        name: 'Bergatroll',
        internalName: 'Bergatroll',
        description: 'A colossal, mountain-dwelling Troll. Slow to rouse, but its rage is devastating, capable of shaking the bedrock. Driven by greed and loves jewelry.',
        family: FAMILIES.TROLL,
        element: ELEMENTS.EARTH,
        rarity: RARITIES.COMMON,
        abilities: ['Ground Stomp', 'Boulder Toss', 'Smithing', 'Rotvalta'],
        tamingItem: 'Silver Necklace',
        image: 'assets/vasen/bergatroll.png'
    },
    'Skogstroll': {
        name: 'Skogstroll',
        internalName: 'Skogstroll',
        description: 'A cunning, savage forest Troll, cloaked in moss and bark. It ambushes weary travelers, its primal howls defining the deepest, untouched woods.',
        family: FAMILIES.TROLL,
        element: ELEMENTS.NATURE,
        rarity: RARITIES.COMMON,
        abilities: ['Vine Whip', 'Landslide', 'Thick Coat', 'Rotvalta'],
        tamingItem: 'Mossy Bark',
        image: 'assets/vasen/skogstroll.png'
    },
    'Bortbyting': {
        name: 'Bortbyting',
        internalName: 'Bortbyting',
        description: 'A sickly, irritable, and demanding Troll child secretly swapped into a human cradle. It carries a malevolent look in its eyes.',
        family: FAMILIES.TROLL,
        element: ELEMENTS.WIND,
        rarity: RARITIES.UNCOMMON,
        abilities: ['Wailing Cry', 'Wild Bite', 'Burning Insult', 'Loki\'s Betrayal'],
        tamingItem: 'Trollmilk Bottle',
        image: 'assets/vasen/bortbyting.png'
    },
    'Gryningstroll': {
        name: 'Gryningstroll',
        internalName: 'Gryningstroll',
        description: 'A hulking Troll caught by the first rays of dawn and turned to stone. Instead of dying, the intense fire in its blood fused with the rock.',
        family: FAMILIES.TROLL,
        element: ELEMENTS.FIRE,
        rarity: RARITIES.UNCOMMON,
        abilities: ['Ground Stomp', 'Lava Jet', 'Thick Coat', 'Tyr\'s Sacrifice'],
        tamingItem: 'Cooling Grease',
        image: 'assets/vasen/gryningstroll.png'
    },
    'Backatroll': {
        name: 'Bäckatroll',
        internalName: 'Backatroll',
        description: 'A moss-covered, ponderous troll dwelling beneath old stone bridges or within rushing streams. A stubborn guardian of the waterway, often demanding a toll.',
        family: FAMILIES.TROLL,
        element: ELEMENTS.WATER,
        rarity: RARITIES.UNCOMMON,
        abilities: ['Drown', 'Tidal Wave', 'Burning Insult', 'Wild Bite'],
        tamingItem: 'Bridge Keystone',
        image: 'assets/vasen/backatroll.png'
    },

    // Rå Family
    'Gruvra': {
        name: 'Gruvrå',
        internalName: 'Gruvra',
        description: 'The beautiful, veiled female warden of the mine. She jealously guards the rich veins of ore and causes immediate cave-ins if her domain is defiled.',
        family: FAMILIES.RA,
        element: ELEMENTS.EARTH,
        rarity: RARITIES.UNCOMMON,
        abilities: ['Sinkhole', 'Lava Jet', 'Enchanting Song', 'Loki\'s Betrayal'],
        tamingItem: 'Mine Lantern',
        image: 'assets/vasen/gruvra.png'
    },
    'Skogsra': {
        name: 'Skogsrå',
        internalName: 'Skogsra',
        description: 'A stunningly beautiful forest warden, whose presence irresistibly draws men deep into the woods to their demise. Her back is often hollow like an old tree trunk.',
        family: FAMILIES.RA,
        element: ELEMENTS.NATURE,
        rarity: RARITIES.UNCOMMON,
        abilities: ['Elven Light', 'Moon Beam', 'Enchanting Song', 'Thick Coat'],
        tamingItem: 'Shed Antlers',
        image: 'assets/vasen/skogsra.png'
    },
    'Nacken': {
        name: 'Näcken',
        internalName: 'Nacken',
        description: 'A male water warden who plays enchanting, sorrowful tunes on his fiddle. His music lures victims into watery graves, and only knowing his songs grants safety.',
        family: FAMILIES.RA,
        element: ELEMENTS.WATER,
        rarity: RARITIES.RARE,
        abilities: ['Drown', 'Moon Beam', 'Enchanting Song', 'Tidal Wave'],
        tamingItem: 'Waterlogged Violin',
        image: 'assets/vasen/nacken.png'
    },
    'Mara': {
        name: 'Mara',
        internalName: 'Mara',
        description: 'A weightless, shifting warden of the twilight, capable of thinning her essence to glide through the smallest cracks. She settles upon the chest of sleeping victims.',
        family: FAMILIES.RA,
        element: ELEMENTS.WIND,
        rarity: RARITIES.RARE,
        abilities: ['Wailing Cry', 'Wind Gust', 'Enchanting Song', 'Loki\'s Betrayal'],
        tamingItem: 'Heavy Pillow',
        image: 'assets/vasen/mara.png'
    },
    'Huldra': {
        name: 'Huldra',
        internalName: 'Huldra',
        description: 'A soot-streaked warden of the charred woods, dwelling where wildfire has cleared the path for new growth. Her eyes that glow like dying embers.',
        family: FAMILIES.RA,
        element: ELEMENTS.FIRE,
        rarity: RARITIES.UNCOMMON,
        abilities: ['Sinkhole', 'Lava Jet', 'Enchanting Song', 'Loki\'s Betrayal'],
        tamingItem: 'Brass Cowbell',
        image: 'assets/vasen/huldra.png'
    },

    // Alv Family
    'Alva': {
        name: 'Älva',
        internalName: 'Alva',
        description: 'A tiny, radiant being that rides high currents and twilight breezes. Known for a capricious nature, it can bring either sudden luck or unexplained sickness.',
        family: FAMILIES.ALV,
        element: ELEMENTS.WIND,
        rarity: RARITIES.UNCOMMON,
        abilities: ['Elven Light', 'Wind Gust', 'Moon Beam', 'Freya\'s Tears'],
        tamingItem: 'Flicker Dust',
        image: 'assets/vasen/alva.png'
    },
    'Dimalva': {
        name: 'Dimälva',
        internalName: 'Dimalva',
        description: 'A tiny being of pure mist that flutters over morning lakes. It weaves a thick supernatural shroud to mask the water\'s edge, luring the unwary toward the reeds.',
        family: FAMILIES.ALV,
        element: ELEMENTS.WATER,
        rarity: RARITIES.UNCOMMON,
        abilities: ['Elven Light', 'Hail Storm', 'Skald\'s Mead', 'Wind Gust'],
        tamingItem: 'Morning Dew',
        image: 'assets/vasen/dimalva.png'
    },
    'Svartalv': {
        name: 'Svartalv',
        internalName: 'Svartalv',
        description: 'Masterful subterranean smiths and craftsmen from Nidavellir. They forge the greatest treasures, weapons, and magical artifacts for the Gods.',
        family: FAMILIES.ALV,
        element: ELEMENTS.EARTH,
        rarity: RARITIES.RARE,
        abilities: ['Sinkhole', 'Landslide', 'Skald\'s Mead', 'Smithing'],
        tamingItem: 'Anvil Shard',
        image: 'assets/vasen/svartalv.png'
    },
    'Ljusalv': {
        name: 'Ljusalv',
        internalName: 'Ljusalv',
        description: 'Beautiful, radiant beings aligned with the Vanir. They embody the brilliance of life, fertility, and the purest magic of creation.',
        family: FAMILIES.ALV,
        element: ELEMENTS.NATURE,
        rarity: RARITIES.RARE,
        abilities: ['Elven Light', 'Hail Storm', 'Moon Beam', 'Freya\'s Tears'],
        tamingItem: 'Festive Midsommarkrans',
        image: 'assets/vasen/ljusalv.png'
    },
    'Dvarg': {
        name: 'Dvärg',
        internalName: 'Dvarg',
        description: 'A master of the forge and close kin to the Svartalv, though where the Svartalv shapes cold stone, the Dvärg commands raw fire to hammer ore into legendary artifacts.',
        family: FAMILIES.ALV,
        element: ELEMENTS.FIRE,
        rarity: RARITIES.RARE,
        abilities: ['Sinkhole', 'Lava Jet', 'Skald\'s Mead', 'Smithing'],
        tamingItem: 'Molten Ore',
        image: 'assets/vasen/dvarg.png'
    },

    // Ande Family
    'Hyllemor': {
        name: 'Hyllemor',
        internalName: 'Hyllemor',
        description: 'The Elder Tree\'s fierce, protective spirit. Fail to ask her permission before cutting, and she will inflict crippling misfortune and devastating sickness on you.',
        family: FAMILIES.ANDE,
        element: ELEMENTS.NATURE,
        rarity: RARITIES.COMMON,
        abilities: ['Vine Whip', 'Landslide', 'Burning Insult', 'Rotvalta'],
        tamingItem: 'Elderflower Sprig',
        image: 'assets/vasen/hyllemor.png'
    },
    'Einharje': {
        name: 'Einhärje',
        internalName: 'Einharje',
        description: 'Deceased warriors dwelling in Valhalla. They feast upon the ever renewing boar Särimner and in train fiercly, preparing for the final battle of Ragnarök.',
        family: FAMILIES.ANDE,
        element: ELEMENTS.EARTH,
        rarity: RARITIES.UNCOMMON,
        abilities: ['Ground Stomp', 'Flaming Skewer', 'Smithing', 'Giantsbane'],
        tamingItem: 'Valhalla Pork',
        image: 'assets/vasen/einharje.png'
    },
    'Valkyria': {
        name: 'Valkyria',
        internalName: 'Valkyria',
        description: 'A powerful, winged shieldmaiden who rides above the battlefield, choosing the bravest of the slain to escort and guide to Valhalla.',
        family: FAMILIES.ANDE,
        element: ELEMENTS.WIND,
        rarity: RARITIES.RARE,
        abilities: ['Sky Dive', 'Icicle Spear', 'Smithing', 'Giantsbane'],
        tamingItem: 'Shield Fragment',
        image: 'assets/vasen/valkyria.png'
    },
    'Fylgja': {
        name: 'Fylgja',
        internalName: 'Fylgja',
        description: 'An ethereal spirit bound to a person\'s soul and destiny. She often manifests within the heat of a battlefield, appearing as a radiant figure to warn of impending danger.',
        family: FAMILIES.ANDE,
        element: ELEMENTS.FIRE,
        rarity: RARITIES.RARE,
        abilities: ['Torch Strike', 'Flaming Skewer', 'Sky Dive', 'Freya\'s Tears'],
        tamingItem: 'Hearth Core',
        image: 'assets/vasen/fylgja.png'
    },
    'Norna': {
        name: 'Norna',
        internalName: 'Norna',
        description: 'The ancient weaver of fate who tends the Wellspring of Urd. Her touch shapes destiny itself, and even the roots of Yggdrasil bend to her will.',
        family: FAMILIES.ANDE,
        element: ELEMENTS.WATER,
        rarity: RARITIES.MYTHICAL,
        abilities: ['Hail Storm', 'Tidal Wave', 'Skald\'s Mead', 'Freya\'s Tears'],
        tamingItem: 'Fate Thread',
        image: 'assets/vasen/norna.png'
    },

    // Jätte Family
    'Jotun': {
        name: 'Jotun',
        internalName: 'Jotun',
        description: 'A colossal giant, the embodiment of strength and raw nature. They are immense humanoids from Jotunhem, driven by primal chaos.',
        family: FAMILIES.JATTE,
        element: ELEMENTS.EARTH,
        rarity: RARITIES.UNCOMMON,
        abilities: ['Ground Stomp', 'Boulder Toss', 'Burning Insult', 'Tyr\'s Sacrifice'],
        tamingItem: 'Giant Rock',
        image: 'assets/vasen/jotun.png'
    },
    'Eldturs': {
        name: 'Eldturs',
        internalName: 'Eldturs',
        description: 'Fearsome, fiery beings from the burning realm of Muspelheim. Their purpose is to raze the world in fire at Ragnarök.',
        family: FAMILIES.JATTE,
        element: ELEMENTS.FIRE,
        rarity: RARITIES.RARE,
        abilities: ['Torch Strike', 'Boulder Toss', 'Smithing', 'Flaming Skewer'],
        tamingItem: 'Glowing Coal',
        image: 'assets/vasen/eldturs.png'
    },
    'Rimturs': {
        name: 'Rimturs',
        internalName: 'Rimturs',
        description: 'The original giants, born from the bitter ice of Nifelhem. They are creatures of cold and mist, perpetually hostile to life and warmth.',
        family: FAMILIES.JATTE,
        element: ELEMENTS.WATER,
        rarity: RARITIES.RARE,
        abilities: ['Drown', 'Icicle Spear', 'Thick Coat', 'Tyr\'s Sacrifice'],
        tamingItem: 'Ice Crystal',
        image: 'assets/vasen/rimturs.png'
    },
    'Jarnvidja': {
        name: 'Järnvidja',
        internalName: 'Jarnvidja',
        description: 'A fearsome giantess of the primordial Iron Forest. She breeds the wolves of chaos and guards the gnarled, ancient thickets with unnatural strength.',
        family: FAMILIES.JATTE,
        element: ELEMENTS.NATURE,
        rarity: RARITIES.UNCOMMON,
        abilities: ['Vine Whip', 'Boulder Toss', 'Thick Coat', 'Rotvalta'],
        tamingItem: 'Ancient Log',
        image: 'assets/vasen/jarnvidja.png'
    },
    'Stormturs': {
        name: 'Stormturs',
        internalName: 'Stormturs',
        description: 'A towering force of nature with eyes like thunderheads that can shatter stone pillars with a single glance. His presence is felt in the bone-chilling whistle of the gale.',
        family: FAMILIES.JATTE,
        element: ELEMENTS.WIND,
        rarity: RARITIES.RARE,
        abilities: ['Sky Dive', 'Boulder Toss', 'Burning Insult', 'Tyr\'s Sacrifice'],
        tamingItem: 'Shattered Pillar',
        image: 'assets/vasen/stormturs.png'
    },

    // Drake Family
    'Lindorm': {
        name: 'Lindorm',
        internalName: 'Lindorm',
        description: 'A massive, serpentine creature with a horse-like mane. Though wingless, this great serpent is a formidable cousin to the dragons.',
        family: FAMILIES.DRAKE,
        element: ELEMENTS.NATURE,
        rarity: RARITIES.COMMON,
        abilities: ['Fire Breath', 'Wild Bite', 'Thick Coat', 'Rotvalta'],
        tamingItem: 'Shedded Scale',
        image: 'assets/vasen/lindorm.png'
    },
    'Fafner': {
        name: 'Fafner',
        internalName: 'Fafner',
        description: 'A dreadful, cursed dragon who guards a priceless golden hoard. Consuming his heart grants great wisdom and the ability to understand all tongues.',
        family: FAMILIES.DRAKE,
        element: ELEMENTS.FIRE,
        rarity: RARITIES.RARE,
        abilities: ['Fire Breath', 'Lava Jet', 'Wild Bite', 'Giantsbane'],
        tamingItem: 'Gold Coin',
        image: 'assets/vasen/fafner.png'
    },
    'Vitorm': {
        name: 'Vitorm',
        internalName: 'Vitorm',
        description: 'The snow-white fabled royalty of Snakes, Legends claim that those who consume its essence learn the language of birds and secrets of the earth.',
        family: FAMILIES.DRAKE,
        element: ELEMENTS.WIND,
        rarity: RARITIES.RARE,
        abilities: ['Fire Breath', 'Wind Gust', 'Wild Bite', 'Tyr\'s Sacrifice'],
        tamingItem: 'White Scales',
        image: 'assets/vasen/vitorm.png'
    },
    'Jormungandr': {
        name: 'Jörmungandr',
        internalName: 'Jormungandr',
        description: 'The monstrous serpent whose infinite coils encircle Midgard, resting in the primordial ocean and awaiting its final battle.',
        family: FAMILIES.DRAKE,
        element: ELEMENTS.WATER,
        rarity: RARITIES.MYTHICAL,
        abilities: ['Drown', 'Wild Bite', 'Tidal Wave', 'Landslide'],
        tamingItem: 'Fishing Hook',
        image: 'assets/vasen/jormungandr.png'
    },
    'Nidhogg': {
        name: 'Nidhögg',
        internalName: 'Nidhogg',
        description: 'A terrifying dragon that perpetually gnaws at the lowest roots of Yggdrasil, constantly threatening the stability of the entire cosmos.',
        family: FAMILIES.DRAKE,
        element: ELEMENTS.EARTH,
        rarity: RARITIES.MYTHICAL,
        abilities: ['Fire Breath', 'Landslide', 'Wild Bite', 'Rotvalta'],
        tamingItem: 'Yggdrasil Root',
        image: 'assets/vasen/nidhogg.png'
    }
};

// List of all Väsen internal names for easy iteration
const VASEN_LIST = Object.keys(VASEN_SPECIES);

// Get all Väsen of a specific rarity
function getVasenByRarity(rarity) {
    return VASEN_LIST.filter(name => VASEN_SPECIES[name].rarity === rarity);
}

// Get all Väsen of a specific element
function getVasenByElement(element) {
    return VASEN_LIST.filter(name => VASEN_SPECIES[name].element === element);
}

// Get all Väsen of a specific family
function getVasenByFamily(family) {
    return VASEN_LIST.filter(name => VASEN_SPECIES[name].family === family);
}

// Get all mythical Väsen
function getMythicalVasen() {
    return getVasenByRarity(RARITIES.MYTHICAL);
}

// Check if a species is mythical
function isMythical(speciesName) {
    const species = VASEN_SPECIES[speciesName];
    return species && species.rarity === RARITIES.MYTHICAL;
}

// Get a random Väsen from a zone's spawn list
function getRandomSpawnFromZone(zoneKey) {
    const zone = ZONES[zoneKey];
    if (!zone) return null;
    
    let spawns;
    if (zone.spawns === 'ALL') {
        spawns = VASEN_LIST;
    } else {
        spawns = zone.spawns;
    }
    
    // Group by rarity
    const byRarity = {
        [RARITIES.COMMON]: [],
        [RARITIES.UNCOMMON]: [],
        [RARITIES.RARE]: [],
        [RARITIES.MYTHICAL]: []
    };
    
    spawns.forEach(name => {
        const species = VASEN_SPECIES[name];
        if (species) {
            byRarity[species.rarity].push(name);
        }
    });
    
    // Roll for rarity
    const roll = Math.random();
    let cumulative = 0;
    let selectedRarity = RARITIES.COMMON;
    
    for (const rarity of [RARITIES.COMMON, RARITIES.UNCOMMON, RARITIES.RARE, RARITIES.MYTHICAL]) {
        cumulative += ENCOUNTER_RATES[rarity];
        if (roll < cumulative && byRarity[rarity].length > 0) {
            selectedRarity = rarity;
            break;
        }
    }
    
    // If no Väsen of selected rarity, fall back to any available
    let pool = byRarity[selectedRarity];
    if (pool.length === 0) {
        pool = spawns;
    }
    
    return pool[Math.floor(Math.random() * pool.length)];
}

// Get random level within zone range
function getRandomLevelForZone(zoneKey) {
    const zone = ZONES[zoneKey];
    if (!zone) return 1;
    const [min, max] = zone.levelRange;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
