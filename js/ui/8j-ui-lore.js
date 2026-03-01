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

// Read the globally remembered lore language ('en' or 'sv')
UIController.prototype.getLoreLanguage = function() {
    return localStorage.getItem('lore-language') || 'en';
};

// Save the lore language preference and re-render while preserving UI state
UIController.prototype.setLoreLanguage = function(lang) {
    localStorage.setItem('lore-language', lang);
    this.renderLore();
};

// Render the full lore book contents into the modal
UIController.prototype.renderLore = function() {
    const container = document.getElementById('lore-content');
    if (!container) return;

    // Capture current UI state before re-render so language switch doesn't reset it
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
    const isSwedish = this.getLoreLanguage() === 'sv';

    // Language button always uses English so the action is self-evident
    const langBtnLabel = isSwedish ? 'Switch to English' : 'Switch to Swedish';

    // Header controls
    let html = `<div class="lore-header-controls">
        <div class="lore-header-top">
            <div class="lore-counter">${count} / ${total} entries collected</div>
            <div class="lore-header-buttons">
                <button class="btn btn-small lore-global-lang-btn">${langBtnLabel}</button>
                <button class="btn btn-small lore-collapse-btn">Collapse All</button>
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

    // Sort each category's entries alphabetically
    Object.keys(grouped).forEach(cat => {
        grouped[cat].sort((a, b) => a.name.localeCompare(b.name, 'sv'));
    });

    // Render categories in defined order
    const sortedCategories = Object.keys(LORE_CATEGORIES).sort(
        (a, b) => LORE_CATEGORIES[a].order - LORE_CATEGORIES[b].order
    );

    sortedCategories.forEach(cat => {
        if (!grouped[cat] || grouped[cat].length === 0) return;

        const catLabel = (isSwedish && LORE_CATEGORIES[cat].labelSv)
            ? LORE_CATEGORIES[cat].labelSv
            : LORE_CATEGORIES[cat].label;

        // data-cat used to restore collapsed state after re-render
        html += `<div class="lore-category" data-cat="${cat}">`;
        html += `<h4 class="lore-category-title"><span class="lore-cat-chevron"></span>${catLabel}</h4>`;
        html += `<div class="lore-entry-list">`;

        grouped[cat].forEach(entry => {
            const isUnlocked = unlocked.has(entry.key);
            if (isUnlocked) {
                html += this.renderLoreEntryCard(entry, isSwedish);
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

    // Global language toggle
    const langBtn = container.querySelector('.lore-global-lang-btn');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            this.setLoreLanguage(isSwedish ? 'en' : 'sv');
        });
    }

    // Collapse / Expand All — covers both category sections and individual entry descriptions
    const collapseBtn = container.querySelector('.lore-collapse-btn');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
            const cats  = container.querySelectorAll('.lore-category');
            const cards = container.querySelectorAll('.lore-entry-card.lore-entry-unlocked');
            const anyCatExpanded  = [...cats].some(c => !c.classList.contains('lore-category-collapsed'));
            const anyCardExpanded = [...cards].some(c => c.classList.contains('lore-entry-expanded'));
            const shouldCollapse  = anyCatExpanded || anyCardExpanded;
            cats.forEach(c  => c.classList.toggle('lore-category-collapsed', shouldCollapse));
            cards.forEach(c => c.classList.toggle('lore-entry-expanded', !shouldCollapse));
            collapseBtn.textContent = shouldCollapse ? 'Expand All' : 'Collapse All';
            if (this._loreSearchQuery) this._applyLoreSearch(container, this._loreSearchQuery);
        });
    }

    // Delegated click handler for category collapse and entry expand
    if (this._loreClickHandler) {
        container.removeEventListener('click', this._loreClickHandler);
    }
    this._loreClickHandler = (e) => {
        if (e.target.closest('.lore-global-lang-btn')) return;
        if (e.target.closest('.lore-collapse-btn')) return;
        // Category title — collapse/expand entire category
        const catTitle = e.target.closest('.lore-category-title');
        if (catTitle) {
            const category = catTitle.closest('.lore-category');
            if (category) {
                category.classList.toggle('lore-category-collapsed');
                if (this._loreSearchQuery) this._applyLoreSearch(container, this._loreSearchQuery);
            }
            return;
        }
        // Entry header — expand/collapse individual card
        const header = e.target.closest('.lore-entry-header');
        if (!header) return;
        const card = header.closest('.lore-entry-card');
        if (!card) return;
        card.classList.toggle('lore-entry-expanded');
        // Re-apply search highlights after revealing new text
        if (this._loreSearchQuery) this._applyLoreSearch(container, this._loreSearchQuery);
    };
    container.addEventListener('click', this._loreClickHandler);

    // Search — highlight visible text only, no filtering
    const searchInput = container.querySelector('.lore-search-input');
    if (searchInput) {
        // Restore any query kept from before re-render (e.g. language switch)
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
UIController.prototype.renderLoreEntryCard = function(entry, isSwedish) {
    const desc     = (isSwedish ? entry.swedishDesc : entry.englishDesc) || '';
    const name     = (isSwedish && entry.swedishName) ? entry.swedishName : entry.name;
    const source   = entry.source || '-';
    const heritage = entry.heritage || '-';

    // Extra meta: Family for väsen entries (via VASEN_SPECIES), Väsen name for item entries,
    // and direct family field for god entries and other entries that declare it explicitly.
    let extraMeta = '';
    if (entry.unlockType === 'vasen' && entry.unlockKey) {
        const species = VASEN_SPECIES[entry.unlockKey];
        if (species && species.family) {
            extraMeta += `<span class="lore-meta-sep">|</span><span class="lore-meta-label">Family:</span><span class="lore-meta-value">${species.family}</span>`;
        }
    } else if (entry.unlockType === 'item' && entry.unlockKey) {
        const vasenEntry = Object.values(VASEN_SPECIES).find(s => s.tamingItem === entry.unlockKey);
        if (vasenEntry) {
            extraMeta += `<span class="lore-meta-sep">|</span><span class="lore-meta-label">Väsen:</span><span class="lore-meta-value">${vasenEntry.name}</span>`;
        }
    }
    if (entry.family) {
        extraMeta += `<span class="lore-meta-sep">|</span><span class="lore-meta-label">Family:</span><span class="lore-meta-value">${entry.family}</span>`;
    }

    return `
        <div class="lore-entry-card lore-entry-unlocked" data-key="${entry.key}">
            <div class="lore-entry-header">
                <span class="lore-entry-chevron"></span>
                <span class="lore-entry-name">${name}</span>
            </div>
            <div class="lore-entry-body">
                <p class="lore-desc">${desc}</p>
            </div>
            <div class="lore-entry-meta">
                <span class="lore-meta-label">Source:</span>
                <span class="lore-meta-value">${source}</span>
                <span class="lore-meta-sep">|</span>
                <span class="lore-meta-label">Heritage:</span>
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
