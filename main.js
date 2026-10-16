const {
  Plugin,
  PluginSettingTab,
  Setting,
  ItemView,
  WorkspaceLeaf,
  Modal,
  Notice,
  addIcon,
  setIcon,
  requestUrl
} = require("obsidian");

const VIEW_TYPE_POKEDEX = "pokemon-pokedex-view";
const TOTAL_POKEMON = 1025;

const POKEBALL_SVG = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M 50 10 A 40 40 0 0 1 90 50 L 68 50 A 18 18 0 0 0 50 32 A 18 18 0 0 0 32 50 L 10 50 A 40 40 0 0 1 50 10 Z" fill="#EE1515"/>
  <path d="M 50 90 A 40 40 0 0 1 10 50 L 32 50 A 18 18 0 0 0 50 68 A 18 18 0 0 0 68 50 L 90 50 A 40 40 0 0 1 50 90 Z" fill="#F0F0F0"/>
  <circle cx="50" cy="50" r="14" fill="#222224"/>
  <circle cx="50" cy="50" r="8" fill="#FFFFFF"/>
  <circle cx="50" cy="50" r="40" stroke="#222224" stroke-width="6"/>
  <line x1="10" y1="50" x2="32" y2="50" stroke="#222224" stroke-width="6"/>
  <line x1="68" y1="50" x2="90" y2="50" stroke="#222224" stroke-width="6"/>
</svg>`;

const DEFAULT_SETTINGS = {
  language: "auto",
  charactersPerPokemon: 150,
  showCatchAnimation: true,
  soundEnabled: false,
  notificationDurationMs: 4000,
  notificationPosition: "pos-bottom-right",
  currentKeystrokeCount: 0,
  totalCharactersTyped: 0,
  shinyRate: 0.02
};

// Database of all 1025 Pokemon (Generations 1 to 9 with French names & types)
const POKEMON_DATABASE = [{"id":1,"name":"Bulbizarre","nameEn":"Bulbasaur","types":["Plante","Poison"]},{"id":2,"name":"Herbizarre","nameEn":"Ivysaur","types":["Plante","Poison"]},{"id":3,"name":"Florizarre","nameEn":"Venusaur","types":["Plante","Poison"]},{"id":4,"name":"Salamèche","nameEn":"Charmander","types":["Feu"]},{"id":5,"name":"Reptincel","nameEn":"Charmeleon","types":["Feu"]},{"id":6,"name":"Dracaufeu","nameEn":"Charizard","types":["Feu","Vol"]},{"id":7,"name":"Carapuce","nameEn":"Squirtle","types":["Eau"]},{"id":8,"name":"Carabaffe","nameEn":"Wartortle","types":["Eau"]},{"id":9,"name":"Tortank","nameEn":"Blastoise","types":["Eau"]},{"id":10,"name":"Chenipan","nameEn":"Caterpie","types":["Insecte"]},{"id":11,"name":"Chrysacier","nameEn":"Metapod","types":["Insecte"]},{"id":12,"name":"Papilusion","nameEn":"Butterfree","types":["Insecte","Vol"]},{"id":13,"name":"Aspicot","nameEn":"Weedle","types":["Insecte","Poison"]},{"id":14,"name":"Coconfort","nameEn":"Kakuna","types":["Insecte","Poison"]},{"id":15,"name":"Dardargnan","nameEn":"Beedrill","types":["Insecte","Poison"]},{"id":16,"name":"Roucool","nameEn":"Pidgey","types":["Normal","Vol"]},{"id":17,"name":"Roucoups","nameEn":"Pidgeotto","types":["Normal","Vol"]},{"id":18,"name":"Roucarnage","nameEn":"Pidgeot","types":["Normal","Vol"]},{"id":19,"name":"Rattata","nameEn":"Rattata","types":["Normal"]},{"id":20,"name":"Rattatac","nameEn":"Raticate","types":["Normal"]},{"id":21,"name":"Piafabec","nameEn":"Spearow","types":["Normal","Vol"]},{"id":22,"name":"Rapasdepic","nameEn":"Fearow","types":["Normal","Vol"]},{"id":23,"name":"Abo","nameEn":"Ekans","types":["Poison"]},{"id":24,"name":"Arbok","nameEn":"Arbok","types":["Poison"]},{"id":25,"name":"Pikachu","nameEn":"Pikachu","types":["Électrik"]},{"id":26,"name":"Raichu","nameEn":"Raichu","types":["Électrik"]},{"id":27,"name":"Sabelette","nameEn":"Sandshrew","types":["Sol"]},{"id":28,"name":"Sablaireau","nameEn":"Sandslash","types":["Sol"]},{"id":29,"name":"Nidoran♀","nameEn":"Nidoran♀","types":["Poison"]},{"id":30,"name":"Nidorina","nameEn":"Nidorina","types":["Poison"]},{"id":31,"name":"Nidoqueen","nameEn":"Nidoqueen","types":["Poison","Sol"]},{"id":32,"name":"Nidoran♂","nameEn":"Nidoran♂","types":["Poison"]},{"id":33,"name":"Nidorino","nameEn":"Nidorino","types":["Poison"]},{"id":34,"name":"Nidoking","nameEn":"Nidoking","types":["Poison","Sol"]},{"id":35,"name":"Mélofée","nameEn":"Clefairy","types":["Fée"]},{"id":36,"name":"Mélodelfe","nameEn":"Clefable","types":["Fée"]},{"id":37,"name":"Goupix","nameEn":"Vulpix","types":["Feu"]},{"id":38,"name":"Feunard","nameEn":"Ninetales","types":["Feu"]},{"id":39,"name":"Rondoudou","nameEn":"Jigglypuff","types":["Normal","Fée"]},{"id":40,"name":"Grodoudou","nameEn":"Wigglytuff","types":["Normal","Fée"]},{"id":41,"name":"Nosferapti","nameEn":"Zubat","types":["Poison","Vol"]},{"id":42,"name":"Nosferalto","nameEn":"Golbat","types":["Poison","Vol"]},{"id":43,"name":"Mystherbe","nameEn":"Oddish","types":["Plante","Poison"]},{"id":44,"name":"Ortide","nameEn":"Gloom","types":["Plante","Poison"]},{"id":45,"name":"Rafflesia","nameEn":"Vileplume","types":["Plante","Poison"]},{"id":46,"name":"Paras","nameEn":"Paras","types":["Insecte","Plante"]},{"id":47,"name":"Parasect","nameEn":"Parasect","types":["Insecte","Plante"]},{"id":48,"name":"Mimitoss","nameEn":"Venonat","types":["Insecte","Poison"]},{"id":49,"name":"Aéromite","nameEn":"Venomoth","types":["Insecte","Poison"]},{"id":50,"name":"Taupiqueur","nameEn":"Diglett","types":["Sol"]},{"id":51,"name":"Triopikeur","nameEn":"Dugtrio","types":["Sol"]},{"id":52,"name":"Miaouss","nameEn":"Meowth","types":["Normal"]},{"id":53,"name":"Persian","nameEn":"Persian","types":["Normal"]},{"id":54,"name":"Psykokwak","nameEn":"Psyduck","types":["Eau"]},{"id":55,"name":"Akwakwak","nameEn":"Golduck","types":["Eau"]},{"id":56,"name":"Férosinge","nameEn":"Mankey","types":["Combat"]},{"id":57,"name":"Colossinge","nameEn":"Primeape","types":["Combat"]},{"id":58,"name":"Caninos","nameEn":"Growlithe","types":["Feu"]},{"id":59,"name":"Arcanin","nameEn":"Arcanine","types":["Feu"]},{"id":60,"name":"Ptitard","nameEn":"Poliwag","types":["Eau"]},{"id":61,"name":"Têtarte","nameEn":"Poliwhirl","types":["Eau"]},{"id":62,"name":"Tartard","nameEn":"Poliwrath","types":["Eau","Combat"]},{"id":63,"name":"Abra","nameEn":"Abra","types":["Psy"]},{"id":64,"name":"Kadabra","nameEn":"Kadabra","types":["Psy"]},{"id":65,"name":"Alakazam","nameEn":"Alakazam","types":["Psy"]},{"id":66,"name":"Machoc","nameEn":"Machop","types":["Combat"]},{"id":67,"name":"Machopeur","nameEn":"Machoke","types":["Combat"]},{"id":68,"name":"Mackogneur","nameEn":"Machamp","types":["Combat"]},{"id":69,"name":"Chétiflor","nameEn":"Bellsprout","types":["Plante","Poison"]},{"id":70,"name":"Boustiflor","nameEn":"Weepinbell","types":["Plante","Poison"]},{"id":71,"name":"Empiflor","nameEn":"Victreebel","types":["Plante","Poison"]},{"id":72,"name":"Tentacool","nameEn":"Tentacool","types":["Eau","Poison"]},{"id":73,"name":"Tentacruel","nameEn":"Tentacruel","types":["Eau","Poison"]},{"id":74,"name":"Racaillou","nameEn":"Geodude","types":["Roche","Sol"]},{"id":75,"name":"Gravalanch","nameEn":"Graveler","types":["Roche","Sol"]},{"id":76,"name":"Grolem","nameEn":"Golem","types":["Roche","Sol"]},{"id":77,"name":"Ponyta","nameEn":"Ponyta","types":["Feu"]},{"id":78,"name":"Galopa","nameEn":"Rapidash","types":["Feu"]},{"id":79,"name":"Ramoloss","nameEn":"Slowpoke","types":["Eau","Psy"]},{"id":80,"name":"Flagadoss","nameEn":"Slowbro","types":["Eau","Psy"]},{"id":81,"name":"Magnéti","nameEn":"Magnemite","types":["Électrik","Acier"]},{"id":82,"name":"Magnéton","nameEn":"Magneton","types":["Électrik","Acier"]},{"id":83,"name":"Canarticho","nameEn":"Farfetch'd","types":["Normal","Vol"]},{"id":84,"name":"Doduo","nameEn":"Doduo","types":["Normal","Vol"]},{"id":85,"name":"Dodrio","nameEn":"Dodrio","types":["Normal","Vol"]},{"id":86,"name":"Otaria","nameEn":"Seel","types":["Eau"]},{"id":87,"name":"Lamantine","nameEn":"Dewgong","types":["Eau","Glace"]},{"id":88,"name":"Tadmorv","nameEn":"Grimer","types":["Poison"]},{"id":89,"name":"Grotadmorv","nameEn":"Muk","types":["Poison"]},{"id":90,"name":"Kokiyas","nameEn":"Shellder","types":["Eau"]},{"id":91,"name":"Crustabri","nameEn":"Cloyster","types":["Eau","Glace"]},{"id":92,"name":"Fantominus","nameEn":"Gastly","types":["Spectre","Poison"]},{"id":93,"name":"Spectrum","nameEn":"Haunter","types":["Spectre","Poison"]},{"id":94,"name":"Ectoplasma","nameEn":"Gengar","types":["Spectre","Poison"]},{"id":95,"name":"Onix","nameEn":"Onix","types":["Roche","Sol"]},{"id":96,"name":"Soporifik","nameEn":"Drowzee","types":["Psy"]},{"id":97,"name":"Hypnomade","nameEn":"Hypno","types":["Psy"]},{"id":98,"name":"Krabby","nameEn":"Krabby","types":["Eau"]},{"id":99,"name":"Krabboss","nameEn":"Kingler","types":["Eau"]},{"id":100,"name":"Voltorbe","nameEn":"Voltorb","types":["Électrik"]},{"id":101,"name":"Électrode","nameEn":"Electrode","types":["Électrik"]},{"id":102,"name":"Noeunoeuf","nameEn":"Exeggcute","types":["Plante","Psy"]},{"id":103,"name":"Noadkoko","nameEn":"Exeggutor","types":["Plante","Psy"]},{"id":104,"name":"Osselait","nameEn":"Cubone","types":["Sol"]},{"id":105,"name":"Ossatueur","nameEn":"Marowak","types":["Sol"]},{"id":106,"name":"Kicklee","nameEn":"Hitmonlee","types":["Combat"]},{"id":107,"name":"Tygnon","nameEn":"Hitmonchan","types":["Combat"]},{"id":108,"name":"Excelangue","nameEn":"Lickitung","types":["Normal"]},{"id":109,"name":"Smogo","nameEn":"Koffing","types":["Poison"]},{"id":110,"name":"Smogogo","nameEn":"Weezing","types":["Poison"]},{"id":111,"name":"Rhinocorne","nameEn":"Rhyhorn","types":["Sol","Roche"]},{"id":112,"name":"Rhinoféros","nameEn":"Rhydon","types":["Sol","Roche"]},{"id":113,"name":"Leveinard","nameEn":"Chansey","types":["Normal"]},{"id":114,"name":"Saquedeneu","nameEn":"Tangela","types":["Plante"]},{"id":115,"name":"Kangourex","nameEn":"Kangaskhan","types":["Normal"]},{"id":116,"name":"Hypotrempe","nameEn":"Horsea","types":["Eau"]},{"id":117,"name":"Hypocéan","nameEn":"Seadra","types":["Eau"]},{"id":118,"name":"Poissirène","nameEn":"Goldeen","types":["Eau"]},{"id":119,"name":"Poissoroy","nameEn":"Seaking","types":["Eau"]},{"id":120,"name":"Stari","nameEn":"Staryu","types":["Eau"]},{"id":121,"name":"Staross","nameEn":"Starmie","types":["Eau","Psy"]},{"id":122,"name":"M. Mime","nameEn":"Mr. Mime","types":["Psy","Fée"]},{"id":123,"name":"Insécateur","nameEn":"Scyther","types":["Insecte","Vol"]},{"id":124,"name":"Lippoutou","nameEn":"Jynx","types":["Glace","Psy"]},{"id":125,"name":"Élektek","nameEn":"Electabuzz","types":["Électrik"]},{"id":126,"name":"Magmar","nameEn":"Magmar","types":["Feu"]},{"id":127,"name":"Scarabrute","nameEn":"Pinsir","types":["Insecte"]},{"id":128,"name":"Tauros","nameEn":"Tauros","types":["Normal"]},{"id":129,"name":"Magicarpe","nameEn":"Magikarp","types":["Eau"]},{"id":130,"name":"Léviator","nameEn":"Gyarados","types":["Eau","Vol"]},{"id":131,"name":"Lokhlass","nameEn":"Lapras","types":["Eau","Glace"]},{"id":132,"name":"Métamorph","nameEn":"Ditto","types":["Normal"]},{"id":133,"name":"Évoli","nameEn":"Eevee","types":["Normal"]},{"id":134,"name":"Aquali","nameEn":"Vaporeon","types":["Eau"]},{"id":135,"name":"Voltali","nameEn":"Jolteon","types":["Électrik"]},{"id":136,"name":"Pyroli","nameEn":"Flareon","types":["Feu"]},{"id":137,"name":"Porygon","nameEn":"Porygon","types":["Normal"]},{"id":138,"name":"Amonita","nameEn":"Omanyte","types":["Roche","Eau"]},{"id":139,"name":"Amonistar","nameEn":"Omastar","types":["Roche","Eau"]},{"id":140,"name":"Kabuto","nameEn":"Kabuto","types":["Roche","Eau"]},{"id":141,"name":"Kabutops","nameEn":"Kabutops","types":["Roche","Eau"]},{"id":142,"name":"Ptéra","nameEn":"Aerodactyl","types":["Roche","Vol"]},{"id":143,"name":"Ronflex","nameEn":"Snorlax","types":["Normal"]},{"id":144,"name":"Artikodin","nameEn":"Articuno","types":["Glace","Vol"]},{"id":145,"name":"Électhor","nameEn":"Zapdos","types":["Électrik","Vol"]},{"id":146,"name":"Sulfura","nameEn":"Moltres","types":["Feu","Vol"]},{"id":147,"name":"Minidraco","nameEn":"Dratini","types":["Dragon"]},{"id":148,"name":"Draco","nameEn":"Dragonair","types":["Dragon"]},{"id":149,"name":"Dracolosse","nameEn":"Dragonite","types":["Dragon","Vol"]},{"id":150,"name":"Mewtwo","nameEn":"Mewtwo","types":["Psy"]},{"id":151,"name":"Mew","nameEn":"Mew","types":["Psy"]},{"id":152,"name":"Germignon","nameEn":"Chikorita","types":["Plante"]},{"id":153,"name":"Macronium","nameEn":"Bayleef","types":["Plante"]},{"id":154,"name":"Méganium","nameEn":"Meganium","types":["Plante"]},{"id":155,"name":"Héricendre","nameEn":"Cyndaquil","types":["Feu"]},{"id":156,"name":"Feurisson","nameEn":"Quilava","types":["Feu"]},{"id":157,"name":"Typhlosion","nameEn":"Typhlosion","types":["Feu"]},{"id":158,"name":"Kaiminus","nameEn":"Totodile","types":["Eau"]},{"id":159,"name":"Crocrodil","nameEn":"Croconaw","types":["Eau"]},{"id":160,"name":"Aligatueur","nameEn":"Feraligatr","types":["Eau"]},{"id":161,"name":"Fouinette","nameEn":"Sentret","types":["Normal"]},{"id":162,"name":"Fouinar","nameEn":"Furret","types":["Normal"]},{"id":163,"name":"Hoothoot","nameEn":"Hoothoot","types":["Normal","Vol"]},{"id":164,"name":"Noarfang","nameEn":"Noctowl","types":["Normal","Vol"]},{"id":165,"name":"Coxy","nameEn":"Ledyba","types":["Insecte","Vol"]},{"id":166,"name":"Coxyclaque","nameEn":"Ledian","types":["Insecte","Vol"]},{"id":167,"name":"Mimigal","nameEn":"Spinarak","types":["Insecte","Poison"]},{"id":168,"name":"Migalos","nameEn":"Ariados","types":["Insecte","Poison"]},{"id":169,"name":"Nostenfer","nameEn":"Crobat","types":["Poison","Vol"]},{"id":170,"name":"Loupio","nameEn":"Chinchou","types":["Eau","Électrik"]},{"id":171,"name":"Lanturn","nameEn":"Lanturn","types":["Eau","Électrik"]},{"id":172,"name":"Pichu","nameEn":"Pichu","types":["Électrik"]},{"id":173,"name":"Mélo","nameEn":"Cleffa","types":["Fée"]},{"id":174,"name":"Toudoudou","nameEn":"Igglybuff","types":["Normal","Fée"]},{"id":175,"name":"Togepi","nameEn":"Togepi","types":["Fée"]},{"id":176,"name":"Togetic","nameEn":"Togetic","types":["Fée","Vol"]},{"id":177,"name":"Natu","nameEn":"Natu","types":["Psy","Vol"]},{"id":178,"name":"Xatu","nameEn":"Xatu","types":["Psy","Vol"]},{"id":179,"name":"Wattouat","nameEn":"Mareep","types":["Électrik"]},{"id":180,"name":"Lainergie","nameEn":"Flaaffy","types":["Électrik"]},{"id":181,"name":"Pharamp","nameEn":"Ampharos","types":["Électrik"]},{"id":182,"name":"Joliflor","nameEn":"Bellossom","types":["Plante"]},{"id":183,"name":"Marill","nameEn":"Marill","types":["Eau","Fée"]},{"id":184,"name":"Azumarill","nameEn":"Azumarill","types":["Eau","Fée"]},{"id":185,"name":"Simularbre","nameEn":"Sudowoodo","types":["Roche"]},{"id":186,"name":"Tarpaud","nameEn":"Politoed","types":["Eau"]},{"id":187,"name":"Granivol","nameEn":"Hoppip","types":["Plante","Vol"]},{"id":188,"name":"Floravol","nameEn":"Skiploom","types":["Plante","Vol"]},{"id":189,"name":"Cotovol","nameEn":"Jumpluff","types":["Plante","Vol"]},{"id":190,"name":"Capumain","nameEn":"Aipom","types":["Normal"]},{"id":191,"name":"Tournegrin","nameEn":"Sunkern","types":["Plante"]},{"id":192,"name":"Héliatronc","nameEn":"Sunflora","types":["Plante"]},{"id":193,"name":"Yanma","nameEn":"Yanma","types":["Insecte","Vol"]},{"id":194,"name":"Axoloto","nameEn":"Wooper","types":["Eau","Sol"]},{"id":195,"name":"Maraiste","nameEn":"Quagsire","types":["Eau","Sol"]},{"id":196,"name":"Mentali","nameEn":"Espeon","types":["Psy"]},{"id":197,"name":"Noctali","nameEn":"Umbreon","types":["Ténèbres"]},{"id":198,"name":"Cornèbre","nameEn":"Murkrow","types":["Ténèbres","Vol"]},{"id":199,"name":"Roigada","nameEn":"Slowking","types":["Eau","Psy"]},{"id":200,"name":"Feuforêve","nameEn":"Misdreavus","types":["Spectre"]},{"id":201,"name":"Zarbi","nameEn":"Unown","types":["Psy"]},{"id":202,"name":"Qulbutoké","nameEn":"Wobbuffet","types":["Psy"]},{"id":203,"name":"Girafarig","nameEn":"Girafarig","types":["Normal","Psy"]},{"id":204,"name":"Pomdepik","nameEn":"Pineco","types":["Insecte"]},{"id":205,"name":"Foretress","nameEn":"Forretress","types":["Insecte","Acier"]},{"id":206,"name":"Insolourdo","nameEn":"Dunsparce","types":["Normal"]},{"id":207,"name":"Scorplane","nameEn":"Gligar","types":["Sol","Vol"]},{"id":208,"name":"Steelix","nameEn":"Steelix","types":["Acier","Sol"]},{"id":209,"name":"Snubbull","nameEn":"Snubbull","types":["Fée"]},{"id":210,"name":"Granbull","nameEn":"Granbull","types":["Fée"]},{"id":211,"name":"Qwilfish","nameEn":"Qwilfish","types":["Eau","Poison"]},{"id":212,"name":"Cizayox","nameEn":"Scizor","types":["Insecte","Acier"]},{"id":213,"name":"Caratroc","nameEn":"Shuckle","types":["Insecte","Roche"]},{"id":214,"name":"Scarhino","nameEn":"Heracross","types":["Insecte","Combat"]},{"id":215,"name":"Farfuret","nameEn":"Sneasel","types":["Ténèbres","Glace"]},{"id":216,"name":"Teddiursa","nameEn":"Teddiursa","types":["Normal"]},{"id":217,"name":"Ursaring","nameEn":"Ursaring","types":["Normal"]},{"id":218,"name":"Limagma","nameEn":"Slugma","types":["Feu"]},{"id":219,"name":"Volcaropod","nameEn":"Magcargo","types":["Feu","Roche"]},{"id":220,"name":"Marcacrin","nameEn":"Swinub","types":["Glace","Sol"]},{"id":221,"name":"Cochignon","nameEn":"Piloswine","types":["Glace","Sol"]},{"id":222,"name":"Corayon","nameEn":"Corsola","types":["Eau","Roche"]},{"id":223,"name":"Rémoraid","nameEn":"Remoraid","types":["Eau"]},{"id":224,"name":"Octillery","nameEn":"Octillery","types":["Eau"]},{"id":225,"name":"Cadoizo","nameEn":"Delibird","types":["Glace","Vol"]},{"id":226,"name":"Démanta","nameEn":"Mantine","types":["Eau","Vol"]},{"id":227,"name":"Airmure","nameEn":"Skarmory","types":["Acier","Vol"]},{"id":228,"name":"Malosse","nameEn":"Houndour","types":["Ténèbres","Feu"]},{"id":229,"name":"Démolosse","nameEn":"Houndoom","types":["Ténèbres","Feu"]},{"id":230,"name":"Hyporoi","nameEn":"Kingdra","types":["Eau","Dragon"]},{"id":231,"name":"Phanpy","nameEn":"Phanpy","types":["Sol"]},{"id":232,"name":"Donphan","nameEn":"Donphan","types":["Sol"]},{"id":233,"name":"Porygon2","nameEn":"Porygon2","types":["Normal"]},{"id":234,"name":"Cerfrousse","nameEn":"Stantler","types":["Normal"]},{"id":235,"name":"Queulorior","nameEn":"Smeargle","types":["Normal"]},{"id":236,"name":"Debugant","nameEn":"Tyrogue","types":["Combat"]},{"id":237,"name":"Kapoera","nameEn":"Hitmontop","types":["Combat"]},{"id":238,"name":"Lippouti","nameEn":"Smoochum","types":["Glace","Psy"]},{"id":239,"name":"Élekid","nameEn":"Elekid","types":["Électrik"]},{"id":240,"name":"Magby","nameEn":"Magby","types":["Feu"]},{"id":241,"name":"Écrémeuh","nameEn":"Miltank","types":["Normal"]},{"id":242,"name":"Leuphorie","nameEn":"Blissey","types":["Normal"]},{"id":243,"name":"Raikou","nameEn":"Raikou","types":["Électrik"]},{"id":244,"name":"Entei","nameEn":"Entei","types":["Feu"]},{"id":245,"name":"Suicune","nameEn":"Suicune","types":["Eau"]},{"id":246,"name":"Embrylex","nameEn":"Larvitar","types":["Roche","Sol"]},{"id":247,"name":"Ymphect","nameEn":"Pupitar","types":["Roche","Sol"]},{"id":248,"name":"Tyranocif","nameEn":"Tyranitar","types":["Roche","Ténèbres"]},{"id":249,"name":"Lugia","nameEn":"Lugia","types":["Psy","Vol"]},{"id":250,"name":"Ho-Oh","nameEn":"Ho-Oh","types":["Feu","Vol"]},{"id":251,"name":"Celebi","nameEn":"Celebi","types":["Psy","Plante"]},{"id":252,"name":"Arcko","nameEn":"Treecko","types":["Plante"]},{"id":253,"name":"Massko","nameEn":"Grovyle","types":["Plante"]},{"id":254,"name":"Jungko","nameEn":"Sceptile","types":["Plante"]},{"id":255,"name":"Poussifeu","nameEn":"Torchic","types":["Feu"]},{"id":256,"name":"Galifeu","nameEn":"Combusken","types":["Feu","Combat"]},{"id":257,"name":"Braségali","nameEn":"Blaziken","types":["Feu","Combat"]},{"id":258,"name":"Gobou","nameEn":"Mudkip","types":["Eau"]},{"id":259,"name":"Flobio","nameEn":"Marshtomp","types":["Eau","Sol"]},{"id":260,"name":"Laggron","nameEn":"Swampert","types":["Eau","Sol"]},{"id":261,"name":"Medhyèna","nameEn":"Poochyena","types":["Ténèbres"]},{"id":262,"name":"Grahyèna","nameEn":"Mightyena","types":["Ténèbres"]},{"id":263,"name":"Zigzaton","nameEn":"Zigzagoon","types":["Normal"]},{"id":264,"name":"Linéon","nameEn":"Linoone","types":["Normal"]},{"id":265,"name":"Chenipotte","nameEn":"Wurmple","types":["Insecte"]},{"id":266,"name":"Armulys","nameEn":"Silcoon","types":["Insecte"]},{"id":267,"name":"Charmillon","nameEn":"Beautifly","types":["Insecte","Vol"]},{"id":268,"name":"Blindalys","nameEn":"Cascoon","types":["Insecte"]},{"id":269,"name":"Papinox","nameEn":"Dustox","types":["Insecte","Poison"]},{"id":270,"name":"Nénupiot","nameEn":"Lotad","types":["Eau","Plante"]},{"id":271,"name":"Lombre","nameEn":"Lombre","types":["Eau","Plante"]},{"id":272,"name":"Ludicolo","nameEn":"Ludicolo","types":["Eau","Plante"]},{"id":273,"name":"Grainipiot","nameEn":"Seedot","types":["Plante"]},{"id":274,"name":"Pifeuil","nameEn":"Nuzleaf","types":["Plante","Ténèbres"]},{"id":275,"name":"Tengalice","nameEn":"Shiftry","types":["Plante","Ténèbres"]},{"id":276,"name":"Nirondelle","nameEn":"Taillow","types":["Normal","Vol"]},{"id":277,"name":"Hélédelle","nameEn":"Swellow","types":["Normal","Vol"]},{"id":278,"name":"Goélise","nameEn":"Wingull","types":["Eau","Vol"]},{"id":279,"name":"Bekipan","nameEn":"Pelipper","types":["Eau","Vol"]},{"id":280,"name":"Tarsal","nameEn":"Ralts","types":["Psy","Fée"]},{"id":281,"name":"Kirlia","nameEn":"Kirlia","types":["Psy","Fée"]},{"id":282,"name":"Gardevoir","nameEn":"Gardevoir","types":["Psy","Fée"]},{"id":283,"name":"Arakdo","nameEn":"Surskit","types":["Insecte","Eau"]},{"id":284,"name":"Maskadra","nameEn":"Masquerain","types":["Insecte","Vol"]},{"id":285,"name":"Balignon","nameEn":"Shroomish","types":["Plante"]},{"id":286,"name":"Chapignon","nameEn":"Breloom","types":["Plante","Combat"]},{"id":287,"name":"Parecool","nameEn":"Slakoth","types":["Normal"]},{"id":288,"name":"Vigoroth","nameEn":"Vigoroth","types":["Normal"]},{"id":289,"name":"Monaflèmit","nameEn":"Slaking","types":["Normal"]},{"id":290,"name":"Ningale","nameEn":"Nincada","types":["Insecte","Sol"]},{"id":291,"name":"Ninjask","nameEn":"Ninjask","types":["Insecte","Vol"]},{"id":292,"name":"Munja","nameEn":"Shedinja","types":["Insecte","Spectre"]},{"id":293,"name":"Chuchmur","nameEn":"Whismur","types":["Normal"]},{"id":294,"name":"Ramboum","nameEn":"Loudred","types":["Normal"]},{"id":295,"name":"Brouhabam","nameEn":"Exploud","types":["Normal"]},{"id":296,"name":"Makuhita","nameEn":"Makuhita","types":["Combat"]},{"id":297,"name":"Hariyama","nameEn":"Hariyama","types":["Combat"]},{"id":298,"name":"Azurill","nameEn":"Azurill","types":["Normal","Fée"]},{"id":299,"name":"Tarinor","nameEn":"Nosepass","types":["Roche"]},{"id":300,"name":"Skitty","nameEn":"Skitty","types":["Normal"]},{"id":301,"name":"Delcatty","nameEn":"Delcatty","types":["Normal"]},{"id":302,"name":"Ténéfix","nameEn":"Sableye","types":["Ténèbres","Spectre"]},{"id":303,"name":"Mysdibule","nameEn":"Mawile","types":["Acier","Fée"]},{"id":304,"name":"Galekid","nameEn":"Aron","types":["Acier","Roche"]},{"id":305,"name":"Galegon","nameEn":"Lairon","types":["Acier","Roche"]},{"id":306,"name":"Galeking","nameEn":"Aggron","types":["Acier","Roche"]},{"id":307,"name":"Méditikka","nameEn":"Meditite","types":["Combat","Psy"]},{"id":308,"name":"Charmina","nameEn":"Medicham","types":["Combat","Psy"]},{"id":309,"name":"Dynavolt","nameEn":"Electrike","types":["Électrik"]},{"id":310,"name":"Élecsprint","nameEn":"Manectric","types":["Électrik"]},{"id":311,"name":"Posipi","nameEn":"Plusle","types":["Électrik"]},{"id":312,"name":"Négapi","nameEn":"Minun","types":["Électrik"]},{"id":313,"name":"Muciole","nameEn":"Volbeat","types":["Insecte"]},{"id":314,"name":"Lumivole","nameEn":"Illumise","types":["Insecte"]},{"id":315,"name":"Rosélia","nameEn":"Roselia","types":["Plante","Poison"]},{"id":316,"name":"Gloupti","nameEn":"Gulpin","types":["Poison"]},{"id":317,"name":"Avaltout","nameEn":"Swalot","types":["Poison"]},{"id":318,"name":"Carvanha","nameEn":"Carvanha","types":["Eau","Ténèbres"]},{"id":319,"name":"Sharpedo","nameEn":"Sharpedo","types":["Eau","Ténèbres"]},{"id":320,"name":"Wailmer","nameEn":"Wailmer","types":["Eau"]},{"id":321,"name":"Wailord","nameEn":"Wailord","types":["Eau"]},{"id":322,"name":"Chamallot","nameEn":"Numel","types":["Feu","Sol"]},{"id":323,"name":"Camérupt","nameEn":"Camerupt","types":["Feu","Sol"]},{"id":324,"name":"Chartor","nameEn":"Torkoal","types":["Feu"]},{"id":325,"name":"Spoink","nameEn":"Spoink","types":["Psy"]},{"id":326,"name":"Groret","nameEn":"Grumpig","types":["Psy"]},{"id":327,"name":"Spinda","nameEn":"Spinda","types":["Normal"]},{"id":328,"name":"Kraknoix","nameEn":"Trapinch","types":["Sol"]},{"id":329,"name":"Vibraninf","nameEn":"Vibrava","types":["Sol","Dragon"]},{"id":330,"name":"Libégon","nameEn":"Flygon","types":["Sol","Dragon"]},{"id":331,"name":"Cacnea","nameEn":"Cacnea","types":["Plante"]},{"id":332,"name":"Cacturne","nameEn":"Cacturne","types":["Plante","Ténèbres"]},{"id":333,"name":"Tylton","nameEn":"Swablu","types":["Normal","Vol"]},{"id":334,"name":"Altaria","nameEn":"Altaria","types":["Dragon","Vol"]},{"id":335,"name":"Mangriff","nameEn":"Zangoose","types":["Normal"]},{"id":336,"name":"Séviper","nameEn":"Seviper","types":["Poison"]},{"id":337,"name":"Séléroc","nameEn":"Lunatone","types":["Roche","Psy"]},{"id":338,"name":"Solaroc","nameEn":"Solrock","types":["Roche","Psy"]},{"id":339,"name":"Barloche","nameEn":"Barboach","types":["Eau","Sol"]},{"id":340,"name":"Barbicha","nameEn":"Whiscash","types":["Eau","Sol"]},{"id":341,"name":"Écrapince","nameEn":"Corphish","types":["Eau"]},{"id":342,"name":"Colhomard","nameEn":"Crawdaunt","types":["Eau","Ténèbres"]},{"id":343,"name":"Balbuto","nameEn":"Baltoy","types":["Sol","Psy"]},{"id":344,"name":"Kaorine","nameEn":"Claydol","types":["Sol","Psy"]},{"id":345,"name":"Lilia","nameEn":"Lileep","types":["Roche","Plante"]},{"id":346,"name":"Vacilys","nameEn":"Cradily","types":["Roche","Plante"]},{"id":347,"name":"Anorith","nameEn":"Anorith","types":["Roche","Insecte"]},{"id":348,"name":"Armaldo","nameEn":"Armaldo","types":["Roche","Insecte"]},{"id":349,"name":"Barpau","nameEn":"Feebas","types":["Eau"]},{"id":350,"name":"Milobellus","nameEn":"Milotic","types":["Eau"]},{"id":351,"name":"Morphéo","nameEn":"Castform","types":["Normal"]},{"id":352,"name":"Kecleon","nameEn":"Kecleon","types":["Normal"]},{"id":353,"name":"Polichombr","nameEn":"Shuppet","types":["Spectre"]},{"id":354,"name":"Branette","nameEn":"Banette","types":["Spectre"]},{"id":355,"name":"Skelénox","nameEn":"Duskull","types":["Spectre"]},{"id":356,"name":"Téraclope","nameEn":"Dusclops","types":["Spectre"]},{"id":357,"name":"Tropius","nameEn":"Tropius","types":["Plante","Vol"]},{"id":358,"name":"Éoko","nameEn":"Chimecho","types":["Psy"]},{"id":359,"name":"Absol","nameEn":"Absol","types":["Ténèbres"]},{"id":360,"name":"Okéoké","nameEn":"Wynaut","types":["Psy"]},{"id":361,"name":"Stalgamin","nameEn":"Snorunt","types":["Glace"]},{"id":362,"name":"Oniglali","nameEn":"Glalie","types":["Glace"]},{"id":363,"name":"Obalie","nameEn":"Spheal","types":["Glace","Eau"]},{"id":364,"name":"Phogleur","nameEn":"Sealeo","types":["Glace","Eau"]},{"id":365,"name":"Kaimorse","nameEn":"Walrein","types":["Glace","Eau"]},{"id":366,"name":"Coquiperl","nameEn":"Clamperl","types":["Eau"]},{"id":367,"name":"Serpang","nameEn":"Huntail","types":["Eau"]},{"id":368,"name":"Rosabyss","nameEn":"Gorebyss","types":["Eau"]},{"id":369,"name":"Relicanth","nameEn":"Relicanth","types":["Eau","Roche"]},{"id":370,"name":"Lovdisc","nameEn":"Luvdisc","types":["Eau"]},{"id":371,"name":"Draby","nameEn":"Bagon","types":["Dragon"]},{"id":372,"name":"Drackhaus","nameEn":"Shelgon","types":["Dragon"]},{"id":373,"name":"Drattak","nameEn":"Salamence","types":["Dragon","Vol"]},{"id":374,"name":"Terhal","nameEn":"Beldum","types":["Acier","Psy"]},{"id":375,"name":"Métang","nameEn":"Metang","types":["Acier","Psy"]},{"id":376,"name":"Métalosse","nameEn":"Metagross","types":["Acier","Psy"]},{"id":377,"name":"Regirock","nameEn":"Regirock","types":["Roche"]},{"id":378,"name":"Regice","nameEn":"Regice","types":["Glace"]},{"id":379,"name":"Registeel","nameEn":"Registeel","types":["Acier"]},{"id":380,"name":"Latias","nameEn":"Latias","types":["Dragon","Psy"]},{"id":381,"name":"Latios","nameEn":"Latios","types":["Dragon","Psy"]},{"id":382,"name":"Kyogre","nameEn":"Kyogre","types":["Eau"]},{"id":383,"name":"Groudon","nameEn":"Groudon","types":["Sol"]},{"id":384,"name":"Rayquaza","nameEn":"Rayquaza","types":["Dragon","Vol"]},{"id":385,"name":"Jirachi","nameEn":"Jirachi","types":["Acier","Psy"]},{"id":386,"name":"Deoxys","nameEn":"Deoxys","types":["Psy"]},{"id":387,"name":"Tortipouss","nameEn":"Turtwig","types":["Plante"]},{"id":388,"name":"Boskara","nameEn":"Grotle","types":["Plante"]},{"id":389,"name":"Torterra","nameEn":"Torterra","types":["Plante","Sol"]},{"id":390,"name":"Ouisticram","nameEn":"Chimchar","types":["Feu"]},{"id":391,"name":"Chimpenfeu","nameEn":"Monferno","types":["Feu","Combat"]},{"id":392,"name":"Simiabraz","nameEn":"Infernape","types":["Feu","Combat"]},{"id":393,"name":"Tiplouf","nameEn":"Piplup","types":["Eau"]},{"id":394,"name":"Prinplouf","nameEn":"Prinplup","types":["Eau"]},{"id":395,"name":"Pingoléon","nameEn":"Empoleon","types":["Eau","Acier"]},{"id":396,"name":"Étourmi","nameEn":"Starly","types":["Normal","Vol"]},{"id":397,"name":"Étourvol","nameEn":"Staravia","types":["Normal","Vol"]},{"id":398,"name":"Étouraptor","nameEn":"Staraptor","types":["Normal","Vol"]},{"id":399,"name":"Keunotor","nameEn":"Bidoof","types":["Normal"]},{"id":400,"name":"Castorno","nameEn":"Bibarel","types":["Normal","Eau"]},{"id":401,"name":"Crikzik","nameEn":"Kricketot","types":["Insecte"]},{"id":402,"name":"Mélokrik","nameEn":"Kricketune","types":["Insecte"]},{"id":403,"name":"Lixy","nameEn":"Shinx","types":["Électrik"]},{"id":404,"name":"Luxio","nameEn":"Luxio","types":["Électrik"]},{"id":405,"name":"Luxray","nameEn":"Luxray","types":["Électrik"]},{"id":406,"name":"Rozbouton","nameEn":"Budew","types":["Plante","Poison"]},{"id":407,"name":"Roserade","nameEn":"Roserade","types":["Plante","Poison"]},{"id":408,"name":"Kranidos","nameEn":"Cranidos","types":["Roche"]},{"id":409,"name":"Charkos","nameEn":"Rampardos","types":["Roche"]},{"id":410,"name":"Dinoclier","nameEn":"Shieldon","types":["Roche","Acier"]},{"id":411,"name":"Bastiodon","nameEn":"Bastiodon","types":["Roche","Acier"]},{"id":412,"name":"Cheniti","nameEn":"Burmy","types":["Insecte"]},{"id":413,"name":"Cheniselle","nameEn":"Wormadam","types":["Insecte","Plante"]},{"id":414,"name":"Papilord","nameEn":"Mothim","types":["Insecte","Vol"]},{"id":415,"name":"Apitrini","nameEn":"Combee","types":["Insecte","Vol"]},{"id":416,"name":"Apireine","nameEn":"Vespiquen","types":["Insecte","Vol"]},{"id":417,"name":"Pachirisu","nameEn":"Pachirisu","types":["Électrik"]},{"id":418,"name":"Mustébouée","nameEn":"Buizel","types":["Eau"]},{"id":419,"name":"Mustéflott","nameEn":"Floatzel","types":["Eau"]},{"id":420,"name":"Ceribou","nameEn":"Cherubi","types":["Plante"]},{"id":421,"name":"Ceriflor","nameEn":"Cherrim","types":["Plante"]},{"id":422,"name":"Sancoki","nameEn":"Shellos","types":["Eau"]},{"id":423,"name":"Tritosor","nameEn":"Gastrodon","types":["Eau","Sol"]},{"id":424,"name":"Capidextre","nameEn":"Ambipom","types":["Normal"]},{"id":425,"name":"Baudrive","nameEn":"Drifloon","types":["Spectre","Vol"]},{"id":426,"name":"Grodrive","nameEn":"Drifblim","types":["Spectre","Vol"]},{"id":427,"name":"Laporeille","nameEn":"Buneary","types":["Normal"]},{"id":428,"name":"Lockpin","nameEn":"Lopunny","types":["Normal"]},{"id":429,"name":"Magirêve","nameEn":"Mismagius","types":["Spectre"]},{"id":430,"name":"Corboss","nameEn":"Honchkrow","types":["Ténèbres","Vol"]},{"id":431,"name":"Chaglam","nameEn":"Glameow","types":["Normal"]},{"id":432,"name":"Chaffreux","nameEn":"Purugly","types":["Normal"]},{"id":433,"name":"Korillon","nameEn":"Chingling","types":["Psy"]},{"id":434,"name":"Moufouette","nameEn":"Stunky","types":["Poison","Ténèbres"]},{"id":435,"name":"Moufflair","nameEn":"Skuntank","types":["Poison","Ténèbres"]},{"id":436,"name":"Archéomire","nameEn":"Bronzor","types":["Acier","Psy"]},{"id":437,"name":"Archéodong","nameEn":"Bronzong","types":["Acier","Psy"]},{"id":438,"name":"Manzaï","nameEn":"Bonsly","types":["Roche"]},{"id":439,"name":"Mime Jr.","nameEn":"Mime Jr.","types":["Psy","Fée"]},{"id":440,"name":"Ptiravi","nameEn":"Happiny","types":["Normal"]},{"id":441,"name":"Pijako","nameEn":"Chatot","types":["Normal","Vol"]},{"id":442,"name":"Spiritomb","nameEn":"Spiritomb","types":["Spectre","Ténèbres"]},{"id":443,"name":"Griknot","nameEn":"Gible","types":["Dragon","Sol"]},{"id":444,"name":"Carmache","nameEn":"Gabite","types":["Dragon","Sol"]},{"id":445,"name":"Carchacrok","nameEn":"Garchomp","types":["Dragon","Sol"]},{"id":446,"name":"Goinfrex","nameEn":"Munchlax","types":["Normal"]},{"id":447,"name":"Riolu","nameEn":"Riolu","types":["Combat"]},{"id":448,"name":"Lucario","nameEn":"Lucario","types":["Combat","Acier"]},{"id":449,"name":"Hippopotas","nameEn":"Hippopotas","types":["Sol"]},{"id":450,"name":"Hippodocus","nameEn":"Hippowdon","types":["Sol"]},{"id":451,"name":"Rapion","nameEn":"Skorupi","types":["Poison","Insecte"]},{"id":452,"name":"Drascore","nameEn":"Drapion","types":["Poison","Ténèbres"]},{"id":453,"name":"Cradopaud","nameEn":"Croagunk","types":["Poison","Combat"]},{"id":454,"name":"Coatox","nameEn":"Toxicroak","types":["Poison","Combat"]},{"id":455,"name":"Vortente","nameEn":"Carnivine","types":["Plante"]},{"id":456,"name":"Écayon","nameEn":"Finneon","types":["Eau"]},{"id":457,"name":"Luminéon","nameEn":"Lumineon","types":["Eau"]},{"id":458,"name":"Babimanta","nameEn":"Mantyke","types":["Eau","Vol"]},{"id":459,"name":"Blizzi","nameEn":"Snover","types":["Plante","Glace"]},{"id":460,"name":"Blizzaroi","nameEn":"Abomasnow","types":["Plante","Glace"]},{"id":461,"name":"Dimoret","nameEn":"Weavile","types":["Ténèbres","Glace"]},{"id":462,"name":"Magnézone","nameEn":"Magnezone","types":["Électrik","Acier"]},{"id":463,"name":"Coudlangue","nameEn":"Lickilicky","types":["Normal"]},{"id":464,"name":"Rhinastoc","nameEn":"Rhyperior","types":["Sol","Roche"]},{"id":465,"name":"Bouldeneu","nameEn":"Tangrowth","types":["Plante"]},{"id":466,"name":"Élekable","nameEn":"Electivire","types":["Électrik"]},{"id":467,"name":"Maganon","nameEn":"Magmortar","types":["Feu"]},{"id":468,"name":"Togekiss","nameEn":"Togekiss","types":["Fée","Vol"]},{"id":469,"name":"Yanmega","nameEn":"Yanmega","types":["Insecte","Vol"]},{"id":470,"name":"Phyllali","nameEn":"Leafeon","types":["Plante"]},{"id":471,"name":"Givrali","nameEn":"Glaceon","types":["Glace"]},{"id":472,"name":"Scorvol","nameEn":"Gliscor","types":["Sol","Vol"]},{"id":473,"name":"Mammochon","nameEn":"Mamoswine","types":["Glace","Sol"]},{"id":474,"name":"Porygon-Z","nameEn":"Porygon-Z","types":["Normal"]},{"id":475,"name":"Gallame","nameEn":"Gallade","types":["Psy","Combat"]},{"id":476,"name":"Tarinorme","nameEn":"Probopass","types":["Roche","Acier"]},{"id":477,"name":"Noctunoir","nameEn":"Dusknoir","types":["Spectre"]},{"id":478,"name":"Momartik","nameEn":"Froslass","types":["Glace","Spectre"]},{"id":479,"name":"Motisma","nameEn":"Rotom","types":["Électrik","Spectre"]},{"id":480,"name":"Créhelf","nameEn":"Uxie","types":["Psy"]},{"id":481,"name":"Créfollet","nameEn":"Mesprit","types":["Psy"]},{"id":482,"name":"Créfadet","nameEn":"Azelf","types":["Psy"]},{"id":483,"name":"Dialga","nameEn":"Dialga","types":["Acier","Dragon"]},{"id":484,"name":"Palkia","nameEn":"Palkia","types":["Eau","Dragon"]},{"id":485,"name":"Heatran","nameEn":"Heatran","types":["Feu","Acier"]},{"id":486,"name":"Regigigas","nameEn":"Regigigas","types":["Normal"]},{"id":487,"name":"Giratina","nameEn":"Giratina","types":["Spectre","Dragon"]},{"id":488,"name":"Cresselia","nameEn":"Cresselia","types":["Psy"]},{"id":489,"name":"Phione","nameEn":"Phione","types":["Eau"]},{"id":490,"name":"Manaphy","nameEn":"Manaphy","types":["Eau"]},{"id":491,"name":"Darkrai","nameEn":"Darkrai","types":["Ténèbres"]},{"id":492,"name":"Shaymin","nameEn":"Shaymin","types":["Plante"]},{"id":493,"name":"Arceus","nameEn":"Arceus","types":["Normal"]},{"id":494,"name":"Victini","nameEn":"Victini","types":["Psy","Feu"]},{"id":495,"name":"Vipélierre","nameEn":"Snivy","types":["Plante"]},{"id":496,"name":"Lianaja","nameEn":"Servine","types":["Plante"]},{"id":497,"name":"Majaspic","nameEn":"Serperior","types":["Plante"]},{"id":498,"name":"Gruikui","nameEn":"Tepig","types":["Feu"]},{"id":499,"name":"Grotichon","nameEn":"Pignite","types":["Feu","Combat"]},{"id":500,"name":"Roitiflam","nameEn":"Emboar","types":["Feu","Combat"]},{"id":501,"name":"Moustillon","nameEn":"Oshawott","types":["Eau"]},{"id":502,"name":"Mateloutre","nameEn":"Dewott","types":["Eau"]},{"id":503,"name":"Clamiral","nameEn":"Samurott","types":["Eau"]},{"id":504,"name":"Ratentif","nameEn":"Patrat","types":["Normal"]},{"id":505,"name":"Miradar","nameEn":"Watchog","types":["Normal"]},{"id":506,"name":"Ponchiot","nameEn":"Lillipup","types":["Normal"]},{"id":507,"name":"Ponchien","nameEn":"Herdier","types":["Normal"]},{"id":508,"name":"Mastouffe","nameEn":"Stoutland","types":["Normal"]},{"id":509,"name":"Chacripan","nameEn":"Purrloin","types":["Ténèbres"]},{"id":510,"name":"Léopardus","nameEn":"Liepard","types":["Ténèbres"]},{"id":511,"name":"Feuillajou","nameEn":"Pansage","types":["Plante"]},{"id":512,"name":"Feuiloutan","nameEn":"Simisage","types":["Plante"]},{"id":513,"name":"Flamajou","nameEn":"Pansear","types":["Feu"]},{"id":514,"name":"Flamoutan","nameEn":"Simisear","types":["Feu"]},{"id":515,"name":"Flotajou","nameEn":"Panpour","types":["Eau"]},{"id":516,"name":"Flotoutan","nameEn":"Simipour","types":["Eau"]},{"id":517,"name":"Munna","nameEn":"Munna","types":["Psy"]},{"id":518,"name":"Mushana","nameEn":"Musharna","types":["Psy"]},{"id":519,"name":"Poichigeon","nameEn":"Pidove","types":["Normal","Vol"]},{"id":520,"name":"Colombeau","nameEn":"Tranquill","types":["Normal","Vol"]},{"id":521,"name":"Déflaisan","nameEn":"Unfezant","types":["Normal","Vol"]},{"id":522,"name":"Zébibron","nameEn":"Blitzle","types":["Électrik"]},{"id":523,"name":"Zéblitz","nameEn":"Zebstrika","types":["Électrik"]},{"id":524,"name":"Nodulithe","nameEn":"Roggenrola","types":["Roche"]},{"id":525,"name":"Géolithe","nameEn":"Boldore","types":["Roche"]},{"id":526,"name":"Gigalithe","nameEn":"Gigalith","types":["Roche"]},{"id":527,"name":"Chovsourir","nameEn":"Woobat","types":["Psy","Vol"]},{"id":528,"name":"Rhinolove","nameEn":"Swoobat","types":["Psy","Vol"]},{"id":529,"name":"Rototaupe","nameEn":"Drilbur","types":["Sol"]},{"id":530,"name":"Minotaupe","nameEn":"Excadrill","types":["Sol","Acier"]},{"id":531,"name":"Nanméouïe","nameEn":"Audino","types":["Normal"]},{"id":532,"name":"Charpenti","nameEn":"Timburr","types":["Combat"]},{"id":533,"name":"Ouvrifier","nameEn":"Gurdurr","types":["Combat"]},{"id":534,"name":"Bétochef","nameEn":"Conkeldurr","types":["Combat"]},{"id":535,"name":"Tritonde","nameEn":"Tympole","types":["Eau"]},{"id":536,"name":"Batracné","nameEn":"Palpitoad","types":["Eau","Sol"]},{"id":537,"name":"Crapustule","nameEn":"Seismitoad","types":["Eau","Sol"]},{"id":538,"name":"Judokrak","nameEn":"Throh","types":["Combat"]},{"id":539,"name":"Karaclée","nameEn":"Sawk","types":["Combat"]},{"id":540,"name":"Larveyette","nameEn":"Sewaddle","types":["Insecte","Plante"]},{"id":541,"name":"Couverdure","nameEn":"Swadloon","types":["Insecte","Plante"]},{"id":542,"name":"Manternel","nameEn":"Leavanny","types":["Insecte","Plante"]},{"id":543,"name":"Venipatte","nameEn":"Venipede","types":["Insecte","Poison"]},{"id":544,"name":"Scobolide","nameEn":"Whirlipede","types":["Insecte","Poison"]},{"id":545,"name":"Brutapode","nameEn":"Scolipede","types":["Insecte","Poison"]},{"id":546,"name":"Doudouvet","nameEn":"Cottonee","types":["Plante","Fée"]},{"id":547,"name":"Farfaduvet","nameEn":"Whimsicott","types":["Plante","Fée"]},{"id":548,"name":"Chlorobule","nameEn":"Petilil","types":["Plante"]},{"id":549,"name":"Fragilady","nameEn":"Lilligant","types":["Plante"]},{"id":550,"name":"Bargantua","nameEn":"Basculin","types":["Eau"]},{"id":551,"name":"Mascaïman","nameEn":"Sandile","types":["Sol","Ténèbres"]},{"id":552,"name":"Escroco","nameEn":"Krokorok","types":["Sol","Ténèbres"]},{"id":553,"name":"Crocorible","nameEn":"Krookodile","types":["Sol","Ténèbres"]},{"id":554,"name":"Darumarond","nameEn":"Darumaka","types":["Feu"]},{"id":555,"name":"Darumacho","nameEn":"Darmanitan","types":["Feu"]},{"id":556,"name":"Maracachi","nameEn":"Maractus","types":["Plante"]},{"id":557,"name":"Crabicoque","nameEn":"Dwebble","types":["Insecte","Roche"]},{"id":558,"name":"Crabaraque","nameEn":"Crustle","types":["Insecte","Roche"]},{"id":559,"name":"Baggiguane","nameEn":"Scraggy","types":["Ténèbres","Combat"]},{"id":560,"name":"Baggaïd","nameEn":"Scrafty","types":["Ténèbres","Combat"]},{"id":561,"name":"Cryptéro","nameEn":"Sigilyph","types":["Psy","Vol"]},{"id":562,"name":"Tutafeh","nameEn":"Yamask","types":["Spectre"]},{"id":563,"name":"Tutankafer","nameEn":"Cofagrigus","types":["Spectre"]},{"id":564,"name":"Carapagos","nameEn":"Tirtouga","types":["Eau","Roche"]},{"id":565,"name":"Mégapagos","nameEn":"Carracosta","types":["Eau","Roche"]},{"id":566,"name":"Arkéapti","nameEn":"Archen","types":["Roche","Vol"]},{"id":567,"name":"Aéroptéryx","nameEn":"Archeops","types":["Roche","Vol"]},{"id":568,"name":"Miamiasme","nameEn":"Trubbish","types":["Poison"]},{"id":569,"name":"Miasmax","nameEn":"Garbodor","types":["Poison"]},{"id":570,"name":"Zorua","nameEn":"Zorua","types":["Ténèbres"]},{"id":571,"name":"Zoroark","nameEn":"Zoroark","types":["Ténèbres"]},{"id":572,"name":"Chinchidou","nameEn":"Minccino","types":["Normal"]},{"id":573,"name":"Pashmilla","nameEn":"Cinccino","types":["Normal"]},{"id":574,"name":"Scrutella","nameEn":"Gothita","types":["Psy"]},{"id":575,"name":"Mesmérella","nameEn":"Gothorita","types":["Psy"]},{"id":576,"name":"Sidérella","nameEn":"Gothitelle","types":["Psy"]},{"id":577,"name":"Nucléos","nameEn":"Solosis","types":["Psy"]},{"id":578,"name":"Méios","nameEn":"Duosion","types":["Psy"]},{"id":579,"name":"Symbios","nameEn":"Reuniclus","types":["Psy"]},{"id":580,"name":"Couaneton","nameEn":"Ducklett","types":["Eau","Vol"]},{"id":581,"name":"Lakmécygne","nameEn":"Swanna","types":["Eau","Vol"]},{"id":582,"name":"Sorbébé","nameEn":"Vanillite","types":["Glace"]},{"id":583,"name":"Sorboul","nameEn":"Vanillish","types":["Glace"]},{"id":584,"name":"Sorbouboul","nameEn":"Vanilluxe","types":["Glace"]},{"id":585,"name":"Vivaldaim","nameEn":"Deerling","types":["Normal","Plante"]},{"id":586,"name":"Haydaim","nameEn":"Sawsbuck","types":["Normal","Plante"]},{"id":587,"name":"Emolga","nameEn":"Emolga","types":["Électrik","Vol"]},{"id":588,"name":"Carabing","nameEn":"Karrablast","types":["Insecte"]},{"id":589,"name":"Lançargot","nameEn":"Escavalier","types":["Insecte","Acier"]},{"id":590,"name":"Trompignon","nameEn":"Foongus","types":["Plante","Poison"]},{"id":591,"name":"Gaulet","nameEn":"Amoonguss","types":["Plante","Poison"]},{"id":592,"name":"Viskuse","nameEn":"Frillish","types":["Eau","Spectre"]},{"id":593,"name":"Moyade","nameEn":"Jellicent","types":["Eau","Spectre"]},{"id":594,"name":"Mamanbo","nameEn":"Alomomola","types":["Eau"]},{"id":595,"name":"Statitik","nameEn":"Joltik","types":["Insecte","Électrik"]},{"id":596,"name":"Mygavolt","nameEn":"Galvantula","types":["Insecte","Électrik"]},{"id":597,"name":"Grindur","nameEn":"Ferroseed","types":["Plante","Acier"]},{"id":598,"name":"Noacier","nameEn":"Ferrothorn","types":["Plante","Acier"]},{"id":599,"name":"Tic","nameEn":"Klink","types":["Acier"]},{"id":600,"name":"Clic","nameEn":"Klang","types":["Acier"]},{"id":601,"name":"Cliticlic","nameEn":"Klinklang","types":["Acier"]},{"id":602,"name":"Anchwatt","nameEn":"Tynamo","types":["Électrik"]},{"id":603,"name":"Lampéroie","nameEn":"Eelektrik","types":["Électrik"]},{"id":604,"name":"Ohmassacre","nameEn":"Eelektross","types":["Électrik"]},{"id":605,"name":"Lewsor","nameEn":"Elgyem","types":["Psy"]},{"id":606,"name":"Neitram","nameEn":"Beheeyem","types":["Psy"]},{"id":607,"name":"Funécire","nameEn":"Litwick","types":["Spectre","Feu"]},{"id":608,"name":"Mélancolux","nameEn":"Lampent","types":["Spectre","Feu"]},{"id":609,"name":"Lugulabre","nameEn":"Chandelure","types":["Spectre","Feu"]},{"id":610,"name":"Coupenotte","nameEn":"Axew","types":["Dragon"]},{"id":611,"name":"Incisache","nameEn":"Fraxure","types":["Dragon"]},{"id":612,"name":"Tranchodon","nameEn":"Haxorus","types":["Dragon"]},{"id":613,"name":"Polarhume","nameEn":"Cubchoo","types":["Glace"]},{"id":614,"name":"Polagriffe","nameEn":"Beartic","types":["Glace"]},{"id":615,"name":"Hexagel","nameEn":"Cryogonal","types":["Glace"]},{"id":616,"name":"Escargaume","nameEn":"Shelmet","types":["Insecte"]},{"id":617,"name":"Limaspeed","nameEn":"Accelgor","types":["Insecte"]},{"id":618,"name":"Limonde","nameEn":"Stunfisk","types":["Sol","Électrik"]},{"id":619,"name":"Kungfouine","nameEn":"Mienfoo","types":["Combat"]},{"id":620,"name":"Shaofouine","nameEn":"Mienshao","types":["Combat"]},{"id":621,"name":"Drakkarmin","nameEn":"Druddigon","types":["Dragon"]},{"id":622,"name":"Gringolem","nameEn":"Golett","types":["Sol","Spectre"]},{"id":623,"name":"Golemastoc","nameEn":"Golurk","types":["Sol","Spectre"]},{"id":624,"name":"Scalpion","nameEn":"Pawniard","types":["Ténèbres","Acier"]},{"id":625,"name":"Scalproie","nameEn":"Bisharp","types":["Ténèbres","Acier"]},{"id":626,"name":"Frison","nameEn":"Bouffalant","types":["Normal"]},{"id":627,"name":"Furaiglon","nameEn":"Rufflet","types":["Normal","Vol"]},{"id":628,"name":"Gueriaigle","nameEn":"Braviary","types":["Normal","Vol"]},{"id":629,"name":"Vostourno","nameEn":"Vullaby","types":["Ténèbres","Vol"]},{"id":630,"name":"Vaututrice","nameEn":"Mandibuzz","types":["Ténèbres","Vol"]},{"id":631,"name":"Aflamanoir","nameEn":"Heatmor","types":["Feu"]},{"id":632,"name":"Fermite","nameEn":"Durant","types":["Insecte","Acier"]},{"id":633,"name":"Solochi","nameEn":"Deino","types":["Ténèbres","Dragon"]},{"id":634,"name":"Diamat","nameEn":"Zweilous","types":["Ténèbres","Dragon"]},{"id":635,"name":"Trioxhydre","nameEn":"Hydreigon","types":["Ténèbres","Dragon"]},{"id":636,"name":"Pyronille","nameEn":"Larvesta","types":["Insecte","Feu"]},{"id":637,"name":"Pyrax","nameEn":"Volcarona","types":["Insecte","Feu"]},{"id":638,"name":"Cobaltium","nameEn":"Cobalion","types":["Acier","Combat"]},{"id":639,"name":"Terrakium","nameEn":"Terrakion","types":["Roche","Combat"]},{"id":640,"name":"Viridium","nameEn":"Virizion","types":["Plante","Combat"]},{"id":641,"name":"Boréas","nameEn":"Tornadus","types":["Vol"]},{"id":642,"name":"Fulguris","nameEn":"Thundurus","types":["Électrik","Vol"]},{"id":643,"name":"Reshiram","nameEn":"Reshiram","types":["Dragon","Feu"]},{"id":644,"name":"Zekrom","nameEn":"Zekrom","types":["Dragon","Électrik"]},{"id":645,"name":"Démétéros","nameEn":"Landorus","types":["Sol","Vol"]},{"id":646,"name":"Kyurem","nameEn":"Kyurem","types":["Dragon","Glace"]},{"id":647,"name":"Keldeo","nameEn":"Keldeo","types":["Eau","Combat"]},{"id":648,"name":"Meloetta","nameEn":"Meloetta","types":["Normal","Psy"]},{"id":649,"name":"Genesect","nameEn":"Genesect","types":["Insecte","Acier"]},{"id":650,"name":"Marisson","nameEn":"Chespin","types":["Plante"]},{"id":651,"name":"Boguérisse","nameEn":"Quilladin","types":["Plante"]},{"id":652,"name":"Blindépique","nameEn":"Chesnaught","types":["Plante","Combat"]},{"id":653,"name":"Feunnec","nameEn":"Fennekin","types":["Feu"]},{"id":654,"name":"Roussil","nameEn":"Braixen","types":["Feu"]},{"id":655,"name":"Goupelin","nameEn":"Delphox","types":["Feu","Psy"]},{"id":656,"name":"Grenousse","nameEn":"Froakie","types":["Eau"]},{"id":657,"name":"Croâporal","nameEn":"Frogadier","types":["Eau"]},{"id":658,"name":"Amphinobi","nameEn":"Greninja","types":["Eau","Ténèbres"]},{"id":659,"name":"Sapereau","nameEn":"Bunnelby","types":["Normal"]},{"id":660,"name":"Excavarenne","nameEn":"Diggersby","types":["Normal","Sol"]},{"id":661,"name":"Passerouge","nameEn":"Fletchling","types":["Normal","Vol"]},{"id":662,"name":"Braisillon","nameEn":"Fletchinder","types":["Feu","Vol"]},{"id":663,"name":"Flambusard","nameEn":"Talonflame","types":["Feu","Vol"]},{"id":664,"name":"Lépidonille","nameEn":"Scatterbug","types":["Insecte"]},{"id":665,"name":"Pérégrain","nameEn":"Spewpa","types":["Insecte"]},{"id":666,"name":"Prismillon","nameEn":"Vivillon","types":["Insecte","Vol"]},{"id":667,"name":"Hélionceau","nameEn":"Litleo","types":["Feu","Normal"]},{"id":668,"name":"Némélios","nameEn":"Pyroar","types":["Feu","Normal"]},{"id":669,"name":"Flabébé","nameEn":"Flabébé","types":["Fée"]},{"id":670,"name":"Floette","nameEn":"Floette","types":["Fée"]},{"id":671,"name":"Florges","nameEn":"Florges","types":["Fée"]},{"id":672,"name":"Cabriolaine","nameEn":"Skiddo","types":["Plante"]},{"id":673,"name":"Chevroum","nameEn":"Gogoat","types":["Plante"]},{"id":674,"name":"Pandespiègle","nameEn":"Pancham","types":["Combat"]},{"id":675,"name":"Pandarbare","nameEn":"Pangoro","types":["Combat","Ténèbres"]},{"id":676,"name":"Couafarel","nameEn":"Furfrou","types":["Normal"]},{"id":677,"name":"Psystigri","nameEn":"Espurr","types":["Psy"]},{"id":678,"name":"Mistigrix","nameEn":"Meowstic","types":["Psy"]},{"id":679,"name":"Monorpale","nameEn":"Honedge","types":["Acier","Spectre"]},{"id":680,"name":"Dimoclès","nameEn":"Doublade","types":["Acier","Spectre"]},{"id":681,"name":"Exagide","nameEn":"Aegislash","types":["Acier","Spectre"]},{"id":682,"name":"Fluvetin","nameEn":"Spritzee","types":["Fée"]},{"id":683,"name":"Cocotine","nameEn":"Aromatisse","types":["Fée"]},{"id":684,"name":"Sucroquin","nameEn":"Swirlix","types":["Fée"]},{"id":685,"name":"Cupcanaille","nameEn":"Slurpuff","types":["Fée"]},{"id":686,"name":"Sepiatop","nameEn":"Inkay","types":["Ténèbres","Psy"]},{"id":687,"name":"Sepiatroce","nameEn":"Malamar","types":["Ténèbres","Psy"]},{"id":688,"name":"Opermine","nameEn":"Binacle","types":["Roche","Eau"]},{"id":689,"name":"Golgopathe","nameEn":"Barbaracle","types":["Roche","Eau"]},{"id":690,"name":"Venalgue","nameEn":"Skrelp","types":["Poison","Eau"]},{"id":691,"name":"Kravarech","nameEn":"Dragalge","types":["Poison","Dragon"]},{"id":692,"name":"Flingouste","nameEn":"Clauncher","types":["Eau"]},{"id":693,"name":"Gamblast","nameEn":"Clawitzer","types":["Eau"]},{"id":694,"name":"Galvaran","nameEn":"Helioptile","types":["Électrik","Normal"]},{"id":695,"name":"Iguolta","nameEn":"Heliolisk","types":["Électrik","Normal"]},{"id":696,"name":"Ptyranidur","nameEn":"Tyrunt","types":["Roche","Dragon"]},{"id":697,"name":"Rexillius","nameEn":"Tyrantrum","types":["Roche","Dragon"]},{"id":698,"name":"Amagara","nameEn":"Amaura","types":["Roche","Glace"]},{"id":699,"name":"Dragmara","nameEn":"Aurorus","types":["Roche","Glace"]},{"id":700,"name":"Nymphali","nameEn":"Sylveon","types":["Fée"]},{"id":701,"name":"Brutalibré","nameEn":"Hawlucha","types":["Combat","Vol"]},{"id":702,"name":"Dedenne","nameEn":"Dedenne","types":["Électrik","Fée"]},{"id":703,"name":"Strassie","nameEn":"Carbink","types":["Roche","Fée"]},{"id":704,"name":"Mucuscule","nameEn":"Goomy","types":["Dragon"]},{"id":705,"name":"Colimucus","nameEn":"Sliggoo","types":["Dragon"]},{"id":706,"name":"Muplodocus","nameEn":"Goodra","types":["Dragon"]},{"id":707,"name":"Trousselin","nameEn":"Klefki","types":["Acier","Fée"]},{"id":708,"name":"Brocélôme","nameEn":"Phantump","types":["Spectre","Plante"]},{"id":709,"name":"Desséliande","nameEn":"Trevenant","types":["Spectre","Plante"]},{"id":710,"name":"Pitrouille","nameEn":"Pumpkaboo","types":["Spectre","Plante"]},{"id":711,"name":"Banshitrouye","nameEn":"Gourgeist","types":["Spectre","Plante"]},{"id":712,"name":"Grelaçon","nameEn":"Bergmite","types":["Glace"]},{"id":713,"name":"Séracrawl","nameEn":"Avalugg","types":["Glace"]},{"id":714,"name":"Sonistrelle","nameEn":"Noibat","types":["Vol","Dragon"]},{"id":715,"name":"Bruyverne","nameEn":"Noivern","types":["Vol","Dragon"]},{"id":716,"name":"Xerneas","nameEn":"Xerneas","types":["Fée"]},{"id":717,"name":"Yveltal","nameEn":"Yveltal","types":["Ténèbres","Vol"]},{"id":718,"name":"Zygarde","nameEn":"Zygarde","types":["Dragon","Sol"]},{"id":719,"name":"Diancie","nameEn":"Diancie","types":["Roche","Fée"]},{"id":720,"name":"Hoopa","nameEn":"Hoopa","types":["Psy","Spectre"]},{"id":721,"name":"Volcanion","nameEn":"Volcanion","types":["Feu","Eau"]},{"id":722,"name":"Brindibou","nameEn":"Rowlet","types":["Plante","Vol"]},{"id":723,"name":"Efflèche","nameEn":"Dartrix","types":["Plante","Vol"]},{"id":724,"name":"Archéduc","nameEn":"Decidueye","types":["Plante","Spectre"]},{"id":725,"name":"Flamiaou","nameEn":"Litten","types":["Feu"]},{"id":726,"name":"Matoufeu","nameEn":"Torracat","types":["Feu"]},{"id":727,"name":"Félinferno","nameEn":"Incineroar","types":["Feu","Ténèbres"]},{"id":728,"name":"Otaquin","nameEn":"Popplio","types":["Eau"]},{"id":729,"name":"Otarlette","nameEn":"Brionne","types":["Eau"]},{"id":730,"name":"Oratoria","nameEn":"Primarina","types":["Eau","Fée"]},{"id":731,"name":"Picassaut","nameEn":"Pikipek","types":["Normal","Vol"]},{"id":732,"name":"Piclairon","nameEn":"Trumbeak","types":["Normal","Vol"]},{"id":733,"name":"Bazoucan","nameEn":"Toucannon","types":["Normal","Vol"]},{"id":734,"name":"Manglouton","nameEn":"Yungoos","types":["Normal"]},{"id":735,"name":"Argouste","nameEn":"Gumshoos","types":["Normal"]},{"id":736,"name":"Larvibule","nameEn":"Grubbin","types":["Insecte"]},{"id":737,"name":"Chrysapile","nameEn":"Charjabug","types":["Insecte","Électrik"]},{"id":738,"name":"Lucanon","nameEn":"Vikavolt","types":["Insecte","Électrik"]},{"id":739,"name":"Crabagarre","nameEn":"Crabrawler","types":["Combat"]},{"id":740,"name":"Crabominable","nameEn":"Crabominable","types":["Combat","Glace"]},{"id":741,"name":"Plumeline","nameEn":"Oricorio","types":["Feu","Vol"]},{"id":742,"name":"Bombydou","nameEn":"Cutiefly","types":["Insecte","Fée"]},{"id":743,"name":"Rubombelle","nameEn":"Ribombee","types":["Insecte","Fée"]},{"id":744,"name":"Rocabot","nameEn":"Rockruff","types":["Roche"]},{"id":745,"name":"Lougaroc","nameEn":"Lycanroc","types":["Roche"]},{"id":746,"name":"Froussardine","nameEn":"Wishiwashi","types":["Eau"]},{"id":747,"name":"Vorastérie","nameEn":"Mareanie","types":["Poison","Eau"]},{"id":748,"name":"Prédastérie","nameEn":"Toxapex","types":["Poison","Eau"]},{"id":749,"name":"Tiboudet","nameEn":"Mudbray","types":["Sol"]},{"id":750,"name":"Bourrinos","nameEn":"Mudsdale","types":["Sol"]},{"id":751,"name":"Araqua","nameEn":"Dewpider","types":["Eau","Insecte"]},{"id":752,"name":"Tarenbulle","nameEn":"Araquanid","types":["Eau","Insecte"]},{"id":753,"name":"Mimantis","nameEn":"Fomantis","types":["Plante"]},{"id":754,"name":"Floramantis","nameEn":"Lurantis","types":["Plante"]},{"id":755,"name":"Spododo","nameEn":"Morelull","types":["Plante","Fée"]},{"id":756,"name":"Lampignon","nameEn":"Shiinotic","types":["Plante","Fée"]},{"id":757,"name":"Tritox","nameEn":"Salandit","types":["Poison","Feu"]},{"id":758,"name":"Malamandre","nameEn":"Salazzle","types":["Poison","Feu"]},{"id":759,"name":"Nounourson","nameEn":"Stufful","types":["Normal","Combat"]},{"id":760,"name":"Chelours","nameEn":"Bewear","types":["Normal","Combat"]},{"id":761,"name":"Croquine","nameEn":"Bounsweet","types":["Plante"]},{"id":762,"name":"Candine","nameEn":"Steenee","types":["Plante"]},{"id":763,"name":"Sucreine","nameEn":"Tsareena","types":["Plante"]},{"id":764,"name":"Guérilande","nameEn":"Comfey","types":["Fée"]},{"id":765,"name":"Gouroutan","nameEn":"Oranguru","types":["Normal","Psy"]},{"id":766,"name":"Quartermac","nameEn":"Passimian","types":["Combat"]},{"id":767,"name":"Sovkipou","nameEn":"Wimpod","types":["Insecte","Eau"]},{"id":768,"name":"Sarmuraï","nameEn":"Golisopod","types":["Insecte","Eau"]},{"id":769,"name":"Bacabouh","nameEn":"Sandygast","types":["Spectre","Sol"]},{"id":770,"name":"Trépassable","nameEn":"Palossand","types":["Spectre","Sol"]},{"id":771,"name":"Concombaffe","nameEn":"Pyukumuku","types":["Eau"]},{"id":772,"name":"Type:0","nameEn":"Type: Null","types":["Normal"]},{"id":773,"name":"Silvallié","nameEn":"Silvally","types":["Normal"]},{"id":774,"name":"Météno","nameEn":"Minior","types":["Roche","Vol"]},{"id":775,"name":"Dodoala","nameEn":"Komala","types":["Normal"]},{"id":776,"name":"Boumata","nameEn":"Turtonator","types":["Feu","Dragon"]},{"id":777,"name":"Togedemaru","nameEn":"Togedemaru","types":["Électrik","Acier"]},{"id":778,"name":"Mimiqui","nameEn":"Mimikyu","types":["Spectre","Fée"]},{"id":779,"name":"Denticrisse","nameEn":"Bruxish","types":["Eau","Psy"]},{"id":780,"name":"Draïeul","nameEn":"Drampa","types":["Normal","Dragon"]},{"id":781,"name":"Sinistrail","nameEn":"Dhelmise","types":["Spectre","Plante"]},{"id":782,"name":"Bébécaille","nameEn":"Jangmo-o","types":["Dragon"]},{"id":783,"name":"Écaïd","nameEn":"Hakamo-o","types":["Dragon","Combat"]},{"id":784,"name":"Ékaïser","nameEn":"Kommo-o","types":["Dragon","Combat"]},{"id":785,"name":"Tokorico","nameEn":"Tapu Koko","types":["Électrik","Fée"]},{"id":786,"name":"Tokopiyon","nameEn":"Tapu Lele","types":["Psy","Fée"]},{"id":787,"name":"Tokotoro","nameEn":"Tapu Bulu","types":["Plante","Fée"]},{"id":788,"name":"Tokopisco","nameEn":"Tapu Fini","types":["Eau","Fée"]},{"id":789,"name":"Cosmog","nameEn":"Cosmog","types":["Psy"]},{"id":790,"name":"Cosmovum","nameEn":"Cosmoem","types":["Psy"]},{"id":791,"name":"Solgaleo","nameEn":"Solgaleo","types":["Psy","Acier"]},{"id":792,"name":"Lunala","nameEn":"Lunala","types":["Psy","Spectre"]},{"id":793,"name":"Zéroïd","nameEn":"Nihilego","types":["Roche","Poison"]},{"id":794,"name":"Mouscoto","nameEn":"Buzzwole","types":["Insecte","Combat"]},{"id":795,"name":"Cancrelove","nameEn":"Pheromosa","types":["Insecte","Combat"]},{"id":796,"name":"Câblifère","nameEn":"Xurkitree","types":["Électrik"]},{"id":797,"name":"Bamboiselle","nameEn":"Celesteela","types":["Acier","Vol"]},{"id":798,"name":"Katagami","nameEn":"Kartana","types":["Plante","Acier"]},{"id":799,"name":"Engloutyran","nameEn":"Guzzlord","types":["Ténèbres","Dragon"]},{"id":800,"name":"Necrozma","nameEn":"Necrozma","types":["Psy"]},{"id":801,"name":"Magearna","nameEn":"Magearna","types":["Acier","Fée"]},{"id":802,"name":"Marshadow","nameEn":"Marshadow","types":["Combat","Spectre"]},{"id":803,"name":"Vémini","nameEn":"Poipole","types":["Poison"]},{"id":804,"name":"Mandrillon","nameEn":"Naganadel","types":["Poison","Dragon"]},{"id":805,"name":"Ama-Ama","nameEn":"Stakataka","types":["Roche","Acier"]},{"id":806,"name":"Pierroteknik","nameEn":"Blacephalon","types":["Feu","Spectre"]},{"id":807,"name":"Zeraora","nameEn":"Zeraora","types":["Électrik"]},{"id":808,"name":"Meltan","nameEn":"Meltan","types":["Acier"]},{"id":809,"name":"Melmetal","nameEn":"Melmetal","types":["Acier"]},{"id":810,"name":"Ouistempo","nameEn":"Grookey","types":["Plante"]},{"id":811,"name":"Badabouin","nameEn":"Thwackey","types":["Plante"]},{"id":812,"name":"Gorythmic","nameEn":"Rillaboom","types":["Plante"]},{"id":813,"name":"Flambino","nameEn":"Scorbunny","types":["Feu"]},{"id":814,"name":"Lapyro","nameEn":"Raboot","types":["Feu"]},{"id":815,"name":"Pyrobut","nameEn":"Cinderace","types":["Feu"]},{"id":816,"name":"Larméléon","nameEn":"Sobble","types":["Eau"]},{"id":817,"name":"Arrozard","nameEn":"Drizzile","types":["Eau"]},{"id":818,"name":"Lézargus","nameEn":"Inteleon","types":["Eau"]},{"id":819,"name":"Rongourmand","nameEn":"Skwovet","types":["Normal"]},{"id":820,"name":"Rongrigou","nameEn":"Greedent","types":["Normal"]},{"id":821,"name":"Minisange","nameEn":"Rookidee","types":["Vol"]},{"id":822,"name":"Bleuseille","nameEn":"Corvisquire","types":["Vol"]},{"id":823,"name":"Corvaillus","nameEn":"Corviknight","types":["Vol","Acier"]},{"id":824,"name":"Larvadar","nameEn":"Blipbug","types":["Insecte"]},{"id":825,"name":"Coléodôme","nameEn":"Dottler","types":["Insecte","Psy"]},{"id":826,"name":"Astronelle","nameEn":"Orbeetle","types":["Insecte","Psy"]},{"id":827,"name":"Goupilou","nameEn":"Nickit","types":["Ténèbres"]},{"id":828,"name":"Roublenard","nameEn":"Thievul","types":["Ténèbres"]},{"id":829,"name":"Tournicoton","nameEn":"Gossifleur","types":["Plante"]},{"id":830,"name":"Blancoton","nameEn":"Eldegoss","types":["Plante"]},{"id":831,"name":"Moumouton","nameEn":"Wooloo","types":["Normal"]},{"id":832,"name":"Moumouflon","nameEn":"Dubwool","types":["Normal"]},{"id":833,"name":"Khélocrok","nameEn":"Chewtle","types":["Eau"]},{"id":834,"name":"Torgamord","nameEn":"Drednaw","types":["Eau","Roche"]},{"id":835,"name":"Voltoutou","nameEn":"Yamper","types":["Électrik"]},{"id":836,"name":"Fulgudog","nameEn":"Boltund","types":["Électrik"]},{"id":837,"name":"Charbi","nameEn":"Rolycoly","types":["Roche"]},{"id":838,"name":"Wagomine","nameEn":"Carkol","types":["Roche","Feu"]},{"id":839,"name":"Monthracite","nameEn":"Coalossal","types":["Roche","Feu"]},{"id":840,"name":"Verpom","nameEn":"Applin","types":["Plante","Dragon"]},{"id":841,"name":"Pomdrapi","nameEn":"Flapple","types":["Plante","Dragon"]},{"id":842,"name":"Dratatin","nameEn":"Appletun","types":["Plante","Dragon"]},{"id":843,"name":"Dunaja","nameEn":"Silicobra","types":["Sol"]},{"id":844,"name":"Dunaconda","nameEn":"Sandaconda","types":["Sol"]},{"id":845,"name":"Nigosier","nameEn":"Cramorant","types":["Vol","Eau"]},{"id":846,"name":"Embrochet","nameEn":"Arrokuda","types":["Eau"]},{"id":847,"name":"Hastacuda","nameEn":"Barraskewda","types":["Eau"]},{"id":848,"name":"Toxizap","nameEn":"Toxel","types":["Électrik","Poison"]},{"id":849,"name":"Salarsen","nameEn":"Toxtricity","types":["Électrik","Poison"]},{"id":850,"name":"Grillepattes","nameEn":"Sizzlipede","types":["Feu","Insecte"]},{"id":851,"name":"Scolocendre","nameEn":"Centiskorch","types":["Feu","Insecte"]},{"id":852,"name":"Poulpaf","nameEn":"Clobbopus","types":["Combat"]},{"id":853,"name":"Krakos","nameEn":"Grapploct","types":["Combat"]},{"id":854,"name":"Théffroi","nameEn":"Sinistea","types":["Spectre"]},{"id":855,"name":"Polthégeist","nameEn":"Polteageist","types":["Spectre"]},{"id":856,"name":"Bibichut","nameEn":"Hatenna","types":["Psy"]},{"id":857,"name":"Chapotus","nameEn":"Hattrem","types":["Psy"]},{"id":858,"name":"Sorcilence","nameEn":"Hatterene","types":["Psy","Fée"]},{"id":859,"name":"Grimalin","nameEn":"Impidimp","types":["Ténèbres","Fée"]},{"id":860,"name":"Fourbelin","nameEn":"Morgrem","types":["Ténèbres","Fée"]},{"id":861,"name":"Angoliath","nameEn":"Grimmsnarl","types":["Ténèbres","Fée"]},{"id":862,"name":"Ixon","nameEn":"Obstagoon","types":["Ténèbres","Normal"]},{"id":863,"name":"Berserkatt","nameEn":"Perrserker","types":["Acier"]},{"id":864,"name":"Corayôme","nameEn":"Cursola","types":["Spectre"]},{"id":865,"name":"Palarticho","nameEn":"Sirfetch'd","types":["Combat"]},{"id":866,"name":"M. Glaquette","nameEn":"Mr. Rime","types":["Glace","Psy"]},{"id":867,"name":"Tutétékri","nameEn":"Runerigus","types":["Sol","Spectre"]},{"id":868,"name":"Crèmy","nameEn":"Milcery","types":["Fée"]},{"id":869,"name":"Charmilly","nameEn":"Alcremie","types":["Fée"]},{"id":870,"name":"Hexadron","nameEn":"Falinks","types":["Combat"]},{"id":871,"name":"Wattapik","nameEn":"Pincurchin","types":["Électrik"]},{"id":872,"name":"Frissonille","nameEn":"Snom","types":["Glace","Insecte"]},{"id":873,"name":"Beldeneige","nameEn":"Frosmoth","types":["Glace","Insecte"]},{"id":874,"name":"Dolman","nameEn":"Stonjourner","types":["Roche"]},{"id":875,"name":"Bekaglaçon","nameEn":"Eiscue","types":["Glace"]},{"id":876,"name":"Wimessir","nameEn":"Indeedee","types":["Psy","Normal"]},{"id":877,"name":"Morpeko","nameEn":"Morpeko","types":["Électrik","Ténèbres"]},{"id":878,"name":"Charibari","nameEn":"Cufant","types":["Acier"]},{"id":879,"name":"Pachyradjah","nameEn":"Copperajah","types":["Acier"]},{"id":880,"name":"Galvagon","nameEn":"Dracozolt","types":["Électrik","Dragon"]},{"id":881,"name":"Galvagla","nameEn":"Arctozolt","types":["Électrik","Glace"]},{"id":882,"name":"Hydragon","nameEn":"Dracovish","types":["Eau","Dragon"]},{"id":883,"name":"Hydragla","nameEn":"Arctovish","types":["Eau","Glace"]},{"id":884,"name":"Duralugon","nameEn":"Duraludon","types":["Acier","Dragon"]},{"id":885,"name":"Fantyrm","nameEn":"Dreepy","types":["Dragon","Spectre"]},{"id":886,"name":"Dispareptil","nameEn":"Drakloak","types":["Dragon","Spectre"]},{"id":887,"name":"Lanssorien","nameEn":"Dragapult","types":["Dragon","Spectre"]},{"id":888,"name":"Zacian","nameEn":"Zacian","types":["Fée"]},{"id":889,"name":"Zamazenta","nameEn":"Zamazenta","types":["Combat"]},{"id":890,"name":"Éthernatos","nameEn":"Eternatus","types":["Poison","Dragon"]},{"id":891,"name":"Wushours","nameEn":"Kubfu","types":["Combat"]},{"id":892,"name":"Shifours","nameEn":"Urshifu","types":["Combat","Ténèbres"]},{"id":893,"name":"Zarude","nameEn":"Zarude","types":["Ténèbres","Plante"]},{"id":894,"name":"Regieleki","nameEn":"Regieleki","types":["Électrik"]},{"id":895,"name":"Regidrago","nameEn":"Regidrago","types":["Dragon"]},{"id":896,"name":"Blizzeval","nameEn":"Glastrier","types":["Glace"]},{"id":897,"name":"Spectreval","nameEn":"Spectrier","types":["Spectre"]},{"id":898,"name":"Sylveroy","nameEn":"Calyrex","types":["Psy","Plante"]},{"id":899,"name":"Cerbyllin","nameEn":"Wyrdeer","types":["Normal","Psy"]},{"id":900,"name":"Hachécateur","nameEn":"Kleavor","types":["Insecte","Roche"]},{"id":901,"name":"Ursaking","nameEn":"Ursaluna","types":["Sol","Normal"]},{"id":902,"name":"Paragruel","nameEn":"Basculegion","types":["Eau","Spectre"]},{"id":903,"name":"Farfurex","nameEn":"Sneasler","types":["Combat","Poison"]},{"id":904,"name":"Qwilpik","nameEn":"Overqwil","types":["Ténèbres","Poison"]},{"id":905,"name":"Amovénus","nameEn":"Enamorus","types":["Fée","Vol"]},{"id":906,"name":"Poussacha","nameEn":"Sprigatito","types":["Plante"]},{"id":907,"name":"Matourgeon","nameEn":"Floragato","types":["Plante"]},{"id":908,"name":"Miascarade","nameEn":"Meowscarada","types":["Plante","Ténèbres"]},{"id":909,"name":"Chochodile","nameEn":"Fuecoco","types":["Feu"]},{"id":910,"name":"Crocogril","nameEn":"Crocalor","types":["Feu"]},{"id":911,"name":"Flâmigator","nameEn":"Skeledirge","types":["Feu","Spectre"]},{"id":912,"name":"Coiffeton","nameEn":"Quaxly","types":["Eau"]},{"id":913,"name":"Canarbello","nameEn":"Quaxwell","types":["Eau"]},{"id":914,"name":"Palmaval","nameEn":"Quaquaval","types":["Eau","Combat"]},{"id":915,"name":"Gourmelet","nameEn":"Lechonk","types":["Normal"]},{"id":916,"name":"Fragroin","nameEn":"Oinkologne","types":["Normal"]},{"id":917,"name":"Tissenboule","nameEn":"Tarountula","types":["Insecte"]},{"id":918,"name":"Filentrappe","nameEn":"Spidops","types":["Insecte"]},{"id":919,"name":"Lilliterelle","nameEn":"Nymble","types":["Insecte"]},{"id":920,"name":"Gambex","nameEn":"Lokix","types":["Insecte","Ténèbres"]},{"id":921,"name":"Pohm","nameEn":"Pawmi","types":["Électrik"]},{"id":922,"name":"Pohmotte","nameEn":"Pawmo","types":["Électrik","Combat"]},{"id":923,"name":"Pohmarmotte","nameEn":"Pawmot","types":["Électrik","Combat"]},{"id":924,"name":"Compagnol","nameEn":"Tandemaus","types":["Normal"]},{"id":925,"name":"Famignol","nameEn":"Maushold","types":["Normal"]},{"id":926,"name":"Pâtachiot","nameEn":"Fidough","types":["Fée"]},{"id":927,"name":"Briochien","nameEn":"Dachsbun","types":["Fée"]},{"id":928,"name":"Olivini","nameEn":"Smoliv","types":["Plante","Normal"]},{"id":929,"name":"Olivado","nameEn":"Dolliv","types":["Plante","Normal"]},{"id":930,"name":"Arboliva","nameEn":"Arboliva","types":["Plante","Normal"]},{"id":931,"name":"Tapatoès","nameEn":"Squawkabilly","types":["Normal","Vol"]},{"id":932,"name":"Selutin","nameEn":"Nacli","types":["Roche"]},{"id":933,"name":"Amassel","nameEn":"Naclstack","types":["Roche"]},{"id":934,"name":"Gigansel","nameEn":"Garganacl","types":["Roche"]},{"id":935,"name":"Charbambin","nameEn":"Charcadet","types":["Feu"]},{"id":936,"name":"Carmadura","nameEn":"Armarouge","types":["Feu","Psy"]},{"id":937,"name":"Malvalame","nameEn":"Ceruledge","types":["Feu","Spectre"]},{"id":938,"name":"Têtampoule","nameEn":"Tadbulb","types":["Électrik"]},{"id":939,"name":"Ampibidou","nameEn":"Bellibolt","types":["Électrik"]},{"id":940,"name":"Zapétrel","nameEn":"Wattrel","types":["Électrik","Vol"]},{"id":941,"name":"Fulgulairo","nameEn":"Kilowattrel","types":["Électrik","Vol"]},{"id":942,"name":"Grondogue","nameEn":"Maschiff","types":["Ténèbres"]},{"id":943,"name":"Dogrino","nameEn":"Mabosstiff","types":["Ténèbres"]},{"id":944,"name":"Gribouraigne","nameEn":"Shroodle","types":["Poison","Normal"]},{"id":945,"name":"Tag-Tag","nameEn":"Grafaiai","types":["Poison","Normal"]},{"id":946,"name":"Virovent","nameEn":"Bramblin","types":["Plante","Spectre"]},{"id":947,"name":"Virevorreur","nameEn":"Brambleghast","types":["Plante","Spectre"]},{"id":948,"name":"Terracool","nameEn":"Toedscool","types":["Sol","Plante"]},{"id":949,"name":"Terracruel","nameEn":"Toedscruel","types":["Sol","Plante"]},{"id":950,"name":"Craparoi","nameEn":"Klawf","types":["Roche"]},{"id":951,"name":"Pimito","nameEn":"Capsakid","types":["Plante"]},{"id":952,"name":"Scovilain","nameEn":"Scovillain","types":["Plante","Feu"]},{"id":953,"name":"Léboulérou","nameEn":"Rellor","types":["Insecte"]},{"id":954,"name":"Bérasca","nameEn":"Rabsca","types":["Insecte","Psy"]},{"id":955,"name":"Flotillon","nameEn":"Flittle","types":["Psy"]},{"id":956,"name":"Cléopsytra","nameEn":"Espathra","types":["Psy"]},{"id":957,"name":"Forgerette","nameEn":"Tinkatink","types":["Fée","Acier"]},{"id":958,"name":"Forgella","nameEn":"Tinkatuff","types":["Fée","Acier"]},{"id":959,"name":"Forgelina","nameEn":"Tinkaton","types":["Fée","Acier"]},{"id":960,"name":"Taupikeau","nameEn":"Wiglett","types":["Eau"]},{"id":961,"name":"Triopikeau","nameEn":"Wugtrio","types":["Eau"]},{"id":962,"name":"Lestombaile","nameEn":"Bombirdier","types":["Vol","Ténèbres"]},{"id":963,"name":"Dofin","nameEn":"Finizen","types":["Eau"]},{"id":964,"name":"Superdofin","nameEn":"Palafin","types":["Eau"]},{"id":965,"name":"Vrombi","nameEn":"Varoom","types":["Acier","Poison"]},{"id":966,"name":"Vrombotor","nameEn":"Revavroom","types":["Acier","Poison"]},{"id":967,"name":"Motorizard","nameEn":"Cyclizar","types":["Dragon","Normal"]},{"id":968,"name":"Ferdeter","nameEn":"Orthworm","types":["Acier"]},{"id":969,"name":"Germéclat","nameEn":"Glimmet","types":["Roche","Poison"]},{"id":970,"name":"Floréclat","nameEn":"Glimmora","types":["Roche","Poison"]},{"id":971,"name":"Toutombe","nameEn":"Greavard","types":["Spectre"]},{"id":972,"name":"Tomberro","nameEn":"Houndstone","types":["Spectre"]},{"id":973,"name":"Flamenroule","nameEn":"Flamigo","types":["Vol","Combat"]},{"id":974,"name":"Piétacé","nameEn":"Cetoddle","types":["Glace"]},{"id":975,"name":"Balbalèze","nameEn":"Cetitan","types":["Glace"]},{"id":976,"name":"Délestin","nameEn":"Veluza","types":["Eau","Psy"]},{"id":977,"name":"Oyacata","nameEn":"Dondozo","types":["Eau"]},{"id":978,"name":"Nigirigon","nameEn":"Tatsugiri","types":["Dragon","Eau"]},{"id":979,"name":"Courrousinge","nameEn":"Annihilape","types":["Combat","Spectre"]},{"id":980,"name":"Terraiste","nameEn":"Clodsire","types":["Poison","Sol"]},{"id":981,"name":"Farigiraf","nameEn":"Farigiraf","types":["Normal","Psy"]},{"id":982,"name":"Deusolourdo","nameEn":"Dudunsparce","types":["Normal"]},{"id":983,"name":"Scalpereur","nameEn":"Kingambit","types":["Ténèbres","Acier"]},{"id":984,"name":"Fort-Ivoire","nameEn":"Great Tusk","types":["Sol","Combat"]},{"id":985,"name":"Hurle-Queue","nameEn":"Scream Tail","types":["Fée","Psy"]},{"id":986,"name":"Fongus-Furie","nameEn":"Brute Bonnet","types":["Plante","Ténèbres"]},{"id":987,"name":"Flotte-Mèche","nameEn":"Flutter Mane","types":["Spectre","Fée"]},{"id":988,"name":"Rampe-Ailes","nameEn":"Slither Wing","types":["Insecte","Combat"]},{"id":989,"name":"Pelage-Sablé","nameEn":"Sandy Shocks","types":["Électrik","Sol"]},{"id":990,"name":"Roue-de-Fer","nameEn":"Iron Treads","types":["Sol","Acier"]},{"id":991,"name":"Hotte-de-Fer","nameEn":"Iron Bundle","types":["Glace","Eau"]},{"id":992,"name":"Paume-de-Fer","nameEn":"Iron Hands","types":["Combat","Électrik"]},{"id":993,"name":"Têtes-de-Fer","nameEn":"Iron Jugulis","types":["Ténèbres","Vol"]},{"id":994,"name":"Mite-de-Fer","nameEn":"Iron Moth","types":["Feu","Poison"]},{"id":995,"name":"Épine-de-Fer","nameEn":"Iron Thorns","types":["Roche","Électrik"]},{"id":996,"name":"Frigodo","nameEn":"Frigibax","types":["Dragon","Glace"]},{"id":997,"name":"Cryodo","nameEn":"Arctibax","types":["Dragon","Glace"]},{"id":998,"name":"Glaivodo","nameEn":"Baxcalibur","types":["Dragon","Glace"]},{"id":999,"name":"Mordudor","nameEn":"Gimmighoul","types":["Spectre"]},{"id":1000,"name":"Gromago","nameEn":"Gholdengo","types":["Acier","Spectre"]},{"id":1001,"name":"Chongjian","nameEn":"Wo-Chien","types":["Ténèbres","Plante"]},{"id":1002,"name":"Baojian","nameEn":"Chien-Pao","types":["Ténèbres","Glace"]},{"id":1003,"name":"Dinglu","nameEn":"Ting-Lu","types":["Ténèbres","Sol"]},{"id":1004,"name":"Yuyu","nameEn":"Chi-Yu","types":["Ténèbres","Feu"]},{"id":1005,"name":"Rugit-Lune","nameEn":"Roaring Moon","types":["Dragon","Ténèbres"]},{"id":1006,"name":"Garde-de-Fer","nameEn":"Iron Valiant","types":["Fée","Combat"]},{"id":1007,"name":"Koraidon","nameEn":"Koraidon","types":["Combat","Dragon"]},{"id":1008,"name":"Miraidon","nameEn":"Miraidon","types":["Électrik","Dragon"]},{"id":1009,"name":"Serpente-Eau","nameEn":"Walking Wake","types":["Eau","Dragon"]},{"id":1010,"name":"Vert-de-Fer","nameEn":"Iron Leaves","types":["Plante","Psy"]},{"id":1011,"name":"Pomdramour","nameEn":"Dipplin","types":["Plante","Dragon"]},{"id":1012,"name":"Poltchageist","nameEn":"Poltchageist","types":["Plante","Spectre"]},{"id":1013,"name":"Théffroyable","nameEn":"Sinistcha","types":["Plante","Spectre"]},{"id":1014,"name":"Félicanis","nameEn":"Okidogi","types":["Poison","Combat"]},{"id":1015,"name":"Fortusimia","nameEn":"Munkidori","types":["Poison","Psy"]},{"id":1016,"name":"Favianos","nameEn":"Fezandipiti","types":["Poison","Fée"]},{"id":1017,"name":"Ogerpon","nameEn":"Ogerpon","types":["Plante"]},{"id":1018,"name":"Pondralugon","nameEn":"Archaludon","types":["Acier","Dragon"]},{"id":1019,"name":"Pomdorochi","nameEn":"Hydrapple","types":["Plante","Dragon"]},{"id":1020,"name":"Feu-Perçant","nameEn":"Gouging Fire","types":["Feu","Dragon"]},{"id":1021,"name":"Ire-Foudre","nameEn":"Raging Bolt","types":["Électrik","Dragon"]},{"id":1022,"name":"Roc-de-Fer","nameEn":"Iron Boulder","types":["Roche","Psy"]},{"id":1023,"name":"Chef-de-Fer","nameEn":"Iron Crown","types":["Acier","Psy"]},{"id":1024,"name":"Terapagos","nameEn":"Terapagos","types":["Normal"]},{"id":1025,"name":"Pêchaminus","nameEn":"Pecharunt","types":["Poison","Spectre"]}];

const POKEMON_BY_ID = new Map(POKEMON_DATABASE.map(p => [p.id, p]));

const TYPE_TRANSLATIONS_EN = {
  "Plante": "Grass",
  "Poison": "Poison",
  "Feu": "Fire",
  "Eau": "Water",
  "Insecte": "Bug",
  "Vol": "Flying",
  "Normal": "Normal",
  "Électrik": "Electric",
  "Sol": "Ground",
  "Fée": "Fairy",
  "Combat": "Fighting",
  "Psy": "Psychic",
  "Roche": "Rock",
  "Acier": "Steel",
  "Glace": "Ice",
  "Spectre": "Ghost",
  "Dragon": "Dragon",
  "Ténèbres": "Dark"
};

const GENERATIONS = [
  { id: "all", nameFr: "Toutes les générations", nameEn: "All Generations", min: 1, max: 1025 },
  { id: "gen1", nameFr: "Gen 1 (Kanto #001 - #151)", nameEn: "Gen 1 (Kanto #001 - #151)", min: 1, max: 151 },
  { id: "gen2", nameFr: "Gen 2 (Johto #152 - #251)", nameEn: "Gen 2 (Johto #152 - #251)", min: 152, max: 251 },
  { id: "gen3", nameFr: "Gen 3 (Hoenn #252 - #386)", nameEn: "Gen 3 (Hoenn #252 - #386)", min: 252, max: 386 },
  { id: "gen4", nameFr: "Gen 4 (Sinnoh #387 - #493)", nameEn: "Gen 4 (Sinnoh #387 - #493)", min: 387, max: 493 },
  { id: "gen5", nameFr: "Gen 5 (Unys #494 - #649)", nameEn: "Gen 5 (Unova #494 - #649)", min: 494, max: 649 },
  { id: "gen6", nameFr: "Gen 6 (Kalos #650 - #721)", nameEn: "Gen 6 (Kalos #650 - #721)", min: 650, max: 721 },
  { id: "gen7", nameFr: "Gen 7 (Alola #722 - #809)", nameEn: "Gen 7 (Alola #722 - #809)", min: 722, max: 809 },
  { id: "gen8", nameFr: "Gen 8 (Galar #810 - #905)", nameEn: "Gen 8 (Galar #810 - #905)", min: 810, max: 905 },
  { id: "gen9", nameFr: "Gen 9 (Paldea #906 - #1025)", nameEn: "Gen 9 (Paldea #906 - #1025)", min: 906, max: 1025 }
];

const I18N = {
  fr: {
    ribbonOpenPokedex: "Ouvrir le Pokédex",
    cmdOpenPokedex: "Ouvrir le Pokédex",
    cmdDownloadSprites: "Télécharger les 2050 sprites Pokémon (Hors-Ligne)",
    cmdTestEncounter: "Tester une apparition de Pokémon",
    cmdTestShiny: "Tester une apparition de Pokémon Shiny",
    activeNoteFile: "Note active.md",
    activeNoteTitle: "Note active",
    testNoteFile: "Note de test.md",
    testNoteTitle: "Note de test",
    noticeDownloadInProgress: "⏳ Un téléchargement de sprites est déjà en cours...",
    noticeFsError: "❌ Impossible d'accéder au système de fichiers d'Obsidian.",
    noticeDownloadStart: "📥 Début du téléchargement des 2050 sprites Pokémon...",
    noticeDownloadPaused: "⏸️ Téléchargement interrompu ({ready}/{total} sprites prêts). Vous pourrez reprendre à tout moment.",
    noticeDownloadErrors: "⚠️ Téléchargement terminé avec {failed} erreur(s) ({ready}/{total} sprites installés). Relancez pour compléter.",
    noticeDownloadComplete: "🎉 Les 2050 sprites Pokémon (Normaux + Shiny) sont installés en local !",
    noticeCaught: "🎉 {name} #{id}{tags} attrapé !",
    hudClickTooltip: "Cliquer pour ouvrir le Pokédex",
    headerTitle: "Pokédex National",
    headerSubtitle: "1025 Pokémon découverts et capturés au fil de votre écriture dans Obsidian.",
    bannerTitle: "📦 Pack d'Animations Hors-Ligne (2050 GIFs)",
    bannerDownloading: "Téléchargement depuis PokéAPI / Showdown en cours : {current} / {total} ({pct}%)...",
    bannerPauseBtn: "⏸️ Mettre en pause",
    bannerDesc: "Les GIFs ne sont pas inclus par défaut (droits d'auteur). Téléchargez-les en 1 clic pour un affichage instantané 100% hors-ligne.",
    bannerResumeBtn: "📥 Reprendre le téléchargement des GIFs",
    bannerDownloadBtn: "📥 Télécharger les 2050 GIFs",
    statTotalCaught: "Total Capturés",
    statUniquePokemon: "Pokémon Uniques",
    statCompletion: "Complétion Pokédex",
    statShinyPokemon: "Pokémon Shiny",
    tabJournal: "📋 Journal des Captures ({count})",
    tabGrid: "🗂️ Grille Pokédex ({total})",
    searchPlaceholder: "🔍 Rechercher un Pokémon, une note ou un type...",
    sortDateDesc: "Date (plus récent)",
    sortDateAsc: "Date (plus ancien)",
    sortIdAsc: "N° Pokédex (1 à 1025)",
    sortNameAsc: "Nom (A - Z)",
    emptyTitle: "Aucun Pokémon trouvé",
    emptySearchDesc: "Aucun résultat ne correspond à votre recherche.",
    emptyInitialDesc: "Écrivez du texte dans vos notes pour commencer à attraper des Pokémon !",
    thSprite: "Sprite",
    thName: "N° & Pokémon",
    thTypes: "Types",
    thDate: "Date de Capture",
    thDoc: "Document Source",
    thActions: "Actions",
    unknownDate: "Date inconnue",
    deleteTooltip: "Supprimer cette capture",
    noticeDeleted: "Supprimé : {name}",
    normalCountTooltip: "{count} capture(s) normale(s)",
    shinyCountTooltip: "{count} capture(s) en version Shiny ✨",
    noticeDocNotFound: "Document introuvable : {path}",
    modalResetTitle: "Vider tout le Pokédex ?",
    modalResetDesc: "Voulez-vous vraiment effacer tout votre historique de Pokédex ? Cette action est irréversible.",
    modalCancelBtn: "Annuler",
    modalConfirmBtn: "Confirmer la suppression",
    settingsLangHeading: "Langue / Language",
    settingsLangName: "Langue de l'interface et des Pokémon",
    settingsLangDesc: "Choisissez la langue des noms des 1025 Pokémon, des types et de l'interface.",
    settingsLangAuto: "Automatique (selon la langue d'Obsidian)",
    settingsSpritesHeading: "Pack d'animations hors-ligne (2050 GIFs)",
    settingsSpritesInstalledName: "Sprites locaux : Installés",
    settingsSpritesMissingName: "Sprites locaux : Non installés",
    settingsSpritesInstalledDesc: "✅ Les 2050 animations GIF (1025 Normaux + 1025 Shiny) sont installées dans le dossier local 'sprites/'.",
    settingsSpritesMissingDesc: "🌐 Les GIFs ne sont pas fournis avec le plugin (respect des droits d'auteur). Téléchargez-les gratuitement en 1 clic depuis PokéAPI / Showdown pour activer le mode 100% hors-ligne.",
    settingsProgressLabel: "⏳ Téléchargement en cours : {current} / {total} fichiers ({pct}%)",
    settingsRepairBtn: "🔄 Vérifier / Réparer les GIFs",
    settingsResumeBtn: "📥 Reprendre le téléchargement",
    settingsCatchHeading: "Préférences de capture",
    settingsFreqName: "Fréquence d'apparition (Caractères)",
    settingsFreqDesc: "Nombre de caractères à taper dans une note pour faire apparaître et capturer un Pokémon.",
    settingsPosName: "Position de l'animation d'apparition",
    settingsPosDesc: "Emplacement de la bannière de capture sur l'écran.",
    settingsPosRight: "En bas à droite",
    settingsPosCenter: "En bas au centre",
    settingsPosLeft: "En bas à gauche",
    settingsAnimName: "Afficher l'animation de capture",
    settingsAnimDesc: "Affiche la Pokéball animée et le Pokémon lors de chaque capture.",
    settingsSoundName: "Effets sonores 8-bit",
    settingsSoundDesc: "Joue une mélodie rétro 8-bit lors de la capture d'un Pokémon (synthèse audio sans fichier externe).",
    settingsTestNormalName: "Tester une capture normale",
    settingsTestNormalDesc: "Déclenche immédiatement une capture de test normale.",
    settingsTestNormalBtn: "Tester normale",
    settingsTestShinyName: "Tester une capture Shiny (✨)",
    settingsTestShinyDesc: "Déclenche immédiatement une capture de test d'un Pokémon Shiny.",
    settingsTestShinyBtn: "Tester Shiny ✨",
    settingsDataHeading: "Gestion des données",
    settingsResetCountName: "Réinitialiser la progression actuelle",
    settingsResetCountDesc: "Remet le compteur de frappe actuel à zéro.",
    settingsResetCountBtn: "Remettre à 0",
    noticeCountReset: "Compteur réinitialisé à 0.",
    settingsClearAllName: "Vider tout le Pokédex",
    settingsClearAllDesc: "Attention : supprime définitivement toutes les captures enregistrées.",
    settingsClearAllBtn: "Vider le Pokédex",
    noticePokedexCleared: "Pokédex vidé."
  },
  en: {
    ribbonOpenPokedex: "Open Pokédex",
    cmdOpenPokedex: "Open Pokédex",
    cmdDownloadSprites: "Download all 2050 Pokémon sprites (Offline Pack)",
    cmdTestEncounter: "Test a normal Pokémon encounter",
    cmdTestShiny: "Test a Shiny Pokémon encounter",
    activeNoteFile: "Active note.md",
    activeNoteTitle: "Active note",
    testNoteFile: "Test note.md",
    testNoteTitle: "Test note",
    noticeDownloadInProgress: "⏳ Sprite download is already in progress...",
    noticeFsError: "❌ Unable to access Obsidian file system.",
    noticeDownloadStart: "📥 Starting download of 2050 Pokémon sprites...",
    noticeDownloadPaused: "⏸️ Download paused ({ready}/{total} sprites ready). You can resume anytime.",
    noticeDownloadErrors: "⚠️ Download finished with {failed} error(s) ({ready}/{total} sprites installed). Run again to complete.",
    noticeDownloadComplete: "🎉 All 2050 Pokémon sprites (Normal + Shiny) are now installed locally!",
    noticeCaught: "🎉 Caught {name} #{id}{tags}!",
    hudClickTooltip: "Click to open Pokédex",
    headerTitle: "National Pokédex",
    headerSubtitle: "1025 Pokémon discovered and caught as you write in your notes.",
    bannerTitle: "📦 Offline Animation Pack (2050 GIFs)",
    bannerDownloading: "Downloading from PokéAPI / Showdown: {current} / {total} ({pct}%)...",
    bannerPauseBtn: "⏸️ Pause",
    bannerDesc: "GIFs are not bundled by default (copyright compliance). Download them in 1 click for instant 100% offline display.",
    bannerResumeBtn: "📥 Resume GIF download",
    bannerDownloadBtn: "📥 Download 2050 GIFs",
    statTotalCaught: "Total Caught",
    statUniquePokemon: "Unique Pokémon",
    statCompletion: "Pokédex Completion",
    statShinyPokemon: "Shiny Pokémon",
    tabJournal: "📋 Catch Log ({count})",
    tabGrid: "🗂️ Pokédex Grid ({total})",
    searchPlaceholder: "🔍 Search Pokémon, note, or type...",
    sortDateDesc: "Date (newest first)",
    sortDateAsc: "Date (oldest first)",
    sortIdAsc: "Pokédex # (1 to 1025)",
    sortNameAsc: "Name (A - Z)",
    emptyTitle: "No Pokémon found",
    emptySearchDesc: "No results match your search query.",
    emptyInitialDesc: "Start typing in your notes to encounter and catch wild Pokémon!",
    thSprite: "Sprite",
    thName: "# & Pokémon",
    thTypes: "Types",
    thDate: "Caught Date",
    thDoc: "Source Note",
    thActions: "Actions",
    unknownDate: "Unknown date",
    deleteTooltip: "Delete this catch",
    noticeDeleted: "Deleted: {name}",
    normalCountTooltip: "{count} normal catch(es)",
    shinyCountTooltip: "{count} Shiny ✨ catch(es)",
    noticeDocNotFound: "Note not found: {path}",
    modalResetTitle: "Clear entire Pokédex?",
    modalResetDesc: "Are you sure you want to permanently delete your entire Pokédex catch history? This cannot be undone.",
    modalCancelBtn: "Cancel",
    modalConfirmBtn: "Confirm deletion",
    settingsLangHeading: "Language / Langue",
    settingsLangName: "Interface & Pokémon language",
    settingsLangDesc: "Choose the display language for all 1025 Pokémon names, types, and the plugin interface.",
    settingsLangAuto: "Automatic (match Obsidian language)",
    settingsSpritesHeading: "Offline animation pack (2050 GIFs)",
    settingsSpritesInstalledName: "Local sprites: Installed",
    settingsSpritesMissingName: "Local sprites: Not installed",
    settingsSpritesInstalledDesc: "✅ All 2050 animated GIFs (1025 Normal + 1025 Shiny) are installed in the local 'sprites/' folder.",
    settingsSpritesMissingDesc: "🌐 GIFs are not bundled with the plugin (copyright compliance). Download them for free in 1 click from PokéAPI / Showdown to enable 100% offline mode.",
    settingsProgressLabel: "⏳ Downloading: {current} / {total} files ({pct}%)",
    settingsRepairBtn: "🔄 Verify / Repair GIFs",
    settingsResumeBtn: "📥 Resume download",
    settingsCatchHeading: "Catch preferences",
    settingsFreqName: "Encounter frequency (Characters)",
    settingsFreqDesc: "Number of characters to type in a note to trigger a wild Pokémon encounter and catch.",
    settingsPosName: "Encounter animation position",
    settingsPosDesc: "Screen position of the minimalist catch HUD banner.",
    settingsPosRight: "Bottom right",
    settingsPosCenter: "Bottom center",
    settingsPosLeft: "Bottom left",
    settingsAnimName: "Show catch animation",
    settingsAnimDesc: "Display the animated Pokéball and Pokémon during each catch.",
    settingsSoundName: "8-bit sound effects",
    settingsSoundDesc: "Play a retro 8-bit victory jingle when catching a Pokémon (synthesized Web Audio, no external files).",
    settingsTestNormalName: "Test normal catch",
    settingsTestNormalDesc: "Immediately trigger a test normal Pokémon catch.",
    settingsTestNormalBtn: "Test normal",
    settingsTestShinyName: "Test Shiny catch (✨)",
    settingsTestShinyDesc: "Immediately trigger a test Shiny Pokémon catch.",
    settingsTestShinyBtn: "Test Shiny ✨",
    settingsDataHeading: "Data management",
    settingsResetCountName: "Reset current keystroke counter",
    settingsResetCountDesc: "Reset the current typing progress counter back to zero.",
    settingsResetCountBtn: "Reset to 0",
    noticeCountReset: "Counter reset to 0.",
    settingsClearAllName: "Clear entire Pokédex",
    settingsClearAllDesc: "Warning: permanently deletes all recorded Pokémon catches.",
    settingsClearAllBtn: "Clear Pokédex",
    noticePokedexCleared: "Pokédex cleared."
  }
};

function playCatchSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [
      { f: 523.25, d: 0.09, t: 0.0 },
      { f: 659.25, d: 0.09, t: 0.11 },
      { f: 783.99, d: 0.09, t: 0.22 },
      { f: 1046.50, d: 0.35, t: 0.33 }
    ];
    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(n.f, ctx.currentTime + n.t);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.t + n.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + n.t);
      osc.stop(ctx.currentTime + n.t + n.d);
    });
  } catch (e) {
    // Silently continue if audio context is blocked
  }
}

// ============================================================================
// MAIN PLUGIN CLASS
// ============================================================================
class PokemonPokedexPlugin extends Plugin {
  async onload() {
    this.hasLocalSprites = false;
    this.hasAnyLocalSprite = false;
    this.isDownloadingSprites = false;
    this.cancelSpriteDownload = false;
    this.downloadProgress = { current: 0, total: TOTAL_POKEMON * 2, failed: 0 };

    await this.loadPluginData();
    await this.checkLocalSpritesStatus();

    addIcon("pokeball", POKEBALL_SVG);

    // Register Pokédex ItemView
    this.registerView(
      VIEW_TYPE_POKEDEX,
      (leaf) => new PokedexView(leaf, this)
    );

    // Add ribbon icon
    this.addRibbonIcon("pokeball", this.t("ribbonOpenPokedex"), () => {
      this.activatePokedexView();
    });

    // Add Command Palette commands
    this.addCommand({
      id: "open-pokedex",
      name: this.t("cmdOpenPokedex"),
      callback: () => this.activatePokedexView()
    });

    this.addCommand({
      id: "download-pokemon-sprites",
      name: this.t("cmdDownloadSprites"),
      callback: () => {
        this.downloadAllSprites();
      }
    });

    this.addCommand({
      id: "test-encounter-pokemon",
      name: this.t("cmdTestEncounter"),
      callback: () => {
        const activeFile = this.app.workspace.getActiveFile();
        const docPath = activeFile ? activeFile.path : this.t("activeNoteFile");
        const docTitle = activeFile ? activeFile.basename : this.t("activeNoteTitle");
        this.triggerEncounter(docPath, docTitle, false);
      }
    });

    this.addCommand({
      id: "test-shiny-pokemon",
      name: this.t("cmdTestShiny"),
      callback: () => {
        const activeFile = this.app.workspace.getActiveFile();
        const docPath = activeFile ? activeFile.path : this.t("activeNoteFile");
        const docTitle = activeFile ? activeFile.basename : this.t("activeNoteTitle");
        this.triggerEncounter(docPath, docTitle, true);
      }
    });

    // Register Settings Tab
    this.addSettingTab(new PokemonSettingTab(this.app, this));

    // Register typing tracker
    this.registerTypingTracker();

    // Add status bar indicator
    this.statusBarEl = this.addStatusBarItem();
    this.updateStatusBar();
  }

  onunload() {
    this.cancelSpriteDownload = true;
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    if (this.currentNotificationEl && this.currentNotificationEl.parentNode) {
      this.currentNotificationEl.parentNode.removeChild(this.currentNotificationEl);
    }
  }

  getLang() {
    const pref = this.settings && this.settings.language ? this.settings.language : "auto";
    if (pref === "fr" || pref === "en") return pref;
    try {
      const obsLang = window.localStorage ? window.localStorage.getItem("language") : "";
      if (obsLang && obsLang.toLowerCase().startsWith("fr")) return "fr";
      if (obsLang && obsLang.length > 0) return "en";
      if (navigator.language && navigator.language.toLowerCase().startsWith("fr")) return "fr";
    } catch (e) {
      // Fallback below
    }
    return "en";
  }

  t(key, vars = {}) {
    const lang = this.getLang();
    const dict = I18N[lang] || I18N.en;
    let str = dict[key] !== undefined ? dict[key] : (I18N.en[key] || key);
    Object.keys(vars).forEach(k => {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(vars[k]));
    });
    return str;
  }

  getPokemonName(pkmOrId, fallbackName = "") {
    const pkm = typeof pkmOrId === "number" ? POKEMON_BY_ID.get(pkmOrId) : pkmOrId;
    if (!pkm) return fallbackName;
    return this.getLang() === "en" ? (pkm.nameEn || pkm.name) : pkm.name;
  }

  getTypeName(typeFr) {
    if (this.getLang() === "en") {
      return TYPE_TRANSLATIONS_EN[typeFr] || typeFr;
    }
    return typeFr;
  }

  getPluginDir() {
    if (this.manifest && this.manifest.dir) {
      return this.manifest.dir;
    }
    const configDir = (this.app && this.app.vault && this.app.vault.configDir) ? this.app.vault.configDir : ".obsidian";
    const pluginId = (this.manifest && this.manifest.id) ? this.manifest.id : "pokemon-typing-pokedex";
    return `${configDir}/plugins/${pluginId}`;
  }

  async checkLocalSpritesStatus() {
    try {
      const adapter = this.app && this.app.vault ? this.app.vault.adapter : null;
      if (!adapter || typeof adapter.exists !== "function") {
        this.hasLocalSprites = false;
        this.hasAnyLocalSprite = false;
        return false;
      }
      const pluginDir = this.getPluginDir();
      const firstNormal = await adapter.exists(`${pluginDir}/sprites/1.gif`);
      const lastNormal = await adapter.exists(`${pluginDir}/sprites/${TOTAL_POKEMON}.gif`);
      const lastShiny = await adapter.exists(`${pluginDir}/sprites/shiny/${TOTAL_POKEMON}.gif`);
      this.hasAnyLocalSprite = firstNormal;
      this.hasLocalSprites = firstNormal && lastNormal && lastShiny;
      return this.hasLocalSprites;
    } catch (e) {
      this.hasLocalSprites = false;
      this.hasAnyLocalSprite = false;
      return false;
    }
  }

  getOnlineSpriteUrl(pokemonId, isShiny, useFallbackPng = false) {
    const shinyPrefix = isShiny ? "shiny/" : "";
    if (useFallbackPng) {
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shinyPrefix}${pokemonId}.png`;
    }
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${shinyPrefix}${pokemonId}.gif`;
  }

  getPokemonSpriteUrl(pokemonId, isShiny) {
    if (this.hasLocalSprites || this.hasAnyLocalSprite) {
      const pluginDir = this.getPluginDir();
      const subPath = isShiny ? "sprites/shiny" : "sprites";
      const relativePath = `${pluginDir}/${subPath}/${pokemonId}.gif`;

      if (this.app && this.app.vault && this.app.vault.adapter && typeof this.app.vault.adapter.getResourcePath === "function") {
        return this.app.vault.adapter.getResourcePath(relativePath);
      }
    }

    // Online URL if local sprites are not yet downloaded
    return this.getOnlineSpriteUrl(pokemonId, isShiny, false);
  }

  applySpriteWithFallback(imgEl, pokemonId, isShiny) {
    const useLocalFirst = this.hasLocalSprites || this.hasAnyLocalSprite;
    imgEl.dataset.fallbackStep = useLocalFirst ? "0" : "1";
    imgEl.onerror = () => {
      const step = imgEl.dataset.fallbackStep;
      if (step === "0") {
        imgEl.dataset.fallbackStep = "1";
        imgEl.src = this.getOnlineSpriteUrl(pokemonId, isShiny, false);
      } else if (step === "1") {
        imgEl.dataset.fallbackStep = "2";
        imgEl.src = this.getOnlineSpriteUrl(pokemonId, isShiny, true);
      } else {
        imgEl.onerror = null;
      }
    };
    imgEl.src = this.getPokemonSpriteUrl(pokemonId, isShiny);
  }

  async fetchSpriteBinary(pokemonId, isShiny) {
    const primaryUrl = this.getOnlineSpriteUrl(pokemonId, isShiny, false);
    try {
      const res = await requestUrl({ url: primaryUrl, throw: false });
      if (res && res.status === 200 && res.arrayBuffer && res.arrayBuffer.byteLength > 0) {
        return res.arrayBuffer;
      }
    } catch (e) {
      // Fallback to PNG below
    }

    const fallbackUrl = this.getOnlineSpriteUrl(pokemonId, isShiny, true);
    const resFallback = await requestUrl({ url: fallbackUrl, throw: false });
    if (resFallback && resFallback.status === 200 && resFallback.arrayBuffer && resFallback.arrayBuffer.byteLength > 0) {
      return resFallback.arrayBuffer;
    }
    throw new Error(`Failed to download sprite #${pokemonId}`);
  }

  async downloadAllSprites(onProgress = null, forceRedownload = false) {
    if (this.isDownloadingSprites) {
      new Notice(this.t("noticeDownloadInProgress"));
      return;
    }

    const adapter = this.app && this.app.vault ? this.app.vault.adapter : null;
    if (!adapter || typeof adapter.writeBinary !== "function") {
      new Notice(this.t("noticeFsError"));
      return;
    }

    this.isDownloadingSprites = true;
    this.cancelSpriteDownload = false;

    const pluginDir = this.getPluginDir();
    const spritesDir = `${pluginDir}/sprites`;
    const shinyDir = `${pluginDir}/sprites/shiny`;

    try {
      if (!(await adapter.exists(spritesDir))) {
        await adapter.mkdir(spritesDir);
      }
      if (!(await adapter.exists(shinyDir))) {
        await adapter.mkdir(shinyDir);
      }
    } catch (err) {
      // Directory may already exist
    }

    const tasks = [];
    for (let id = 1; id <= TOTAL_POKEMON; id++) {
      tasks.push({ id, isShiny: false, relPath: `${spritesDir}/${id}.gif` });
      tasks.push({ id, isShiny: true, relPath: `${shinyDir}/${id}.gif` });
    }

    const total = tasks.length;
    let completed = 0;
    let failed = 0;
    let currentIndex = 0;
    this.downloadProgress = { current: 0, total, failed: 0 };

    new Notice(this.t("noticeDownloadStart"));
    this.notifyViewsToRefresh();

    const notifyProgress = () => {
      this.downloadProgress = { current: completed, total, failed };
      if (typeof onProgress === "function") {
        onProgress(completed, total, failed);
      }
      const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_POKEDEX);
      leaves.forEach(leaf => {
        if (leaf.view instanceof PokedexView && typeof leaf.view.updateDownloadBannerUI === "function") {
          leaf.view.updateDownloadBannerUI();
        }
      });
    };

    const CONCURRENCY = 16;
    const workers = Array.from({ length: CONCURRENCY }, async () => {
      while (currentIndex < total && !this.cancelSpriteDownload) {
        const taskIndex = currentIndex++;
        const task = tasks[taskIndex];
        try {
          const exists = !forceRedownload && (await adapter.exists(task.relPath));
          if (!exists) {
            const buffer = await this.fetchSpriteBinary(task.id, task.isShiny);
            await adapter.writeBinary(task.relPath, buffer);
            this.hasAnyLocalSprite = true;
          }
          completed++;
        } catch (err) {
          failed++;
          completed++;
        }

        if (completed % 10 === 0 || completed === total) {
          notifyProgress();
        }
      }
    });

    await Promise.all(workers);

    const wasCancelled = this.cancelSpriteDownload;
    this.isDownloadingSprites = false;
    this.cancelSpriteDownload = false;

    await this.checkLocalSpritesStatus();
    notifyProgress();
    this.notifyViewsToRefresh();

    if (wasCancelled) {
      new Notice(this.t("noticeDownloadPaused", { ready: completed - failed, total }));
    } else if (failed > 0) {
      new Notice(this.t("noticeDownloadErrors", { failed, ready: completed - failed, total }));
    } else {
      new Notice(this.t("noticeDownloadComplete"));
    }
  }

  async loadPluginData() {
    const loaded = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loaded ? loaded.settings : {});
    this.catches = (loaded && Array.isArray(loaded.catches)) ? loaded.catches : [];
  }

  async savePluginData() {
    await this.saveData({
      settings: this.settings,
      catches: this.catches
    });
    this.updateStatusBar();
    this.notifyViewsToRefresh();
  }

  updateStatusBar() {
    if (!this.statusBarEl) return;
    const current = this.settings.currentKeystrokeCount;
    const max = this.settings.charactersPerPokemon;
    this.statusBarEl.setText(`Pokemon : ${current}/${max}`);
    this.statusBarEl.setAttribute("title", `Pokemon : ${current}/${max}`);
  }

  notifyViewsToRefresh() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_POKEDEX);
    leaves.forEach(leaf => {
      if (leaf.view instanceof PokedexView) {
        leaf.view.refresh();
      }
    });
  }

  registerTypingTracker() {
    this.registerDomEvent(document, "input", (evt) => {
      const target = evt.target;
      if (!target || !target.closest) return;

      const isEditor = target.closest(".cm-editor") || target.closest(".markdown-source-view");
      if (!isEditor) return;

      if ((target.tagName === "INPUT" || target.tagName === "TEXTAREA") && !target.closest(".cm-editor")) {
        return;
      }

      let charCount = 0;
      if (evt.inputType === "insertText" && evt.data) {
        charCount = evt.data.length;
      } else if (evt.inputType === "insertLineBreak" || evt.inputType === "insertParagraph") {
        charCount = 1;
      } else if (evt.inputType === "insertFromPaste" && evt.data) {
        charCount = Math.min(evt.data.length, 10);
      }

      if (charCount > 0) {
        this.handleCharactersTyped(charCount);
      }
    });
  }

  handleCharactersTyped(count) {
    this.settings.currentKeystrokeCount += count;
    this.settings.totalCharactersTyped += count;

    if (this.settings.currentKeystrokeCount >= this.settings.charactersPerPokemon) {
      const overflow = this.settings.currentKeystrokeCount - this.settings.charactersPerPokemon;
      this.settings.currentKeystrokeCount = overflow;

      const activeFile = this.app.workspace.getActiveFile();
      const docPath = activeFile ? activeFile.path : this.t("activeNoteFile");
      const docTitle = activeFile ? activeFile.basename : this.t("activeNoteTitle");

      this.triggerEncounter(docPath, docTitle, false);
    } else {
      this.updateStatusBar();
      if (this.saveTimeout) clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => this.savePluginData(), 3000);
    }
  }

  triggerEncounter(docPath, docTitle, forceShiny = false) {
    const index = Math.floor(Math.random() * POKEMON_DATABASE.length);
    const pkm = POKEMON_DATABASE[index];

    // Check if new before adding
    const isNew = !this.catches.some(c => c.pokemonId === pkm.id);

    // Roll for shiny or force shiny
    const isShiny = forceShiny ? true : (Math.random() < (this.settings.shinyRate || 0.02));

    const now = new Date();
    const isEn = this.getLang() === "en";
    const locale = isEn ? "en-US" : "fr-FR";
    const sep = isEn ? " at " : " à ";
    const formattedDate = now.toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }) + sep + now.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit"
    });

    const displayName = this.getPokemonName(pkm);

    const catchEntry = {
      uid: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      pokemonId: pkm.id,
      pokemonName: displayName,
      types: pkm.types,
      isShiny: isShiny,
      caughtAt: formattedDate,
      timestamp: Date.now(),
      documentPath: docPath,
      documentTitle: docTitle
    };

    this.catches.unshift(catchEntry);
    this.savePluginData();

    if (this.settings.showCatchAnimation) {
      this.showBottomEncounterAnimation(pkm, isShiny, isNew);
    } else {
      const tagText = (isNew && isShiny) ? " [N][S]" : isNew ? " [N]" : isShiny ? " [S]" : "";
      new Notice(this.t("noticeCaught", {
        name: displayName,
        id: String(pkm.id).padStart(3, "0"),
        tags: tagText
      }));
    }
  }

  showBottomEncounterAnimation(pkm, isShiny, isNew) {
    if (this.currentNotificationEl && this.currentNotificationEl.parentNode) {
      this.currentNotificationEl.parentNode.removeChild(this.currentNotificationEl);
    }

    const displayName = this.getPokemonName(pkm);

    const container = document.createElement("div");
    container.className = `pokemon-encounter-container ${this.settings.notificationPosition}`;
    this.currentNotificationEl = container;

    const card = container.createDiv({
      cls: "pokemon-encounter-card",
      attr: { title: this.t("hudClickTooltip") }
    });

    const stage = card.createDiv({ cls: "pokemon-encounter-stage" });

    const spriteWrap = stage.createDiv({ cls: "pokemon-stage-sprite-wrap" });
    const spriteImg = spriteWrap.createEl("img", {
      cls: "pokemon-stage-sprite",
      attr: { alt: displayName }
    });
    this.applySpriteWithFallback(spriteImg, pkm.id, isShiny);
    spriteWrap.createDiv({ cls: "pokemon-stage-shadow" });

    const pokeball = stage.createDiv({ cls: "pokemon-stage-pokeball" });
    const sphere = pokeball.createDiv({ cls: "pokeball-sphere" });
    sphere.createDiv({ cls: "pokeball-top-half" });
    const pokeballBtn = sphere.createDiv({ cls: "pokeball-center-btn" });

    const sparks = stage.createDiv({ cls: "pokemon-sparks" });
    const sparkOffsets = [
      { icon: "⭐", dx: "-30px", dy: "-25px" },
      { icon: "✨", dx: "30px", dy: "-30px" },
      { icon: "🌟", dx: "-35px", dy: "15px" },
      { icon: "⭐", dx: "35px", dy: "20px" }
    ];
    sparkOffsets.forEach(s => {
      const sp = sparks.createSpan({ cls: "spark-item", text: s.icon });
      sp.style.setProperty("--dx", s.dx);
      sp.style.setProperty("--dy", s.dy);
    });

    const footer = card.createDiv({ cls: "pokemon-mini-footer" });
    footer.createSpan({
      cls: "pokemon-mini-name",
      text: `${displayName} #${String(pkm.id).padStart(3, "0")}`
    });

    if (isNew || isShiny) {
      const tagsDiv = footer.createDiv({ cls: "pokemon-mini-tags" });
      if (isNew) {
        tagsDiv.createSpan({ cls: "pokemon-mini-tag tag-n", text: "N" });
      }
      if (isShiny) {
        tagsDiv.createSpan({ cls: "pokemon-mini-tag tag-s", text: "S" });
      }
    }

    document.body.appendChild(container);

    let isDismissed = false;
    const dismiss = () => {
      if (isDismissed) return;
      isDismissed = true;
      card.classList.add("closing");
      setTimeout(() => {
        if (container.parentNode) container.parentNode.removeChild(container);
      }, 350);
    };

    card.addEventListener("click", () => {
      dismiss();
      this.activatePokedexView();
    });

    // Phase 1: After 0.6s, Throw Pokéball
    setTimeout(() => {
      if (isDismissed) return;
      pokeball.classList.add("visible", "throw");
    }, 600);

    // Phase 2: After 1.1s, Pokémon absorbed into Pokéball
    setTimeout(() => {
      if (isDismissed) return;
      spriteWrap.classList.add("captured");
      pokeballBtn.classList.add("active");
    }, 1100);

    // Phase 3: After 1.6s, Pokéball wiggles on the ground
    setTimeout(() => {
      if (isDismissed) return;
      pokeball.classList.remove("throw");
      pokeball.classList.add("wiggle");
    }, 1600);

    // Phase 4: After 2.5s, Catch Successful!
    setTimeout(() => {
      if (isDismissed) return;
      pokeball.classList.remove("wiggle");
      pokeball.classList.add("caught-success");
      pokeballBtn.classList.remove("active");
      sparks.classList.add("visible");

      if (this.settings.soundEnabled) {
        playCatchSound();
      }
    }, 2500);

    // Phase 5: Auto-dismiss after duration
    const totalDuration = this.settings.notificationDurationMs || 4000;
    setTimeout(() => {
      dismiss();
    }, totalDuration);
  }

  async activatePokedexView() {
    const workspace = this.app.workspace;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_POKEDEX)[0];

    if (!leaf) {
      const newLeaf = workspace.getLeaf("tab");
      await newLeaf.setViewState({
        type: VIEW_TYPE_POKEDEX,
        active: true
      });
      leaf = newLeaf;
    }

    workspace.revealLeaf(leaf);
  }
}

// ============================================================================
// POKEDEX VIEW (ItemView)
// ============================================================================
class PokedexView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.activeTab = "journal"; // "journal" | "grid"
    this.searchQuery = "";
    this.sortBy = "date-desc";
    this.selectedGen = "all";
  }

  getViewType() {
    return VIEW_TYPE_POKEDEX;
  }

  getDisplayText() {
    return "Pokédex";
  }

  getIcon() {
    return "pokeball";
  }

  async onOpen() {
    await this.plugin.checkLocalSpritesStatus();
    this.refresh();
  }

  refresh() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("pokemon-pokedex-view");

    // 1. Header Banner
    this.renderHeader(container);

    // 1b. Offline Sprites Download Banner (if not yet installed)
    if (!this.plugin.hasLocalSprites || this.plugin.isDownloadingSprites) {
      this.renderDownloadBanner(container);
    }

    // 2. Summary Stats Cards
    this.renderStats(container);

    // 3. Navigation & Search Bar
    this.renderNavBar(container);

    // 4. Main Content (Journal Table OR Grid)
    if (this.activeTab === "journal") {
      this.renderJournalTable(container);
    } else {
      this.renderPokedexGrid(container);
    }
  }

  renderHeader(container) {
    const banner = container.createDiv({ cls: "pokedex-header-banner" });
    const titleGroup = banner.createDiv({ cls: "pokedex-title-group" });
    
    const iconWrapper = titleGroup.createDiv({ cls: "pokedex-logo-icon" });
    setIcon(iconWrapper, "pokeball");

    const titleText = titleGroup.createDiv({ cls: "pokedex-title-text" });
    titleText.createEl("h1", { text: this.plugin.t("headerTitle") });
    titleText.createEl("p", { text: this.plugin.t("headerSubtitle") });
  }

  renderDownloadBanner(container) {
    this.downloadBannerEl = container.createDiv({ cls: "pokedex-sprites-banner" });
    this.updateDownloadBannerUI();
  }

  updateDownloadBannerUI() {
    if (!this.downloadBannerEl) return;
    this.downloadBannerEl.empty();

    if (this.plugin.hasLocalSprites && !this.plugin.isDownloadingSprites) {
      this.downloadBannerEl.style.display = "none";
      return;
    }
    this.downloadBannerEl.style.display = "flex";

    const infoDiv = this.downloadBannerEl.createDiv({ cls: "pokedex-sprites-banner-info" });
    infoDiv.createEl("strong", { text: this.plugin.t("bannerTitle") });

    if (this.plugin.isDownloadingSprites) {
      const { current, total } = this.plugin.downloadProgress;
      const pct = total > 0 ? Math.round((current / total) * 100) : 0;
      infoDiv.createEl("span", {
        text: this.plugin.t("bannerDownloading", { current, total, pct })
      });

      const progressWrap = infoDiv.createDiv({ cls: "pokedex-progress-bar-wrap" });
      const progressFill = progressWrap.createDiv({ cls: "pokedex-progress-bar-fill" });
      progressFill.style.width = `${pct}%`;

      const actionsDiv = this.downloadBannerEl.createDiv({ cls: "pokedex-sprites-banner-actions" });
      const cancelBtn = actionsDiv.createEl("button", {
        cls: "pokedex-btn-secondary",
        text: this.plugin.t("bannerPauseBtn")
      });
      cancelBtn.addEventListener("click", () => {
        this.plugin.cancelSpriteDownload = true;
      });
    } else {
      infoDiv.createEl("span", {
        text: this.plugin.t("bannerDesc")
      });

      const actionsDiv = this.downloadBannerEl.createDiv({ cls: "pokedex-sprites-banner-actions" });
      const dlBtn = actionsDiv.createEl("button", {
        cls: "mod-cta pokedex-btn-download",
        text: this.plugin.hasAnyLocalSprite ? this.plugin.t("bannerResumeBtn") : this.plugin.t("bannerDownloadBtn")
      });
      dlBtn.addEventListener("click", () => {
        this.plugin.downloadAllSprites();
      });
    }
  }

  renderStats(container) {
    const statsRow = container.createDiv({ cls: "pokedex-stats-row" });

    const totalCaught = this.plugin.catches.length;
    const uniqueIds = new Set(this.plugin.catches.map(c => c.pokemonId));
    const uniqueCount = uniqueIds.size;
    const shinyCount = this.plugin.catches.filter(c => c.isShiny).length;
    const completionPercent = ((uniqueCount / TOTAL_POKEMON) * 100).toFixed(1);

    const stats = [
      { label: this.plugin.t("statTotalCaught"), value: totalCaught },
      { label: this.plugin.t("statUniquePokemon"), value: `${uniqueCount} / ${TOTAL_POKEMON}` },
      { label: this.plugin.t("statCompletion"), value: `${completionPercent}%` },
      { label: this.plugin.t("statShinyPokemon"), value: shinyCount }
    ];

    stats.forEach(s => {
      const box = statsRow.createDiv({ cls: "pokedex-stat-box" });
      box.createDiv({ cls: "pokedex-stat-value", text: String(s.value) });
      box.createDiv({ cls: "pokedex-stat-label", text: s.label });
    });
  }

  renderNavBar(container) {
    const navBar = container.createDiv({ cls: "pokedex-nav-bar" });

    const tabs = navBar.createDiv({ cls: "pokedex-tabs" });
    
    const journalBtn = tabs.createEl("button", {
      cls: `pokedex-tab-btn ${this.activeTab === "journal" ? "active" : ""}`,
      text: this.plugin.t("tabJournal", { count: this.plugin.catches.length })
    });
    journalBtn.addEventListener("click", () => {
      this.activeTab = "journal";
      this.refresh();
    });

    const gridBtn = tabs.createEl("button", {
      cls: `pokedex-tab-btn ${this.activeTab === "grid" ? "active" : ""}`,
      text: this.plugin.t("tabGrid", { total: TOTAL_POKEMON })
    });
    gridBtn.addEventListener("click", () => {
      this.activeTab = "grid";
      this.searchQuery = "";
      this.refresh();
    });

    // Generation Selector (when in grid)
    if (this.activeTab === "grid") {
      const genSelect = navBar.createEl("select", { cls: "dropdown pokedex-gen-select" });
      const isEn = this.plugin.getLang() === "en";
      GENERATIONS.forEach(g => {
        const opt = genSelect.createEl("option", {
          value: g.id,
          text: isEn ? g.nameEn : g.nameFr
        });
        if (g.id === this.selectedGen) opt.selected = true;
      });
      genSelect.addEventListener("change", (e) => {
        this.selectedGen = e.target.value;
        this.updateFilteredView();
      });
    }

    // Search input
    const searchBox = navBar.createDiv({ cls: "pokedex-search-box" });
    const searchInput = searchBox.createEl("input", {
      cls: "pokedex-search-input",
      type: "text",
      placeholder: this.plugin.t("searchPlaceholder")
    });
    searchInput.value = this.searchQuery;
    searchInput.addEventListener("input", (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.updateFilteredView();
    });

    // Sort selector (only for Journal)
    if (this.activeTab === "journal") {
      const sortSelect = navBar.createEl("select", { cls: "dropdown" });
      const sortOptions = [
        { value: "date-desc", text: this.plugin.t("sortDateDesc") },
        { value: "date-asc", text: this.plugin.t("sortDateAsc") },
        { value: "id-asc", text: this.plugin.t("sortIdAsc") },
        { value: "name-asc", text: this.plugin.t("sortNameAsc") }
      ];
      sortOptions.forEach(opt => {
        const o = sortSelect.createEl("option", { value: opt.value, text: opt.text });
        if (opt.value === this.sortBy) o.selected = true;
      });
      sortSelect.addEventListener("change", (e) => {
        this.sortBy = e.target.value;
        this.updateFilteredView();
      });
    }
  }

  getFilteredCatches() {
    let list = [...this.plugin.catches];

    if (this.searchQuery) {
      const q = this.searchQuery;
      list = list.filter(c => {
        const dbPkm = POKEMON_BY_ID.get(c.pokemonId);
        const frName = dbPkm ? dbPkm.name.toLowerCase() : (c.pokemonName || "").toLowerCase();
        const enName = dbPkm && dbPkm.nameEn ? dbPkm.nameEn.toLowerCase() : "";
        const nameMatch = frName.includes(q) || enName.includes(q) || (c.pokemonName || "").toLowerCase().includes(q);
        const docMatch = (c.documentTitle || "").toLowerCase().includes(q) || (c.documentPath || "").toLowerCase().includes(q);
        const typeMatch = Array.isArray(c.types) && c.types.some(t => {
          const tEn = TYPE_TRANSLATIONS_EN[t] || "";
          return t.toLowerCase().includes(q) || tEn.toLowerCase().includes(q);
        });
        const numMatch = String(c.pokemonId).includes(q);
        return nameMatch || docMatch || typeMatch || numMatch;
      });
    }

    list.sort((a, b) => {
      if (this.sortBy === "date-desc") return (b.timestamp || 0) - (a.timestamp || 0);
      if (this.sortBy === "date-asc") return (a.timestamp || 0) - (b.timestamp || 0);
      if (this.sortBy === "id-asc") return a.pokemonId - b.pokemonId;
      if (this.sortBy === "name-asc") {
        const nameA = this.plugin.getPokemonName(a.pokemonId, a.pokemonName);
        const nameB = this.plugin.getPokemonName(b.pokemonId, b.pokemonName);
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

    return list;
  }

  updateFilteredView() {
    const wrapper = this.containerEl.querySelector(".pokedex-content-wrapper");
    if (!wrapper) {
      this.refresh();
      return;
    }
    wrapper.empty();
    if (this.activeTab === "journal") {
      this.populateJournalTable(wrapper);
    } else {
      this.populatePokedexGrid(wrapper);
    }
  }

  renderJournalTable(container) {
    const wrapper = container.createDiv({ cls: "pokedex-content-wrapper" });
    this.populateJournalTable(wrapper);
  }

  populateJournalTable(wrapper) {
    const filtered = this.getFilteredCatches();

    if (filtered.length === 0) {
      const empty = wrapper.createDiv({ cls: "pokedex-empty-state" });
      const icon = empty.createDiv({ cls: "pokedex-empty-icon" });
      setIcon(icon, "pokeball");
      empty.createEl("h3", { text: this.plugin.t("emptyTitle") });
      empty.createEl("p", {
        text: this.searchQuery
          ? this.plugin.t("emptySearchDesc")
          : this.plugin.t("emptyInitialDesc")
      });
      return;
    }

    const tableWrapper = wrapper.createDiv({ cls: "pokedex-table-wrapper" });
    const table = tableWrapper.createEl("table", { cls: "pokedex-capture-table" });

    const thead = table.createEl("thead");
    const headerRow = thead.createEl("tr");
    headerRow.createEl("th", { text: this.plugin.t("thSprite") });
    headerRow.createEl("th", { text: this.plugin.t("thName") });
    headerRow.createEl("th", { text: this.plugin.t("thTypes") });
    headerRow.createEl("th", { text: this.plugin.t("thDate") });
    headerRow.createEl("th", { text: this.plugin.t("thDoc") });
    headerRow.createEl("th", { text: this.plugin.t("thActions") });

    const tbody = table.createEl("tbody");

    filtered.forEach((entry) => {
      const tr = tbody.createEl("tr");
      const displayName = this.plugin.getPokemonName(entry.pokemonId, entry.pokemonName);

      // 1. Sprite
      const tdSprite = tr.createEl("td");
      const img = tdSprite.createEl("img", {
        cls: "pokedex-table-sprite"
      });
      this.plugin.applySpriteWithFallback(img, entry.pokemonId, entry.isShiny);
      img.alt = displayName;

      // 2. Name & ID
      const tdName = tr.createEl("td");
      tdName.createDiv({
        cls: "pokedex-pkm-id",
        text: `#${String(entry.pokemonId).padStart(3, "0")}`
      });
      const nameDiv = tdName.createDiv({ cls: "pokedex-pkm-name" });
      nameDiv.createSpan({ text: displayName });
      if (entry.isShiny) {
        nameDiv.createSpan({
          cls: "pokemon-mini-tag tag-s",
          text: "✨ Shiny"
        });
      }

      // 3. Types
      const tdTypes = tr.createEl("td");
      if (Array.isArray(entry.types)) {
        entry.types.forEach(t => {
          const cleanType = t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          tdTypes.createSpan({
            cls: `pokemon-type-badge pokemon-type-${cleanType}`,
            text: this.plugin.getTypeName(t)
          });
        });
      }

      // 4. Date
      const tdDate = tr.createEl("td");
      tdDate.createSpan({
        cls: "pokedex-date-badge",
        text: entry.caughtAt || this.plugin.t("unknownDate")
      });

      // 5. Document Link
      const tdDoc = tr.createEl("td");
      const docLink = tdDoc.createEl("a", {
        cls: "pokedex-doc-link",
        text: `📄 ${entry.documentTitle || entry.documentPath}`
      });
      docLink.addEventListener("click", (e) => {
        e.preventDefault();
        this.openDocument(entry.documentPath);
      });

      // 6. Delete Action
      const tdAction = tr.createEl("td");
      const delBtn = tdAction.createEl("button", {
        cls: "pokedex-btn-delete",
        text: "🗑️",
        title: this.plugin.t("deleteTooltip")
      });
      delBtn.addEventListener("click", async () => {
        const originalIndex = this.plugin.catches.findIndex(c => c.uid === entry.uid);
        if (originalIndex !== -1) {
          this.plugin.catches.splice(originalIndex, 1);
          await this.plugin.savePluginData();
          new Notice(this.plugin.t("noticeDeleted", { name: displayName }));
          this.refresh();
        }
      });
    });
  }

  renderPokedexGrid(container) {
    const wrapper = container.createDiv({ cls: "pokedex-content-wrapper" });
    this.populatePokedexGrid(wrapper);
  }

  populatePokedexGrid(wrapper) {
    const grid = wrapper.createDiv({ cls: "pokedex-grid-container" });

    // Count normal and shiny catches per pokemon
    const countMap = {};
    const shinyMap = {};

    this.plugin.catches.forEach(c => {
      countMap[c.pokemonId] = (countMap[c.pokemonId] || 0) + 1;
      if (c.isShiny) {
        shinyMap[c.pokemonId] = (shinyMap[c.pokemonId] || 0) + 1;
      }
    });

    const currentGenObj = GENERATIONS.find(g => g.id === this.selectedGen) || GENERATIONS[0];

    POKEMON_DATABASE.forEach(pkm => {
      // Filter by generation
      if (pkm.id < currentGenObj.min || pkm.id > currentGenObj.max) return;

      const totalCount = countMap[pkm.id] || 0;
      const shinyCount = shinyMap[pkm.id] || 0;
      const normalCount = totalCount - shinyCount;
      const isCaught = totalCount > 0;
      const displayName = this.plugin.getPokemonName(pkm);

      if (this.searchQuery) {
        const q = this.searchQuery;
        const nameMatch = pkm.name.toLowerCase().includes(q) || (pkm.nameEn && pkm.nameEn.toLowerCase().includes(q));
        const numMatch = String(pkm.id).includes(q);
        const typeMatch = Array.isArray(pkm.types) && pkm.types.some(t => {
          const tEn = TYPE_TRANSLATIONS_EN[t] || "";
          return t.toLowerCase().includes(q) || tEn.toLowerCase().includes(q);
        });
        if (!nameMatch && !numMatch && !typeMatch) return;
      }

      const card = grid.createDiv({
        cls: `pokedex-grid-card ${isCaught ? "caught" : "uncaught"}`
      });

      card.createDiv({
        cls: "pokedex-grid-number",
        text: `#${String(pkm.id).padStart(3, "0")}`
      });

      // Badges: Blue = normals, Red = shinies
      if (isCaught) {
        const badgesWrap = card.createDiv({ cls: "pokedex-grid-badges" });
        
        if (normalCount > 0) {
          badgesWrap.createDiv({
            cls: "pokedex-grid-normal-badge",
            text: `x${normalCount}`,
            title: this.plugin.t("normalCountTooltip", { count: normalCount })
          });
        }

        if (shinyCount > 0) {
          badgesWrap.createDiv({
            cls: "pokedex-grid-shiny-badge",
            text: `x${shinyCount}`,
            title: this.plugin.t("shinyCountTooltip", { count: shinyCount })
          });
        }
      }

      const sprite = card.createEl("img", {
        cls: "pokedex-grid-sprite"
      });
      const showShinySprite = shinyCount > 0 && normalCount === 0;
      this.plugin.applySpriteWithFallback(sprite, pkm.id, showShinySprite);
      sprite.alt = displayName;

      card.createDiv({
        cls: "pokedex-grid-name",
        text: isCaught ? displayName : "???"
      });

      if (isCaught) {
        card.addEventListener("click", () => {
          this.activeTab = "journal";
          this.searchQuery = displayName.toLowerCase();
          this.refresh();
        });
      }
    });
  }

  openDocument(docPath) {
    if (!docPath) return;
    const file = this.app.metadataCache.getFirstLinkpathDest(docPath, "");
    if (file) {
      this.app.workspace.getLeaf(false).openFile(file);
    } else {
      new Notice(this.plugin.t("noticeDocNotFound", { path: docPath }));
    }
  }
}

// ============================================================================
// CONFIRMATION MODAL (Obsidian Community Guidelines Compliant)
// ============================================================================
class ConfirmResetModal extends Modal {
  constructor(app, plugin, onConfirm) {
    super(app);
    this.plugin = plugin;
    this.onConfirm = onConfirm;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: this.plugin.t("modalResetTitle") });
    contentEl.createEl("p", {
      text: this.plugin.t("modalResetDesc")
    });

    new Setting(contentEl)
      .addButton(btn => btn
        .setButtonText(this.plugin.t("modalCancelBtn"))
        .onClick(() => this.close())
      )
      .addButton(btn => btn
        .setButtonText(this.plugin.t("modalConfirmBtn"))
        .setWarning()
        .onClick(async () => {
          await this.onConfirm();
          this.close();
        })
      );
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

// ============================================================================
// SETTINGS TAB
// ============================================================================
class PokemonSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  async display() {
    const { containerEl } = this;
    containerEl.empty();

    await this.plugin.checkLocalSpritesStatus();

    // 0a. Language Selection
    new Setting(containerEl)
      .setName(this.plugin.t("settingsLangHeading"))
      .setHeading();

    new Setting(containerEl)
      .setName(this.plugin.t("settingsLangName"))
      .setDesc(this.plugin.t("settingsLangDesc"))
      .addDropdown(drop => drop
        .addOption("auto", this.plugin.t("settingsLangAuto"))
        .addOption("fr", "🇫🇷 Français")
        .addOption("en", "🇬🇧 English")
        .setValue(this.plugin.settings.language || "auto")
        .onChange(async (val) => {
          this.plugin.settings.language = val;
          await this.plugin.savePluginData();
          this.display();
        })
      );

    // 0b. Offline Sprites Download Section
    new Setting(containerEl)
      .setName(this.plugin.t("settingsSpritesHeading"))
      .setHeading();

    const spriteStatusDesc = this.plugin.hasLocalSprites
      ? this.plugin.t("settingsSpritesInstalledDesc")
      : this.plugin.t("settingsSpritesMissingDesc");

    const spriteSetting = new Setting(containerEl)
      .setName(this.plugin.hasLocalSprites ? this.plugin.t("settingsSpritesInstalledName") : this.plugin.t("settingsSpritesMissingName"))
      .setDesc(spriteStatusDesc);

    const progressContainer = containerEl.createDiv({ cls: "pokedex-settings-progress" });
    progressContainer.style.display = this.plugin.isDownloadingSprites ? "block" : "none";

    const updateSettingsProgress = (current, total) => {
      progressContainer.empty();
      if (!this.plugin.isDownloadingSprites) {
        progressContainer.style.display = "none";
        return;
      }
      progressContainer.style.display = "block";
      const pct = total > 0 ? Math.round((current / total) * 100) : 0;
      progressContainer.createDiv({
        cls: "pokedex-settings-progress-label",
        text: this.plugin.t("settingsProgressLabel", { current, total, pct })
      });
      const barWrap = progressContainer.createDiv({ cls: "pokedex-progress-bar-wrap" });
      const barFill = barWrap.createDiv({ cls: "pokedex-progress-bar-fill" });
      barFill.style.width = `${pct}%`;
    };

    if (this.plugin.isDownloadingSprites) {
      updateSettingsProgress(this.plugin.downloadProgress.current, this.plugin.downloadProgress.total);
      spriteSetting.addButton(btn => btn
        .setButtonText(this.plugin.t("bannerPauseBtn"))
        .onClick(() => {
          this.plugin.cancelSpriteDownload = true;
          setTimeout(() => this.display(), 400);
        })
      );
    } else {
      spriteSetting.addButton(btn => btn
        .setButtonText(
          this.plugin.hasLocalSprites
            ? this.plugin.t("settingsRepairBtn")
            : (this.plugin.hasAnyLocalSprite ? this.plugin.t("settingsResumeBtn") : this.plugin.t("bannerDownloadBtn"))
        )
        .setCta()
        .onClick(async () => {
          await this.plugin.downloadAllSprites((cur, tot) => {
            updateSettingsProgress(cur, tot);
          }, false);
          this.display();
        })
      );
    }

    // 1. Characters Threshold
    new Setting(containerEl)
      .setName(this.plugin.t("settingsCatchHeading"))
      .setHeading();

    new Setting(containerEl)
      .setName(this.plugin.t("settingsFreqName"))
      .setDesc(this.plugin.t("settingsFreqDesc"))
      .addSlider(slider => slider
        .setLimits(20, 500, 10)
        .setValue(this.plugin.settings.charactersPerPokemon)
        .setDynamicTooltip()
        .onChange(async (val) => {
          this.plugin.settings.charactersPerPokemon = val;
          await this.plugin.savePluginData();
        })
      )
      .addText(text => text
        .setValue(String(this.plugin.settings.charactersPerPokemon))
        .onChange(async (val) => {
          const num = parseInt(val, 10);
          if (!isNaN(num) && num >= 10) {
            this.plugin.settings.charactersPerPokemon = num;
            await this.plugin.savePluginData();
          }
        })
      );

    // 2. Notification Position
    new Setting(containerEl)
      .setName(this.plugin.t("settingsPosName"))
      .setDesc(this.plugin.t("settingsPosDesc"))
      .addDropdown(drop => drop
        .addOption("pos-bottom-right", this.plugin.t("settingsPosRight"))
        .addOption("pos-bottom-center", this.plugin.t("settingsPosCenter"))
        .addOption("pos-bottom-left", this.plugin.t("settingsPosLeft"))
        .setValue(this.plugin.settings.notificationPosition)
        .onChange(async (val) => {
          this.plugin.settings.notificationPosition = val;
          await this.plugin.savePluginData();
        })
      );

    // 3. Show Animation Toggle
    new Setting(containerEl)
      .setName(this.plugin.t("settingsAnimName"))
      .setDesc(this.plugin.t("settingsAnimDesc"))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showCatchAnimation)
        .onChange(async (val) => {
          this.plugin.settings.showCatchAnimation = val;
          await this.plugin.savePluginData();
        })
      );

    // 4. Sound Effects Toggle
    new Setting(containerEl)
      .setName(this.plugin.t("settingsSoundName"))
      .setDesc(this.plugin.t("settingsSoundDesc"))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.soundEnabled)
        .onChange(async (val) => {
          this.plugin.settings.soundEnabled = val;
          await this.plugin.savePluginData();
        })
      );

    // 5. Test Normal Encounter
    new Setting(containerEl)
      .setName(this.plugin.t("settingsTestNormalName"))
      .setDesc(this.plugin.t("settingsTestNormalDesc"))
      .addButton(btn => btn
        .setButtonText(this.plugin.t("settingsTestNormalBtn"))
        .onClick(() => {
          const activeFile = this.app.workspace.getActiveFile();
          const docPath = activeFile ? activeFile.path : this.plugin.t("testNoteFile");
          const docTitle = activeFile ? activeFile.basename : this.plugin.t("testNoteTitle");
          this.plugin.triggerEncounter(docPath, docTitle, false);
        })
      );

    // 6. Test Shiny Encounter
    new Setting(containerEl)
      .setName(this.plugin.t("settingsTestShinyName"))
      .setDesc(this.plugin.t("settingsTestShinyDesc"))
      .addButton(btn => btn
        .setButtonText(this.plugin.t("settingsTestShinyBtn"))
        .setCta()
        .onClick(() => {
          const activeFile = this.app.workspace.getActiveFile();
          const docPath = activeFile ? activeFile.path : this.plugin.t("testNoteFile");
          const docTitle = activeFile ? activeFile.basename : this.plugin.t("testNoteTitle");
          this.plugin.triggerEncounter(docPath, docTitle, true);
        })
      );

    // 7. Reset Data
    new Setting(containerEl)
      .setName(this.plugin.t("settingsDataHeading"))
      .setHeading();

    new Setting(containerEl)
      .setName(this.plugin.t("settingsResetCountName"))
      .setDesc(this.plugin.t("settingsResetCountDesc"))
      .addButton(btn => btn
        .setButtonText(this.plugin.t("settingsResetCountBtn"))
        .onClick(async () => {
          this.plugin.settings.currentKeystrokeCount = 0;
          await this.plugin.savePluginData();
          new Notice(this.plugin.t("noticeCountReset"));
        })
      );

    new Setting(containerEl)
      .setName(this.plugin.t("settingsClearAllName"))
      .setDesc(this.plugin.t("settingsClearAllDesc"))
      .addButton(btn => btn
        .setButtonText(this.plugin.t("settingsClearAllBtn"))
        .setWarning()
        .onClick(() => {
          new ConfirmResetModal(this.app, this.plugin, async () => {
            this.plugin.catches = [];
            this.plugin.settings.totalCharactersTyped = 0;
            this.plugin.settings.currentKeystrokeCount = 0;
            await this.plugin.savePluginData();
            new Notice(this.plugin.t("noticePokedexCleared"));
          }).open();
        })
      );
  }
}

module.exports = PokemonPokedexPlugin;



