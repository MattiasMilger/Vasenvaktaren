# Changelog

All notable changes to **Väsenväktaren** will be documented in this file.  

---

## beta 1.4 - UI (2026-02-02)
- UI fixes
- Strandvaskare - replaced ethereal melody with skald's mead

## beta 1.3 – Hit Flash (2026-01-30)
- Introduced colors based on hit effectiveness
- Increased starting items to 2

## beta 1.2 – Move Changes (2026-01-28)
- Bergatroll learns Smithing instead of Torch strike, Gruvrå learns Ethereal Melody isntead of Smithing

## beta 1.1 – Code Modularization (2026-01-26)

**Technical update** - Project structure reorganized for better maintainability and development workflow
**Zone animation** - Added animation affect to the zone images
**Idle Animation** - Added idle animations for väsen

### Changes
- **CSS Modularization**: Split main.css (5,255 lines) into 15 focused modules organized by feature
  - Variables, reset, utilities, layout, buttons, panels, väsen, party, zones, combat, modals, badges, animations, responsive
  - Main.css now serves as import file only
- **Battle System Split**: Separated battle-system.js into two files
  - `6a-battle-core.js` - Battle class and core mechanics
  - `6b-battle-ai.js` - Enemy AI decision-making
- **Code Organization**: Reorganized JavaScript into logical folders
  - `js/core/` - Game data and constants
  - `js/systems/` - Battle and state management
- **Documentation**: Added MIGRATION.md with detailed explanation of changes

### Technical Details
- No gameplay changes or breaking changes
- All functionality preserved
- Improved code findability and maintainability
- Better separation of concerns
- Easier collaboration and future development

---

## beta 1.0 – Major Visual & Gameplay Update (2026‑01‑23)

A broad upgrade to Väsenväktaren’s presentation and overall feel.  
This update introduces a fully redesigned interface, improved readability, smoother transitions, and more polished interactions across combat, zones, inventory, and modals

Gameplay clarity and flow have also been improved, with better visual feedback, cleaner animations, and more consistent UI behavior on both desktop and mobile

### Highlights
- Complete visual overhaul with a unified Dark Nordic Fantasy theme  
- Improved combat interface, readability, and feedback  
- Updated styling for zones, party, inventory, and collection  
- Smoother animations and more consistent modal behavior  
- Accessibility improvements and general polish  
- Technical cleanup of CSS variables, transitions, and UI logic  
- Rebalancing progression and attributes
- More thematic and immersive move sets
- Better alignment with family identity and gameplay roles


## v0.54-alpha - hide inventory
- implemented hide inventory for mobile


## v0.53-alpha - Empowerment System (2026-01-21)
- **NEW FEATURE: Empowerment System** - Low-tier attacks now grant a damage buff
  - All low-tier attacks (30 megin cost, 50 power) now grant empowerment after use
  - Empowered attacks deal 8% bonus damage
  - Empowerment persists through successive low-tier attacks, creating a perpetual buff
  - Affected abilities: Ground Stomp, Sinkhole, Vine Whip, Elven Light, Drown, Hail Storm, Torch Strike, Fire Breath, Storm Claw, and Wailing Cry
  - Enemy AI now strategically uses low-tier attacks to set up empowered high-damage abilities
  - Jörmungandr - Replaced Icicle Spear with Drown
  - Valkyria - Replaced Wind Gust with Wailing Cry
  - Changed ability learning order that makes more sense with väsen playstyles
  - Fixed AI "new game" flashing upon page refresh

## v0.52-alpha - Family Passives (2026-01-19)
- **Battle Animations introduced**
- Thurs now reads "This väsen returns 40% of the damage taken as mixed damage"

## v0.51-alpha - Family Passives (2026-01-18)
- **NEW FEATURE: Endless Tower** - Endgame Game-mode, test your väsen against endless waves. Unlocked from Ginnungagap.
- **NEW FEATURE: Family Passives** - Each of the 9 Väsen families now has a unique passive ability
  - **Alv**: Innate Megin - Increases max Megin by 14%
  - **Ande**: Ethereal Surge - Raises one random attribute by 1 stage when entering battlefield (works with Gifu rune)
  - **Drake**: Draconic Resilience - Gain +1 Defense and +1 Durability when health falls to 50% or lower
  - **Jätte**: Colossal Power - Basic Strike has 35 power instead of 20
  - **Odjur**: Bestial Rage - Gain +1 Strength and +1 Wisdom after spending 2 full turns on battlefield
  - **Rå**: Malicious Retaliation - Lowers two random enemy attributes by 1 stage when hit
  - **Troll**: Troll Theft - Steals one positive attribute stage from enemy when using an ability
  - **Vätte**: Tag Team - Incoming ally gains +30% damage for current turn when swapping out
  - **Vålnad**: Deathless - Revives with 10% of max health upon knockout (once per battle)
**Input Delay**
- Introduced input delay to combat so you can't spam

## v0.50-alpha - Balance (2026-01-17)
- Älva now learns wind gust at lvl 5


## v0.49-alpha - UI Updates (2026-01-15)
- Älva learns Moon Beam at lvl 5
- Odal buff from 12% to 10%

## v0.48-alpha - UI Updates (2026-01-14)
- standardized modals
- Bäckahäst is now uncommon
- Näcken is now rare
- Smithing and Skald's mead's Megin cost reduced to 40

## v0.47-alpha – UI Updates and misc (2026-01-13)
- UI updates
- Irrbloss is now uncommon
- Balancing of base attributes for different väsen families
- Einhärje's taming item is now Valhalla Pork

## v0.46-alpha – Zone Images (2026-01-12)
- UI scaling fixes
- Added zone images displayed in zone description panel

## v0.45-alpha – Mobile-friendly UI (2026-01-10)
- Introduced mobile-friendly UI
- Improved layout scaling

## v0.44-alpha – Major bug fixes (2026-01-10)
- Fixed major issues in combat and UI
- Improved overall stability
