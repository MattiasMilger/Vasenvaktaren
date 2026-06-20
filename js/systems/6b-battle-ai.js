// =============================================================================
// 6b-battle-ai.js - Enemy AI System
// =============================================================================

class EnemyAI {
    constructor(battle, isGuardian) {
        this.battle = battle;
        this.isGuardian = isGuardian;
        this.vasen = battle.enemyActive;
        this.target = battle.playerActive;
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
            const swapTargets = this.battle.enemyTeam.filter(v => 
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
            // Already used this battle - never choose it again
            if (this.battle.getEnemyUtilityUsageCount(this.vasen, "Tyr's Sacrifice") > 0) {
                return -999;
            }
            // Use it immediately on the first turn on the field (turnsOnField === 0)
            if (this.vasen.battleFlags.turnsOnField === 0) {
                return 200;
            }
            // Not turn 1 and not yet used - still penalise heavily so it's never chosen late
            return -999;
        }

        // Freya's Tears: use at most once per combat, and only in the first two turns on field
        if (skillName === "Freya's Tears") {
            if (this.battle.getEnemyUtilityUsageCount(this.vasen, "Freya's Tears") > 0) {
                return -999;
            }
            // Only worthwhile early; heavily penalise if used late
            if (this.vasen.battleFlags.turnsOnField > 1) {
                return -50;
            }
        }

        // Giantsbane: score based on target's current HP ratio, but only when the hit
        // is not WEAK — a weak Giantsbane deals reduced damage and loses most of its value.
        if (skill.giantsbaneBonus) {
            const skillElement = getSkillElement(skillName, this.vasen.species.element);
            const giantsbaneMatchup = getMatchupType(skillElement, this.target.species.element);
            if (giantsbaneMatchup !== 'WEAK') {
                const hpRatio = this.target.currentHealth / this.target.maxHealth;
                if (hpRatio >= 0.9) {
                    // Target nearly full HP — ideal window, strong bonus
                    score += 80;
                } else if (hpRatio >= 0.7) {
                    // Still worthwhile
                    score += 40;
                } else if (hpRatio >= 0.5) {
                    // Marginal — slight bonus
                    score += 10;
                } else {
                    // Target is low HP — Giantsbane is wasteful, heavy penalty
                    score -= 60;
                }
            } else {
                // Weak hit: Giantsbane loses its key advantage — penalise heavily
                score -= 60;
            }
        }
        
        // Base score
        if (skill.type === ATTACK_TYPES.UTILITY) {
            // Check usage count for utility skills
            const usageCount = this.battle.getEnemyUtilityUsageCount(this.vasen, skillName);
            
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
            
            // Empowerment strategy: 
            // If not empowered and skill grants empowerment, give bonus for setting up
            // If empowered and skill is high-power, give bonus for using empowerment
            if (!this.vasen.battleFlags.isEmpowered && skillGrantsEmpowerment(skillName)) {
                // Give bonus to low-tier attacks if we're not empowered (setup for next turn)
                score += GAME_CONFIG.AI_EMPOWERMENT_SETUP_BONUS;
            } else if (this.vasen.battleFlags.isEmpowered && !skillGrantsEmpowerment(skillName) && skill.power >= GAME_CONFIG.AI_HIGH_POWER_THRESHOLD) {
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

            // Rotvälta: estimate the probskill the enemy will attack this turn.
            // Turn 0 is commonly a setup round (buffs, utility), so the chance is lower.
            // From turn 1 onward attacks are far more likely, so the estimated bonus is higher.
            // The max bonus (25) is intentionally moderate — the AI cannot know for certain.
            if (skill.retaliationBonus) {
                const turnsOnField = this.vasen.battleFlags.turnsOnField;
                const estimatedAttackProb = turnsOnField === 0 ? 0.35 : 0.70;
                score += Math.round(estimatedAttackProb * 25);
            }
        } else {
            // Utility-specific scoring: attacks are the bread and butter; utilities are early set-ups.
            const usageCount = this.battle.getEnemyUtilityUsageCount(this.vasen, skillName);
            const turnsOnField = this.vasen.battleFlags.turnsOnField;

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
        
        // Megin penalty
        const meginCost = this.vasen.getSkillMeginCost(skillName);
        if (meginCost > this.vasen.currentMegin * GAME_CONFIG.AI_MEGIN_PENALTY_THRESHOLD) {
            score += GAME_CONFIG.AI_MEGIN_PENALTY;
        }
        
        // Risk penalty
        const threatLevel = this.assessThreat();
        if (threatLevel > GAME_CONFIG.AI_RISK_PENALTY_THRESHOLD) {
            score += GAME_CONFIG.AI_RISK_PENALTY;
        }
        
        // Variance
        const variance = this.isGuardian ? GAME_CONFIG.AI_GUARDIAN_VARIANCE : GAME_CONFIG.AI_WILD_VARIANCE;
        score += (Math.random() * variance * 2) - variance;
        
        return score;
    }
    
    scoreSwap(target) {
        let score = GAME_CONFIG.AI_SWAP_BASE_SCORE;
        
        // Low health bonus
        if (this.vasen.currentHealth < this.vasen.maxHealth * GAME_CONFIG.AI_SWAP_LOW_HEALTH_THRESHOLD) {
            score += GAME_CONFIG.AI_SWAP_LOW_HEALTH_BONUS;
        }
        
        // Type advantage
        const currentMatchup = getMatchupType(this.target.species.element, this.vasen.species.element);
        const newMatchup = getMatchupType(this.target.species.element, target.species.element);
        
        if (currentMatchup === 'POTENT' && newMatchup !== 'POTENT') {
            score += GAME_CONFIG.AI_SWAP_ELEMENT_ADVANTAGE_BONUS;
        }
        
        // Variance
        score += (Math.random() * GAME_CONFIG.AI_SWAP_VARIANCE) - (GAME_CONFIG.AI_SWAP_VARIANCE / 2);
        
        return score;
    }
    
    predictDamage(skillName) {
        const skill = ABILITIES[skillName];
        if (skill.type === ATTACK_TYPES.UTILITY) return 0;
        
        // Simplified damage prediction
        const skillElement = getSkillElement(skillName, this.vasen.species.element);
        const matchup = getMatchupType(skillElement, this.target.species.element);
        let elementMod = DAMAGE_MULTIPLIERS[matchup];
        
        // Account for empowerment boost
        if (this.vasen.battleFlags.isEmpowered) {
            elementMod *= (1 + GAME_CONFIG.TIER1_ATTACK_ABILITY_EMPOWERMENT);
        }
        
        // Giantsbane: effective power is derived from target's current HP, not skill.power
        let power;
        if (skill.giantsbaneBonus) {
            power = skill.power + Math.floor(this.target.currentHealth * skill.target_hp_bonus_percent);
        } else {
            power = skill.power;
        }

        const attackStat = skill.type === ATTACK_TYPES.WISDOM ? 
            this.vasen.getAttribute('wisdom') : this.vasen.getAttribute('strength');
        const defenseStatName = skill.type === ATTACK_TYPES.WISDOM ?
            getDefensiveStatName(this.target, 'durability') : getDefensiveStatName(this.target, 'defense');
        const defenseStat = this.target.getAttribute(defenseStatName);
        
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
        const candidates = this.battle.enemyTeam.filter(v => !v.isKnockedOut());
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
                // No recognisable stat — just return the caster
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

    assessThreat() {
        // Estimate threat level from 0 to 1
        const healthRatio = this.vasen.currentHealth / this.vasen.maxHealth;
        const matchup = getMatchupType(this.target.species.element, this.vasen.species.element);
        
        let threat = 1 - healthRatio;
        if (matchup === 'POTENT') threat += GAME_CONFIG.AI_THREAT_ELEMENT_BONUS;
        
        return Math.min(1, threat);
    }
}
