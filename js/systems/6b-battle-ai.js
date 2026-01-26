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
        return actions[0] || { type: 'ability', ability: 'Basic Strike' };
    }
    
    scoreAllActions() {
        const actions = [];
        
        // Score abilities
        const abilities = this.vasen.getAvailableAbilities();
        abilities.forEach(abilityName => {
            if (this.vasen.canUseAbility(abilityName)) {
                const score = this.scoreAbility(abilityName);
                actions.push({ type: 'ability', ability: abilityName, score });
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
    
    scoreAbility(abilityName) {
        const ability = ABILITIES[abilityName];
        let score = 0;
        
        // Base score
        if (ability.type === ATTACK_TYPES.UTILITY) {
            // Check usage count for utility abilities
            const usageCount = this.battle.getEnemyUtilityUsageCount(this.vasen, abilityName);
            
            if (usageCount === 0) {
                // First use - decent score
                score += GAME_CONFIG.AI_UTILITY_FIRST_USE_SCORE;
            } else if (usageCount === 1) {
                // Second use - reduced score
                score += GAME_CONFIG.AI_UTILITY_SECOND_USE_SCORE;
            } else {
                // Third+ use - very low score (make it almost never chosen)
                score += GAME_CONFIG.AI_UTILITY_THIRD_USE_PENALTY;
            }
        } else {
            score += GAME_CONFIG.AI_NON_UTILITY_BASE_SCORE;
        }
        
        // Damage bonus
        if (ability.type !== ATTACK_TYPES.UTILITY) {
            const predictedDamage = this.predictDamage(abilityName);
            
            if (predictedDamage >= this.target.currentHealth) {
                score += GAME_CONFIG.AI_KNOCKOUT_BONUS; // Knockout bonus
            } else if (predictedDamage >= this.target.maxHealth * GAME_CONFIG.AI_HIGH_DAMAGE_THRESHOLD) {
                score += GAME_CONFIG.AI_HIGH_DAMAGE_BONUS; // High damage bonus
            }
            
            // Empowerment strategy: 
            // If not empowered and ability grants empowerment, give bonus for setting up
            // If empowered and ability is high-power, give bonus for using empowerment
            if (!this.vasen.battleFlags.isEmpowered && abilityGrantsEmpowerment(abilityName)) {
                // Give bonus to low-tier attacks if we're not empowered (setup for next turn)
                score += GAME_CONFIG.AI_EMPOWERMENT_SETUP_BONUS;
            } else if (this.vasen.battleFlags.isEmpowered && !abilityGrantsEmpowerment(abilityName) && ability.power >= GAME_CONFIG.AI_HIGH_POWER_THRESHOLD) {
                // Give significant bonus to high-power attacks if we're empowered
                score += GAME_CONFIG.AI_EMPOWERED_HIGH_POWER_BONUS;
            }
            
            // Element bonus
            const abilityElement = getAbilityElement(abilityName, this.vasen.species.element);
            const matchup = getMatchupType(abilityElement, this.target.species.element);
            
            if (matchup === 'POTENT') {
                score += GAME_CONFIG.AI_ELEMENT_POTENT_BONUS;
            } else if (matchup === 'WEAK') {
                // Check for weak hit runes
                if (this.vasen.hasRune('NAUDIZ') || this.vasen.hasRune('INGUZ')) {
                    score += GAME_CONFIG.AI_ELEMENT_WEAK_WITH_RUNE_PENALTY;
                } else {
                    score += GAME_CONFIG.AI_ELEMENT_WEAK_WITHOUT_RUNE_PENALTY;
                }
            }
            
            // Rune synergy bonus
            if (this.isGuardian) {
                score += this.scoreRuneSynergy(abilityName);
            }
        } else {
            // Utility scoring - only apply bonuses if not overused
            const usageCount = this.battle.getEnemyUtilityUsageCount(this.vasen, abilityName);
            
            if (usageCount < 2) {
                if (ability.effect && ability.effect.type === 'buff') {
                    score += GAME_CONFIG.AI_BUFF_BONUS;
                } else if (ability.effect && ability.effect.type === 'debuff') {
                    score += GAME_CONFIG.AI_DEBUFF_BONUS;
                }
            }
        }
        
        // Megin penalty
        const meginCost = this.vasen.getAbilityMeginCost(abilityName);
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
    
    predictDamage(abilityName) {
        const ability = ABILITIES[abilityName];
        if (ability.type === ATTACK_TYPES.UTILITY) return 0;
        
        // Simplified damage prediction
        const abilityElement = getAbilityElement(abilityName, this.vasen.species.element);
        const matchup = getMatchupType(abilityElement, this.target.species.element);
        let elementMod = DAMAGE_MULTIPLIERS[matchup];
        
        // Account for empowerment boost
        if (this.vasen.battleFlags.isEmpowered) {
            elementMod *= (1 + GAME_CONFIG.EMPOWERMENT_DAMAGE_BOOST);
        }
        
        const power = ability.power;
        const attackStat = ability.type === ATTACK_TYPES.WISDOM ? 
            this.vasen.getAttribute('wisdom') : this.vasen.getAttribute('strength');
        const defenseStat = ability.type === ATTACK_TYPES.WISDOM ?
            this.target.getAttribute('durability') : this.target.getAttribute('defense');
        
        const powerFactor = power / GAME_CONFIG.POWER_CONSTANT;
        const defenseReduction = 1 - (defenseStat / (defenseStat + GAME_CONFIG.DEFENSE_CONSTANT));
        
        return Math.floor(powerFactor * attackStat * elementMod * defenseReduction);
    }
    
    scoreRuneSynergy(abilityName) {
        let bonus = 0;
        const ability = ABILITIES[abilityName];
        const abilityElement = getAbilityElement(abilityName, this.vasen.species.element);
        
        // Element damage runes
        const elementRunes = {
            [ELEMENTS.FIRE]: 'KAUNAN',
            [ELEMENTS.EARTH]: 'PERTHO',
            [ELEMENTS.WIND]: 'TYR',
            [ELEMENTS.NATURE]: 'BJARKA',
            [ELEMENTS.WATER]: 'LAGUZ'
        };
        
        if (this.vasen.hasRune(elementRunes[abilityElement])) {
            bonus += 10;
        }
        
        // Low cost runes
        if (ability.meginCost <= 30) {
            if (this.vasen.hasRune('ODAL')) bonus += 10;
            if (this.vasen.hasRune('JERA')) bonus += 5;
        }
        
        return bonus;
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
