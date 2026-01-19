// =============================================================================
// 4-data-items.js - Items and Runes Definitions
// =============================================================================

const ITEM_TYPES = {
    TAMING: 'Taming Item'
};

const TAMING_ITEMS = {
    'Sturdy Spade': {
        name: 'Sturdy Spade',
        description: 'A sturdy Spade. The well-worn wooden handle and polished steel blade look perfect for turning earth, an ideal offering for a diligently working, unseen guardian of the land. It can either be offered to wild väsen or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a sturdy Spade. The well-worn wooden handle and polished steel blade look perfect for turning earth, an ideal offering for a diligently working, unseen guardian of the land.',
        tamingTarget: 'Landvatte'
    },
    'Garden Rake': {
        name: 'Garden Rake',
        description: 'A weathered Garden Rake. It seems useful for tending to a farm, perhaps attracting a careful, bearded guardian. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a weathered Garden Rake. It seems useful for tending to a farm, perhaps attracting a careful, bearded guardian.',
        tamingTarget: 'Gardstomte'
    },
    'Warm Tomtegrot': {
        name: 'Warm Tomtegröt',
        description: 'A bowl of fresh Tomtegröt. The sweet smell might attract a watchful house spirit who loves this offering. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a bowl of fresh Tomtegröt. The sweet smell might attract a watchful house spirit who loves this offering.',
        tamingTarget: 'Hustomte'
    },
    'Black Feather': {
        name: 'Black Feather',
        description: 'A large Black Feather. It carries an eerie silence, likely shed by a spectral, shrieking raven. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a large Black Feather. It carries an eerie silence, likely shed by a spectral, shrieking raven. You should give it to a Väsen that could use it.',
        tamingTarget: 'Nattramn'
    },
    'Burial Flowers': {
        name: 'Burial Flowers',
        description: 'A small bouquet of Burial Flowers. Their scent is mournful, calling out to a lost, wailing infant spirit. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a small bouquet of Burial Flowers. Their scent is mournful, calling out to a lost, wailing infant spirit.',
        tamingTarget: 'Myling'
    },
    'Ghastly Lantern': {
        name: 'Ghastly Lantern',
        description: 'A sputtering Ghastly Lantern. Its light is faint and misleading, a lure for a wandering, fire-aligned spirit. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a sputtering Ghastly Lantern. Its light is faint and misleading, a lure for a wandering, fire-aligned spirit.',
        tamingTarget: 'Irrbloss'
    },
    'Damp Seaweed': {
        name: 'Damp Seaweed',
        description: 'A clump of Damp Seaweed. It smells strongly of the sea, a sign of a drowned sailor\'s haunting cry. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a clump of Damp Seaweed. It smells strongly of the sea, a sign of a drowned sailor\'s haunting cry.',
        tamingTarget: 'Strandvaskare'
    },
    'Drenched Saddle': {
        name: 'Drenched Saddle',
        description: 'A glistening Drenched Saddle. Be cautious; a deceptive white horse might be nearby, looking for a rider. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a glistening Drenched Saddle. Be cautious; a deceptive white horse might be nearby, looking for a rider.',
        tamingTarget: 'Backahast'
    },
    'Delicate Truffle': {
        name: 'Delicate Truffle',
        description: 'A rare, pale fungus with a rich aroma. It\'s a highly prized delicacy that makes a nocturnal grazer drop its guard and follow its nose. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a rare, pale fungus with a rich aroma. It\'s a highly prized delicacy that makes a nocturnal grazer drop its guard and follow its nose.',
        tamingTarget: 'Gloson'
    },
    'Broken Chain': {
        name: 'Broken Chain',
        description: 'A piece of a mighty Broken Chain. The metal pulses with immense, restrained power - a sign of the great wolf. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a piece of a mighty Broken Chain. The metal pulses with immense, restrained power - a sign of the great wolf.',
        tamingTarget: 'Fenrir'
    },
    'Eagle Quill': {
        name: 'Eagle Quill',
        description: 'A massive Eagle Quill. It feels impossibly light; a feather from the creator of the world\'s winds. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a massive Eagle Quill. It feels impossibly light; a feather from the creator of the world\'s winds.',
        tamingTarget: 'Rasvelg'
    },
    'Silver Necklace': {
        name: 'Silver Necklace',
        description: 'A dazzling silver necklace. Perhaps a greedy mountain-dwelling giant dropped it while passing through. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a dazzling Silver Necklace. Perhaps a greedy mountain-dwelling giant dropped it while passing through.',
        tamingTarget: 'Bergatroll'
    },
    'Mossy Bark': {
        name: 'Mossy Bark',
        description: 'A thick piece of Mossy Bark. It\'s the perfect camouflage for a cunning forest Troll. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a thick piece of Mossy Bark. It\'s the perfect camouflage for a cunning forest Troll.',
        tamingTarget: 'Skogstroll'
    },
    'Trollmilk Bottle': {
        name: 'Trollmilk Bottle',
        description: 'A strange, small Trollmilk Bottle. It seems to have been left by a sickly, irritable changeling child. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a strange, small Trollmilk Bottle. It seems to have been left by a sickly, irritable changeling child.',
        tamingTarget: 'Bortbyting'
    },
    'Mine Lantern': {
        name: 'Mine Lantern',
        description: 'A sturdy Mine Lantern. The light might please the beautiful spirit who guards the deep veins of ore. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a sturdy Mine Lantern. The light might please the beautiful spirit who guards the deep veins of ore.',
        tamingTarget: 'Gruvra'
    },
    'Shed Antlers': {
        name: 'Shed Antlers',
        description: 'A set of Shed Antlers. They whisper of the deep woods and the alluring, yet dangerous, spirit of the forest. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a set of Shed Antlers. They whisper of the deep woods and the alluring, yet dangerous, spirit of the forest.',
        tamingTarget: 'Skogsra'
    },
    'Waterlogged Violin': {
        name: 'Waterlogged Violin',
        description: 'A Waterlogged Violin. Its silent strings recall the melancholic, luring music of the water spirit. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a Waterlogged Violin. Its silent strings recall the melancholic, luring music of the water spirit.',
        tamingTarget: 'Nacken'
    },
    'Morning Dew': {
        name: 'Morning Dew',
        description: 'A jar containing shimmering Morning Dew. This ethereal substance attracts the tiny, dancing beings of the mist. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a jar containing shimmering Morning Dew. This ethereal substance attracts the tiny, dancing beings of the mist.',
        tamingTarget: 'Alva'
    },
    'Anvil Shard': {
        name: 'Anvil Shard',
        description: 'A fragment of an Anvil Shard. It rings with a sound of skilled craftsmanship, belonging to the subterranean smiths. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a fragment of an Anvil Shard. It rings with a sound of skilled craftsmanship, belonging to the subterranean smiths.',
        tamingTarget: 'Svartalv'
    },
    'Festive Midsommarkrans': {
        name: 'Festive Midsommarkrans',
        description: 'A festive woven flower wreath. Its radiance attracts the beautiful, light-aligned beings of creation. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a festive woven flower Wreath. Its radiance attracts the beautiful, light-aligned beings of creation.',
        tamingTarget: 'Ljusalv'
    },
    'Elderflower Sprig': {
        name: 'Elderflower Sprig',
        description: 'A fragrant Elderflower Sprig. Its scent is protective and ancient, a necessary offering for the fierce, watchful spirit of the Elder Tree. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a fragrant Elderflower Sprig. Its scent is protective, a necessary offering for the fierce, watchful spirit of the Elder Tree.',
        tamingTarget: 'Hyllemor'
    },
    'Valhalla Pork': {
        name: 'Valhalla Pork',
        description: 'A savory portion from the legendary boar Särimner, served nightly in Valhalla. Though he is slain each evening, Särimner rises anew by dawn, and his ever‑renewing flesh is said to restore body and spirit alike.',
        foundText: 'You found a tempting piece of Valhalla Pork. The scent of victory and feasting lingers, attracting a valiant warrior from Valhalla.',
        tamingTarget: 'Einharje'
    },
    'Shield Fragment': {
        name: 'Shield Fragment',
        description: 'A polished Shield Fragment. It has the mark of a powerful, winged maiden who chooses the worthy slain. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a polished Shield Fragment. It has the mark of a powerful, winged maiden who chooses the worthy slain.',
        tamingTarget: 'Valkyria'
    },
    'Giant Rock': {
        name: 'Giant Rock',
        description: 'A surprisingly smooth Giant Rock. A piece of the raw, immense power of the ancient giants. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a surprisingly smooth Giant Rock. A piece of the raw, immense power of the ancient giants.',
        tamingTarget: 'Jotun'
    },
    'Glowing Coal': {
        name: 'Glowing Coal',
        description: 'A searing Glowing Coal. It burns with the endless fire of Muspelheim, attracting a fiery elemental being. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a searing Glowing Coal. It burns with the endless fire of Muspelheim, attracting a fiery elemental being.',
        tamingTarget: 'Eldturs'
    },
    'Ice Crystal': {
        name: 'Ice Crystal',
        description: 'A razor-sharp Ice Crystal. It is bone-chillingly cold, a remnant of the primordial giants of ice and mist. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a razor-sharp Ice Crystal. It is bone-chillingly cold, a remnant of the primordial giants of ice and mist.',
        tamingTarget: 'Rimturs'
    },
    'Shedded Scale': {
        name: 'Shedded Scale',
        description: 'A large, slick Shedded Scale. It belonged to a massive, wingless serpent of the forgotten forests. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a large, slick Shedded Scale. It belonged to a massive, wingless serpent of the forgotten forests.',
        tamingTarget: 'Lindorm'
    },
    'Gold Coin': {
        name: 'Gold Coin',
        description: 'A flawless coin of pure gold, often found in the colossal hoards of avaricious drakes. It speaks volumes of wealth and is a tempting offering to creatures driven by greed. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a flawless coin of pure gold, often found in the colossal hoards of avaricious drakes. It speaks volumes of wealth and is a tempting offering to creatures driven by greed.',
        tamingTarget: 'Fafner'
    },
    'Fishing Hook': {
        name: 'Fishing Hook',
        description: 'A colossal Fishing Hook. Only the one who tried to catch the World Serpent could have used this. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a colossal Fishing Hook. Only the one who tried to catch the World Serpent could have used this.',
        tamingTarget: 'Jormungandr'
    },
    'Yggdrasil Root': {
        name: 'Yggdrasil Root',
        description: 'A fragment of Yggdrasil Root. It is gnawed and ancient, a piece of the world tree itself. It can either be offered to wild väsen to tame them or your own väsen to heal them. Be careful, only some väsen like this.',
        foundText: 'You found a fragment of Yggdrasil Root. It is gnawed and ancient, a piece of the world tree itself.',
        tamingTarget: 'Nidhogg'
    }
};

// Runes
const RUNES = {
    'FEHU': {
        id: 'FEHU',
        symbol: 'ᚠ',
        name: 'Fehu',
        fullName: 'Fehu (Cattle, Wealth)',
        flavor: 'The rune of earned prosperity and protected holdings. It creates a field of passive wealth around the bearer, cushioning the impact of the strongest strikes.',
        effect: 'Potent hits deal 10% less damage to this väsen',
        mechanic: { type: 'damage_reduction_potent', value: 0.10 }
    },
    'URUZ': {
        id: 'URUZ',
        symbol: 'ᚢ',
        name: 'Uruz',
        fullName: 'Uruz',
        flavor: 'The symbol of the mighty, untamed Aurochs. It taps into the deep, foundational power of the wielder, allowing for a vast and enduring wellspring of Megin.',
        effect: 'This Väsen has 20% more Megin',
        mechanic: { type: 'megin_bonus', value: 0.20 }
    },
    'THURS': {
        id: 'THURS',
        symbol: 'ᚦ',
        name: 'Thurs',
        fullName: 'Thurs',
        flavor: 'The violent, chaotic might of the Giants, channeled as a sharp, unyielding thorn. Any harm inflicted upon the bearer is instantly met with a fierce, painful recoil.',
        effect: 'This väsen returns 40% of damage taken as mixed damage',
        mechanic: { type: 'damage_reflect', value: 0.40 }
    },
    'ANSUZ': {
        id: 'ANSUZ',
        symbol: 'ᚨ',
        name: 'Ansuz',
        fullName: 'Ansuz',
        flavor: 'The voice of the Gods or the Vanir. It transforms the brute force of the wielder\'s body into a calculated, insightful display of esoteric power.',
        effect: 'This Väsen\'s Strength attacks are considered Wisdom Attacks (They use Wisdom and are checked against Durability)',
        mechanic: { type: 'convert_strength_to_wisdom' }
    },
    'RAIDO': {
        id: 'RAIDO',
        symbol: 'ᚱ',
        name: 'Raido',
        fullName: 'Raido',
        flavor: 'The guiding force of one\'s path and fate. As the wielder strides onto the field, the momentum of their journey grants them swift healing and temporary resilience.',
        effect: 'This Väsen\'s Wisdom attacks are considered Strength Attacks (They use Strength and are checked against Defense)',
        mechanic: { type: 'convert_wisdom_to_strength' }
    },
    'KAUNAN': {
        id: 'KAUNAN',
        symbol: 'ᚲ',
        name: 'Kaunan',
        fullName: 'Kaunan',
        flavor: 'The bright, consuming power of the torch flame. It enhances the wielder\'s affinity with fire, causing their elemental attacks to strike with greater heat and devastation.',
        effect: 'This Väsen\'s Fire hits deal 12% more damage',
        mechanic: { type: 'element_damage_bonus', element: ELEMENTS.FIRE, value: 0.12 }
    },
    'GIFU': {
        id: 'GIFU',
        symbol: 'ᚷ',
        name: 'Gifu',
        fullName: 'Gifu',
        flavor: 'The sacred exchange of powers between equals. The first significant boon received by the wielder is considered a communal gift, extending the effect to all allies.',
        effect: 'The first time this Väsen\'s attributes are raised during this battle it is also applied to allies',
        mechanic: { type: 'share_first_buff' }
    },
    'WYNJA': {
        id: 'WYNJA',
        symbol: 'ᚹ',
        name: 'Wynja',
        fullName: 'Wynja',
        flavor: 'The power of success and the protective shield of community. It intercepts hostile curses and transmutes that negative energy into a personal triumph.',
        effect: 'Blocks the first negative attribute effect this Väsen receives and raise a random attribute by 1 stage when it happens',
        mechanic: { type: 'block_first_debuff' }
    },
    'HAGAL': {
        id: 'HAGAL',
        symbol: 'ᚺ',
        name: 'Hagal',
        fullName: 'Hagal',
        flavor: 'The rune of chaotic, natural destruction. It strips the elegance from arcane power, forcing the wielder\'s insightful attacks to rely instead on overwhelming physical impact.',
        effect: 'When this Väsen is knocked out, the opponent gets all Attributes lowered by 1 stage',
        mechanic: { type: 'debuff_on_knockout' }
    },
    'NAUDIZ': {
        id: 'NAUDIZ',
        symbol: 'ᚾ',
        name: 'Naudiz',
        fullName: 'Naudiz',
        flavor: 'The painful, inescapable pressure of need. Even the weakest attack carries a profound psychological weight, draining the opponent\'s strength and focus.',
        effect: 'This Väsen\'s Weak hits lowers two random enemy attributes by 1 stage',
        mechanic: { type: 'debuff_on_weak_hit' }
    },
    'ISAZ': {
        id: 'ISAZ',
        symbol: 'ᛁ',
        name: 'Isaz',
        fullName: 'Isaz',
        flavor: 'The enduring patience and silence of concentrated ice. Utilizing water creates a moment of perfect clarity, simultaneously enhancing the wielder\'s body and mind.',
        effect: 'This Väsen\'s Water abilities have a 30% chance to raise its Wisdom and Strength attributes by 1 stage',
        mechanic: { type: 'buff_on_element_hit', element: ELEMENTS.WATER, stats: ['wisdom', 'strength'], chance: 0.30 }
    },
    'JERA': {
        id: 'JERA',
        symbol: 'ᛃ',
        name: 'Jera',
        fullName: 'Jera',
        flavor: 'The long, fertile cycle of the year. Quick, efficient efforts consistently yield their harvest, causing the wielder\'s life force to be subtly replenished after short actions.',
        effect: 'This Väsen\'s abilities that cost 30 Megin or less have a 30% chance to heal it by 8%',
        mechanic: { type: 'heal_on_low_cost', maxCost: 30, chance: 0.30, healPercent: 0.08 }
    },
    'EIHWAZ': {
        id: 'EIHWAZ',
        symbol: 'ᛇ',
        name: 'Eihwaz',
        fullName: 'Eihwaz',
        flavor: 'The immense durability of the Yew tree and the structure of the cosmos. Drawing upon the earth grants a foundational resilience, shielding both mind and body.',
        effect: 'This väsen\'s Earth Abilities have a 30% chance to raise its Defense and Durability Attributes by 1 stage',
        mechanic: { type: 'buff_on_element_ability', element: ELEMENTS.EARTH, stats: ['defense', 'durability'], chance: 0.30 }
    },
    'PERTHO': {
        id: 'PERTHO',
        symbol: 'ᛈ',
        name: 'Pertho',
        fullName: 'Pertho',
        flavor: 'The mystery of what is hidden. It grounds the wielder, granting their earth-based powers a greater certainty and irresistible, final impact.',
        effect: 'This Väsen\'s Earth hits deal 12% more damage',
        mechanic: { type: 'element_damage_bonus', element: ELEMENTS.EARTH, value: 0.12 }
    },
    'ALGIZ': {
        id: 'ALGIZ',
        symbol: 'ᛉ',
        name: 'Algiz',
        fullName: 'Algiz',
        flavor: 'The potent sign of spiritual sanctuary and protection from the wild. Channeling the power of Nature automatically reinforces the wielder\'s vitality.',
        effect: 'This Väsen\'s Nature Abilities have a 30% chance to heal it by 8%',
        mechanic: { type: 'heal_on_element_ability', element: ELEMENTS.NATURE, chance: 0.30, healPercent: 0.08 }
    },
    'SOL': {
        id: 'SOL',
        symbol: 'ᛊ',
        name: 'Sol',
        fullName: 'Sol',
        flavor: 'The vitalizing energy of the sun. Commanding the fierce element of fire focuses the wielder, bringing about a moment of physical and mental clarity.',
        effect: 'This Väsen\'s Fire Abilities have a 30% chance to raise its Strength and Wisdom attributes by 1 stage',
        mechanic: { type: 'buff_on_element_ability', element: ELEMENTS.FIRE, stats: ['strength', 'wisdom'], chance: 0.30 }
    },
    'TYR': {
        id: 'TYR',
        symbol: 'ᛏ',
        name: 'Tyr',
        fullName: 'Tyr',
        flavor: 'The pillar of righteous command and ultimate fairness. The wielder\'s wind attacks gain a fearsome precision, striking with the swift, cutting force of cosmic law.',
        effect: 'This Väsen\'s Wind hits deal 12% more damage',
        mechanic: { type: 'element_damage_bonus', element: ELEMENTS.WIND, value: 0.12 }
    },
    'BJARKA': {
        id: 'BJARKA',
        symbol: 'ᛒ',
        name: 'Bjarka',
        fullName: 'Bjarka',
        flavor: 'The steady, quiet, yet inexorable force of the birch tree. The wielder\'s nature-based attacks strike with the persistent, multiplying force of wild growth.',
        effect: 'This Väsen\'s Nature hits deal 12% more damage',
        mechanic: { type: 'element_damage_bonus', element: ELEMENTS.NATURE, value: 0.12 }
    },
    'EHWAZ': {
        id: 'EHWAZ',
        symbol: 'ᛖ',
        name: 'Ehwaz',
        fullName: 'Ehwaz',
        flavor: 'The swift, coordinated power of the horse and rider. As the wielder moves with the element of wind, their physical frame becomes surprisingly stable and resilient.',
        effect: 'This Väsen\'s Wind Abilities have a 30% chance to raise its Defense and Durability attributes by 1 stage',
        mechanic: { type: 'buff_on_element_ability', element: ELEMENTS.WIND, stats: ['defense', 'durability'], chance: 0.30 }
    },
    'MANNAZ': {
        id: 'MANNAZ',
        symbol: 'ᛗ',
        name: 'Mannaz',
        fullName: 'Mannaz',
        flavor: 'The quiet strength of self-reflection and intellect. Taking a measured pause for a non-offensive action allows the wielder to collect their fragmented spirit and mend damage.',
        effect: 'When this väsen uses a non damaging ability it gets healed by 8%',
        mechanic: { type: 'heal_on_utility', healPercent: 0.08 }
    },
    'LAGUZ': {
        id: 'LAGUZ',
        symbol: 'ᛚ',
        name: 'Laguz',
        fullName: 'Laguz',
        flavor: 'The ceaseless, flowing movement of the ocean current. The wielder\'s water attacks are granted greater momentum, carrying increased tidal power and finality.',
        effect: 'This väsen\'s Water hits deal 12% more damage',
        mechanic: { type: 'element_damage_bonus', element: ELEMENTS.WATER, value: 0.12 }
    },
    'INGUZ': {
        id: 'INGUZ',
        symbol: 'ᛜ',
        name: 'Inguz',
        fullName: 'Inguz',
        flavor: 'The contained potential of the seed. Even a blow that fails to cause physical damage carries a hidden, draining cost, siphoning the opponent\'s core resources.',
        effect: 'This väsen\'s Weak hits removes 18 Megin from the enemy',
        mechanic: { type: 'megin_drain_on_weak', value: 18 }
    },
    'DAGAZ': {
        id: 'DAGAZ',
        symbol: 'ᛞ',
        name: 'Dagaz',
        fullName: 'Dagaz',
        flavor: 'The clarifying, explosive power of the new dawn. The wielder\'s entry into combat marks a potent transition, granting a momentary burst of supreme destructive potential.',
        effect: 'This Väsen deals 20% more damage for the first round after entering the battlefield',
        mechanic: { type: 'first_round_damage_bonus', value: 0.20 }
    },
    'ODAL': {
        id: 'ODAL',
        symbol: 'ᛟ',
        name: 'Odal',
        fullName: 'Odal',
        flavor: 'The ancestral strength passed down through lineage. The wielder\'s most familiar, low-cost actions are imbued with deep, inherited knowledge, granting a significant boost.',
        effect: 'This Väsen\'s abilities that cost 30 Megin or less deal 10% more damage',
        mechanic: { type: 'low_cost_damage_bonus', maxCost: 30, value: 0.1 }
    }
};

const RUNE_LIST = Object.keys(RUNES);
const STARTER_RUNE = 'URUZ';

// Helper to get all items for a zone
function getItemsForZone(zoneKey) {
    const zone = ZONES[zoneKey];
    if (!zone) return [];
    
    let spawns;
    if (zone.spawns === 'ALL') {
        spawns = VASEN_LIST;
    } else {
        spawns = zone.spawns;
    }
    
    const items = new Set();
    spawns.forEach(speciesName => {
        const species = VASEN_SPECIES[speciesName];
        if (species && species.tamingItem) {
            items.add(species.tamingItem);
        }
    });
    
    return Array.from(items);
}

// Get random item from zone
function getRandomItemFromZone(zoneKey) {
    const items = getItemsForZone(zoneKey);
    if (items.length === 0) return null;
    return items[Math.floor(Math.random() * items.length)];
}

// Check if item is correct for a species
function isCorrectTamingItem(itemName, speciesName) {
    const item = TAMING_ITEMS[itemName];
    return item && item.tamingTarget === speciesName;
}
