// =============================================================================
// 6d-system-combat-passives.js - Rune Effects and Family Passives in Combat
// =============================================================================
//
// Extends the Combat class (6a-system-combat.js) with the runes, bind runes and
// family passives that react to what happens in a fight. Rune definitions and
// bind rune lookups live in 4-core-runes.js; the tuning values live in
// GAME_CONFIG and FAMILY_PASSIVE_CONFIG (1-core-constants.js).
// =============================================================================

// Element buff runes: skill element -> rune and the attributes it raises when it procs
const ELEMENT_BUFF_RUNES = {
    [ELEMENTS.EARTH]: { rune: 'EIHWAZ', attributes: ['defense', 'durability'] },
    [ELEMENTS.FIRE]:  { rune: 'SOL',    attributes: ['strength', 'wisdom'] },
    [ELEMENTS.WIND]:  { rune: 'EHWAZ',  attributes: ['defense', 'durability'] },
    [ELEMENTS.WATER]: { rune: 'ISAZ',   attributes: ['wisdom', 'strength'] }
};

// Trigger point -> Combat methods that react to it, in resolution order. Each
// handler checks for itself whether it applies (family, bind rune, once-per-combat
// flag). Jätte (Jotun's Fury) and Alv (Elven Craftsmanship) are not listed: they
// modify a hit or a buff while it is calculated, so they are called from there.
const COMBAT_PASSIVE_HANDLERS = {
    onEnterBattlefield: ['passiveEtherealSurge', 'bindRuneEntryDebuff'],
    onTurnEnd:          ['passiveBestialRage'],
    onSwapOut:          ['passiveTagTeam'],
    onHealthThreshold:  ['passiveDraconicResilience', 'bindRuneLowHealthBuffAll'],
    onTakeDamage:       ['passiveMaliciousRetaliation'],
    onUseSkill:         ['passiveTrollTheft'],
    onKnockout:         ['passiveDeathless']
};

// =============================================================================
// SHARED RUNE EFFECTS
// =============================================================================

// Gifu: activates the first time this väsen shares a buff each combat. Returns
// true only on that first activation (and logs it); false if it has no Gifu or
// it has already activated.
Combat.prototype.tryActivateGifu = function(vasen) {
    if (vasen.combatFlags.gifuTriggered || !vasen.hasRune('GIFU')) return false;
    vasen.combatFlags.gifuTriggered = true;
    this.logRuneActivated(vasen, 'GIFU');
    return true;
};

// Raises the given attributes on every conscious ally not in `excluded` and logs
// each one. Used when Gifu shares a buff with the rest of the team.
Combat.prototype.raiseAlliesStages = function(allies, excluded, stats, stages) {
    allies.forEach(ally => {
        if (excluded.includes(ally) || ally.isKnockedOut()) return;
        stats.forEach(stat => {
            ally.modifyAttributeStage(stat, stages);
            this.logStageChange(ally, stat, stages);
        });
    });
};

// Wynja: blocks the first debuff aimed at this väsen each combat and raises a
// random attribute instead. Returns true if the debuff was blocked.
Combat.prototype.tryWynjaBlock = function(target) {
    if (target.combatFlags.wynjaTriggered || !target.hasRune('WYNJA')) return false;
    target.combatFlags.wynjaTriggered = true;
    this.logRuneActivated(target, 'WYNJA');
    this.addLog(`${target.getDisplayName()} blocked the debuff!`, 'block');
    const counterStat = randomAttribute();
    const stages = GAME_CONFIG.RUNE_WYNJA_COUNTER_STAGE;
    target.modifyAttributeStage(counterStat, stages);
    this.logStageChange(target, counterStat, stages);
    return true;
};

// Jera: chance to heal when using a low-cost skill
Combat.prototype.tryJeraHeal = function(attacker, skillName, result) {
    if (!attacker.hasRune('JERA') || attacker.getSkillMeginCost(skillName) > GAME_CONFIG.RUNE_ODAL_COST_THRESHOLD) return;
    if (Math.random() >= GAME_CONFIG.RUNE_LOW_COST_HEAL_PROC_CHANCE) return;
    const healAmount = attacker.healPercent(GAME_CONFIG.RUNE_JERA_HEAL_PERCENT);
    if (healAmount > 0) {
        this.logRuneActivated(attacker, 'JERA');
        this.logHealthGained(attacker, healAmount);
        result.runeEffects.push({ rune: 'JERA', effect: `healed ${healAmount}` });
    }
};

// Bind Rune - Jera + Odal: chance to raise a random attribute when using a low-cost skill
Combat.prototype.tryJeraOdalBuff = function(attacker, skillName) {
    if (!hasLowCostRandomBuffBindRune(attacker) || attacker.getSkillMeginCost(skillName) > GAME_CONFIG.RUNE_ODAL_COST_THRESHOLD) return;
    if (Math.random() >= GAME_CONFIG.RUNE_BIND_JERA_ODAL_PROC_CHANCE) return;
    const jeraOdalBR = getActiveBindRunes(attacker).find(b => b.type === 'low_cost_random_buff');
    const randomStat = randomAttribute();
    const buffResult = attacker.modifyAttributeStage(randomStat, GAME_CONFIG.RUNE_BIND_JERA_ODAL_BUFF_STAGES);
    this.logBindRuneActivated(attacker, jeraOdalBR);
    if (buffResult.capped) {
        this.addLog(`${attacker.getDisplayName()}'s ${randomStat} cannot be raised any higher.`, 'status');
    } else if (buffResult.changed !== 0) {
        this.logStageChange(attacker, randomStat, buffResult.changed);
    }
};

// Algiz: chance to heal when using a Nature skill
Combat.prototype.tryAlgizHeal = function(attacker, element, result) {
    if (element !== ELEMENTS.NATURE || !attacker.hasRune('ALGIZ')) return;
    if (Math.random() >= GAME_CONFIG.RUNE_NATURE_HEAL_PROC_CHANCE) return;
    const healAmount = attacker.healPercent(GAME_CONFIG.RUNE_ALGIZ_HEAL_PERCENT);
    if (healAmount > 0) {
        this.logRuneActivated(attacker, 'ALGIZ');
        this.logHealthGained(attacker, healAmount);
        result.runeEffects.push({ rune: 'ALGIZ', effect: `healed ${healAmount}` });
    }
};

// Eihwaz, Sol, Ehwaz, Isaz: chance to raise two attributes when using a skill of the rune's element
Combat.prototype.tryElementBuffRune = function(attacker, element, result) {
    const buffData = ELEMENT_BUFF_RUNES[element];
    if (!buffData || !attacker.hasRune(buffData.rune)) return;
    if (Math.random() >= GAME_CONFIG.RUNE_ELEMENT_BUFF_PROC_CHANCE) return;
    const stages = GAME_CONFIG.RUNE_ELEMENT_BUFF_STAGES;
    this.logRuneActivated(attacker, buffData.rune);
    buffData.attributes.forEach(stat => {
        attacker.modifyAttributeStage(stat, stages);
        this.logStageChange(attacker, stat, stages);
    });
    result.runeEffects.push({ rune: buffData.rune, effect: 'buffed' });
};

// Rune effects that trigger after a utility skill has resolved
Combat.prototype.applyUtilityRuneEffects = function(attacker, skill, isPlayer, result) {
    // Mannaz: heal on utility
    if (attacker.hasRune('MANNAZ')) {
        const healAmount = attacker.healPercent(GAME_CONFIG.RUNE_MANNAZ_HEAL_PERCENT);
        if (healAmount > 0) {
            result.runeEffects.push({ rune: 'MANNAZ', effect: `healed ${healAmount}` });
            this.logRuneActivated(attacker, 'MANNAZ');
            this.logHealthGained(attacker, healAmount);
        }

        // Bind Rune - GIFU + MANNAZ: the first time this väsen's Mannaz heal
        // triggers this combat, also heal all allies by the same Mannaz heal
        // percent. Uses its own dedicated flag (not gifuTriggered) so it fires
        // independently of any other Gifu-shared buff that may have already
        // triggered this combat, and so it also applies to utility skills that
        // never touch gifuTriggered at all (e.g. Freya's Tears).
        if (!attacker.combatFlags.mannazTeamHealTriggered && hasMannazTeamHealBindRune(attacker)) {
            attacker.combatFlags.mannazTeamHealTriggered = true;
            const gifuMannazBR = getActiveBindRunes(attacker).find(b => b.type === 'mannaz_team_heal');
            this.logBindRuneActivated(attacker, gifuMannazBR);

            this.getTeam(isPlayer).forEach(ally => {
                if (ally !== attacker && !ally.isKnockedOut()) {
                    const allyHealAmount = ally.healPercent(GAME_CONFIG.RUNE_MANNAZ_HEAL_PERCENT);
                    if (allyHealAmount > 0) {
                        this.logHealthGained(ally, allyHealAmount);
                    }
                }
            });
        }
    }

    // These skill-use rune procs apply to utility skills too
    this.tryJeraHeal(attacker, result.skill, result);
    this.tryJeraOdalBuff(attacker, result.skill);
    this.tryAlgizHeal(attacker, skill.element, result);
    this.tryElementBuffRune(attacker, skill.element, result);
};

// Rune effects that trigger when an attack skill hits
Combat.prototype.applyHitRuneEffects = function(attacker, defender, damageResult, result, isPlayer) {
    // Skill-use rune procs, keyed on the (possibly converted) hit element
    const skillElement = damageResult.element;
    this.tryElementBuffRune(attacker, skillElement, result);
    this.tryAlgizHeal(attacker, skillElement, result);
    this.tryJeraHeal(attacker, result.skill, result);
    this.tryJeraOdalBuff(attacker, result.skill);

    // Naudiz: debuff on weak hit
    if (damageResult.matchup === 'WEAK' && attacker.hasRune('NAUDIZ')) {
        this.logRuneActivated(attacker, 'NAUDIZ');
        // Wynja on the defender blocks the first debuff
        if (!this.tryWynjaBlock(defender)) {
            for (let i = 0; i < GAME_CONFIG.RUNE_NAUDIZ_DEBUFF_COUNT; i++) {
                const stat = randomAttribute();
                defender.modifyAttributeStage(stat, -GAME_CONFIG.RUNE_NAUDIZ_DEBUFF_STAGES);
                this.logStageChange(defender, stat, -GAME_CONFIG.RUNE_NAUDIZ_DEBUFF_STAGES);
            }
        }
        result.runeEffects.push({ rune: 'NAUDIZ', effect: 'debuffed' });
    }

    // Inguz: chance to lower a random enemy attribute on any hit
    if (attacker.hasRune('INGUZ')) {
        if (Math.random() < GAME_CONFIG.RUNE_INGUZ_DEBUFF_PROC_CHANCE) {
            this.logRuneActivated(attacker, 'INGUZ');
            // Wynja on the defender blocks the first debuff
            if (!this.tryWynjaBlock(defender)) {
                const randomStat = randomAttribute();
                defender.modifyAttributeStage(randomStat, -GAME_CONFIG.RUNE_INGUZ_DEBUFF_STAGES);
                this.logStageChange(defender, randomStat, -GAME_CONFIG.RUNE_INGUZ_DEBUFF_STAGES);
                result.runeEffects.push({ rune: 'INGUZ', effect: 'debuffed' });
            }
        }
    }
};

// Bind Rune - Hagal + Naudiz: when the enemy's (defender's) health falls to the
// configured threshold or less, lower all of their attribute stages by the
// configured amount. Triggered from the attacker's side (the rune belongs to
// the attacker), tracked once per combat via a flag on the attacker.
Combat.prototype.tryHagalNaudizDebuff = function(attacker, defender) {
    if (!hasEnemyHealthThresholdDebuffAllBindRune(attacker) || attacker.combatFlags.hagalNaudizPassiveTriggered) return;
    const defenderHealthPercent = defender.currentHealth / defender.maxHealth;
    if (defenderHealthPercent > GAME_CONFIG.RUNE_BIND_HAGAL_NAUDIZ_HEALTH_THRESHOLD) return;

    attacker.combatFlags.hagalNaudizPassiveTriggered = true;
    const hagalNaudizBR = getActiveBindRunes(attacker).find(b => b.type === 'enemy_health_threshold_debuff_all');
    this.logBindRuneActivated(attacker, hagalNaudizBR);

    STAGEABLE_ATTRIBUTES.forEach(stat => {
        const result = defender.modifyAttributeStage(stat, -GAME_CONFIG.RUNE_BIND_HAGAL_NAUDIZ_DEBUFF_STAGES);
        if (result.changed !== 0) {
            this.logStageChange(defender, stat, result.changed);
        }
    });
};

// Logs the bind runes that changed how a hit was calculated (see calculateDamage)
Combat.prototype.logDamageBindRunes = function(attacker, damageResult) {
    // Bind Rune - Elemental Conversion: the skill's element was converted
    if (damageResult.bindRuneEleConverted) {
        const br = getElementConversionBindRune(attacker);
        if (br) {
            this.logBindRuneActivated(attacker, br);
        }
    }

    // Bind Rune - Use Best Stat (Ansuz + Raido): the higher of Strength/Wisdom was used
    if (damageResult.bindRuneUseBestStat) {
        const br = getActiveBindRunes(attacker).find(b => b.type === 'use_best_stat');
        if (br) {
            this.logBindRuneActivated(attacker, br);
        }
    }
};

// =============================================================================
// FAMILY PASSIVES
// =============================================================================

// Resolve every passive that reacts to `trigger` (see COMBAT_PASSIVE_HANDLERS).
// Returns true if a handler revived the väsen; only Deathless does, and the
// knockout handling relies on it.
Combat.prototype.applyFamilyPassive = function(trigger, context) {
    const handlers = COMBAT_PASSIVE_HANDLERS[trigger] || [];
    let revived = false;
    handlers.forEach(handler => {
        if (this[handler](context)) revived = true;
    });
    return revived;
};

// --- ANDE: ETHEREAL SURGE ---
// On first entering the battlefield, raise random attributes (once per combat)
Combat.prototype.passiveEtherealSurge = function({ vasen, isPlayer }) {
    if (vasen.species.family !== FAMILIES.ANDE || vasen.combatFlags.andePassiveTriggered) return;
    vasen.combatFlags.andePassiveTriggered = true;

    const stages = FAMILY_PASSIVE_CONFIG.ANDE_ATTRIBUTE_STAGES;
    const rollCount = FAMILY_PASSIVE_CONFIG.ANDE_ATTRIBUTE_TIMES;

    this.addLog(`${vasen.getDisplayName()} activated Ethereal Surge!`, 'passive');

    // Collect which attributes were actually raised so Gifu can share them all at once after
    const raisedAttributes = [];
    for (let i = 0; i < rollCount; i++) {
        const randomStat = randomAttribute();
        const result = vasen.modifyAttributeStage(randomStat, stages);
        this.logStageChange(vasen, randomStat, stages);
        if (result.changed !== 0) {
            raisedAttributes.push(randomStat);
        }
    }

    // Gifu: share each raised stat to allies exactly once
    if (raisedAttributes.length > 0 && this.tryActivateGifu(vasen)) {
        const allies = this.getTeam(isPlayer);
        raisedAttributes.forEach(stat => {
            this.raiseAlliesStages(allies, [vasen], [stat], stages);
        });
    }
};

// --- ODJUR: BESTIAL RAGE ---
// After enough turns on the battlefield, raise Strength and lower Wisdom
// (once per stay on the battlefield; the flag resets on swap)
Combat.prototype.passiveBestialRage = function({ vasen, isPlayer }) {
    if (vasen.species.family !== FAMILIES.ODJUR) return;
    if (vasen.combatFlags.turnsOnField < FAMILY_PASSIVE_CONFIG.ODJUR_TURNS_REQUIRED) return;
    if (vasen.combatFlags.odjurPassiveTriggered) return;
    vasen.combatFlags.odjurPassiveTriggered = true;
    this.addLog(`${vasen.getDisplayName()} activated Bestial Rage!`, 'passive');

    const attributesToChange = [
        { name: 'strength', stages: FAMILY_PASSIVE_CONFIG.ODJUR_STRENGTH_STAGES },
        { name: 'wisdom', stages: FAMILY_PASSIVE_CONFIG.ODJUR_WISDOM_STAGES }
    ];

    attributesToChange.forEach(item => {
        const result = vasen.modifyAttributeStage(item.name, item.stages);
        if (result.changed !== 0) {
            this.logStageChange(vasen, item.name, result.changed);
        }
    });

    // Gifu: share the raised attributes with allies (the lowered one is not shared)
    // in one activation (once per combat)
    const raisedAttributes = attributesToChange.filter(item => item.stages > 0);
    if (raisedAttributes.length > 0 && this.tryActivateGifu(vasen)) {
        this.getTeam(isPlayer).forEach(ally => {
            if (ally === vasen || ally.isKnockedOut()) return;
            raisedAttributes.forEach(item => {
                const allyResult = ally.modifyAttributeStage(item.name, item.stages);
                if (allyResult.changed !== 0) {
                    this.logStageChange(ally, item.name, allyResult.changed);
                }
            });
        });
    }
};

// --- OKNYTT: TAG TEAM ---
// When swapping out, raise different random attributes on the incoming väsen
Combat.prototype.passiveTagTeam = function({ vasen, incomingVasen, isPlayer }) {
    if (vasen.species.family !== FAMILIES.OKNYTT) return;
    if (!incomingVasen || incomingVasen.isKnockedOut()) return;

    const attributes = [...STAGEABLE_ATTRIBUTES]; // copied: picks are removed so they don't repeat
    const stages = FAMILY_PASSIVE_CONFIG.OKNYTT_TAG_TEAM_STAGES;
    const allies = this.getTeam(isPlayer);
    this.addLog(`${vasen.getDisplayName()} activated Tag Team!`, 'passive');

    const raisedAttributes = [];
    for (let i = 0; i < FAMILY_PASSIVE_CONFIG.OKNYTT_TAG_TEAM_ATTRIBUTE_COUNT; i++) {
        if (attributes.length === 0) break;
        const randomIndex = Math.floor(Math.random() * attributes.length);
        const randomStat = attributes[randomIndex];
        attributes.splice(randomIndex, 1);
        incomingVasen.modifyAttributeStage(randomStat, stages);
        this.logStageChange(incomingVasen, randomStat, stages);
        raisedAttributes.push(randomStat);
    }
    if (raisedAttributes.length === 0) return;

    // Gifu on the incoming vasen: their attributes were just raised, so share all of them
    // to the other allies in one activation (once per combat). The outgoing Oknytt is
    // included - it never received the buff directly.
    if (this.tryActivateGifu(incomingVasen)) {
        this.raiseAlliesStages(allies, [incomingVasen], raisedAttributes, stages);
    }

    // Gifu on the outgoing Oknytt: it granted the buff, so share all of it to the other
    // allies in one activation (once per combat). incomingVasen is excluded - it already
    // received the buff directly above.
    if (this.tryActivateGifu(vasen)) {
        this.raiseAlliesStages(allies, [incomingVasen], raisedAttributes, stages);
    }
};

// --- DRAKE: DRACONIC RESILIENCE ---
// At low health, raise Defense and Durability (once per combat)
Combat.prototype.passiveDraconicResilience = function({ vasen, isPlayer }) {
    if (vasen.species.family !== FAMILIES.DRAKE || vasen.combatFlags.drakePassiveTriggered) return;
    const healthPercent = vasen.currentHealth / vasen.maxHealth;
    if (healthPercent > FAMILY_PASSIVE_CONFIG.DRAKE_HEALTH_THRESHOLD) return;

    vasen.combatFlags.drakePassiveTriggered = true;
    this.addLog(`${vasen.getDisplayName()} activated Draconic Resilience!`, 'passive');

    const stages = FAMILY_PASSIVE_CONFIG.DRAKE_DEFENSE_DURABILITY_STAGES;
    const attributesToBuff = ['defense', 'durability'];

    attributesToBuff.forEach(stat => {
        vasen.modifyAttributeStage(stat, stages);
        this.logStageChange(vasen, stat, stages);
    });

    // Gifu: share all buffed attributes in one activation (once per combat)
    if (this.tryActivateGifu(vasen)) {
        this.raiseAlliesStages(this.getTeam(isPlayer), [vasen], attributesToBuff, stages);
    }
};

// --- BIND RUNE: FEHU + WYNJA (health threshold all-attribute buff) ---
// When this väsen's health falls to the configured threshold or lower,
// raise all four attribute stages. Triggers once per combat, at
// the same onHealthThreshold point used by Drake's family passive
// (after this väsen takes damage from an attack).
Combat.prototype.bindRuneLowHealthBuffAll = function({ vasen }) {
    if (!hasHealthThresholdBuffAllBindRune(vasen) || vasen.combatFlags.fehuWynjaPassiveTriggered) return;
    const healthPercent = vasen.currentHealth / vasen.maxHealth;
    if (healthPercent > GAME_CONFIG.RUNE_BIND_FEHU_WYNJA_HEALTH_THRESHOLD) return;

    vasen.combatFlags.fehuWynjaPassiveTriggered = true;
    const fehuWynjaBR = getActiveBindRunes(vasen).find(b => b.type === 'health_threshold_buff_all');
    this.logBindRuneActivated(vasen, fehuWynjaBR);

    STAGEABLE_ATTRIBUTES.forEach(stat => {
        const result = vasen.modifyAttributeStage(stat, GAME_CONFIG.RUNE_BIND_FEHU_WYNJA_BUFF_STAGES);
        if (result.changed !== 0) {
            this.logStageChange(vasen, stat, result.changed);
        }
    });
};

// --- RA: MALICIOUS RETALIATION ---
// When first hit, lower different random attributes on the attacker (once per combat)
Combat.prototype.passiveMaliciousRetaliation = function({ vasen, attacker }) {
    if (vasen.species.family !== FAMILIES.RA || vasen.combatFlags.raPassiveTriggered) return;
    if (!attacker || attacker.isKnockedOut()) return;
    vasen.combatFlags.raPassiveTriggered = true;

    const stages = FAMILY_PASSIVE_CONFIG.RA_DEBUFF_STAGES;
    const attributes = [...STAGEABLE_ATTRIBUTES]; // copied: picks are removed so they don't repeat
    const debuffedAttributes = [];
    for (let i = 0; i < FAMILY_PASSIVE_CONFIG.RA_DEBUFF_COUNT; i++) {
        if (attributes.length > 0) {
            const randomIndex = Math.floor(Math.random() * attributes.length);
            const stat = attributes[randomIndex];
            attacker.modifyAttributeStage(stat, -stages);
            debuffedAttributes.push(stat);
            attributes.splice(randomIndex, 1);
        }
    }

    this.addLog(`${vasen.getDisplayName()} activated Malicious Retaliation!`, 'passive');
    debuffedAttributes.forEach(stat => {
        this.logStageChange(attacker, stat, -stages);
    });
};

// --- TROLL: TROLL THEFT ---
// On the first attack, steal a raised attribute stage from the defender (once per combat)
Combat.prototype.passiveTrollTheft = function({ vasen, defender, isPlayer }) {
    if (vasen.species.family !== FAMILIES.TROLL || vasen.combatFlags.trollPassiveTriggered) return;
    if (!defender || defender.isKnockedOut()) return;
    vasen.combatFlags.trollPassiveTriggered = true;

    const stealableAttributes = STAGEABLE_ATTRIBUTES.filter(stat => defender.attributeStages[stat] > 0);
    if (stealableAttributes.length === 0) return;

    const stages = FAMILY_PASSIVE_CONFIG.TROLL_STAGE_STEAL;
    const randomStat = stealableAttributes[Math.floor(Math.random() * stealableAttributes.length)];
    defender.modifyAttributeStage(randomStat, -stages);
    vasen.modifyAttributeStage(randomStat, stages);

    this.addLog(`${vasen.getDisplayName()} activated Troll Theft!`, 'passive');
    this.logStageChange(defender, randomStat, -stages);
    this.logStageChange(vasen, randomStat, stages);

    // Gifu: share the stolen stage with allies (once per combat)
    if (this.tryActivateGifu(vasen)) {
        this.raiseAlliesStages(this.getTeam(isPlayer), [vasen], [randomStat], stages);
    }
};

// --- VALNAD: DEATHLESS ---
// When knocked out, revive with part of max health (once per combat).
// Returns true when the väsen was revived.
Combat.prototype.passiveDeathless = function({ vasen }) {
    if (vasen.species.family !== FAMILIES.VALNAD || vasen.combatFlags.valnadPassiveTriggered) return false;
    vasen.combatFlags.valnadPassiveTriggered = true;
    const reviveHealth = Math.floor(vasen.maxHealth * FAMILY_PASSIVE_CONFIG.VALNAD_REVIVE_HEALTH_PERCENT);
    vasen.currentHealth = reviveHealth;
    this.addLog(`${vasen.getDisplayName()} activated Deathless ᛣ.`, 'passive');
    this.addLog(`${vasen.getDisplayName()} revived with <span style="color: var(--color-positive-soft); font-weight: 700;">${reviveHealth}</span> HP!`);
    return true;
};

// --- BIND RUNE: INGUZ + DAGAZ (enter battlefield debuff) ---
// Lowers a random enemy attribute whenever this väsen enters the
// battlefield (combat start or any swap-in), re-triggering on every
// entry just like Dagaz's own first-round damage bonus. Can be
// blocked by the enemy's Wynja rune, same as Inguz's hit-based debuff.
Combat.prototype.bindRuneEntryDebuff = function({ vasen, isPlayer }) {
    if (!hasEnterBattlefieldDebuffBindRune(vasen)) return;
    const opponent = isPlayer ? this.enemyActive : this.playerActive;
    if (!opponent || opponent.isKnockedOut()) return;

    const inguzDagazBR = getActiveBindRunes(vasen).find(b => b.type === 'enter_battlefield_debuff');
    this.logBindRuneActivated(vasen, inguzDagazBR);

    if (!this.tryWynjaBlock(opponent)) {
        const randomStat = randomAttribute();
        opponent.modifyAttributeStage(randomStat, -GAME_CONFIG.RUNE_BIND_INGUZ_DAGAZ_DEBUFF_STAGES);
        this.logStageChange(opponent, randomStat, -GAME_CONFIG.RUNE_BIND_INGUZ_DAGAZ_DEBUFF_STAGES);
    }
};

// --- JÄTTE: JOTUN'S FURY ---
// Once per combat, at low health, upgrade the attacker's hit by one step
// (weak -> neutral -> potent). Called while a hit's matchup is calculated.
// Returns the final matchup.
Combat.prototype.applyJotunsFury = function(attacker, matchup) {
    if (
        attacker.species.family !== FAMILIES.JATTE ||
        attacker.combatFlags.jattePassiveTriggered ||
        attacker.currentHealth / attacker.maxHealth > FAMILY_PASSIVE_CONFIG.JATTE_HEALTH_THRESHOLD
    ) {
        return matchup;
    }
    attacker.combatFlags.jattePassiveTriggered = true;
    this.addLog(`${attacker.getDisplayName()} activated Jotun\'s Fury!`, 'passive');
    if (matchup === 'WEAK') return 'NEUTRAL';
    if (matchup === 'NEUTRAL') return 'POTENT';
    return matchup;
};

// --- ALV: ELVEN CRAFTSMANSHIP ---
// If the user is Alv family and the skill buffs only Strength or only Wisdom,
// also apply the same total stages to the mirror stat on the direct target.
// Called from applyBuffEffect. Returns the mirror stat (so Gifu can share it
// too), or null when the passive does not apply.
Combat.prototype.applyElvenCraftsmanship = function(user, targetVasen, attributes, stages, effects) {
    if (user.species.family !== FAMILIES.ALV) return null;
    const mirrorMap = { strength: 'wisdom', wisdom: 'strength' };
    if (attributes.length !== 1 || !mirrorMap[attributes[0]]) return null;

    const mirrorStat = mirrorMap[attributes[0]];
    const mirrorResult = targetVasen.modifyAttributeStage(mirrorStat, stages);
    if (mirrorResult.changed !== 0) {
        this.addLog(`${user.getDisplayName()} activated Elven Craftsmanship!`, 'passive');
        this.logStageChange(targetVasen, mirrorStat, mirrorResult.changed);
        effects.push({ stat: mirrorStat, change: mirrorResult.changed });
    }
    return mirrorStat;
};
