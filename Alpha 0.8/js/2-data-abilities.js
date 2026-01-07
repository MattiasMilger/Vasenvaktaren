// =============================================================================
// 2-data-abilities.js - All Ability Definitions
// =============================================================================

const ATTACK_TYPES = {
    STRENGTH: 'Strength Attack',
    WISDOM: 'Wisdom Attack',
    MIXED: 'Mixed Attack',
    UTILITY: 'Utility'
};

const ABILITIES = {
    // Earth Abilities
    'Ground Stomp': {
        name: 'Ground Stomp',
        description: 'Slams the ground with immense force, sending a stunning shockwave through the bedrock',
        element: ELEMENTS.EARTH,
        type: ATTACK_TYPES.STRENGTH,
        power: 50,
        meginCost: 30
    },
    'Boulder Toss': {
        name: 'Boulder Toss',
        description: 'Hurls a colossal, jagged rock, delivering the crushing weight of a mountain',
        element: ELEMENTS.EARTH,
        type: ATTACK_TYPES.STRENGTH,
        power: 65,
        meginCost: 50
    },
    'Sinkhole': {
        name: 'Sinkhole',
        description: 'The earth softens and collapses, opening a treacherous pit beneath the enemy',
        element: ELEMENTS.EARTH,
        type: ATTACK_TYPES.WISDOM,
        power: 50,
        meginCost: 30
    },
    'Landslide': {
        name: 'Landslide',
        description: 'Summons a chaotic torrent of debris, burying the enemy under loose soil and stone',
        element: ELEMENTS.EARTH,
        type: ATTACK_TYPES.WISDOM,
        power: 65,
        meginCost: 50
    },
    'Smithing': {
        name: 'Smithing',
        description: 'Through ancient forging magic, an ally\'s Strength is raised by 1 stage',
        element: ELEMENTS.EARTH,
        type: ATTACK_TYPES.UTILITY,
        power: 0,
        meginCost: 45,
        effect: { type: 'buff', target: 'self', stat: 'strength', stages: 1 }
    },

    // Nature Abilities
    'Vine Whip': {
        name: 'Vine Whip',
        description: 'Swift, thorny vines lash out from the wilderness, tangling and striking the target',
        element: ELEMENTS.NATURE,
        type: ATTACK_TYPES.STRENGTH,
        power: 50,
        meginCost: 30
    },
    'Wild Bite': {
        name: 'Wild Bite',
        description: 'A savage, powerful clenching of jaws, fueled by the primal ferocity of a deep forest beast',
        element: ELEMENTS.NATURE,
        type: ATTACK_TYPES.STRENGTH,
        power: 65,
        meginCost: 50
    },
    'Elven Light': {
        name: 'Elven Light',
        description: 'Focuses a faint, mesmerizing beam drawn from the magic of the twilight mist',
        element: ELEMENTS.NATURE,
        type: ATTACK_TYPES.WISDOM,
        power: 50,
        meginCost: 30
    },
    'Moon Beam': {
        name: 'Moon Beam',
        description: 'Gathers the potent, chilling energy of the moon into a destructive ray',
        element: ELEMENTS.NATURE,
        type: ATTACK_TYPES.WISDOM,
        power: 65,
        meginCost: 50
    },
    'Thick Coat': {
        name: 'Thick Coat',
        description: 'Grows a thick protective hide, raising your Defense and Durability by 1 stage',
        element: ELEMENTS.NATURE,
        type: ATTACK_TYPES.UTILITY,
        power: 0,
        meginCost: 40,
        effect: { type: 'buff', target: 'self', stats: ['defense', 'durability'], stages: 1 }
    },

    // Water Abilities
    'Drown': {
        name: 'Drown',
        description: 'Violently drags the opponent down, mimicking the crushing pressure of deep water',
        element: ELEMENTS.WATER,
        type: ATTACK_TYPES.STRENGTH,
        power: 50,
        meginCost: 30
    },
    'Icicle Spear': {
        name: 'Icicle Spear',
        description: 'Throws a sharp, glacial shard of ice, capable of piercing thick materials',
        element: ELEMENTS.WATER,
        type: ATTACK_TYPES.STRENGTH,
        power: 65,
        meginCost: 50
    },
    'Hail Storm': {
        name: 'Hail Storm',
        description: 'A sudden, freezing downpour of stinging ice and freezing wind',
        element: ELEMENTS.WATER,
        type: ATTACK_TYPES.WISDOM,
        power: 50,
        meginCost: 30
    },
    'Tidal Wave': {
        name: 'Tidal Wave',
        description: 'Evokes a massive, surging wall of ocean water to engulf the battlefield',
        element: ELEMENTS.WATER,
        type: ATTACK_TYPES.WISDOM,
        power: 65,
        meginCost: 50
    },
    'Skald\'s Mead': {
        name: 'Skald\'s Mead',
        description: 'Passes mead to an ally, clarifying an ally\'s mind and raising their Wisdom by 1 stage',
        element: ELEMENTS.WATER,
        type: ATTACK_TYPES.UTILITY,
        power: 0,
        meginCost: 45,
        effect: { type: 'buff', target: 'self', stat: 'wisdom', stages: 1 }
    },

    // Fire Abilities
    'Torch Strike': {
        name: 'Torch Strike',
        description: 'A searing blow with a burning torch, delivering simple, raw heat',
        element: ELEMENTS.FIRE,
        type: ATTACK_TYPES.STRENGTH,
        power: 50,
        meginCost: 30
    },
    'Flaming Skewer': {
        name: 'Flaming Skewer',
        description: 'Impales the enemy with a lance of fire, leaving a burning, painful wound',
        element: ELEMENTS.FIRE,
        type: ATTACK_TYPES.STRENGTH,
        power: 65,
        meginCost: 50
    },
    'Fire Breath': {
        name: 'Fire Breath',
        description: 'Exhales a short, scorching gust of flame from the creature\'s core',
        element: ELEMENTS.FIRE,
        type: ATTACK_TYPES.WISDOM,
        power: 50,
        meginCost: 30
    },
    'Lava Jet': {
        name: 'Lava Jet',
        description: 'A volcanic burst, shooting a devastating stream of molten rock',
        element: ELEMENTS.FIRE,
        type: ATTACK_TYPES.WISDOM,
        power: 65,
        meginCost: 50
    },
    'Burning Insult': {
        name: 'Burning Insult',
        description: 'Hurls a vicious, withering curse that crushes the enemy\'s resolve and lowers their Defense and Durability by 2 stages',
        element: ELEMENTS.FIRE,
        type: ATTACK_TYPES.UTILITY,
        power: 0,
        meginCost: 70,
        effect: { type: 'debuff', target: 'enemy', stats: ['defense', 'durability'], stages: 2 }
    },

    // Wind Abilities
    'Storm Claw': {
        name: 'Storm Claw',
        description: 'A quick, brutal strike delivered with claws riding the speed of a gale',
        element: ELEMENTS.WIND,
        type: ATTACK_TYPES.STRENGTH,
        power: 50,
        meginCost: 30
    },
    'Sky Dive': {
        name: 'Sky Dive',
        description: 'Plummets from a great height, impacting the target with crushing force',
        element: ELEMENTS.WIND,
        type: ATTACK_TYPES.STRENGTH,
        power: 65,
        meginCost: 50
    },
    'Wailing Cry': {
        name: 'Wailing Cry',
        description: 'Unleashes an agonizing, ghostly shriek that assails the opponent\'s senses',
        element: ELEMENTS.WIND,
        type: ATTACK_TYPES.WISDOM,
        power: 50,
        meginCost: 30
    },
    'Wind Gust': {
        name: 'Wind Gust',
        description: 'Whips up a powerful, chaotic blast of air to push and punish the enemy',
        element: ELEMENTS.WIND,
        type: ATTACK_TYPES.WISDOM,
        power: 65,
        meginCost: 50
    },
    'Ethereal Melody': {
        name: 'Ethereal Melody',
        description: 'Plays a haunting tune that distracts the enemy and lowers their Strength and Wisdom by 1 stage',
        element: ELEMENTS.WIND,
        type: ATTACK_TYPES.UTILITY,
        power: 0,
        meginCost: 40,
        effect: { type: 'debuff', target: 'enemy', stats: ['strength', 'wisdom'], stages: 1 }
    },

    // Basic Strike (available to all)
    'Basic Strike': {
        name: 'Basic Strike',
        description: 'A reflexive and adaptable strike fueled by your element',
        element: null, // Uses the Väsen's own element
        type: ATTACK_TYPES.MIXED,
        power: 20,
        meginCost: 0
    }
};

// Helper function to check if an ability is damaging
function isAbilityDamaging(abilityName) {
    const ability = ABILITIES[abilityName];
    return ability && ability.type !== ATTACK_TYPES.UTILITY;
}

// Helper function to get ability's actual megin cost for a specific element
function getAbilityMeginCost(abilityName, vasenElement) {
    const ability = ABILITIES[abilityName];
    if (!ability) return 0;
    
    const basesCost = ability.meginCost;
    const abilityElement = ability.element || vasenElement; // Basic Strike uses Väsen's element
    
    if (abilityElement === vasenElement) {
        return Math.floor(basesCost * (1 - GAME_CONFIG.SAME_ELEMENT_MEGIN_DISCOUNT));
    }
    return basesCost;
}

// Helper to get ability element (handles Basic Strike case)
function getAbilityElement(abilityName, vasenElement) {
    const ability = ABILITIES[abilityName];
    if (!ability) return vasenElement;
    return ability.element || vasenElement;
}
