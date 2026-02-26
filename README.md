# Väsenväktaren

**Catch creatures of Swedish folklore**

A turn-based creature collection game inspired by Swedish mythology and folklore. Explore mystical zones, tame mythical Väsen, and battle your way through the guardians of each realm.

**If you enjoyed Väsenväktaren, please consider starring the repository!**

## Try It Out

The live version is available at: https://mattiasmilger.github.io/Vasenvaktaren/

## Run Locally

Open `index.html` in a modern browser. No build tools or dependencies required.

## Game Features

### Väsen
- 30 unique creatures based on Swedish folklore
- 10 families: Vätte, Vålnad, Odjur, Troll, Rå, Alv, Ande, Jätte, Drake
- 5 elements: Earth, Nature, Water, Fire, Wind
- 4 rarities: Common, Uncommon, Rare, Mythical
- 12 temperaments affecting stats

### Runes
- 24 equippable runes with unique effects
- One rune slot (two at level 30)
- Strategic combinations for different builds

### Exploration

- Select a zone from the zone list
- Click "Explore" to search the zone
- Click "Challenge Guardian" to face the zone boss

### Combat System
- Turn-based battles with move priority
- Element matchups
- Resource management
- Attribute buffs and debuffs
- 24 unique abilities plus Basic Strike
- **Abilities**: Use learned attacks (cost Megin)
- **Basic Strike**: Free attack using your element
- **Swap**: Change active Väsen (causes Swap Sickness)
- **Offer Item**: Offer taming items to wild Väsen
- **Ask About Item**: Learn what item the Väsen wants
- **Pass**: Skip your turn
- **Surrender**: Exit combat (reduces party to 5% health)

### Party Management
- Click Väsen in inventory to view details
- Click party slots to assign/remove Väsen
- Maximum 3 Väsen in party
- Only one Mythical Väsen allowed per party

### Items & Runes
- Use the tabs in the left panel to switch between Väsen, Runes, and Items
- Click items to heal your Väsen outside combat
- Click runes to equip them to party members

## Elements

Earth,
Nature,
Water,
Fire,
Wind

## Achievements

Collection based achievements

## Save System

- Game automatically saves to localStorage
- A one-step backup of the previous save is kept under `vasenvaktaren_save_backup` and is overwritten on each save — useful for recovering from accidental resets
- Save format is versioned; older saves are migrated forward automatically via `migrateData()` in `7-game-state.js`
- Export your save from Settings to back up progress
- Import saves to restore progress
- Reset game to start fresh

## Technical Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- No server required - runs as static files

## Project Structure

```
Vasenvaktaren/
├── index.html                      (markup, screen templates, modal definitions)
├── README.md                       (project information)
│
├── styles/
│   ├── main.css                    (import file — loads all stylesheets in order)
│   ├── 01-variables.css            (CSS custom properties: colours, spacing, typography)
│   ├── 02-reset.css                (reset, base html/body height chain, safe-area insets)
│   ├── 03-utilities.css            (utility classes, toast messages)
│   ├── 04-layout.css               (screen definitions, game-screen, header, starter screen)
│   ├── 05-buttons.css              (button variants)
│   ├── 06-panels.css               (three-panel layout, tabs, panel-content)
│   ├── 07-vasen.css                (väsen inventory, family sections, details panel)
│   ├── 08-party.css                (party slots)
│   ├── 09-zones.css                (zone list, zone items, standardised väsen cards)
│   ├── 10-combat.css               (combat arena, combatant panels, ability buttons)
│   ├── 11-modals.css               (rune/item/attribute-stage cards, combat UI base,
│   │                                offer-modal confirmation)
│   ├── 12-badges.css               (element, rarity, and family badges)
│   ├── 13-animations.css           (keyframe animations, ability effects)
│   ├── 14-responsive.css           (battle-log collapsible, touch-action helpers,
│   │                                ALL responsive breakpoints 320 px – 1440 px+,
│   │                                accessibility — hover/focus/reduced-motion)
│   └── 15-collapsibles.css         (element & family matchup collapsible popups —
│                                    clickable badges, matchup-details, family-description-popup)
│
├── js/
│   ├── core/
│   │   ├── 0-viewport.js           (viewport & DPR utility — loads first)
│   │   │                            sets --vh CSS variable, watches DPR changes,
│   │   │                            closes stale popups on resize/orientation change
│   │   ├── 1-constants.js          (game constants & configuration)
│   │   ├── 2-data-abilities.js     (ability definitions)
│   │   ├── 3-data-vasen.js         (väsen species data)
│   │   ├── 4-data-items.js         (item definitions)
│   │   └── 5-vasen-instance.js     (VasenInstance class)
│   │
│   ├── systems/
│   │   ├── 6a-battle-core.js       (Battle class)
│   │   ├── 6b-battle-ai.js         (EnemyAI class)
│   │   └── 7-game-state.js         (GameState class, save/load)
│   │
│   ├── ui/
│   │   ├── 8a-ui-core.js           (UIController class, overlay management,
│   │   │                            positionPopupForCombatCard helper)
│   │   ├── 8b-ui-screens.js        (screen switching, tab navigation)
│   │   ├── 8c-ui-vasen.js          (väsen inventory, details panel, matchup display)
│   │   ├── 8d-ui-items.js          (item and rune inventory)
│   │   ├── 8e-ui-party.js          (party slot management, väsen release)
│   │   ├── 8f-ui-zones.js          (zone selection, descriptions, exploration UI)
│   │   ├── 8g-ui-combat.js         (combat rendering, action buttons, battle animations)
│   │   ├── 8h-ui-modals.js         (dialogue system, offer flow, encounter results)
│   │   └── 8i-ui-settings.js       (settings, profile, game guide)
│   │
│   └── game/
│       ├── 9a-game-core.js         (Game class, menu flow, core lifecycle)
│       ├── 9b-game-exploration.js  (wild encounters, battle handling)
│       ├── 9c-game-guardian.js     (guardian battles)
│       ├── 9d-game-endless.js      (endless tower mode)
│       ├── 9e-game-actions.js      (combat action handlers)
│       └── 9f-game-init.js         (bootstrap, global event bindings)
│
└── assets/
    ├── vasen/
    │   └── [30 Väsen images — PNG pixel art]
    └── zones/
        └── [7 zone images — PNG]
```

### Script load order

Scripts are loaded in numbered order. The prefix determines dependencies:

| Prefix | Layer | Depends on |
|--------|-------|------------|
| `0-` | Viewport utility | nothing (runs immediately) |
| `1–5` | Core data & logic | nothing |
| `6–7` | Game systems | core |
| `8a–8i` | UI controllers | core + systems |
| `9a–9f` | Game controllers | all of the above |

### Responsive breakpoints (all in `11-modals.css`)

| Range | Layout |
|-------|--------|
| 1440 px+ | Three columns: 320 px / 1fr / 1fr |
| 1025–1439 px | Three columns: 280 px / minmax(300,400) / 1fr |
| 769–1024 px | Two columns: 280 px / 1fr (right panel wraps below) |
| ≤ 768 px | Single column, full scroll |
| `max-height: 800px` | Compact combat log, reduced details panel |
| `max-height: 850px` | Combat arena switches to column layout |
## Feature roadmap

- [x] Finish Main Functionality (100%)
- [ ] Make mobile friendly (90%)
- [ ] Game Balance (90%)
- [x] Introduce endgame system (100%)
- [ ] Final Polish (90%)

## Credits

**Developer**: Mattias Milger  
**Email**: mattias.r.milger@gmail.com  
**GitHub**: [MattiasMilger](https://github.com/MattiasMilger/Vasenvaktaren)

## License

All rights reserved. This game and its assets are the property of Mattias Milger.
