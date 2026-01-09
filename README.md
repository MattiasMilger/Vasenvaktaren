# Väsenväktaren

**Catch creatures of Swedish folklore**

A turn-based creature collection game inspired by Swedish mythology and folklore. Explore mystical zones, tame mythical Väsen, and battle your way through the guardians of each realm.

## How to Play

1. Open `index.html` in your web browser or visit https://mattiasmilger.github.io/Vasenvaktaren/
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

### Combat System
- Turn-based battles with move priority
- Element matchups (Potent/Neutral/Weak)
- Megin resource management
- Attribute stages (-5 to +5)
- 24 unique abilities plus Basic Strike

### Runes
- 24 equippable runes with unique effects
- One rune slot (two at level 30)
- Strategic combinations for different builds

### Zones
1. **Trollskogen** (Levels 1-4) - Enchanted forest
2. **Folkets by** (Levels 5-9) - Quiet settlements
3. **Djupa Gruvan** (Levels 10-14) - Deep mines
4. **Glimrande källan** (Levels 15-19) - Crystal waters
5. **Urbergen** (Levels 20-24) - Frozen peaks
6. **Världens Ände** (Levels 25-29) - Edge of reality
7. **Ginnungagap** (Level 30) - Primordial void

## Controls

### Exploration
- Select a zone from the zone list
- Click "Explore" to search the zone
- Click "Challenge Guardian" to face the zone boss

### Combat
- **Abilities**: Use learned attacks (cost Megin)
- **Basic Strike**: Free attack using your element
- **Swap**: Change active Väsen (causes Swap Sickness)
- **Gift Item**: Offer taming items to wild Väsen
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

## Element Matchups

| Attacker | Earth | Nature | Water | Fire | Wind |
|----------|-------|--------|-------|------|------|
| Earth    | 1x    | 0.7x   | 1x    | 1.4x | 1.4x |
| Nature   | 1.4x  | 1x     | 1.4x  | 0.7x | 0.7x |
| Water    | 1.4x  | 1x     | 1x    | 1.4x | 0.7x |
| Fire     | 0.7x  | 1.4x   | 0.7x  | 1x   | 1x   |
| Wind     | 0.7x  | 1x     | 1x    | 1.4x | 1x   |

## Achievements

- **Champion**: Defeat all zone guardians
- **Rune Master**: Collect all 24 runes
- **Grinder**: Tame one of each Väsen species
- **Mega Grinder**: Tame every Väsen with every temperament (360 total)

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
├── styles/
│   └── main.css
├── js/
│   ├── 1-constants.js
│   ├── 2-data-abilities.js
│   ├── 3-data-vasen.js
│   ├── 4-data-items.js
│   ├── 5-vasen-instance.js
│   ├── 6-battle-system.js
│   ├── 7-game-state.js
│   ├── 8-ui-controller.js
│   └── 9-main.js
└── assets/
    └── vasen/
        └── [30 Väsen images]
```

## Feature roadmap

- Finish Main Functionality (50%)
- Make mobile friendly (0%)
- introduce endgame system Endless Tower (0%)

## Credits

**Developer**: Mattias Milger  
**Email**: mattias.r.milger@gmail.com  
**GitHub**: [MattiasMilger](https://github.com/MattiasMilger/Vasenvaktaren)

## License

All rights reserved. This game and its assets are the property of Mattias Milger.

---

*If you enjoyed Väsenväktaren, please consider starring the repository on GitHub!*
