// =============================================================================
// 3-data-vasen.js - All Väsen Species Definitions
// =============================================================================

const VASEN_SPECIES = {
    // Alv Family
    'Svartalv': {
        name: 'Svartalv',
        internalName: 'Svartalv',
        description: 'A masterful subterranean artisan from Nidavellir who seeks rare materials and crafts magical artifacts that bend the rules of reality.',
        family: FAMILIES.ALV,
        element: ELEMENTS.EARTH,
        rarity: RARITIES.UNCOMMON,
        skills: ['Sinkhole', 'Lava Jet', 'Smithing', 'Landslide'],
        tamingItem: 'Shiny Trinket',
        image: 'assets/vasen/svartalv.png'
    },
    'Dvarg': {
        name: 'Dvärg',
        internalName: 'Dvarg',
        description: 'A renowned smith from the fiery heart of the mountain, forging legendary weapons from stone and ore with unmatched skill.',
        family: FAMILIES.ALV,
        element: ELEMENTS.FIRE,
        rarity: RARITIES.RARE,
        skills: ['Flaming Skewer', 'Icicle Spear', 'Smithing', 'Giantsbane'],
        tamingItem: 'Anvil Shard',
        image: 'assets/vasen/dvarg.png'
    },
    'Ljusalv': {
        name: 'Ljusalv',
        internalName: 'Ljusalv',
        description: 'A radiant light elf aligned with the Vanir, embodying life, fertility, and the creative power woven through the world.',
        family: FAMILIES.ALV,
        element: ELEMENTS.NATURE,
        rarity: RARITIES.RARE,
        skills: ['Elven Light', 'Moon Beam', 'Skald\'s Mead', 'Freya\'s Tears'],
        tamingItem: 'Festive Midsommarkrans',
        image: 'assets/vasen/ljusalv.png'
    },
    'Dimalva': {
        name: 'Dimälva',
        internalName: 'Dimalva',
        description: 'A minuscule mist elf fluttering above lakes at dawn, weaving dense fog across the shoreline and drawing the unwary toward the reeds.',
        family: FAMILIES.ALV,
        element: ELEMENTS.WATER,
        rarity: RARITIES.UNCOMMON,
        skills: ['Hail Storm', 'Elven Light', 'Skald\'s Mead', 'Wind Gust'],
        tamingItem: 'Morning Dew',
        image: 'assets/vasen/dimalva.png'
    },
    'Alva': {
        name: 'Älva',
        internalName: 'Alva',
        description: 'A tiny twilight elf carried upon high currents and evening breezes, leaving behind sudden luck or ill fortune while passing through.',
        family: FAMILIES.ALV,
        element: ELEMENTS.WIND,
        rarity: RARITIES.UNCOMMON,
        skills: ['Elven Light', 'Wind Gust', 'Skald\'s Mead', 'Moon Beam'],
        tamingItem: 'Flicker Dust',
        image: 'assets/vasen/alva.png'
    },

    // Ande Family
    'Einharje': {
        name: 'Einhärje',
        internalName: 'Einharje',
        description: 'A deceased valiant warrior dwelling in Valhalla, feasting upon Särimner while preparing endlessly for the great clash.',
        family: FAMILIES.ANDE,
        element: ELEMENTS.EARTH,
        rarity: RARITIES.RARE,
        skills: ['Ground Stomp', 'Flaming Skewer', 'Smithing', 'Giantsbane'],
        tamingItem: 'Valhallan Pork',
        image: 'assets/vasen/einharje.png'
    },
    'Fylgja': {
        name: 'Fylgja',
        internalName: 'Fylgja',
        description: 'An avatar of fate bound to a person\'s soul and destiny, appearing during battle to warn of danger and approaching death.',
        family: FAMILIES.ANDE,
        element: ELEMENTS.FIRE,
        rarity: RARITIES.RARE,
        skills: ['Flaming Skewer', 'Sky Dive', 'Enchanting Song', 'Freya\'s Tears'],
        tamingItem: 'Soul Flame',
        image: 'assets/vasen/fylgja.png'
    },
    'Hyllemor': {
        name: 'Hyllemor',
        internalName: 'Hyllemor',
        description: 'A fierce protective spirit of the Elder Tree, inflicting crippling misfortune upon anyone who cuts sacred branches without permission.',
        family: FAMILIES.ANDE,
        element: ELEMENTS.NATURE,
        rarity: RARITIES.COMMON,
        skills: ['Vine Whip', 'Landslide', 'Burning Insult', 'Rotvalta'],
        tamingItem: 'Elderflower Sprig',
        image: 'assets/vasen/hyllemor.png'
    },
    'Norna': {
        name: 'Norna',
        internalName: 'Norna',
        description: 'A mystical fate weaver among those who guard the sacred Wellspring of Urd, charting the threads of destiny for all mortals.',
        family: FAMILIES.ANDE,
        element: ELEMENTS.WATER,
        rarity: RARITIES.RARE,
        skills: ['Tidal Wave', 'Moon Beam', 'Skald\'s Mead', 'Freya\'s Tears'],
        tamingItem: 'Fate Thread',
        image: 'assets/vasen/norna.png'
    },
    'Valkyria': {
        name: 'Valkyria',
        internalName: 'Valkyria',
        description: 'A formidable winged battle judge who rides above the battlefield, choosing the bravest fallen warriors and guiding them to Valhalla.',
        family: FAMILIES.ANDE,
        element: ELEMENTS.WIND,
        rarity: RARITIES.RARE,
        skills: ['Sky Dive', 'Icicle Spear', 'Smithing', 'Giantsbane'],
        tamingItem: 'Shield Fragment',
        image: 'assets/vasen/valkyria.png'
    },

    // Drake Family
    'Lindorm': {
        name: 'Lindorm',
        internalName: 'Lindorm',
        description: 'A slithering wild serpent crowned with a horse-like mane. Wingless yet formidable, it stands among the greatest cousins of dragons.',
        family: FAMILIES.DRAKE,
        element: ELEMENTS.EARTH,
        rarity: RARITIES.COMMON,
        skills: ['Fire Breath', 'Sinkhole', 'Storm Claw', 'Wild Bite'],
        tamingItem: 'Shedded Scale',
        image: 'assets/vasen/lindorm.png'
    },
    'Fafner': {
        name: 'Fafner',
        internalName: 'Fafner',
        description: 'The dreadful serpent of legends, cursed by greed and obsession, guarding vast piles of stolen treasure claimed through fear and bloodshed.',
        family: FAMILIES.DRAKE,
        element: ELEMENTS.FIRE,
        rarity: RARITIES.MYTHICAL,
        skills: ['Fire Breath', 'Lava Jet', 'Wild Bite', 'Giantsbane'],
        tamingItem: 'Gold Coin',
        image: 'assets/vasen/fafner.png'
    },
    'Nidhogg': {
        name: 'Nidhögg',
        internalName: 'Nidhogg',
        description: 'The terrifying serpent that gnaws endlessly at the roots of Yggdrasil, threatening the stability of the cosmos through a relentless hunger.',
        family: FAMILIES.DRAKE,
        element: ELEMENTS.NATURE,
        rarity: RARITIES.MYTHICAL,
        skills: ['Fire Breath', 'Vine Whip', 'Landslide', 'Rotvalta'],
        tamingItem: 'Yggdrasil Root',
        image: 'assets/vasen/nidhogg.png'
    },
    'Jormungandr': {
        name: 'Jörmungandr',
        internalName: 'Jormungandr',
        description: 'The boundless serpent whose endless coils encircle Midgård, resting within the primordial ocean while awaiting the final battle.',
        family: FAMILIES.DRAKE,
        element: ELEMENTS.WATER,
        rarity: RARITIES.MYTHICAL,
        skills: ['Drown', 'Wild Bite', 'Tidal Wave', 'Landslide'],
        tamingItem: 'Fishing Hook',
        image: 'assets/vasen/jormungandr.png'
    },
    'Vitorm': {
        name: 'Vitorm',
        internalName: 'Vitorm',
        description: 'A snow-white serpent sovereign whose legendary flesh reveals hidden secrets and the ability to understand all tongues when consumed.',
        family: FAMILIES.DRAKE,
        element: ELEMENTS.WIND,
        rarity: RARITIES.RARE,
        skills: ['Fire Breath', 'Wind Gust', 'Wild Bite', 'Tyr\'s Sacrifice'],
        tamingItem: 'White Scales',
        image: 'assets/vasen/vitorm.png'
    },

    // Jätte Family
    'Jotun': {
        name: 'Jotun',
        internalName: 'Jotun',
        description: 'A mighty giant embodying immense strength and untamed terrain, manifesting as an enormous humanoid from Jotunheim driven by primordial chaos.',
        family: FAMILIES.JATTE,
        element: ELEMENTS.EARTH,
        rarity: RARITIES.UNCOMMON,
        skills: ['Ground Stomp', 'Boulder Toss', 'Burning Insult', 'Tyr\'s Sacrifice'],
        tamingItem: 'Giant Rock',
        image: 'assets/vasen/jotun.png'
    },
    'Eldturs': {
        name: 'Eldturs',
        internalName: 'Eldturs',
        description: 'A destructive fire giant from the burning realm of Muspelheim, destined to engulf everything in flame at the end of the world.',
        family: FAMILIES.JATTE,
        element: ELEMENTS.FIRE,
        rarity: RARITIES.RARE,
        skills: ['Torch Strike', 'Boulder Toss', 'Smithing', 'Flaming Skewer'],
        tamingItem: 'Glowing Coal',
        image: 'assets/vasen/eldturs.png'
    },
    'Jarnvidja': {
        name: 'Järnvidja',
        internalName: 'Jarnvidja',
        description: 'A grim iron wood giantess who breeds the wolves of chaos, guarding ancient thickets with relentless strength and fierce determination.',
        family: FAMILIES.JATTE,
        element: ELEMENTS.NATURE,
        rarity: RARITIES.UNCOMMON,
        skills: ['Vine Whip', 'Boulder Toss', 'Thick Coat', 'Rotvalta'],
        tamingItem: 'Ancient Log',
        image: 'assets/vasen/jarnvidja.png'
    },
    'Rimturs': {
        name: 'Rimturs',
        internalName: 'Rimturs',
        description: 'A legendary frost giant born from the bitter ice of Niflheim, dwelling among cold and mist while remaining hostile to life and warmth.',
        family: FAMILIES.JATTE,
        element: ELEMENTS.WATER,
        rarity: RARITIES.RARE,
        skills: ['Icicle Spear', 'Boulder Toss', 'Thick Coat', 'Tyr\'s Sacrifice'],
        tamingItem: 'Ice Crystal',
        image: 'assets/vasen/rimturs.png'
    },
    'Stormturs': {
        name: 'Stormturs',
        internalName: 'Stormturs',
        description: 'A towering storm giant with eyes resembling thunderheads, shattering stone pillars and announcing a destructive arrival through piercing winds.',
        family: FAMILIES.JATTE,
        element: ELEMENTS.WIND,
        rarity: RARITIES.RARE,
        skills: ['Sky Dive', 'Ground Stomp', 'Boulder Toss', 'Tyr\'s Sacrifice'],
        tamingItem: 'Shattered Pillar',
        image: 'assets/vasen/stormturs.png'
    },

    // Odjur Family
    'Fenrir': {
        name: 'Fenrir',
        internalName: 'Fenrir',
        description: 'The monstrous wolf bound by the gods, destined to break free and devour the sun and moon during ragnarök.',
        family: FAMILIES.ODJUR,
        element: ELEMENTS.EARTH,
        rarity: RARITIES.MYTHICAL,
        skills: ['Ground Stomp', 'Storm Claw', 'Thick Coat', 'Wild Bite'],
        tamingItem: 'Broken Chain',
        image: 'assets/vasen/fenrir.png'
    },
    'Gloson': {
        name: 'Gloson',
        internalName: 'Gloson',
        description: 'A gigantic nocturnal sow with eyes glowing like embers, moving through the deepest night with astonishing silence despite an immense size.',
        family: FAMILIES.ODJUR,
        element: ELEMENTS.FIRE,
        rarity: RARITIES.UNCOMMON,
        skills: ['Ground Stomp', 'Flaming Skewer', 'Thick Coat', 'Wild Bite'],
        tamingItem: 'Delicate Truffle',
        image: 'assets/vasen/gloson.png'
    },
    'Bjara': {
        name: 'Bjära',
        internalName: 'Bjara',
        description: 'A supernatural familiar resembling a hare, stealing milk from nearby farms and carrying every drop back to a chosen master.',
        family: FAMILIES.ODJUR,
        element: ELEMENTS.NATURE,
        rarity: RARITIES.UNCOMMON,
        skills: ['Storm Claw', 'Vine Whip', 'Thick Coat', 'Wild Bite'],
        tamingItem: 'Cursed Yarn',
        image: 'assets/vasen/bjara.png'
    },
    'Backahast': {
        name: 'Bäckahäst',
        internalName: 'Backahast',
        description: 'A deceptive white horse that offers a tempting ride, carrying riders into deep water where escape becomes impossible.',
        family: FAMILIES.ODJUR,
        element: ELEMENTS.WATER,
        rarity: RARITIES.UNCOMMON,
        skills: ['Drown', 'Ground Stomp', 'Thick Coat', 'Wild Bite'],
        tamingItem: 'Drenched Saddle',
        image: 'assets/vasen/backahast.png'
    },
    'Rasvelg': {
        name: 'Räsvelg',
        internalName: 'Rasvelg',
        description: 'The massive eagle perched at the edge of the world, whose colossal wings drive violent winds across mountains, plains, and seas.',
        family: FAMILIES.ODJUR,
        element: ELEMENTS.WIND,
        rarity: RARITIES.MYTHICAL,
        skills: ['Storm Claw', 'Icicle Spear', 'Thick Coat', 'Sky Dive'],
        tamingItem: 'Eagle Quill',
        image: 'assets/vasen/rasvelg.png'
    },

    // Oknytt Family
    'Landvatte': {
        name: 'Landvätte',
        internalName: 'Landvatte',
        description: 'A hidden protector of the land bound to the soil itself, ensuring prosperity but answering neglect with irritating tricks.',
        family: FAMILIES.OKNYTT,
        element: ELEMENTS.EARTH,
        rarity: RARITIES.COMMON,
        skills: ['Torch Strike', 'Sinkhole', 'Burning Insult', 'Landslide'],
        tamingItem: 'Sturdy Spade',
        image: 'assets/vasen/landvatte.png'
    },
    'Hustomte': {
        name: 'Hustomte',
        internalName: 'Hustomte',
        description: 'A watchful steward who keeps the home safe and warm, despising laziness and carelessness, and answering both with wicked mischief.',
        family: FAMILIES.OKNYTT,
        element: ELEMENTS.FIRE,
        rarity: RARITIES.COMMON,
        skills: ['Torch Strike', 'Flaming Skewer', 'Smithing', 'Burning Insult'],
        tamingItem: 'Warm Tomtegrot',
        image: 'assets/vasen/hustomte.png'
    },
    'Gardstomte': {
        name: 'Gårdstomte',
        internalName: 'Gardstomte',
        description: 'A sharp-eyed custodian of barns and gardens, rewarding tidy grounds with good fortune but unleashing spiteful pranks when offended.',
        family: FAMILIES.OKNYTT,
        element: ELEMENTS.NATURE,
        rarity: RARITIES.COMMON,
        skills: ['Torch Strike', 'Vine Whip', 'Smithing', 'Rotvalta'],
        tamingItem: 'Garden Rake',
        image: 'assets/vasen/gardstomte.png'
    },
    'Brunnsgubbe': {
        name: 'Brunnsgubbe',
        internalName: 'Brunnsgubbe',
        description: 'A reclusive well keeper who keeps water pure and clear, demanding clean surroundings but resorting to petty malice when displeased.',
        family: FAMILIES.OKNYTT,
        element: ELEMENTS.WATER,
        rarity: RARITIES.COMMON,
        skills: ['Sinkhole', 'Hail Storm', 'Skald\'s Mead', 'Tidal Wave'],
        tamingItem: 'Water Bucket',
        image: 'assets/vasen/brunnsgubbe.png'
    },
    'Pyssling': {
        name: 'Pyssling',
        internalName: 'Pyssling',
        description: 'A pocket-sized lurker bound to high beams and dusty lofts, offering help when respected but causing subtle trouble when neglected.',
        family: FAMILIES.OKNYTT,
        element: ELEMENTS.WIND,
        rarity: RARITIES.UNCOMMON,
        skills: ['Wailing Cry', 'Wind Gust', 'Burning Insult', 'Tyr\'s Sacrifice'],
        tamingItem: 'Attic Key',
        image: 'assets/vasen/pyssling.png'
    },

    // Rå Family
    'Gruvra': {
        name: 'Gruvrå',
        internalName: 'Gruvra',
        description: 'A beautiful, veiled mine warden who guards rich veins of ore deep within the mountain, where tunnels collapse if sacred passages are defiled.',
        family: FAMILIES.RA,
        element: ELEMENTS.EARTH,
        rarity: RARITIES.UNCOMMON,
        skills: ['Sinkhole', 'Lava Jet', 'Enchanting Song', 'Loki\'s Betrayal'],
        tamingItem: 'Mine Lantern',
        image: 'assets/vasen/gruvra.png'
    },
    'Huldra': {
        name: 'Huldra',
        internalName: 'Huldra',
        description: 'A soot-streaked warden dwelling among charred groves and burned clearings, her glowing eyes shining like fading embers among blackened trees.',
        family: FAMILIES.RA,
        element: ELEMENTS.FIRE,
        rarity: RARITIES.UNCOMMON,
        skills: ['Sinkhole', 'Lava Jet', 'Burning Insult', 'Loki\'s Betrayal'],
        tamingItem: 'Brass Cowbell',
        image: 'assets/vasen/huldra.png'
    },
    'Skogsra': {
        name: 'Skogsrå',
        internalName: 'Skogsra',
        description: 'A stunning forest warden whose beauty draws wanderers deep among the trees, though a hollow back reveals a sinister nature.',
        family: FAMILIES.RA,
        element: ELEMENTS.NATURE,
        rarity: RARITIES.UNCOMMON,
        skills: ['Elven Light', 'Moon Beam', 'Thick Coat', 'Enchanting Song'],
        tamingItem: 'Shed Antlers',
        image: 'assets/vasen/skogsra.png'
    },
    'Nacken': {
        name: 'Näcken',
        internalName: 'Nacken',
        description: 'A river warden who plays enchanting, sorrowful melodies upon a fiddle, luring listeners toward watery graves through irresistible music.',
        family: FAMILIES.RA,
        element: ELEMENTS.WATER,
        rarity: RARITIES.RARE,
        skills: ['Drown', 'Tidal Wave', 'Enchanting Song', 'Loki\'s Betrayal'],
        tamingItem: 'Waterlogged Violin',
        image: 'assets/vasen/nacken.png'
    },
    'Mara': {
        name: 'Mara',
        internalName: 'Mara',
        description: 'A shifting dream warden capable of slipping through narrow cracks, settling upon sleeping victims and burdening every breath with a crushing weight.',
        family: FAMILIES.RA,
        element: ELEMENTS.WIND,
        rarity: RARITIES.RARE,
        skills: ['Wailing Cry', 'Wind Gust', 'Enchanting Song', 'Loki\'s Betrayal'],
        tamingItem: 'Heavy Pillow',
        image: 'assets/vasen/mara.png'
    },

    // Troll Family
    'Bergatroll': {
        name: 'Bergatroll',
        internalName: 'Bergatroll',
        description: 'A colossal mountain troll driven by greed and a love for jewelry, slow to anger but capable of shaking bedrock when enraged.',
        family: FAMILIES.TROLL,
        element: ELEMENTS.EARTH,
        rarity: RARITIES.COMMON,
        skills: ['Ground Stomp', 'Boulder Toss', 'Smithing', 'Rotvalta'],
        tamingItem: 'Silver Necklace',
        image: 'assets/vasen/bergatroll.png'
    },
    'Gryningstroll': {
        name: 'Gryningstroll',
        internalName: 'Gryningstroll',
        description: 'A hulking troll caught by the first rays of dawn and turned to stone, the intense internal fire merging blood with surrounding rock.',
        family: FAMILIES.TROLL,
        element: ELEMENTS.FIRE,
        rarity: RARITIES.UNCOMMON,
        skills: ['Ground Stomp', 'Lava Jet', 'Thick Coat', 'Tyr\'s Sacrifice'],
        tamingItem: 'Cooling Grease',
        image: 'assets/vasen/gryningstroll.png'
    },
    'Skogstroll': {
        name: 'Skogstroll',
        internalName: 'Skogstroll',
        description: 'A cunning forest troll cloaked in moss and bark, ambushing weary travelers while savage howls echo through untamed woodlands.',
        family: FAMILIES.TROLL,
        element: ELEMENTS.NATURE,
        rarity: RARITIES.COMMON,
        skills: ['Vine Whip', 'Landslide', 'Thick Coat', 'Rotvalta'],
        tamingItem: 'Mossy Bark',
        image: 'assets/vasen/skogstroll.png'
    },
    'Backatroll': {
        name: 'Bäckatroll',
        internalName: 'Backatroll',
        description: 'A moss-covered troll dwelling beneath old bridges in rushing streams, guarding waterways with stubborn determination while demanding passage tolls.',
        family: FAMILIES.TROLL,
        element: ELEMENTS.WATER,
        rarity: RARITIES.COMMON,
        skills: ['Drown', 'Tidal Wave', 'Ground Stomp', 'Boulder Toss'],
        tamingItem: 'Bridge Keystone',
        image: 'assets/vasen/backatroll.png'
    },
    'Bortbyting': {
        name: 'Bortbyting',
        internalName: 'Bortbyting',
        description: 'A sickly, irritable troll secretly placed in a human cradle, bearing a malevolent gaze and a demanding temperament.',
        family: FAMILIES.TROLL,
        element: ELEMENTS.WIND,
        rarity: RARITIES.UNCOMMON,
        skills: ['Wailing Cry', 'Wild Bite', 'Burning Insult', 'Loki\'s Betrayal'],
        tamingItem: 'Trollmilk Bottle',
        image: 'assets/vasen/bortbyting.png'
    },

    // Vålnad Family
    'Myling': {
        name: 'Myling',
        internalName: 'Myling',
        description: 'A perpetually wailing, agonized phantom of a forsaken infant, abandoned or wrongfully slain before receiving a proper burial.',
        family: FAMILIES.VALNAD,
        element: ELEMENTS.EARTH,
        rarity: RARITIES.COMMON,
        skills: ['Sinkhole', 'Wailing Cry', 'Landslide', 'Freya\'s Tears'],
        tamingItem: 'Burial Flowers',
        image: 'assets/vasen/myling.png'
    },
    'Irrbloss': {
        name: 'Irrbloss',
        internalName: 'Irrbloss',
        description: 'A ghastly, hovering phantom that leads travelers astray into bogs, rumored to be the soul of a greedy man trapped between realms.',
        family: FAMILIES.VALNAD,
        element: ELEMENTS.FIRE,
        rarity: RARITIES.UNCOMMON,
        skills: ['Fire Breath', 'Elven Light', 'Hail Storm', 'Wailing Cry'],
        tamingItem: 'Ghastly Lantern',
        image: 'assets/vasen/irrbloss.png'
    },
    'Draug': {
        name: 'Draug',
        internalName: 'Draug',
        description: 'A pale, bloated phantom that refuses to rest in the grave, possessing unnatural strength and radiating a cold, unsettling presence.',
        family: FAMILIES.VALNAD,
        element: ELEMENTS.NATURE,
        rarity: RARITIES.UNCOMMON,
        skills: ['Ground Stomp', 'Vine Whip', 'Wild Bite', 'Tyr\'s Sacrifice'],
        tamingItem: 'Mound Root',
        image: 'assets/vasen/draug.png'
    },
    'Strandvaskare': {
        name: 'Strandvaskare',
        internalName: 'Strandvaskare',
        description: 'A tormented phantom of a drowned sailor, forever haunting the coast and luring ships onto reefs with mournful cries and deceptive lights.',
        family: FAMILIES.VALNAD,
        element: ELEMENTS.WATER,
        rarity: RARITIES.COMMON,
        skills: ['Drown', 'Tidal Wave', 'Elven Light', 'Wind Gust'],
        tamingItem: 'Damp Seaweed',
        image: 'assets/vasen/strandvaskare.png'
    },
    'Nattramn': {
        name: 'Nattramn',
        internalName: 'Nattramn',
        description: 'A shrieking, spectral form of a raven and restless phantom of a soul denied peace, casting dark omens across lonely skies.',
        family: FAMILIES.VALNAD,
        element: ELEMENTS.WIND,
        rarity: RARITIES.COMMON,
        skills: ['Storm Claw', 'Icicle Spear', 'Burning Insult', 'Sky Dive'],
        tamingItem: 'Black Feather',
        image: 'assets/vasen/nattramn.png'
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