// =============================================================================
// 6c-system-combat-skills.js - Skill Resolution, Damage and Utility Effects
// =============================================================================
//
// Extends the Combat class (6a-system-combat.js) with everything that happens
// when a väsen uses a skill: the damaging hit and its follow-ups (knockout,
// Thurs reflection), the damage formula, and the effects of utility skills.
// Rune procs and family passives triggered along the way live in
// 6d-system-combat-passives.js.
// =============================================================================

// Element damage runes: skill element -> rune that boosts damage of that element
const ELEMENT_DAMAGE_RUNES = {
    [ELEMENTS.FIRE]: 'KAUNAN',
    [ELEMENTS.EARTH]: 'PERTHO',
    [ELEMENTS.WIND]: 'TYR',
    [ELEMENTS.NATURE]: 'BJARKA',
    [ELEMENTS.WATER]: 'LAGUZ'
};

// =============================================================================
// SKILL RESOLUTION
// =============================================================================

// Execute a skill: spend its megin, then resolve it as a utility effect or a damaging hit.
// isFree: the skill was triggered by an effect (Dagaz + Thurs, Wynja + Thurs) and costs no megin.
Combat.prototype.executeSkill = function(attacker, defender, skillName, isPlayer, selectedAllyTarget = null, isFree = false) {
    const skill = ABILITIES[skillName];
    if (!skill) return null;

    const meginCost = isFree ? 0 : attacker.getSkillMeginCost(skillName);
    attacker.spendMegin(meginCost);

    // Log skill use
    this.addLog(`${attacker.getDisplayName()} uses ${skill.name}!`, 'action');

    // Trigger attack animation based on skill type
    if (this.onAttack) {
        this.onAttack(isPlayer ? 'player' : 'enemy', skill.type);
    }

    if (meginCost > 0) {
        this.addLog(`${attacker.getDisplayName()} used ${meginCost} Megin!`, 'megin');
    }

    const result = {
        skill: skillName,
        attacker: attacker,
        defender: defender,
        damage: 0,
        effects: [],
        runeEffects: []
    };

    // Handle utility skills
    if (skill.type === ATTACK_TYPES.UTILITY) {
        result.effects = this.applyUtilityEffect(attacker, defender, skill, isPlayer, selectedAllyTarget);
        // A user knocked out by its own skill (Tyr's Sacrifice) gets no rune
        // procs: a Mannaz or Jera heal would otherwise bring it back
        if (!attacker.isKnockedOut()) {
            this.applyUtilityRuneEffects(attacker, skill, isPlayer, result);
            this.tryUtilityProcBindRune(attacker);
        }
        this.tryTrollTheft(attacker, defender, isPlayer);

        // Trigger debuff flash animation if this is a debuff skill
        if (skill.effect && skill.effect.type === 'debuff' && this.onHit) {
            setTimeout(() => {
                this.onHit(isPlayer ? 'enemy' : 'player', 'DEBUFF');
            }, 200);
        }

        return result;
    }

    // Calculate and apply damage
    const damageResult = this.calculateDamage(attacker, defender, skillName);
    result.damage = damageResult.damage;
    result.matchup = damageResult.matchup;
    result.attackType = damageResult.attackType;

    const actualDamage = defender.takeDamage(result.damage);

    this.addLog(`${attacker.getDisplayName()} deals ${actualDamage} damage to ${defender.getDisplayName()}!`, 'damage');

    // Empowerment: any attack consumes a held empowerment (its bonus was applied
    // in calculateDamage); skills that grant empowerment then charge the next attack.
    attacker.combatFlags.isEmpowered = skillGrantsEmpowerment(skillName);
    if (attacker.combatFlags.isEmpowered) {
        this.addLog(`${attacker.getDisplayName()} is empowered! Its next attack deals ${Math.round(GAME_CONFIG.TIER1_ATTACK_SKILL_EMPOWERMENT * 100)}% more damage.`, 'buff');
    }

    this.logDamageBindRunes(attacker, damageResult);
    this.logMatchup(damageResult.matchup);

    // Reactions to the defender taking damage
    // Drake: check health threshold
    this.applyFamilyPassive('onHealthThreshold', { vasen: defender, isPlayer: !isPlayer });

    // Rå: Malicious Retaliation when hit (once per combat)
    if (!defender.combatFlags.raPassiveTriggered) {
        this.applyFamilyPassive('onTakeDamage', { vasen: defender, attacker: attacker, isPlayer: !isPlayer });
    }

    this.tryHagalNaudizDebuff(attacker, defender);

    // Check if this hit will cause a knockout BEFORE flashing
    const willKnockout = defender.isKnockedOut();

    // Flash the defender (hit effect) with a 200ms delay to overlap with attack animation
    // This creates a better visual flow where the flash happens as the attacker reaches forward
    if (this.onHit) {
        setTimeout(() => {
            if (willKnockout) {
                this.onHit(isPlayer ? 'enemy' : 'player', 'KNOCKOUT');
            } else {
                this.onHit(isPlayer ? 'enemy' : 'player', damageResult.matchup);
            }
        }, 200);
    }

    // Handle rune effects for hits
    this.applyHitRuneEffects(attacker, defender, damageResult, result, isPlayer);
    this.tryHitProcBindRunes(attacker, defender, damageResult.matchup);

    if (willKnockout) {
        this.resolveKnockout(attacker, defender, isPlayer);
    }

    // Thurs: damage reflect as Mixed hit (only if the attacker is still standing)
    if (!attacker.isKnockedOut() && defender.hasRune('THURS') && result.damage > 0) {
        this.applyThursReflection(attacker, defender, result, isPlayer);
    }

    this.tryTrollTheft(attacker, defender, isPlayer);

    return result;
};

// Troll family passive: steal an attribute stage when using any skill (once per
// combat). Not if either side is knocked out (e.g. the Troll by a Thurs reflection).
Combat.prototype.tryTrollTheft = function(attacker, defender, isPlayer) {
    if (attacker.isKnockedOut() || !defender || defender.isKnockedOut()) return;
    if (attacker.combatFlags.trollPassiveTriggered) return;
    this.applyFamilyPassive('onUseSkill', { vasen: attacker, defender: defender, isPlayer });
};

// A hit has knocked the defender out: knockout-triggered runes and passives
// resolve first, then the knockout is logged unless the defender was revived.
Combat.prototype.resolveKnockout = function(attacker, defender, isPlayer) {
    // Hagal rune: Debuff enemy on knockout (triggers BEFORE revive check).
    // Wynja on the attacker blocks it.
    if (defender.hasRune('HAGAL') && attacker && !attacker.isKnockedOut()) {
        this.logRuneActivated(defender, 'HAGAL');
        if (!this.tryWynjaBlock(attacker)) {
            STAGEABLE_ATTRIBUTES.forEach(stat => {
                const result = attacker.modifyAttributeStage(stat, -GAME_CONFIG.RUNE_HAGAL_DEBUFF_STAGES);
                if (result.changed !== 0) {
                    this.logStageChange(attacker, stat, result.changed);
                }
            });
        }
    }

    // Bind Rune - Gifu + Hagal: the fallen väsen's allies each get a random
    // attribute raised (also triggers BEFORE the revive check, like Hagal)
    this.tryGifuHagalAllyBuff(defender, !isPlayer);

    // Vålnad family passive: Deathless - attempt to revive
    const revived = this.applyFamilyPassive('onKnockout', { vasen: defender, isPlayer: !isPlayer });
    if (revived) return;

    if (isPlayer) {
        this.addLog(`${defender.getDisplayName()} collapses!`, 'knockout');
    } else {
        this.addLog(`${defender.getDisplayName()} has fainted!`, 'knockout');
    }
};

// Thurs: the defender reflects part of the hit back at the attacker as a Mixed
// hit, which can in turn trigger the defender's Naudiz and Inguz runes.
// isPlayer: whether the original attacker is on the player's side.
Combat.prototype.applyThursReflection = function(attacker, defender, result, isPlayer) {
    this.logRuneActivated(defender, 'THURS');

    // The defender (Thurs user) becomes the "attacker" for the reflection
    // and the original attacker becomes the target
    const reflectResult = this.calculateThursReflection(defender, attacker, result.damage);
    if (reflectResult.damage <= 0) return;

    const reflectedDamage = attacker.takeDamage(reflectResult.damage);
    this.addLog(`${attacker.getDisplayName()} took ${reflectResult.damage} damage!`, 'damage');
    result.runeEffects.push({ rune: 'THURS', effect: `reflected ${reflectResult.damage}` });

    // Bind Rune - Uruz + Thurs: the Thurs user gains part of the reflected damage as megin
    const uruzThursBR = getActiveBindRuneOfType(defender, 'thurs_megin_gain');
    if (uruzThursBR && !defender.isKnockedOut()) {
        const meginGained = defender.gainMegin(Math.floor(reflectedDamage * GAME_CONFIG.RUNE_BIND_URUZ_THURS_MEGIN_PERCENT));
        if (meginGained > 0) {
            this.logBindRuneActivated(defender, uruzThursBR);
            this.addLog(`${defender.getDisplayName()} gained ${meginGained} Megin!`, 'megin');
        }
    }

    this.logMatchup(reflectResult.matchup);

    // Naudiz: debuffs the original attacker when the reflection was WEAK
    if (reflectResult.matchup === 'WEAK' && defender.hasRune('NAUDIZ')) {
        this.logRuneActivated(defender, 'NAUDIZ');
        for (let i = 0; i < GAME_CONFIG.RUNE_NAUDIZ_DEBUFF_COUNT; i++) {
            const stat = randomAttribute();
            // Wynja on the original attacker blocks the entire Naudiz sequence
            if (this.tryWynjaBlock(attacker)) break;
            this.logStageChange(attacker, stat, attacker.modifyAttributeStage(stat, -GAME_CONFIG.RUNE_NAUDIZ_DEBUFF_STAGES).changed);
        }
        result.runeEffects.push({ rune: 'NAUDIZ', effect: 'debuffed on weak reflection' });
    }

    // Inguz: chance to debuff the original attacker on any reflection hit
    if (defender.hasRune('INGUZ')) {
        if (Math.random() < GAME_CONFIG.RUNE_INGUZ_DEBUFF_PROC_CHANCE) {
            if (!this.tryWynjaBlock(attacker)) {
                this.logRuneActivated(defender, 'INGUZ');
                const randomStat = randomAttribute();
                this.logStageChange(attacker, randomStat, attacker.modifyAttributeStage(randomStat, -GAME_CONFIG.RUNE_INGUZ_DEBUFF_STAGES).changed);
                result.runeEffects.push({ rune: 'INGUZ', effect: 'debuffed on reflection' });
            }
        }
    }

    // Fehu / Naudiz bind runes: the reflection is a hit from the Thurs user
    this.tryHitProcBindRunes(defender, attacker, reflectResult.matchup);

    // The reflection knocked out the original attacker: resolve it like any
    // knockout from a hit, with the Thurs user as the one who landed it (Hagal,
    // Deathless, knockout log)
    if (attacker.isKnockedOut()) {
        this.resolveKnockout(defender, attacker, !isPlayer);
    }
};

// Returns the first-use initial bonus stages for this skill on this side
// (0 if the skill has none or its bonus was already used this combat)
Combat.prototype.consumeInitialBonus = function(skill, isPlayer) {
    if (!skill.initialBonus) return 0;
    const initialBonusSet = isPlayer ? this.playerInitialBonusUsed : this.enemyInitialBonusUsed;
    if (initialBonusSet.has(skill.name)) return 0;
    initialBonusSet.add(skill.name);
    return skill.initialBonus;
};

// =============================================================================
// DAMAGE CALCULATION
// =============================================================================

// Calculate the damage of an attack skill, along with the matchup and any
// bind rune conversions that applied (used for logging)
Combat.prototype.calculateDamage = function(attacker, defender, skillName) {
    const skill = ABILITIES[skillName];
    let skillElement = getSkillElement(skillName, attacker.species.element);

    // Bind Rune - Elemental Conversion: if the attacker has an active elemental
    // conversion bind rune and this skill's element matches the source element,
    // override skillElement to the converted element for matchup and damage.
    const eleConversionBR = getElementConversionBindRune(attacker);
    let bindRuneEleConverted = false;
    if (eleConversionBR && skillElement === eleConversionBR.sourceElement) {
        skillElement = eleConversionBR.convertedElement;
        bindRuneEleConverted = true;
    }

    // Determine attack type (considering Ansuz and Raido)
    const attackType = skill.type;
    let useWisdom = attackType === ATTACK_TYPES.WISDOM;
    let useStrength = attackType === ATTACK_TYPES.STRENGTH;

    if (attackType === ATTACK_TYPES.MIXED) {
        useWisdom = true;
        useStrength = true;
    }

    // Ansuz: Strength attacks use Wisdom
    if (attacker.hasRune('ANSUZ') && attackType === ATTACK_TYPES.STRENGTH) {
        useWisdom = true;
        useStrength = false;
    }

    // Raido: Wisdom attacks use Strength
    if (attacker.hasRune('RAIDO') && attackType === ATTACK_TYPES.WISDOM) {
        useStrength = true;
        useWisdom = false;
    }

    // Bind Rune - Use Best Stat (Ansuz + Raido): all attacks use whichever of
    // the attacker's Strength or Wisdom (with stage modifiers) is currently higher.
    const bindRuneUseBestStat = hasUseBestStatBindRune(attacker);

    const matchup = this.applyJotunsFury(attacker, getMatchupType(skillElement, defender.species.element));
    const elementMod = DAMAGE_MULTIPLIERS[matchup];

    // Damage range
    const damageRange = 1 + (Math.random() * GAME_CONFIG.DAMAGE_RANGE_VARIANCE);

    const damageMod = this.getDamageModifier(attacker, defender, skillName, skillElement, matchup);
    const power = this.getHitPower(skill, attacker, defender);

    // Calculate damage based on attack type
    let totalDamage = 0;

    if (skill.type === ATTACK_TYPES.MIXED) {
        if (bindRuneUseBestStat) {
            // Use the higher of strength/wisdom for both halves
            const bestStat = attacker.getAttribute('strength') >= attacker.getAttribute('wisdom')
                ? attacker.getAttribute('strength')
                : attacker.getAttribute('wisdom');
            const bestDef = attacker.getAttribute('strength') >= attacker.getAttribute('wisdom')
                ? defender.getAttribute('defense')
                : defender.getAttribute('durability');
            totalDamage = this.calculateSingleTypeDamage(
                power, bestStat, bestDef, damageRange, elementMod, damageMod
            );
        } else {
            // 50% Strength, 50% Wisdom
            const strengthDamage = this.calculateSingleTypeDamage(
                power, attacker.getAttribute('strength'), defender.getAttribute('defense'),
                damageRange, elementMod, damageMod
            ) * GAME_CONFIG.MIXED_ATTACK_STRENGTH_PORTION;

            const wisdomDamage = this.calculateSingleTypeDamage(
                power, attacker.getAttribute('wisdom'), defender.getAttribute('durability'),
                damageRange, elementMod, damageMod
            ) * GAME_CONFIG.MIXED_ATTACK_WISDOM_PORTION;

            totalDamage = strengthDamage + wisdomDamage;
        }
    } else if (useStrength) {
        if (bindRuneUseBestStat && attacker.getAttribute('wisdom') > attacker.getAttribute('strength')) {
            // Wisdom is higher - use wisdom stat, check vs durability
            totalDamage = this.calculateSingleTypeDamage(
                power, attacker.getAttribute('wisdom'), defender.getAttribute('durability'),
                damageRange, elementMod, damageMod
            );
        } else {
            totalDamage = this.calculateSingleTypeDamage(
                power, attacker.getAttribute('strength'), defender.getAttribute('defense'),
                damageRange, elementMod, damageMod
            );
        }
    } else if (useWisdom) {
        if (bindRuneUseBestStat && attacker.getAttribute('strength') > attacker.getAttribute('wisdom')) {
            // Strength is higher - use strength stat, check vs defense
            totalDamage = this.calculateSingleTypeDamage(
                power, attacker.getAttribute('strength'), defender.getAttribute('defense'),
                damageRange, elementMod, damageMod
            );
        } else {
            totalDamage = this.calculateSingleTypeDamage(
                power, attacker.getAttribute('wisdom'), defender.getAttribute('durability'),
                damageRange, elementMod, damageMod
            );
        }
    }

    return {
        damage: Math.floor(Math.max(1, totalDamage)),
        matchup: matchup,
        attackType: skill.type,
        element: skillElement,
        bindRuneEleConverted: bindRuneEleConverted,
        bindRuneUseBestStat: bindRuneUseBestStat && (useStrength || useWisdom || skill.type === ATTACK_TYPES.MIXED),
        // Uruz + Ansuz / Uruz + Raido and Naudiz + Odal changed this hit's damage
        bindRuneConvertedAttack: getConvertedAttackBindRune(attacker, skillName) !== null,
        bindRuneNaudizOdal: this.naudizOdalApplies(attacker, skillName, matchup),
        // Dagaz + Jera: the Dagaz bonus applied only because of the extra rounds
        bindRuneDagazExtended: attacker.hasRune('DAGAZ') && !attacker.combatFlags.isFirstRound && attacker.combatFlags.dagazBonusRoundsLeft > 0
    };
};

// Damage multiplier from the attacker's damage runes, the defender's Fehu and
// a held empowerment
Combat.prototype.getDamageModifier = function(attacker, defender, skillName, skillElement, matchup) {
    let damageMod = 1;

    // Element damage bonuses
    const elementRune = ELEMENT_DAMAGE_RUNES[skillElement];
    if (elementRune && attacker.hasRune(elementRune)) {
        damageMod += GAME_CONFIG.RUNE_ELEMENT_DAMAGE_BOOST;
    }

    // Odal: low cost bonus. Naudiz + Odal: neutral and weak hits Odal alone
    // would not boost get the bind rune's bonus instead (never both).
    if (attacker.hasRune('ODAL') && attacker.getSkillMeginCost(skillName) <= GAME_CONFIG.RUNE_ODAL_COST_THRESHOLD) {
        damageMod += GAME_CONFIG.RUNE_ODAL_DAMAGE_BOOST;
    } else if (this.naudizOdalApplies(attacker, skillName, matchup)) {
        damageMod += GAME_CONFIG.RUNE_BIND_NAUDIZ_ODAL_DAMAGE_BOOST;
    }

    // Uruz + Ansuz / Uruz + Raido: attacks the partner rune converts hit harder
    // (their higher megin cost is applied in VasenInstance.getSkillMeginCost)
    if (getConvertedAttackBindRune(attacker, skillName)) {
        damageMod += GAME_CONFIG.RUNE_BIND_URUZ_CONVERTED_DAMAGE_BOOST;
    }

    // Dagaz: first round bonus (Dagaz + Jera: lasts RUNE_BIND_DAGAZ_JERA_ROUNDS rounds)
    if (attacker.hasRune('DAGAZ') && (attacker.combatFlags.isFirstRound || attacker.combatFlags.dagazBonusRoundsLeft > 0)) {
        damageMod += GAME_CONFIG.RUNE_DAGAZ_DAMAGE_BOOST;
    }

    // Fehu: reduce potent damage taken
    if (matchup === 'POTENT' && defender.hasRune('FEHU')) {
        damageMod *= GAME_CONFIG.RUNE_FEHU_DAMAGE_REDUCTION;
    }

    // Empowerment from a previous Tier 1 attack (consumed in executeSkill)
    if (attacker.combatFlags.isEmpowered) {
        damageMod *= 1 + GAME_CONFIG.TIER1_ATTACK_SKILL_EMPOWERMENT;
    }

    return damageMod;
};

// Bind Rune - Naudiz + Odal: true if this hit gets the bind rune's bonus, i.e. it
// is a neutral or weak hit that Odal's own low-cost bonus does not already cover
Combat.prototype.naudizOdalApplies = function(attacker, skillName, matchup) {
    return matchup !== 'POTENT'
        && attacker.getSkillMeginCost(skillName) > GAME_CONFIG.RUNE_ODAL_COST_THRESHOLD
        && getActiveBindRuneOfType(attacker, 'non_potent_odal') !== null;
};

// Skill power for this hit, including the conditional bonuses of skills that
// scale with the combat situation
Combat.prototype.getHitPower = function(skill, attacker, defender) {
    let power = skill.power;

    // Loki's Betrayal: bonus power if the defender has any negative attribute stage
    if (skill.lokiBetrayalBonus) {
        const hasNegativeStage = Object.values(defender.attributeStages).some(stage => stage < 0);
        if (hasNegativeStage) {
            power += skill.enemy_debuff_bonus;
        }
    }

    // Rotvälta: bonus power if the attacker was attacked this turn
    if (skill.retaliationBonus && attacker.combatFlags.wasAttackedThisTurn) {
        power += skill.retaliationBonus;
    }

    // Giantsbane: gains power based on the target's current HP
    if (skill.giantsbaneBonus) {
        power += Math.floor(defender.currentHealth * skill.target_hp_bonus_percent);
    }

    return power;
};

// Calculate Thurs reflection damage as Mixed attack
Combat.prototype.calculateThursReflection = function(defender, attacker, originalDamage) {
    // Use the defender's element for the reflection
    const reflectElement = defender.species.element;

    // Element matchup for the reflection (Jotun's Fury can also upgrade it)
    const matchup = this.applyJotunsFury(defender, getMatchupType(reflectElement, attacker.species.element));
    let elementMod = DAMAGE_MULTIPLIERS[matchup];

    // Fehu: a potent reflection is a potent hit, so it deals less damage too
    if (matchup === 'POTENT' && attacker.hasRune('FEHU')) {
        elementMod *= GAME_CONFIG.RUNE_FEHU_DAMAGE_REDUCTION;
    }

    // Base reflected damage is a fixed fraction of the original hit
    const baseReflectDamage = originalDamage * GAME_CONFIG.RUNE_THURS_RETURN_DAMAGE;

    // Mixed attack: 50% based on Strength, 50% based on Wisdom
    const strengthFactor = defender.getAttribute('strength') / 100;
    const wisdomFactor = defender.getAttribute('wisdom') / 100;
    const statMod = (strengthFactor + wisdomFactor) * 0.5;

    // Calculate final reflected damage
    const totalReflectDamage = baseReflectDamage * elementMod * statMod;

    return {
        damage: Math.floor(Math.max(1, totalReflectDamage)),
        matchup: matchup,
        element: reflectElement
    };
};

// Core damage formula for one attack stat against one defense stat
Combat.prototype.calculateSingleTypeDamage = function(power, attackStat, defenseStat, damageRange, elementMod, damageMod) {
    const powerFactor = power / GAME_CONFIG.POWER_CONSTANT;
    const defenseReduction = 1 - (defenseStat / (defenseStat + GAME_CONFIG.DEFENSE_CONSTANT));
    return powerFactor * damageRange * attackStat * elementMod * damageMod * defenseReduction;
};

// =============================================================================
// UTILITY SKILL EFFECTS
// =============================================================================

// Apply a utility skill's effect. Returns the list of attribute changes made.
Combat.prototype.applyUtilityEffect = function(user, target, skill, isPlayer, selectedAllyTarget = null) {
    const effect = skill.effect;
    if (!effect) return [];

    switch (effect.type) {
        case 'tyrs_sacrifice':
            return this.applyTyrsSacrifice(user, skill, isPlayer);
        case 'freyastears':
            return this.applyFreyasTears(isPlayer);
        case 'buff':
            return this.applyBuffEffect(user, skill, isPlayer, selectedAllyTarget);
        case 'debuff':
            return this.applyDebuffEffect(target, skill, isPlayer);
        default:
            return [];
    }
};

// Tyr's Sacrifice: sacrifice a share of max HP to raise all attributes (lethal if HP runs out)
Combat.prototype.applyTyrsSacrifice = function(user, skill, isPlayer) {
    const effects = [];
    const stages = GAME_CONFIG.TYRS_SACRIFICE_STAGES;

    const healthCost = Math.floor(user.maxHealth * skill.healthCost);
    user.currentHealth = Math.max(0, user.currentHealth - healthCost);
    this.addLog(`${user.getDisplayName()} sacrifices ${healthCost} HP!`, 'damage');

    // The sacrifice knocked the user out: resolve it like any knockout, with the
    // opponent on the battlefield as the enemy (Hagal, Deathless, knockout log).
    // Revived by Deathless, it still gets the attributes; otherwise nothing more happens.
    if (user.isKnockedOut()) {
        const opponent = isPlayer ? this.enemyActive : this.playerActive;
        this.resolveKnockout(opponent, user, !isPlayer);
        if (user.isKnockedOut()) return effects;
    }

    const raised = STAGEABLE_ATTRIBUTES.filter(stat => {
        const result = user.modifyAttributeStage(stat, stages);
        if (result.changed !== 0) {
            this.logStageChange(user, stat, result.changed);
            effects.push({ stat, change: result.changed });
        }
        return result.changed > 0;
    });

    // Gifu: share every raised attribute with allies
    this.shareRaiseWithGifu(user, raised, stages);

    return effects;
};

// Freya's Tears: heals and refills megin for the whole team for a few turns
// (applied each turn in endTurn). Casting it while active does not stack: it
// restarts the countdown at the full duration.
Combat.prototype.applyFreyasTears = function(isPlayer) {
    const teamFlag = isPlayer ? 'playerTeamFreyasTears' : 'enemyTeamFreyasTears';
    const teamName = isPlayer ? 'your team' : 'the enemy team';
    const renewed = this[teamFlag] > 0;

    this[teamFlag] = GAME_CONFIG.FREYASTEARS_TURNS;
    this.addLog(renewed
        ? `Freya's Tears are renewed for ${teamName}.`
        : `Freya's Tears rain down, replenishing ${teamName}.`, 'buff');
    return [{ type: 'freyastears', team: isPlayer ? 'player' : 'enemy', turns: GAME_CONFIG.FREYASTEARS_TURNS }];
};

// Buff skill: raises attributes on the user or the selected ally, then lets
// Elven Craftsmanship and Gifu extend the buff
Combat.prototype.applyBuffEffect = function(user, skill, isPlayer, selectedAllyTarget) {
    const effects = [];
    const effect = skill.effect;
    const targetVasen = (effect.target === 'ally' && selectedAllyTarget) ? selectedAllyTarget : user;

    // First use of this buff skill this combat for this side (ally- or self-targeted)
    // grants bonus stages. The bonus is applied to the direct target; Gifu then shares
    // the full total to all other allies in one pass after the loop.
    const initialBonusStages = this.consumeInitialBonus(skill, isPlayer);

    const totalStagesToShare = effect.stages + initialBonusStages;
    const attributes = effect.attributes || [effect.stat];

    // Apply all attribute buffs to the direct target first.
    // Gifu sharing is done in a single pass after this loop so that ALL
    // buffed attributes (not just the first one) are shared to allies.
    attributes.forEach(stat => {
        if (initialBonusStages > 0) {
            const bonusResult = targetVasen.modifyAttributeStage(stat, initialBonusStages);
            if (bonusResult.changed !== 0) {
                this.logStageChange(targetVasen, stat, bonusResult.changed, 'Initial bonus! ');
                effects.push({ stat, change: bonusResult.changed });
            }
        }

        const result = targetVasen.modifyAttributeStage(stat, effect.stages);
        if (result.capped) {
            this.addLog(`${targetVasen.getDisplayName()}'s ${stat} cannot be raised any higher.`, 'status');
        } else if (result.changed !== 0) {
            this.logStageChange(targetVasen, stat, result.changed);
            effects.push({ stat, change: result.changed });
        }
    });

    // Elven Craftsmanship may raise a mirror attribute, which Gifu also shares below
    const mirrorStat = this.applyElvenCraftsmanship(user, targetVasen, attributes, totalStagesToShare, effects);
    const statsToShare = mirrorStat ? [...attributes, mirrorStat] : [...attributes];
    const allies = this.getTeam(isPlayer);

    // Gifu on the caster (user): share ALL buffed stats to allies in one activation.
    if (this.tryActivateGifu(user)) {
        this.raiseAlliesStages(allies, [user, targetVasen], statsToShare, totalStagesToShare);
    }

    // Gifu on the recipient (targetVasen): share ALL buffed stats to allies in one activation.
    // This handles the case where a benched ally is buffed and they carry Gifu.
    if (targetVasen !== user && this.tryActivateGifu(targetVasen)) {
        this.raiseAlliesStages(allies, [targetVasen], statsToShare, totalStagesToShare);
    }

    return effects;
};

// Debuff skill: lowers attributes on the opposing active väsen
Combat.prototype.applyDebuffEffect = function(target, skill, isPlayer) {
    const effects = [];
    const effect = skill.effect;
    const targetVasen = isPlayer ? target : this.playerActive;
    const attributes = effect.attributes || [effect.stat];

    // Wynja: block first debuff entirely (including the first-use bonus)
    if (this.tryWynjaBlock(targetVasen)) return effects;

    // First use of this debuff skill this combat for this side grants extra lowering
    const initialBonusStages = this.consumeInitialBonus(skill, isPlayer);

    attributes.forEach(stat => {
        if (initialBonusStages > 0) {
            const bonusResult = targetVasen.modifyAttributeStage(stat, -initialBonusStages);
            if (bonusResult.changed !== 0) {
                this.logStageChange(targetVasen, stat, bonusResult.changed, 'Initial bonus! ');
                effects.push({ stat, change: bonusResult.changed });
            }
        }

        const result = targetVasen.modifyAttributeStage(stat, -effect.stages);
        if (result.capped) {
            this.addLog(`${targetVasen.getDisplayName()}'s ${stat} cannot be lowered any further.`, 'status');
        } else if (result.changed !== 0) {
            this.logStageChange(targetVasen, stat, result.changed);
            effects.push({ stat, change: result.changed });
        }
    });

    return effects;
};
