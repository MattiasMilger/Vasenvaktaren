// =============================================================================
// 8j-ui-lore.js - Lore Book UI
// =============================================================================

// Show the lore modal and render its contents
UIController.prototype.showLore = function() {
    this.loreModal.classList.add('active');
    this.renderLore();
};

// Hide the lore modal and clear search state
UIController.prototype.hideLore = function() {
    this.loreModal.classList.remove('active');
    this._loreSearchQuery = '';
};

// Render the full lore book contents into the modal
UIController.prototype.renderLore = function() {
    const container = document.getElementById('lore-content');
    if (!container) return;

    // Capture current UI state before re-render
    const collapsedCats   = new Set();
    const expandedEntries = new Set();
    container.querySelectorAll('.lore-category[data-cat]').forEach(el => {
        if (el.classList.contains('lore-category-collapsed')) collapsedCats.add(el.dataset.cat);
    });
    container.querySelectorAll('.lore-entry-card.lore-entry-unlocked[data-key]').forEach(el => {
        if (el.classList.contains('lore-entry-expanded')) expandedEntries.add(el.dataset.key);
    });

    const unlocked  = gameState.unlockedLoreEntries;
    const total     = LORE_TOTAL;
    const count     = unlocked.size;

    if (!gameState.favoriteLoreCategories) gameState.favoriteLoreCategories = new Set();
    if (!gameState.favoriteLoreEntries) gameState.favoriteLoreEntries = new Set();

    // Header controls
    let html = `<div class="lore-header-controls">
        <div class="lore-header-top">
            <div class="lore-counter">${count} / ${total} entries collected</div>
            <div class="lore-header-buttons">
                <button class="btn btn-small lore-collapse-btn">Collapse Categories</button>
            </div>
        </div>
        <input class="lore-search-input" type="text" placeholder="Search…" autocomplete="off">
    </div>`;

    // Group entries by display category
    const grouped = {};
    LORE_ENTRY_KEYS.forEach(key => {
        const entry = LORE_ENTRIES[key];
        const displayCat = entry.unlockType === 'family' ? 'families' : entry.category;
        if (!grouped[displayCat]) grouped[displayCat] = [];
        grouped[displayCat].push(entry);
    });

    // Sort each category's entries alphabetically, then bring favorited
    // entries to the front (preserving the regular alphabetical order
    // within each of the two groups).
    Object.keys(grouped).forEach(cat => {
        grouped[cat].sort((a, b) => a.name.localeCompare(b.name, 'sv'));
        const favEntries  = grouped[cat].filter(e => gameState.favoriteLoreEntries.has(e.key));
        const restEntries = grouped[cat].filter(e => !gameState.favoriteLoreEntries.has(e.key));
        grouped[cat] = [...favEntries, ...restEntries];
    });

    // Render categories in defined order, with favorited categories brought
    // to the front (preserving the regular order otherwise).
    let sortedCategories = Object.keys(LORE_CATEGORIES).sort(
        (a, b) => LORE_CATEGORIES[a].order - LORE_CATEGORIES[b].order
    );
    const favCategories  = sortedCategories.filter(c => gameState.favoriteLoreCategories.has(c));
    const restCategories = sortedCategories.filter(c => !gameState.favoriteLoreCategories.has(c));
    sortedCategories = [...favCategories, ...restCategories];

    sortedCategories.forEach(cat => {
        if (!grouped[cat] || grouped[cat].length === 0) return;

        const catLabel = LORE_CATEGORIES[cat].label;
        const isCatFavorite = gameState.favoriteLoreCategories.has(cat);

        // Category-level Additional Info button - only for Skills, Items, and
        // Locations, since not every skill/item/zone necessarily has its own
        // lore entry to attach a per-entry info button to. Opens a full reference list.
        const showCatInfo = this.additionalInfoEnabled && (cat === 'skills' || cat === 'items' || cat === 'locations');
        const catInfoBtnHtml = showCatInfo
            ? `<button class="lore-info-btn" type="button" data-cat-info="${cat}">i</button>`
            : '';

        // data-cat used to restore collapsed state after re-render
        html += `<div class="lore-category" data-cat="${cat}">`;
        html += `<h4 class="lore-category-title"><span class="lore-cat-chevron"></span>${catLabel}<button class="lore-favorite-btn ${isCatFavorite ? 'active' : ''}" type="button" data-cat-favorite="${cat}">${isCatFavorite ? '★' : '☆'}</button>${catInfoBtnHtml}</h4>`;
        html += `<div class="lore-entry-list">`;

        grouped[cat].forEach(entry => {
            const isUnlocked = unlocked.has(entry.key);
            if (isUnlocked) {
                html += this.renderLoreEntryCard(entry);
            } else {
                html += `<div class="lore-entry-card lore-entry-locked">
                    <span class="lore-entry-name-locked">${entry.name}</span>
                </div>`;
            }
        });

        html += `</div></div>`;
    });

    container.innerHTML = html;

    // Restore UI state after re-render
    container.querySelectorAll('.lore-category[data-cat]').forEach(el => {
        if (collapsedCats.has(el.dataset.cat)) el.classList.add('lore-category-collapsed');
    });
    container.querySelectorAll('.lore-entry-card.lore-entry-unlocked[data-key]').forEach(el => {
        if (expandedEntries.has(el.dataset.key)) el.classList.add('lore-entry-expanded');
    });

    // Collapse / Expand Categories - only toggles category sections (Families, Väsen,
    // Items, Skills, Locations, Concepts), leaving individual entry cards untouched
    const collapseBtn = container.querySelector('.lore-collapse-btn');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
            const cats = container.querySelectorAll('.lore-category');
            const anyCatExpanded = [...cats].some(c => !c.classList.contains('lore-category-collapsed'));
            const shouldCollapse = anyCatExpanded;
            cats.forEach(c => c.classList.toggle('lore-category-collapsed', shouldCollapse));
            collapseBtn.textContent = shouldCollapse ? 'Expand Categories' : 'Collapse Categories';
            if (this._loreSearchQuery) this._applyLoreSearch(container, this._loreSearchQuery);
        });
    }

    // Delegated click handler for category collapse, entry expand, and
    // favorite star toggles (category and entry)
    if (this._loreClickHandler) {
        container.removeEventListener('click', this._loreClickHandler);
    }
    this._loreClickHandler = (e) => {
        if (e.target.closest('.lore-collapse-btn')) return;

        // Category favorite star
        const catFavoriteBtn = e.target.closest('.lore-favorite-btn[data-cat-favorite]');
        if (catFavoriteBtn) {
            const catKey = catFavoriteBtn.dataset.catFavorite;
            if (gameState.favoriteLoreCategories.has(catKey)) {
                gameState.favoriteLoreCategories.delete(catKey);
            } else {
                gameState.favoriteLoreCategories.add(catKey);
            }
            gameState.saveGame();
            this.renderLore();
            return;
        }

        // Entry favorite star
        const entryFavoriteBtn = e.target.closest('.lore-favorite-btn[data-entry-favorite]');
        if (entryFavoriteBtn) {
            const entryKey = entryFavoriteBtn.dataset.entryFavorite;
            if (gameState.favoriteLoreEntries.has(entryKey)) {
                gameState.favoriteLoreEntries.delete(entryKey);
            } else {
                gameState.favoriteLoreEntries.add(entryKey);
            }
            gameState.saveGame();
            this.renderLore();
            return;
        }

        // Category-level Additional Info button (Skills / Items / Locations)
        const catInfoBtn = e.target.closest('.lore-info-btn[data-cat-info]');
        if (catInfoBtn) {
            const catKey = catInfoBtn.dataset.catInfo;
            if (catKey === 'skills') {
                this.showSkillsInfoModal();
            } else if (catKey === 'items') {
                this.showItemsInfoModal();
            } else if (catKey === 'locations') {
                this.showLocationsInfoModal();
            }
            return;
        }

        // Entry-level Additional Info button (väsen / family / runes concept)
        const entryInfoBtn = e.target.closest('.lore-info-btn[data-entry-info]');
        if (entryInfoBtn) {
            const entryKey = entryInfoBtn.dataset.entryInfo;
            this.showLoreEntryInfoModal(entryKey);
            return;
        }

        // Category title - collapse/expand entire category
        const catTitle = e.target.closest('.lore-category-title');
        if (catTitle) {
            const category = catTitle.closest('.lore-category');
            if (category) {
                category.classList.toggle('lore-category-collapsed');
                if (this._loreSearchQuery) this._applyLoreSearch(container, this._loreSearchQuery);
            }
            return;
        }
        // Entry header - expand/collapse individual card
        const header = e.target.closest('.lore-entry-header');
        if (!header) return;
        const card = header.closest('.lore-entry-card');
        if (!card) return;
        card.classList.toggle('lore-entry-expanded');
        // Re-apply search highlights after revealing new text
        if (this._loreSearchQuery) this._applyLoreSearch(container, this._loreSearchQuery);
    };
    container.addEventListener('click', this._loreClickHandler);

    // Search - highlight visible text only, no filtering
    const searchInput = container.querySelector('.lore-search-input');
    if (searchInput) {
        // Restore any query kept from before re-render
        if (this._loreSearchQuery) {
            searchInput.value = this._loreSearchQuery;
            this._applyLoreSearch(container, this._loreSearchQuery);
        }
        searchInput.addEventListener('input', () => {
            this._loreSearchQuery = searchInput.value;
            this._applyLoreSearch(container, this._loreSearchQuery);
        });
    }
};

// Apply search highlights to visible text inside the lore container
UIController.prototype._applyLoreSearch = function(container, query) {
    // Remove existing highlights first
    container.querySelectorAll('mark.lore-highlight').forEach(mark => {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
    });

    const term = query.trim();
    if (!term) return;

    const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    // Collect visible text nodes (inside elements that are not display:none)
    const walk = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            // Skip nodes inside hidden elements
            let el = node.parentElement;
            while (el && el !== container) {
                if (getComputedStyle(el).display === 'none') return NodeFilter.FILTER_REJECT;
                el = el.parentElement;
            }
            // Skip nodes inside the search input itself
            if (node.parentElement.closest('.lore-search-input')) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
        }
    });

    const matches = [];
    let node;
    while ((node = walk.nextNode())) {
        if (re.test(node.nodeValue)) matches.push(node);
        re.lastIndex = 0;
    }

    matches.forEach(textNode => {
        const frag = document.createDocumentFragment();
        let last = 0;
        let m;
        re.lastIndex = 0;
        while ((m = re.exec(textNode.nodeValue)) !== null) {
            if (m.index > last) frag.appendChild(document.createTextNode(textNode.nodeValue.slice(last, m.index)));
            const mark = document.createElement('mark');
            mark.className = 'lore-highlight';
            mark.textContent = m[0];
            frag.appendChild(mark);
            last = m.index + m[0].length;
        }
        if (last < textNode.nodeValue.length) frag.appendChild(document.createTextNode(textNode.nodeValue.slice(last)));
        textNode.parentNode.replaceChild(frag, textNode);
    });
};

// Build the HTML for one unlocked lore entry card
UIController.prototype.renderLoreEntryCard = function(entry) {
    const desc      = entry.desc || '';
    const name      = entry.name;
    const source    = entry.source || '-';
    const heritage  = entry.heritage || '-';

    // Extra meta: Family for väsen entries (via VASEN_SPECIES), Väsen name for item entries,
    // and direct family field for god entries and other entries that declare it explicitly.
    const labelSource   = 'Source:';
    const labelHeritage = 'Heritage:';
    const labelFamily   = 'Family:';
    const labelVasen    = 'Väsen:';

    let extraMeta = '';
    if (entry.unlockType === 'vasen' && entry.unlockKey && !entry.family) {
        const species = VASEN_SPECIES[entry.unlockKey];
        if (species && species.family) {
            extraMeta += `<span class="lore-meta-sep">|</span><span class="lore-meta-label">${labelFamily}</span><span class="lore-meta-value">${species.family}</span>`;
        }
    } else if (entry.unlockType === 'item' && entry.unlockKey) {
        const vasenEntry = Object.values(VASEN_SPECIES).find(s => s.tamingItem === entry.unlockKey);
        if (vasenEntry) {
            extraMeta += `<span class="lore-meta-sep">|</span><span class="lore-meta-label">${labelVasen}</span><span class="lore-meta-value">${vasenEntry.name}</span>`;
        }
    }
    if (entry.family) {
        extraMeta += `<span class="lore-meta-sep">|</span><span class="lore-meta-label">${labelFamily}</span><span class="lore-meta-value">${entry.family}</span>`;
    }

    if (!gameState.favoriteLoreEntries) gameState.favoriteLoreEntries = new Set();
    const isFavorite = gameState.favoriteLoreEntries.has(entry.key);

    // Additional Info button - only for väsen entries, family entries, the
    // Runes concept entry (which opens the full runes and bind runes list
    // instead of per-rune entries, since individual runes have no lore
    // entries of their own), Idunn's Apples, and Sacred Wells.
    const hasInfo = entry.unlockType === 'vasen' || entry.unlockType === 'family' ||
        entry.key === 'concept_futhark' || entry.key === 'concept_idunn_apples' || entry.key === 'location_sacred_well';
    const infoBtnHtml = (this.additionalInfoEnabled && hasInfo)
        ? `<button class="lore-info-btn" type="button" data-entry-info="${entry.key}">i</button>`
        : '';

    return `
        <div class="lore-entry-card lore-entry-unlocked" data-key="${entry.key}">
            <div class="lore-entry-header">
                <span class="lore-entry-chevron"></span>
                <span class="lore-entry-name">${name}</span>
                <button class="lore-favorite-btn ${isFavorite ? 'active' : ''}" type="button" data-entry-favorite="${entry.key}">${isFavorite ? '★' : '☆'}</button>
                ${infoBtnHtml}
            </div>
            <div class="lore-entry-body">
                <p class="lore-desc">${desc}</p>
            </div>
            <div class="lore-entry-meta">
                <span class="lore-meta-label">${labelSource}</span>
                <span class="lore-meta-value">${source}</span>
                <span class="lore-meta-sep">|</span>
                <span class="lore-meta-label">${labelHeritage}</span>
                <span class="lore-meta-value">${heritage}</span>${extraMeta}
            </div>
        </div>
    `;
};

// Show a toast notification when a new lore entry is unlocked
UIController.prototype.showLoreUnlockMessage = function(entryKey) {
    const entry = LORE_ENTRIES[entryKey];
    if (!entry) return;
    this.showMessage(`Lore Entry unlocked: ${entry.name}`, 'success');
};

// =============================================================================
// ADDITIONAL INFO - Lore Book technical info popups (Väsen, Families, Runes,
// Skills, Items). Only reachable via the "i" buttons rendered above when the
// Additional Info setting is enabled.
// =============================================================================

// Generic show/hide for the Lore Info modal. Mirrors showLore()/hideLore()
// (no overlay backdrop) so opening it doesn't darken the background, matching
// the Lore Book modal it's nested inside.
UIController.prototype.showLoreInfoModal = function(title, bodyHtml) {
    const modal = document.getElementById('lore-info-modal');
    if (!modal) return;
    document.getElementById('lore-info-title').textContent = title;
    document.getElementById('lore-info-content').innerHTML = bodyHtml;
    modal.classList.add('active');
};

UIController.prototype.hideLoreInfoModal = function() {
    const modal = document.getElementById('lore-info-modal');
    if (!modal) return;
    modal.classList.remove('active');
};

// Dispatch an entry-level Additional Info click to the correct info modal,
// based on the lore entry's unlockType (or its key, for the Runes concept entry).
UIController.prototype.showLoreEntryInfoModal = function(entryKey) {
    const entry = LORE_ENTRIES[entryKey];
    if (!entry) return;

    if (entry.key === 'concept_futhark') {
        this.showRunesInfoModal();
        return;
    }

    if (entry.key === 'concept_idunn_apples') {
        this.showIdunnApplesInfoModal();
        return;
    }

    if (entry.key === 'location_sacred_well') {
        this.showSacredWellInfoModal();
        return;
    }

    if (entry.unlockType === 'vasen' && entry.unlockKey) {
        this.showVasenInfoModal(entry.unlockKey);
        return;
    }

    if (entry.unlockType === 'family' && entry.unlockKey) {
        this.showFamilyInfoModal(entry.unlockKey);
        return;
    }
};

// Calculate a species' attribute at a given level, excluding temperament -
// mirrors VasenInstance.calculateAttribute() minus the temperament block,
// since these technical values are shown without any specific temperament applied.
function calculateSpeciesBaseAttribute(species, attrName, level) {
    const baseAttrs = BASE_ATTRIBUTES[species.family];
    let base = baseAttrs[attrName] || 0;

    const elementBonus = ELEMENT_BONUSES[species.element];
    if (elementBonus && elementBonus[attrName]) {
        base += elementBonus[attrName];
    }

    const rarityMult = RARITY_MULTIPLIERS[species.rarity];
    base = base * rarityMult;

    const levelScaling = 1 + GAME_CONFIG.ATTRIBUTE_LEVEL_SCALING_RATE * (level - 1);
    base = base * levelScaling;

    return Math.floor(base);
}

// Calculate base max Megin at a given level, excluding temperament and runes -
// mirrors VasenInstance.calculateMaxMegin() minus its temperament and Uruz
// blocks. Megin scales purely with level (not family/rarity/element), so
// this is the same for every species at a given level.
function calculateBaseMeginAtLevel(level) {
    let megin = GAME_CONFIG.BASE_MEGIN + ((level - 1) * GAME_CONFIG.MEGIN_PER_LEVEL);
    megin = Math.min(megin, GAME_CONFIG.MAX_MEGIN_CAP);
    return megin;
}

// Väsen technical info: base/maxed attributes (no temperament), family,
// element, taming item, description, skills, image, rarity, and every zone
// this species can spawn in (including Ginnungagap).
UIController.prototype.showVasenInfoModal = function(speciesName) {
    const species = VASEN_SPECIES[speciesName];
    if (!species) return;

    const attrOrder  = ['strength', 'wisdom', 'defense', 'durability', 'health', 'megin'];
    const attrLabels = { strength: 'Strength', wisdom: 'Wisdom', defense: 'Defense', durability: 'Durability', health: 'Health', megin: 'Megin' };

    const buildAttrGridHtml = (level) => attrOrder.map(attr => {
        const value = attr === 'megin'
            ? calculateBaseMeginAtLevel(level)
            : calculateSpeciesBaseAttribute(species, attr, level);
        return `
            <div class="attribute-item">
                <span class="attr-name">${attrLabels[attr]}</span>
                <span class="attr-value">${value}</span>
            </div>
        `;
    }).join('');

    // Every zone whose spawn list includes this species (zones with
    // spawns === 'ALL', i.e. Ginnungagap, always match).
    const zoneNames = ZONE_ORDER
        .filter(zoneId => {
            const zone = ZONES[zoneId];
            return zone && (zone.spawns === 'ALL' || zone.spawns.includes(speciesName));
        })
        .map(zoneId => ZONES[zoneId].name);

    // Temporary max-level instance used only to reuse the existing skills-list
    // renderer. Its temperament has no bearing on anything shown here (the
    // skills list only displays element, type, megin cost, power, and
    // initial bonus - none of which are temperament-affected).
    const tempVasen = new VasenInstance(speciesName, GAME_CONFIG.MAX_LEVEL, null, [], false);
    const skillsHtml = this.renderSkillsList(tempVasen);

    const bodyHtml = `
        <div class="lore-info-vasen">
            <div class="lore-info-header">
                <div class="lore-info-image-container holo-${species.rarity.toLowerCase()}">
                    <img src="${species.image}" alt="${species.name}" class="lore-info-image">
                </div>
                <div class="lore-info-badges">
                    <div class="element-matchup-collapsible">
                        <span class="element-badge element-${species.element.toLowerCase()} clickable-element" onclick="toggleElementMatchup(this, event); ui.scrollGuidePopupIntoView(this)">${species.element}</span>
                        ${this.generateDefensiveMatchupsHTML(species.element)}
                    </div>
                    <div class="rarity-matchup-collapsible family-matchup-collapsible">
                        <span class="rarity-badge rarity-${species.rarity.toLowerCase()} clickable-rarity" onclick="toggleRarityDescription(this, event); ui.scrollGuidePopupIntoView(this)">${species.rarity}</span>
                        <div class="rarity-description-popup">
                            <p><strong>${species.rarity}</strong><br>
                            ${RARITY_DESCRIPTIONS[species.rarity] || ''}</p>
                        </div>
                    </div>
                    <div class="family-matchup-collapsible">
                        <span class="family-badge clickable-family" onclick="toggleFamilyDescription(this, event); ui.scrollGuidePopupIntoView(this)">${species.family}</span>
                        <div class="family-description-popup">
                            <p><strong>${species.family}</strong><br>
                            ${FAMILY_DESCRIPTIONS[species.family] || 'No description available.'}</p>

                            ${FAMILY_PASSIVES[species.family] ? `
                                <hr style="margin: 8px 0; border: none; border-top: 1px solid var(--border-color);">
                                <p><strong>Trait: ${FAMILY_PASSIVES[species.family].name}</strong><br>
                                ${FAMILY_PASSIVES[species.family].description}</p>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
            <p class="lore-info-description">${species.description}</p>
            <div class="lore-info-row"><span class="lore-info-label">Taming Item:</span> <span class="lore-info-value">${species.tamingItem}</span></div>
            <div class="lore-info-row"><span class="lore-info-label">Zones:</span> <span class="lore-info-value">${zoneNames.join(', ')}</span></div>
            <h4 class="lore-info-subheading">Base Attributes (Level 1)</h4>
            <div class="attribute-grid">${buildAttrGridHtml(1)}</div>
            <h4 class="lore-info-subheading">Maxed Attributes (Level ${GAME_CONFIG.MAX_LEVEL})</h4>
            <div class="attribute-grid">${buildAttrGridHtml(GAME_CONFIG.MAX_LEVEL)}</div>
            <h4 class="lore-info-subheading">Skills</h4>
            <div class="skills-list">${skillsHtml}</div>
        </div>
    `;

    this.showLoreInfoModal(species.name, bodyHtml);
};

// Family technical info: the same description and trait text shown by the
// standard family badge popup elsewhere in the game, plus a plain-text list
// of every väsen that belongs to this family.
UIController.prototype.showFamilyInfoModal = function(familyName) {
    const description = FAMILY_DESCRIPTIONS[familyName] || 'No description available.';
    const passive = FAMILY_PASSIVES[familyName];

    let bodyHtml = `<p><strong>${familyName}</strong><br>${description}</p>`;
    if (passive) {
        bodyHtml += `<hr class="lore-info-divider"><p><strong>Trait: ${passive.name}</strong><br>${passive.description}</p>`;
    }

    const familyMembers = VASEN_LIST
        .filter(name => VASEN_SPECIES[name].family === familyName)
        .map(name => VASEN_SPECIES[name].name);

    bodyHtml += `<hr class="lore-info-divider"><p><strong>Väsen</strong><br>${familyMembers.join(', ')}</p>`;

    this.showLoreInfoModal(familyName, bodyHtml);
};

// Idunn's Apples technical info: the exact heal/cleanse/renewal mechanics
// applied every milestone floor of the Endless Tower.
UIController.prototype.showIdunnApplesInfoModal = function() {
    const interval = GAME_CONFIG.ENDLESS_TOWER_IDUNN_FLOOR_INTERVAL;
    const healPercent = Math.round(GAME_CONFIG.ENDLESS_TOWER_IDUNN_HEAL_PERCENT * 100);
    const cleanseStages = GAME_CONFIG.ENDLESS_TOWER_IDUNN_CLEANSE_STAGES;
    const stageWord = cleanseStages === 1 ? 'stage' : 'stages';

    const bodyHtml = `
        <p>Every <strong>${interval}</strong> floors in the Endless Tower, Idunn's Apples replenish your team:</p>
        <ul class="lore-info-list">
            <li>Heals each alive väsen by <strong>${healPercent}%</strong> of its max health.</li>
            <li>Cleanses up to <strong>${cleanseStages}</strong> negative attribute ${stageWord} per attribute.</li>
            <li>Renews all once-per-combat passives and rune effects.</li>
        </ul>
    `;

    this.showLoreInfoModal("Idunn's Apples", bodyHtml);
};

// Sacred Well technical info: the healing effect applied when one is found while exploring.
UIController.prototype.showSacredWellInfoModal = function() {
    const healPercent = Math.round(GAME_CONFIG.SACRED_WELL_HEAL_PERCENT * 100);

    const bodyHtml = `
        <p>Encountered while exploring a zone.</p>
        <ul class="lore-info-list">
            <li>Every väsen in your entire collection (not just your active party) is healed by <strong>${healPercent}%</strong> of its max health.</li>
        </ul>
    `;

    this.showLoreInfoModal('Sacred Wells', bodyHtml);
};

// Locations technical info: every zone, its väsen spawns, and its guardian
// (or lack thereof), since not every zone necessarily has its own lore entry
// to attach a per-entry info button to.
UIController.prototype.showLocationsInfoModal = function() {
    const rowsHtml = ZONE_ORDER.map(zoneId => {
        const zone = ZONES[zoneId];
        if (!zone) return '';

        const spawnsList = zone.spawns === 'ALL'
            ? 'All Väsen'
            : zone.spawns.map(name => VASEN_SPECIES[name] ? VASEN_SPECIES[name].name : name).join(', ');

        let guardianValue;
        if (zone.guardian) {
            const teamList = zone.guardian.team.map(member => {
                const memberSpecies = VASEN_SPECIES[member.species];
                const memberName = memberSpecies ? memberSpecies.name : member.species;
                return `${memberName} (Lvl ${member.level})`;
            }).join(', ');
            guardianValue = `${zone.guardian.name} - ${teamList}`;
        } else if (zoneId === 'ZONE7') {
            guardianValue = 'None - hosts the Endless Tower';
        } else {
            guardianValue = 'None';
        }

        return `
            <div class="lore-info-item-row">
                <div class="lore-info-item-header"><span class="lore-info-item-name">${zone.name}</span></div>
                <p class="lore-info-item-desc">${zone.description}</p>
                <div class="lore-info-row"><span class="lore-info-label">Level Range:</span> <span class="lore-info-value">${zone.levelRange[0]} - ${zone.levelRange[1]}</span></div>
                <div class="lore-info-row"><span class="lore-info-label">Väsen:</span> <span class="lore-info-value">${spawnsList}</span></div>
                <div class="lore-info-row"><span class="lore-info-label">Guardian:</span> <span class="lore-info-value">${guardianValue}</span></div>
            </div>
        `;
    }).join('');

    const bodyHtml = `<h4 class="lore-info-subheading">Zones</h4><div class="lore-info-items-list">${rowsHtml}</div>`;
    this.showLoreInfoModal('Locations', bodyHtml);
};

// Runes technical info: every regular rune (symbol, name, effect) plus every
// bind rune pair that exists and its effect.
UIController.prototype.showRunesInfoModal = function() {
    const runesHtml = RUNE_LIST.map(runeId => {
        const rune = RUNES[runeId];
        return `
            <div class="lore-info-bindrune-item">
                <div class="lore-info-bindrune-header">${rune.symbol} ${rune.name}</div>
                <div class="lore-info-bindrune-desc">${rune.effect}</div>
            </div>
        `;
    }).join('');

    const bindRunesHtml = BIND_RUNES.map(br => `
        <div class="lore-info-bindrune-item">
            <div class="lore-info-bindrune-header">${br.symbols} ${br.names}</div>
            <div class="lore-info-bindrune-desc">${br.effectText}</div>
        </div>
    `).join('');

    const bodyHtml = `
        <h4 class="lore-info-subheading">Runes</h4>
        <div class="lore-info-bindrune-list">${runesHtml}</div>
        <h4 class="lore-info-subheading">Bind Runes</h4>
        <div class="lore-info-bindrune-list">${bindRunesHtml}</div>
    `;
    this.showLoreInfoModal('Runes', bodyHtml);
};

// Skills technical info: every skill in the game and its standard info,
// since not every skill has its own lore entry to attach a per-entry button to.
UIController.prototype.showSkillsInfoModal = function() {
    const skillNames = Object.keys(ABILITIES);

    const itemsHtml = skillNames.map(skillName => {
        const skill = ABILITIES[skillName];
        const elementClass = skill.element ? skill.element.toLowerCase() : '';
        const elementLabel = skill.element ? skill.element : 'Own Element';

        return `
            <div class="skill-item ${elementClass ? 'element-' + elementClass : ''}">
                <div class="skill-header">
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-type-tag">${skill.type}</span>
                </div>
                <div class="skill-attributes">
                    <span class="skill-element ${elementClass ? 'element-' + elementClass : ''}">${elementLabel}</span>
                    <span class="skill-cost">Megin: ${skill.meginCost}</span>
                    ${skill.healthCost ? `<span class="skill-health-cost">Health: ${Math.round(skill.healthCost * 100)}%</span>` : ''}
                    ${skill.power ? `<span class="skill-power">Power: ${skill.power}</span>` : ''}
                    ${skill.initialBonus ? `<span class="skill-initial-bonus">Initial Bonus: ${skill.initialBonus}</span>` : ''}
                </div>
                <p class="skill-description">${skill.flavorDescription}<br>${skill.mechanicsDescription}</p>
            </div>
        `;
    }).join('');

    const bodyHtml = `<div class="lore-info-skills-list">${itemsHtml}</div>`;
    this.showLoreInfoModal('Skills', bodyHtml);
};

// Items technical info: every taming item, its associated väsen, and every
// zone that väsen can spawn in, since not every item necessarily has its
// own lore entry to attach a per-entry button to.
UIController.prototype.showItemsInfoModal = function() {
    const itemIds = Object.keys(TAMING_ITEMS);

    const rowsHtml = itemIds.map(itemId => {
        const item = TAMING_ITEMS[itemId];
        const species = VASEN_SPECIES[item.tamingTarget];
        const speciesName = species ? species.name : item.tamingTarget;

        let zoneNames = [];
        if (species) {
            zoneNames = ZONE_ORDER
                .filter(zoneId => {
                    const zone = ZONES[zoneId];
                    return zone && (zone.spawns === 'ALL' || zone.spawns.includes(item.tamingTarget));
                })
                .map(zoneId => ZONES[zoneId].name);
        }

        return `
            <div class="lore-info-item-row">
                <div class="lore-info-item-header">
                    <span class="lore-info-item-name">${item.name}</span>
                </div>
                <p class="lore-info-item-desc">${item.description}</p>
                <div class="lore-info-item-meta">
                    <span class="lore-meta-label">Väsen:</span> <span class="lore-meta-value">${speciesName}</span>
                    <span class="lore-meta-sep">|</span>
                    <span class="lore-meta-label">Zones:</span> <span class="lore-meta-value">${zoneNames.join(', ')}</span>
                </div>
            </div>
        `;
    }).join('');

    const bodyHtml = `<div class="lore-info-items-list">${rowsHtml}</div>`;
    this.showLoreInfoModal('Items', bodyHtml);
};
