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
        flavorDescription: 'Slams the ground with immense force, sending a stunning shockwave through the bedrock.',
        get mechanicsDescription() {
            return `Hits opponent. Next attack deals ${Math.round(GAME_CONFIG.EMPOWERMENT_DAMAGE_BOOST * 100)}% more damage.`;
        },
        element: ELEMENTS.EARTH,
        type: ATTACK_TYPES.STRENGTH,
        power: 50,
        meginCost: 30,
        grantsEmpowerment: true
    },
    'Boulder Toss': {
        name: 'Boulder Toss',
        flavorDescription: 'Hurls a colossal, jagged rock, delivering the crushing weight of a mountain.',
        mechanicsDescription: 'Hits opponent.',
        element: ELEMENTS.EARTH,
        type: ATTACK_TYPES.STRENGTH,
        power: 68,
        meginCost: 50
    },
    'Sinkhole': {
        name: 'Sinkhole',
        flavorDescription: 'The earth softens and collapses, opening a treacherous pit beneath the enemy.',
        get mechanicsDescription() {
            return `Hits opponent. Next attack deals ${Math.round(GAME_CONFIG.EMPOWERMENT_DAMAGE_BOOST * 100)}% more damage.`;
        },
        element: ELEMENTS.EARTH,
        type: ATTACK_TYPES.WISDOM,
        power: 50,
        meginCost: 30,
        grantsEmpowerment: true
    },
    'Landslide': {
        name: 'Landslide',
        flavorDescription: 'Summons a chaotic torrent of debris, burying the enemy under loose soil and stone.',
        mechanicsDescription: 'Hits opponent.',
        element: ELEMENTS.EARTH,
        type: ATTACK_TYPES.WISDOM,
        power: 68,
        meginCost: 50
    },
    'Smithing': {
        name: 'Smithing',
        flavorDescription: 'Through ancient forging magic, an ally\'s Strength is raised.',
        mechanicsDescription: 'Raises an ally\'s Strength by 1 stage.',
        element: ELEMENTS.EARTH,
        type: ATTACK_TYPES.UTILITY,
        power: 0,
        meginCost: 35,
        effect: { type: 'buff', target: 'ally', stat: 'strength', stages: 1 }
    },

    // Nature Abilities
    'Vine Whip': {
        name: 'Vine Whip',
        flavorDescription: 'Swift, thorny vines lash out from the wilderness, tangling and striking the target.',
        get mechanicsDescription() {
            return `Hits opponent. Next attack deals ${Math.round(GAME_CONFIG.EMPOWERMENT_DAMAGE_BOOST * 100)}% more damage.`;
        },
        element: ELEMENTS.NATURE,
        type: ATTACK_TYPES.STRENGTH,
        power: 50,
        meginCost: 30,
        grantsEmpowerment: true
    },
    'Wild Bite': {
        name: 'Wild Bite',
        flavorDescription: 'A savage, powerful clenching of jaws, fueled by the primal ferocity of a deep forest beast.',
        mechanicsDescription: 'Hits opponent.',
        element: ELEMENTS.NATURE,
        type: ATTACK_TYPES.STRENGTH,
        power: 68,
        meginCost: 50
    },
    'Elven Light': {
        name: 'Elven Light',
        flavorDescription: 'Focuses a faint, mesmerizing beam drawn from the magic of the twilight mist.',
        get mechanicsDescription() {
            return `Hits opponent. Next attack deals ${Math.round(GAME_CONFIG.EMPOWERMENT_DAMAGE_BOOST * 100)}% more damage.`;
        },
        element: ELEMENTS.NATURE,
        type: ATTACK_TYPES.WISDOM,
        power: 50,
        meginCost: 30,
        grantsEmpowerment: true
    },
    'Moon Beam': {
        name: 'Moon Beam',
        flavorDescription: 'Gathers the potent, chilling energy of the moon into a destructive ray.',
        mechanicsDescription: 'Hits opponent.',
        element: ELEMENTS.NATURE,
        type: ATTACK_TYPES.WISDOM,
        power: 68,
        meginCost: 50
    },
    'Thick Coat': {
        name: 'Thick Coat',
        flavorDescription: 'Grows a thick protective hide.',
        mechanicsDescription: 'Raises your Defense and Durability by 1 stage.',
        element: ELEMENTS.NATURE,
        type: ATTACK_TYPES.UTILITY,
        power: 0,
        meginCost: 35,
        effect: { type: 'buff', target: 'self', stats: ['defense', 'durability'], stages: 1 }
    },

    // Water Abilities
    'Drown': {
        name: 'Drown',
        flavorDescription: 'Violently drags the opponent down, mimicking the crushing pressure of deep water.',
        get mechanicsDescription() {
            return `Hits opponent. Next attack deals ${Math.round(GAME_CONFIG.EMPOWERMENT_DAMAGE_BOOST * 100)}% more damage.`;
        },
        element: ELEMENTS.WATER,
        type: ATTACK_TYPES.STRENGTH,
        power: 50,
        meginCost: 30,
        grantsEmpowerment: true
    },
    'Icicle Spear': {
        name: 'Icicle Spear',
        flavorDescription: 'Throws a sharp, glacial shard of ice, capable of piercing thick materials.',
        mechanicsDescription: 'Hits opponent.',
        element: ELEMENTS.WATER,
        type: ATTACK_TYPES.STRENGTH,
        power: 68,
        meginCost: 50
    },
    'Hail Storm': {
        name: 'Hail Storm',
        flavorDescription: 'A sudden, freezing downpour of stinging ice and freezing wind.',
        get mechanicsDescription() {
            return `Hits opponent. Next attack deals ${Math.round(GAME_CONFIG.EMPOWERMENT_DAMAGE_BOOST * 100)}% more damage.`;
        },
        element: ELEMENTS.WATER,
        type: ATTACK_TYPES.WISDOM,
        power: 50,
        meginCost: 30,
        grantsEmpowerment: true
    },
    'Tidal Wave': {
        name: 'Tidal Wave',
        flavorDescription: 'Evokes a massive, surging wall of ocean water to engulf the battlefield.',
        mechanicsDescription: 'Hits opponent.',
        element: ELEMENTS.WATER,
        type: ATTACK_TYPES.WISDOM,
        power: 68,
        meginCost: 50
    },
    'Skald\'s Mead': {
        name: 'Skald\'s Mead',
        flavorDescription: 'Passes mead to an ally, clarifying their mind.',
        mechanicsDescription: 'Raises an ally\'s Wisdom by 1 stage.',
        element: ELEMENTS.WATER,
        type: ATTACK_TYPES.UTILITY,
        power: 0,
        meginCost: 35,
        effect: { type: 'buff', target: 'ally', stat: 'wisdom', stages: 1 }
    },

    // Fire Abilities
    'Torch Strike': {
        name: 'Torch Strike',
        flavorDescription: 'A searing blow with a burning torch, delivering simple, raw heat.',
        get mechanicsDescription() {
            return `Hits opponent. Next attack deals ${Math.round(GAME_CONFIG.EMPOWERMENT_DAMAGE_BOOST * 100)}% more damage.`;
        },
        element: ELEMENTS.FIRE,
        type: ATTACK_TYPES.STRENGTH,
        power: 50,
        meginCost: 30,
        grantsEmpowerment: true
    },
    'Flaming Skewer': {
        name: 'Flaming Skewer',
        flavorDescription: 'Impales the enemy with a lance of fire, leaving a burning, painful wound.',
        mechanicsDescription: 'Hits opponent.',
        element: ELEMENTS.FIRE,
        type: ATTACK_TYPES.STRENGTH,
        power: 68,
        meginCost: 50
    },
    'Fire Breath': {
        name: 'Fire Breath',
        flavorDescription: 'Exhales a short, scorching gust of flame from the creature\'s core.',
        get mechanicsDescription() {
            return `Hits opponent. Next attack deals ${Math.round(GAME_CONFIG.EMPOWERMENT_DAMAGE_BOOST * 100)}% more damage.`;
        },
        element: ELEMENTS.FIRE,
        type: ATTACK_TYPES.WISDOM,
        power: 50,
        meginCost: 30,
        grantsEmpowerment: true
    },
    'Lava Jet': {
        name: 'Lava Jet',
        flavorDescription: 'A volcanic burst, shooting a devastating stream of molten rock.',
        mechanicsDescription: 'Hits opponent.',
        element: ELEMENTS.FIRE,
        type: ATTACK_TYPES.WISDOM,
        power: 68,
        meginCost: 50
    },
    'Burning Insult': {
        name: 'Burning Insult',
        flavorDescription: 'Hurls a vicious, withering curse that crushes the enemy\'s resolve.',
        mechanicsDescription: 'Lowers enemy Defense and Durability by 2 stages.',
        element: ELEMENTS.FIRE,
        type: ATTACK_TYPES.UTILITY,
        power: 0,
        meginCost: 50,
        effect: { type: 'debuff', target: 'enemy', stats: ['defense', 'durability'], stages: 2 }
    },

    // Wind Abilities
    'Storm Claw': {
        name: 'Storm Claw',
        flavorDescription: 'A quick, brutal strike delivered with claws riding the speed of a gale.',
        get mechanicsDescription() {
            return `Hits opponent. Next attack deals ${Math.round(GAME_CONFIG.EMPOWERMENT_DAMAGE_BOOST * 100)}% more damage.`;
        },
        element: ELEMENTS.WIND,
        type: ATTACK_TYPES.STRENGTH,
        power: 50,
        meginCost: 30,
        grantsEmpowerment: true
    },
    'Sky Dive': {
        name: 'Sky Dive',
        flavorDescription: 'Plummets from a great height, impacting the target with crushing force.',
        mechanicsDescription: 'Hits opponent.',
        element: ELEMENTS.WIND,
        type: ATTACK_TYPES.STRENGTH,
        power: 68,
        meginCost: 50
    },
    'Wailing Cry': {
        name: 'Wailing Cry',
        flavorDescription: 'Unleashes an agonizing, ghostly shriek that assails the opponent\'s senses.',
        get mechanicsDescription() {
            return `Hits opponent. Next attack deals ${Math.round(GAME_CONFIG.EMPOWERMENT_DAMAGE_BOOST * 100)}% more damage.`;
        },
        element: ELEMENTS.WIND,
        type: ATTACK_TYPES.WISDOM,
        power: 50,
        meginCost: 30,
        grantsEmpowerment: true
    },
    'Wind Gust': {
        name: 'Wind Gust',
        flavorDescription: 'Whips up a powerful, chaotic blast of air to push and punish the enemy.',
        mechanicsDescription: 'Hits opponent.',
        element: ELEMENTS.WIND,
        type: ATTACK_TYPES.WISDOM,
        power: 68,
        meginCost: 50
    },
    'Ethereal Melody': {
        name: 'Ethereal Melody',
        flavorDescription: 'Plays a haunting tune that distracts the enemy.',
        mechanicsDescription: 'Lowers enemy Strength and Wisdom by 1 stage.',
        element: ELEMENTS.WIND,
        type: ATTACK_TYPES.UTILITY,
        power: 0,
        meginCost: 35,
        effect: { type: 'debuff', target: 'enemy', stats: ['strength', 'wisdom'], stages: 1 }
    },

    // Basic Strike (available to all)
    'Basic Strike': {
        name: 'Basic Strike',
        flavorDescription: 'A reflexive and adaptable strike fueled by your element.',
        mechanicsDescription: 'Hits opponent.',
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

// Helper function to check if an ability grants empowerment
function abilityGrantsEmpowerment(abilityName) {
    const ability = ABILITIES[abilityName];
    return ability && ability.grantsEmpowerment === true;
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

// Helper function to get ability power (handles Jätte family passive for Basic Strike)
function getAbilityPower(abilityName, vasenFamily) {
    const ability = ABILITIES[abilityName];
    if (!ability) return 0;
    
    // Jätte family passive: Basic Strike always has 35 power
    if (abilityName === 'Basic Strike' && vasenFamily === FAMILIES.JATTE) {
        return FAMILY_PASSIVE_CONFIG.JATTE_BASIC_STRIKE_POWER;
    }
    
    return ability.power;
}

// Helper to get ability element (handles Basic Strike case)
function getAbilityElement(abilityName, vasenElement) {
    const ability = ABILITIES[abilityName];
    if (!ability) return vasenElement;
    return ability.element || vasenElement;
}

// Helper function to check if ability requires ally targeting
function abilityRequiresAllyTarget(abilityName) {
    const ability = ABILITIES[abilityName];
    if (!ability || !ability.effect) return false;
    return ability.effect.type === 'buff' && ability.effect.target === 'ally';
}
