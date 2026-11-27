// =============================================================================
// 4-core-items.js - Items Definitions
// =============================================================================

const ITEM_TYPES = {
    TAMING: 'Taming Item'
};

// Taming items, keyed by the species key of the väsen each one tames (a
// VASEN_SPECIES key). The key is the item's id: it is what saves store, so it
// must never change. `name` is display text only and can be changed freely.
// Always show an item with TAMING_ITEMS[id].name, never the id itself.
const TAMING_ITEMS = {
    // Oknytt (Prankster)
    Landvatte: {
        name: 'Sturdy Spade',
        description: 'A sturdy spade. Its well-worn blade looks perfect for turning earth, a fitting offering for an unseen land prankster.'
    },
    Gardstomte: {
        name: 'Garden Rake',
        description: 'A weathered garden rake. It seems useful for tending to a farm, perhaps attracting a careful garden prankster.'
    },
    Hustomte: {
        name: 'Warm Tomtegröt',
        description: 'A bowl of warm tomtegröt. The sweet smell might attract a watchful house prankster who loves this offering.'
    },
    Brunnsgubbe: {
        name: 'Water Bucket',
        description: 'A heavy water bucket reinforced with iron. It might coax a well prankster to emerge from the dark.'
    },
    Pyssling: {
        name: 'Attic Key',
        description: 'A rusted attic key. It feels unusually cold to the touch; a perfect token to entice a loft prankster from the high beams.'
    },

    // Vålnad (Phantom)
    Nattramn: {
        name: 'Black Feather',
        description: 'A black feather. It carries an eerie silence, likely shed by a raven phantom haunting the night sky.'
    },
    Myling: {
        name: 'Burial Flowers',
        description: 'A small bouquet of burial flowers. Their scent is mournful, calling out to a wailing grave phantom.'
    },
    Irrbloss: {
        name: 'Ghastly Lantern',
        description: 'A sputtering ghastly lantern. Its light is faint and misleading, a lure for a wandering bog phantom.'
    },
    Strandvaskare: {
        name: 'Damp Seaweed',
        description: 'A clump of damp seaweed. It smells strongly of the sea, a sign of a shore phantom\'s haunting cry.'
    },
    Draug: {
        name: 'Mound Root',
        description: 'A gnarled mound root. It smells of ancient earth and decay, a grim souvenir that might appease a mound phantom who refuses to rest.'
    },

    // Odjur (Beast)
    Backahast: {
        name: 'Drenched Saddle',
        description: 'A glistening drenched saddle. Be cautious; a deceptive river beast might be nearby, looking for a rider.'
    },
    Gloson: {
        name: 'Delicate Truffle',
        description: 'A delicate truffle. Its rich aroma is a highly prized delicacy that makes a nocturnal beast drop its guard and follow its nose.'
    },
    Bjara: {
        name: 'Cursed Yarn',
        description: 'A spool of blood-stained cursed yarn. This tangled mess of wool and wood might entice a thieving beast that stalks the farmsteads.'
    },
    Fenrir: {
        name: 'Broken Chain',
        description: 'A piece of a mighty broken chain. The metal pulses with immense, restrained power - a sign of the great wolf beast.'
    },
    Rasvelg: {
        name: 'Eagle Quill',
        description: 'A massive eagle quill. It feels impossibly light; a feather from the sky beast that creates the world\'s winds.'
    },

    // Troll
    Bergatroll: {
        name: 'Silver Necklace',
        description: 'A dazzling silver necklace. Perhaps a greedy mountain troll dropped it while passing through.'
    },
    Skogstroll: {
        name: 'Mossy Bark',
        description: 'A thick piece of mossy bark. It\'s the perfect camouflage for a cunning forest troll.'
    },
    Bortbyting: {
        name: 'Trollmilk Bottle',
        description: 'A strange, small trollmilk bottle. It seems to have been left by a sickly, irritable cradle troll.'
    },
    Gryningstroll: {
        name: 'Cooling Grease',
        description: 'A jar of cooling grease, used by smiths to quench blazing metal. A fitting offering for a petrified troll whose core never cools.'
    },
    Backatroll: {
        name: 'Bridge Keystone',
        description: 'A heavy, moss-covered bridge keystone. It feels ancient and important, a fitting tribute to a bridge troll.'
    },

    // Rå (Warden)
    Gruvra: {
        name: 'Mine Lantern',
        description: 'A sturdy mine lantern. The light might please a veiled mine warden.'
    },
    Skogsra: {
        name: 'Broken Antlers',
        description: 'A set of antlers, broken off at the base. They whisper of the deep woods and an alluring forest warden.'
    },
    Nacken: {
        name: 'Waterlogged Violin',
        description: 'A waterlogged violin. Its silent strings recall the melancholic, luring music of a river warden.'
    },
    Mara: {
        name: 'Heavy Pillow',
        description: 'A heavy pillow, grown unnaturally dense from the nightly visits of a dream warden.'
    },
    Huldra: {
        name: 'Brass Cowbell',
        description: 'A worn brass cowbell. Its hollow ringing might attract a charred warden, who longs for the memory of a living forest.'
    },

    // Alv (Elf)
    Alva: {
        name: 'Flicker Dust',
        description: 'A pinch of shimmering flicker dust. It might catch the attention of a capricious twilight elf.'
    },
    Dimalva: {
        name: 'Morning Dew',
        description: 'A jar containing shimmering morning dew. This ethereal substance attracts a tiny water elf.'
    },
    Svartalv: {
        name: 'Shiny Trinket',
        description: 'A small, intricately carved shiny trinket. Its metallic sheen hints that it was crafted by an underground elf.'
    },
    Dvarg: {
        name: 'Anvil Shard',
        description: 'A jagged anvil shard of glittering metal that hums with power. An ideal offering for a forge elf who crafts legendary weapons.'
    },
    Ljusalv: {
        name: 'Festive Midsommarkrans',
        description: 'A festive midsommarkrans. Its radiance attracts a beautiful, radiant light elf.'
    },

    // Ande (Spirit)
    Hyllemor: {
        name: 'Elderflower Sprig',
        description: 'A fragrant elderflower sprig. Its scent is protective, a necessary offering for a fierce elder tree spirit.'
    },
    Einharje: {
        name: 'Valhallan Pork',
        description: 'A tempting piece of valhallan pork. The scent of victory and feasting lingers, attracting a warrior spirit from the great hall.'
    },
    Valkyria: {
        name: 'Shield Fragment',
        description: 'A polished shield fragment. It has the mark of a powerful, winged spirit who chooses the worthy slain.'
    },
    Fylgja: {
        name: 'Soul Flame',
        description: 'A flickering soul flame, drawn from the depths of an ancient fire. Its warmth feels almost alive, a fitting tribute for a flame spirit.'
    },
    Norna: {
        name: 'Fate Thread',
        description: 'A shimmering fate thread humming with power drawn from the well beneath Yggdrasil. A fitting offering for a fate-weaving spirit.'
    },

    // Jätte (Giant)
    Jotun: {
        name: 'Giant Rock',
        description: 'A surprisingly smooth giant rock. A piece of the raw, immense power of a primordial giant.'
    },
    Eldturs: {
        name: 'Glowing Coal',
        description: 'A searing glowing coal. It burns with the endless fire of Muspelheim, attracting a fire giant.'
    },
    Rimturs: {
        name: 'Ice Crystal',
        description: 'A razor-sharp ice crystal. It is bone-chillingly cold, a remnant of a frost giant of Niflheim.'
    },
    Jarnvidja: {
        name: 'Ancient Log',
        description: 'A section of ancient log whose bark is black as iron and warm to the touch. A fitting tribute for an iron forest giant.'
    },
    Stormturs: {
        name: 'Shattered Pillar',
        description: 'A jagged shattered pillar. Its fractured face bears the imprint of a colossal heel. A storm giant would appreciate it.'
    },

    // Drake (Serpent)
    Lindorm: {
        name: 'Shedded Scale',
        description: 'A large, heavy shedded scale. It belonged to a massive slithering serpent of the forgotten lands.'
    },
    Fafner: {
        name: 'Gold Coin',
        description: 'A flawless gold coin, often found in the colossal hoards of the greedy hoard serpent.'
    },
    Vitorm: {
        name: 'White Scales',
        description: 'A handful of shimmering white scales. They radiate a faint, ancient hum; an offering befitting a white serpent.'
    },
    Jormungandr: {
        name: 'Fishing Hook',
        description: 'A colossal fishing hook. Only the one who tried to catch the world serpent could have used this.'
    },
    Nidhogg: {
        name: 'Yggdrasil Root',
        description: 'A fragment of Yggdrasil root. It is gnawed and ancient, a piece of the world tree itself, sought by the gnawing serpent.'
    }
};

// Link each item and its väsen. Both directions come from the item's key, so
// the link is written in one place only:
//   TAMING_ITEMS[id].tamingTarget  - the väsen the item tames (= id)
//   VASEN_SPECIES[id].tamingItem   - that väsen's item id (= id)
Object.keys(TAMING_ITEMS).forEach(id => {
    TAMING_ITEMS[id].tamingTarget = id;
    VASEN_SPECIES[id].tamingItem = id;
});

// =============================================================================
// SAVE MIGRATION (legacy item ids)
// -----------------------------------------------------------------------------
// Items used to be keyed by their display name ('Broken Chain'), and saves
// stored those names in itemInventory, favoriteItems and discoveredItems.
// Items are now keyed by väsen ('Fenrir'). When a save
// is loaded, normalizeItemId() converts the old ids. The next save is written
// with the new ids, so each save only needs this once.
//
// The map is frozen: never add to it when items are renamed or added (names
// are display text now and are not stored in saves).
//
// HOW TO REMOVE: when saves from before this change no longer need to load (a new
// version that resets saves, or a rebuild of the game), search for
// "SAVE MIGRATION (legacy item ids)", delete this block, and in each place the
// search finds in GameState.deserialize (7-system-state.js) replace
// `.map(normalizeItemId)` / `normalizeItemId(id)` with the plain id.
// =============================================================================
const LEGACY_ITEM_IDS = {
    'Sturdy Spade': 'Landvatte', 'Garden Rake': 'Gardstomte', 'Warm Tomtegrot': 'Hustomte',
    'Water Bucket': 'Brunnsgubbe', 'Attic Key': 'Pyssling',
    'Black Feather': 'Nattramn', 'Burial Flowers': 'Myling', 'Ghastly Lantern': 'Irrbloss',
    'Damp Seaweed': 'Strandvaskare', 'Mound Root': 'Draug',
    'Drenched Saddle': 'Backahast', 'Delicate Truffle': 'Gloson', 'Cursed Yarn': 'Bjara',
    'Broken Chain': 'Fenrir', 'Eagle Quill': 'Rasvelg',
    'Silver Necklace': 'Bergatroll', 'Mossy Bark': 'Skogstroll', 'Trollmilk Bottle': 'Bortbyting',
    'Cooling Grease': 'Gryningstroll', 'Bridge Keystone': 'Backatroll',
    'Mine Lantern': 'Gruvra', 'Shed Antlers': 'Skogsra', 'Broken Antlers': 'Skogsra',
    'Waterlogged Violin': 'Nacken', 'Heavy Pillow': 'Mara', 'Brass Cowbell': 'Huldra',
    'Flicker Dust': 'Alva', 'Morning Dew': 'Dimalva', 'Shiny Trinket': 'Svartalv',
    'Anvil Shard': 'Dvarg', 'Festive Midsommarkrans': 'Ljusalv',
    'Elderflower Sprig': 'Hyllemor', 'Valhallan Pork': 'Einharje', 'Shield Fragment': 'Valkyria',
    'Soul Flame': 'Fylgja', 'Fate Thread': 'Norna',
    'Giant Rock': 'Jotun', 'Glowing Coal': 'Eldturs', 'Ice Crystal': 'Rimturs',
    'Ancient Log': 'Jarnvidja', 'Shattered Pillar': 'Stormturs',
    'Shedded Scale': 'Lindorm', 'Gold Coin': 'Fafner', 'White Scales': 'Vitorm',
    'Fishing Hook': 'Jormungandr', 'Yggdrasil Root': 'Nidhogg'
};

// SAVE MIGRATION (legacy item ids): an item id read from a save, with an
// old name-based id converted to its current key
function normalizeItemId(id) {
    return LEGACY_ITEM_IDS[id] || id;
}
// ============================ END SAVE MIGRATION =============================

// Helper to get all items for a zone
function getItemsForZone(zoneKey) {
    const zone = ZONES[zoneKey];
    if (!zone) return [];
    
    let spawns;
    if (zone.spawns === 'ALL') {
        spawns = VASEN_LIST;
    } else {
        spawns = zone.spawns;
    }
    
    const items = new Set();
    spawns.forEach(speciesName => {
        const species = VASEN_SPECIES[speciesName];
        if (species && species.tamingItem) {
            items.add(species.tamingItem);
        }
    });
    
    return Array.from(items);
}

// Get random item from zone
function getRandomItemFromZone(zoneKey) {
    const items = getItemsForZone(zoneKey);
    if (items.length === 0) return null;
    return items[Math.floor(Math.random() * items.length)];
}

// Check if item is correct for a species
function isCorrectTamingItem(itemId, speciesName) {
    return !!TAMING_ITEMS[itemId] && itemId === speciesName;
}
