// =============================================================================
// 6b-system-ai.js - Enemy AI System
// =============================================================================

class EnemyAI {
    constructor(combat, isGuardian) {
        this.combat = combat;
        this.isGuardian = isGuardian;
        this.vasen = combat.enemyActive;
        this.target = combat.playerActive;
    }
    
    chooseAction() {
        const actions = this.scoreAllActions();
        
        // Sort by score descending
        actions.sort((a, b) => b.score - a.score);
        
        // Return best action
        return actions[0] || { type: 'skill', skill: 'Basic Strike' };
    }
    
    scoreAllActions() {
        const actions = [];
        
        // Score skills
        const skills = this.vasen.getAvailableSkills();
        skills.forEach(skillName => {
            if (this.vasen.canUseSkill(skillName)) {
                const score = this.scoreSkill(skillName);
                const action = { type: 'skill', skill: skillName, score };
                // For ally-targeted buff skills, pre-select the best target
                if (skillRequiresAllyTarget(skillName)) {
                    action.selectedAllyTarget = this.chooseBestAllyTarget(skillName);
                }
                actions.push(action);
            }
        });
        
        // Score swap (guardians only)
        if (this.isGuardian) {
            const swapTargets = this.combat.enemyTeam.filter(v => 
                !v.isKnockedOut() && v !== this.vasen
            );
            swapTargets.forEach(target => {
                const score = this.scoreSwap(target);
                actions.push({ type: 'swap', target, score });
            });
        }
        
        return actions;
    }
    
    scoreSkill(skillName) {
        const skill = ABILITIES[skillName];
        let score = 0;

        // Tyr's Sacrifice: use on turn 1 only, never again
        if (skillName === "Tyr's Sacrifice") {
            // Already used this combat - never choose it again
            if (this.combat.getEnemyUtilityUsageCount(this.vasen, "Tyr's Sacrifice") > 0) {
                return -999;
            }
            // Use it immediately on the first turn on the field (turnsOnField === 0)
            if (this.vasen.combatFlags.turnsOnField === 0) {
                return 200;
            }
            // Not turn 1 and not yet used - still penalise heavily so it's never chosen late
            return -999;
        }

        // Freya's Tears: use at most once per combat, and only in the first two turns on field
        if (skillName === "Freya's Tears") {
            if (this.combat.getEnemyUtilityUsageCount(this.vasen, "Freya's Tears") > 0) {
                return -999;
            }
            // Only worthwhile early; heavily penalise if used late
            if (this.vasen.combatFlags.turnsOnField > 1) {
                return -50;
            }
        }

        // Giantsbane: score based on target's current HP ratio, but only when the hit
        // is not WEAK - a weak Giantsbane deals reduced damage and loses most of its value.
        if (skill.giantsbaneBonus) {
            const skillElement = getSkillElement(skillName, this.vasen.species.element);
            const giantsbaneMatchup = getMatchupType(skillElement, this.target.species.element);
            if (giantsbaneMatchup !== 'WEAK') {
                const hpRatio = this.target.currentHealth / this.target.maxHealth;
                if (hpRatio >= 0.9) {
                    // Target nearly full HP - ideal window, strong bonus
                    score += 80;
                } else if (hpRatio >= 0.7) {
                    // Still worthwhile
                    score += 40;
                } else if (hpRatio >= 0.5) {
                    // Marginal - slight bonus
                    score += 10;
                } else {
                    // Target is low HP - Giantsbane is wasteful, heavy penalty
                    score -= 60;
                }
            } else {
                // Weak hit: Giantsbane loses its key advantage - penalise heavily
                score -= 60;
            }
        }
        
        // Base score
        if (skill.type === ATTACK_TYPES.UTILITY) {
            // Check usage count for utility skills
            const usageCount = this.combat.getEnemyUtilityUsageCount(this.vasen, skillName);
            
            if (usageCount === 0) {
                // First use - modest base score; type-specific bonuses applied below
                score += GAME_CONFIG.AI_UTILITY_FIRST_USE_SCORE;
            } else if (usageCount === 1) {
                // Second use - reduced base score; type-specific bonuses may still apply
                score += GAME_CONFIG.AI_UTILITY_SECOND_USE_SCORE;
            } else {
                // Third+ use - never chosen
                score += GAME_CONFIG.AI_UTILITY_THIRD_USE_PENALTY;
            }
        } else {
            score += GAME_CONFIG.AI_NON_UTILITY_BASE_SCORE;
        }
        
        // Damage bonus
        if (skill.type !== ATTACK_TYPES.UTILITY) {
            const predictedDamage = this.predictDamage(skillName);
            
            if (predictedDamage >= this.target.currentHealth) {
                score += GAME_CONFIG.AI_KNOCKOUT_BONUS; // Knockout bonus
            } else if (predictedDamage >= this.target.maxHealth * GAME_CONFIG.AI_HIGH_DAMAGE_THRESHOLD) {
                score += GAME_CONFIG.AI_HIGH_DAMAGE_BONUS; // High damage bonus
            }

            // Scale with damage relative to the target's remaining health, so
            // harder hits win over weaker ones even below the thresholds above.
            const damageShare = Math.min(1, predictedDamage / Math.max(1, this.target.currentHealth));
            score += damageShare * GAME_CONFIG.AI_DAMAGE_SCORE_WEIGHT;

            // Last stand: a badly hurt Väsen goes all-in on its hardest hit.
            if (this.isDesperate()) {
                score += damageShare * GAME_CONFIG.AI_DESPERATION_DAMAGE_WEIGHT;
            }
            
            // Empowerment strategy: 
            // If not empowered and skill grants empowerment, give bonus for setting up
            // If empowered and skill is high-power, give bonus for using empowerment
            if (!this.vasen.combatFlags.isEmpowered && skillGrantsEmpowerment(skillName)) {
                // Give bonus to low-tier attacks if we're not empowered (setup for next turn)
                score += GAME_CONFIG.AI_EMPOWERMENT_SETUP_BONUS;
            } else if (this.vasen.combatFlags.isEmpowered && !skillGrantsEmpowerment(skillName) && skill.power >= GAME_CONFIG.AI_HIGH_POWER_THRESHOLD) {
                // Give significant bonus to high-power attacks if we're empowered
                score += GAME_CONFIG.AI_EMPOWERED_HIGH_POWER_BONUS;
            }
            
            // Element bonus
            const skillElement = getSkillElement(skillName, this.vasen.species.element);
            const matchup = getMatchupType(skillElement, this.target.species.element);
            
            if (matchup === 'POTENT') {
                score += GAME_CONFIG.AI_ELEMENT_POTENT_BONUS;
            } else if (matchup === 'WEAK') {
                // Check for weak hit runes
                if (this.vasen.hasRune('NAUDIZ')) {
                    score += GAME_CONFIG.AI_ELEMENT_WEAK_WITH_RUNE_PENALTY;
                } else {
                    score += GAME_CONFIG.AI_ELEMENT_WEAK_WITHOUT_RUNE_PENALTY;
                }
            }
            
            // Rune synergy bonus
            if (this.isGuardian) {
                score += this.scoreRuneSynergy(skillName);
            }
            
            // Loki's Betrayal: bonus if target has a negative attribute stage
            if (skill.lokiBetrayalBonus) {
                const targetStages = this.target.attributeStages;
                const hasNegativeStage = Object.values(targetStages).some(stage => stage < 0);
                if (hasNegativeStage) {
                    score += 40;
                }
            }

            // Rotvälta: estimate the probability that the enemy will attack this turn.
            // Turn 0 is commonly a setup round (buffs, utility), so the chance is lower.
            // From turn 1 onward attacks are far more likely, so the estimated bonus is higher.
            // The max bonus is intentionally moderate - the AI cannot know for certain.
            if (skill.retaliationBonus) {
                const turnsOnField = this.vasen.combatFlags.turnsOnField;
                const estimatedAttackProb = turnsOnField === 0 ? 0.35 : 0.70;
                score += Math.round(estimatedAttackProb * 25);
            }
        } else {
            // Utility-specific scoring: attacks are the bread and butter; utilities are early set-ups.
            const usageCount = this.combat.getEnemyUtilityUsageCount(this.vasen, skillName);
            const turnsOnField = this.vasen.combatFlags.turnsOnField;

            if (skill.effect && skill.effect.type === 'buff') {
                // Buff moves (Smithing, Skald's Mead, Thick Coat, etc.):
                // Only give a meaningful bonus on the very first turn on the field and only once.
                // After that they should not compete with attacks.
                if (usageCount === 0 && turnsOnField <= 1) {
                    score += GAME_CONFIG.AI_BUFF_BONUS;
                } else {
                    // Late or repeated buff use: penalise heavily so attacks always win.
                    score -= 60;
                }

            } else if (skill.effect && skill.effect.type === 'debuff') {
                // Debuff moves (Enchanting Song, Burning Insult):
                // Allowed up to twice if Loki's Betrayal is in the moveset and the target
                // is not yet debuffed (setting it up for the follow-up attack).
                // Otherwise, only once early in combat.
                const hasLokisBetrayal = this.vasen.getAvailableSkills().includes("Loki's Betrayal");
                const targetAlreadyDebuffed = Object.values(this.target.attributeStages).some(s => s < 0);

                if (usageCount === 0) {
                    // First debuff: worthwhile early, or if Loki's Betrayal is available as a set-up.
                    if (turnsOnField <= 1) {
                        score += GAME_CONFIG.AI_DEBUFF_BONUS;
                    } else if (hasLokisBetrayal && !targetAlreadyDebuffed) {
                        // Mid-combat: only if it sets up Loki's Betrayal and target isn't debuffed yet
                        score += GAME_CONFIG.AI_DEBUFF_BONUS;
                    } else {
                        score -= 40;
                    }
                } else if (usageCount === 1 && hasLokisBetrayal && !targetAlreadyDebuffed) {
                    // Second debuff: only if Loki's Betrayal set-up is still relevant
                    score += GAME_CONFIG.AI_DEBUFF_BONUS - 15;
                } else {
                    // Any further debuff use: heavily penalise
                    score -= 60;
                }
            }
        }
        
        // Megin penalty (ignored in a last stand: saving Megin is pointless then)
        const meginCost = this.vasen.getEffectiveSkillMeginCost(skillName);
        if (!this.isDesperate() && meginCost > this.vasen.currentMegin * GAME_CONFIG.AI_MEGIN_PENALTY_THRESHOLD) {
            score += GAME_CONFIG.AI_MEGIN_PENALTY;
        }

        // Risk penalty: only discourages slow utility set-ups when under threat;
        // attacks are never penalised for being in danger.
        if (skill.type === ATTACK_TYPES.UTILITY) {
            const threatLevel = this.assessThreat();
            if (threatLevel > GAME_CONFIG.AI_RISK_PENALTY_THRESHOLD) {
                score += GAME_CONFIG.AI_RISK_PENALTY;
            }
        }
        
        // Variance
        const variance = this.isGuardian ? GAME_CONFIG.AI_GUARDIAN_VARIANCE : GAME_CONFIG.AI_WILD_VARIANCE;
        score += (Math.random() * variance * 2) - variance;
        
        return score;
    }
    
    // Swapping costs the turn, and the opponent's attack usually lands before
    // the swap does. So a swap is only worth it when the bench Väsen is clearly
    // a better fight than the active one, never just because the active one is low.
    scoreSwap(target) {
        const NO_SWAP = -999;

        // Fresh arrivals stay put for a while; this stops back-and-forth swapping.
        if (this.vasen.combatFlags.turnsOnField < GAME_CONFIG.AI_SWAP_MIN_TURNS_ON_FIELD) return NO_SWAP;

        // A badly hurt Väsen has little left to preserve; it makes its last stand.
        if (this.vasen.currentHealth < this.vasen.maxHealth * GAME_CONFIG.AI_SWAP_MIN_HEALTH_TO_RETREAT) return NO_SWAP;

        // Never throw a hurt bench Väsen into the fight.
        if (target.currentHealth < target.maxHealth * GAME_CONFIG.AI_SWAP_MIN_TARGET_HEALTH) return NO_SWAP;

        // If the active Väsen can knock the opponent out right now, just do it.
        if (this.bestDamage(this.vasen, this.target) >= this.target.currentHealth) return NO_SWAP;

        const currentValue = this.fightValue(this.vasen);
        const targetValue = this.fightValue(target);
        if (currentValue >= 1) return NO_SWAP; // already expected to win this duel
        if (targetValue < currentValue * GAME_CONFIG.AI_SWAP_VALUE_MARGIN) return NO_SWAP;

        const ratio = currentValue > 0 ? targetValue / currentValue : GAME_CONFIG.AI_SWAP_VALUE_MARGIN * 2;
        let score = GAME_CONFIG.AI_SWAP_BASE_SCORE + (ratio - 1) * GAME_CONFIG.AI_SWAP_IMPROVEMENT_WEIGHT;
        score = Math.min(score, GAME_CONFIG.AI_SWAP_MAX_SCORE);

        // Variance
        score += (Math.random() * GAME_CONFIG.AI_SWAP_VARIANCE) - (GAME_CONFIG.AI_SWAP_VARIANCE / 2);

        return score;
    }

    // Expected share of the opponent's remaining health this Väsen deals
    // before it is knocked out (best hit out x hits it can take).
    fightValue(vasen) {
        const damageOut = this.bestDamage(vasen, this.target);
        const damageIn = Math.max(1, this.bestDamage(this.target, vasen));
        const hitsSurvived = Math.ceil(vasen.currentHealth / damageIn);
        return (damageOut * hitsSurvived) / Math.max(1, this.target.currentHealth);
    }

    // Highest predicted damage among the attacker's currently usable attacks.
    bestDamage(attacker, defender) {
        let best = 0;
        attacker.getAvailableSkills().forEach(skillName => {
            const skill = ABILITIES[skillName];
            if (!skill || skill.type === ATTACK_TYPES.UTILITY) return;
            if (!attacker.canUseSkill(skillName)) return;
            best = Math.max(best, this.predictDamage(skillName, attacker, defender));
        });
        return best;
    }

    predictDamage(skillName, attacker = this.vasen, defender = this.target) {
        const skill = ABILITIES[skillName];
        if (skill.type === ATTACK_TYPES.UTILITY) return 0;

        // Simplified damage prediction
        const skillElement = getSkillElement(skillName, attacker.species.element);
        const matchup = getMatchupType(skillElement, defender.species.element);
        let elementMod = DAMAGE_MULTIPLIERS[matchup];

        // Account for empowerment boost
        if (attacker.combatFlags.isEmpowered) {
            elementMod *= (1 + GAME_CONFIG.TIER1_ATTACK_SKILL_EMPOWERMENT);
        }

        // Giantsbane: effective power is derived from target's current HP, not skill.power
        let power;
        if (skill.giantsbaneBonus) {
            power = skill.power + Math.floor(defender.currentHealth * skill.target_hp_bonus_percent);
        } else {
            power = skill.power;
        }

        const attackStat = skill.type === ATTACK_TYPES.WISDOM ?
            attacker.getAttribute('wisdom') : attacker.getAttribute('strength');
        const defenseStatName = skill.type === ATTACK_TYPES.WISDOM ? 'durability' : 'defense';
        const defenseStat = defender.getAttribute(defenseStatName);
        
        const powerFactor = power / GAME_CONFIG.POWER_CONSTANT;
        const defenseReduction = 1 - (defenseStat / (defenseStat + GAME_CONFIG.DEFENSE_CONSTANT));
        
        return Math.floor(powerFactor * attackStat * elementMod * defenseReduction);
    }
    
    scoreRuneSynergy(skillName) {
        let bonus = 0;
        const skill = ABILITIES[skillName];
        const skillElement = getSkillElement(skillName, this.vasen.species.element);
        
        // Element damage runes
        const elementRunes = {
            [ELEMENTS.FIRE]: 'KAUNAN',
            [ELEMENTS.EARTH]: 'PERTHO',
            [ELEMENTS.WIND]: 'TYR',
            [ELEMENTS.NATURE]: 'BJARKA',
            [ELEMENTS.WATER]: 'LAGUZ'
        };
        
        if (this.vasen.hasRune(elementRunes[skillElement])) {
            bonus += 10;
        }
        
        // Low cost runes
        if (skill.meginCost <= 30) {
            if (this.vasen.hasRune('ODAL')) bonus += 10;
            if (this.vasen.hasRune('JERA')) bonus += 5;
        }
        
        return bonus;
    }
    
    // Choose the best ally target for a buff skill.
    // Returns the VasenInstance to target (could be the caster itself).
    chooseBestAllyTarget(skillName) {
        const skill = ABILITIES[skillName];
        if (!skill || !skill.effect || skill.effect.target !== 'ally') return null;

        // Build the candidate pool: all alive members of the enemy team
        const candidates = this.combat.enemyTeam.filter(v => !v.isKnockedOut());
        if (candidates.length === 0) return null;
        if (candidates.length === 1) return candidates[0];

        const isAlv = this.vasen.species.family === FAMILIES.ALV;

        // Smithing buffs Strength (and also Wisdom for Alv via Elven Craftsmanship)
        // Skald's Mead buffs Wisdom (and also Strength for Alv via Elven Craftsmanship)
        // For Alv, both skills end up buffing both stats equally, so rank by STR+WIS combined.
        // For non-Alv: Smithing -> highest Strength, Skald's Mead -> highest Wisdom.
        let scoreFn;
        if (isAlv) {
            scoreFn = v => v.calculateAttribute('strength') + v.calculateAttribute('wisdom');
        } else if (skillName === 'Smithing') {
            scoreFn = v => v.calculateAttribute('strength');
        } else if (skillName === "Skald's Mead") {
            scoreFn = v => v.calculateAttribute('wisdom');
        } else {
            // Generic fallback: pick whoever has the highest value of the buffed stat
            const buffedStat = skill.effect.stat || (skill.effect.attributes && skill.effect.attributes[0]);
            if (buffedStat) {
                scoreFn = v => v.calculateAttribute(buffedStat);
            } else {
                // No recognisable stat - just return the caster
                return this.vasen;
            }
        }

        let best = candidates[0];
        let bestScore = scoreFn(candidates[0]);
        for (let i = 1; i < candidates.length; i++) {
            const s = scoreFn(candidates[i]);
            if (s > bestScore) {
                bestScore = s;
                best = candidates[i];
            }
        }
        return best;
    }

    isDesperate() {
        return this.vasen.currentHealth < this.vasen.maxHealth * GAME_CONFIG.AI_DESPERATION_HEALTH;
    }

    assessThreat() {
        // Estimate threat level from 0 to 1
        const healthRatio = this.vasen.currentHealth / this.vasen.maxHealth;
        const matchup = getMatchupType(this.target.species.element, this.vasen.species.element);
        
        let threat = 1 - healthRatio;
        if (matchup === 'POTENT') threat += GAME_CONFIG.AI_THREAT_ELEMENT_BONUS;
        
        return Math.min(1, threat);
    }
}
