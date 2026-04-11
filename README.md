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
- 45 unique creatures based on Swedish folklore
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

### Lore Book
- Collect lore entries by taming Väsen, defeating guardians, and finding items
- Entries organised into categories: Väsen, Families, Items, Locations, Abilities, Gods, Names, Concepts
- Each entry has English and Swedish descriptions — toggle with the language button

## Achievements

Collection based achievements — a green notification appears when you unlock one:
- **Champion**: Defeat all zone guardians
- **Rune Master**: Collect all runes
- **Hoarder**: Tame every Väsen type
- **Lore Master**: Collect all lore entries

## Save System

- Game automatically saves to localStorage
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
├── index.html                      (game initialization)
├── README.md                       (project information)
│
├── styles/
│   ├── main.css                    (import file)
│   ├── 01-variables.css            (CSS variables)
│   ├── 02-reset.css                (reset & base styles)
│   ├── 03-utilities.css            (utility classes)
│   ├── 04-layout.css               (screens & layout)
│   ├── 05-buttons.css              (button styles)
│   ├── 06-panels.css               (panels & tabs)
│   ├── 07-vasen.css                (väsen UI)
│   ├── 08-party.css                (party section)
│   ├── 09-zones.css                (zone section)
│   ├── 10-combat.css               (combat UI)
│   ├── 11-modals.css               (modal styles)
│   ├── 12-badges.css               (badges & effects)
│   ├── 13-animations.css           (animations & ability animations)
│   ├── 14-responsive.css           (responsive design)
│   └── 15-lore.css                 (lore book styles)
│
├── js/
│   ├── core/
│   │   ├── 1-constants.js          (game constants)
│   │   ├── 2-data-abilities.js     (ability definitions)
│   │   ├── 3-data-vasen.js         (väsen species data)
│   │   ├── 4-data-items.js         (item definitions)
│   │   ├── 5-vasen-instance.js     (VasenInstance class)
│   │   └── 10-data-lore.js         (lore entries, categories, and unlock keys)
│   │
│   ├── systems/
│   │   ├── 6a-battle-core.js       (Battle class)
│   │   ├── 6b-battle-ai.js         (EnemyAI class)
│   │   └── 7-game-state.js         (GameState class)
│   │
│   ├── ui/
│   │   ├── 8a-ui-core.js           (UIController class, initialization, and overlay management)
│   │   ├── 8b-ui-screens.js        (screen switching and tab navigation)
│   │   ├── 8c-ui-vasen.js          (väsen inventory, details panel, and matchup display)
│   │   ├── 8d-ui-items.js          (item and rune inventory management)
│   │   ├── 8e-ui-party.js          (party slot management and väsen release)
│   │   ├── 8f-ui-zones.js          (zone selection, descriptions, and exploration UI)
│   │   ├── 8g-ui-combat.js         (combat rendering, action buttons, and battle animations)
│   │   ├── 8h-ui-modals.js         (dialogue system, offer flow, and encounter results)
│   │   ├── 8i-ui-settings.js       (settings, profile, and game guide)
│   │   └── 8j-ui-lore.js           (lore book rendering, search, and language toggle)
│   │
│   └── game/
│       ├── 9a-game-core.js         (Game class, menu flow, and core lifecycle)
│       ├── 9b-game-exploration.js   (wild encounters and battle handling)
│       ├── 9c-game-guardian.js      (guardian battles)
│       ├── 9d-game-endless.js       (endless tower mode)
│       ├── 9e-game-actions.js       (combat action handlers)
│       └── 9f-game-init.js         (bootstrap and event bindings)
│
└── assets/
    ├── vasen/
    │   └── [30 Väsen images]
    └── zones/
        └── [7 zone images]
```
## Feature roadmap

- [x] Finish Main Functionality 
- [x] Introduce endgame system
- [ ] Balance Overhaul
- [ ] Introduce all 45 Väsen (35/45)
- [ ] Introduce New Abilities
- [ ] Wiki Page

## Credits

**Developer**: Mattias Milger  
**Email**: mattias.r.milger@gmail.com  
**GitHub**: [MattiasMilger](https://github.com/MattiasMilger/Vasenvaktaren)

## License

All rights reserved. This game and its assets are the property of Mattias Milger.
