// =============================================================================
// 2-data-skills.js - All Skill Definitions
// =============================================================================

const ATTACK_TYPES = {
    STRENGTH: 'Strength Attack',
    WISDOM: 'Wisdom Attack',
    MIXED: 'Mixed Attack',
    UTILITY: 'Utility'
};

const ABILITIES = {
    // Earth Skills
    'Ground Stomp': {
        name: 'Ground Stomp',
        flavorDescription: 'Slams the ground with force, sending a stunning shockwave through the bedrock.',
        get mechanicsDescription() {
            return `Hits enemy. Empowers next attack by ${Math.round(GAME_CONFIG.TIER1_ATTACK_SKILL_EMPOWERMENT * 100)}%.`;
        },
        element: ELEMENTS.EARTH,
        type: ATTACK_TYPES.STRENGTH,
        power: GAME_CONFIG.TIER1_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER1_ATTACK_SKILL_MEGIN,
        grantsEmpowerment: true
    },
    'Boulder Toss': {
        name: 'Boulder Toss',
        flavorDescription: 'Hurls a colossal, jagged rock, delivering the crushing weight of a mountain.',
        mechanicsDescription: 'Hits enemy.',
        element: ELEMENTS.EARTH,
        type: ATTACK_TYPES.STRENGTH,
        power: GAME_CONFIG.TIER2_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER2_ATTACK_SKILL_MEGIN
    },
    'Sinkhole': {
        name: 'Sinkhole',
        flavorDescription: 'Collapses and softens the earth, opening a treacherous pit beneath the enemy.',
        get mechanicsDescription() {
            return `Hits enemy. Empowers next attack by ${Math.round(GAME_CONFIG.TIER1_ATTACK_SKILL_EMPOWERMENT * 100)}%.`;
        },
        element: ELEMENTS.EARTH,
        type: ATTACK_TYPES.WISDOM,
        power: GAME_CONFIG.TIER1_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER1_ATTACK_SKILL_MEGIN,
        grantsEmpowerment: true
    },
    'Landslide': {
        name: 'Landslide',
        flavorDescription: 'Summons a chaotic torrent of debris, burying the enemy under loose soil and stone.',
        mechanicsDescription: 'Hits enemy.',
        element: ELEMENTS.EARTH,
        type: ATTACK_TYPES.WISDOM,
        power: GAME_CONFIG.TIER2_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER2_ATTACK_SKILL_MEGIN
    },
    'Smithing': {
        name: 'Smithing',
        flavorDescription: 'Channels ancient forging magic to an ally, awakening their might.',
        mechanicsDescription: `Raises an ally\'s Strength by 1 stage.`,
        element: ELEMENTS.EARTH,
        type: ATTACK_TYPES.UTILITY,
        power: 0,
        meginCost: GAME_CONFIG.TIER1_UTILITY_SKILL_MEGIN,
        effect: { type: 'buff', target: 'ally', stat: 'strength', stages: 1 },
        initialBonus: 1
    },
    'Giantsbane': {
        name: 'Giantsbane',
        flavorDescription: 'Delivers a crushing blow that turns an enemy\'s vitality into their own downfall.',
        get mechanicsDescription() {
            return `Hits enemy. Power bonus from ${Math.round(GAME_CONFIG.GIANTSBANE_BONUS * 100)}% of their current HP.`;
        },
        element: ELEMENTS.EARTH,
        type: ATTACK_TYPES.STRENGTH,
        power: 1,
        target_hp_bonus_percent: GAME_CONFIG.GIANTSBANE_BONUS,
        meginCost: 70,
        giantsbaneBonus: true
    },

    // Fire Skills
    'Torch Strike': {
        name: 'Torch Strike',
        flavorDescription: 'Delivers a searing blow with a burning torch, releasing raw heat.',
        get mechanicsDescription() {
            return `Hits enemy. Empowers next attack by ${Math.round(GAME_CONFIG.TIER1_ATTACK_SKILL_EMPOWERMENT * 100)}%.`;
        },
        element: ELEMENTS.FIRE,
        type: ATTACK_TYPES.STRENGTH,
        power: GAME_CONFIG.TIER1_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER1_ATTACK_SKILL_MEGIN,
        grantsEmpowerment: true
    },
    'Flaming Skewer': {
        name: 'Flaming Skewer',
        flavorDescription: 'Impales the enemy with a lance of fire, leaving a burning, painful wound.',
        mechanicsDescription: 'Hits enemy.',
        element: ELEMENTS.FIRE,
        type: ATTACK_TYPES.STRENGTH,
        power: GAME_CONFIG.TIER2_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER2_ATTACK_SKILL_MEGIN
    },
    'Fire Breath': {
        name: 'Fire Breath',
        flavorDescription: 'Channels ancient internal heat to exhale a scorching gust from the core.',
        get mechanicsDescription() {
            return `Hits enemy. Empowers next attack by ${Math.round(GAME_CONFIG.TIER1_ATTACK_SKILL_EMPOWERMENT * 100)}%.`;
        },
        element: ELEMENTS.FIRE,
        type: ATTACK_TYPES.WISDOM,
        power: GAME_CONFIG.TIER1_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER1_ATTACK_SKILL_MEGIN,
        grantsEmpowerment: true
    },
    'Lava Jet': {
        name: 'Lava Jet',
        flavorDescription: 'Unleashes a volcanic burst, shooting a devastating stream of molten rock.',
        mechanicsDescription: 'Hits enemy.',
        element: ELEMENTS.FIRE,
        type: ATTACK_TYPES.WISDOM,
        power: GAME_CONFIG.TIER2_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER2_ATTACK_SKILL_MEGIN
    },
    'Burning Insult': {
        name: 'Burning Insult',
        flavorDescription: 'Hurls a vicious, withering curse that crushes the enemy\'s resolve.',
        mechanicsDescription: `Lowers enemy\'s defense and durability by 1 stage.`,
        element: ELEMENTS.FIRE,
        type: ATTACK_TYPES.UTILITY,
        power: 0,
        meginCost: GAME_CONFIG.TIER1_UTILITY_SKILL_MEGIN,
        effect: { type: 'debuff', target: 'enemy', attributes: ['defense', 'durability'], stages: 1 },
        initialBonus: 1
    },
    'Loki\'s Betrayal': {
        name: 'Loki\'s Betrayal',
        flavorDescription: 'A deep cut from the dark, causing more damage to the weak and frail.',
        get mechanicsDescription() {
            return `Hits enemy. +${GAME_CONFIG.LOKISBETRAYAL_BONUS} power if they are debuffed.`;
        },
        element: ELEMENTS.FIRE,
        type: ATTACK_TYPES.WISDOM,
        power: 50,
        enemy_debuff_bonus: GAME_CONFIG.LOKISBETRAYAL_BONUS,
        meginCost: 50,
        lokiBetrayalBonus: true
    },

    // Nature Skills
    'Vine Whip': {
        name: 'Vine Whip',
        flavorDescription: 'Commands swift, thorny briars from the wilderness to lash the enemy.',
        get mechanicsDescription() {
            return `Hits enemy. Empowers next attack by ${Math.round(GAME_CONFIG.TIER1_ATTACK_SKILL_EMPOWERMENT * 100)}%.`;
        },
        element: ELEMENTS.NATURE,
        type: ATTACK_TYPES.STRENGTH,
        power: GAME_CONFIG.TIER1_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER1_ATTACK_SKILL_MEGIN,
        grantsEmpowerment: true
    },
    'Wild Bite': {
        name: 'Wild Bite',
        flavorDescription: 'Snaps with savage, powerful jaws fueled by the primal ferocity of the deep forest.',
        mechanicsDescription: 'Hits enemy.',
        element: ELEMENTS.NATURE,
        type: ATTACK_TYPES.STRENGTH,
        power: GAME_CONFIG.TIER2_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER2_ATTACK_SKILL_MEGIN
    },
    'Elven Light': {
        name: 'Elven Light',
        flavorDescription: 'Focuses a faint, mesmerizing beam drawn from the twilight mist.',
        get mechanicsDescription() {
            return `Hits enemy. Empowers next attack by ${Math.round(GAME_CONFIG.TIER1_ATTACK_SKILL_EMPOWERMENT * 100)}%.`;
        },
        element: ELEMENTS.NATURE,
        type: ATTACK_TYPES.WISDOM,
        power: GAME_CONFIG.TIER1_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER1_ATTACK_SKILL_MEGIN,
        grantsEmpowerment: true
    },
    'Moon Beam': {
        name: 'Moon Beam',
        flavorDescription: 'Gathers the potent, chilling energy of the moon into a destructive ray.',
        mechanicsDescription: 'Hits enemy.',
        element: ELEMENTS.NATURE,
        type: ATTACK_TYPES.WISDOM,
        power: GAME_CONFIG.TIER2_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER2_ATTACK_SKILL_MEGIN
    },
    'Thick Coat': {
        name: 'Thick Coat',
        flavorDescription: 'Toughens your body to endure the harshest elements and fiercest strikes.',
        mechanicsDescription: `Raises your defense and durability by 1 stage.`,
        element: ELEMENTS.NATURE,
        type: ATTACK_TYPES.UTILITY,
        power: 0,
        meginCost: GAME_CONFIG.TIER1_UTILITY_SKILL_MEGIN,
        effect: { type: 'buff', target: 'self', attributes: ['defense', 'durability'], stages: 1 },
        initialBonus: 1
    },
    'Rotvalta': {
        name: 'Rotvälta',
        flavorDescription: 'Triggers a sudden, crushing eruption of roots amplified by the enemy\'s aggression.',
        get mechanicsDescription() {
            return `Hits enemy. +${GAME_CONFIG.ROTVALTA_BONUS} power if they attack you.`;
        },
        element: ELEMENTS.NATURE,
        type: ATTACK_TYPES.STRENGTH,
        power: 38,
        meginCost: 50,
        retaliationBonus: GAME_CONFIG.ROTVALTA_BONUS
    },

    // Water Skills
    'Drown': {
        name: 'Drown',
        flavorDescription: 'Violently drags the enemy down and suffocates them.',
        get mechanicsDescription() {
            return `Hits enemy. Empowers next attack by ${Math.round(GAME_CONFIG.TIER1_ATTACK_SKILL_EMPOWERMENT * 100)}%.`;
        },
        element: ELEMENTS.WATER,
        type: ATTACK_TYPES.STRENGTH,
        power: GAME_CONFIG.TIER1_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER1_ATTACK_SKILL_MEGIN,
        grantsEmpowerment: true
    },
    'Icicle Spear': {
        name: 'Icicle Spear',
        flavorDescription: 'Throws a sharp, glacial shard of ice, capable of piercing thick materials.',
        mechanicsDescription: 'Hits enemy.',
        element: ELEMENTS.WATER,
        type: ATTACK_TYPES.STRENGTH,
        power: GAME_CONFIG.TIER2_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER2_ATTACK_SKILL_MEGIN
    },
    'Hail Storm': {
        name: 'Hail Storm',
        flavorDescription: 'A sudden, freezing downpour of stinging ice and freezing wind.',
        get mechanicsDescription() {
            return `Hits enemy. Empowers next attack by ${Math.round(GAME_CONFIG.TIER1_ATTACK_SKILL_EMPOWERMENT * 100)}%.`;
        },
        element: ELEMENTS.WATER,
        type: ATTACK_TYPES.WISDOM,
        power: GAME_CONFIG.TIER1_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER1_ATTACK_SKILL_MEGIN,
        grantsEmpowerment: true
    },
    'Tidal Wave': {
        name: 'Tidal Wave',
        flavorDescription: 'Evokes a massive, surging wall of ocean water to engulf the battlefield.',
        mechanicsDescription: 'Hits enemy.',
        element: ELEMENTS.WATER,
        type: ATTACK_TYPES.WISDOM,
        power: GAME_CONFIG.TIER2_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER2_ATTACK_SKILL_MEGIN
    },
    'Skald\'s Mead': {
        name: 'Skald\'s Mead',
        flavorDescription: 'Passes mead to an ally, clarifying their mind and sharpening their focus.',
        mechanicsDescription: `Raises an ally\'s Wisdom by 1 stage.`,
        element: ELEMENTS.WATER,
        type: ATTACK_TYPES.UTILITY,
        power: 0,
        meginCost: GAME_CONFIG.TIER1_UTILITY_SKILL_MEGIN,
        effect: { type: 'buff', target: 'ally', stat: 'wisdom', stages: 1 },
        initialBonus: 1
    },
    'Freya\'s Tears': {
    name: 'Freya\'s Tears',
    flavorDescription: 'Calls upon Freya to rain down replenishing tears.',
    get mechanicsDescription() {
        const totalHealthPercent = (GAME_CONFIG.FREYASTEARS_HEALTH_REGEN_PERCENT * 100) * GAME_CONFIG.FREYASTEARS_TURNS;
        const meginMultiplier = GAME_CONFIG.FREYASTEARS_MEGIN_MULTIPLIER;
        const turns = GAME_CONFIG.FREYASTEARS_TURNS;

        return `Your side restores ${totalHealthPercent}% health and ${meginMultiplier}x megin over the next ${turns} turns.`;
    },
    element: ELEMENTS.WATER,
    type: ATTACK_TYPES.UTILITY,
    power: 0,
    meginCost: 50,
    effect: { type: 'freyastears' }
},

    // Wind Skills
    'Storm Claw': {
        name: 'Storm Claw',
        flavorDescription: 'A quick, brutal strike delivered with claws riding the speed of a gale.',
        get mechanicsDescription() {
            return `Hits enemy. Empowers next attack by ${Math.round(GAME_CONFIG.TIER1_ATTACK_SKILL_EMPOWERMENT * 100)}%.`;
        },
        element: ELEMENTS.WIND,
        type: ATTACK_TYPES.STRENGTH,
        power: GAME_CONFIG.TIER1_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER1_ATTACK_SKILL_MEGIN,
        grantsEmpowerment: true
    },
    'Sky Dive': {
        name: 'Sky Dive',
        flavorDescription: 'Plummets from a great height, impacting the enemy with crushing force.',
        mechanicsDescription: 'Hits enemy.',
        element: ELEMENTS.WIND,
        type: ATTACK_TYPES.STRENGTH,
        power: GAME_CONFIG.TIER2_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER2_ATTACK_SKILL_MEGIN
    },
    'Wailing Cry': {
        name: 'Wailing Cry',
        flavorDescription: 'Unleashes an agonizing, ghostly shriek that assails the enemy\'s senses.',
        get mechanicsDescription() {
            return `Hits enemy. Empowers next attack by ${Math.round(GAME_CONFIG.TIER1_ATTACK_SKILL_EMPOWERMENT * 100)}%.`;
        },
        element: ELEMENTS.WIND,
        type: ATTACK_TYPES.WISDOM,
        power: GAME_CONFIG.TIER1_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER1_ATTACK_SKILL_MEGIN,
        grantsEmpowerment: true
    },
    'Wind Gust': {
        name: 'Wind Gust',
        flavorDescription: 'Whips up a powerful, chaotic blast of air to push and punish the enemy.',
        mechanicsDescription: 'Hits enemy.',
        element: ELEMENTS.WIND,
        type: ATTACK_TYPES.WISDOM,
        power: GAME_CONFIG.TIER2_ATTACK_SKILL_POWER,
        meginCost: GAME_CONFIG.TIER2_ATTACK_SKILL_MEGIN
    },
    'Enchanting Song': {
        name: 'Enchanting Song',
        flavorDescription: 'Plays a haunting, otherworldly tune that deeply entrances the enemy.',
        mechanicsDescription: `Lowers enemy\'s strength and wisdom by 1 stage.`,
        element: ELEMENTS.WIND,
        type: ATTACK_TYPES.UTILITY,
        power: 0,
        meginCost: GAME_CONFIG.TIER1_UTILITY_SKILL_MEGIN,
        effect: { type: 'debuff', target: 'enemy', attributes: ['strength', 'wisdom'], stages: 1 },
        initialBonus: 1
    },
    'Tyr\'s Sacrifice': {
        name: 'Tyr\'s Sacrifice',
        flavorDescription: 'Severs a piece of your own vitality to secure a desperate, fateful blessing.',
        get mechanicsDescription() {
            return `Sacrifices health to raise all attributes by ${GAME_CONFIG.TYRS_SACRIFICE_STAGES} stages.`;
        },
        element: ELEMENTS.WIND,
        type: ATTACK_TYPES.UTILITY,
        power: 0,
        meginCost: 35,
        healthCost: 0.25,
        effect: { type: 'tyrs_sacrifice' }
    },

    // Basic Strike (available to all)
    'Basic Strike': {
        name: 'Basic Strike',
        flavorDescription: 'Delivers a reflexive and adaptable strike empowered by native elemental energy.',
        mechanicsDescription: 'Hits enemy.',
        element: null, // Uses the Väsen's own element
        type: ATTACK_TYPES.MIXED,
        power: 20,
        meginCost: 0
    }
};

// Helper function to check if a skill is damaging
function isSkillDamaging(skillName) {
    const skill = ABILITIES[skillName];
    return skill && skill.type !== ATTACK_TYPES.UTILITY;
}

// Helper function to check if a skill grants empowerment
function skillGrantsEmpowerment(skillName) {
    const skill = ABILITIES[skillName];
    return skill && skill.grantsEmpowerment === true;
}

// Helper function to get skill's actual megin cost for a specific element
function getSkillMeginCost(skillName, vasenElement) {
    const skill = ABILITIES[skillName];
    if (!skill) return 0;
    
    const basesCost = skill.meginCost;
    const skillElement = skill.element || vasenElement; // Basic Strike uses Väsen's element
    
    if (skillElement === vasenElement) {
        return Math.floor(basesCost * (1 - GAME_CONFIG.SAME_ELEMENT_MEGIN_DISCOUNT));
    }
    return basesCost;
}

// Helper function to get skill power (handles Jätte family passive for Basic Strike)
function getSkillPower(skillName, vasenFamily) {
    const skill = ABILITIES[skillName];
    if (!skill) return 0;
    
    // Jätte family passive: Basic Strike always has 35 power
    if (skillName === 'Basic Strike' && vasenFamily === FAMILIES.JATTE) {
        return FAMILY_PASSIVE_CONFIG.JATTE_BASIC_STRIKE_POWER;
    }
    
    return skill.power;
}

// Helper to get skill element (handles Basic Strike case)
function getSkillElement(skillName, vasenElement) {
    const skill = ABILITIES[skillName];
    if (!skill) return vasenElement;
    return skill.element || vasenElement;
}

// Helper function to check if skill requires ally targeting
function skillRequiresAllyTarget(skillName) {
    const skill = ABILITIES[skillName];
    if (!skill || !skill.effect) return false;
    return skill.effect.type === 'buff' && skill.effect.target === 'ally';
}