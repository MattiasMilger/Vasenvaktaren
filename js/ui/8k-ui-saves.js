// =============================================================================
// 8k-ui-saves.js - Main Menu Save Cards, New Game / Ragnarök Mode Screen,
//                  Difficulty Badge, Fallen Väsen and Game Over
// =============================================================================

// Escape player-entered text (names) for HTML
function escapeHTML(text) {
    return escapeAttr(text == null ? '' : text);
}

function formatShortDate(timestamp) {
    return timestamp ? new Date(timestamp).toLocaleDateString() : '';
}

function playerFaceSVG(faceId, achievements) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PLAYER_FACES[getPlayerFaceId(faceId, achievements)].paths}</svg>`;
}

function getVasenRecordName(record) {
    const species = VASEN_SPECIES[record.speciesName];
    const temperament = TEMPERAMENTS[record.temperamentKey];
    return `${temperament ? temperament.name + ' ' : ''}${species ? species.name : record.speciesName}`;
}

function getRunesPlainText(runes) {
    return (runes || []).map(id => RUNES[id] ? `${RUNES[id].symbol} ${RUNES[id].name}` : '').filter(Boolean).join(' ');
}

// =============================================================================
// Ragnarök Mode: difficulty badge and rule list
// =============================================================================

// The save's rules, one line each with icon and description
UIController.prototype.getRuleListHTML = function(modes) {
    return `<div class="rule-list">${getActiveModeIds(modes).map(id => {
        const rule = GAME_MODES[id];
        return `<p class="rule-line">${uiIcon(rule.icon, 14)}<span><strong>${rule.name}</strong>: ${rule.description}</span></p>`;
    }).join('')}</div>`;
};

// Click popup on a difficulty badge: the tier and the rules behind it
function toggleRagnarokPopup(element, event) {
    toggleBodyPopup(element, event, () => {
        const modes = {};
        (element.dataset.rules || '').split(',').filter(Boolean).forEach(id => { modes[id] = true; });
        const tier = getRagnarokTier(modes);
        if (!tier) return '';
        return `<p><strong>Ragnarök Mode: ${tier.name}</strong><br><em>${tier.line}</em></p>${ui.getRuleListHTML(modes)}`;
    }, 280);
}

// Difficulty badge for a save's rules ('' for a normal save)
UIController.prototype.getRagnarokBadgeHTML = function(modes, options = {}) {
    const { clickable = true } = options;
    const tier = getRagnarokTier(modes);
    if (!tier) return '';
    const click = clickable
        ? ` onclick="toggleRagnarokPopup(this, event)" role="button" tabindex="0" data-rules="${getActiveModeIds(modes).join(',')}"`
        : '';
    return `<span class="ragnarok-badge tier-${tier.level}${clickable ? ' ragnarok-badge-clickable' : ''}"${click}>${uiIcon('ragnarok', 14)}${tier.name}</span>`;
};

// Header: the current save's difficulty, next to the Player Profile button
UIController.prototype.renderModeBadges = function() {
    const container = document.getElementById('save-mode-badges');
    if (!container) return;
    const html = this.getRagnarokBadgeHTML(gameState.modes);
    container.innerHTML = html;
    container.hidden = !html;
};

// Welcome dialogue: the rules this new save is bound by
UIController.prototype.getWelcomeModesHTML = function(modes) {
    const tier = getRagnarokTier(modes);
    if (!tier) return '';
    return `<div class="welcome-modes">
        <div class="welcome-modes-label">Ragnarök Mode</div>
        <div class="welcome-modes-tier">${this.getRagnarokBadgeHTML(modes, { clickable: false })}</div>
        ${this.getRuleListHTML(modes)}
    </div>`;
};

// =============================================================================
// Main menu
// =============================================================================

// Save cards plus New Game / Load from File. Everything about saves lives here.
// handlers: { onContinue(slot), onExport(slot), onSummary(slot), onDelete(slot), onNewGame(), onLoadFile(text) }
UIController.prototype.renderMainMenu = function(summaries, handlers) {
    const slotsEl = document.getElementById('save-slots');
    const hasSaves = summaries.some(Boolean);
    const activeSlot = SaveSlots.getActive();

    slotsEl.hidden = !hasSaves;
    slotsEl.innerHTML = hasSaves
        ? summaries.map((summary, slot) => this.getSaveCardHTML(summary, slot, slot === activeSlot)).join('')
        : '';

    slotsEl.querySelectorAll('[data-action]').forEach(btn => {
        const slot = parseInt(btn.dataset.slot, 10);
        const action = { continue: handlers.onContinue, export: handlers.onExport, summary: handlers.onSummary, delete: handlers.onDelete }[btn.dataset.action];
        btn.onclick = () => action(slot);
    });

    const newGameBtn = document.getElementById('new-game-btn');
    newGameBtn.className = `btn ${hasSaves ? 'btn-secondary' : 'btn-primary'}`;
    newGameBtn.onclick = () => handlers.onNewGame();

    const fileInput = document.getElementById('menu-load-file-input');
    document.getElementById('menu-load-file-btn').onclick = () => fileInput.click();
    fileInput.onchange = () => {
        const file = fileInput.files[0];
        fileInput.value = ''; // allow picking the same file again
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => handlers.onLoadFile(String(reader.result || ''));
        reader.onerror = () => this.showMessage('Could not read that file.', 'error');
        reader.readAsText(file);
    };
};

UIController.prototype.getSaveCardHTML = function(summary, slot, isLastPlayed) {
    const label = `<span class="save-slot-label">Slot ${slot + 1}</span>`;
    if (!summary) {
        return `<div class="save-slot-card empty">${label}<span class="save-slot-empty-text">Empty</span></div>`;
    }

    const ended = !!summary.ended;
    const stats = [
        `<span>${uiIcon('vasen', 13)}${summary.vasenCount} väsen</span>`,
        `<span>${uiIcon('swords', 13)}${summary.guardiansDefeated} / ${summary.totalGuardians} guardians</span>`
    ];
    if (summary.fallenCount > 0) {
        stats.push(`<span class="save-slot-fallen">${uiIcon('permadeath', 13)}${summary.fallenCount} fallen</span>`);
    }
    if (summary.towerFloor > 0) {
        stats.push(`<span>${uiIcon('trophy', 13)}Tower Floor ${summary.towerFloor}</span>`);
    }
    const achievements = summary.achievements
        .map(id => Object.values(ACHIEVEMENTS).find(a => a.id === id))
        .filter(Boolean)
        .map(a => a.name);
    const tier = getRagnarokTier(summary.modes);

    // An ended save has no main button: its Summary shows how it went
    const mainButton = ended
        ? ''
        : `<button type="button" class="btn btn-primary save-slot-main" data-action="continue" data-slot="${slot}">Continue</button>`;

    return `
        <div class="save-slot-card${ended ? ' ended' : ''}${tier ? ' ragnarok tier-' + tier.level : ''}">
            <div class="save-slot-top">
                ${label}
                ${ended ? `<span class="save-slot-tag ended-tag">${uiIcon('permadeath', 11)}Fallen</span>` : (isLastPlayed ? '<span class="save-slot-tag">Last played</span>' : '')}
                <span class="save-slot-modes">${this.getRagnarokBadgeHTML(summary.modes)}</span>
            </div>
            <div class="save-slot-identity">
                <span class="save-slot-face">${playerFaceSVG(summary.playerFace, summary.achievements)}</span>
                <span class="save-slot-who">
                    <span class="save-slot-name">${escapeHTML(summary.playerName)}</span>
                    <span class="save-slot-zone">${uiIcon('compass', 12)}${summary.zoneName}</span>
                </span>
            </div>
            ${ended ? `<p class="save-slot-cause">${summary.ended.cause}</p>` : ''}
            <div class="save-slot-stats">${stats.join('')}</div>
            ${achievements.length > 0 ? `<div class="save-slot-achievements">${uiIcon('trophy', 12)}${achievements.join(' · ')}</div>` : ''}
            <div class="save-slot-actions">
                ${mainButton}
                <div class="save-slot-tools">
                    ${ended ? '' : `<button type="button" class="save-slot-tool save-slot-export" data-action="export" data-slot="${slot}">${uiIcon('download', 13)}Save File</button>`}
                    <button type="button" class="save-slot-tool" data-action="summary" data-slot="${slot}">${uiIcon('summary', 13)}Summary</button>
                    <button type="button" class="save-slot-tool save-slot-delete" data-action="delete" data-slot="${slot}">${uiIcon('trash', 13)}Delete</button>
                </div>
            </div>
        </div>`;
};

// Choose which save to replace (all slots in use)
UIController.prototype.showSlotPicker = function(title, text, summaries, onPick) {
    const buttons = summaries.map((summary, slot) => summary ? {
        text: `<span class="slot-pick-label">Slot ${slot + 1}</span><span class="slot-pick-name">${escapeHTML(summary.playerName)} · ${summary.ended ? 'Fallen' : summary.zoneName}</span>${this.getRagnarokBadgeHTML(summary.modes, { clickable: false })}`,
        class: 'btn-secondary slot-pick-btn',
        callback: () => onPick(slot)
    } : null).filter(Boolean);
    buttons.push({ text: 'Cancel', class: 'btn-secondary', callback: null });
    this.showDialogue(title, `<p>${text}</p>`, buttons, true, null, 'trash');
};

// One-time message shown after the page reloads (e.g. after loading a save file)
UIController.prototype.setFlashMessage = function(text) {
    try { sessionStorage.setItem(FLASH_MESSAGE_KEY, text); } catch (e) { /* ignore */ }
};

UIController.prototype.showFlashMessage = function() {
    let text = null;
    try {
        text = sessionStorage.getItem(FLASH_MESSAGE_KEY);
        sessionStorage.removeItem(FLASH_MESSAGE_KEY);
    } catch (e) { /* ignore */ }
    if (text) this.showMessage(text);
};

// =============================================================================
// New Game screen - Ragnarök Mode (optional rules behind a button)
// =============================================================================

// replacing: summary of the save this new game will replace, or null.
// onBegin(modes) continues to the starter selection; onBack returns to the menu.
// initialModes: rules to show as already chosen (coming back from the starters).
UIController.prototype.renderNewJourney = function(replacing, onBegin, onBack, initialModes = null) {
    const screen = document.getElementById('new-journey-screen');

    // Same rune backdrop as the main menu, copied once
    if (!screen.querySelector('.futhark-ornament')) {
        const ornament = document.querySelector('#main-menu-screen .futhark-ornament');
        if (ornament) screen.prepend(ornament.cloneNode(true));
    }

    const modes = initialModes ? normalizeModes(initialModes) : createDefaultModes();
    const panel = document.getElementById('ragnarok-panel');
    const toggleBtn = document.getElementById('ragnarok-toggle-btn');
    const toggleLabel = document.getElementById('ragnarok-toggle-label');
    // Closed for a fresh New Game; open again when coming back with rules chosen
    panel.hidden = getActiveModeIds(modes).length === 0;
    toggleBtn.setAttribute('aria-expanded', String(!panel.hidden));
    toggleBtn.onclick = () => {
        panel.hidden = !panel.hidden;
        toggleBtn.setAttribute('aria-expanded', String(!panel.hidden));
    };
    document.querySelector('.ragnarok-hint').hidden = !panel.hidden;

    // One row per rule with the same toggle switch as Settings; all off
    const list = document.getElementById('journey-modes');
    list.innerHTML = GAME_MODE_LIST.map(id => {
        const rule = GAME_MODES[id];
        const requires = rule.requires ? `<span class="journey-mode-requires">Needs ${GAME_MODES[rule.requires].name}</span>` : ''; // no rule needs another at the moment
        return `
            <label class="journey-mode-row" for="journey-mode-${id}" data-mode="${id}">
                <span class="journey-mode-icon">${uiIcon(rule.icon, 18)}</span>
                <span class="journey-mode-text">
                    <span class="journey-mode-name">${rule.name}${requires}</span>
                    <span class="journey-mode-desc">${rule.description}</span>
                </span>
                <span class="toggle-switch">
                    <input type="checkbox" id="journey-mode-${id}" data-mode="${id}">
                    <span class="toggle-switch-slider"></span>
                </span>
            </label>`;
    }).join('');

    const update = () => {
        // A rule whose requirement is off can't be on
        GAME_MODE_LIST.forEach(id => {
            const requires = GAME_MODES[id].requires;
            const input = document.getElementById(`journey-mode-${id}`);
            const available = !requires || modes[requires];
            if (!available) modes[id] = false;
            input.checked = modes[id];
            input.disabled = !available;
            input.closest('.journey-mode-row').classList.toggle('selected', modes[id]);
            input.closest('.journey-mode-row').classList.toggle('unavailable', !available);
        });
        this.renderRagnarokMeter(modes);
        const tier = getRagnarokTier(modes);
        toggleLabel.textContent = tier ? `Ragnarök Mode: ${tier.name}` : 'Ragnarök Mode';
        toggleBtn.classList.toggle('active', !!tier);
        document.querySelector('.ragnarok-hint').hidden = !panel.hidden;
    };

    list.querySelectorAll('input[data-mode]').forEach(input => {
        input.onchange = () => {
            modes[input.dataset.mode] = input.checked;
            update();
        };
    });
    update();

    const replaceEl = document.getElementById('journey-replace-note');
    replaceEl.hidden = !replacing;
    replaceEl.innerHTML = replacing
        ? `This replaces <strong>Slot ${replacing.slot + 1}</strong> (${escapeHTML(replacing.playerName)}, ${replacing.ended ? 'fallen' : replacing.zoneName}).`
        : '';

    document.getElementById('journey-begin-btn').onclick = () => onBegin({ ...modes });
    document.getElementById('journey-back-btn').onclick = () => onBack();
};

// The difficulty meter: fills with the hidden points, names the tier, and
// burns when every rule is on
UIController.prototype.renderRagnarokMeter = function(modes) {
    const fraction = getRagnarokFill(modes);
    const tier = getRagnarokTier(modes);

    const fill = document.getElementById('ragnarok-meter-fill');
    fill.style.width = `${fraction * 100}%`;
    // The gradient spans the whole track, so the fill's colour shows how far it reached
    fill.style.backgroundSize = fraction > 0 ? `${100 / fraction}% 100%` : '100% 100%';

    document.getElementById('ragnarok-tier-name').textContent = tier ? tier.name : 'No rules';
    document.getElementById('ragnarok-tier-line').textContent = tier ? tier.line : 'Turn on rules to raise the difficulty.';

    const panel = document.getElementById('ragnarok-panel');
    panel.classList.remove(...RAGNAROK_TIERS.map(t => `tier-${t.level}`));
    if (tier) panel.classList.add(`tier-${tier.level}`);
    panel.classList.toggle('is-ragnarok', !!tier && tier.level === RAGNAROK_TIERS.length);
};

// =============================================================================
// Fallen väsen (Permadeath)
// =============================================================================

// Popup the moment a väsen dies; the combat log is easy to miss
UIController.prototype.showFallenToast = function(vasen) {
    this.showMessage(`${uiIcon('permadeath', 15)}<span><strong>${vasen.getDisplayName()}</strong> has fallen.</span>`, 'fallen');
};

UIController.prototype.getFallenListHTML = function(records) {
    return `<div class="fallen-list">${records.map(record => {
        const runes = getRunesPlainText(record.runes);
        const where = record.floor ? '' : (record.zoneName ? ` in ${record.zoneName}` : '');
        return `
            <div class="fallen-entry">
                <span class="fallen-icon">${uiIcon('permadeath', 16)}</span>
                <span class="fallen-text">
                    <span class="fallen-name">${getVasenRecordName(record)}<span class="fallen-level">Lvl ${this.getLevelText(record.level)}</span></span>
                    <span class="fallen-cause">${record.retreat ? 'Covered the retreat from' : 'Fell to'} ${record.killer}${where}${record.date ? ` · ${formatShortDate(record.date)}` : ''}</span>
                    ${runes ? `<span class="fallen-runes">${record.runesLost ? `${uiIcon('lostRunes', 11)}Runes lost: ` : ''}${runes}</span>` : ''}
                </span>
            </div>`;
    }).join('')}</div>`;
};

// Lost Runes: a väsen was knocked out and lost the runes it wore
UIController.prototype.showLostRunesToast = function(record) {
    this.showMessage(`${uiIcon('lostRunes', 15)}<span><strong>${record.name}</strong> lost its runes: ${getRunesPlainText(record.runes)}</span>`, 'fallen');
};

UIController.prototype.getLostRunesListHTML = function(records) {
    return `<div class="fallen-list">${records.map(record => `
        <div class="fallen-entry lost-runes-entry">
            <span class="fallen-icon">${uiIcon('lostRunes', 16)}</span>
            <span class="fallen-text">
                <span class="fallen-name">${record.name}</span>
                <span class="fallen-cause">Lost ${getRunesPlainText(record.runes)}${record.retreat ? ' covering the retreat' : ''}</span>
            </span>
        </div>`).join('')}</div>`;
};

// After a combat in which väsen died (Permadeath) or lost their runes (Lost
// Runes); `next` continues with the usual popups
UIController.prototype.showFallenDialogue = function(fallen, lostRunes, next) {
    let title, intro;
    if (fallen.length > 0) {
        const many = fallen.length > 1;
        title = many ? 'Fallen in Battle' : `${getVasenRecordName(fallen[0])} Has Fallen`;
        intro = `${many ? 'They' : 'It'} will not return.`;
    } else {
        title = 'Runes Lost';
        intro = 'The runes can be found again by exploring.';
    }
    this.showDialogue(
        title,
        `<p><em>${intro}</em></p>
         ${fallen.length > 0 ? this.getFallenListHTML(fallen) : ''}
         ${lostRunes.length > 0 ? this.getLostRunesListHTML(lostRunes) : ''}`,
        [{ text: 'Continue', callback: next || null }],
        false,
        null,
        fallen.length > 0 ? 'permadeath' : 'lostRunes'
    );
};

// =============================================================================
// Player Profile and Settings: the current save
// =============================================================================

UIController.prototype.renderProfileSaveSection = function() {
    const tier = getRagnarokTier(gameState.modes);
    const started = gameState.createdAt ? `<span class="profile-save-started">Started ${formatShortDate(gameState.createdAt)}</span>` : '';
    const rules = tier
        ? `<div class="profile-save-tier">${this.getRagnarokBadgeHTML(gameState.modes, { clickable: false })}<em>${tier.line}</em></div>${this.getRuleListHTML(gameState.modes)}`
        : '<p class="rule-line">A normal game, without Ragnarök Mode rules.</p>';

    return `
        <div class="profile-save-section">
            <h4>${uiIcon('download', 14)}Save:</h4>
            <div class="achievement profile-save-card">
                <div class="profile-save-row"><span class="profile-save-slot">Slot ${gameState.saveSlot + 1}</span>${started}</div>
                ${rules}
            </div>
        </div>`;
};

UIController.prototype.renderSettingsSaveInfo = function() {
    const el = document.getElementById('settings-save-info');
    if (!el) return;
    const badge = this.getRagnarokBadgeHTML(gameState.modes);
    el.innerHTML = `<span class="settings-save-slot">Slot ${gameState.saveSlot + 1}</span>${badge || '<span class="settings-save-normal">Normal</span>'}`;
};

// Another tab continued this save: this tab stops saving until reloaded
UIController.prototype.showStaleSaveDialogue = function() {
    this.showDialogue(
        'Continued Elsewhere',
        '<p>This save was continued in another tab or window. Reload to pick up its latest progress.</p>',
        [{ text: 'Reload', callback: () => location.reload() }],
        false,
        null,
        'lock'
    );
};

// =============================================================================
// Game Over and ended saves
// =============================================================================

// Stats, party and fallen of a save (Game Over, and View on an ended save)
UIController.prototype.getSaveRecordDetailsHTML = function(record) {
    const stat = (icon, label, value) => `
        <div class="collection-stat">
            <span class="collection-label">${uiIcon(icon, 14)}${label}</span>
            <span class="collection-value">${value}</span>
        </div>`;

    const achievements = (record.achievements || [])
        .map(id => Object.values(ACHIEVEMENTS).find(a => a.id === id))
        .filter(Boolean);

    const party = (record.party || []).map(member => `
        <div class="record-vasen">
            <span class="record-vasen-name">${getVasenRecordName(member)}</span>
            <span class="record-vasen-level">Lvl ${this.getLevelText(member.level)}</span>
            ${member.runes && member.runes.length ? `<span class="record-vasen-runes">${getRunesPlainText(member.runes)}</span>` : ''}
        </div>`).join('');

    const dates = [formatShortDate(record.startedAt), record.ended ? formatShortDate(record.ended.date) : ''].filter(Boolean).join(' – ');

    return `
        <div class="collection-attributes record-stats">
            ${getRagnarokTier(record.modes) ? `<div class="collection-stat"><span class="collection-label">${uiIcon('ragnarok', 14)}Ragnarök Mode</span>${this.getRagnarokBadgeHTML(record.modes)}</div>` : ''}
            ${dates ? stat('compass', 'Journey', dates) : ''}
            ${record.zoneName ? stat('compass', 'Last Zone', record.zoneName) : ''}
            ${stat('swords', 'Zones Cleared', `${record.guardiansDefeated} / ${record.totalGuardians}`)}
            ${stat('vasen', 'Väsen Types Tamed', `${record.speciesTamed} / ${Object.keys(VASEN_SPECIES).length}`)}
            ${record.towerFloor > 0 ? stat('trophy', 'Endless Tower', `Floor ${record.towerFloor}`) : ''}
        </div>
        ${achievements.length > 0 ? `<div class="record-section"><div class="record-section-title">${uiIcon('trophy', 13)}Achievements</div><p class="record-achievements">${achievements.map(a => a.name).join(' · ')}</p></div>` : ''}
        ${party ? `<div class="record-section"><div class="record-section-title">${uiIcon('vasen', 13)}${record.ended ? 'Final Party' : 'Party'}</div>${party}</div>` : ''}
        ${record.fallen && record.fallen.length > 0 ? `<div class="record-section"><div class="record-section-title">${uiIcon('permadeath', 13)}Fallen (${record.fallen.length})</div>${this.getFallenListHTML(record.fallen.slice().reverse())}</div>` : ''}`;
};

// Permadeath has left no väsen: the save is over (already saved as ended)
UIController.prototype.showGameOverDialogue = function(record, onMenu) {
    this.showDialogue(
        'Game Over',
        `<p class="game-over-cause">${record.ended ? record.ended.cause : ''}</p>
         <div class="game-over-details">${this.getSaveRecordDetailsHTML(record)}</div>
         <p class="game-over-note">The save stays in its slot. You can see its summary, download it, or delete it from the main menu.</p>`,
        [
            { text: `${uiIcon('home')}Main Menu`, class: 'btn-primary', callback: onMenu }
        ],
        false,
        'game-over-dialogue',
        'permadeath'
    );
};

// Summary on an ended save card
UIController.prototype.showEndedSaveDialogue = function(record, onDelete, onSummary) {
    this.showDialogue(
        `${record.playerName}'s Journey`,
        `<p class="game-over-cause">${record.ended ? record.ended.cause : ''}</p>
         <div class="game-over-details">${this.getSaveRecordDetailsHTML(record)}</div>`,
        [
            { text: `${uiIcon('summary')}Download Summary`, class: 'btn-secondary', callback: () => {
                onSummary();
                this.showEndedSaveDialogue(record, onDelete, onSummary); // keep the summary open
            } },
            { text: `${uiIcon('trash')}Delete Save`, class: 'btn-danger', callback: onDelete },
            { text: 'Close', class: 'btn-secondary', callback: null } // Close last, like other dialogues
        ],
        true,
        'game-over-dialogue',
        'permadeath'
    );
};

// Summary on a save card in progress: the save's summary shown first, with the
// option to download it as a text file. data: the raw save data.
UIController.prototype.showSaveSummaryDialogue = function(data, slot, onDownload) {
    const record = buildSaveRecord(data);
    const runesFound = new Set([...(data.foundRunes || []), ...(data.collectedRunes || [])]).size;
    const collection = (data.vasenCollection || []).slice().sort((a, b) => b.level - a.level);
    const collectionHTML = collection.map(v => `
        <div class="record-vasen">
            <span class="record-vasen-name">${getVasenRecordName(v)}</span>
            <span class="record-vasen-level">Lvl ${this.getLevelText(v.level)}</span>
        </div>`).join('');

    this.showDialogue(
        `${record.playerName}'s Journey`,
        `<div class="game-over-details">
            ${this.getSaveRecordDetailsHTML(record)}
            <div class="record-section collection-attributes record-stats">
                <div class="collection-stat"><span class="collection-label">${uiIcon('runes', 14)}Runes Found</span><span class="collection-value">${runesFound} / ${RUNE_LIST.length}</span></div>
                <div class="collection-stat"><span class="collection-label">${uiIcon('book', 14)}Lore Entries</span><span class="collection-value">${(data.unlockedLoreEntries || []).length} / ${LORE_TOTAL}</span></div>
            </div>
            ${collection.length ? `<div class="record-section"><div class="record-section-title">${uiIcon('vasen', 13)}Collection (${collection.length})</div><div class="record-collection">${collectionHTML}</div></div>` : ''}
         </div>`,
        [
            { text: `${uiIcon('download')}Download Summary`, class: 'btn-secondary', callback: () => {
                onDownload();
                this.showSaveSummaryDialogue(data, slot, onDownload); // keep the summary open
            } },
            { text: 'Close', class: 'btn-secondary', callback: null } // Close last, like other dialogues
        ],
        true,
        'game-over-dialogue',
        'summary'
    );
};

// =============================================================================
// Save summary - a readable text file of a save (main menu > Summary)
// =============================================================================

function buildSaveSummaryText(data, slot) {
    const record = buildSaveRecord(data);
    const lines = [];
    const rule = (title) => { lines.push(''); lines.push(title.toUpperCase()); lines.push('-'.repeat(title.length)); };
    const row = (label, value) => lines.push(`${(label + ':').padEnd(20)}${value}`);
    const vasenLine = v => {
        const species = VASEN_SPECIES[v.speciesName];
        const tags = species ? ` [${species.element}, ${species.rarity}, ${species.family}]` : '';
        const runes = getRunesPlainText((v.runes || []).filter(Boolean));
        return `  Lvl ${String(v.level).padStart(2)}  ${getVasenRecordName(v)}${tags}${runes ? '  Runes: ' + runes : ''}`;
    };

    lines.push('VÄSENVÄKTAREN - SAVE SUMMARY');
    lines.push('============================');
    row('Player', record.playerName);
    row('Slot', String(slot + 1));
    row('Summary made', new Date().toLocaleString());
    if (record.startedAt) row('Started', formatShortDate(record.startedAt));
    row('Status', record.ended ? `Over (${formatShortDate(record.ended.date)}). ${record.ended.cause}` : 'In progress');

    const tier = getRagnarokTier(record.modes);
    row('Ragnarök Mode', tier ? `${tier.name} - ${getActiveModeIds(record.modes).map(id => GAME_MODES[id].name).join(', ')}` : 'Off (normal game)');

    rule('Progress');
    row('Current zone', record.zoneName || '-');
    row('Zones cleared', `${record.guardiansDefeated} / ${record.totalGuardians}`);
    row('Väsen types tamed', `${record.speciesTamed} / ${Object.keys(VASEN_SPECIES).length}`);
    const runesFound = new Set([...(data.foundRunes || []), ...(data.collectedRunes || [])]).size;
    row('Runes found', `${runesFound} / ${RUNE_LIST.length}`);
    row('Lore entries', `${(data.unlockedLoreEntries || []).length} / ${LORE_TOTAL}`);
    const achievements = record.achievements.map(id => Object.values(ACHIEVEMENTS).find(a => a.id === id)).filter(Boolean).map(a => a.name);
    row('Achievements', achievements.length ? achievements.join(', ') : 'None yet');

    const tower = data.endlessTowerRecord || {};
    if (tower.highestFloor > 0) {
        row('Endless Tower', `Floor ${tower.highestFloor}${tower.timestamp ? ' (' + formatShortDate(tower.timestamp) + ')' : ''}`);
        (tower.team || []).forEach(member => lines.push(vasenLine({ ...member, runes: member.runes })));
    }

    rule('Party');
    if (record.party.length === 0) lines.push('  (empty)');
    record.party.forEach(v => lines.push(vasenLine(v)));

    const collection = (data.vasenCollection || []).slice().sort((a, b) => b.level - a.level);
    rule(`Collection (${collection.length} väsen)`);
    if (collection.length === 0) lines.push('  (none)');
    collection.forEach(v => lines.push(vasenLine(v)));

    if (record.fallen.length > 0) {
        rule(`Fallen (${record.fallen.length})`);
        record.fallen.forEach(f => {
            lines.push(`  Lvl ${String(f.level).padStart(2)}  ${getVasenRecordName(f)}`);
            lines.push(`        ${f.retreat ? 'Covered the retreat from' : 'Fell to'} ${f.killer}${f.zoneName ? ' in ' + f.zoneName : ''}${f.date ? ' (' + formatShortDate(f.date) + ')' : ''}`);
            const runes = getRunesPlainText(f.runes);
            if (runes) lines.push(`        ${f.runesLost ? 'Runes lost' : 'Runes'}: ${runes}`);
        });
    }

    lines.push('');
    return '\uFEFF' + lines.join('\r\n') + '\r\n'; // BOM + Windows line endings so Notepad shows it right
}

// Settings > Main Menu
document.addEventListener('DOMContentLoaded', () => {
    const settingsMenuBtn = document.getElementById('settings-main-menu-btn');
    if (settingsMenuBtn) settingsMenuBtn.addEventListener('click', () => game.returnToMainMenu());
});
