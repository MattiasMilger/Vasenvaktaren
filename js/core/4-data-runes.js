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
        flavor: 'The symbol of the mighty, untamed Aurochs. It taps into the deep, foundational power of the wielder, allowing for a vast and enduring wellspring of megin.',
        get effect() {
            return `This väsen has ${Math.round(GAME_CONFIG.RUNE_URUZ_MEGIN_BONUS * 100)}% more megin`;
        },
        mechanic: { type: 'megin_bonus', value: 0.20 }
    },
    'THURS': {
        id: 'THURS',
        symbol: 'ᚦ',
        name: 'Thurs',
        fullName: 'Thurs',
        flavor: 'The violent, chaotic might of the giants, channeled as a sharp, unyielding thorn. Any harm inflicted upon the bearer is instantly met with a fierce, painful recoil.',
        get effect() {
            return `This väsen returns ${Math.round((GAME_CONFIG.RUNE_THURS_RETURN_DAMAGE) * 100)}% of damage taken from attack hits as mixed damage of its own element`;
        },
    },
    'ANSUZ': {
        id: 'ANSUZ',
        symbol: 'ᚨ',
        name: 'Ansuz',
        fullName: 'Ansuz',
        flavor: 'The voice of the gods. It transforms the brute force of the wielder\'s body into a calculated, insightful display of esoteric power.',
        effect: 'This Väsen\'s strength attacks are considered wisdom attacks (they use wisdom and are checked against durability)',
        mechanic: { type: 'convert_strength_to_wisdom' }
    },
    'RAIDO': {
        id: 'RAIDO',
        symbol: 'ᚱ',
        name: 'Raido',
        fullName: 'Raido',
        flavor: 'The guiding force of one\'s path and fate. As the wielder strides onto the field, the momentum of their journey grants them swift healing and temporary resilience.',
        effect: 'This väsen\'s wisdom attacks are considered strength attacks (they use strength and are checked against defense)',
        mechanic: { type: 'convert_wisdom_to_strength' }
    },
    'KAUNAN': {
        id: 'KAUNAN',
        symbol: 'ᚲ',
        name: 'Kaunan',
        fullName: 'Kaunan',
        flavor: 'The bright, consuming power of the torch flame. It enhances the wielder\'s affinity with fire, causing their elemental attacks to strike with greater heat and devastation.',
        get effect() {
            return `This väsen's fire hits deal ${Math.round(GAME_CONFIG.RUNE_ELEMENT_DAMAGE_BOOST * 100)}% more damage`;
        },
        mechanic: { type: 'element_damage_bonus', element: ELEMENTS.FIRE, value: 0.12 }
    },
    'GIFU': {
        id: 'GIFU',
        symbol: 'ᚷ',
        name: 'Gifu',
        fullName: 'Gifu',
        flavor: 'The sacred exchange of powers between equals. The first significant boon received by the wielder is considered a communal gift, extending the effect to all allies.',
        effect: 'When this Väsen\'s attributes are raised it is also applied to allies (once per combat)',
        mechanic: { type: 'share_first_buff' }
    },
    'WYNJA': {
        id: 'WYNJA',
        symbol: 'ᚹ',
        name: 'Wynja',
        fullName: 'Wynja',
        flavor: 'The power of success and the protective shield of community. It intercepts hostile curses and transmutes that negative energy into a personal triumph.',
        get effect() {
            return `Blocks a debuff and raises a random attribute by ${GAME_CONFIG.RUNE_WYNJA_COUNTER_STAGE} stage when it happens (once per combat)`;
        },
        mechanic: { type: 'block_first_debuff' }
    },
    'HAGAL': {
        id: 'HAGAL',
        symbol: 'ᚺ',
        name: 'Hagal',
        fullName: 'Hagal',
        flavor: 'The rune of chaotic, natural destruction. It strips the elegance from arcane power, forcing the wielder\'s insightful attacks to rely instead on overwhelming physical impact.',
        get effect() {
            return `When this väsen is knocked out, the enemy gets all attributes lowered by ${GAME_CONFIG.RUNE_HAGAL_DEBUFF_STAGES} stages`;
        },
        mechanic: { type: 'debuff_on_knockout' }
    },
    'NAUDIZ': {
        id: 'NAUDIZ',
        symbol: 'ᚾ',
        name: 'Naudiz',
        fullName: 'Naudiz',
        flavor: 'The painful, inescapable pressure of need. Even the weakest attack carries a profound psychological weight, draining the enemy\'s strength and focus.',
        get effect() {
            return `This väsen's weak hits lower ${GAME_CONFIG.RUNE_NAUDIZ_DEBUFF_COUNT} random enemy attributes by ${GAME_CONFIG.RUNE_NAUDIZ_DEBUFF_STAGES} stage`;
        },
        mechanic: { type: 'debuff_on_weak_hit' }
    },
    'ISAZ': {
        id: 'ISAZ',
        symbol: 'ᛁ',
        name: 'Isaz',
        fullName: 'Isaz',
        flavor: 'The enduring patience and silence of concentrated ice. Utilizing water creates a moment of perfect clarity, simultaneously enhancing the wielder\'s body and mind.',
        get effect() {
            return `This väsen's water skills have a ${Math.round(GAME_CONFIG.RUNE_ELEMENT_BUFF_PROC_CHANCE * 100)}% chance to raise its wisdom and strength attributes by ${GAME_CONFIG.RUNE_ELEMENT_BUFF_STAGES} stage`;
        },
        mechanic: { type: 'buff_on_element_hit', element: ELEMENTS.WATER, attributes: ['wisdom', 'strength'], chance: 0.30 }
    },
    'JERA': {
        id: 'JERA',
        symbol: 'ᛃ',
        name: 'Jera',
        fullName: 'Jera',
        flavor: 'The long, fertile cycle of the year. Quick, efficient efforts consistently yield their harvest, causing the wielder\'s life force to be subtly replenished after short actions.',
        get effect() {
            return `This Väsen's skills that cost ${GAME_CONFIG.RUNE_ODAL_COST_THRESHOLD} megin or less have a ${Math.round(GAME_CONFIG.RUNE_LOW_COST_HEAL_PROC_CHANCE * 100)}% chance to heal it by ${Math.round(GAME_CONFIG.RUNE_JERA_HEAL_PERCENT * 100)}%`;
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
            return `This väsen\'s Earth Skills have a ${Math.round(GAME_CONFIG.RUNE_ELEMENT_BUFF_PROC_CHANCE * 100)}% chance to raise its Defense and Durability Attributes by ${GAME_CONFIG.RUNE_ELEMENT_BUFF_STAGES} stage`;
        },
        mechanic: { type: 'buff_on_element_skill', element: ELEMENTS.EARTH, attributes: ['defense', 'durability'], chance: 0.30 }
    },
    'PERTHO': {
        id: 'PERTHO',
        symbol: 'ᛈ',
        name: 'Pertho',
        fullName: 'Pertho',
        flavor: 'The mystery of what is hidden. It grounds the wielder, granting their earth-based powers a greater certainty and irresistible, final impact.',
        get effect() {
            return `This väsen\'s earth hits deal ${Math.round(GAME_CONFIG.RUNE_ELEMENT_DAMAGE_BOOST * 100)}% more damage`;
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
            return `This väsen's nature skills have a ${Math.round(GAME_CONFIG.RUNE_NATURE_HEAL_PROC_CHANCE * 100)}% chance to heal it by ${Math.round(GAME_CONFIG.RUNE_ALGIZ_HEAL_PERCENT * 100)}%`;
        },
        mechanic: { type: 'heal_on_element_skill', element: ELEMENTS.NATURE, chance: 0.30, healPercent: 0.08 }
    },
    'SOL': {
        id: 'SOL',
        symbol: 'ᛊ',
        name: 'Sol',
        fullName: 'Sol',
        flavor: 'The vitalizing energy of the sun. Commanding the fierce element of fire focuses the wielder, bringing about a moment of physical and mental clarity.',
        get effect() {
            return `This väsen\'s fire skills have a ${Math.round(GAME_CONFIG.RUNE_ELEMENT_BUFF_PROC_CHANCE * 100)}% chance to raise its strength and wisdom attributes by ${GAME_CONFIG.RUNE_ELEMENT_BUFF_STAGES} stage`;
        },
        mechanic: { type: 'buff_on_element_skill', element: ELEMENTS.FIRE, attributes: ['strength', 'wisdom'], chance: 0.30 }
    },
    'TYR': {
        id: 'TYR',
        symbol: 'ᛏ',
        name: 'Tyr',
        fullName: 'Tyr',
        flavor: 'The pillar of righteous command and ultimate fairness. The wielder\'s wind attacks gain a fearsome precision, striking with the swift, cutting force of cosmic law.',
        get effect() {
            return `This väsen\'s wind hits deal ${Math.round(GAME_CONFIG.RUNE_ELEMENT_DAMAGE_BOOST * 100)}% more damage`;
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
            return `This väsen\'s nature hits deal ${Math.round(GAME_CONFIG.RUNE_ELEMENT_DAMAGE_BOOST * 100)}% more damage`;
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
            return `This väsen\'s wind skills have a ${Math.round(GAME_CONFIG.RUNE_ELEMENT_BUFF_PROC_CHANCE * 100)}% chance to raise its defense and durability attributes by ${GAME_CONFIG.RUNE_ELEMENT_BUFF_STAGES} stage`;
        },
        mechanic: { type: 'buff_on_element_skill', element: ELEMENTS.WIND, attributes: ['defense', 'durability'], chance: 0.30 }
    },
    'MANNAZ': {
        id: 'MANNAZ',
        symbol: 'ᛗ',
        name: 'Mannaz',
        fullName: 'Mannaz',
        flavor: 'The quiet strength of self-reflection and intellect. Taking a measured pause for a non-offensive action allows the wielder to collect their fragmented spirit and mend damage.',
        get effect() {
            return `When this väsen uses a utility skill it heals by ${Math.round(GAME_CONFIG.RUNE_MANNAZ_HEAL_PERCENT * 100)}%`;
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
            return `This väsen\'s water hits deal ${Math.round(GAME_CONFIG.RUNE_ELEMENT_DAMAGE_BOOST * 100)}% more damage`;
        },
        mechanic: { type: 'element_damage_bonus', element: ELEMENTS.WATER, value: 0.12 }
    },
    'INGUZ': {
        id: 'INGUZ',
        symbol: 'ᛜ',
        name: 'Inguz',
        fullName: 'Inguz',
        flavor: 'The contained potential of the seed. Every strike plants a creeping instskill within the foe, germinating into a sudden rot that withers their fundamental prowess.',
        get effect() {
            return `This väsen's hits have a ${Math.round(GAME_CONFIG.RUNE_INGUZ_DEBUFF_PROC_CHANCE * 100)}% chance to lower a random enemy attribute by ${GAME_CONFIG.RUNE_INGUZ_DEBUFF_STAGES} stage`;
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
            return `This väsen deals ${Math.round(GAME_CONFIG.RUNE_DAGAZ_DAMAGE_BOOST * 100)}% more damage for the first round after entering the battlefield`;
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
            return `This väsen\'s attacks that cost ${GAME_CONFIG.RUNE_ODAL_COST_THRESHOLD} megin or less deal ${Math.round(GAME_CONFIG.RUNE_ODAL_DAMAGE_BOOST * 100)}% more damage`;
        },
        mechanic: { type: 'low_cost_damage_bonus', maxCost: 30, value: 0.1 }
    }
};

const RUNE_LIST = Object.keys(RUNES);
const STARTER_RUNE = 'URUZ';

// =============================================================================
// BIND RUNES
// Each entry defines a pair of runes that, when equipped together, produce a
// combined effect beyond what either rune does individually.
// runes:      [runeA, runeB] - order does not matter
// type:       internal effect type used by the combat system
// effectText: human-readable description shown in UI
// symbols:    combined symbol string for the combat log
// names:      combined name string for the combat log
// =============================================================================
const BIND_RUNES = [
    // ── ELEMENTAL CONVERSION BIND RUNES ──────────────────────────────────────
    // SOURCE rune defines which element gets converted; CONVERSION rune defines
    // the target element. Only hits that originally match the source element are
    // affected.  sourceElement → convertedElement for matchup and damage.
    //
    // EIHWAZ (Earth source) pairs
    {
        runes: ['EIHWAZ', 'KAUNAN'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.EARTH,
        convertedElement: ELEMENTS.FIRE,
        get effectText() { return `This väsen's earth hits are converted to fire`; },
        symbols: `${RUNES.EIHWAZ.symbol}${RUNES.KAUNAN.symbol}`,
        names: `${RUNES.EIHWAZ.name} ${RUNES.KAUNAN.name}`
    },
    {
        runes: ['EIHWAZ', 'TYR'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.EARTH,
        convertedElement: ELEMENTS.WIND,
        get effectText() { return `This väsen's earth hits are converted to wind`; },
        symbols: `${RUNES.EIHWAZ.symbol}${RUNES.TYR.symbol}`,
        names: `${RUNES.EIHWAZ.name} ${RUNES.TYR.name}`
    },
    {
        runes: ['EIHWAZ', 'BJARKA'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.EARTH,
        convertedElement: ELEMENTS.NATURE,
        get effectText() { return `This väsen's earth hits are converted to nature`; },
        symbols: `${RUNES.EIHWAZ.symbol}${RUNES.BJARKA.symbol}`,
        names: `${RUNES.EIHWAZ.name} ${RUNES.BJARKA.name}`
    },
    {
        runes: ['EIHWAZ', 'LAGUZ'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.EARTH,
        convertedElement: ELEMENTS.WATER,
        get effectText() { return `This väsen's earth hits are converted to water`; },
        symbols: `${RUNES.EIHWAZ.symbol}${RUNES.LAGUZ.symbol}`,
        names: `${RUNES.EIHWAZ.name} ${RUNES.LAGUZ.name}`
    },
    // ISAZ (Water source) pairs
    {
        runes: ['ISAZ', 'KAUNAN'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.WATER,
        convertedElement: ELEMENTS.FIRE,
        get effectText() { return `This väsen's water hits are converted to fire`; },
        symbols: `${RUNES.ISAZ.symbol}${RUNES.KAUNAN.symbol}`,
        names: `${RUNES.ISAZ.name} ${RUNES.KAUNAN.name}`
    },
    {
        runes: ['ISAZ', 'PERTHO'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.WATER,
        convertedElement: ELEMENTS.EARTH,
        get effectText() { return `This väsen's water hits are converted to earth`; },
        symbols: `${RUNES.ISAZ.symbol}${RUNES.PERTHO.symbol}`,
        names: `${RUNES.ISAZ.name} ${RUNES.PERTHO.name}`
    },
    {
        runes: ['ISAZ', 'TYR'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.WATER,
        convertedElement: ELEMENTS.WIND,
        get effectText() { return `This väsen's water hits are converted to wind`; },
        symbols: `${RUNES.ISAZ.symbol}${RUNES.TYR.symbol}`,
        names: `${RUNES.ISAZ.name} ${RUNES.TYR.name}`
    },
    {
        runes: ['ISAZ', 'BJARKA'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.WATER,
        convertedElement: ELEMENTS.NATURE,
        get effectText() { return `This väsen's water hits are converted to nature`; },
        symbols: `${RUNES.ISAZ.symbol}${RUNES.BJARKA.symbol}`,
        names: `${RUNES.ISAZ.name} ${RUNES.BJARKA.name}`
    },
    // SOL (Fire source) pairs
    {
        runes: ['SOL', 'PERTHO'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.FIRE,
        convertedElement: ELEMENTS.EARTH,
        get effectText() { return `This väsen's fire hits are converted to earth`; },
        symbols: `${RUNES.SOL.symbol}${RUNES.PERTHO.symbol}`,
        names: `${RUNES.SOL.name} ${RUNES.PERTHO.name}`
    },
    {
        runes: ['SOL', 'TYR'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.FIRE,
        convertedElement: ELEMENTS.WIND,
        get effectText() { return `This väsen's fire hits are converted to wind`; },
        symbols: `${RUNES.SOL.symbol}${RUNES.TYR.symbol}`,
        names: `${RUNES.SOL.name} ${RUNES.TYR.name}`
    },
    {
        runes: ['SOL', 'BJARKA'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.FIRE,
        convertedElement: ELEMENTS.NATURE,
        get effectText() { return `This väsen's fire hits are converted to nature`; },
        symbols: `${RUNES.SOL.symbol}${RUNES.BJARKA.symbol}`,
        names: `${RUNES.SOL.name} ${RUNES.BJARKA.name}`
    },
    {
        runes: ['SOL', 'LAGUZ'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.FIRE,
        convertedElement: ELEMENTS.WATER,
        get effectText() { return `This väsen's fire hits are converted to water`; },
        symbols: `${RUNES.SOL.symbol}${RUNES.LAGUZ.symbol}`,
        names: `${RUNES.SOL.name} ${RUNES.LAGUZ.name}`
    },
    // ALGIZ (Nature source) pairs
    {
        runes: ['ALGIZ', 'KAUNAN'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.NATURE,
        convertedElement: ELEMENTS.FIRE,
        get effectText() { return `This väsen's nature hits are converted to fire`; },
        symbols: `${RUNES.ALGIZ.symbol}${RUNES.KAUNAN.symbol}`,
        names: `${RUNES.ALGIZ.name} ${RUNES.KAUNAN.name}`
    },
    {
        runes: ['ALGIZ', 'PERTHO'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.NATURE,
        convertedElement: ELEMENTS.EARTH,
        get effectText() { return `This väsen's nature hits are converted to earth`; },
        symbols: `${RUNES.ALGIZ.symbol}${RUNES.PERTHO.symbol}`,
        names: `${RUNES.ALGIZ.name} ${RUNES.PERTHO.name}`
    },
    {
        runes: ['ALGIZ', 'TYR'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.NATURE,
        convertedElement: ELEMENTS.WIND,
        get effectText() { return `This väsen's nature hits are converted to wind`; },
        symbols: `${RUNES.ALGIZ.symbol}${RUNES.TYR.symbol}`,
        names: `${RUNES.ALGIZ.name} ${RUNES.TYR.name}`
    },
    {
        runes: ['ALGIZ', 'LAGUZ'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.NATURE,
        convertedElement: ELEMENTS.WATER,
        get effectText() { return `This väsen's nature hits are converted to water`; },
        symbols: `${RUNES.ALGIZ.symbol}${RUNES.LAGUZ.symbol}`,
        names: `${RUNES.ALGIZ.name} ${RUNES.LAGUZ.name}`
    },
    // EHWAZ (Wind source) pairs
    {
        runes: ['EHWAZ', 'KAUNAN'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.WIND,
        convertedElement: ELEMENTS.FIRE,
        get effectText() { return `This väsen's wind hits are converted to fire`; },
        symbols: `${RUNES.EHWAZ.symbol}${RUNES.KAUNAN.symbol}`,
        names: `${RUNES.EHWAZ.name} ${RUNES.KAUNAN.name}`
    },
    {
        runes: ['EHWAZ', 'PERTHO'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.WIND,
        convertedElement: ELEMENTS.EARTH,
        get effectText() { return `This väsen's wind hits are converted to earth`; },
        symbols: `${RUNES.EHWAZ.symbol}${RUNES.PERTHO.symbol}`,
        names: `${RUNES.EHWAZ.name} ${RUNES.PERTHO.name}`
    },
    {
        runes: ['EHWAZ', 'BJARKA'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.WIND,
        convertedElement: ELEMENTS.NATURE,
        get effectText() { return `This väsen's wind hits are converted to nature`; },
        symbols: `${RUNES.EHWAZ.symbol}${RUNES.BJARKA.symbol}`,
        names: `${RUNES.EHWAZ.name} ${RUNES.BJARKA.name}`
    },
    {
        runes: ['EHWAZ', 'LAGUZ'],
        type: 'element_conversion',
        sourceElement: ELEMENTS.WIND,
        convertedElement: ELEMENTS.WATER,
        get effectText() { return `This väsen's wind hits are converted to water`; },
        symbols: `${RUNES.EHWAZ.symbol}${RUNES.LAGUZ.symbol}`,
        names: `${RUNES.EHWAZ.name} ${RUNES.LAGUZ.name}`
    },

    // ── ANSUZ + RAIDO ─────────────────────────────────────────────────────────
    // All attacks use the attacker's highest attacking attribute (Strength or Wisdom).
    {
        runes: ['ANSUZ', 'RAIDO'],
        type: 'use_best_stat',
        get effectText() { return `This väsen's attacks use the highest attacking attribute`; },
        symbols: `${RUNES.ANSUZ.symbol}${RUNES.RAIDO.symbol}`,
        names: `${RUNES.ANSUZ.name} ${RUNES.RAIDO.name}`
    },

    // ── GIFU + MANNAZ ─────────────────────────────────────────────────────────
    // The first time this väsen's Mannaz heal triggers this combat (from any
    // utility skill, including ones that don't otherwise interact with Gifu,
    // such as Freya's Tears), the heal is also extended to all allies. Tracked
    // via its own dedicated mannazTeamHealTriggered flag (not gifuTriggered),
    // so it fires independently of other Gifu-shared buffs. Reset to false by
    // resetOncePerCombatFlags(), so Endless Tower's Idunn's Apples milestone
    // floors renew it like every other once-per-combat rune trigger.
    {
        runes: ['GIFU', 'MANNAZ'],
        type: 'mannaz_team_heal',
        get effectText() {
            return `This väsen's Mannaz also heals allies (once per combat)`;
        },
        symbols: `${RUNES.GIFU.symbol}${RUNES.MANNAZ.symbol}`,
        names: `${RUNES.GIFU.name} ${RUNES.MANNAZ.name}`
    },

    // ── INGUZ + DAGAZ ─────────────────────────────────────────────────────────
    // Lowers a random enemy attribute by a stage whenever this väsen enters
    // the battlefield - both at combat start and on every swap-in, matching
    // the same "entering the battlefield" trigger Dagaz's own first-round
    // damage bonus uses. Can be blocked by the enemy's Wynja rune, same as
    // Inguz's own hit-based debuff.
    {
        runes: ['INGUZ', 'DAGAZ'],
        type: 'enter_battlefield_debuff',
        get effectText() {
            return `This väsen lowers a random enemy attribute by ${GAME_CONFIG.RUNE_BIND_INGUZ_DAGAZ_DEBUFF_STAGES} stage when entering the battlefield`;
        },
        symbols: `${RUNES.INGUZ.symbol}${RUNES.DAGAZ.symbol}`,
        names: `${RUNES.INGUZ.name} ${RUNES.DAGAZ.name}`
    },

    // ── JERA + ODAL ───────────────────────────────────────────────────────────
    // This väsen's skills that cost RUNE_ODAL_COST_THRESHOLD megin or less have
    // a chance to raise a random attribute by a stage. Applies to any qualifying
    // skill, including utility skills - same scope as Jera's own low-cost heal
    // proc, checked at the same two call sites (utility skill use and damaging
    // hit resolution).
    {
        runes: ['JERA', 'ODAL'],
        type: 'low_cost_random_buff',
        get effectText() {
            return `This väsen's skills that cost ${GAME_CONFIG.RUNE_ODAL_COST_THRESHOLD} megin or less have a ${Math.round(GAME_CONFIG.RUNE_BIND_JERA_ODAL_PROC_CHANCE * 100)}% chance to raise a random attribute by ${GAME_CONFIG.RUNE_BIND_JERA_ODAL_BUFF_STAGES} stage`;
        },
        symbols: `${RUNES.JERA.symbol}${RUNES.ODAL.symbol}`,
        names: `${RUNES.JERA.name} ${RUNES.ODAL.name}`
    },

    // ── FEHU + WYNJA ──────────────────────────────────────────────────────────
    // When this väsen's health falls to the configured threshold or less,
    // raise all four attribute stages by 1 (once per combat). Checked at the
    // same onHealthThreshold trigger point used by Drake's family passive,
    // which fires after this väsen takes damage from an attack.
    {
        runes: ['FEHU', 'WYNJA'],
        type: 'health_threshold_buff_all',
        get effectText() {
            return `When this väsen's health falls to ${Math.round(GAME_CONFIG.RUNE_BIND_FEHU_WYNJA_HEALTH_THRESHOLD * 100)}% or less, raises all attribute stages by ${GAME_CONFIG.RUNE_BIND_FEHU_WYNJA_BUFF_STAGES} (once per combat)`;
        },
        symbols: `${RUNES.FEHU.symbol}${RUNES.WYNJA.symbol}`,
        names: `${RUNES.FEHU.name} ${RUNES.WYNJA.name}`
    },

    // ── URUZ + THURS ──────────────────────────────────────────────────────────
    // When this väsen's Thurs deals damage, it gains a percentage of
    // that reflected damage as megin (only if the resulting gain is above 0).
    {
        runes: ['URUZ', 'THURS'],
        type: 'thurs_megin_gain',
        get effectText() {
            return `This väsen gains ${Math.round(GAME_CONFIG.RUNE_BIND_URUZ_THURS_MEGIN_PERCENT * 100)}% of thurs damage as megin`;
        },
        symbols: `${RUNES.URUZ.symbol}${RUNES.THURS.symbol}`,
        names: `${RUNES.URUZ.name} ${RUNES.THURS.name}`
    },

    // ── HAGAL + NAUDIZ ────────────────────────────────────────────────────────
    // When an enemy's health falls to the configured threshold or less, lowers
    // all of their attribute stages by 1 (once per combat). Triggered from the
    // attacker's side, checked right after damage is dealt to the defender.
    {
        runes: ['HAGAL', 'NAUDIZ'],
        type: 'enemy_health_threshold_debuff_all',
        get effectText() {
            return `This väsen lowers all of an enemy's attribute stages by ${GAME_CONFIG.RUNE_BIND_HAGAL_NAUDIZ_DEBUFF_STAGES} when their health falls to ${Math.round(GAME_CONFIG.RUNE_BIND_HAGAL_NAUDIZ_HEALTH_THRESHOLD * 100)}% or less (once per combat).`;
        },
        symbols: `${RUNES.HAGAL.symbol}${RUNES.NAUDIZ.symbol}`,
        names: `${RUNES.HAGAL.name} ${RUNES.NAUDIZ.name}`
    }
];

// Returns an array of active bind rune definitions for a given VasenInstance.
// A bind rune is active only when the väsen has BOTH runes in the pair equipped.
// The returned objects are shallow copies with `symbols` and `names` recomputed
// to follow the order the runes actually appear in vasen.runes (i.e. the order
// the player equipped them), rather than the fixed order baked into BIND_RUNES.
function getActiveBindRunes(vasen) {
    if (!vasen || !vasen.runes || vasen.runes.length < 2) return [];
    return BIND_RUNES
        .filter(br => br.runes.every(r => vasen.runes.includes(r)))
        .map(br => {
            // Order the pair's rune IDs the same way they appear in vasen.runes
            const orderedIds = vasen.runes.filter(r => br.runes.includes(r));
            return {
                ...br,
                symbols: orderedIds.map(id => RUNES[id].symbol).join(''),
                names: orderedIds.map(id => RUNES[id].name).join(' ')
            };
        });
}

// Returns the active elemental conversion bind rune for a given VasenInstance
// (if any), or null. Only the first match is returned since a väsen can only
// equip two runes and therefore only one elemental conversion pair at a time.
function getElementConversionBindRune(vasen) {
    return getActiveBindRunes(vasen).find(br => br.type === 'element_conversion') || null;
}

// Returns true if the väsen has the ANSUZ + RAIDO use_best_stat bind rune active.
function hasUseBestStatBindRune(vasen) {
    return getActiveBindRunes(vasen).some(br => br.type === 'use_best_stat');
}

// Returns true if the väsen has the GIFU + MANNAZ mannaz_team_heal bind rune active.
function hasMannazTeamHealBindRune(vasen) {
    return getActiveBindRunes(vasen).some(br => br.type === 'mannaz_team_heal');
}

// Returns true if the väsen has the INGUZ + DAGAZ enter_battlefield_debuff bind rune active.
function hasEnterBattlefieldDebuffBindRune(vasen) {
    return getActiveBindRunes(vasen).some(br => br.type === 'enter_battlefield_debuff');
}

// Returns true if the väsen has the JERA + ODAL low_cost_random_buff bind rune active.
function hasLowCostRandomBuffBindRune(vasen) {
    return getActiveBindRunes(vasen).some(br => br.type === 'low_cost_random_buff');
}

// Returns true if the väsen has the FEHU + WYNJA health_threshold_buff_all bind rune active.
function hasHealthThresholdBuffAllBindRune(vasen) {
    return getActiveBindRunes(vasen).some(br => br.type === 'health_threshold_buff_all');
}

// Returns true if the väsen has the URUZ + THURS thurs_megin_gain bind rune active.
function hasThursMeginGainBindRune(vasen) {
    return getActiveBindRunes(vasen).some(br => br.type === 'thurs_megin_gain');
}

// Returns true if the väsen has the HAGAL + NAUDIZ enemy_health_threshold_debuff_all bind rune active.
function hasEnemyHealthThresholdDebuffAllBindRune(vasen) {
    return getActiveBindRunes(vasen).some(br => br.type === 'enemy_health_threshold_debuff_all');
}

// Returns HTML string for displaying active bind rune effects.
// Used in combat panel and väsen details.
function getBindRuneDisplayHTML(vasen, isOpen = false) {
    const active = getActiveBindRunes(vasen);
    if (active.length === 0) return '';
    const openClass = isOpen ? 'open' : '';
    return active.map(br => `
        <div class="rune-collapsible ${openClass}">
            <div class="rune-collapsible-header" onclick="toggleRuneDescriptions()">
                <span class="toggle-icon"></span>
                ${br.symbols} Bindrune
            </div>
            <div class="rune-collapsible-body">
                ${br.effectText}
            </div>
        </div>
    `).join('');
}

// =============================================================================
// Returns the set of rune IDs that are eligible due to bindrune viability,
// independent of whether the rune passes its own solo filter rule.
// For each bindrune pair, both runes in the pair are added to the result set
// when the pair's viability condition is met for this väsen:
//   - Elemental conversion pairs: väsen has the pair's source element as an
//     attack element (including Basic Strike).
//   - ANSUZ + RAIDO: always viable.
//   - GIFU + MANNAZ: väsen has at least one utility skill.
//   - INGUZ + DAGAZ: always viable.
//   - JERA + ODAL: väsen has at least one skill (including utility skills)
//     costing RUNE_ODAL_COST_THRESHOLD megin or less.
//   - FEHU + WYNJA: always viable.
//   - URUZ + THURS: always viable.
//   - HAGAL + NAUDIZ: always viable.
// =============================================================================
function getBindRuneEligibleRunes(vasen) {
    const eligible = new Set();

    const availableSkills = vasen.getAvailableSkills();

    const attackElements = new Set();
    attackElements.add(vasen.species.element); // Basic Strike always uses own element
    availableSkills.forEach(skillName => {
        const skill = ABILITIES[skillName];
        if (!skill) return;
        if (skill.type !== ATTACK_TYPES.UTILITY && skill.element) {
            attackElements.add(skill.element);
        }
    });

    const hasUtilitySkill = availableSkills.some(skillName => {
        const skill = ABILITIES[skillName];
        return skill && skill.type === ATTACK_TYPES.UTILITY;
    });

    // Any skill (including utility) costing at or below the Odal threshold
    const hasLowCostSkill = availableSkills.some(skillName => {
        return vasen.getSkillMeginCost(skillName) <= GAME_CONFIG.RUNE_ODAL_COST_THRESHOLD;
    });

    BIND_RUNES.forEach(br => {
        let viable = false;

        switch (br.type) {
            case 'element_conversion':
                viable = attackElements.has(br.sourceElement);
                break;
            case 'use_best_stat': // ANSUZ + RAIDO
                viable = true;
                break;
            case 'mannaz_team_heal': // GIFU + MANNAZ
                viable = hasUtilitySkill;
                break;
            case 'enter_battlefield_debuff': // INGUZ + DAGAZ
                viable = true;
                break;
            case 'low_cost_random_buff': // JERA + ODAL
                viable = hasLowCostSkill;
                break;
            case 'health_threshold_buff_all': // FEHU + WYNJA
                viable = true;
                break;
            case 'thurs_megin_gain': // URUZ + THURS
                viable = true;
                break;
            case 'enemy_health_threshold_debuff_all': // HAGAL + NAUDIZ
                viable = true;
                break;
            default:
                viable = false;
        }

        if (viable) {
            br.runes.forEach(runeId => eligible.add(runeId));
        }
    });

    return eligible;
}

// =============================================================================
// Returns the subset of RUNE_LIST that are useful for a given VasenInstance.
// A rune is included if it passes its own solo filter rule, OR if it is part
// of a bindrune pair whose viability condition is met for this väsen (see
// getBindRuneEligibleRunes above). All other runes are always considered valid.
// =============================================================================
function getValidRunesForVasen(vasen) {
    const availableSkills = vasen.getAvailableSkills();

    // Collect all elements the väsen can attack with
    const attackElements = new Set();
    attackElements.add(vasen.species.element); // Basic Strike always uses own element

    let hasStrengthAttack = false;
    let hasWisdomAttack   = false;
    let hasUtilitySkill = false;

    availableSkills.forEach(skillName => {
        const skill = ABILITIES[skillName];
        if (!skill) return;

        if (skill.type === ATTACK_TYPES.UTILITY) {
            hasUtilitySkill = true;
        } else {
            if (skill.element) attackElements.add(skill.element);
            // MIXED attacks (e.g. Basic Strike) split 50/50 between both attributes and are
            // not converted by ANSUZ or RAIDO, so they do not count as pure Strength
            // or pure Wisdom attacks for the purpose of those rune checks.
            if (skill.type === ATTACK_TYPES.STRENGTH) hasStrengthAttack = true;
            if (skill.type === ATTACK_TYPES.WISDOM)   hasWisdomAttack   = true;
        }
    });

    const bindRuneEligible = getBindRuneEligibleRunes(vasen);

    return RUNE_LIST.filter(runeId => {
        if (bindRuneEligible.has(runeId)) return true;

        switch (runeId) {
            // Element damage boost runes - only useful if the väsen has attacks of that element
            case 'KAUNAN': return attackElements.has(ELEMENTS.FIRE);
            case 'PERTHO': return attackElements.has(ELEMENTS.EARTH);
            case 'TYR':    return attackElements.has(ELEMENTS.WIND);
            case 'BJARKA': return attackElements.has(ELEMENTS.NATURE);
            case 'LAGUZ':  return attackElements.has(ELEMENTS.WATER);

            // Element proc buff runes - same requirement
            case 'EIHWAZ': return attackElements.has(ELEMENTS.EARTH);
            case 'SOL':    return attackElements.has(ELEMENTS.FIRE);
            case 'EHWAZ':  return attackElements.has(ELEMENTS.WIND);
            case 'ISAZ':   return attackElements.has(ELEMENTS.WATER);
            case 'ALGIZ':  return attackElements.has(ELEMENTS.NATURE);

            // Utility heal rune - only useful if the väsen has at least one utility skill
            case 'MANNAZ': return hasUtilitySkill;

            // Attack-type conversion runes - only useful if the väsen has attacks of the source
            // type AND the target stat is strictly higher than the source stat (converting to
            // a weaker or equal stat is never beneficial).
            case 'ANSUZ':  // Converts Strength attacks → uses Wisdom instead
                return hasStrengthAttack && vasen.calculateAttribute('wisdom') > vasen.calculateAttribute('strength');
            case 'RAIDO':  // Converts Wisdom attacks → uses Strength instead
                return hasWisdomAttack && vasen.calculateAttribute('strength') > vasen.calculateAttribute('wisdom');

            // Low-cost damage boost rune - only useful if at least one *damaging* skill
            // costs at or below the threshold after the same-element megin discount.
            // Utility skills deal no damage, so they don't qualify.
            case 'ODAL': {
                return availableSkills.some(skillName => {
                    const skill = ABILITIES[skillName];
                    if (!skill || skill.type === ATTACK_TYPES.UTILITY) return false;
                    return vasen.getSkillMeginCost(skillName) <= GAME_CONFIG.RUNE_ODAL_COST_THRESHOLD;
                });
            }

            // Buff-sharing rune - only useful if the väsen has at least one skill that
            // raises attributes (buff or Tyr's Sacrifice), or if its family passive raises
            // attributes (Ande: Ethereal Surge, Odjur: Bestial Rage, Drake: Draconic
            // Resilience, Troll: Troll Theft).
            case 'GIFU': {
                const familiesWithBuffPassive = [FAMILIES.ANDE, FAMILIES.ODJUR, FAMILIES.DRAKE, FAMILIES.TROLL];
                if (familiesWithBuffPassive.includes(vasen.species.family)) return true;
                return availableSkills.some(skillName => {
                    const skill = ABILITIES[skillName];
                    if (!skill || !skill.effect) return false;
                    return skill.effect.type === 'buff' || skill.effect.type === 'tyrs_sacrifice';
                });
            }

            // All other runes are universally applicable
            default: return true;
        }
    });
}
