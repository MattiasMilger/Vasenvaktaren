// =============================================================================
// 4-data-runes.js - Runes Definitions
// =============================================================================

const RUNES = {
    'FEHU': {
        id: 'FEHU',
        symbol: 'ᚠ',
        name: 'Fehu',
        fullName: 'Fehu (Cattle, Wealth)',
        flavor: 'The rune of earned prosperity and protected holdings. It creates a field of passive wealth around the bearer, cushioning the impact of the strongest strikes.',
        get effect() {
            return `Potent hits deal ${Math.round((1 - GAME_CONFIG.RUNE_FEHU_DAMAGE_REDUCTION) * 100)}% less damage to this väsen`;
        },
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
        get effect() {
            return `This väsen returns ${Math.round((GAME_CONFIG.RUNE_THURS_RETURN_DAMAGE) * 100)}% of damage taken as mixed damage of its own element`;
        },
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
        get effect() {
            return `This Väsen's Fire hits deal ${Math.round(GAME_CONFIG.RUNE_ELEMENT_DAMAGE_BOOST * 100)}% more damage`;
        },
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
    get effect() {
        return `When this Väsen is knocked out, the opponent gets all Attributes lowered by ${GAME_CONFIG.RUNE_HAGAL_DEBUFF_STAGES} stages`;
    },
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
        get effect() {
            return `This Väsen's Water abilities have a ${Math.round(GAME_CONFIG.RUNE_ELEMENT_BUFF_PROC_CHANCE * 100)}% chance to raise its Wisdom and Strength attributes by 1 stage`;
        },
        mechanic: { type: 'buff_on_element_hit', element: ELEMENTS.WATER, stats: ['wisdom', 'strength'], chance: 0.30 }
    },
    'JERA': {
        id: 'JERA',
        symbol: 'ᛃ',
        name: 'Jera',
        fullName: 'Jera',
        flavor: 'The long, fertile cycle of the year. Quick, efficient efforts consistently yield their harvest, causing the wielder\'s life force to be subtly replenished after short actions.',
        get effect() {
            return `This Väsen's abilities that cost ${GAME_CONFIG.RUNE_ODAL_COST_THRESHOLD} Megin or less have a ${Math.round(GAME_CONFIG.RUNE_LOW_COST_HEAL_PROC_CHANCE * 100)}% chance to heal it by ${Math.round(GAME_CONFIG.RUNE_JERA_HEAL_PERCENT * 100)}%`;
        },
        mechanic: { type: 'heal_on_low_cost', maxCost: 30, chance: 0.30, healPercent: 0.08 }
    },
    'EIHWAZ': {
        id: 'EIHWAZ',
        symbol: 'ᛇ',
        name: 'Eihwaz',
        fullName: 'Eihwaz',
        flavor: 'The immense durability of the Yew tree and the structure of the cosmos. Drawing upon the earth grants a foundational resilience, shielding both mind and body.',
        get effect() {
            return `This väsen\'s Earth Abilities have a ${Math.round(GAME_CONFIG.RUNE_ELEMENT_BUFF_PROC_CHANCE * 100)}% chance to raise its Defense and Durability Attributes by 1 stage`;
        },
        mechanic: { type: 'buff_on_element_ability', element: ELEMENTS.EARTH, stats: ['defense', 'durability'], chance: 0.30 }
    },
    'PERTHO': {
        id: 'PERTHO',
        symbol: 'ᛈ',
        name: 'Pertho',
        fullName: 'Pertho',
        flavor: 'The mystery of what is hidden. It grounds the wielder, granting their earth-based powers a greater certainty and irresistible, final impact.',
        get effect() {
            return `This Väsen\'s Earth hits deal ${Math.round(GAME_CONFIG.RUNE_ELEMENT_DAMAGE_BOOST * 100)}% more damage`;
        },
        mechanic: { type: 'element_damage_bonus', element: ELEMENTS.EARTH, value: 0.12 }
    },
    'ALGIZ': {
        id: 'ALGIZ',
        symbol: 'ᛉ',
        name: 'Algiz',
        fullName: 'Algiz',
        flavor: 'The potent sign of spiritual sanctuary and protection from the wild. Channeling the power of Nature automatically reinforces the wielder\'s vitality.',
        get effect() {
            return `This Väsen's Nature Abilities have a ${Math.round(GAME_CONFIG.RUNE_NATURE_HEAL_PROC_CHANCE * 100)}% chance to heal it by ${Math.round(GAME_CONFIG.RUNE_ALGIZ_HEAL_PERCENT * 100)}%`;
        },
        mechanic: { type: 'heal_on_element_ability', element: ELEMENTS.NATURE, chance: 0.30, healPercent: 0.08 }
    },
    'SOL': {
        id: 'SOL',
        symbol: 'ᛊ',
        name: 'Sol',
        fullName: 'Sol',
        flavor: 'The vitalizing energy of the sun. Commanding the fierce element of fire focuses the wielder, bringing about a moment of physical and mental clarity.',
        get effect() {
            return `This Väsen\'s Fire Abilities have a ${Math.round(GAME_CONFIG.RUNE_ELEMENT_BUFF_PROC_CHANCE * 100)}% chance to raise its Strength and Wisdom attributes by 1 stage`;
        },
        mechanic: { type: 'buff_on_element_ability', element: ELEMENTS.FIRE, stats: ['strength', 'wisdom'], chance: 0.30 }
    },
    'TYR': {
        id: 'TYR',
        symbol: 'ᛏ',
        name: 'Tyr',
        fullName: 'Tyr',
        flavor: 'The pillar of righteous command and ultimate fairness. The wielder\'s wind attacks gain a fearsome precision, striking with the swift, cutting force of cosmic law.',
        get effect() {
            return `This Väsen\'s Wind hits deal ${Math.round(GAME_CONFIG.RUNE_ELEMENT_DAMAGE_BOOST * 100)}% more damage`;
        },
        mechanic: { type: 'element_damage_bonus', element: ELEMENTS.WIND, value: 0.12 }
    },
    'BJARKA': {
        id: 'BJARKA',
        symbol: 'ᛒ',
        name: 'Bjarka',
        fullName: 'Bjarka',
        flavor: 'The steady, quiet, yet inexorable force of the birch tree. The wielder\'s nature-based attacks strike with the persistent, multiplying force of wild growth.',
        get effect() {
            return `This Väsen\'s Nature hits deal ${Math.round(GAME_CONFIG.RUNE_ELEMENT_DAMAGE_BOOST * 100)}% more damage`;
        },
        mechanic: { type: 'element_damage_bonus', element: ELEMENTS.NATURE, value: 0.12 }
    },
    'EHWAZ': {
        id: 'EHWAZ',
        symbol: 'ᛖ',
        name: 'Ehwaz',
        fullName: 'Ehwaz',
        flavor: 'The swift, coordinated power of the horse and rider. As the wielder moves with the element of wind, their physical frame becomes surprisingly stable and resilient.',
        get effect() {
            return `This Väsen\'s Wind Abilities have a ${Math.round(GAME_CONFIG.RUNE_ELEMENT_BUFF_PROC_CHANCE * 100)}% chance to raise its Defense and Durability attributes by 1 stage`;
        },
        mechanic: { type: 'buff_on_element_ability', element: ELEMENTS.WIND, stats: ['defense', 'durability'], chance: 0.30 }
    },
    'MANNAZ': {
        id: 'MANNAZ',
        symbol: 'ᛗ',
        name: 'Mannaz',
        fullName: 'Mannaz',
        flavor: 'The quiet strength of self-reflection and intellect. Taking a measured pause for a non-offensive action allows the wielder to collect their fragmented spirit and mend damage.',
        get effect() {
            return `When this väsen uses a utility ability it heals by ${Math.round(GAME_CONFIG.RUNE_MANNAZ_HEAL_PERCENT * 100)}%`;
        },
        mechanic: { type: 'heal_on_utility', healPercent: 0.08 }
    },
    'LAGUZ': {
        id: 'LAGUZ',
        symbol: 'ᛚ',
        name: 'Laguz',
        fullName: 'Laguz',
        flavor: 'The ceaseless, flowing movement of the ocean current. The wielder\'s water attacks are granted greater momentum, carrying increased tidal power and finality.',
        get effect() {
            return `This väsen\'s Water hits deal ${Math.round(GAME_CONFIG.RUNE_ELEMENT_DAMAGE_BOOST * 100)}% more damage`;
        },
        mechanic: { type: 'element_damage_bonus', element: ELEMENTS.WATER, value: 0.12 }
    },
    'INGUZ': {
        id: 'INGUZ',
        symbol: 'ᛜ',
        name: 'Inguz',
        fullName: 'Inguz',
        flavor: 'The contained potential of the seed. Every strike plants a creeping instability within the foe, germinating into a sudden rot that withers their fundamental prowess.',
        get effect() {
            return `This Väsen's hits have a ${Math.round(GAME_CONFIG.RUNE_INGUZ_DEBUFF_PROC_CHANCE * 100)}% chance to lower a random enemy attribute by 1 stage`;
        },
        mechanic: { type: 'debuff_on_hit', chance: 0.30 }
    },
    'DAGAZ': {
        id: 'DAGAZ',
        symbol: 'ᛞ',
        name: 'Dagaz',
        fullName: 'Dagaz',
        flavor: 'The clarifying, explosive power of the new dawn. The wielder\'s entry into combat marks a potent transition, granting a momentary burst of supreme destructive potential.',
        get effect() {
            return `This Väsen deals ${Math.round(GAME_CONFIG.RUNE_DAGAZ_DAMAGE_BOOST * 100)}% more damage for the first round after entering the battlefield`;
        },
        mechanic: { type: 'first_round_damage_bonus', value: 0.20 }
    },
    'ODAL': {
        id: 'ODAL',
        symbol: 'ᛟ',
        name: 'Odal',
        fullName: 'Odal',
        flavor: 'The ancestral strength passed down through lineage. The wielder\'s most familiar, low-cost actions are imbued with deep, inherited knowledge, granting a significant boost.',
        get effect() {
            return `This Väsen\'s abilities that cost ${GAME_CONFIG.RUNE_ODAL_COST_THRESHOLD} Megin or less deal ${Math.round(GAME_CONFIG.RUNE_ODAL_DAMAGE_BOOST * 100)}% more damage`;
        },
        mechanic: { type: 'low_cost_damage_bonus', maxCost: 30, value: 0.1 }
    }
};

const RUNE_LIST = Object.keys(RUNES);
const STARTER_RUNE = 'URUZ';
