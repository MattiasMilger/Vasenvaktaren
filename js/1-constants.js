// =============================================================================
// 1-constants.js - Game Constants and Configuration
// =============================================================================

const GAME_CONFIG = {
    MAX_TEAM_SIZE: 3,
    MAX_INVENTORY_SIZE: 99,
    MAX_ITEM_STACK: 99,
    MAX_BATTLE_LOG: 99,
    MAX_LEVEL: 30,
    ENEMY_MAX_LEVEL: 999,
    SAVE_KEY: 'vasenvaktaren_save',
    STARTER_LEVEL: 7,
    BASE_MEGIN: 60,
    MEGIN_PER_LEVEL: 2,
    MEGIN_REGEN_RATE: 0.12,
    SAME_ELEMENT_MEGIN_DISCOUNT: 0.15,
    BASE_LEVEL_UP_EXP: 60,
    LEVEL_UP_ACCELERATION: 5,
    BASE_EXP_YIELD: 25,
    ATTRIBUTE_LEVEL_SCALING_RATE: 0.035,
    POWER_CONSTANT: 250,
    DEFENSE_CONSTANT: 200,
    POST_BATTLE_HEAL_PERCENT: 0.05,
    SACRED_WELL_HEAL_PERCENT: 0.80,
    CORRECT_ITEM_HEAL_PERCENT: 0.80,
    WRONG_ITEM_HEAL_PERCENT: 0.50,
    MAX_OFFERS_PER_COMBAT: 3,
    MAX_ATTRIBUTE_STAGE: 5,
    MIN_ATTRIBUTE_STAGE: -5,
    ATTRIBUTE_STAGE_MODIFIER: 0.1
};

// Starter Väsen options (species keys from VASEN_SPECIES)
const STARTER_VASEN = ['Landvatte', 'Gardstomte', 'Hustomte'];

const ELEMENTS = {
    EARTH: 'Earth',
    NATURE: 'Nature',
    WATER: 'Water',
    FIRE: 'Fire',
    WIND: 'Wind'
};

const ELEMENT_LIST = Object.values(ELEMENTS);

const ELEMENT_COLORS = {
    [ELEMENTS.EARTH]: '#8B6914',
    [ELEMENTS.NATURE]: '#2E7D32',
    [ELEMENTS.WATER]: '#1565C0',
    [ELEMENTS.FIRE]: '#C62828',
    [ELEMENTS.WIND]: '#7E57C2'
};

const DAMAGE_MULTIPLIERS = {
    POTENT: 1.4,
    NEUTRAL: 1.0,
    WEAK: 0.7
};

// Element matchups: attacker -> defender -> multiplier type
const ELEMENT_MATCHUPS = {
    [ELEMENTS.EARTH]: {
        [ELEMENTS.EARTH]: 'NEUTRAL',
        [ELEMENTS.NATURE]: 'WEAK',
        [ELEMENTS.WATER]: 'NEUTRAL',
        [ELEMENTS.FIRE]: 'POTENT',
        [ELEMENTS.WIND]: 'POTENT'
    },
    [ELEMENTS.NATURE]: {
        [ELEMENTS.EARTH]: 'POTENT',
        [ELEMENTS.NATURE]: 'NEUTRAL',
        [ELEMENTS.WATER]: 'POTENT',
        [ELEMENTS.FIRE]: 'WEAK',
        [ELEMENTS.WIND]: 'WEAK'
    },
    [ELEMENTS.WATER]: {
        [ELEMENTS.EARTH]: 'POTENT',
        [ELEMENTS.NATURE]: 'NEUTRAL',
        [ELEMENTS.WATER]: 'NEUTRAL',
        [ELEMENTS.FIRE]: 'POTENT',
        [ELEMENTS.WIND]: 'WEAK'
    },
    [ELEMENTS.FIRE]: {
        [ELEMENTS.EARTH]: 'WEAK',
        [ELEMENTS.NATURE]: 'POTENT',
        [ELEMENTS.WATER]: 'WEAK',
        [ELEMENTS.FIRE]: 'NEUTRAL',
        [ELEMENTS.WIND]: 'NEUTRAL'
    },
    [ELEMENTS.WIND]: {
        [ELEMENTS.EARTH]: 'WEAK',
        [ELEMENTS.NATURE]: 'WEAK',
        [ELEMENTS.WATER]: 'NEUTRAL',
        [ELEMENTS.FIRE]: 'POTENT',
        [ELEMENTS.WIND]: 'NEUTRAL'
    }
};

const RARITIES = {
    COMMON: 'Common',
    UNCOMMON: 'Uncommon',
    RARE: 'Rare',
    MYTHICAL: 'Mythical'
};

const RARITY_MULTIPLIERS = {
    [RARITIES.COMMON]: 1.0,
    [RARITIES.UNCOMMON]: 1.1,
    [RARITIES.RARE]: 1.2,
    [RARITIES.MYTHICAL]: 1.4
};

const RARITY_EXP_BONUS = {
    [RARITIES.COMMON]: 1.0,
    [RARITIES.UNCOMMON]: 1.1,
    [RARITIES.RARE]: 1.2,
    [RARITIES.MYTHICAL]: 1.4
};

const ENCOUNTER_RATES = {
    [RARITIES.COMMON]: 0.50,
    [RARITIES.UNCOMMON]: 0.25,
    [RARITIES.RARE]: 0.175,
    [RARITIES.MYTHICAL]: 0.075
};

const EXPLORATION_RATES = {
    WILD_VASEN: 0.53,
    ITEM: 0.24,
    SACRED_WELL: 0.13,
    RUNE: 0.1
};

const FAMILIES = {
    VATTE: 'Vätte',
    VALNAD: 'Vålnad',
    ODJUR: 'Odjur',
    TROLL: 'Troll',
    RA: 'Rå',
    ALV: 'Alv',
    ANDE: 'Ande',
    JATTE: 'Jätte',
    DRAKE: 'Drake'
};

const FAMILY_DESCRIPTIONS = {
    [FAMILIES.VATTE]: 'Tiny and elusive wardens of specific domains. They can be helpful if respected, or vengeful if slighted. They are rarely seen by human eyes.',
    [FAMILIES.VALNAD]: 'The tormented, animated remains or spirits of the dead. Bound to a place or an action, they often seek revenge or inflict misery on the living.',
    [FAMILIES.ODJUR]: 'Supernatural beasts and monstrous offspring of the Gods or Giants. They embody raw natural forces and the terrifying elements of the wild.',
    [FAMILIES.TROLL]: 'Ragged inhabitants of the mountains and deep woods, possessing formidable Strength and an ancient, primal cunning. They fear only the dawn, which locks their great bulk into a frozen, inert monument; they turn to stone upon exposure to sunlight.',
    [FAMILIES.RA]: 'Seductive, nature-bound spirits with the power to enchant and entrap humans. Their true nature is often betrayed by a tell-tale physical flaw.',
    [FAMILIES.ALV]: 'Humanoid beings of potent magic, divided between the light and the dark. They possess uncanny skill in craft, smithing, or weaving illusions.',
    [FAMILIES.ANDE]: 'Spirits of a mystical or semi-divine nature, serving greater powers or guarding sacred places.',
    [FAMILIES.JATTE]: 'Ancient, colossal beings of immense power, often representing the elemental forces and chaos. They are the sworn enemies of the Asir Gods.',
    [FAMILIES.DRAKE]: 'Colossal, serpentine creatures of immense magical power, often linked to cosmic forces and the destruction of the world tree.'
};

const BASE_ATTRIBUTES = {
    [FAMILIES.VATTE]: { strength: 70, wisdom: 45, health: 55, defense: 55, durability: 80 },
    [FAMILIES.VALNAD]: { strength: 45, wisdom: 70, health: 55, defense: 80, durability: 55 },
    [FAMILIES.ODJUR]: { strength: 85, wisdom: 55, health: 65, defense: 55, durability: 45 },
    [FAMILIES.TROLL]: { strength: 55, wisdom: 55, health: 70, defense: 70, durability: 60 },
    [FAMILIES.RA]: { strength: 45, wisdom: 80, health: 60, defense: 65, durability: 60 },
    [FAMILIES.ALV]: { strength: 50, wisdom: 85, health: 60, defense: 55, durability: 60 },
    [FAMILIES.ANDE]: { strength: 50, wisdom: 75, health: 55, defense: 85, durability: 50 },
    [FAMILIES.JATTE]: { strength: 75, wisdom: 50, health: 85, defense: 55, durability: 50 },
    [FAMILIES.DRAKE]: { strength: 65, wisdom: 75, health: 60, defense: 60, durability: 85 }
};

const ELEMENT_BONUSES = {
    [ELEMENTS.EARTH]: { defense: 5 },
    [ELEMENTS.NATURE]: { health: 5 },
    [ELEMENTS.WATER]: { wisdom: 5 },
    [ELEMENTS.FIRE]: { strength: 5 },
    [ELEMENTS.WIND]: { durability: 5 }
};

const ABILITY_LEARN_LEVELS = [1, 5, 10, 20];

const TEMPERAMENTS = {
    FEROCIOUS: { name: 'Ferocious', positive: 'strength', negative: 'health', modifier: 5 },
    BRUTAL: { name: 'Brutal', positive: 'strength', negative: 'defense', modifier: 5 },
    SAVAGE: { name: 'Savage', positive: 'strength', negative: 'durability', modifier: 5 },
    ALERT: { name: 'Alert', positive: 'wisdom', negative: 'health', modifier: 5 },
    THOUGHTFUL: { name: 'Thoughtful', positive: 'wisdom', negative: 'defense', modifier: 5 },
    FOCUSED: { name: 'Focused', positive: 'wisdom', negative: 'durability', modifier: 5 },
    RESILIENT: { name: 'Resilient', positive: 'health', negative: 'defense', modifier: 5 },
    HEALTHY: { name: 'Healthy', positive: 'health', negative: 'durability', modifier: 5 },
    WARY: { name: 'Wary', positive: 'defense', negative: 'health', modifier: 5 },
    STALWART: { name: 'Stalwart', positive: 'defense', negative: 'durability', modifier: 5 },
    ENDURING: { name: 'Enduring', positive: 'durability', negative: 'health', modifier: 5 },
    VIGILANT: { name: 'Vigilant', positive: 'durability', negative: 'defense', modifier: 5 }
};

const TEMPERAMENT_LIST = Object.keys(TEMPERAMENTS);

const ZONES = {
    TROLLSKOGEN: {
        id: 'trollskogen',
        name: 'Trollskogen',
        description: 'An enchanted forest where the ancient canopy chokes out the sun. The air is thick with the scent of damp moss, and the unseen inhabitants constantly watch you from the gloom.',
        levelRange: [1, 4],
        spawns: ['Skogstroll', 'Skogsra', 'Hyllemor', 'Alva', 'Lindorm', 'Ljusalv'],
        guardian: {
            name: 'Hjördis',
            team: [
                { species: 'Alva', level: 5, temperament: 'HEALTHY', runes: ['NAUDIZ'] },
                { species: 'Skogsra', level: 5, temperament: 'ENDURING', runes: ['URUZ'] },
                { species: 'Lindorm', level: 5, temperament: 'STALWART', runes: ['WYNJA'] }
            ],
            dialogue: {
                challenge: 'The forest tests all who enter. Show me your Strength, little one.',
                lose: 'You lack the true spirit of the woods. Train more, and perhaps this enchanted realm will accept you.',
                win: 'Impressive. You have earned passage through this realm. The way to Folkets By is now open.'
            }
        },
        order: 0
    },
    FOLKETS_BY: {
        id: 'folkets_by',
        name: 'Folkets By',
        description: 'A cluster of quiet, humble settlements where ancient house spirits live side-by-side with humans. Tread carefully, for the peace is fragile, and the benevolent guardians turn fiercely protective when their homes are threatened.',
        levelRange: [5, 9],
        spawns: ['Gardstomte', 'Hustomte', 'Nattramn', 'Bortbyting', 'Gloson'],
        guardian: {
            name: 'Åsa',
            team: [
                { species: 'Gardstomte', level: 10, temperament: 'SAVAGE', runes: ['HAGAL'] },
                { species: 'Nattramn', level: 10, temperament: 'RESILIENT', runes: ['EHWAZ'] },
                { species: 'Gloson', level: 10, temperament: 'VIGILANT', runes: ['PERTHO'] }
            ],
            dialogue: {
                challenge: 'I am the defender of the quiet folk. Disturbance is not tolerated. Prepare to leave this village.',
                lose: 'Go home, trespasser. The spirits of the hearth demand respect, not defeat. Do not return until you are ready.',
                win: 'A true protector is hard to find. You have proven worthy. Enter the darkness of Djupa Gruvan, if you dare.'
            }
        },
        order: 1
    },
    DJUPA_GRUVAN: {
        id: 'djupa_gruvan',
        name: 'Djupa Gruvan',
        description: 'An endless labyrinth of cold, black tunnels carved by greed. Only the muffled echo of a pickaxe and the hungry glow of rare ore disturb the crushing silence, guarded by unforgiving spirits who despise light and trespassers.',
        levelRange: [10, 14],
        spawns: ['Landvatte', 'Myling', 'Gruvra', 'Svartalv', 'Fafner'],
        guardian: {
            name: 'Gerd',
            team: [
                { species: 'Svartalv', level: 15, temperament: 'ALERT', runes: ['FEHU'] },
                { species: 'Myling', level: 15, temperament: 'THOUGHTFUL', runes: ['ODAL'] },
                { species: 'Fafner', level: 15, temperament: 'WARY', runes: ['KAUNAN'] }
            ],
            dialogue: {
                challenge: 'The earth\'s treasures are mine to guard. You must be strong enough to face the pressure of the deep rock.',
                lose: 'The mine is unforgiving. Your resolve turned to dust. Go back to the light and gather more Wisdom.',
                win: 'Your effort is sharper than my ore. The path is clear. The flowing waters of Glimrande Källan await.'
            }
        },
        order: 2
    },
    GLIMRANDE_KALLAN: {
        id: 'glimrande_kallan',
        name: 'Glimrande Källan',
        description: 'A realm of crystal-clear rivers and deep, silent pools. The water reflects a deceptively serene beauty, hiding seductive, aquatic predators whose magic draws the unwary down into their cold, watery graves.',
        levelRange: [15, 19],
        spawns: ['Irrbloss', 'Strandvaskare', 'Backahast', 'Nacken', 'Jormungandr'],
        guardian: {
            name: 'Ragnar',
            team: [
                { species: 'Backahast', level: 20, temperament: 'BRUTAL', runes: ['GIFU'] },
                { species: 'Irrbloss', level: 20, temperament: 'VIGILANT', runes: ['INGUZ'] },
                { species: 'Jormungandr', level: 20, temperament: 'STALWART', runes: ['ISAZ'] }
            ],
            dialogue: {
                challenge: 'The currents of the deep are treacherous, and I am the tide. Let us see if you sink or swim.',
                lose: 'The depths claimed you. Your spirit is not yet strong enough to master the water\'s fury.',
                win: 'You defied the call of the water. Your journey continues to the ancient, colossal lands of Urbergen.'
            }
        },
        order: 3
    },
    URBERGEN: {
        id: 'urbergen',
        name: 'Urbergen',
        description: 'The raw, frozen, and towering bedrock that predates humankind. It is a world of eternal, howling wind and untamed, colossal forces, where the children of the giants battle the very elements that forged them.',
        levelRange: [20, 24],
        spawns: ['Bergatroll', 'Jotun', 'Eldturs', 'Rimturs'],
        guardian: {
            name: 'Sigurd',
            team: [
                { species: 'Bergatroll', level: 25, temperament: 'RESILIENT', runes: ['THURS'] },
                { species: 'Eldturs', level: 25, temperament: 'FEROCIOUS', runes: ['KAUNAN'] },
                { species: 'Rimturs', level: 25, temperament: 'WARY', runes: ['RAIDO'] }
            ],
            dialogue: {
                challenge: 'We are the forces of chaos, the ancient Strength of the raw elements. Face your doom!',
                lose: 'You are just dust beneath the mountains. The giants will not be bested by such weakness.',
                win: 'A colossal effort! Your power is vast. Behold, the final frontier: Världens Ände.'
            }
        },
        order: 4
    },
    VARLDENS_ANDE: {
        id: 'varldens_ande',
        name: 'Världens Ände',
        description: 'The desolate, foreboding threshold of reality. This land is a cursed battlefield where the forces of fate collide, and only the chosen warriors prepare for the ultimate destruction and rebirth of the cosmos.',
        levelRange: [25, 29],
        spawns: ['Einharje', 'Valkyria', 'Rasvelg', 'Fenrir', 'Nidhogg'],
        guardian: {
            name: 'Gylfe',
            team: [
                { species: 'Fenrir', level: 30, temperament: 'VIGILANT', runes: ['GIFU', 'HAGAL'] },
                { species: 'Rasvelg', level: 30, temperament: 'ENDURING', runes: ['ANSUZ', 'TYR'] },
                { species: 'Nidhogg', level: 30, temperament: 'FOCUSED', runes: ['THURS', 'NAUDIZ'] }
            ],
            dialogue: {
                challenge: 'This is where destiny is decided. The heroes of Valhalla and their enemies await the end. Prove your fate.',
                lose: 'Ragnarök is not for the weak. You must return, prepared to face the true end of all things.',
                win: 'The gods themselves have witnessed your victory. You have mastered fate. The primordial void of Ginnungagap is open to you.'
            }
        },
        order: 5
    },
    GINNUNGAGAP: {
        id: 'ginnungagap',
        name: 'Ginnungagap',
        description: 'The vast, primordial void that preceded all creation. It is an unending, echoing expanse of pure potential and ultimate challenge, containing every creature from the realms for those who seek the peak of mastery.',
        levelRange: [30, 30],
        spawns: 'ALL',
        guardian: null,
        order: 6
    }
};

const ZONE_ORDER = ['TROLLSKOGEN', 'FOLKETS_BY', 'DJUPA_GRUVAN', 'GLIMRANDE_KALLAN', 'URBERGEN', 'VARLDENS_ANDE', 'GINNUNGAGAP'];

const ACHIEVEMENTS = {
    CHAMPION: { id: 'champion', name: 'Champion', description: 'Defeat all the zone guardians' },
    RUNE_MASTER: { id: 'rune_master', name: 'Rune Master', description: 'Collect all the runes' },
    HOARDER: { id: 'hoarder', name: 'hoarder', description: 'Tame every Väsen type' },
};

// Helper functions for constants
function getElementMatchup(attackerElement, defenderElement) {
    const matchupType = ELEMENT_MATCHUPS[attackerElement][defenderElement];
    return DAMAGE_MULTIPLIERS[matchupType];
}

function getMatchupType(attackerElement, defenderElement) {
    return ELEMENT_MATCHUPS[attackerElement][defenderElement];
}

function getAttributeStageModifier(stage) {
    return 1 + (GAME_CONFIG.ATTRIBUTE_STAGE_MODIFIER * stage);
}

function getRequiredExpForLevel(level) {
    return Math.floor(
        (GAME_CONFIG.BASE_LEVEL_UP_EXP * level) + 
        (GAME_CONFIG.LEVEL_UP_ACCELERATION * level * level)
    );
}

function getExpYield(enemyLevel, rarity) {
    const rarityBonus = RARITY_EXP_BONUS[rarity] || 1.0;
    return Math.floor(GAME_CONFIG.BASE_EXP_YIELD * enemyLevel * rarityBonus);
}

// Convenience constants for frequently used values
const SAVE_KEY = GAME_CONFIG.SAVE_KEY;
const SAVE_VERSION = 1;
const MAX_PARTY_SIZE = GAME_CONFIG.MAX_TEAM_SIZE;
const MAX_VASEN_COLLECTION = GAME_CONFIG.MAX_INVENTORY_SIZE;
