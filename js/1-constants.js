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
    BASE_LEVEL_UP_EXP: 55,
    LEVEL_UP_ACCELERATION: 5,
    BASE_EXP_YIELD: 35,
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
    ATTRIBUTE_STAGE_MODIFIER: 0.1,
    // Pity thresholds for exploration anti-grief system
    PITY_BATTLE_THRESHOLD: 4,
    PITY_ITEM_THRESHOLD: 5,
    PITY_RUNE_THRESHOLD: 20,
    PITY_SACRED_WELL_THRESHOLD: 4,
    // Input delay after each battle action to prevent spamming through turns (in milliseconds)
    BATTLE_INPUT_DELAY: 800
};

// Family Passive Configuration
const FAMILY_PASSIVE_CONFIG = {
    // Alv: Innate Megin - increases max Megin by 14%
    ALV_MEGIN_BOOST: 0.14,
    
    // Ande: Ethereal Surge - raises one random attribute by 1 stage when entering battlefield
    ANDE_ATTRIBUTE_STAGES: 1,
    
    // Drake: Draconic Resilience - gain Defense and Durability stages when health falls to 50% or lower
    DRAKE_HEALTH_THRESHOLD: 0.50,
    DRAKE_DEFENSE_STAGES: 1,
    DRAKE_DURABILITY_STAGES: 1,
    
    // Jätte: Colossal Power - Basic Strike always has 35 power
    JATTE_BASIC_STRIKE_POWER: 35,
    
    // Odjur: Bestial Rage - gain Strength and Wisdom stages after spending 2 full turns on battlefield
    ODJUR_TURNS_REQUIRED: 2,
    ODJUR_STRENGTH_STAGES: 1,
    ODJUR_WISDOM_STAGES: 1,
    
    // Rå: Malicious Retaliation - lowers two random enemy attributes by 1 stage when hit
    RA_DEBUFF_COUNT: 2,
    RA_DEBUFF_STAGES: 1,
    
    // Troll: Troll Theft - steals one positive attribute stage when using an ability
    TROLL_STAGE_STEAL: 1,
    
    // Vätte: Tag Team - incoming ally gains 30% damage bonus for current turn when swapping out
    VATTE_DAMAGE_BOOST: 0.30,
    
    // Vålnad: Deathless - revives with 10% of max health upon knockout
    VALNAD_REVIVE_HEALTH_PERCENT: 0.10
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

// Family Passive Descriptions (mechanical, player-facing)
const FAMILY_PASSIVES = {
    [FAMILIES.ALV]: {
        name: 'Innate Megin',
        description: 'Increases max Megin by 14%.'
    },
    [FAMILIES.ANDE]: {
        name: 'Ethereal Surge',
        description: 'When entering the battlefield, raises one random attribute by 1 stage (once per battle).'
    },
    [FAMILIES.DRAKE]: {
        name: 'Draconic Resilience',
        description: 'When current health falls to 50% or lower, gain +1 Defense stage and +1 Durability stage (once per battle).'
    },
    [FAMILIES.JATTE]: {
        name: 'Colossal Power',
        description: 'Basic Strike always has 35 power instead of its default power.'
    },
    [FAMILIES.ODJUR]: {
        name: 'Bestial Rage',
        description: 'After spending 2 full turns on the battlefield, gain +1 Strength stage and +1 Wisdom stage (once per battle).'
    },
    [FAMILIES.RA]: {
        name: 'Malicious Retaliation',
        description: 'When hit by an enemy attack, lowers two random enemy attributes by 1 stage each (once per battle).'
    },
    [FAMILIES.TROLL]: {
        name: 'Troll Theft',
        description: 'When using an ability, steals one positive attribute stage from the enemy (once per battle).'
    },
    [FAMILIES.VATTE]: {
        name: 'Tag Team',
        description: 'When swapping out, the incoming ally gains +30% damage for the current turn.'
    },
    [FAMILIES.VALNAD]: {
        name: 'Deathless',
        description: 'Upon knockout, revives with 10% of max health (once per battle).'
    }
};

const BASE_ATTRIBUTES = {
    [FAMILIES.VATTE]: { strength: 70, wisdom: 50, health: 55, defense: 55, durability: 80 },
    [FAMILIES.VALNAD]: { strength: 55, wisdom: 70, health: 55, defense: 75, durability: 55 },
    [FAMILIES.ODJUR]: { strength: 85, wisdom: 55, health: 65, defense: 55, durability: 45 },
    [FAMILIES.TROLL]: { strength: 60, wisdom: 55, health: 70, defense: 70, durability: 60 },
    [FAMILIES.RA]: { strength: 50, wisdom: 80, health: 60, defense: 65, durability: 60 },
    [FAMILIES.ALV]: { strength: 55, wisdom: 85, health: 60, defense: 55, durability: 60 },
    [FAMILIES.ANDE]: { strength: 70, wisdom: 70, health: 55, defense: 80, durability: 50 },
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
    HEALTHY: { name: 'Healthy', positive: 'health', negative: 'wisdom', modifier: 6 },
    ENDURING: { name: 'Enduring', positive: 'durability', negative: 'wisdom', modifier: 6 },
    STALWART: { name: 'Stalwart', positive: 'defense', negative: 'wisdom', modifier: 6 },
    RESILIENT: { name: 'Resilient', positive: 'defense', negative: 'strength', modifier: 6 },
    BRUTAL: { name: 'Brutal', positive: 'strength', negative: 'defense', modifier: 6 },
    SAVAGE: { name: 'Savage', positive: 'strength', negative: 'durability', modifier: 6 },
    FEROCIOUS: { name: 'Ferocious', positive: 'strength', negative: 'wisdom', modifier: 6 },
    THOUGHTFUL: { name: 'Thoughtful', positive: 'wisdom', negative: 'strength', modifier: 6 },
    FOCUSED: { name: 'Focused', positive: 'wisdom', negative: 'health', modifier: 6 },
    ALERT: { name: 'Alert', positive: 'wisdom', negative: 'defense', modifier: 6 },
    VIGILANT: { name: 'Vigilant', positive: 'defense', negative: 'health', modifier: 6 },
    WARY: { name: 'Wary', positive: 'durability', negative: 'health', modifier: 6 }
};

const TEMPERAMENT_LIST = Object.keys(TEMPERAMENTS);

const ZONES = {
    TROLLSKOGEN: {
        id: 'trollskogen',
        name: 'Trollskogen',
        description: 'An enchanted forest where the ancient canopy chokes out the sun. The air is thick with the scent of damp moss, and the unseen inhabitants constantly watch you from the gloom.',
        image: 'assets/zones/trollskogen.png',
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
        image: 'assets/zones/folketsby.png',
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
        image: 'assets/zones/djupagruvan.png',
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
        image: 'assets/zones/glimrandekallan.png',
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
        image: 'assets/zones/urbergen.png',
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
        image: 'assets/zones/varldensande.png',
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
        image: 'assets/zones/ginnungagap.png',
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
    HOARDER: { id: 'hoarder', name: 'Hoarder', description: 'Tame every Väsen type' },
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
