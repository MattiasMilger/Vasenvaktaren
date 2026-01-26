# Väsenväktaren

**Catch creatures of Swedish folklore**

A turn-based creature collection game inspired by Swedish mythology and folklore. Explore mystical zones, tame mythical Väsen, and battle your way through the guardians of each realm.

**If you enjoyed Väsenväktaren, please consider starring the repository!**

## How to Play

1. https://mattiasmilger.github.io/Vasenvaktaren/ <-- Open in Browser
   (alternatively run locally: Save the files and open `index.html` with your web browser)

2. Click "New Game" to start
3. Choose your starter Väsen from three options
4. Explore zones to encounter wild Väsen, find items, discover runes, or encounter sacred wells
5. Battle and tame Väsen to build your collection
6. Defeat zone guardians to unlock new areas

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
├── index.html
├── README.md
├── CHANGELOG.MD
├── MIGRATION.md
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
│   ├── 13-animations.css           (animations)
│   └── 14-responsive.css           (responsive design)
│
├── js/
│   ├── core/
│   │   ├── 1-constants.js          (game constants)
│   │   ├── 2-data-abilities.js     (ability definitions)
│   │   ├── 3-data-vasen.js         (väsen species data)
│   │   ├── 4-data-items.js         (item definitions)
│   │   └── 5-vasen-instance.js     (VasenInstance class)
│   │
│   ├── systems/
│   │   ├── 6a-battle-core.js       (Battle class)
│   │   ├── 6b-battle-ai.js         (EnemyAI class)
│   │   └── 7-game-state.js         (GameState class)
│   │
│   ├── 8-ui-controller.js          (UIController class)
│   └── 9-main.js                   (main entry point)
│
└── assets/
    ├── vasen/
    │   └── [30 Väsen images]
    └── zones/
        └── [7 zone images]
```

**Note**: The project has been modularized for better maintainability. CSS is split into 14 focused modules, and the battle system is split into core and AI. See [MIGRATION.md](MIGRATION.md) for details.

## Feature roadmap

- [x] Finish Main Functionality (100%)
- [ ] Make mobile friendly (90%)
- [ ] Game Balance (35%)
- [x] Introduce endgame system (100%)

## Credits

**Developer**: Mattias Milger  
**Email**: mattias.r.milger@gmail.com  
**GitHub**: [MattiasMilger](https://github.com/MattiasMilger/Vasenvaktaren)

## License

All rights reserved. This game and its assets are the property of Mattias Milger.
