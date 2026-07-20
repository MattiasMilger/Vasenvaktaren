// =============================================================================
// 4-data-items.js - Items Definitions
// =============================================================================

const ITEM_TYPES = {
    TAMING: 'Taming Item'
};

const TAMING_ITEMS = {
    // Oknytt (Prankster)
    'Sturdy Spade': {
        name: 'Sturdy Spade',
        description: 'A sturdy spade. Its well-worn blade looks perfect for turning earth, a fitting offering for an unseen land prankster.',
        tamingTarget: 'Landvatte'
    },
    'Garden Rake': {
        name: 'Garden Rake',
        description: 'A weathered garden rake. It seems useful for tending to a farm, perhaps attracting a careful garden prankster.',
        tamingTarget: 'Gardstomte'
    },
    'Warm Tomtegrot': {
        name: 'Warm Tomtegröt',
        description: 'A bowl of warm tomtegröt. The sweet smell might attract a watchful house prankster who loves this offering.',
        tamingTarget: 'Hustomte'
    },
    'Water Bucket': {
        name: 'Water Bucket',
        description: 'A heavy water bucket reinforced with iron. Its familiar weight and clean build might coax the well prankster to emerge from the dark.',
        tamingTarget: 'Brunnsgubbe'
    },
    'Attic Key': {
        name: 'Attic Key',
        description: 'A rusted attic key. It feels unusually cold to the touch; a perfect token to entice the loft prankster out from the high beams.',
        tamingTarget: 'Pyssling'
    },

    // Vålnad (Phantom)
    'Black Feather': {
        name: 'Black Feather',
        description: 'A black feather. It carries an eerie silence, likely shed by a raven phantom haunting the night sky.',
        tamingTarget: 'Nattramn'
    },
    'Burial Flowers': {
        name: 'Burial Flowers',
        description: 'A small bouquet of burial flowers. Their scent is mournful, calling out to a wailing grave phantom.',
        tamingTarget: 'Myling'
    },
    'Ghastly Lantern': {
        name: 'Ghastly Lantern',
        description: 'A sputtering ghastly lantern. Its light is faint and misleading, a lure for a wandering bog phantom.',
        tamingTarget: 'Irrbloss'
    },
    'Damp Seaweed': {
        name: 'Damp Seaweed',
        description: 'A clump of damp seaweed. It smells strongly of the sea, a sign of a shore phantom\'s haunting cry.',
        tamingTarget: 'Strandvaskare'
    },
    'Mound Root': {
        name: 'Mound Root',
        description: 'A gnarled mound root. It smells of ancient earth and decay, a grim souvenir from a grave that might appease a mound phantom who refuses to rest.',
        tamingTarget: 'Draug'
    },

    // Odjur (Beast)
    'Drenched Saddle': {
        name: 'Drenched Saddle',
        description: 'A glistening drenched saddle. Be cautious; a deceptive river beast might be nearby, looking for a rider.',
        tamingTarget: 'Backahast'
    },
    'Delicate Truffle': {
        name: 'Delicate Truffle',
        description: 'A delicate truffle. Its rich aroma is a highly prized delicacy that makes a nocturnal beast drop its guard and follow its nose.',
        tamingTarget: 'Gloson'
    },
    'Cursed Yarn': {
        name: 'Cursed Yarn',
        description: 'A spool of blood-stained cursed yarn. This tangled mess of wool and wood might entice the thieving beast that stalks the farmsteads.',
        tamingTarget: 'Bjara'
    },
    'Broken Chain': {
        name: 'Broken Chain',
        description: 'A piece of a mighty broken chain. The metal pulses with immense, restrained power - a sign of the great wolf beast.',
        tamingTarget: 'Fenrir'
    },
    'Eagle Quill': {
        name: 'Eagle Quill',
        description: 'A massive eagle quill. It feels impossibly light; a feather from the sky beast that creates the world\'s winds.',
        tamingTarget: 'Rasvelg'
    },

    // Troll
    'Silver Necklace': {
        name: 'Silver Necklace',
        description: 'A dazzling silver necklace. Perhaps a greedy mountain troll dropped it while passing through.',
        tamingTarget: 'Bergatroll'
    },
    'Mossy Bark': {
        name: 'Mossy Bark',
        description: 'A thick piece of mossy bark. It\'s the perfect camouflage for a cunning forest troll.',
        tamingTarget: 'Skogstroll'
    },
    'Trollmilk Bottle': {
        name: 'Trollmilk Bottle',
        description: 'A strange, small trollmilk bottle. It seems to have been left by a sickly, irritable cradle troll.',
        tamingTarget: 'Bortbyting'
    },
    'Cooling Grease': {
        name: 'Cooling Grease',
        description: 'A jar of cooling grease, used by smiths to quench blazing metal. A fitting offering for a petrified troll whose core never cools.',
        tamingTarget: 'Gryningstroll'
    },
    'Bridge Keystone': {
        name: 'Bridge Keystone',
        description: 'A heavy, moss-covered bridge keystone. It feels ancient and important, a fitting tribute to a bridge troll.',
        tamingTarget: 'Backatroll'
    },

    // Rå (Warden)
    'Mine Lantern': {
        name: 'Mine Lantern',
        description: 'A sturdy mine lantern. The light might please the beautiful mine warden.',
        tamingTarget: 'Gruvra'
    },
    'Shed Antlers': {
        name: 'Shed Antlers',
        description: 'A set of shed antlers. They whisper of the deep woods and the alluring forest warden.',
        tamingTarget: 'Skogsra'
    },
    'Waterlogged Violin': {
        name: 'Waterlogged Violin',
        description: 'A waterlogged violin. Its silent strings recall the melancholic, luring music of the river warden.',
        tamingTarget: 'Nacken'
    },
    'Heavy Pillow': {
        name: 'Heavy Pillow',
        description: 'A heavy pillow, grown unnaturally dense from the nightly visits of a dream warden.',
        tamingTarget: 'Mara'
    },
    'Brass Cowbell': {
        name: 'Brass Cowbell',
        description: 'A worn brass cowbell. Its hollow ringing might attract a charred warden, who longs for the memory of a living forest.',
        tamingTarget: 'Huldra'
    },

    // Alv (Elf)
    'Flicker Dust': {
        name: 'Flicker Dust',
        description: 'A pinch of shimmering flicker dust. It might catch the attention of a capricious twilight elf.',
        tamingTarget: 'Alva'
    },
    'Morning Dew': {
        name: 'Morning Dew',
        description: 'A jar containing shimmering morning dew. This ethereal substance attracts the tiny mist elf that haunts the water\'s edge.',
        tamingTarget: 'Dimalva'
    },
    'Shiny Trinket': {
        name: 'Shiny Trinket',
        description: 'A small, intricately carved shiny trinket. Its metallic sheen hints that it was crafted by masterful underground elf.',
        tamingTarget: 'Svartalv'
    },
    'Anvil Shard': {
        name: 'Anvil Shard',
        description: 'A jagged anvil shard of glittering, dark metal that hums with latent power. An ideal offering for a forge elf who can craft legendary weapons.',
        tamingTarget: 'Dvarg'
    },
    'Festive Midsommarkrans': {
        name: 'Festive Midsommarkrans',
        description: 'A festive midsommarkrans. Its radiance attracts the beautiful, radiant light elf.',
        tamingTarget: 'Ljusalv'
    },

    // Ande (Spirit)
    'Elderflower Sprig': {
        name: 'Elderflower Sprig',
        description: 'A fragrant elderflower sprig. Its scent is protective, a necessary offering for the fierce elder tree spirit.',
        tamingTarget: 'Hyllemor'
    },
    'Valhallan Pork': {
        name: 'Valhallan Pork',
        description: 'A tempting piece of valhallan pork. The scent of victory and feasting lingers, attracting a warrior spirit from Valhalla.',
        tamingTarget: 'Einharje'
    },
    'Shield Fragment': {
        name: 'Shield Fragment',
        description: 'A polished shield fragment. It has the mark of a powerful, winged spirit who chooses the worthy slain.',
        tamingTarget: 'Valkyria'
    },
    'Soul Flame': {
        name: 'Soul Flame',
        description: 'A flickering soul flame, drawn from the depths of an ancient fire. Its warmth feels almost alive, a fitting tribute for a flame spirit.',
        tamingTarget: 'Fylgja'
    },
    'Fate Thread': {
        name: 'Fate Thread',
        description: 'A shimmering silver-blue fate thread humming with ancient power drawn from the well beneath Yggdrasil. A fitting offering for a fate-weaving spirit.',
        tamingTarget: 'Norna'
    },

    // Jätte (Giant)
    'Giant Rock': {
        name: 'Giant Rock',
        description: 'A surprisingly smooth giant rock. A piece of the raw, immense power of a primordial giant.',
        tamingTarget: 'Jotun'
    },
    'Glowing Coal': {
        name: 'Glowing Coal',
        description: 'A searing glowing coal. It burns with the endless fire of Muspelheim, attracting a fire giant.',
        tamingTarget: 'Eldturs'
    },
    'Ice Crystal': {
        name: 'Ice Crystal',
        description: 'A razor-sharp ice crystal. It is bone-chillingly cold, a remnant of a frost giant of Niflheim.',
        tamingTarget: 'Rimturs'
    },
    'Ancient Log': {
        name: 'Ancient Log',
        description: 'A section of ancient log whose bark is black as iron and warm to the touch. A fitting tribute for an iron forest giant.',
        tamingTarget: 'Jarnvidja'
    },
    'Shattered Pillar': {
        name: 'Shattered Pillar',
        description: 'A jagged shattered pillar. Its fractured face bears the imprint of a colossal heel. A storm giant would appreciate it.',
        tamingTarget: 'Stormturs'
    },

    // Drake (Serpent)
    'Shedded Scale': {
        name: 'Shedded Scale',
        description: 'A large, heavy shedded scale. It belonged to a massive slithering serpent of the forgotten lands.',
        tamingTarget: 'Lindorm'
    },
    'Gold Coin': {
        name: 'Gold Coin',
        description: 'A flawless gold coin, often found in the colossal hoards of a greedy hoard serpent.',
        tamingTarget: 'Fafner'
    },
    'White Scales': {
        name: 'White Scales',
        description: 'A handful of shimmering white scales. They radiate a faint, ancient hum; an offering befitting a white serpent.',
        tamingTarget: 'Vitorm'
    },
    'Fishing Hook': {
        name: 'Fishing Hook',
        description: 'A colossal fishing hook. Only the one who tried to catch the world serpent could have used this.',
        tamingTarget: 'Jormungandr'
    },
    'Yggdrasil Root': {
        name: 'Yggdrasil Root',
        description: 'A fragment of Yggdrasil root. It is gnawed and ancient, a piece of the world tree itself, sought by a gnawing serpent.',
        tamingTarget: 'Nidhogg'
    }
};

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
function isCorrectTamingItem(itemName, speciesName) {
    const item = TAMING_ITEMS[itemName];
    return item && item.tamingTarget === speciesName;
}
