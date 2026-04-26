// =============================================================================
// 10-data-lore.js - Lore Book Entry Definitions
// =============================================================================

const LORE_ENTRIES = {

    // =========================================================================
    // CATEGORY: FAMILY
    // =========================================================================

    'family_vatte': {
        key: 'family_vatte',
        name: 'Oknytt',
        category: 'vasen',
        desc: 'Oknytt (singular: oknytt) are small, elusive beings tied to specific places or functions. In Swedish folklore, the term refers to mischievous little folk – prone to pranks and petty spite, yet capable of real help when properly respected. They linger in homes, farms, mines, and hidden corners of the wild, quietly tending to the order of their chosen domain. Their mood shapes the world around them: healthy livestock, steady tools, and peaceful nights often signal a content oknytt, while neglect or disrespect invites mischief and misfortune.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'family',
        unlockKey: 'Oknytt'
    },
    'family_valnad': {
        key: 'family_valnad',
        name: 'Vålnad',
        category: 'vasen',
        desc: 'Vålnader (singular: vålnad) are restless, tormented spirits of the dead - those who died in violence, grief, or dishonor and could not find peace. They linger in the world of the living, often tied to the place of their death or to the injustice that caused it. Many seek revenge, while others simply spread misery as an extension of their own suffering. Proper burial rites and prayers were considered essential in Swedish folk belief to prevent the creation of a vålnad.',
        source: 'Swedish Folklore / Afzelius & Stephens (Svenska Folk-Sagor och Äfventyr) / Hyltén-Cavallius (Svenska Folkets Sagohäfder)',
        heritage: 'Swedish',
        unlockType: 'family',
        unlockKey: 'Vålnad'
    },
    'family_odjur': {
        key: 'family_odjur',
        name: 'Odjur',
        category: 'vasen',
        desc: 'Odjur (singular: odjur) are the great supernatural beasts of Norse and Swedish myth - neither entirely animal nor spirit, but something far more primordial. They are often the monstrous offspring of gods, giants, or chaos itself, embodying the raw, untameable forces of nature. Many odjur are foretold to play decisive roles at Ragnarök, the twilight of the gods. The word itself simply means "beast" or "monster" in Swedish, reflecting how these creatures defy ordinary classification.',
        source: 'Norse Mythology / Swedish Folklore',
        heritage: 'Norse',
        unlockType: 'family',
        unlockKey: 'Odjur'
    },
    'family_troll': {
        key: 'family_troll',
        name: 'Troll',
        category: 'vasen',
        desc: 'Trolls are among the most iconic beings in Scandinavian folklore, found across Sweden, Norway, and Denmark in countless local variations. They are ancient, often enormous beings of great physical strength but limited wisdom, dwelling in mountains and deep forests. The most famous trait of the troll is its weakness to sunlight: a troll caught by the dawn will be frozen forever in stone, which is used to explain the peculiar shapes of many natural rock formations throughout Scandinavia. Church bells were said to drive trolls into a frenzy.',
        source: 'Scandinavian Folklore / Asbjørnsen & Moe (Norske Folkeeventyr) / Hyltén-Cavallius (Svenska Folkets Sagohäfder)',
        heritage: 'Scandinavian',
        unlockType: 'family',
        unlockKey: 'Troll'
    },
    'family_ra': {
        key: 'family_ra',
        name: 'Rå',
        category: 'vasen',
        desc: 'Rå are the seductive, nature-bound spirits who serve as wardens of specific natural domains - the forest, the water, the mine, the marsh. They typically appear as strikingly beautiful women who can enchant hunters, fishermen, and miners with irresistible allure. Their true nature is always betrayed by a physical flaw: a hollow back, a cow\'s tail, or backwards feet. Those who fall under a rå\'s power often waste away or vanish entirely. The word "rå" is cognate with Old Norse "rá," meaning a ruler or warden.',
        source: 'Scandinavian Folklore / Hyltén-Cavallius (Svenska Folkets Sagohäfder)',
        heritage: 'Swedish',
        unlockType: 'family',
        unlockKey: 'Rå'
    },
    'family_alv': {
        key: 'family_alv',
        name: 'Alv',
        category: 'vasen',
        desc: 'Alver (singular: alv) are the elven beings of Norse mythology, divided by Snorri Sturluson in the Prose Edda into the ljusalver (light elves) who dwell in Alfheim, and the svartalver (dark elves) who live underground in Nidavelir / Svartalfheim. The ljusalver are described as more radiant than the sun, while the svartalver are darker than pitch. The svartalver are renowned master craftsmen who forged some of the greatest treasures in Norse myth, including Mjölnir and the binding chain Gleipnir.',
        source: 'Prose Edda (Snorri Sturluson)',
        heritage: 'Norse',
        unlockType: 'family',
        unlockKey: 'Alv'
    },
    'family_ande': {
        key: 'family_ande',
        name: 'Ande',
        category: 'vasen',
        desc: 'Andar (singular: ande) are spirits of a mystical or semi-divine nature, distinguished from the simpler house spirits and nature wardens by their connection to greater cosmic powers. They serve gods, guard sacred places, or fulfil divine roles in the ordering of the world. The Swedish word "ande" means "spirit" or "breath," reflecting the ancient belief that these beings exist on the boundary between the physical and the divine.',
        source: 'Norse Mythology / Swedish Folklore',
        heritage: 'Norse',
        unlockType: 'family',
        unlockKey: 'Ande'
    },
    'family_jatte': {
        key: 'family_jatte',
        name: 'Jätte',
        category: 'vasen',
        desc: 'Jättar (singular: jätte) are the immense, primordial giants of Norse mythology known as Jötnar or Tursar. They are among the oldest beings in existence, born before the gods, and represent the raw chaos and elemental forces that the Aesir gods struggle to keep in check. They dwell in Jotunheim, beyond the walls of Asgard and Midgard. Despite being home to the gods\' great enemies, many gods have jötunn blood or take jötunn spouses, blurring the line between divine and primordial.',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'family',
        unlockKey: 'Jätte'
    },
    'family_drake': {
        key: 'family_drake',
        name: 'Drake',
        category: 'vasen',
        desc: 'Drakar (singular: drake) are the great serpentine dragons of Norse mythology and Northern European legend. In Norse tradition, dragons like Nidhögg and Fafner are deeply tied to cosmic forces: one gnaws at the roots of Yggdrasil while the other guards cursed gold. Unlike the winged European dragon, many Nordic dragons are described as great serpents or lindworms. The word "drake" shares its root with the Latin "draco" and the Greek "drakōn," meaning "serpent" or "one who gazes sharply."',
        source: 'Norse Mythology / European Folklore',
        heritage: 'European',
        unlockType: 'family',
        unlockKey: 'Drake'
    },

    // =========================================================================
    // CATEGORY: VÄSEN
    // =========================================================================

    'vasen_pyssling': {
        key: 'vasen_pyssling',
        name: 'Pyssling',
        category: 'vasen',
        desc: 'Pysslingar (singular: pyssling) are the smallest of the humanoid väsen, often no larger than a thumb. While they share traits with oknytt, they are more elusive and less tied to human morality, existing in the forgotten corners of the world. They are masters of hiding in plain sight, living within the walls, under floorboards, or in the very drafts that whistle through a house. Folklore suggests they are born from the whispers of the air or the dust of old homes, serving as tiny, fickle guardians of the spaces humans rarely visit.',
        source: 'Swedish Folklore / Astrid Lindgren',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Pyssling'
    },

    'vasen_landvatte': {
        key: 'vasen_landvatte',
        name: 'Landvätte',
        category: 'vasen',
        desc: 'The Landvätte is the protector of a specific stretch of wilderness, hill, or natural landmark. In Old Norse sources, including the Heimskringla, King Odin commanded that all Viking ships approaching the Norwegian coast lower their dragon prows so as not to frighten the landvættr - the land spirits who protect the country. Swedish folk belief inherited this tradition, holding that disturbing a landvätte\'s territory would bring misfortune.',
        source: 'Heimskringla (Snorri Sturluson) / Landnámabók / Swedish Folklore',
        heritage: 'Scandinavian',
        unlockType: 'vasen',
        unlockKey: 'Landvatte'
    },
    'vasen_gardstomte': {
        key: 'vasen_gardstomte',
        name: 'Gårdstomte',
        category: 'vasen',
        desc: 'The Gårdstomte is the guardian of the farmstead - the barns, the livestock, the outbuildings, and the fields. It is depicted as a small, bearded, elderly man who works invisibly by night to keep the farm in order. The Gårdstomte demands an annual gift of a bowl of porridge (gröt) with a lump of butter on top; neglecting this offering invites disaster, as the tomte may torment the animals, spoil the milk, or move to another farm entirely.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Gardstomte'
    },
    'vasen_hustomte': {
        key: 'vasen_hustomte',
        name: 'Hustomte',
        category: 'vasen',
        desc: 'The Hustomte is the beloved domestic guardian found in nearly every Swedish farmhouse tradition. It lives near the hearth or beneath the floorboards, silently watching over the family and their home. The Hustomte is especially associated with the Christmas season, when it traditionally received its most important offering: a bowl of warm sweet porridge (tomtegröt). The modern image of the Swedish Christmas gnome (Jultomte) descends directly from this ancient folk tradition.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Hustomte'
    },
    'vasen_brunnsgubbe': {
        key: 'vasen_brunnsgubbe',
        name: 'Brunnsgubbe',
        category: 'vasen',
        desc: 'The Brunnsgubbe is the capricious guardian of the village well or sacred spring in Swedish folk belief. Wells were vital to daily life and seen as liminal places where the boundaries between the human world and the spirit realm were thin. The well guardian ensured the water stayed clean and the spring kept flowing, demanding in return that the well be kept free of filth and treated with respect. Dropping foreign objects into the well, washing impure things in it, or failing to leave a small offering could provoke the Brunnsgubbe into souring the water or causing the spring to run dry. Similar well-dwelling creatures appear across Northern European folklore.',
        source: 'Swedish and North European Folklore',
        heritage: 'Swedish and North European',
        unlockType: 'vasen',
        unlockKey: 'Brunnsgubbe'
    },
    'vasen_nattramn': {
        key: 'vasen_nattramn',
        name: 'Nattramn',
        category: 'vasen',
        desc: 'The Nattramn (night raven) is a spectral bird of ill omen in Swedish folklore, believed to be the restless spirit of a builder who was walled alive into a foundation to strengthen it - a practice said to have occurred during the construction of churches and castles. Its shrieking cry heard at night was a death omen. In some traditions the nattramn has no flesh, only a skeleton of hollow bones, and if you could count all its feathers before dawn you would be protected from its curse.',
        source: 'Swedish Folklore / Hyltén-Cavallius (Svenska Folkets Sagohäfder)',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Nattramn'
    },
    'vasen_myling': {
        key: 'vasen_myling',
        name: 'Myling',
        category: 'vasen',
        desc: 'The Myling (also "myrling" or "utbörding") is one of the most chilling figures in Swedish folklore: the spirit of an infant who was murdered or abandoned by its mother before receiving a name and a Christian burial. Condemned to wander the wilderness, it would leap onto the backs of lone travelers and demand to be carried to the nearest churchyard for proper burial. With each step toward the church, it grew heavier, often crushing its unwilling carrier. These spirits were the embodiment of infanticide\'s cultural shame.',
        source: 'Swedish Folklore / Hyltén-Cavallius (Svenska Folkets Sagohäfder)',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Myling'
    },
    'vasen_irrbloss': {
        key: 'vasen_irrbloss',
        name: 'Irrbloss',
        category: 'vasen',
        desc: 'The Irrbloss (also "lyktgubbe") is the Swedish name for the will-o\'-wisp, the eerie hovering light seen over bogs and marshes. Folk belief held these lights to be the souls of sinful or dishonest men - surveyors who had falsified boundaries, cheats, and murderers - condemned to wander eternally between the living world and the realm of the dead. Those who followed the light would be led astray into bogs, quicksand, or over cliffs.',
        source: 'Swedish Folklore / Hyltén-Cavallius (Svenska Folkets Sagohäfder)',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Irrbloss'
    },
    'vasen_strandvaskare': {
        key: 'vasen_strandvaskare',
        name: 'Strandvaskare',
        category: 'vasen',
        desc: 'The Strandvaskare (shore washer) is a coastal apparition in Swedish folklore, the tormented ghost of a drowned sailor eternally condemned to haunt the shoreline where it perished. It wails and lures ships toward the reef with deceptive lights and sounds. This figure shares similarities with the "Bean Nighe" (the washer at the ford) found in Celtic tradition and with the banshee - all representing a spectral harbinger encountered near water who portends death.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Strandvaskare'
    },
    'vasen_draug': {
        key: 'vasen_draug',
        name: 'Draug',
        category: 'vasen',
        desc: 'The Draug is the reanimated, corporeal corpse of the dead in Norse and Scandinavian folklore. Unlike a ghost, it possesses a physical body with immense strength and the ability to increase its weight at will. They are often found guarding treasures within burial mounds or returning to haunt their former homes. A draug\'s presence is marked by a chilling aura of dread and a pervasive "corpse-light." Preventing one from rising required specific rituals, such as placing iron on the casket or pinning the clothes of the deceased to the ground.',
        source: 'Norse Mythology / Heimskringla (Óláfs saga Tryggvasonar) / Icelandic Sagas (Grettis saga; Eyrbyggja saga; Laxdæla saga)',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Draug'
    },
    'vasen_backahast': {
        key: 'vasen_backahast',
        name: 'Bäckahäst',
        category: 'vasen',
        desc: 'The Bäckahäst (brook horse) is a supernatural water horse from Swedish folklore that lurks near rivers and streams in the guise of a beautiful, shimmering white stallion. Anyone who mounts it finds they cannot dismount - the horse then plunges into the water and drowns its rider. This creature is closely related to the Scottish kelpie and the Norwegian nykur. A common protective charm was to name the horse with the words "brook horse" aloud, breaking the spell.',
        source: 'Swedish Folklore / Hyltén-Cavallius (Svenska Folkets Sagohäfder)',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Backahast'
    },
    'vasen_gloson': {
        key: 'vasen_gloson',
        name: 'Gloson',
        category: 'vasen',
        desc: 'The Gloson (glowing sow) is a spectral pig from Swedish folklore, described as a monstrous sow with eyes of burning fire that runs silently through the night at supernatural speed. Encountering a gloson was considered an omen of death or disaster. It is found primarily in Swedish provincial traditions, particularly in Skåne and other southern regions. The creature is sometimes associated with the souls of women who had committed secret crimes in life.',
        source: 'Swedish Folklore (Skånsk tradition)',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Gloson'
    },
    'vasen_bjara': {
        key: 'vasen_bjara',
        name: 'Bjära',
        category: 'vasen',
        desc: 'The Bjära (also "mjölkhare") is a supernatural familiar constructed by a witch from wood shavings, yarn, and hair, then animated with three drops of her own blood. Taking the form of a bloated hare or a rolling ball of yarn, it slinks into neighboring farms to suck milk directly from the udders of cows. Upon returning, it vomits the stolen bounty into its mistress\'s churn. This creature represents deep-seated rural anxieties regarding livestock illness and the suspicion that a neighbor\'s sudden prosperity was the result of magical theft.',
        source: 'Swedish Folklore / Hyltén-Cavallius (Svenska Folkets Sagohäfder)',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Bjara'
    },
    'vasen_fenrir': {
        key: 'vasen_fenrir',
        name: 'Fenrir',
        category: 'vasen',
        desc: 'The Fenris-wolf is the most terrifying of all wolves in Norse mythology, the monstrous son of Loki and the giantess Angrboda. The gods, fearful of a prophecy that Fenrir would kill Odin at Ragnarök, attempted to bind him with chains. He broke every chain of iron and rock until the dwarves forged Gleipnir - a magical ribbon made from impossible things. When Ragnarök comes, Fenrir will swallow the sun, break free, and swallow Odin himself.',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Fenrir'
    },
    'vasen_rasvelg': {
        key: 'vasen_rasvelg',
        name: 'Räsvelg',
        category: 'vasen',
        desc: 'Räsvelg ("corpse swallower") is a giant eagle who sits at the northern edge of the world in Norse cosmology. According to the Poetic Edda\'s poem Vafþrúðnismál, all the winds that blow across the world are created by the beating of Räsvelg\'s enormous wings. The giant eagle is positioned at the end of the world, gazing over all creation. It also plays a role in Eddic descriptions of Yggdrasil, where an eagle perches at the top of the World Tree.',
        source: 'Poetic Edda (Vafþrúðnismál)',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Rasvelg'
    },
    'vasen_bergatroll': {
        key: 'vasen_bergatroll',
        name: 'Bergatroll',
        category: 'vasen',
        desc: 'The Bergatroll (mountain troll) is the classic giant troll of Scandinavian folklore: enormous, slow-witted, ferociously strong, and fond of gold and silver jewelry. Mountain trolls live inside hills and mountains, emerging at night to roam the land. Sunlight turns them instantly to stone - explaining why ancient boulders with unusual shapes are sometimes called "troll rocks" across Norway and Sweden. Some local traditions describe bergatroll as the corrupted spirits of ancient giants.',
        source: 'Scandinavian Folklore / Asbjørnsen & Moe (Norske Folkeeventyr) / Hyltén-Cavallius (Svenska Folkets Sagohäfder)',
        heritage: 'Scandinavian',
        unlockType: 'vasen',
        unlockKey: 'Bergatroll'
    },
    'vasen_skogstroll': {
        key: 'vasen_skogstroll',
        name: 'Skogstroll',
        category: 'vasen',
        desc: 'The Skogstroll (forest troll) is smaller and more cunning than its mountain cousin, blending into the forest with camouflage of moss, bark, and soil. Swedish folk belief held forest trolls responsible for misleading travelers, stealing livestock, and abducting children to be raised underground. They are deeply connected to the ancient wilderness and regard human settlements as an intrusion. Their howls and strange noises heard at night were interpreted as troll communication echoing through the old forests.',
        source: 'Scandinavian Folklore / Asbjørnsen & Moe (Norske Folkeeventyr) / Hyltén-Cavallius (Svenska Folkets Sagohäfder)',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Skogstroll'
    },
    'vasen_bortbyting': {
        key: 'vasen_bortbyting',
        name: 'Bortbyting',
        category: 'vasen',
        desc: 'The Bortbyting (changeling) is the troll or fairy child secretly swapped into a human cradle while the real infant is stolen away. The changeling is recognizable by its sickly appearance, excessive demands for food, and sinister, knowing eyes despite its infant appearance. Folk remedies to recover a stolen child were often elaborate and sometimes cruel, based on the belief that causing sufficient discomfort to the changeling would force the hidden folk to return the real child.',
        source: 'Scandinavian Folklore',
        heritage: 'Scandinavian',
        unlockType: 'vasen',
        unlockKey: 'Bortbyting'
    },
    'vasen_backatroll': {
        key: 'vasen_backatroll',
        name: 'Bäckatroll',
        category: 'vasen',
        desc: 'The Bäckatroll (Stream Troll) is a solitary guardian found throughout Scandinavian folklore. Unlike their larger mountain-dwelling kin, these trolls are strictly territorial, bound to a specific bridge or waterway. Known for being temperamental and greedy, they often demand a toll - be it a coin, a riddle, or a gift - for safe passage. If disrespected or ignored, they are said to lash out by sabotaging the crossing or manipulating the water levels of their domain.',
        source: 'Scandinavian Folklore / Asbjørnsen & Moe (Norske Folkeeventyr)',
        heritage: 'Scandinavian',
        unlockType: 'vasen',
        unlockKey: 'Backatroll'
    },
    'vasen_gryningstroll': {
        key: 'vasen_gryningstroll',
        name: 'Gryningstroll',
        category: 'vasen',
        desc: 'The Gryningstroll (dawn troll) is a tragic figure in Scandinavian myth, defined by the ancient rule that sunlight turns trolls into stone. Unlike their cave-dwelling kin, these trolls are often caught in the open by the first rays of the sun, either due to their own slow-wittedness or a refusal to leave a task unfinished. They are frequently found as solitary, moss-covered statues on hillsides or near crossroads. Folklore suggests that a gryningstroll frozen in stone still retains a glimmer of its former life, waiting in a cold, petrified slumber for a night that never ends.',
        source: 'Scandinavian Folklore / Asbjørnsen & Moe (Norske Folkeeventyr); Hyltén-Cavallius (Svenska Folkets Sagohäfder)',
        heritage: 'Scandinavian',
        unlockType: 'vasen',
        unlockKey: 'Gryningstroll'
    },
    'vasen_gruvra': {
        key: 'vasen_gruvra',
        name: 'Gruvrå',
        category: 'vasen',
        desc: 'The Gruvrå (mine spirit) is the female warden of the mine - a beautiful, pale woman who may appear as a benevolent guide or a deadly seductress depending on the miner\'s behavior. Sweden\'s long mining history, particularly in the Bergslagen region, gave rise to a rich tradition of mine spirits. Miners would leave offerings and observe strict protocols: never whistle underground, never speak of the rå directly, and always treat the mine\'s resources with respect. The German Berggeist is closely related.',
        source: 'Swedish Folklore / Hyltén-Cavallius (Svenska Folkets Sagohäfder)',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Gruvra'
    },
    'vasen_skogsra': {
        key: 'vasen_skogsra',
        name: 'Skogsrå',
        category: 'vasen',
        desc: 'The Skogsrå (forest warden) is one of the most prominent figures in Swedish folklore - a hauntingly beautiful woman who guards the forest and can enchant any hunter or woodsman who ventures into her domain. Her most distinctive feature is her hollow back, often described as looking like a rotten tree trunk, and sometimes a cow\'s tail. Hunters who pleased the skogsrå might find exceptional luck; those who angered her would become hopelessly lost.',
        source: 'Swedish Folklore / Hyltén-Cavallius (Svenska Folkets Sagohäfder)',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Skogsra'
    },
    'vasen_huldra': {
        key: 'vasen_huldra',
        name: 'Huldra',
        category: 'vasen',
        desc: 'The Huldra is a forest warden of striking beauty, known for her long hair, quiet grace, and the cow\'s tail she hides beneath her clothing. She appears to wanderers as a lone woman in the deep woods, helpful to the respectful and perilous to the arrogant. Tales speak of her guiding hunters to game, guarding cattle, and shaping the fortunes of those who cross her path. She is closely related to the Swedish Skogsrå, yet remembered for her influence over both hunters and herders.',
        source: 'Scandinavian Folklore / Hyltén-Cavallius (Svenska Folkets Sagohäfder)',
        heritage: 'Scandinavian',
        unlockType: 'vasen',
        unlockKey: 'Huldra'
    },
    'vasen_nacken': {
        key: 'vasen_nacken',
        name: 'Näcken',
        category: 'vasen',
        desc: 'Näcken is a male water spirit who sits by rivers, streams, and lake shores playing an entrancing violin or fiddle. His music is said to be supernaturally beautiful - so beautiful that listeners cannot stop dancing until they die. He can be propitiated with offerings of schnapps, meat, or tobacco, after which he may teach the listener to play with equal mastery. In some accounts he appears as a handsome young man; in others as a horse or a log drifting in the water.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Nacken'
    },
    'vasen_mara': {
        key: 'vasen_mara',
        name: 'Mara',
        category: 'vasen',
        desc: 'The Mara is a domestic predator - often a living person whose soul wanders at night to torment others. She is the personification of the "night-press," a crushing weight felt upon the chest during sleep that leaves the victim unable to breathe. Famous for weaving "Marlockar" (impossible knots) into the hair of humans and the manes of horses, she was said to ride animals until they were found exhausted at dawn. To stop her, peasants would point shoes away from the bed or plug the keyhole to trap her in her physical form.',
        source: 'Swedish Folklore / Svenska Folksägner; Olaus Magnus (Historia om de nordiska folken)',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Mara'
    },
    'vasen_alva': {
        key: 'vasen_alva',
        name: 'Älva',
        category: 'vasen',
        desc: 'The älvor (singular: älva) are small, ethereal beings strongly associated with wind, flickering lights, and the half-light of dusk and dawn. Unlike the majestic Norse alvar, the Swedish folkloristic älva is more akin to a fairy - tiny, capricious, and riding the high currents of the forest canopy. Contact with älvor was believed to cause "älvablåst" (elf-blast), a sudden illness explained as being breathed upon by an elf. Their appearance as flickering lights among the trees could bring either unexplained good fortune or sudden sickness to those who encountered them.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Alva'
    },
    'vasen_dimalva': {
        key: 'vasen_dimalva',
        name: 'Dimälva',
        category: 'vasen',
        desc: 'The dimälva (mist elf) is a lesser-known variant of the Swedish älva, distinguished by its affinity for water and morning fog rather than wind and canopy light. Where the ordinary älva rides high breezes, the dimälva clings to the surface of lakes and rivers, weaving a supernatural shroud of mist that blurs the boundary between water and land. Swedish lakeside communities spoke of mornings when the water\'s edge became impossible to discern, and those who waded in too confidently would find the ground giving way beneath them. The dimälva itself was described as nearly invisible - a faint shimmer within the fog, glimpsed only when the light struck it from just the right angle.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Dimalva'
    },
    'vasen_svartalv': {
        key: 'vasen_svartalv',
        name: 'Svartalv',
        category: 'vasen',
        desc: 'The svartalver (dark elves), also known as Dwarves (Swedish: Dvärgar), are the master craftsmen of Norse mythology, living underground in Nidavelir / Svartalfheim. They are distinguished by their extraordinary skill in smithing and forging magical artifacts. According to the Prose Edda, the svartalver forged some of the most important objects in Norse myth: Gleipnir (the magical ribbon binding Fenrir), Gungnir (Odin\'s spear), Mjölnir (Thor\'s hammer), and Draupnir (Odin\'s self-replicating gold ring).',
        source: 'Prose Edda (Snorri Sturluson)',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Svartalv'
    },
    'vasen_ljusalv': {
        key: 'vasen_ljusalv',
        name: 'Ljusalv',
        category: 'vasen',
        desc: 'The ljusalver (light elves) dwell in Alfheim, described in the Prose Edda as the most beautiful of realms. Snorri Sturluson describes them as "more radiant than the sun in appearance," aligning them with light, fertility, goodness, and the Vanir gods. Their realm was given as a gift to the god Freyr. While the exact nature of the ljusalver remains somewhat mysterious in the sources, they represent the benevolent, life-affirming face of elven beings in Norse cosmology.',
        source: 'Prose Edda (Snorri Sturluson)',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Ljusalv'
    },
    'vasen_dvarg': {
        key: 'vasen_dvarg',
        name: 'Dvärg',
        category: 'vasen',
        desc: 'The Dvärgar (singular: Dvärg) are the fiery forge-masters of Norse myth, closely linked to the svartalver yet distinct in their nature. Where the svartalver shape cold stone and earth, the Dvärgar command the living heat of the deep forge - the raw, molten fire that courses through the veins of the mountain itself. They are master smiths of legendary pride, reclusive and territorial, and are said to emerge only for materials worthy of their craft. Some Norse sources equate the Dvärgar with dwarves entirely, though others suggest they are a separate order of underground folk united by their bond to fire and iron.',
        source: 'Norse Mythology / Prose Edda',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Dvarg'
    },
    'vasen_hyllemor': {
        key: 'vasen_hyllemor',
        name: 'Hyllemor',
        category: 'vasen',
        desc: 'Hyllemor is the spirit inhabiting the elder tree (Sambucus nigra), found across Scandinavian and British Isles folk tradition. Before cutting any elder wood, one must ask the Elder Mother\'s permission aloud and wait for her consent. Failure to do so brings extreme misfortune: illness, broken furniture made from the wood, and even death. The elder tree was considered sacred across much of Northern Europe, and its white flowers and dark berries were used in protective charms and medicine.',
        source: 'Scandinavian and British Folklore',
        heritage: 'Scandinavian',
        unlockType: 'vasen',
        unlockKey: 'Hyllemor'
    },
    'vasen_einharje': {
        key: 'vasen_einharje',
        name: 'Einhärje',
        category: 'vasen',
        desc: 'The einhärjar (singular: einhärje, "lone fighters") are the chosen warriors who died gloriously in battle and were escorted by the Valkyries to Valhalla in Asgard. Each day they fight one another in glorious combat; each evening their wounds heal and they feast together on the flesh of Särimner, the ever-replenishing boar, washed down with mead flowing from the udder of the goat Heidrun. They train endlessly for their ultimate purpose: fighting alongside the gods at Ragnarök.',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Einharje'
    },
    'vasen_valkyria': {
        key: 'vasen_valkyria',
        name: 'Valkyria',
        category: 'vasen',
        desc: 'Valkyrior (Singular: Valkyria) are the divine shieldmaidens who ride over battlefields at Odin\'s command, selecting which warriors shall die and which shall live. They escort the chosen fallen to Valhalla, where the warriors become Einherjar. Valkyries appear as armored maidens riding through the sky and across the rainbow bridge Bifröst. In later Romantic tradition they became idealized warrior-women, but in older sources they are often portrayed as fearsome and inexorable agents of fate.',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Valkyria'
    },
    'vasen_fylgja': {
        key: 'vasen_fylgja',
        name: 'Fylgja',
        category: 'vasen',
        desc: 'The Fylgja (plural: fylgjur) is a personal spirit in Norse belief, inseparably bound to an individual\'s soul from birth until death. It typically takes the form of an animal that reflects the person\'s inner nature, or occasionally a radiant female figure. The Fylgja cannot be seen by ordinary people in waking life - only those with the gift of second sight, or those close to death, may perceive it. In the Icelandic sagas, seeing one\'s own fylgja is invariably an omen of imminent death. After its bearer dies, the Fylgja passes on to the next member of the family, carrying the accumulated fate of the bloodline forward.',
        source: 'Prose Edda / Icelandic Sagas',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Fylgja'
    },
    'vasen_jotun': {
        key: 'vasen_jotun',
        name: 'Jotun',
        category: 'vasen',
        desc: 'The jötnar (singular: jotun, jätte or turs) are the primordial giants of Norse cosmology - ancient, immense beings who represent the raw chaos that the Aesir gods constantly battle to contain. They inhabited Jotunheim beyond the great barrier of Midgard. Despite being home to the gods\' great enemies, the line between gods and giants is surprisingly blurred: Odin, Thor, and Freyr all have jötunn ancestry, and many jötnar are depicted as wise counselors rather than mindless brutes. Their name may derive from a word meaning "devourer."',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Jotun'
    },
    'vasen_eldturs': {
        key: 'vasen_eldturs',
        name: 'Eldturs',
        category: 'vasen',
        desc: 'The Eldtursar or Eldjötnar (fire giants), also known as the Sons of Muspel, are beings of flame from Muspelheim, the primordial realm of fire in Norse cosmology. Led by the giant Surtr ("the black one"), they are destined to march forth at Ragnarök and set the world ablaze, consuming gods and men alike. In the beginning of time, the sparks and embers that flew from Muspelheim into the primordial void of Ginnungagap helped ignite the process of creation itself when they met the ice of Niflheim.',
        source: 'Prose Edda (Snorri Sturluson)',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Eldturs'
    },
    'vasen_rimturs': {
        key: 'vasen_rimturs',
        name: 'Rimturs',
        category: 'vasen',
        desc: 'The Rimtursar (frost giants) are the oldest of all giants, formed from the ice and rime of Niflheim, the primordial realm of cold. Ymir, the first being, arose from the drops where the ice of Niflheim met the heat of Muspelheim, and from Ymir came the first frost giants. They represent the cold, desolate face of chaos in Norse cosmology, and their eternal conflict with the gods of Asgard shapes the mythological world.',
        source: 'Prose Edda (Snorri Sturluson)',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Rimturs'
    },
    'vasen_jarnvidja': {
        key: 'vasen_jarnvidja',
        name: 'Järnvidja',
        category: 'vasen',
        desc: 'The Järnvidja takes her name from Järnveden, the Iron-Wood, a dark forest east of Midgard mentioned in the Poetic Edda\'s Völuspá, where a terrifying giantess, Angerboda, raises a brood of wolves. In Swedish folk tradition the deep forest was home to enormous, ancient presences that were neither troll nor giant in the usual sense, but something older: the forest itself given a female form and a relentless will. Trees that had grown for centuries without ever being felled were said to develop a spirit of their own, and the grandest of these rise as the Järnvidja. She is a being whose sap runs like molten metal, whose bark cannot be cut, and whose canopy is so vast that it plunges the ground beneath into permanent shadow.',
        source: 'Poetic Edda (Völuspá) / Swedish Folklore',
        heritage: 'Norse / Swedish',
        unlockType: 'vasen',
        unlockKey: 'Jarnvidja'
    },
    'vasen_stormturs': {
        key: 'vasen_stormturs',
        name: 'Stormturs',
        category: 'vasen',
        desc: 'The Stormturs is a towering Jotun of wind and thunder, a thunderous giant whose presence chills the air and bends the gale around his massive frame. His thunder-dark eyes can shatter stone and his steps roll like distant storms across the peaks. Old tales tie his power to the strike of Farbauti, the cunning of Kåre, and the sea-born might of Hymer. Among lightning-scarred pillars and vitrified rock, he walks as both guardian and breaker of mountains.',
        source: 'Poetic Edda (Hymiskviða; Vafþrúðnismál) / Prose Edda (Gylfaginning; Skáldskaparmál)',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Stormturs'
    },
    'vasen_lindorm': {
        key: 'vasen_lindorm',
        name: 'Lindorm',
        category: 'vasen',
        desc: 'The Lindorm (from Old Norse "linnormr") is a great wingless serpentine dragon of Scandinavian folklore, distinguished from the fire-breathing European dragon by its serpentine form. Lindorms appear throughout Swedish folk ballads and fairy tales, often as cursed princes or as terrifying beasts slain by heroes. One of the most famous Swedish folk tales, "Prins Lindorm," tells of a prince cursed to live as a serpent who can only be freed through love and sacrifice. Lindorms were associated with the deep forests.',
        source: 'Swedish Folklore / Folk Ballads',
        heritage: 'Northern European',
        unlockType: 'vasen',
        unlockKey: 'Lindorm'
    },
    'vasen_fafner': {
        key: 'vasen_fafner',
        name: 'Fafner',
        category: 'vasen',
        desc: 'Fafner was originally a dwarf - the son of Reidmar - who killed his own father for the cursed gold hoard of the dwarf Andvari. The greed and power of the treasure transformed him into a monstrous dragon guarding the gold on Gnitahed. He was slain by the hero Sigurd, who was advised by the bird Reginn to consume Fafner\'s heart to gain great wisdom and the ability to understand the speech of birds. His hoard included the ring Andvaranaut, which carried Andvari\'s terrible curse.',
        source: 'Völsunga saga / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Fafner'
    },
    'vasen_vitorm': {
        key: 'vasen_vitorm',
        name: 'Vitorm',
        category: 'vasen',
        desc: 'The Vitorm (White Serpent) is the fabled King of Serpents and a creature of immense wisdom in Scandinavian legend. Extremely rare and snow-white in color, it is said to be the master of all crawling things. According to folklore, the Vitorm possesses a supernatural essence; those brave enough to taste its flesh or lick its scales are granted the ability to understand the language of birds and gain deep knowledge of the earth\'s hidden secrets.',
        source: 'North European Folklore',
        heritage: 'European',
        unlockType: 'vasen',
        unlockKey: 'Vitorm'
    },
    'vasen_jormungandr': {
        key: 'vasen_jormungandr',
        name: 'Jörmungandr',
        category: 'vasen',
        desc: 'Jörmungandr (the Midgard Serpent) is the vast sea serpent whose coils encircle all of Midgard (the world of humans), lying in the great ocean and biting its own tail - making it an Ouroboros, a symbol of cyclical eternity. It is the child of Loki and the giantess Angrboda. Thor and Jörmungandr are destined nemeses: at Ragnarök, Thor will slay the serpent but walk only nine steps before dying from its venom. The famous tale of Thor fishing for Jörmungandr with a giant ox-head appears in the poem Hymiskviða.',
        source: 'Poetic Edda (Kvädet om Hymer) / Prose Edda',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Jormungandr'
    },
    'vasen_nidhogg': {
        key: 'vasen_nidhogg',
        name: 'Nidhögg',
        category: 'vasen',
        desc: 'Nidhögg ("malice striker" or "he who strikes with malice") is a great dragon or serpent who eternally gnaws at the roots of Yggdrasil, the cosmic World Tree that holds the nine realms together. Its ceaseless gnawing is an act of cosmic dissolution - a constant threat to the fabric of existence. At Ragnarök, Nidhögg will fly with corpses on its wings across the ruined landscape. It is described in the poem Völuspá as surviving the end of the world, suggesting it belongs to whatever comes after.',
        source: 'Poetic Edda (Völuspá)',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Nidhogg'
    },
    'vasen_norna': {
        key: 'vasen_norna',
        name: 'Norna',
        category: 'vasen',
        desc: 'The Norns are the three great weavers of fate: Urd (the past), Verdandi (the present), and Skuld (the future). From their home at the Well of Urd at the base of Yggdrasil, they draw water to nourish the World Tree and weave the threads of destiny for all beings. Not even the gods can undo what the Nornir have woven; they carve the life-path of every soul into wooden runes at the moment of birth. Their arrival from the land of giants is said to have marked the end of the gods\' golden age.',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Norna'
    },

    // =========================================================================
    // CATEGORY: ITEMS
    // =========================================================================

    'item_mound_root': {
        key: 'item_mound_root',
        name: 'Mound Root',
        category: 'items',
        desc: 'In Scandinavian folklore, burial mounds (gravhögar) were considered sacred and dangerous places, the homes of the dead. They often contained treasure but were guarded by the spirits of their occupants, such as the Draug. The roots of trees growing on or near these mounds were thought to absorb the mound\'s power, carrying the essence of the ancient earth and the dead within. A Mound Root was therefore a potent offering, a piece of the grave itself, used to appease or communicate with the undead.',
        source: 'Scandinavian Folklore / Archaeology',
        heritage: 'Scandinavian',
        unlockType: 'item',
        unlockKey: 'Mound Root'
    },
    'item_broken_chain': {
        key: 'item_broken_chain',
        name: 'Broken Chain',
        category: 'items',
        desc: 'The chains used to bind Fenrir were forged by the dwarves at the gods\' request - but Fenrir broke every iron and rock chain they made. The dwarves then forged Gleipnir, a magical ribbon made from six impossible things: the sound of a cat\'s footsteps, the beard of a woman, the roots of a mountain, the sinews of a bear, the breath of a fish, and the spittle of a bird. Fenrir agreed to be bound only if a god placed a hand in his mouth as surety - Tyr sacrificed his hand to accomplish it. Only a fragment of a broken chain remains as a relic.',
        source: 'Prose Edda (Snorri Sturluson)',
        heritage: 'Norse',
        unlockType: 'item',
        unlockKey: 'Broken Chain'
    },
    'item_festive_midsommarkrans': {
        key: 'item_festive_midsommarkrans',
        name: 'Festive Midsommarkrans',
        category: 'items',
        desc: 'The Midsommarkrans (midsummer wreath) is one of the most beloved symbols of the Swedish Midsummer celebration (Midsommar). Young women traditionally wove wreaths of wildflowers and placed them on their heads; a wreath made of seven different flowers picked in silence and placed under the pillow was said to make you dream of your future spouse. Midsommar itself is rooted in ancient pagan fertility traditions connected to the summer solstice, later blended with Christian feast days.',
        source: 'Swedish Folk Tradition',
        heritage: 'Swedish',
        unlockType: 'item',
        unlockKey: 'Festive Midsommarkrans'
    },
    'item_fishing_hook': {
        key: 'item_fishing_hook',
        name: 'Fishing Hook',
        category: 'items',
        desc: 'The Hymiskviða (Song of Hymir) in the Poetic Edda tells of Thor\'s famous fishing expedition with the giant Hymir. Using the head of Hymir\'s ox as bait on an enormous hook, Thor cast his line into the ocean and caught Jörmungandr, the Midgard Serpent. He hauled the serpent to the surface, and the two stared into each other\'s eyes - their destined final battle almost occurring centuries before Ragnarök. Hymir panicked and cut the line, letting the serpent sink back into the depths.',
        source: 'Poetic Edda (Kvädet om Hymer)',
        heritage: 'Norse',
        unlockType: 'item',
        unlockKey: 'Fishing Hook'
    },
    'item_warm_tomtegrot': {
        key: 'item_warm_tomtegrot',
        name: 'Warm Tomtegröt',
        category: 'items',
        desc: 'The Christmas porridge (julgröt or tomtegröt) is the traditional offering given to the household tomte (house spirit) at Yuletide. Swedish families would place a bowl of warm rice or barley porridge with a generous pat of butter in the barn or by the hearth on Christmas Eve. Neglecting this ritual risked angering the tomte, who might then harm the livestock, sour the milk, or cause general misfortune throughout the year. The tradition remains alive symbolically in modern Swedish Christmas culture through the Jultomte (Father Christmas).',
        source: 'Swedish Folk Tradition',
        heritage: 'Swedish',
        unlockType: 'item',
        unlockKey: 'Warm Tomtegrot'
    },
    'item_valhalla_pork': {
        key: 'item_valhalla_pork',
        name: 'Valhalla Pork',
        category: 'items',
        desc: 'The boar Särimner is the magical beast of Valhalla described in the Prose Edda: each day the cook Andhrimnir slaughters it and boils it in the great cauldron Eldhrimnir, and each evening the animal is restored completely to life to be slaughtered again the next day. This provides the Einherjar with inexhaustible meat for their nightly feasts. The ever-renewing nature of Saehrimnir reflects the Norse concept of cyclical regeneration and the abundance enjoyed by the honored dead in Valhalla.',
        source: 'Prose Edda (Snorri Sturluson)',
        heritage: 'Norse',
        unlockType: 'valhalla'
    },
    'item_burial_flowers': {
        key: 'item_burial_flowers',
        name: 'Burial Flowers',
        category: 'items',
        desc: 'In Swedish folk belief, an infant who died without baptism - especially one murdered or abandoned - could not pass on to rest and instead became a Myling. The only way to free such a spirit was to give it a proper Christian burial in consecrated ground, complete with the appropriate rites. Flowers placed on a grave were seen as both an offering to the deceased and as a marker for the living - confirming that the dead had been properly honored and laid to rest.',
        source: 'Swedish Folklore / Hyltén-Cavallius (Svenska Folkets Sagohäfder)',
        heritage: 'Swedish',
        unlockType: 'item',
        unlockKey: 'Burial Flowers'
    },
    'item_yggdrasil_root': {
        key: 'item_yggdrasil_root',
        name: 'Yggdrasil Root',
        category: 'items',
        desc: 'Yggdrasil ("Ygg\'s steed" - Ygg being one of Odin\'s names) is the immense ash tree at the center of Norse cosmology that connects all nine realms. Its three roots reach to Asgard (where a well of wisdom lies), to Jotunheim (where Mimir\'s Well holds cosmic knowledge), and to Niflheim (where Nidhögg endlessly gnaws). The gods hold their daily council at Yggdrasil. A fragment of its root gnawed by Nidhögg carries the energy of the cosmos itself.',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'item',
        unlockKey: 'Yggdrasil Root'
    },
    'item_anvil_shard': {
        key: 'item_anvil_shard',
        name: 'Anvil Shard',
        category: 'items',
        desc: 'The art of smithing held near-sacred status in Norse and Germanic cultures - the smith who could work metal was seen as wielding power over creation itself. The mythological smiths par excellence were the Svartálfar (dark elves or dwarves), whose anvils rang in the deep places of the earth. Their greatest works - Mjölnir, Gungnir, the ship Skidbladnir - were gifts to the gods. A shard of a dwarven anvil carries the resonance of that ancient, transformative craft.',
        source: 'Norse Mythology',
        heritage: 'Norse / Germanic',
        unlockType: 'item',
        unlockKey: 'Anvil Shard'
    },
    'item_morning_dew': {
        key: 'item_morning_dew',
        name: 'Morning Dew',
        category: 'items',
        desc: 'Morning dew held a special place in Swedish folk belief, especially when gathered during the mystical light of Midsummer. It was credited with healing properties and profound magical significance. Dew collected at first light was considered the breath of the water itself. On Midsummer night, the dew was thought to be so potent that rolling in it could ensure good health, as it captured the peak of the year\'s natural power before the sun rose to burn the mist away.',
        source: 'Swedish Folk Tradition',
        heritage: 'Swedish',
        unlockType: 'item',
        unlockKey: 'Morning Dew'
    },
    'item_hearth_core': {
        key: 'item_hearth_core',
        name: 'Hearth Core',
        category: 'items',
        desc: 'The hearth fire held a central place in Norse and Swedish folk belief, far beyond its practical function. It was the living heart of the home, and allowing it to go out entirely was considered a grave misfortune - even an omen of death in the household. The fire was tended carefully, and embers were sometimes carried from an old home to a new one to preserve continuity of spirit. In Norse tradition, the hearth was also a liminal space where the boundary between the living and the unseen world grew thin, making it a natural point of contact for spirits like the fylgja, who were believed to linger at the hearthside of those they were bound to.',
        source: 'Norse Mythology / Swedish Folk Tradition',
        heritage: 'Norse / Swedish',
        unlockType: 'item',
        unlockKey: 'Hearth Core'
    },

    // =========================================================================
    // CATEGORY: LOCATIONS
    // =========================================================================

    'location_trollskogen': {
        key: 'location_trollskogen',
        name: 'Trollskogen',
        category: 'locations',
        desc: 'Trollskogen ("Troll Forest") evokes the ancient Swedish tradition of the enchanted deep forest - a space outside civilized order where dangerous beings dwell and human rules cease to apply. Swedish folklore is filled with accounts of people entering old-growth forests and encountering trolls, rå, and other beings. The forest canopy blocking sunlight was particularly associated with danger, as sunlight was the primary protection against many supernatural threats. Several real locations in Sweden bear this name, most famously on the island of Öland.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'zone',
        unlockKey: 'TROLLSKOGEN'
    },
    'location_ginnungagap': {
        key: 'location_ginnungagap',
        name: 'Ginnungagap',
        category: 'locations',
        desc: 'Ginnungagap ("the yawning void" or "the gap of gaps") is the primordial empty space that existed before creation in Norse cosmology. It lay between the realm of ice (Niflheim) to the north and the realm of fire (Muspelheim) to the south. When the cold of Niflheim and the heat of Muspelheim met in the middle of Ginnungagap, the ice melted and dripped, and from those drops came Ymir, the first giant, and Audhumbla, the great cow who nourished him. From this collision of opposites, all existence emerged.',
        source: 'Prose Edda (Snorri Sturluson)',
        heritage: 'Norse',
        unlockType: 'zone',
        unlockKey: 'GINNUNGAGAP'
    },
    'location_sacred_well': {
        key: 'location_sacred_well',
        name: 'Sacred Wells',
        category: 'locations',
        desc: 'Sacred springs (heliga källor or offerkällor - "offering sources") are one of the oldest and most widespread forms of folk religious practice in Sweden and Scandinavia. Natural springs were seen as places where the boundary between the human world and the realm of spirits was especially thin. Offerings - coins, pins, rags, flowers - were cast into the water in exchange for healing, luck, or divine intercession. Many sacred springs became associated with specific saints after Christianization, but the practice itself is far older, rooted in pre-Christian reverence for water as a sacred element.',
        source: 'Swedish Folk Belief / Scandinavian Archaeology',
        heritage: 'Swedish',
        unlockType: 'zone',
        unlockKey: 'GLIMRANDE_KALLAN'
    },
    'location_world_end': {
        key: 'location_world_end',
        name: "Världens Ände",
        category: 'locations',
        desc: 'Världens Ände (World\'s end) marks the desolate threshold where reality begins to fray. This cursed landscape serves as the final battlefield for the prophesied Ragnarök, the doom of the gods. Here, the forces of chaos and order are destined to collide in an event that brings about the ultimate destruction of the cosmos. It is a place of absolute finality where stars fall from the sky and the earth sinks into the sea, yet it remains the necessary site for the world to eventually be reborn from the ashes of the old.',
        source: 'Poetic Edda / Norse Mythology',
        heritage: 'Scandinavian',
        unlockType: 'zone',
        unlockKey: 'VARLDENS_ANDE'
    },
    // =========================================================================
    // CATEGORY: ABILITIES
    // =========================================================================

    'ability_smithing': {
        key: 'ability_smithing',
        name: 'Smithing',
        category: 'abilities',
        desc: 'Smithing held an almost sacred status in Norse culture - the smith who could transform raw ore into weapons and tools was seen as wielding creative power akin to the gods. The mythological smiths of Norse myth were the Svartálfar, who crafted the greatest treasures of the gods: Mjölnir, Gungnir, Gleipnir, and the ship Skidbladnir. In Swedish folk tradition, the smith was a figure of both respect and some unease - their mastery of fire and metal made them liminal, connected to forces beyond ordinary human ability.',
        source: 'Norse Mythology / Swedish Folk Tradition',
        heritage: 'Norse',
        unlockType: 'ability',
        unlockKey: 'Smithing'
    },
    'ability_drown': {
    key: 'ability_drown',
    name: 'Drown',
    category: 'abilities',
    desc: 'In Swedish folklore, the element of water is often a site of great peril. Many water-dwelling väsen, such as the shimmering Bäckahäst or the melodic Näcken, possess an aspect of drowning their victims. This is rarely described as simple predation. Instead, it is often a thematic calling to the depths where the victim is pulled into a space between the living world and the crushing silence of the water. This reflects the ancient fear of the unpredictable power found in lakes and streams.',
    source: 'Swedish Folklore / Oral Tradition',
    heritage: 'Swedish',
    unlockType: 'ability',
    unlockKey: 'Drown'
},
    'ability_skalds_mead': {
        key: 'ability_skalds_mead',
        name: "Skald's Mead",
        category: 'abilities',
        desc: 'The Mead of Poetry (Skáldskaparmál, or the Mead of Skalds) is one of the most fascinating myths in Norse tradition. The gods and the Vanir made peace by creating Kvasir - a being so wise he could answer any question - from their combined saliva. Two dwarves killed Kvasir and mixed his blood with honey to create a mead that granted the gift of poetry and wisdom to anyone who drank it. Odin eventually stole the mead for the gods after transforming himself into a serpent and then an eagle to escape with it.',
        source: 'Prose Edda (Skáldskaparmál)',
        heritage: 'Norse',
        unlockType: 'ability',
        unlockKey: "Skald's Mead"
    },
    'ability_burning_insult': {
        key: 'ability_burning_insult',
        name: 'Burning Insult',
        category: 'abilities',
        desc: 'The Norse tradition of ritual insult - known as Niding - was a formal, highly skilled verbal contest in which opponents attempted to shame and dishonor one another through increasingly devastating mockery. A successful níð was believed to have real spiritual power to wound. In the game, this is represented by the ability Burning Insult.',
        source: 'Poetic Edda (Lokasenna)',
        heritage: 'Norse',
        unlockType: 'ability',
        unlockKey: 'Burning Insult'
    },
    'ability_enchanting_song': {
        key: 'ability_enchanting_song',
        name: 'Enchanting Song',
        category: 'abilities',
        desc: 'Music as supernatural enchantment is a recurring motif in Scandinavian folklore, most powerfully represented by Näcken\'s fiddle playing. The näcken is said to play by the water\'s edge with such devastating beauty that listeners cannot control themselves - they must dance, and they will dance until they die unless someone can break the spell by calling the näcken by name. Näcken could also teach his art to humans, but only for a price. Similar traditions appear across Northern Europe, from the Irish fiddle spirits to the Scottish Faerie musicians.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'ability',
        unlockKey: 'Enchanting Song'
    },
    'ability_boulder_toss': {
        key: 'ability_boulder_toss',
        name: 'Boulder Toss',
        category: 'abilities',
        desc: 'Across Scandinavia, local legends explain numerous large boulders and rock formations as evidence of giants and trolls hurling stones. One widespread tradition holds that trolls, infuriated by the sound of church bells - which drove them away from human settlements - would hurl enormous boulders at churches in retaliation. Many Swedish churches claim to have old boulders in their environs that were thrown by nearby trolls. Geologically, these are typically glacial erratics - rocks transported and deposited by glaciers thousands of years ago, which perfectly suited the legendary explanation.',
        source: 'Scandinavian Folklore',
        heritage: 'Scandinavian',
        unlockType: 'ability',
        unlockKey: 'Boulder Toss'
    },
    'ability_elven_light': {
        key: 'ability_elven_light',
        name: 'Elven Light',
        category: 'abilities',
        desc: 'In Swedish folklore, elves and related beings were associated with mysterious lights seen in meadows, forests, and over marshes at twilight - the "älvornas dans" (the dance of the elves). A ring of flattened grass in a meadow, found in the morning, was called an "älvring" (elf ring) - the mark left by elves dancing through the night. The lights themselves, hovering and drifting, were interpreted as the elves\' own luminescence or as lanterns they carried. Seeing such lights was considered an omen that required caution and respect.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'ability',
        unlockKey: 'Elven Light'
    },
    'ability_fire_breath': {
        key: 'ability_fire_breath',
        name: 'Fire Breath',
        category: 'abilities',
        desc: 'The fire-breathing dragon is one of the most universal figures in European mythology, and in Norse tradition dragons like Fafner guard their hoards with deadly flame. The image may derive from the association between serpents and poison - a venomous serpent\'s bite as a form of burning from within. In Beowulf, the Anglo-Saxon epic closely related to Norse tradition, the dragon breathes fire to defend its treasure. The fire breath represents the destructive potential of hoarded power, turned outward against any who dare approach.',
        source: 'Norse Mythology / European Folklore',
        heritage: 'European',
        unlockType: 'ability',
        unlockKey: 'Fire Breath'
    },
    'ability_lokis_betrayal': {
        key: 'ability_lokis_betrayal',
        name: "Loki's Betrayal",
        category: 'abilities',
        desc: 'Loki, the shape-shifting trickster of Norse myth, is defined above all else by his capacity to exploit weakness. Where others strike at strength, Loki seeks the crack already in the stone. His most famous act of betrayal was guiding the blind god Höðr\'s hand to loose the mistletoe dart that slew Baldr - the one thing in all creation that had been overlooked in Frigg\'s oath of protection. The ability Loki\'s Betrayal captures this essence: it is not the mightiest blow, but the precise one, driven deeper into a foe already faltering.',
        source: 'Prose Edda (Snorri Sturluson) / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'ability',
        unlockKey: "Loki's Betrayal"
    },
    'ability_giantsbane': {
        key: 'ability_giantsbane',
        name: "Giantsbane",
        category: 'abilities',
        desc: 'In the iron grip of Norse mythology, the Giants represent the chaotic and primordial forces of the wild. These are beings of such immense scale that they often dwarf the gods themselves. Yet, the thunder god Thor stands as the ultimate deterrent against this chaos. Wielding Mjölnir, he delivers strikes that do not merely bruise flesh but shatter the very foundations of giant kind, turning their own massive bulk into a liability.',
        source: 'Prose Edda (Snorri Sturluson) / Völuspá',
        heritage: 'Norse',
        unlockType: 'ability',
        unlockKey: "Giantsbane"
    },
    'ability_rotvalta': {
        key: 'ability_rotvalta',
        name: 'Rotvälta',
        category: 'abilities',
        desc: 'A "rotvälta" is the massive, vertical wall of earth and tangled roots exposed when a great tree is torn from the ground by storm or weight. In folk belief, these are not merely natural accidents but the forest’s own defensive reflex. The ability channels this subterranean upheaval; when an enemy strikes with aggression, the earth recoils in kind, erupting in a crushing surge of wood and soil. To strike a practitioner of Rotvälta is to invite the weight of the forest floor to rise up and settle the debt.',
        source: 'Swedish Folklore / Forest Traditions',
        heritage: 'Swedish',
        unlockType: 'ability',
        unlockKey: 'Rotvalta'
    },
    'ability_tyrs_sacrifice': {
        key: 'ability_tyrs_sacrifice',
        name: "Tyr's Sacrifice",
        category: 'abilities',
        desc: 'Tyr is the Norse god of law, justice, and single combat - and his defining myth is one of deliberate, willing self-destruction for the greater good. When the gods sought to bind the monstrous wolf Fenrir with the magical ribbon Gleipnir, Fenrir refused to let it be placed around him unless one of the gods agreed to put their hand in his mouth as a pledge of good faith. Tyr alone stepped forward. As soon as Fenrir found he could not break free, he bit off Tyr\'s hand at the wrist. Tyr lost his hand, and the gods gained the binding of Fenrir until Ragnarök. The sacrifice was not a mistake - it was a calculated exchange of flesh for order, of self for the whole.',
        source: 'Prose Edda (Snorri Sturluson) / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'ability',
        unlockKey: "Tyr's Sacrifice"
    },
    'ability_freyas_tears': {
        key: 'ability_freyas_tears',
        name: "Freya's Tears",
        category: 'abilities',
        desc: "The goddess Freya, known as Vanadís of the Vanir, famously wept for her husband Óðr when he departed on long journeys. Her sorrow possesses a unique, physical weight that alters the natural world. When her tears strike the soil, they manifest as pure, red gold, while those that descend into the salt of the deep oceans are preserved as translucent amber. This transformation of divine grief into lasting treasure serves as a testament to her immense power over both the earth and the sea, cementing her tears as a symbol of value and endurance across the realms.",
        source: 'Prose Edda (Gylfaginning) / Skáldskaparmál',
        heritage: 'Norse',
        unlockType: 'ability',
        unlockKey: "Freya's Tears"
    },

    // =========================================================================
    // CATEGORY: CONCEPTS
    // =========================================================================
 
    'concept_vasen': {
        key: 'concept_vasen',
        name: 'Väsen',
        category: 'concepts',
        desc: 'The Swedish word "väsen" is a broad, collective term for all manner of supernatural beings found in Scandinavian folk belief. It encompasses everything from helpful house spirits to malevolent forest predators. Unlike the English word "monster," väsen carries no inherent moral judgment - a being is simply a väsen by its very nature. The word itself derives from Old Swedish and is related to the verb "vara" (to be), meaning roughly "a being" or "an entity."',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'standard'
    },
    'concept_megin': {
        key: 'concept_megin',
        name: 'Megin',
        category: 'concepts',
        desc: 'Megin (Old Norse: megin) is the concept of personal power, might, and vital energy in Norse tradition. Thor\'s legendary strength is often specifically called his "megin" - a deep, intrinsic force rather than merely trained muscle. The word is related to the verb "mega" (to be, to have power) and the English "main" (as in "with might and main"). In Norse cosmology, megin is the fundamental force that distinguishes the powerful from the ordinary: gods, giants, and great warriors possess it in abundance.',
        source: 'Old Norse Tradition / Norse Mythology',
        heritage: 'Norse',
        unlockType: 'standard'
    },
    'concept_futhark': {
        key: 'concept_futhark',
        name: 'Runes',
        category: 'concepts',
        desc: 'The Elder Futhark is the most ancient of the runic systems. It consists of 24 characters used from the 2nd to the 8th centuries CE across the Germanic and Scandinavian world. While later periods saw the rise of the Younger Futhark and other variations, these original symbols remain the foundation of runic lore. Each character carried layers of meaning, magical power, and cosmological significance. Hundreds of runestones with these specific inscriptions survive today as a record of this early heritage.',
        source: 'Swedish and Scandinavian Runestones',
        heritage: 'Scandinavian / Germanic',
        unlockType: 'standard'
    }
};

// =========================================================================
// LORE META - counts and ordered key list
// =========================================================================

const LORE_ENTRY_KEYS = Object.keys(LORE_ENTRIES);
const LORE_TOTAL = LORE_ENTRY_KEYS.length;

const LORE_CATEGORIES = {
    vasen: {
        label: 'Väsen',
        order: 1
    },
    items: {
        label: 'Items',
        order: 2
    },
    locations: {
        label: 'Locations',
        order: 4
    },
    abilities: {
        label: 'Abilities',
        order: 3
    },
    concepts: {
        label: 'Concepts',
        order: 5
    },
    families: {
        label: 'Families',
        order: 0
    }
};

// Keys that are automatically unlocked when the game starts (standard + starter zone)
const LORE_STANDARD_KEYS = LORE_ENTRY_KEYS.filter(k => LORE_ENTRIES[k].unlockType === 'standard');
