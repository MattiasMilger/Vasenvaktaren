# Väsenväktaren

**Catch creatures of Swedish folklore**

A turn-based creature collection game inspired by Swedish mythology and folklore. Explore mystical zones, tame mythical Väsen, and combat your way through the guardians of each realm.

**If you enjoyed Väsenväktaren, please consider starring the repository!**

## Try It Out

The live version is available at: https://mattiasmilger.github.io/Vasenvaktaren/

## Run Locally

Open `index.html` in a modern browser. No build tools or dependencies required.

## Discussion

Have thoughts on the game, balance ideas, or found a bug? Leave feedback and join the discussion on [GitHub Discussions](https://github.com/MattiasMilger/Vasenvaktaren/discussions/1).

## Game Features

### Väsen

| Feature | Details |
| :--- | :--- |
| **Unique Creatures** | 45 unique creatures based on Swedish folklore |
| **Families** | 9 families: Oknytt, Vålnad, Odjur, Troll, Rå, Alv, Ande, Jätte, Drake |
| **Elements** | 5 elements: Earth, Nature, Water, Fire, Wind |
| **Attributes** | 4 attributes: Strength, Wisdom, Defense, Durability |
| **Rarities** | 4 rarities: Common, Uncommon, Rare, Mythical |
| **Temperaments** | 36 altering temperaments |
| **Skills** | 30 unique skills |

### Runes

- 24 equippable runes with unique effects
- One rune slot (two at level 20)
- Strategic combinations for different builds
- Bindrunes: certain rune pairs unlock a hidden combined effect when equipped together

### Exploration

- Select a zone from the zone list
- Click "Explore" to search the zone
- Find items, runes, and väsen
- Click "Challenge Guardian" to face the zone boss
- Click "Challenge Endless Tower" for endgame challenge

### Combat System & Taming

- Turn-based combat
- Element matchups
- Resource management
- Attribute buffs and debuffs

| Combat Action | Mechanics |
| :--- | :--- |
| **Skills** | Use learned attacks (cost Megin) |
| **Basic Strike** | Free attack using your element |
| **Swap** | Change active Väsen (causes Swap Sickness) |
| **Offer Item** | Offer taming items to wild Väsen |
| **Interrogate** | Learn what item the Väsen wants |
| **Pass** | Skip your turn |
| **Flee** | Exit combat. The väsen on the field stays behind to cover the retreat and is knocked out; the party is left at 5% health |
| **Auto Battle** | Let AI take control |

### Party Management

- Click Väsen in inventory to view details
- Click party slots to assign/remove Väsen
- Maximum 3 Väsen in party
- Only one Mythical Väsen allowed per party
- Auto Runes: randomly equip viable runes to the active party
- Auto Heal: use taming items to heal the active party
- Auto Team: randomize the active party from your whole collection, following the party rules (no duplicate species, one Mythical)

### Player Profile

- Portrait shown in the header, next to the player's name, and again inside the Player Profile screen next to the name field
- Click the header portrait/name to open the Player Profile screen, view collection stats, achievements, and the Endless Tower record
- Click the portrait inside the Player Profile screen to choose a face (8 round outline faces). Plain, Fringe, Parted and Moustache are available from the start (Plain is the default); Helmet (Champion), Glasses (Hoarder), One-Eyed (Lore Master) and Rune-Marked (Rune Master) unlock with that save's achievements and show greyed out with a lock until then (clicking a locked face names its achievement). The choice is saved per save. The header button keeps the person silhouette

### Lore Book

- Collect lore entries by taming Väsen, defeating guardians, and finding items
- Entries organised into categories: Families, Väsen, Items, Skills, Locations, Concepts

### Tips

- New players are guided by tip boxes and glowing buttons until their first tame and first guardian
- Confirmation dialogues show reminder tips, such as Interrogate costing a turn or Auto Heal using up taming items
- Disable Tips (in Settings) hides all tips and tutorial glows; confirmation dialogues still appear

## Achievements

- **Champion**: Defeat all zone guardians
- **Hoarder**: Tame every Väsen type
- **Lore Master**: Collect all lore entries
- **Rune Master**: Collect all runes

## Ragnarök Mode

Optional rules for a harder journey. On the New Game screen, click the red **Ragnarök Mode** button to open the rules and switch on the ones you want. Leave it closed for a normal game. Any combination works, and the rules can never be changed once the game has started.

| Rule | Effect |
| :--- | :--- |
| **Permadeath** | Väsen knocked out in combat die for good. If none are left, the save is over |
| **Lost Runes** | Väsen knocked out in combat lose the runes they wear. Lost runes can be found again by exploring |
| **Weak Healing** | Healing outside combat is halved: Sacred Wells, taming items and the heal after each fight |
| **More Fights** | Wild väsen are met far more often while exploring, so items, Sacred Wells and runes turn up less. Measured over many explorations, including the guaranteed-find rules: about 57% of explorations become fights instead of 39%, with about half as many items and Sacred Wells per fight |

- **Fleeing** knocks out the väsen on the field: it stays behind to cover the retreat. In a normal game that changes nothing (the party is left at 5% health anyway), but with Permadeath it dies and with Lost Runes it loses its runes. Swap in another väsen first to choose who stays behind
- Every rule counts the same. A meter fills as rules are added and names the difficulty after the events before the end of the world: one rule is **Fimbulvinter**, two are **Gjallarhorn**, and any three (all but one) reach **Ragnarök**
- **Permadeath-free zone:** Idunn's apples keep every väsen, and its runes, safe within the Endless Tower. Even with Permadeath or Lost Runes, väsen that fall in the tower are restored when the run ends
- When a väsen dies or loses its runes, a popup and a combat log line say so at once, and a summary follows the fight
- The difficulty is shown next to the Player Profile button (click it for the rules), in the Player Profile, in Settings and on the main menu save cards
- A Permadeath save that is over stays in its slot, marked as fallen, so it can be viewed (cause, party, fallen väsen) and deleted
- **Closing or reloading the page during a battle counts as fleeing**, so a reload can't undo a death or a lost rune: the väsen that was on the field stays behind. On the next start, a "Battle Abandoned" message explains what happened, and any losses from the battle stand. A rolled wild encounter also comes back after a reload instead of being skipped. Normal saves behave as before
- Runes and väsen types in the Player Profile count everything ever collected, so they never go down when a väsen dies or is released, or a rune is lost

## Starting a New Game

1. **New Game** on the main menu (uses the first empty slot, or asks which save to replace when all three are in use)
2. Optionally open **Ragnarök Mode** and choose rules
3. Choose a starter. **Back** returns to the previous step with your rules kept

## Save System

- The game saves automatically to localStorage, in three save slots. It opens the save you played last
- Everything about saves lives on the **main menu** (Settings > Main Menu gets you there). Each save card shows the player, zone, väsen, guardians, fallen väsen, Endless Tower floor, achievements and Ragnarök difficulty, with these buttons:
  - **Continue** (a Permadeath save that is over has no Continue; use its Summary)
  - **Save File**: saves that slot as a `.json` file named after the player, rules and date (e.g. `vasenvaktaren-Testare-permadeath-2026-11-21.json`). Use it to back up or move progress between devices. In desktop Chrome and Edge it opens a "Save As" dialog; other browsers download the file directly
  - **Summary**: shows the save's summary in a dialogue first (stats, achievements, party, collection; for an ended save also how it ended, plus Delete), with **Download Summary** there for a readable `.txt` of the save (rules, progress, achievements, Endless Tower record, party, whole collection and fallen väsen). Handy to keep before deleting a save, or as a record of one in progress.
  - **Delete**: removes the save for good, after a confirmation
- **Load from File** (main menu) puts a save file into an empty slot, or asks which save to replace when all are in use. It also accepts a text file containing a save code exported by older versions
- Settings shows the current save's slot and difficulty, and a **Main Menu** button
- Ragnarök saves can't be rolled back: an older copy of the same save, a save that is over or was deleted, or a save already in another slot can't be loaded, and a second tab with an outdated copy stops saving

## Technical Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- No server required - runs as static files

## Project Structure
```
Vasenvaktaren/
├── index.html                            (game initialization)
├── README.md                             (project information)
│
├── styles/
│   ├── style-main.css                    (imports all styles; import order = cascade order)
│   ├── 01-style-variables.css            (CSS variables)
│   ├── 02-style-reset.css                (reset & base styles)
│   ├── 03-style-utilities.css            (utility classes and messages)
│   ├── 04-style-layout.css               (screens, menus, game layout, header, footer)
│   ├── 05-style-buttons.css              (button styles)
│   ├── 06-style-panels.css               (main game area & panels)
│   ├── 07-style-vasen.css                (inventories, details panel, väsen cards)
│   ├── 08-style-party.css                (party section)
│   ├── 09-style-zones.css                (zone section)
│   ├── 10-style-combat.css               (combat screen, portraits, skills, combat log)
│   ├── 11-style-modals.css               (modals, dialogues, game guide, tip boxes)
│   ├── 12-style-badges.css               (element, family & rarity badges, badge popups)
│   ├── 13-style-animations.css           (idle, attack, hit & shake animations)
│   ├── 14-style-responsive.css           (breakpoints, combat layout, touch, accessibility)
│   ├── 15-style-lore.css                 (lore book styles)
│   ├── 16-style-loot.css                 (item & rune cards)
│   └── 17-style-saves.css                (save cards, Ragnarök Mode, difficulty badge, fallen väsen, Game Over)
│
├── js/
│   ├── core/
│   │   ├── 1-core-constants.js           (game constants)
│   │   ├── 2-core-skills.js              (skill definitions)
│   │   ├── 3-core-vasen.js               (väsen species data)
│   │   ├── 4-core-items.js               (item definitions)
│   │   ├── 4-core-runes.js               (rune definitions; smart rune filter)
│   │   ├── 5-core-instance.js            (VasenInstance class)
│   │   └── 10-core-lore.js               (lore entries, categories, and unlock keys)
│   │
│   ├── systems/
│   │   ├── 6a-system-combat.js           (Combat class: turn flow, actions, knockouts, log)
│   │   ├── 6b-system-ai.js               (EnemyAI class)
│   │   ├── 6c-system-combat-skills.js    (Combat: skills, damage, utility effects)
│   │   ├── 6d-system-combat-passives.js  (Combat: rune effects and family passives)
│   │   ├── 7a-system-saves.js            (save slots, Ragnarök Mode rules and tiers, run guard; loads before 7)
│   │   └── 7-system-state.js             (GameState class: collection, exploration, saves)
│   │
│   ├── ui/
│   │   ├── 8a-ui-core.js                 (UIController class, initialization, overlays)
│   │   ├── 8b-ui-screens.js              (screen switching, tabs, starter selection)
│   │   ├── 8c-ui-vasen.js                (väsen inventory, details panel, matchups)
│   │   ├── 8d-ui-items.js                (item inventory management)
│   │   ├── 8d-ui-runes.js                (rune inventory management)
│   │   ├── 8e-ui-party.js                (party slots, release, Auto Runes / Heal / Team)
│   │   ├── 8f-ui-zones.js                (zone selection and exploration UI)
│   │   ├── 8g-ui-combat.js               (combat rendering, action buttons, animations)
│   │   ├── 8h-ui-modals.js               (dialogues, offer flow, encounter results)
│   │   ├── 8i-ui-menus.js                (settings, profile, and game guide)
│   │   ├── 8j-ui-lore.js                 (lore book rendering, search, language toggle)
│   │   └── 8k-ui-saves.js                (main menu save cards, Ragnarök Mode screen, difficulty badge, Game Over)
│   │
│   └── game/
│       ├── 9a-game-core.js               (Game class, menu flow, and core lifecycle)
│       ├── 9b-game-exploration.js        (wild encounters and combat handling)
│       ├── 9c-game-guardian.js           (guardian combats)
│       ├── 9d-game-endless.js            (endless tower mode)
│       ├── 9e-game-actions.js            (combat action handlers)
│       ├── 9g-game-modes.js              (Ragnarök Mode rules, save slots and files, Game Over)
│       └── 9f-game-init.js               (bootstrap and event bindings)
│
└── assets/
    ├── vasen/
    │   └── [30 Väsen images]             (väsen portraits)
    └── zones/
        └── [7 zone images]               (zone images)
```

## Technical Reference

A full technical reference spreadsheet (attributes and their formulas, families, elements, runes, skills, and zones) is available here: [Väsenväktaren Technical Reference](https://docs.google.com/spreadsheets/d/1xPBtH-oINvYFImW95-dZMRhbHYV1C6O8/edit?usp=sharing&ouid=112888560596239271570&rtpof=true&sd=true)

## Browser Support

Works in all modern browsers (Chrome, Firefox, Edge, Safari). Requires JavaScript enabled.

## Credits

**Developer**: Mattias Milger  
**Email**: mattias.r.milger@gmail.com  
**GitHub**: [MattiasMilger](https://github.com/MattiasMilger/Vasenvaktaren)

## License

All rights reserved. This game and its assets are the property of Mattias Milger.

## More Projects

Check out more of my work at [mattiasmilger.github.io](https://mattiasmilger.github.io/)