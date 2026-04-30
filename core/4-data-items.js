// =============================================================================
// 4-data-items.js - Items Definitions
// =============================================================================

const ITEM_TYPES = {
    TAMING: 'Taming Item'
};

const TAMING_ITEMS = {
    'Sturdy Spade': {
        name: 'Sturdy Spade',
        description: 'A Sturdy Spade. The well-worn wooden handle and polished steel blade look perfect for turning earth, an ideal offering for an unseen guardian of the land.',
        tamingTarget: 'Landvatte'
    },
    'Garden Rake': {
        name: 'Garden Rake',
        description: 'A weathered Garden Rake. It seems useful for tending to a farm, perhaps attracting a careful, bearded guardian.',
        tamingTarget: 'Gardstomte'
    },
    'Warm Tomtegrot': {
        name: 'Warm Tomtegröt',
        description: 'A bowl of Warm Tomtegröt. The sweet smell might attract a watchful house steward who loves this offering.',
        tamingTarget: 'Hustomte'
    },
    'Water Bucket': {
        name: 'Water Bucket',
        description: 'A heavy Water Bucket reinforced with iron. Its familiar weight and clean build might coax the well dweller to emerge from the dark.',
        tamingTarget: 'Brunnsgubbe'
    },
    'Black Feather': {
        name: 'Black Feather',
        description: 'A large Black Feather. It carries an eerie silence, likely shed by a spectral, shrieking raven. You should give it to a Väsen that could use it.',
        tamingTarget: 'Nattramn'
    },
    'Burial Flowers': {
        name: 'Burial Flowers',
        description: 'A small bouquet of Burial Flowers. Their scent is mournful, calling out to a lost, wailing infant spirit.',
        tamingTarget: 'Myling'
    },
    'Ghastly Lantern': {
        name: 'Ghastly Lantern',
        description: 'A sputtering Ghastly Lantern. Its light is faint and misleading, a lure for a wandering, bright phantom.',
        tamingTarget: 'Irrbloss'
    },
    'Damp Seaweed': {
        name: 'Damp Seaweed',
        description: 'A clump of Damp Seaweed. It smells strongly of the sea, a sign of a drowned sailor\'s haunting cry.',
        tamingTarget: 'Strandvaskare'
    },
    'Drenched Saddle': {
        name: 'Drenched Saddle',
        description: 'A glistening Drenched Saddle. Be cautious; a deceptive white horse might be nearby, looking for a rider.',
        tamingTarget: 'Backahast'
    },
    'Delicate Truffle': {
        name: 'Delicate Truffle',
        description: 'A Delicate Truffle. Its rich aroma is a highly prized delicacy that makes a nocturnal grazer drop its guard and follow its nose.',
        tamingTarget: 'Gloson'
    },
    'Cursed Yarn': {
        name: 'Cursed Yarn',
        description: 'A spool of blood-stained Cursed Yarn. This tangled mess of wool and wood might entice the twitching construct that stalks the farmsteads.',
        tamingTarget: 'Bjara'
    },
    'Broken Chain': {
        name: 'Broken Chain',
        description: 'A piece of a mighty Broken Chain. The metal pulses with immense, restrained power - a sign of the great wolf.',
        tamingTarget: 'Fenrir'
    },
    'Eagle Quill': {
        name: 'Eagle Quill',
        description: 'A massive Eagle Quill. It feels impossibly light; a feather from the creator of the world\'s winds.',
        tamingTarget: 'Rasvelg'
    },
    'Silver Necklace': {
        name: 'Silver Necklace',
        description: 'A dazzling Silver Necklace. Perhaps a greedy mountain-dwelling giant dropped it while passing through.',
        tamingTarget: 'Bergatroll'
    },
    'Mossy Bark': {
        name: 'Mossy Bark',
        description: 'A thick piece of Mossy Bark. It\'s the perfect camouflage for a cunning forest Troll.',
        tamingTarget: 'Skogstroll'
    },
    'Trollmilk Bottle': {
        name: 'Trollmilk Bottle',
        description: 'A strange, small Trollmilk Bottle. It seems to have been left by a sickly, irritable changeling child.',
        tamingTarget: 'Bortbyting'
    },
    'Bridge Keystone': {
        name: 'Bridge Keystone',
        description: 'A heavy, moss-covered Bridge Keystone. It feels ancient and important, a fitting tribute to a waterway guardian.',
        tamingTarget: 'Backatroll'
    },
    'Mine Lantern': {
        name: 'Mine Lantern',
        description: 'A sturdy Mine Lantern. The light might please the beautiful mine warden.',
        tamingTarget: 'Gruvra'
    },
    'Shed Antlers': {
        name: 'Shed Antlers',
        description: 'A set of Shed Antlers. They whisper of the deep woods and the alluring, yet dangerous, warden of the forest.',
        tamingTarget: 'Skogsra'
    },
    'Waterlogged Violin': {
        name: 'Waterlogged Violin',
        description: 'A Waterlogged Violin. Its silent strings recall the melancholic, luring music of the water warden.',
        tamingTarget: 'Nacken'
    },
    'Heavy Pillow': {
        name: 'Heavy Pillow',
        description: 'A down-filled cushion grown unnaturally dense from nocturnal visits. It bears the lingering paralysis of a night spent under the phantom\'s press.',
        tamingTarget: 'Mara'
    },
    'Brass Cowbell': {
        name: 'Brass Cowbell',
        description: 'A worn brass cowbell. Its hollow ringing might attract a charred warden, who longs for the memory of a living forest.',
        tamingTarget: 'Huldra'
    },
    'Flicker Dust': {
        name: 'Flicker Dust',
        description: 'A pinch of shimmering Flicker Dust. It might catch the attention of a capricious, wind-riding elven being.',
        tamingTarget: 'Alva'
    },
    'Morning Dew': {
        name: 'Morning Dew',
        description: 'A jar containing shimmering Morning Dew. This ethereal substance attracts the tiny, mist-dwelling beings that haunt the water\'s edge.',
        tamingTarget: 'Dimalva'
    },
    'Anvil Shard': {
        name: 'Anvil Shard',
        description: 'A fragment of an Anvil Shard. It rings with a sound of skilled craftsmanship, belonging to the subterranean smiths.',
        tamingTarget: 'Svartalv'
    },
    'Festive Midsommarkrans': {
        name: 'Festive Midsommarkrans',
        description: 'A Festive Midsommarkrans. Its radiance attracts the beautiful, light-aligned beings of creation.',
        tamingTarget: 'Ljusalv'
    },
    'Molten Ore': {
        name: 'Molten Ore',
        description: 'A chunk of Molten Ore, still pulsing with deep-earth heat. A cinder smith cannot resist such raw, volatile ore.',
        tamingTarget: 'Dvarg'
    },
    'Cooling Grease': {
        name: 'Cooling Grease',
        description: 'A jar of Cooling Grease, used by smiths to quench blazing metal. A fitting offering for a sunstruck troll whose core never cools.',
        tamingTarget: 'Gryningstroll'
    },
    'Elderflower Sprig': {
        name: 'Elderflower Sprig',
        description: 'A fragrant Elderflower Sprig. Its scent is protective, a necessary offering for the fierce, watchful spirit of the Elder Tree.',
        tamingTarget: 'Hyllemor'
    },
    'Valhalla Pork': {
        name: 'Valhalla Pork',
        description: 'A tempting piece of Valhalla Pork. The scent of victory and feasting lingers, attracting a valiant warrior from Valhalla.',
        tamingTarget: 'Einharje'
    },
    'Shield Fragment': {
        name: 'Shield Fragment',
        description: 'A polished Shield Fragment. It has the mark of a powerful, winged maiden who chooses the worthy slain.',
        tamingTarget: 'Valkyria'
    },
    'Hearth Core': {
        name: 'Hearth Core',
        description: 'A glowing Hearth Core, drawn from the embers of an ancient fire. Its warmth feels almost alive, a fitting tribute for a soul-bound spirit.',
        tamingTarget: 'Fylgja'
    },
    'Giant Rock': {
        name: 'Giant Rock',
        description: 'A surprisingly smooth Giant Rock. A piece of the raw, immense power of the ancient giants.',
        tamingTarget: 'Jotun'
    },
    'Glowing Coal': {
        name: 'Glowing Coal',
        description: 'A searing Glowing Coal. It burns with the endless fire of Muspelheim, attracting a fiery elemental being.',
        tamingTarget: 'Eldturs'
    },
    'Ice Crystal': {
        name: 'Ice Crystal',
        description: 'A razor-sharp Ice Crystal. It is bone-chillingly cold, a remnant of the primordial giants of ice and mist.',
        tamingTarget: 'Rimturs'
    },
    'Shedded Scale': {
        name: 'Shedded Scale',
        description: 'A large, slick Shedded Scale. It belonged to a massive, wingless serpent of the forgotten forests.',
        tamingTarget: 'Lindorm'
    },
    'Gold Coin': {
        name: 'Gold Coin',
        description: 'A flawless Gold Coin, often found in the colossal hoards of avaricious drakes.',
        tamingTarget: 'Fafner'
    },
    'White Scales': {
        name: 'White Scales',
        description: 'A handful of shimmering White Scales. They radiate a faint, ancient hum; an offering to bridge the gap between man and the serpent king.',
        tamingTarget: 'Vitorm'
    },
    'Fishing Hook': {
        name: 'Fishing Hook',
        description: 'A colossal Fishing Hook. Only the one who tried to catch the World Serpent could have used this.',
        tamingTarget: 'Jormungandr'
    },
    'Yggdrasil Root': {
        name: 'Yggdrasil Root',
        description: 'A fragment of Yggdrasil Root. It is gnawed and ancient, a piece of the world tree itself.',
        tamingTarget: 'Nidhogg'
    },
    'Fate Thread': {
        name: 'Fate Thread',
        description: 'A shimmering silver-blue Fate Thread humming with ancient power drawn from the well beneath Yggdrasil. A fitting offering for a destiny shaper.',
        tamingTarget: 'Norna'
    },
    'Ancient Log': {
        name: 'Ancient Log',
        description: 'A section of Ancient Log whose bark is black as iron and warm to the touch. A fitting tribute for an Iron Wood native.',
        tamingTarget: 'Jarnvidja'
    },
    'Mound Root': {
        name: 'Mound Root',
        description: 'A gnarled Mound Root. It smells of ancient earth and decay, a grim souvenir from a grave that might appease an undead walker who refuses to rest.',
        tamingTarget: 'Draug'
    },
    'Attic Key': {
        name: 'Attic Key',
        description: 'A rusted Attic Key. It feels unusually cold to the touch; a perfect token to entice the tiny dweller out from the drafty shadows of the high rafters.',
        tamingTarget: 'Pyssling'
    },
    'Shattered Pillar': {
        name: 'Shattered Pillar',
        description: 'A jagged Shattered Pillar. Its fractured face bears the imprint of a colossal heel. A  thunderous giant would appreciate it.',
        tamingTarget: 'Stormturs'
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
