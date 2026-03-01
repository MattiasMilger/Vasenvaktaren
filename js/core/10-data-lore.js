// =============================================================================
// 10-data-lore.js - Lore Book Entry Definitions
// =============================================================================
// Each entry contains English and Swedish descriptions, a literature source,
// a heritage region, a category, and an unlock condition.
//
// unlockType values:
//   'standard'  - auto-unlocked when the game starts
//   'vasen'     - unlocked when the named species is tamed (unlockKey = internalName)
//   'family'    - unlocked when the first väsen of that family is tamed (unlockKey = family name)
//   'element'   - unlocked when the first väsen of that element is tamed (unlockKey = element name)
//   'zone'      - unlocked when the zone becomes accessible (unlockKey = zone key)
//   'guardian'  - unlocked when the zone guardian is defeated (unlockKey = zone key)
//   'ability'   - unlocked when a väsen with that ability is tamed (unlockKey = ability name)
//   'item'      - unlocked when the correct taming item is used to tame its väsen (unlockKey = item name)
//   'well'      - unlocked upon encountering a Sacred Well
//   'valhalla'  - unlocked by taming Einharje or Valkyria, OR finding Valhalla Pork

const LORE_ENTRIES = {

    // =========================================================================
    // CATEGORY: VÄSEN
    // =========================================================================

    // - -- The Term - --
    'vasen_term': {
        key: 'vasen_term',
        name: 'Väsen',
        category: 'vasen',
        englishDesc: 'The Swedish word "väsen" (plural: "väsen" or "väsenden") is a broad, collective term for all manner of supernatural beings found in Scandinavian folk belief. It encompasses everything from helpful house spirits to malevolent forest predators. Unlike the English word "monster," väsen carries no inherent moral judgment - a being is simply a väsen by its very nature. The word itself derives from Old Swedish and is related to the verb "vara" (to be), meaning roughly "a being" or "an entity."',
        swedishDesc: 'Det svenska ordet "väsen" är ett brett, samlande begrepp för alla slags övernaturliga varelser i skandinavisk folktro. Det omfattar allt från hjälpsamma husandar till illvilliga skogsvarelser. Till skillnad från det engelska ordet "monster" bär väsen ingen inneboende moralisk dom - ett väsen är helt enkelt ett väsen till sin natur. Ordet härstammar från fornskenska och är besläktat med verbet "vara", ungefär synonymt med "ett levande väsen" eller "en entitet."',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'standard'
    },

    // - -- Families - --
    'family_vatte': {
        key: 'family_vatte',
        name: 'Vätte',
        category: 'vasen',
        englishDesc: 'Vätten (singular: vätte) are small, elusive guardian spirits tied to specific places or functions. They inhabit homes, farms, mines, and stretches of wilderness, quietly maintaining order in their domain. Though rarely seen, their presence is felt through the health of animals, the quality of crops, and the peace of the household. They demand respect and can become deeply vindictive if treated with contempt or neglect.',
        swedishDesc: 'Vätten (singular: vätte) är små, svårfångade skyddsandar knutna till platser eller uppgifter. De bebor hem, gårdar, gruvor och naturmarker och upprätthåller ordning inom sitt område. Även om de sällan syns, märks deras närvaro i djurens hälsa, skördars kvalitet och hemmets lugn. De kräver respekt och kan bli djupt hämndfulla om de behandlas med förakt eller negligeras.',
        source: 'Swedish and Scandinavian Folklore',
        heritage: 'Scandinavian',
        unlockType: 'family',
        unlockKey: 'Vätte'
    },
    'family_valnad': {
        key: 'family_valnad',
        name: 'Vålnad',
        category: 'vasen',
        englishDesc: 'Vålnader (singular: vålnad) are the restless, tormented spirits of the dead - those who died in violence, grief, or dishonor and could not find peace. They linger in the world of the living, often tied to the place of their death or to the injustice that caused it. Many seek revenge, while others simply spread misery as an extension of their own suffering. Proper burial rites and prayers were considered essential in Swedish folk belief to prevent the creation of a vålnad.',
        swedishDesc: 'Vålnader (singular: vålnad) är de dödas rastlösa, plågade andar - de som dött i våld, sorg eller vanära och inte kunnat finna frid. De dröjer kvar i de levandes värld, ofta bundna till platsen för sin död eller till den orättvisa som orsakade den. Många söker hämnd, medan andra sprider elände som en förlängning av sitt eget lidande. Ordentliga begravningsriter och böner ansågs nödvändiga i svensk folktro för att förhindra uppkomsten av en vålnad.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'family',
        unlockKey: 'Vålnad'
    },
    'family_odjur': {
        key: 'family_odjur',
        name: 'Odjur',
        category: 'vasen',
        englishDesc: 'Odjur (singular: odjur) are the great supernatural beasts of Norse and Swedish myth - neither entirely animal nor spirit, but something far more primordial. They are often the monstrous offspring of gods, giants, or chaos itself, embodying the raw, untameable forces of nature. Many odjur are foretold to play decisive roles at Ragnarök, the twilight of the gods. The word itself simply means "beast" or "monster" in Swedish, reflecting how these creatures defy ordinary classification.',
        swedishDesc: 'Odjur (singular: odjur) är de stora övernaturliga djuren från nordisk och svensk mytologi - varken helt djur eller ande, utan något vida mer uråldrigt. De är ofta de monstruösa avkommorna till gudar, jättar eller kaos självt och förkroppsligar naturens råa, otyglade krafter. Många odjur är förutsagda att spela avgörande roller vid Ragnarök, gudars skymning. Ordet betyder helt enkelt "best" eller "monster" på svenska, vilket speglar hur dessa varelser trotsar vanlig klassificering.',
        source: 'Norse Mythology / Swedish Folklore',
        heritage: 'Norse',
        unlockType: 'family',
        unlockKey: 'Odjur'
    },
    'family_troll': {
        key: 'family_troll',
        name: 'Troll',
        category: 'vasen',
        englishDesc: 'Trolls are among the most iconic beings in Scandinavian folklore, found across Sweden, Norway, and Denmark in countless local variations. They are ancient, often enormous beings of great physical strength but limited wisdom, dwelling in mountains and deep forests. The most famous trait of the troll is its weakness to sunlight: a troll caught by the dawn will be frozen forever in stone, which is used to explain the peculiar shapes of many natural rock formations throughout Scandinavia. Church bells were said to drive trolls into a frenzy.',
        swedishDesc: 'Troll är bland de mest ikoniska varelserna i skandinavisk folklore och förekommer i Sverige, Norge och Danmark i otaliga lokala varianter. De är urgamla, ofta enorma varelser med stor fysisk styrka men begränsad visdom och bor i berg och djupa skogar. Trollets mest kända egenskap är dess svaghet mot solljus: ett troll som fångas av gryningen fryser för alltid till sten, vilket används för att förklara de märkliga formerna på många naturliga klippformationer i Skandinavien. Kyrkklockorna sades driva troll till vansinne.',
        source: 'Scandinavian Folklore',
        heritage: 'Scandinavian',
        unlockType: 'family',
        unlockKey: 'Troll'
    },
    'family_ra': {
        key: 'family_ra',
        name: 'Rå',
        category: 'vasen',
        englishDesc: 'Rå are the seductive, nature-bound spirits who serve as wardens of specific natural domains - the forest, the water, the mine, the marsh. They typically appear as strikingly beautiful women who can enchant hunters, fishermen, and miners with irresistible allure. Their true nature is always betrayed by a physical flaw: a hollow back, a cow\'s tail, or backwards feet. Those who fall under a rå\'s power often waste away or vanish entirely. The word "rå" is cognate with Old Norse "rá," meaning a ruler or warden.',
        swedishDesc: 'Rå är de förföriska, naturknutna andarna som fungerar som väktare av specifika naturliga domäner - skogen, vattnet, gruvan, mossen. De framträder vanligtvis som slående vackra kvinnor som kan förhäxa jägare, fiskare och gruvarbetare med oemotståndlig lockelse. Deras sanna natur avslöjas alltid av ett fysiskt fel: en ihålig rygg, en kosvans eller bakvända fötter. De som faller under en råas makt tynar ofta bort eller försvinner helt. Ordet "rå" är besläktat med fornnordiskans "rá", som betyder en härskare eller väktare.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'family',
        unlockKey: 'Rå'
    },
    'family_alv': {
        key: 'family_alv',
        name: 'Alv',
        category: 'vasen',
        englishDesc: 'Alvar (singular: alv) are the elven beings of Norse mythology, divided by Snorri Sturluson in the Prose Edda into the Light Elves (Swedish: Ljusalver) who dwell in Alfheim, and the Dark Elves (Swedish: Svartalver) who live underground. The Light Elves are described as more radiant than the sun, while the Dark Elves are darker than pitch. The Svartalver are renowned master craftsmen who forged some of the greatest treasures in Norse myth, including Mjölnir and the binding chain Gleipnir.',
        swedishDesc: 'Alvar (singular: alv) är de älvlika varelserna i nordisk mytologi, indelade av Snorri Sturluson i Prosa-Eddan i Ljusalverna som bor i Alfheim, och Svartalverna som lever under jord. Ljusalverna beskrivs som mer strålande än solen, medan Svartalverna är mörkare än beck. Svartalverna är berömda mästerhantverkare som smidde några av de största skatterna i nordisk myt, däribland Mjölnir och bindningskedjan Gleipnir.',
        source: 'Prose Edda (Snorri Sturluson)',
        heritage: 'Norse',
        unlockType: 'family',
        unlockKey: 'Alv'
    },
    'family_ande': {
        key: 'family_ande',
        name: 'Ande',
        category: 'vasen',
        englishDesc: 'Andar (singular: ande) are spirits of a mystical or semi-divine nature, distinguished from the simpler house spirits and nature wardens by their connection to greater cosmic powers. They serve gods, guard sacred places, or fulfil divine roles in the ordering of the world. The Swedish word "ande" means "spirit" or "breath," reflecting the ancient belief that these beings exist on the boundary between the physical and the divine.',
        swedishDesc: 'Andar (singular: ande) är andar av mystisk eller halvgudomlig natur, utmärkta från de enklare husandarna och naturväktarna genom sin koppling till större kosmiska krafter. De tjänar gudar, vaktar heliga platser eller uppfyller gudomliga roller i världens ordnande. Det svenska ordet "ande" betyder "ande" eller "andetag", vilket speglar den urgamla tron att dessa varelser existerar på gränsen mellan det fysiska och det gudomliga.',
        source: 'Norse Mythology / Swedish Folklore',
        heritage: 'Norse',
        unlockType: 'family',
        unlockKey: 'Ande'
    },
    'family_jatte': {
        key: 'family_jatte',
        name: 'Jätte',
        category: 'vasen',
        englishDesc: 'Jättar (singular: jätte) are the immense, primordial giants of Norse mythology known as Jötnar. They are among the oldest beings in existence, born before the gods, and represent the raw chaos and elemental forces that the Aesir gods struggle to keep in check. They dwell in Jotunheim, beyond the walls of Asgard and Midgard. Despite their antagonistic role, many gods have jötunn blood or take jötunn spouses, blurring the line between divine and primordial.',
        swedishDesc: 'Jättar (singular: jätte) är de enorma, uråldringa jättarna i nordisk mytologi kända som Jötnar. De är bland de äldsta varelserna som existerar, födda före gudarna, och representerar det råa kaoset och de elementala krafterna som asagudarna kämpar för att hålla i schack. De bor i Jotunheim, bortom murarna av Asgård och Midgård. Trots deras antagonistiska roll har många gudar jätteblod eller tar jättegemåler, vilket suddar ut gränsen mellan gudomlig och uråldrigt.',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'family',
        unlockKey: 'Jätte'
    },
    'family_drake': {
        key: 'family_drake',
        name: 'Drake',
        category: 'vasen',
        englishDesc: 'Drakar (singular: drake) are the great serpentine dragons of Norse mythology and Northern European legend. In Norse tradition, dragons like Nidhögg and Fafner are deeply tied to cosmic forces: one gnaws at the roots of Yggdrasil while the other guards cursed gold. Unlike the winged European dragon, many Nordic dragons are described as great serpents or lindworms. The word "drake" shares its root with the Latin "draco" and the Greek "drakōn," meaning "serpent" or "one who gazes sharply."',
        swedishDesc: 'Drakar (singular: drake) är de stora ormliknande drakarna i nordisk mytologi och nordeuropeisk legend. I nordisk tradition är drakar som Nidhögg och Fafner djupt knutna till kosmiska krafter: en gnager på Yggdrasils rötter medan en annan vaktar förbannat guld. Till skillnad från den bevingade europeiska draken beskrivs många nordiska drakar som stora ormar eller lindormar. Ordet "drake" delar sin rot med latinets "draco" och grekiskans "drakōn", som betyder "orm" eller "den som stirrar skarpt."',
        source: 'Norse Mythology / European Folklore',
        heritage: 'European',
        unlockType: 'family',
        unlockKey: 'Drake'
    },

    // - -- Individual Väsen - --
    'vasen_landvatte': {
        key: 'vasen_landvatte',
        name: 'Landvätte',
        category: 'vasen',
        englishDesc: 'The Landvätte (land spirit) is the protector of a specific stretch of wilderness, hill, or natural landmark. In Old Norse sources, including the Heimskringla, King Odin commanded that all Viking ships approaching the Norwegian coast lower their dragon prows so as not to frighten the landvættr - the land spirits who protect the country. Swedish folk belief inherited this tradition, holding that disturbing a landvätte\'s territory would bring misfortune.',
        swedishDesc: 'Landvättet är skyddaren av ett specifikt naturområde, en kulle eller ett naturlandmärke. I fornnordiska källor, inklusive Heimskringla, befallde kung Oden att alla vikingaskepp som närmade sig den norska kusten skulle sänka sina drakstävar för att inte skrämma landvättrarna - landets andar som skyddar landet. Svensk folktro ärvde denna tradition och höll att störa ett landvätts territorium skulle föra olycka med sig.',
        source: 'Heimskringla (Snorri Sturluson) / Swedish Folklore',
        heritage: 'Scandinavian',
        unlockType: 'vasen',
        unlockKey: 'Landvatte'
    },
    'vasen_gardstomte': {
        key: 'vasen_gardstomte',
        name: 'Gårdstomte',
        category: 'vasen',
        englishDesc: 'The Gårdstomte (farm spirit) is the guardian of the farmstead - the barns, the livestock, the outbuildings, and the fields. It is depicted as a small, bearded, elderly man who works invisibly by night to keep the farm in order. The Gårdstomte demands an annual gift of a bowl of porridge (gröt) with a lump of butter on top; neglecting this offering invites disaster, as the tomte may torment the animals, spoil the milk, or move to another farm entirely.',
        swedishDesc: 'Gårdstomten är väktaren av gården - ladugårdarna, boskapen, uthusarna och åkrarna. Det skildras som en liten, skäggig, äldre man som arbetar osynligt om natten för att hålla gården i ordning. Gårdstomten kräver en årlig gåva av en skål gröt med en klick smör på toppen; att försumma detta erbjudande inbjuder till katastrof, då tomten kan plåga djuren, förstöra mjölken eller flytta till en annan gård helt och hållet.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Gardstomte'
    },
    'vasen_hustomte': {
        key: 'vasen_hustomte',
        name: 'Hustomte',
        category: 'vasen',
        englishDesc: 'The Hustomte (house spirit) is the beloved domestic guardian found in nearly every Swedish farmhouse tradition. It lives near the hearth or beneath the floorboards, silently watching over the family and their home. The Hustomte is especially associated with the Christmas season, when it traditionally received its most important offering: a bowl of warm sweet porridge (tomtegröt). The modern image of the Swedish Christmas gnome (Jultomte) descends directly from this ancient folk tradition.',
        swedishDesc: 'Hustomten är den älskade inhemska väktare som finns i nästan varje svensk gårdshustradition. Det bor nära spisen eller under golvbrädorna och vakar tyst över familjen och deras hem. Hustomten är speciellt förknippad med julsäsongen, när den traditionellt fick sitt viktigaste erbjudande: en skål varm söt gröt (tomtegröt). Den moderna bilden av den svenska julnissen (Jultomten) härstammar direkt från denna urgamla folktradition.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Hustomte'
    },
    'vasen_nattramn': {
        key: 'vasen_nattramn',
        name: 'Nattramn',
        category: 'vasen',
        englishDesc: 'The Nattramn (night raven) is a spectral bird of ill omen in Swedish folklore, believed to be the restless spirit of a builder who was walled alive into a foundation to strengthen it - a practice said to have occurred during the construction of churches and castles. Its shrieking cry heard at night was a death omen. In some traditions the nattramn has no flesh, only a skeleton of hollow bones, and if you could count all its feathers before dawn you would be protected from its curse.',
        swedishDesc: 'Nattramnen är en spöklika fågel av olycksanat i svensk folklore, tros vara anden av en byggare som murades levande in i ett fundament för att stärka det - en praktik som sägs ha förekommit under byggandet av kyrkor och slott. Dess skrikande läte hörd på natten var ett dödsomen. I vissa traditioner saknar nattramnen kött, bara ett skelett av ihåliga ben, och om man kunde räkna alla dess fjädrar före gryningen skulle man skyddas från dess förbannelse.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Nattramn'
    },
    'vasen_myling': {
        key: 'vasen_myling',
        name: 'Myling',
        category: 'vasen',
        englishDesc: 'The Myling (also "myrling" or "utbörding") is one of the most chilling figures in Swedish folklore: the spirit of an infant who was murdered or abandoned by its mother before receiving a name and a Christian burial. Condemned to wander the wilderness, it would leap onto the backs of lone travelers and demand to be carried to the nearest churchyard for proper burial. With each step toward the church, it grew heavier, often crushing its unwilling carrier. These spirits were the embodiment of infanticide\'s cultural shame.',
        swedishDesc: 'Mylingen (även "myrling" eller "utbörding") är en av de mest skrämmande figurerna i svensk folklore: anden av ett spädbarn som mördades eller övergavs av sin mor innan det fick ett namn och en kristen begravning. Dömt att vandra i vildmarken, hoppade det upp på ryggen av ensamma resenärer och krävde att bli buren till närmaste kyrkogård för en ordentlig begravning. Med varje steg mot kyrkan blev det tyngre, och krossade ofta sin ofrivillige bärare. Dessa andar var förkroppsligandet av barnamordens kulturella skam.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Myling'
    },
    'vasen_irrbloss': {
        key: 'vasen_irrbloss',
        name: 'Irrbloss',
        category: 'vasen',
        englishDesc: 'The Irrbloss (also "lyktgubbe" or "lyktemän") is the Swedish name for the will-o\'-wisp, the eerie hovering light seen over bogs and marshes. Folk belief held these lights to be the souls of sinful or dishonest men - surveyors who had falsified boundaries, cheats, and murderers - condemned to wander eternally between the living world and the realm of the dead. Those who followed the light would be led astray into bogs, quicksand, or over cliffs.',
        swedishDesc: 'Irrblossen (även "lyktgubbe" eller "lyktemän") är det svenska namnet på irrbloss, det kusliga svävande ljuset som ses över mossar och träsk. Folktron höll dessa ljus för att vara syndiga eller oärliga mäns själar - lantmätare som förfalskat gränser, bedragare och mördare - dömda att vandra evigt mellan de levandes värld och de dödas rike. De som följde ljuset skulle ledas vilse ut i mossar, kvicksand eller över stup.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Irrbloss'
    },
    'vasen_strandvaskare': {
        key: 'vasen_strandvaskare',
        name: 'Strandvaskare',
        category: 'vasen',
        englishDesc: 'The Strandvaskare (shore washer) is a coastal apparition in Swedish folklore, the tormented ghost of a drowned sailor eternally condemned to haunt the shoreline where it perished. It wails and lures ships toward the reef with deceptive lights and sounds. This figure shares similarities with the "Bean Nighe" (the washer at the ford) found in Celtic tradition and with the banshee - all representing a spectral harbinger encountered near water who portends death.',
        swedishDesc: 'Strandvaskaren är en kustlig uppenbarelse i svensk folklore, det plågade spöket av en drunknad sjöman, evigt dömt att spöka vid kuststräckan där det omkom. Det tjuter och lockar skepp mot revet med vilseledande ljus och ljud. Denna figur har likheter med "Bean Nighe" (tvätterskan vid vadet) i keltisk tradition och med banshee - alla representerande ett spöklikt varseldjur vid vatten som varslar om död.',
        source: 'Swedish Folklore / Comparative Folklore',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Strandvaskare'
    },
    'vasen_backahast': {
        key: 'vasen_backahast',
        name: 'Bäckahäst',
        category: 'vasen',
        englishDesc: 'The Bäckahäst (brook horse) is a supernatural water horse from Swedish folklore that lurks near rivers and streams in the guise of a beautiful, shimmering white stallion. Anyone who mounts it finds they cannot dismount - the horse then plunges into the water and drowns its rider. This creature is closely related to the Scottish kelpie and the Norwegian nykur. A common protective charm was to name the horse with the words "brook horse" aloud, breaking the spell.',
        swedishDesc: 'Bäckahästen är en övernaturlig vattenhäst från svensk folklore som lurar vid floder och bäckar i skepnad av en vacker, glänsande vit hingst. Den som sitter upp på den finner att de inte kan stiga av - hästen störtar sedan in i vattnet och drunknar sin ryttare. Denna varelse är nära besläktad med den skotska kelpien och den norska nykuren. En vanlig skyddsamulett var att namnge hästen med orden "bäckahäst" högt, vilket bröt förbannelsen.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Backahast'
    },
    'vasen_gloson': {
        key: 'vasen_gloson',
        name: 'Gloson',
        category: 'vasen',
        englishDesc: 'The Gloson (glowing sow) is a spectral pig from Swedish folklore, described as a monstrous sow with eyes of burning fire that runs silently through the night at supernatural speed. Encountering a gloson was considered an omen of death or disaster. It is found primarily in Swedish provincial traditions, particularly in Skåne and other southern regions. The creature is sometimes associated with the souls of women who had committed secret crimes in life.',
        swedishDesc: 'Glosonen (glödande sugga) är en spöklik gris från svensk folklore, beskriven som en monströs sugga med brinnande elögon som springer ljudlöst genom natten med övernaturlig hastighet. Att möta en gloson ansågs vara ett omen om död eller katastrof. Den återfinns främst i svenska provinstraditioner, särskilt i Skåne och andra sydliga regioner. Varelsen förknippas ibland med själarna av kvinnor som begått hemliga brott i livet.',
        source: 'Swedish Folklore (Skånsk tradition)',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Gloson'
    },
    'vasen_fenrir': {
        key: 'vasen_fenrir',
        name: 'Fenrir',
        category: 'vasen',
        englishDesc: 'The Fenris-wolf is the most terrifying of all wolves in Norse mythology, the monstrous son of Loki and the giantess Angrboda. The gods, fearful of a prophecy that Fenrir would kill Odin at Ragnarök, attempted to bind him with chains. He broke every chain of iron and rock until the dwarves forged Gleipnir - a magical ribbon made from impossible things. When Ragnarök comes, Fenrir will swallow the sun, break free, and swallow Odin himself.',
        swedishDesc: 'Fenrisulven är den mest skräckinjagande av alla ulvar i nordisk mytologi, det monstruösa barnet av Loke och jättinnan Angrböda. Gudarna, rädda för en profetia att Fenrir skulle döda Oden vid Ragnarök, försökte binda honom med kedjor. Han bröt varje järn- och stenkedja tills dvärgar smidde Gleipnir - ett magiskt band gjort av omöjliga ting. När Ragnarök kommer ska Fenrir svälja solen, frigöra sig och svälja Oden själv.',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Fenrir'
    },
    'vasen_rasvelg': {
        key: 'vasen_rasvelg',
        name: 'Räsvelg',
        category: 'vasen',
        englishDesc: 'Räsvelg ("corpse swallower") is a giant eagle who sits at the northern edge of the world in Norse cosmology. According to the Poetic Edda\'s poem Vafþrúðnismál, all the winds that blow across the world are created by the beating of Räsvelg\'s enormous wings. The giant eagle is positioned at the end of the world, gazing over all creation. It also plays a role in Eddic descriptions of Yggdrasil, where an eagle perches at the top of the World Tree.',
        swedishDesc: 'Räsvelg ("liksväljaren") är en gigantisk örn som sitter vid världens norra kant i nordisk kosmologi. Enligt den poetiska Eddans dikt Vafþrúðnismál skapas alla vindar som blåser över världen av Räsvelgs enorma vingeslag. Den jättelika örnen är placerad i världens ände och blickar ut över hela skapelsen. Den spelar också en roll i Eddiska beskrivningar av Yggdrasil, där en örn sitter vid toppen av Världsträdet.',
        source: 'Poetic Edda (Vafþrúðnismál)',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Rasvelg'
    },
    'vasen_bergatroll': {
        key: 'vasen_bergatroll',
        name: 'Bergatroll',
        category: 'vasen',
        englishDesc: 'The Bergatroll (mountain troll) is the classic giant troll of Scandinavian folklore: enormous, slow-witted, ferociously strong, and fond of gold and silver jewelry. Mountain trolls live inside hills and mountains, emerging at night to roam the land. Sunlight turns them instantly to stone - explaining why ancient boulders with unusual shapes are sometimes called "troll rocks" across Norway and Sweden. Some local traditions describe bergatroll as the corrupted spirits of ancient giants.',
        swedishDesc: 'Bergatrollet är det klassiska jättetrollet i skandinavisk folklore: enormt, tröghjärnat, fruktansvärt starkt och förtjust i guld- och silversmycken. Bergatroll bor inuti kullar och berg och ger sig ut nattetid för att ströva över landet. Solljus förvandlar dem omedelbart till sten - vilket förklarar varför urgamla klippblock med ovanliga former ibland kallas "trollstenar" i Norge och Sverige. Vissa lokala traditioner beskriver bergatroll som de fördärvade andarna av urgamla jättar.',
        source: 'Scandinavian Folklore',
        heritage: 'Scandinavian',
        unlockType: 'vasen',
        unlockKey: 'Bergatroll'
    },
    'vasen_skogstroll': {
        key: 'vasen_skogstroll',
        name: 'Skogstroll',
        category: 'vasen',
        englishDesc: 'The Skogstroll (forest troll) is smaller and more cunning than its mountain cousin, blending into the forest with camouflage of moss, bark, and soil. Swedish folk belief held forest trolls responsible for misleading travelers, stealing livestock, and abducting children to be raised underground. They are deeply connected to the ancient wilderness and regard human settlements as an intrusion. Their howls and strange noises heard at night were interpreted as troll communication echoing through the old forests.',
        swedishDesc: 'Skogstrollet är mindre och listigare än sin bergkusin och smälter in i skogen med kamouflage av mossa, bark och jord. Svensk folktro höll skogstroll ansvariga för att vilseleda resenärer, stjäla boskap och kidnappa barn för att uppfostras under jord. De är djupt kopplade till den urgamla vildmarken och betraktar mänskliga bosättningar som en inkräktning. Deras tjut och konstiga ljud som hörs på natten tolkades som trollkommunikation som ekar genom de gamla skogarna.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Skogstroll'
    },
    'vasen_bortbyting': {
        key: 'vasen_bortbyting',
        name: 'Bortbyting',
        category: 'vasen',
        englishDesc: 'The Bortbyting (changeling) is the troll or fairy child secretly swapped into a human cradle while the real infant is stolen away. The changeling is recognizable by its sickly appearance, excessive demands for food, and sinister, knowing eyes despite its infant appearance. Folk remedies to recover a stolen child were often elaborate and sometimes cruel, based on the belief that causing sufficient discomfort to the changeling would force the hidden folk to return the real child.',
        swedishDesc: 'Bortbytingen är trollets eller älvans barn som i hemlighet bytts in i en mänsklig vagga medan det riktiga spädbarnet stulits. Bortbytingen känns igen på sitt sjukliga utseende, överdrivna krav på mat och onda, vetande ögon trots sitt spädbarnsutseende. Folkliga botemedel för att återfå ett stulet barn var ofta utarbetade och ibland grymma, baserade på tron att orsaka tillräckligt obehag för bortbytingen skulle tvinga de dolda folken att återlämna det riktiga barnet.',
        source: 'Scandinavian Folklore',
        heritage: 'Scandinavian',
        unlockType: 'vasen',
        unlockKey: 'Bortbyting'
    },
    'vasen_gruvra': {
        key: 'vasen_gruvra',
        name: 'Gruvrå',
        category: 'vasen',
        englishDesc: 'The Gruvrå (mine spirit) is the female warden of the mine - a beautiful, pale woman who may appear as a benevolent guide or a deadly seductress depending on the miner\'s behavior. Sweden\'s long mining history, particularly in the Bergslagen region, gave rise to a rich tradition of mine spirits. Miners would leave offerings and observe strict protocols: never whistle underground, never speak of the rå directly, and always treat the mine\'s resources with respect. The German Berggeist is closely related.',
        swedishDesc: 'Gruvrån är gruvans väktaranda - en vacker, blek kvinna som kan framstå som en välvillig guide eller en dödlig förförerska beroende på gruvarbetarens beteende. Sveriges långa gruvhistoria, särskilt i Bergslagenregionen, gav upphov till en rik tradition av gruvandarna. Gruvarbetare lämnade erbjudanden och iakttog strikta protokoll: vissla aldrig under jord, tala aldrig om rån direkt, och behandla alltid gruvans resurser med respekt. Den tyske Berggeisten är nära besläktad.',
        source: 'Swedish Folklore (Bergslagen)',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Gruvra'
    },
    'vasen_skogsra': {
        key: 'vasen_skogsra',
        name: 'Skogsrå',
        category: 'vasen',
        englishDesc: 'The Skogsrå (forest warden) is one of the most prominent figures in Swedish folklore - a hauntingly beautiful woman who guards the forest and can enchant any hunter or woodsman who ventures into her domain. Her most distinctive feature is her hollow back, often described as looking like a rotten tree trunk, and sometimes a cow\'s tail. Hunters who pleased the skogsrå might find exceptional luck; those who angered her would become hopelessly lost. She is sometimes called "huldra" in Norwegian tradition.',
        swedishDesc: 'Skogsrån är en av de mest framträdande figurerna i svensk folklore - en spöklikt vacker kvinna som vaktar skogen och kan förhäxa vilken jägare eller skogsarbetare som helst som ger sig in i hennes domän. Hennes mest utmärkande drag är hennes ihåliga rygg, ofta beskriven som liknande en rutten trädstam, och ibland en kosvans. Jägare som behagade skogsrån kunde hitta exceptionell tur; de som förgrymmade henne skulle bli hopplöst vilse. Hon kallas ibland "huldra" i norsk tradition.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Skogsra'
    },
    'vasen_nacken': {
        key: 'vasen_nacken',
        name: 'Näcken',
        category: 'vasen',
        englishDesc: 'Näcken is a male water spirit who sits by rivers, streams, and lake shores playing an entrancing violin or fiddle. His music is said to be supernaturally beautiful - so beautiful that listeners cannot stop dancing until they die. He can be propitiated with offerings of schnapps, meat, or tobacco, after which he may teach the listener to play with equal mastery. In some accounts he appears as a handsome young man; in others as a horse or a log drifting in the water.',
        swedishDesc: 'Näcken är en manlig vattenande som sitter vid floder, bäckar och sjöstränder och spelar en förtjusande fiol eller violin. Hans musik sägs vara övernaturligt vacker - så vacker att lyssnare inte kan sluta dansa tills de dör. Han kan blidkas med erbjudanden om sprit, kött eller tobak, varefter han kan lära lyssnaren att spela med lika stor skicklighet. I vissa berättelser framstår han som en stilig ung man; i andra som en häst eller en stock som flyter i vattnet.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Nacken'
    },
    'vasen_alva': {
        key: 'vasen_alva',
        name: 'Älva',
        category: 'vasen',
        englishDesc: 'The Swedish Älva (plural: älvor) are small, ethereal beings strongly associated with dew, mist, and the half-light of dusk and dawn. Unlike the majestic Norse álfar, the Swedish folkloristic älva is more akin to a fairy - tiny, dancing in meadows, and capricious. Contact with älvor was believed to cause "älvablåst" (elf-blast), a sudden illness explained as being breathed upon by an elf. Circular impressions in the morning dew were called "älvringar" (elf rings), believed to mark where älvor had danced.',
        swedishDesc: 'Den svenska Älvan (plural: älvor) är liten, eterisk och starkt förknippad med dagg, dimma och halvljuset vid skymning och gryning. Till skillnad från de majestätiska fornnordiska álfarna liknar den folkloristiska svenska älvan mer en fe - liten, dansande på ängar och nyckfull. Kontakt med älvor troddes orsaka "älvablåst", en plötslig sjukdom förklarad som att bli andad på av en älva. Cirkulära intryck i morgondaggen kallades "älvringar", trodda markera var älvor hade dansat.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'vasen',
        unlockKey: 'Alva'
    },
    'vasen_svartalv': {
        key: 'vasen_svartalv',
        name: 'Svartalv',
        category: 'vasen',
        englishDesc: 'The Svartálfar (dark elves) are the master craftsmen of Norse mythology, living underground in Svartálfaheimr. They are distinguished by their extraordinary skill in smithing and forging magical artifacts. According to the Prose Edda, the Svartálfar forged some of the most important objects in Norse myth: Gleipnir (the magical ribbon binding Fenrir), Gungnir (Odin\'s spear), Mjölnir (Thor\'s hammer), and Draupnir (Odin\'s self-replicating gold ring). They are sometimes identified with the dwarves of Norse mythology.',
        swedishDesc: 'Svartálfarna (mörka alver) är nordisk mytologis mästarhantverkare och bor under jord i Svartálfaheimr. De utmärks av sin extraordinära skicklighet i smidning och skapande av magiska föremål. Enligt Prosa-Eddan smidde Svartálfarna några av de viktigaste föremålen i nordisk myt: Gleipnir (det magiska bandet som binder Fenrir), Gungnir (Odins spjut), Mjölnir (Tors hammare) och Draupnir (Odins självreproducerande guldring). De identifieras ibland med dvärgarna i nordisk mytologi.',
        source: 'Prose Edda (Snorri Sturluson)',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Svartalv'
    },
    'vasen_ljusalv': {
        key: 'vasen_ljusalv',
        name: 'Ljusalv',
        category: 'vasen',
        englishDesc: 'The Light Elves (Swedish: Ljusalver) dwell in Alfheim, described in the Prose Edda as the most beautiful of realms. Snorri Sturluson describes them as "more radiant than the sun in appearance," aligning them with light, fertility, goodness, and the Vanir gods. Their realm was given as a gift to the god Freyr. While the exact nature of Light Elves remains somewhat mysterious in the sources, they represent the benevolent, life-affirming face of elven beings in Norse cosmology.',
        swedishDesc: 'Ljusalverna bor i Alfheim, beskrivet i Prosa-Eddan som det vackraste av riken. Snorri Sturluson beskriver dem som "mer strålande än solen i utseende", vilket kopplar dem till ljus, fruktbarhet, godhet och Vanirgudar. Deras rike gavs som gåva till guden Frej. Medan ljusalvernas exakta natur förblir något mystisk i källorna, representerar de det välvilliga, livsbejakande ansiktet av älvavarelser i nordisk kosmologi.',
        source: 'Prose Edda (Snorri Sturluson)',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Ljusalv'
    },
    'vasen_hyllemor': {
        key: 'vasen_hyllemor',
        name: 'Hyllemor',
        category: 'vasen',
        englishDesc: 'Hyldemor (the Elder Mother) is the spirit inhabiting the elder tree (Sambucus nigra), found across Scandinavian and British Isles folk tradition. Before cutting any elder wood, one must ask the Elder Mother\'s permission aloud and wait for her consent. Failure to do so brings extreme misfortune: illness, broken furniture made from the wood, and even death. The elder tree was considered sacred across much of Northern Europe, and its white flowers and dark berries were used in protective charms and medicine.',
        swedishDesc: 'Hyllemor (äldermoder) är anden som bor i fläderträdet (Sambucus nigra), funnen i skandinavisk och brittisk folktradition. Innan man hugger något fläderträ måste man högt be om Hyllemors tillstånd och vänta på hennes samtycke. Underlåtenhet att göra detta ger extrem olycka: sjukdom, trasiga möbler gjorda av träet, och till och med döden. Fläderträdet betraktades som heligt i stora delar av Nordeuropa, och dess vita blommor och mörka bär användes i skyddsbesvärjelser och medicin.',
        source: 'Scandinavian and British Folklore',
        heritage: 'Scandinavian',
        unlockType: 'vasen',
        unlockKey: 'Hyllemor'
    },
    'vasen_einharje': {
        key: 'vasen_einharje',
        name: 'Einhärje',
        category: 'vasen',
        englishDesc: 'The Einherjar ("lone fighters" or "those who fight alone") are the chosen warriors who died gloriously in battle and were escorted by the Valkyries to Valhalla in Asgard. Each day they fight one another in glorious combat; each evening their wounds heal and they feast together on the flesh of Saehrimnir, the ever-replenishing boar, washed down with mead flowing from the udder of the goat Heidrun. They train endlessly for their ultimate purpose: fighting alongside the gods at Ragnarök.',
        swedishDesc: 'Einhärjarna ("ensamma kämpar" eller "de som kämpar ensamma") är de utvalda krigarna som dog ärofullt i strid och eskorterades av Valkyrior till Valhall i Asgård. Varje dag kämpar de mot varandra i ärofullt strid; varje kväll läker deras sår och de festar tillsammans på Särimners kött, den evigt förnyande galten, nedspolt med mjöd som flödar från getens Heidrun juver. De tränar oavbrutet för sitt yttersta syfte: att kämpa sida vid sida med gudarna vid Ragnarök.',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Einharje'
    },
    'vasen_valkyria': {
        key: 'vasen_valkyria',
        name: 'Valkyria',
        category: 'vasen',
        englishDesc: 'The Valkyrjur (Valkyries - "choosers of the slain") are the divine shieldmaidens who ride over battlefields at Odin\'s command, selecting which warriors shall die and which shall live. They escort the chosen fallen to Valhalla, where the warriors become Einherjar. Valkyries appear as armored maidens riding through the sky and across the rainbow bridge Bifröst. In later Romantic tradition they became idealized warrior-women, but in older sources they are often portrayed as fearsome and inexorable agents of fate.',
        swedishDesc: 'Valkyriorna (Valkyrior - "de stupades väljerskor") är de gudomliga sköldemöarna som rider över slagfält på Odens befallning och väljer vilka krigare som ska dö och vilka som ska leva. De eskorterar de valda fallna till Valhall, där krigarna blir Einhärjar. Valkyrior framstår som rustade möar som rider genom himlen och över regnbågsbron Bifröst. I den senare romantiska traditionen blev de idealiserade krigarkvinnor, men i äldre källor framstår de ofta som fruktansvärda och orubbliga ödesagenter.',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Valkyria'
    },
    'vasen_jotun': {
        key: 'vasen_jotun',
        name: 'Jotun',
        category: 'vasen',
        englishDesc: 'The Jötnar (singular: Jötunn) are the primordial giants of Norse cosmology - ancient, immense beings who represent the raw chaos that the Aesir gods constantly battle to contain. They inhabited Jotunheim beyond the great barrier of Midgard. Despite their role as antagonists, the line between gods and giants is surprisingly blurred: Odin, Thor, and Freyr all have jötunn ancestry, and many jötnar are depicted as wise counselors rather than mindless brutes. Their name may derive from a word meaning "devourer."',
        swedishDesc: 'Jötnar (singular: Jötunn) är nordisk kosmologis uråldrigt jättar - urgamla, enorma varelser som representerar det råa kaoset som asagudarna ständigt kämpar för att hålla i schack. De bebodde Jotunheim bortom den stora barriären av Midgård. Trots sin roll som antagonister är gränsen mellan gudar och jättar förvånansvärt suddig: Oden, Tor och Frej har alla jätteursprung, och många jötnar skildras som visa rådgivare snarare än tanklösa bruter. Deras namn kan härledas från ett ord som betyder "slukare."',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Jotun'
    },
    'vasen_eldturs': {
        key: 'vasen_eldturs',
        name: 'Eldturs',
        category: 'vasen',
        englishDesc: 'The Eldjötnar (fire giants) are beings of flame from Muspelheim, the primordial realm of fire in Norse cosmology. Led by the giant Surtr ("the black one"), they are destined to march forth at Ragnarök and set the world ablaze, consuming gods and men alike. In the beginning of time, the sparks and embers that flew from Muspelheim into the primordial void of Ginnungagap helped ignite the process of creation itself when they met the ice of Niflheim.',
        swedishDesc: 'Eldjötnarna (eldjättar) är eldvarelser från Muspelheim, det uråldrigt eldriket i nordisk kosmologi. Ledda av jätten Surtr ("den svarte") är de avsedda att marschera fram vid Ragnarök och sätta världen i brand, konsumerande gudar och människor lika. I tidens begynnelse hjälpte gnistor och glöd som flög från Muspelheim in i Ginnungagaps urtomma void till att tända igång skapelsens process när de mötte Niflheims is.',
        source: 'Prose Edda (Snorri Sturluson)',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Eldturs'
    },
    'vasen_rimturs': {
        key: 'vasen_rimturs',
        name: 'Rimturs',
        category: 'vasen',
        englishDesc: 'The Rimtursar (frost giants or rime-thurses) are the oldest of all giants, formed from the ice and rime of Niflheim, the primordial realm of cold. Ymir, the first being, arose from the drops where the ice of Niflheim met the heat of Muspelheim, and from Ymir came the first frost giants. They represent the cold, desolate face of chaos in Norse cosmology, and their eternal conflict with the gods of Asgard shapes the mythological world.',
        swedishDesc: 'Rimtursarna (rimjättar eller rimtursar) är de äldsta av alla jättar, formade av Niflheims is och rimfrost, det urtida riket av köld. Ymir, det första väsendet, uppstod ur dropparna där Niflheims is mötte Muspelheims värme, och från Ymir kom de första rimjättarna. De representerar kaosens kalla, ödsliga ansikte i nordisk kosmologi, och deras eviga konflikt med Asgårds gudar formar den mytologiska världen.',
        source: 'Prose Edda (Snorri Sturluson)',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Rimturs'
    },
    'vasen_lindorm': {
        key: 'vasen_lindorm',
        name: 'Lindorm',
        category: 'vasen',
        englishDesc: 'The Lindorm (from Old Norse "linnormr") is a great wingless serpentine dragon of Scandinavian folklore, distinguished from the fire-breathing European dragon by its serpentine form. Lindorms appear throughout Swedish folk ballads and fairy tales, often as cursed princes or as terrifying beasts slain by heroes. One of the most famous Swedish folk tales, "Prins Lindorm," tells of a prince cursed to live as a serpent who can only be freed through love and sacrifice. Lindorms were associated with the deep forests.',
        swedishDesc: 'Lindormen (från fornnordiskans "linnormr") är en stor, vinglos ormlik drake i skandinavisk folklore, skild från den eldsprutande europeiska draken genom sin ormlika form. Lindormar förekommer i svenska folkballader och sagor, ofta som förhäxade prinsar eller som skräckinjagande odjur dödade av hjältar. En av de mest kända svenska folksagorna, "Prins Lindorm", berättar om en prins förhäxad att leva som en orm som bara kan befrias genom kärlek och uppoffring. Lindormar förknippades med de djupa skogarna.',
        source: 'Swedish Folklore / Folk Ballads',
        heritage: 'Northern European',
        unlockType: 'vasen',
        unlockKey: 'Lindorm'
    },
    'vasen_fafner': {
        key: 'vasen_fafner',
        name: 'Fafner',
        category: 'vasen',
        englishDesc: 'Fafner was originally a dwarf - the son of Reidmar - who killed his own father for the cursed gold hoard of the dwarf Andvari. The greed and power of the treasure transformed him into a monstrous dragon guarding the gold on Gnitahed. He was slain by the hero Sigurd, who was advised by the bird Reginn to consume Fafner\'s heart to gain great wisdom and the ability to understand the speech of birds. His hoard included the ring Andvaranaut, which carried Andvari\'s terrible curse.',
        swedishDesc: 'Fafner var ursprungligen en dvärg - son till Reidmar - som dödade sin egen far för den förbannade guldskattens skull tillhörande dvärgen Andvari. Skatten girighet och kraft förvandlade honom till en monströs drake som vaktar guldet på Gnitahed. Han dräptes av hjälten Sigurd, som av fågeln Reginn rådes att förtära Fafners hjärta för att erhålla stor visdom och förmågan att förstå fåglars tal. Hans skatt inkluderade ringen Andvaranaut, som bar Andvaris fruktansvärda förbannelse.',
        source: 'Völsunga saga / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Fafner'
    },
    'vasen_jormungandr': {
        key: 'vasen_jormungandr',
        name: 'Jörmungandr',
        category: 'vasen',
        englishDesc: 'Jörmungandr (the Midgard Serpent) is the vast sea serpent whose coils encircle all of Midgard (the world of humans), lying in the great ocean and biting its own tail - making it an Ouroboros, a symbol of cyclical eternity. It is the child of Loki and the giantess Angrboda. Thor and Jörmungandr are destined nemeses: at Ragnarök, Thor will slay the serpent but walk only nine steps before dying from its venom. The famous tale of Thor fishing for Jörmungandr with a giant ox-head appears in the poem Hymiskviða.',
        swedishDesc: 'Jörmungandr (Midgårdsslangen) är den enorma havsorm vars ringlar omger hela Midgård (människornas värld), vilande i det stora havet och bitande sin egen svans - vilket gör det till en Ouroboros, en symbol för cyklisk evighet. Det är barnet av Loke och jättinnan Angrböda. Tor och Jörmungandr är ödets fiender: vid Ragnarök ska Tor döda ormen men bara gå nio steg innan han dör av dess gift. Den berömda sagan om Tor som fiskar efter Jörmungandr med ett jättehuvud av oxe finns i dikten Kvädet om Hymer.',
        source: 'Poetic Edda (Kvädet om Hymer) / Prose Edda',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Jormungandr'
    },
    'vasen_nidhogg': {
        key: 'vasen_nidhogg',
        name: 'Nidhögg',
        category: 'vasen',
        englishDesc: 'Nidhögg ("malice striker" or "he who strikes with malice") is a great dragon or serpent who eternally gnaws at the roots of Yggdrasil, the cosmic World Tree that holds the nine realms together. Its ceaseless gnawing is an act of cosmic dissolution - a constant threat to the fabric of existence. At Ragnarök, Nidhögg will fly with corpses on its wings across the ruined landscape. It is described in the poem Völuspá as surviving the end of the world, suggesting it belongs to whatever comes after.',
        swedishDesc: 'Nidhögg ("skadestrikaren" eller "han som slår med illvilja") är en stor drake eller orm som evigt gnager på Yggdrasils rötter, det kosmiska Världsträdet som håller samman de nio världarna. Dess ständiga gnagande är en handling av kosmisk upplösning - ett ständigt hot mot existensens väv. Vid Ragnarök ska Nidhögg flyga med lik på sina vingar över det sönderfallna landskapet. Det beskrivs i dikten Völuspá som att överleva världens undergång, vilket antyder att det tillhör vad som än kommer efter.',
        source: 'Poetic Edda (Völuspá)',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Nidhogg'
    },

    // =========================================================================
    // CATEGORY: ITEMS
    // =========================================================================

    'item_broken_chain': {
        key: 'item_broken_chain',
        name: 'Broken Chain',
        swedishName: 'Bruten Kedja (Broken Chain)',
        category: 'items',
        englishDesc: 'The chains used to bind Fenrir were forged by the dwarves at the gods\' request - but Fenrir broke every iron and rock chain they made. The dwarves then forged Gleipnir, a magical ribbon made from six impossible things: the sound of a cat\'s footsteps, the beard of a woman, the roots of a mountain, the sinews of a bear, the breath of a fish, and the spittle of a bird. Fenrir agreed to be bound only if a god placed a hand in his mouth as surety - Tyr sacrificed his hand to accomplish it. Only a fragment of a broken chain remains as a relic.',
        swedishDesc: 'Kedjorna som användes för att binda Fenrir smiddes av dvärgar på gudarnas begäran - men Fenrir bröt varje järn- och stenkedja de tillverkade. Dvärgar smidde sedan Gleipnir, ett magiskt band gjort av sex omöjliga ting: ljudet av en katts fotsteg, en kvinnas skägg, ett bergs rötter, en björns senor, en fisks andedräkt och en fågels saliv. Fenrir gick med på att bindas bara om en gud lade sin hand i hans mun som säkerhet - Tyr offrade sin hand för att åstadkomma det. Bara ett fragment av en bruten kedja kvarstår som relikt.',
        source: 'Prose Edda (Snorri Sturluson)',
        heritage: 'Norse',
        unlockType: 'item',
        unlockKey: 'Broken Chain'
    },
    'item_festive_midsommarkrans': {
        key: 'item_festive_midsommarkrans',
        name: 'Festive Midsommarkrans',
        category: 'items',
        englishDesc: 'The Midsommarkrans (midsummer wreath) is one of the most beloved symbols of the Swedish Midsummer celebration (Midsommar). Young women traditionally wove wreaths of wildflowers and placed them on their heads; a wreath made of seven different flowers picked in silence and placed under the pillow was said to make you dream of your future spouse. Midsommar itself is rooted in ancient pagan fertility traditions connected to the summer solstice, later blended with Christian feast days.',
        swedishDesc: 'Midsommarkransen är ett av de mest älskade symbolerna för den svenska Midsommarfirandet. Unga kvinnor vävde traditionellt kransar av vilda blommor och placerade dem på sina huvuden; en krans gjord av sju olika blommor plockade i tystnad och placerade under kudden sades göra att man drömde om sin framtida make. Midsommar självt är rotat i urgamla hedniska fruktbarhetstraditioner kopplade till sommarsolståndet, senare blandat med kristna högtidsdagar.',
        source: 'Swedish Folk Tradition',
        heritage: 'Swedish',
        unlockType: 'item',
        unlockKey: 'Festive Midsommarkrans'
    },
    'item_fishing_hook': {
        key: 'item_fishing_hook',
        name: 'Fishing Hook',
        swedishName: 'Fiskkrok (Fishing Hook)',
        category: 'items',
        englishDesc: 'The Hymiskviða (Song of Hymir) in the Poetic Edda tells of Thor\'s famous fishing expedition with the giant Hymir. Using the head of Hymir\'s ox as bait on an enormous hook, Thor cast his line into the ocean and caught Jörmungandr, the Midgard Serpent. He hauled the serpent to the surface, and the two stared into each other\'s eyes - their destined final battle almost occurring centuries before Ragnarök. Hymir panicked and cut the line, letting the serpent sink back into the depths.',
        swedishDesc: 'Kvädet om Hymer i den poetiska Eddan berättar om Tors berömda fiskeexpedition med jätten Hymir. Med huvudet av Hymirs oxe som bete på en enorm krok kastade Tor sin lina i havet och fångade Jörmungandr, Midgårdsslangen. Han drog upp ormen till ytan, och de två stirrade in i varandras ögon - deras bestämda sista strid nästan inträffande århundraden före Ragnarök. Hymir fick panik och klippte linan, vilket lät ormen sjunka tillbaka till djupet.',
        source: 'Poetic Edda (Kvädet om Hymer)',
        heritage: 'Norse',
        unlockType: 'item',
        unlockKey: 'Fishing Hook'
    },
    'item_warm_tomtegrot': {
        key: 'item_warm_tomtegrot',
        name: 'Warm Tomtegröt',
        swedishName: 'Varm Tomtegröt (Warm Tomtegrot)',
        category: 'items',
        englishDesc: 'The Christmas porridge (julgröt or tomtegröt) is the traditional offering given to the household tomte (house spirit) at Yuletide. Swedish families would place a bowl of warm rice or barley porridge with a generous pat of butter in the barn or by the hearth on Christmas Eve. Neglecting this ritual risked angering the tomte, who might then harm the livestock, sour the milk, or cause general misfortune throughout the year. The tradition remains alive symbolically in modern Swedish Christmas culture through the Jultomte (Father Christmas).',
        swedishDesc: 'Julgröten (tomtegröt) är det traditionella erbjudandet till hushållets tomte vid juletid. Svenska familjer lade en skål varm ris- eller korngrynsgröt med ett generöst smörklick i ladan eller vid spisen på julafton. Att försumma detta ritual riskerade att reta tomten, som sedan kunde skada boskapen, sura mjölken eller orsaka allmänt elände under hela året. Traditionen lever kvar symboliskt i modern svensk julkultur genom Jultomten.',
        source: 'Swedish Folk Tradition',
        heritage: 'Swedish',
        unlockType: 'item',
        unlockKey: 'Warm Tomtegrot'
    },
    'item_valhalla_pork': {
        key: 'item_valhalla_pork',
        name: 'Valhalla Pork',
        swedishName: 'Valhallafläsk (Valhalla Pork)',
        category: 'items',
        englishDesc: 'The boar Saehrimnir is the magical beast of Valhalla described in the Prose Edda: each day the cook Andhrimnir slaughters it and boils it in the great cauldron Eldhrimnir, and each evening the animal is restored completely to life to be slaughtered again the next day. This provides the Einherjar with inexhaustible meat for their nightly feasts. The ever-renewing nature of Saehrimnir reflects the Norse concept of cyclical regeneration and the abundance enjoyed by the honored dead in Valhalla.',
        swedishDesc: 'Galten Särimner är Valhallas magiska djur beskrivet i Prosa-Eddan: varje dag slaktar kocken Andhrimnir den och kokar den i den stora kitteln Eldhrimnir, och varje kväll återställs djuret fullständigt till livet för att slaktas igen nästa dag. Detta ger Einhärjarna med outtömligt kött för sina nattliga fester. Särimners evigt förnyande natur speglar det nordiska konceptet om cyklisk förnyelse och det överflöd som de ärade döda åtnjuter i Valhalla.',
        source: 'Prose Edda (Snorri Sturluson)',
        heritage: 'Norse',
        unlockType: 'valhalla'
    },
    'item_burial_flowers': {
        key: 'item_burial_flowers',
        name: 'Burial Flowers',
        swedishName: 'Begravningsblommor (Burial Flowers)',
        category: 'items',
        englishDesc: 'In Swedish folk belief, an infant who died without baptism - especially one murdered or abandoned - could not pass on to rest and instead became a Myling. The only way to free such a spirit was to give it a proper Christian burial in consecrated ground, complete with the appropriate rites. Flowers placed on a grave were seen as both an offering to the deceased and as a marker for the living - confirming that the dead had been properly honored and laid to rest.',
        swedishDesc: 'I svensk folktro kunde ett spädbarn som dog utan dop - särskilt ett som mördats eller övergivits - inte gå vidare till vila och blev istället ett myling. Det enda sättet att befria en sådan ande var att ge den en ordentlig kristen begravning på vigd mark, komplett med lämpliga riter. Blommor placerade på en grav sågs både som ett erbjudande till den döde och som ett märke för de levande - som bekräftar att de döda hedrats och lagts till ro på rätt sätt.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'item',
        unlockKey: 'Burial Flowers'
    },
    'item_yggdrasil_root': {
        key: 'item_yggdrasil_root',
        name: 'Yggdrasil Root',
        swedishName: 'Yggdrasilrot (Yggdrasil Root)',
        category: 'items',
        englishDesc: 'Yggdrasil ("Ygg\'s steed" - Ygg being one of Odin\'s names) is the immense ash tree at the center of Norse cosmology that connects all nine realms. Its three roots reach to Asgard (where a well of wisdom lies), to Jotunheim (where Mimir\'s Well holds cosmic knowledge), and to Niflheim (where Nidhögg endlessly gnaws). The gods hold their daily council at Yggdrasil. A fragment of its root gnawed by Nidhögg carries the energy of the cosmos itself.',
        swedishDesc: 'Yggdrasil ("Yggs sto" - Ygg är ett av Odens namn) är det enorma askträdet i centrum av nordisk kosmologi som förbinder alla nio världar. Dess tre rötter sträcker sig till Asgård (där en visdomsbrunn finns), till Jotunheim (där Mimers brunn håller kosmisk kunskap) och till Niflheim (där Nidhögg oavbrutet gnager). Gudarna håller sina dagliga råd vid Yggdrasil. Ett fragment av dess rot gnagt av Nidhögg bär kosmosets energi.',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'item',
        unlockKey: 'Yggdrasil Root'
    },
    'item_anvil_shard': {
        key: 'item_anvil_shard',
        name: 'Anvil Shard',
        swedishName: 'Städskärva (Anvil Shard)',
        category: 'items',
        englishDesc: 'The art of smithing held near-sacred status in Norse and Germanic cultures - the smith who could work metal was seen as wielding power over creation itself. The mythological smiths par excellence were the Svartálfar (dark elves or dwarves), whose anvils rang in the deep places of the earth. Their greatest works - Mjölnir, Gungnir, the ship Skidbladnir - were gifts to the gods. A shard of a dwarven anvil carries the resonance of that ancient, transformative craft.',
        swedishDesc: 'Smideskonsten hade nästan helig status i nordisk och germansk kultur - smeden som kunde arbeta metall sågs som en som utövade makt över skapelsen själv. De mytologiska smederna par excellence var Svartalverna (mörka alver eller dvärgar), vars städ ringde i jordens djupa platser. Deras bästa verk - Mjölnir, Gungnir, skeppet Skidbladnir - var gåvor till gudarna. En skärva av ett dvärgskt städ bär resonansen av det urgamla, transformativa hantverket.',
        source: 'Norse Mythology',
        heritage: 'Norse / Germanic',
        unlockType: 'item',
        unlockKey: 'Anvil Shard'
    },

    // =========================================================================
    // CATEGORY: LOCATIONS
    // =========================================================================

    'location_trollskogen': {
        key: 'location_trollskogen',
        name: 'Trollskogen',
        category: 'locations',
        englishDesc: 'Trollskogen ("Troll Forest") evokes the ancient Swedish tradition of the enchanted deep forest - a space outside civilized order where dangerous beings dwell and human rules cease to apply. Swedish folklore is filled with accounts of people entering old-growth forests and encountering trolls, rå, and other beings. The forest canopy blocking sunlight was particularly associated with danger, as sunlight was the primary protection against many supernatural threats. Several real locations in Sweden bear this name, most famously on the island of Öland.',
        swedishDesc: 'Trollskogen åkallar den urgamla svenska traditionen av den förtrollade djupskogen - ett rum utanför civilisationens ordning där farliga varelser bor och mänskliga regler upphör att gälla. Svensk folklore är fylld med berättelser om människor som gick in i urskogen och stötte på troll, rå och andra varelser. Skogens baldakin som blockerade solljuset var särskilt förknippad med fara, eftersom solljuset var det primära skyddet mot många övernaturliga hot. Flera verkliga platser i Sverige bär detta namn, mest känt på ön Öland.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'zone',
        unlockKey: 'TROLLSKOGEN'
    },
    'location_ginnungagap': {
        key: 'location_ginnungagap',
        name: 'Ginnungagap',
        category: 'locations',
        englishDesc: 'Ginnungagap ("the yawning void" or "the gap of gaps") is the primordial empty space that existed before creation in Norse cosmology. It lay between the realm of ice (Niflheim) to the north and the realm of fire (Muspelheim) to the south. When the cold of Niflheim and the heat of Muspelheim met in the middle of Ginnungagap, the ice melted and dripped, and from those drops came Ymir, the first giant, and Audhumbla, the great cow who nourished him. From this collision of opposites, all existence emerged.',
        swedishDesc: 'Ginnungagap ("det gäspande tomrummet" eller "springornas springor") är det uråldrigt tomma utrymme som existerade före skapelsen i nordisk kosmologi. Det låg mellan isriket (Niflheim) i norr och eldriket (Muspelheim) i söder. När Niflheims köld och Muspelheims hetta möttes i mitten av Ginnungagap smälte isen och droppade, och från dessa droppar kom Ymer, den förste jätten, och Audhumbla, den stora kon som närade honom. Från denna kollision av motsatser uppstod all existens.',
        source: 'Prose Edda (Snorri Sturluson)',
        heritage: 'Norse',
        unlockType: 'zone',
        unlockKey: 'GINNUNGAGAP'
    },
    'location_sacred_well': {
        key: 'location_sacred_well',
        name: 'Sacred Wells',
        swedishName: 'Heliga Källor (Sacred Wells)',
        category: 'locations',
        englishDesc: 'Sacred springs (heliga källor or offerkällor - "offering sources") are one of the oldest and most widespread forms of folk religious practice in Sweden and Scandinavia. Natural springs were seen as places where the boundary between the human world and the realm of spirits was especially thin. Offerings - coins, pins, rags, flowers - were cast into the water in exchange for healing, luck, or divine intercession. Many sacred springs became associated with specific saints after Christianization, but the practice itself is far older, rooted in pre-Christian reverence for water as a sacred element.',
        swedishDesc: 'Heliga källor (offerkällor) är en av de äldsta och mest spridda formerna av folklig religionsutövning i Sverige och Skandinavien. Naturliga källor sågs som platser där gränsen mellan människovärlden och andarnas rike var särskilt tunn. Föremål - mynt, nålar, trasor, blommor - kastades i vattnet i utbyte mot helande, tur eller gudomlig förbön. Många heliga källor kom att förknippas med specifika helgon efter kristnandet, men seden i sig är mycket äldre, rotad i förkristen vördnad för vatten som ett heligt element.',
        source: 'Swedish Folk Religion / Scandinavian Archaeology',
        heritage: 'Swedish',
        unlockType: 'zone',
        unlockKey: 'GLIMRANDE_KALLAN'
    },
    'location_valhalla': {
        key: 'location_valhalla',
        name: 'Valhalla',
        swedishName: 'Valhall',
        category: 'locations',
        englishDesc: 'Valhalla ("the hall of the slain") is Odin\'s majestic hall in Asgard, where the Einherjar feast and train for Ragnarök. It is described in the Prose Edda as having 540 doors, each wide enough for 800 warriors to march through abreast. Its roof is made of golden shields and its rafters of spears. The Valkyries serve the mead and the ever-renewed flesh of Saehrimnir. Valhalla represents the Norse ideal of the warrior afterlife - an eternity of glorious combat and feasting rather than peaceful rest.',
        swedishDesc: 'Valhall ("de stupadenas sal") är Odens majestätiska sal i Asgård, där Einhärjarna festar och tränar för Ragnarök. Det beskrivs i Prosa-Eddan som att ha 540 dörrar, var och en tillräckligt bred för 800 krigare att marschera igenom i bredd. Dess tak är gjort av gyllene sköldar och dess takbjälkar av spjut. Valkyrior serverar mjödet och Särimners evigt förnyade kött. Valhall representerar det nordiska idealet om krigarens efterliv - en evighet av ärofullt strid och festande snarare än fridfull vila.',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'valhalla'
    },

    // =========================================================================
    // CATEGORY: ABILITIES
    // =========================================================================

    'ability_smithing': {
        key: 'ability_smithing',
        name: 'Smithing',
        swedishName: 'Smedning (Smithing)',
        category: 'abilities',
        englishDesc: 'Smithing held an almost sacred status in Norse culture - the smith who could transform raw ore into weapons and tools was seen as wielding creative power akin to the gods. The mythological smiths of Norse myth were the Svartálfar, who crafted the greatest treasures of the gods: Mjölnir, Gungnir, Gleipnir, and the ship Skidbladnir. In Swedish folk tradition, the smith was a figure of both respect and some unease - their mastery of fire and metal made them liminal, connected to forces beyond ordinary human ability.',
        swedishDesc: 'Smideskonsten hade nästan helig status i nordisk kultur - smeden som kunde omvandla råmalm till vapen och verktyg ansågs besitta en skaparkraft lik gudarnas. De mytologiska smederna i nordisk myt var Svartálfarna, som skapade gudarnas största skatter: Mjölnir, Gungnir, Gleipnir och skeppet Skidbladnir. I svensk folktradition var smeden en figur av både respekt och viss oro - deras behärskning av eld och metall gjorde dem liminala, kopplade till krafter bortom vanlig mänsklig förmåga.',
        source: 'Norse Mythology / Swedish Folk Tradition',
        heritage: 'Norse',
        unlockType: 'ability',
        unlockKey: 'Smithing'
    },
    'ability_skalds_mead': {
        key: 'ability_skalds_mead',
        name: "Skald's Mead",
        swedishName: "Skaldemjöd (Skald's Mead)",
        category: 'abilities',
        englishDesc: 'The Mead of Poetry (Skáldskaparmál, or the Mead of Skalds) is one of the most fascinating myths in Norse tradition. The gods and the Vanir made peace by creating Kvasir - a being so wise he could answer any question - from their combined saliva. Two dwarves killed Kvasir and mixed his blood with honey to create a mead that granted the gift of poetry and wisdom to anyone who drank it. Odin eventually stole the mead for the gods after transforming himself into a serpent and then an eagle to escape with it.',
        swedishDesc: 'Skaldsmjödet (Skáldskaparmál, eller skaldemjödet) är en av de mest fascinerande myterna i nordisk tradition. Gudarna och Vanirna skapade fred genom att skapa Kvasir - ett väsen så vis att det kunde svara på vilken fråga som helst - från deras kombinerade saliv. Två dvärgar dödade Kvasir och blandade hans blod med honung för att skapa ett mjöd som gav diktningens och visdomens gåva till alla som drack det. Oden stal till slut mjödet för gudarna efter att ha förvandlat sig till en orm och sedan en örn för att fly med det.',
        source: 'Prose Edda (Skáldskaparmál)',
        heritage: 'Norse',
        unlockType: 'ability',
        unlockKey: "Skald's Mead"
    },
    'ability_burning_insult': {
        key: 'ability_burning_insult',
        name: 'Burning Insult',
        swedishName: 'Niding (Burning Insult)',
        category: 'abilities',
        englishDesc: 'The Norse tradition of ritual insult - known as flyting (or "níð" in Old Norse) - was a formal, highly skilled verbal contest in which opponents attempted to shame and dishonor one another through increasingly devastating mockery. The most famous example is the Lokasenna ("Loki\'s flyting"), a poem in the Poetic Edda in which Loki crashes a divine feast and systematically insults every god and goddess present, accusing them of cowardice, infidelity, and dishonor. A successful níð was believed to have real spiritual power to wound.',
        swedishDesc: 'Den nordiska traditionen av rituell förolämpning - känd som niding (eller "níð" på fornnordiska) - var en formell, mycket skicklig verbal tävling där motståndare försökte skämma och vanhedra varandra genom allt mer förödande hån. Det mest kända exemplet är Lokasenna ("Lokestriden"), en dikt i den poetiska Eddan där Loke kraschar en gudomlig fest och systematiskt förolämpar varje gud och gudinna som är närvarande, och anklagar dem för feghet, otrohet och vanära. En framgångsrik níð troddes ha verklig andlig kraft att såra.',
        source: 'Poetic Edda (Lokasenna)',
        heritage: 'Norse',
        unlockType: 'ability',
        unlockKey: 'Burning Insult'
    },
    'ability_ethereal_melody': {
        key: 'ability_ethereal_melody',
        name: 'Ethereal Melody',
        swedishName: 'Eterisk Melodi (Ethereal Melody)',
        category: 'abilities',
        englishDesc: 'Music as supernatural enchantment is a recurring motif in Scandinavian folklore, most powerfully represented by Näcken\'s fiddle playing. The näcken is said to play by the water\'s edge with such devastating beauty that listeners cannot control themselves - they must dance, and they will dance until they die unless someone can break the spell by calling the näcken by name. Näcken could also teach his art to humans, but only for a price. Similar traditions appear across Northern Europe, from the Irish fiddle spirits to the Scottish Faerie musicians.',
        swedishDesc: 'Musik som övernaturlig förtrollning är ett återkommande motiv i skandinavisk folklore, kraftfullast representerat av näckens fiolspelande. Näcken sägs spela vid vattenkanten med sådan förödande skönhet att lyssnare inte kan kontrollera sig - de måste dansa, och de ska dansa tills de dör om inte någon kan bryta förbannelsen genom att kalla näcken vid namn. Näcken kunde också lära ut sin konst till människor, men bara till ett pris. Liknande traditioner förekommer i hela Nordeuropa, från de irländska fidelandarna till de skotska feutiska musikerna.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'ability',
        unlockKey: 'Ethereal Melody'
    },
    'ability_boulder_toss': {
        key: 'ability_boulder_toss',
        name: 'Boulder Toss',
        swedishName: 'Stenkastning (Boulder Toss)',
        category: 'abilities',
        englishDesc: 'Across Scandinavia, local legends explain numerous large boulders and rock formations as evidence of giants and trolls hurling stones. One widespread tradition holds that trolls, infuriated by the sound of church bells - which drove them away from human settlements - would hurl enormous boulders at churches in retaliation. Many Swedish churches claim to have old boulders in their environs that were thrown by nearby trolls. Geologically, these are typically glacial erratics - rocks transported and deposited by glaciers thousands of years ago, which perfectly suited the legendary explanation.',
        swedishDesc: 'Över hela Skandinavien förklarar lokala legender många stora stenblock och klippformationer som bevis på att jättar och troll kastar stenar. En utbredd tradition hävdar att troll, uppretade av kyrkklockors ljud - som drev dem bort från mänskliga bosättningar - kastade enorma stenblock mot kyrkor i vedergällning. Många svenska kyrkor påstår sig ha gamla stenblock i sin omgivning som kastades av närliggande troll. Geologiskt sett är dessa vanligtvis glaciala erratiker - stenar transporterade och avsatta av glaciärer för tusentals år sedan, vilket passade perfekt för den legendariska förklaringen.',
        source: 'Scandinavian Folklore',
        heritage: 'Scandinavian',
        unlockType: 'ability',
        unlockKey: 'Boulder Toss'
    },
    'ability_elven_light': {
        key: 'ability_elven_light',
        name: 'Elven Light',
        swedishName: 'Älvljus (Elven Light)',
        category: 'abilities',
        englishDesc: 'In Swedish folklore, elves and related beings were associated with mysterious lights seen in meadows, forests, and over marshes at twilight - the "älvornas dans" (the dance of the elves). A ring of flattened grass in a meadow, found in the morning, was called an "älvring" (elf ring) - the mark left by elves dancing through the night. The lights themselves, hovering and drifting, were interpreted as the elves\' own luminescence or as lanterns they carried. Seeing such lights was considered an omen that required caution and respect.',
        swedishDesc: 'I svensk folklore förknippades alver och besläktade väsen med mystiska ljus sedda på ängar, i skogar och över mossar i skymningen - "älvornas dans". En ring av nedtryckt gräs på en äng, funnen på morgonen, kallades en "älvring" - märket kvar av alver som dansat under natten. Ljusen själva, svävande och drivande, tolkades som alvernas egna luminescens eller som lyktor de bar. Att se sådana ljus ansågs vara ett omen som krävde försiktighet och respekt.',
        source: 'Swedish Folklore',
        heritage: 'Swedish',
        unlockType: 'ability',
        unlockKey: 'Elven Light'
    },
    'ability_fire_breath': {
        key: 'ability_fire_breath',
        name: 'Fire Breath',
        swedishName: 'Eldandedräkt (Fire Breath)',
        category: 'abilities',
        englishDesc: 'The fire-breathing dragon is one of the most universal figures in European mythology, and in Norse tradition dragons like Fafner guard their hoards with deadly flame. The image may derive from the association between serpents and poison - a venomous serpent\'s bite as a form of burning from within. In Beowulf, the Anglo-Saxon epic closely related to Norse tradition, the dragon breathes fire to defend its treasure. The fire breath represents the destructive potential of hoarded power, turned outward against any who dare approach.',
        swedishDesc: 'Den eldsprutande draken är en av de mest universella figurerna i europeisk mytologi, och i nordisk tradition vaktar drakar som Fafner sina skattkammare med dödlig flamma. Bilden kan härstamma från associationen mellan ormar och gift - en giftig orms bett som en form av brinnande inifrån. I Beowulf, det anglosaxiska epos nära besläktat med nordisk tradition, andas draken eld för att försvara sin skatt. Eldandedräkten representerar den destruktiva potentialen hos samlad makt, riktad utåt mot alla som vågar närma sig.',
        source: 'Norse Mythology / European Folklore',
        heritage: 'European',
        unlockType: 'ability',
        unlockKey: 'Fire Breath'
    },

    // =========================================================================
    // CATEGORY: NAMES
    // =========================================================================

    'guardian_hjordis': {
        key: 'guardian_hjordis',
        name: 'Hjördis',
        category: 'names',
        englishDesc: 'Hjördis is an Old Norse name meaning "sword goddess" (hjörr = sword + dís = goddess or female spirit). In Norse mythology and the Völsunga saga, Hjördis is the mother of Sigurd the dragon-slayer, whose fate was tragically bound up with the cursed gold of Fafner. The "dísir" were feminine protective spirits in Norse belief - ancestral spirits who watched over a family or clan, appearing at midwinter festivals and in dreams to offer warning or protection.',
        swedishDesc: 'Hjördis är ett fornnordiskt namn som betyder "svärdsgudinna" (hjörr = svärd + dis = gudinna eller kvinnlig ande). I nordisk mytologi och Völsunga saga är Hjördis moder till Sigurd drakdräparen, vars öde tragiskt var sammanvävt med Fafners förbannade guld. "Diserna" var kvinnliga skyddsandar i nordisk tro - förfäderliga andar som vakade över en familj eller klan och uppträdde vid midvinterfester och i drömmar för att varna eller skydda.',
        source: 'Völsunga saga / Norse Mythology',
        heritage: 'Norse',
        unlockType: 'guardian',
        unlockKey: 'TROLLSKOGEN'
    },
    'guardian_asa': {
        key: 'guardian_asa',
        name: 'Åsa',
        category: 'names',
        englishDesc: 'Åsa is a common Swedish feminine name of Old Norse origin, derived from "Áss," meaning "god" - specifically one of the Aesir gods of Norse mythology. The name connects its bearer symbolically to the divine order of Asgard. In Viking Age runestone inscriptions and sagas, women named Ása or variants thereof appear as figures of authority and distinction, often commemorated as matriarchs and keepers of the household.',
        swedishDesc: 'Åsa är ett vanligt svenskt feminint namn av fornnordiskt ursprung, härrörande från "Áss", som betyder "gud" - specifikt en av asagudarna i nordisk mytologi. Namnet förbinder dess bärare symboliskt med den gudomliga ordningen i Asgård. I vikingatidens runstensinskrifter och sagor framstår kvinnor vid namn Ása eller varianter därav som auktoritetspersoner och framstående figurer, ofta hedrade som matriarker och väktare av hemmet.',
        source: 'Old Norse Tradition',
        heritage: 'Norse',
        unlockType: 'guardian',
        unlockKey: 'FOLKETS_BY'
    },
    'guardian_brynhild': {
        key: 'guardian_brynhild',
        name: 'Brynhild',
        category: 'names',
        englishDesc: 'Brynhild (Old Norse: Brynhildr) is a shieldmaiden of legendary renown from the Völsunga saga and the heroic lays of the Poetic Edda. Her name means "armored battle" (bryn = armor + hildr = battle), reflecting her fierce warrior nature. As punishment by Odin, she was placed in an enchanted sleep surrounded by an unbreakable ring of fire, from which only the fearless hero Sigurd could wake her. The two pledged their hearts to each other, but treachery and the curse of Fafner\'s gold tore them apart - one of the great tragedies of Norse legend. The name has been borne by queens and shieldmaidens throughout Scandinavian history.',
        swedishDesc: 'Brynhild (fornnordiskans Brynhildr) är en sköldemö av legendarisk ryktbarhet från Völsunga saga och hjältedikterna i den poetiska Eddan. Hennes namn betyder "bepansrad strid" (bryn = rustning + hildr = strid), vilket speglar hennes våldsamma krigarnatur. Som straff av Oden försattes hon i en förtrollad sömn omgiven av en obrytbar eldring, ur vilken bara den oförskräckte hjälten Sigurd kunde väcka henne. De lovade sina hjärtan till varandra, men svek och förbannelsen av Fafners guld slet dem isär - en av de stora tragedierna i nordisk legend. Namnet har burits av drottningar och sköldemöar genom hela Skandinaviens historia.',
        source: 'Völsunga saga / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'guardian',
        unlockKey: 'DJUPA_GRUVAN'
    },
    'guardian_ragnar': {
        key: 'guardian_ragnar',
        name: 'Ragnar',
        category: 'names',
        englishDesc: 'Ragnar is one of the most iconic Old Norse names, composed of ragn- (counsel, decision, divine power) and -arr (warrior). It was a royal and warrior name throughout the Viking Age, most famously associated with the semi-legendary Ragnar Lothbrok, whose sons were said to have invaded England in the great heathen army of 865 CE. The name evokes strength of will and martial excellence.',
        swedishDesc: 'Ragnar är ett av de mest ikoniska fornnordiska namnen, sammansatt av ragn- (råd, beslut, gudomlig kraft) och -arr (krigare). Det var ett kungligt och krigarnamn under hela vikingaperioden, mest känt förknippad med den halvlegendariske Ragnar Lodbrok, vars söner sades ha invaderat England i den stora hedniska armén 865 e.Kr. Namnet framkallar viljestyrka och krigslig excellens.',
        source: 'Old Norse Sagas',
        heritage: 'Scandinavian',
        unlockType: 'guardian',
        unlockKey: 'GLIMRANDE_KALLAN'
    },
    'guardian_sigurd': {
        key: 'guardian_sigurd',
        name: 'Sigurd',
        category: 'names',
        englishDesc: 'Sigurd is the greatest hero of Norse mythology and the Völsunga saga - the dragon-slayer who killed Fafner and tasted the dragon\'s blood, giving him wisdom and the ability to understand birds. He won the cursed hoard of Andvari, wielded the sword Gramr, and loved the Valkyrie Brynhild before tragedy parted them. His story influenced the German Nibelungenlied and, through it, Richard Wagner\'s Ring Cycle.',
        swedishDesc: 'Sigurd är den störste hjälten i nordisk mytologi och Völsunga saga - drakdräparen som dödade Fafner och smakade drakens blod, vilket gav honom visdom och förmågan att förstå fåglar. Han vann Andvaris förbannade skatt, svingade svärdet Gramr och älskade Valkyrjan Brynhild innan tragedin skilde dem åt. Hans historia influerade det tyska Nibelungenlied och, genom det, Richard Wagners Ringcykeln.',
        source: 'Völsunga saga / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'guardian',
        unlockKey: 'URBERGEN'
    },
    'guardian_gylfe': {
        key: 'guardian_gylfe',
        name: 'Gylfe',
        category: 'names',
        englishDesc: 'Gylfe is a Swedish king in the Prose Edda whose journey to Asgard to seek wisdom forms the basis of Snorri Sturluson\'s "Gylfaginning" (the Fooling of Gylfe). Disguising himself as a wanderer named Gangleri, Gylfe enters the divine hall and asks three enthroned figures - named High, Just-as-High, and Third - questions about the nature of the world, the gods, and the cosmos. Their answers constitute one of the most complete accounts of Norse mythology that survives.',
        swedishDesc: 'Gylfe är en svensk kung i Prosa-Eddan vars resa till Asgård för att söka visdom bildar grunden för Snorri Sturlusons "Gylfaginning" (Gylfes bedrägeri). Förklä till en vandrare vid namn Gangleri träder Gylfe in i den gudomliga salen och frågar tre tronande figurer - vid namn Höge, Lika-höge och Tredje - om världens, gudarnas och kosmosets natur. Deras svar utgör ett av de mest fullständiga redogörelserna för nordisk mytologi som överlever.',
        source: 'Prose Edda (Gylfaginning, Snorri Sturluson)',
        heritage: 'Norse',
        unlockType: 'guardian',
        unlockKey: 'VARLDENS_ANDE'
    },

    // =========================================================================
    // CATEGORY: CONCEPTS
    // =========================================================================

    'concept_megin': {
        key: 'concept_megin',
        name: 'Megin',
        category: 'concepts',
        englishDesc: 'Megin (Old Norse: megin) is the concept of personal power, might, and vital energy in Norse tradition. Thor\'s legendary strength is often specifically called his "megin" - a deep, intrinsic force rather than merely trained muscle. The word is related to the verb "mega" (to be able, to have power) and the English "main" (as in "with might and main"). In Norse cosmology, megin is the fundamental force that distinguishes the powerful from the ordinary: gods, giants, and great warriors possess it in abundance.',
        swedishDesc: 'Megin (fornnordiska: megin) är konceptet av personlig kraft, styrka och vital energi i nordisk tradition. Tors legendariska styrka kallas ofta specifikt hans "megin" - en djup, inneboende kraft snarare än enbart tränad muskler. Ordet är besläktat med verbet "mega" (att kunna, att ha kraft) och det engelska "main" (som i "med kraft och main"). I nordisk kosmologi är megin den fundamentala kraften som skiljer de mäktiga från de vanliga: gudar, jättar och stora krigare besitter det i överflöd.',
        source: 'Old Norse Tradition / Norse Mythology',
        heritage: 'Norse',
        unlockType: 'standard'
    },
    'concept_futhark': {
        key: 'concept_futhark',
        name: 'Elder Futhark',
        swedishName: 'Äldre Futharken',
        category: 'concepts',
        englishDesc: 'The Elder Futhark is the oldest known runic alphabet, consisting of 24 characters and used from approximately the 2nd to the 8th centuries CE across the Germanic and Scandinavian world. Its name comes from the first six runes: F, U, Þ, A, R, K. The runes were not merely a writing system - each character carried layers of meaning, magical power, and cosmological significance in Norse and Germanic belief. Hundreds of runestones bearing Elder Futhark inscriptions survive in Sweden, Norway, and Denmark, many commemorating the dead or marking territorial boundaries.',
        swedishDesc: 'Det äldre futharket är det äldsta kända runalphabetet, bestående av 24 tecken och använt från ungefär det 2:a till det 8:e århundradet e.Kr. i den germanska och skandinaviska världen. Dess namn kommer från de första sex runorna: F, U, Þ, A, R, K. Runorna var inte enbart ett skriftsystem - varje tecken bar lager av mening, magisk kraft och kosmologisk betydelse i nordisk och germansk tro. Hundratals runstenar med inskriptioner i äldre futharket överlever i Sverige, Norge och Danmark, många som minnesmärken över de döda eller som markeringar av territoriella gränser.',
        source: 'Swedish and Scandinavian Runestones',
        heritage: 'Scandinavian / Germanic',
        unlockType: 'standard'
    },
    // =========================================================================
    // CATEGORY: GODS
    // =========================================================================

    'god_odin': {
        key: 'god_odin',
        name: 'Odin',
        swedishName: 'Oden',
        category: 'gods',
        family: 'Asar',
        englishDesc: 'Odin is the Allfather and chief of the Aesir gods, lord of wisdom, war, poetry, and death. He sacrificed one eye at Mimir\'s Well in exchange for cosmic wisdom, and hung himself on Yggdrasil for nine nights to learn the runes. From his throne Hlidskjalf in Asgard, he can observe all nine worlds. His ravens Huginn and Muninn fly across the world each day, gathering knowledge. At Ragnarök, Odin will be swallowed whole by Fenrir. His name is the root of Wednesday ("Wōden\'s day" in Old English).',
        swedishDesc: 'Oden är Allefadern och ledaren av asagudarna, herre över visdom, krig, diktning och döden. Han offrade ett öga vid Mimers brunn i utbyte mot kosmisk visdom och hängde sig på Yggdrasil i nio nätter för att lära sig runorna. Från sin tron Lidskjalv i Asgård kan han se alla nio världar. Hans korpar Hugin och Munin flyger ut i världen varje dag och samlar kunskap. Vid Ragnarök ska Oden slukas av Fenrisulven. Hans namn ligger till grund för onsdag.',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'valhalla'
    },
    'god_thor': {
        key: 'god_thor',
        name: 'Thor',
        swedishName: 'Tor',
        category: 'gods',
        family: 'Asar',
        englishDesc: 'Thor is the Aesir god of thunder, storms, strength, and the protection of humanity. Armed with his hammer Mjölnir and the belt Megingjörð, he is the greatest warrior of the gods and chief defender against the giants who threaten Asgard and Midgard. He and Jörmungandr, the Midgard Serpent, are fated enemies: at Ragnarök, Thor will slay the serpent but die from its venom after walking nine steps. Despite his fierce reputation as a giant-slayer, Thor was beloved by common people as a guardian of farmers, travelers, and honest folk.',
        swedishDesc: 'Tor är asaguden för åska, stormar, styrka och mänsklighetens skydd. Beväpnad med hammaren Mjölnir och bältet Megingjardar är han gudarnas störste krigare och chefsförsvarare mot jättarna som hotar Asgård och Midgård. Han och Jörmungandr, Midgårdsslangen, är ödets fiender: vid Ragnarök ska Tor döda ormen men dö av dess gift efter att ha gått nio steg. Trots sitt rykte som jättedödare var Tor djupt älskad av vanligt folk som skyddare av bönder, resenärer och ärliga människor.',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Jormungandr'
    },
    'god_loki': {
        key: 'god_loki',
        name: 'Loki',
        swedishName: 'Loke',
        category: 'gods',
        family: 'Asar (by adoption)',
        englishDesc: 'Loki is the Aesir trickster and shape-shifter, simultaneously the gods\' most useful companion and most dangerous threat. He is the father of three monstrous offspring: Fenrir, Jörmungandr, and Hel the ruler of the dead. He is also the mother of Sleipnir, Odin\'s eight-legged horse. After engineering the death of the beloved god Baldr, Loki was imprisoned beneath a mountain with venom dripping onto his face - his writhing in pain is said to cause earthquakes. At Ragnarök he will break free and lead the forces of chaos against the gods.',
        swedishDesc: 'Loke är asagudarna trickster och formväxlare, på samma gång gudarnas mest användbara kompanjon och deras farligaste hot. Han är fader till tre monstruösa varelser: Fenrisulven, Jörmungandr och Hel, härskarinna över de döda. Han är också moder till Sleipner, Odens åttabente häst. Efter att ha orsakat den älskade guden Balders död fängslades Loke under ett berg med gift som droppar på hans ansikte - hans vridande i smärta sägs orsaka jordskalv. Vid Ragnarök ska han frigöra sig och leda kaoskrafterna mot gudarna.',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'ability',
        unlockKey: 'Burning Insult'
    },
    'god_frej': {
        key: 'god_frej',
        name: 'Freyr',
        swedishName: 'Frej',
        category: 'gods',
        family: 'Vaner',
        englishDesc: 'Freyr is one of the most important Vanir gods, lord of sunshine, rain, fertility, and prosperity. He is the son of the sea god Njord and twin brother to the goddess Freyja. Consumed by love for the giantess Gerd, he gave away his enchanted sword - which could fight on its own - in exchange for help winning her hand. Without his sword, he is fated to fall to Surt at Ragnarök. He is a god of peaceful abundance, closely associated with the Swedish Yngling dynasty, which claimed divine descent from him.',
        swedishDesc: 'Frej är en av de viktigaste vanagudarna, herre över solsken, regn, fruktbarhet och välstånd. Han är son till havsguden Njord och tvillingbror till gudinnan Freja. Bränd av kärlek till jättinnan Gerd gav han bort sitt förtrollade svärd - som kunde strida på egen hand - i utbyte mot hjälp att vinna hennes hand. Utan sitt svärd är han ödesbestämd att falla för Surt vid Ragnarök. Han är en gudom för fredlig rikedom, nära förknippad med den svenska Ynglingadynastin, som påstod gudomlig härstamning från honom.',
        source: 'Prose Edda (Skírnismál)',
        heritage: 'Norse',
        unlockType: 'guardian',
        unlockKey: 'DJUPA_GRUVAN'
    },
    'god_tyr': {
        key: 'god_tyr',
        name: 'Tyr',
        swedishName: 'Tyr',
        category: 'gods',
        family: 'Asar',
        englishDesc: 'Tyr is the Aesir god of law, justice, and single combat. He is best known for sacrificing his right hand to bind Fenrir: the wolf agreed to be fettered with Gleipnir only if a god placed a hand in his mouth as a pledge of good faith. Knowing the gods intended to keep Fenrir bound, Tyr willingly offered his hand, which Fenrir bit off when he found himself unable to break free. Despite this sacrifice, Tyr is celebrated not as a victim but as the embodiment of courageous commitment to law and order. His name gives us Tuesday.',
        swedishDesc: 'Tyr är asaguden för lag, rättvisa och envig. Han är mest känd för att ha offrat sin högra hand för att binda Fenrisulven: vargen gick med på att bindas med Gleipnir bara om en gud lade sin hand i hans mun som ett löfte om god tro. I vetskapen om att gudarna avsåg att hålla Fenrir bunden offrade Tyr frivilligt sin hand, vilken Fenrisulven bet av när han fann sig oförmögen att frigöra sig. Trots detta offer firas Tyr inte som ett offer utan som förkroppsligandet av modigt engagemang för lag och ordning. Hans namn ger oss tisdag.',
        source: 'Prose Edda',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Fenrir'
    },
    'god_surt': {
        key: 'god_surt',
        name: 'Surt',
        swedishName: 'Surt',
        category: 'gods',
        family: 'Eldjättar',
        englishDesc: 'Surt ("the black one") is the lord of Muspelheim, the primordial realm of fire, and ruler of the fire giants. In Norse cosmology, he stands at the southern boundary of the world wielding a flaming sword that blazes brighter than the sun. At Ragnarök, Surt will lead the fire giants across Bifröst - the rainbow bridge - causing it to shatter, and will kill the Vanir god Freyr, whose own sword he now wields. After the final battle, Surt will engulf the entire world in fire, both destroying it and, according to the Völuspá, purifying it for rebirth.',
        swedishDesc: 'Surt ("den svarte") är härskaren av Muspelheim, det urtida eldriket, och ledaren av eldjättarna. I nordisk kosmologi står han vid världens södra gräns och svingar ett flammande svärd som lyser klarare än solen. Vid Ragnarök ska Surt leda eldjättarna över Bifrost - regnbågsbryggan - och orsaka att den krossas, och ska döda Vanar-guden Frej, vars eget svärd han nu svingar. Efter den sista striden ska Surt dränka hela världen i eld, både förstöra den och, enligt Völuspå, rena den inför pånyttfödelse.',
        source: 'Prose Edda (Völuspá)',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Eldturs'
    },
    'god_ymir': {
        key: 'god_ymir',
        name: 'Ymir',
        swedishName: 'Ymer',
        category: 'gods',
        family: 'Urjättar',
        englishDesc: 'Ymir is the primordial giant - the first being - from whose body the gods Odin, Vili, and Vé created the world. Ymir arose in Ginnungagap, the primordial void, from the meeting of ice from Niflheim and fire from Muspelheim. He was nourished by the cow Audhumbla. When the gods killed Ymir, his blood became the seas and rivers, his flesh the earth, his bones the mountains, his skull the sky, his brains the clouds, and his hair the forests. All the giants are descended from him. He is not a god in the traditional sense, but a cosmic being whose sacrifice - willing or not - made the world possible.',
        swedishDesc: 'Ymer är urjätten - det första väsendet - vars kropp gudarna Oden, Vile och Ve skapade världen av. Ymer uppstod i Ginnungagap, det urtida tomrummet, ur mötet mellan is från Niflheim och eld från Muspelheim. Han närades av kon Audhumbla. När gudarna dödade Ymer blev hans blod haven och floderna, hans kött jord, hans ben berg, hans skalle himlen, hans hjärna molnen och hans hår skogarna. Alla jättar härstammar från honom. Han är ingen gud i traditionell mening, utan ett kosmiskt väsen vars offer - frivilligt eller ej - gjorde världen möjlig.',
        source: 'Prose Edda (Gylfaginning)',
        heritage: 'Norse',
        unlockType: 'zone',
        unlockKey: 'GINNUNGAGAP'
    },

    // =========================================================================
    // FAMILY ENTRIES: ASAR AND VANAR
    // =========================================================================

    'family_asar': {
        key: 'family_asar',
        name: 'Asar',
        swedishName: 'Asar',
        category: 'families',
        englishDesc: 'The Aesir (Swedish: Asar) are the principal family of gods in Norse mythology, dwelling in Asgard and led by Odin the Allfather. They include the gods most central to Norse myth: Odin, Thor, Tyr, Baldr, and Frigg, as well as Loki by adoption. The Aesir waged a mythological war against the Vanir - another family of gods - which ended in a truce and an exchange of divine hostages: Freyr and Freyja came to dwell among the Aesir. At Ragnarök, most of the Aesir are fated to die in the final battle against the giants and the forces of chaos.',
        swedishDesc: 'Asarna är den huvudsakliga familjen av gudar i nordisk mytologi, boendes i Asgård och ledade av Allefadern Oden. De inkluderar gudarna mest centrala i nordisk myt: Oden, Tor, Tyr, Balder och Frigg, samt Loke genom adoption. Asarna förde ett mytologiskt krig mot Vanerna - en annan gudafamilj - vilket slutade med vapenvila och ett utbyte av gudomliga gisslan: Frej och Freja kom att bo bland asarna. Vid Ragnarök är de flesta asarna ödesbestämda att dö i den sista striden mot jättarna och kaoskrafterna.',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'valhalla'
    },
    'family_vanar': {
        key: 'family_vanar',
        name: 'Vaner',
        swedishName: 'Vaner',
        category: 'families',
        englishDesc: 'The Vanir (Swedish: Vaner) are a family of Norse gods associated with fertility, wisdom, the sea, and abundance. They include Freyr (lord of rain and sunshine), Freyja (goddess of love and magic), and Njord (god of sea and winds). The Aesir and Vanir once waged a mythological war that ended in truce and an exchange of divine hostages. Unlike the martial Aesir, the Vanir are gods of peaceful plenty. Many agricultural and nature-based traditions in Scandinavia are rooted in Vanir worship.',
        swedishDesc: 'Vanerna är en familj av nordiska gudar förknippade med fruktbarhet, visdom, havet och rikedom. De inkluderar Frej (herre över regn och solsken), Freja (gudinna för kärlek och magi) och Njord (gud för hav och vind). Asarna och Vanerna förde en gång ett mytologiskt krig som slutade med vapenvila och ett utbyte av gudomliga gisslan. Till skillnad från de krigiska Asarna är Vanerna gudar för fredlig rikedom. Många jordbruks- och naturbaserade traditioner i Skandinavien har sina rötter i Vanerdyrkan.',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'guardian',
        unlockKey: 'DJUPA_GRUVAN'
    },

    // =========================================================================
    // MIDGÅRD — LOCATION
    // =========================================================================

    'location_midgard': {
        key: 'location_midgard',
        name: 'Midgard',
        swedishName: 'Midgård',
        category: 'locations',
        englishDesc: 'Midgard ("the middle enclosure") is the realm of humans in Norse cosmology - one of the nine worlds connected by Yggdrasil. It lies at the center of the cosmic structure, encircled by the vast ocean in which Jörmungandr, the Midgard Serpent, endlessly coils. Midgard was fashioned from the body of the primordial giant Ymir: his flesh became the earth, and the gods built an encircling wall from his eyebrows to protect it from the giants of Jotunheim. Midgard is the world of human life, where gods and supernatural beings cross paths with mortal folk.',
        swedishDesc: 'Midgård ("mellaninhägnaden") är människornas rike i nordisk kosmologi - en av de nio världarna förbundna av Yggdrasil. Det ligger i centrum av den kosmiska strukturen, omgivet av det stora havet i vilket Jörmungandr, Midgårdsslangen, oupphörligt ringlar sig. Midgård formades av urjätten Ymers kropp: hans kött blev till jord, och gudarna byggde en kringliggande mur av hans ögonbryn för att skydda det från Jotunheims jättar. Midgård är den mänskliga livets värld, där gudar och övernaturliga varelser korsar vägar med dödliga.',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Jormungandr'
    },
    'location_jotunheim': {
        key: 'location_jotunheim',
        name: 'Jotunheim',
        category: 'locations',
        englishDesc: 'Jotunheim ("the home of the giants") is the realm of the jötnar in Norse cosmology, lying beyond the vast ocean that encircles Midgard. It is a land of towering mountains, dense forests, and bitter cold, ruled by primordial forces of chaos that predate the gods themselves. Despite being home to the gods\' great enemies, Jotunheim features prominently in Norse myth as a place the Aesir must visit: Odin journeyed there in pursuit of wisdom, Thor crossed it to battle the giant Utgard-Loki, and Freyr rode there in pursuit of the giantess Gerd. Many giants are depicted not as mindless brutes but as beings of vast and ancient knowledge.',
        swedishDesc: 'Jotunheim ("jättarnas hem") är jötnarnas rike i nordisk kosmologi, beläget bortom det väldiga havet som omringar Midgård. Det är ett land av jättelika berg, täta skogar och bitande köld, styrt av urtida kaoskrafter som föregår gudarna själva. Trots att det är hem för gudarnas stora fiender spelar Jotunheim en framträdande roll i nordisk myt som en plats asagudarna måste besöka: Oden reste dit i jakt på visdom, Tor korsade det för att strida mot jätten Utgård-Loke, och Frej red dit i pursuit av jättinnan Gerd. Många jättar skildras inte som tanklösa bruter utan som varelser med enorm och uråldrigt kunskap.',
        source: 'Prose Edda / Poetic Edda',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Jotun'
    },
    'location_alfheim': {
        key: 'location_alfheim',
        name: 'Alfheim',
        category: 'locations',
        englishDesc: 'Alfheim ("elf home") is the realm of the Light Elves (Swedish: Ljusalver) in Norse cosmology - one of the nine worlds connected by Yggdrasil. In the Prose Edda, Snorri Sturluson describes it as a realm of breathtaking beauty, home to beings "more radiant than the sun." The realm was given as a tooth-gift to the god Freyr when he cut his first tooth, suggesting its intimate connection to fertility and abundance. Alfheim represents the luminous, benevolent face of elven existence in Norse cosmology, in stark contrast to the underground realm of the Dark Elves.',
        swedishDesc: 'Alfheim ("alvernas hem") är Ljusalvernas rike i nordisk kosmologi - en av de nio världar som förbinds av Yggdrasil. I Prosa-Eddan beskriver Snorri Sturluson det som ett rike av enastående skönhet, hem för varelser "mer strålande än solen." Riket gavs som tandgåva till guden Frej när han fick sin första tand, vilket antyder dess intima koppling till fruktbarhet och överflöd. Alfheim representerar den lysande, välvilliga sidan av alvernas existens i nordisk kosmologi, i skarp kontrast till Svartalvernas underjordiska rike.',
        source: 'Prose Edda (Snorri Sturluson)',
        heritage: 'Norse',
        unlockType: 'vasen',
        unlockKey: 'Ljusalv'
    },

    'concept_ragnarok': {
        key: 'concept_ragnarok',
        name: 'Ragnarök',
        category: 'concepts',
        englishDesc: 'Ragnarök ("Fate of the Gods" or "Twilight of the Gods") is the prophesied apocalypse of Norse mythology: the cataclysmic series of events that will destroy the known world and kill most of the gods. The great wolf Fenrir will break free from his bonds and swallow Odin. Jörmungandr will rise from the sea, and Thor will slay it but die from its venom nine steps later. Surtr will set the world ablaze with fire from Muspelheim. And yet, Ragnarök is not purely an ending - from the wreckage, a new, green world will rise from the waters, and surviving gods and humans will begin again. The most detailed account is found in the Eddic poem Völuspá, "The Prophecy of the Seeress."',
        swedishDesc: 'Ragnarök ("gudarnas öde" eller "gudarnas skymning") är den profeterade apokalypsen i nordisk mytologi: den katastrofala serien av händelser som ska förstöra den kända världen och döda de flesta gudarna. Den stora vargen Fenrir ska bryta sig fri från sina bojor och svälja Oden. Jörmungandr ska stiga upp ur havet, och Tor ska döda honom men dö av dess gift nio steg senare. Surt ska tända världen i lågor med eld från Muspelheim. Och ändå är Ragnarök inte enbart ett slut - ur resterna ska en ny, grön värld stiga upp ur vattnet, och överlevande gudar och människor ska börja om. Den mest detaljerade redogörelsen finns i det eddiska dikten Völuspá, "Völvans spådom."',
        source: 'Poetic Edda (Völuspá)',
        heritage: 'Norse',
        unlockType: 'zone',
        unlockKey: 'VARLDENS_ANDE'
    },
    'concept_blot': {
        key: 'concept_blot',
        name: 'Blot',
        category: 'concepts',
        englishDesc: 'Blot (Old Norse: "sacrifice") is the central ritual of Norse paganism - a sacred offering made to gods or spirits in exchange for their goodwill, protection, and blessing. The ceremony involved sacrificing animals whose blood was sprinkled on altars, temple walls, and gathered worshippers. Feasting, mead-drinking, and communal prayer accompanied the sacrifice. Major blots were held at midwinter (Yule), mid-spring, and midsummer. In Swedish folk tradition the practice survived in the Dísablot (for the dísir), the Sigrblot (for victory in battle), and the Álfablot (for the elves). The word blot lives on in the Swedish verb blöta ("to soak") and in place names such as Blotsberg. Giving something of value to earn supernatural favor is the oldest form of the human-spirit relationship.',
        swedishDesc: 'Blot (fornnordiska: "offer") är det centrala ritualet i nordisk hedendom - ett heligt offer till gudar eller andar i utbyte mot deras välvilja, skydd och välsignelse. Ceremonin innebar att djur offrades vars blod stänktes på altaren, tempelmurar och de församlade deltagarna. Festande, mjödsdrickande och gemensam bön åtföljde offret. Stora blot hölls vid midvinter (Jul), vårens mitt och midsommar. I svensk folktradition överlevde seden i Dísablotet (för diserna), Sigrblotet (för seger i strid) och Álfablotet (för alferna). Ordet blot lever kvar i det svenska verbet blöta och i ortnamn som Blotsberg. Att ge något av värde för att vinna övernaturligt välvilja är den äldsta formen av relationen mellan människa och andevärld.',
        source: 'Norse Paganism / Swedish Folk Tradition',
        heritage: 'Norse',
        unlockType: 'offering'
    },
};

// Ordered list of all lore entry keys
const LORE_ENTRY_KEYS = Object.keys(LORE_ENTRIES);

// Total number of lore entries
const LORE_TOTAL = LORE_ENTRY_KEYS.length;

// Category display names and sort order
const LORE_CATEGORIES = {
    vasen:     { label: 'Väsen',     labelSv: 'Väsen',    order: 0 },
    families:  { label: 'Families',  labelSv: 'Familjer', order: 1 },
    items:     { label: 'Items',     labelSv: 'Föremål',  order: 2 },
    locations: { label: 'Locations', labelSv: 'Områden',  order: 3 },
    abilities: { label: 'Abilities', labelSv: 'Förmågor', order: 4 },
    gods:      { label: 'Gods',      labelSv: 'Gudar',    order: 5 },
    names:     { label: 'Names',     labelSv: 'Namn',     order: 6 },
    concepts:  { label: 'Concepts',  labelSv: 'Begrepp',  order: 7 }
};

// Keys that are automatically unlocked when the game starts (standard + starter zone)
const LORE_STANDARD_KEYS = LORE_ENTRY_KEYS.filter(k => LORE_ENTRIES[k].unlockType === 'standard');
