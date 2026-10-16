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
const POKEMON_DATABASE = [{"id": 1, "name": "Bulbizarre", "types": ["Plante", "Poison"]}, {"id": 2, "name": "Herbizarre", "types": ["Plante", "Poison"]}, {"id": 3, "name": "Florizarre", "types": ["Plante", "Poison"]}, {"id": 4, "name": "Salamèche", "types": ["Feu"]}, {"id": 5, "name": "Reptincel", "types": ["Feu"]}, {"id": 6, "name": "Dracaufeu", "types": ["Feu", "Vol"]}, {"id": 7, "name": "Carapuce", "types": ["Eau"]}, {"id": 8, "name": "Carabaffe", "types": ["Eau"]}, {"id": 9, "name": "Tortank", "types": ["Eau"]}, {"id": 10, "name": "Chenipan", "types": ["Insecte"]}, {"id": 11, "name": "Chrysacier", "types": ["Insecte"]}, {"id": 12, "name": "Papilusion", "types": ["Insecte", "Vol"]}, {"id": 13, "name": "Aspicot", "types": ["Insecte", "Poison"]}, {"id": 14, "name": "Coconfort", "types": ["Insecte", "Poison"]}, {"id": 15, "name": "Dardargnan", "types": ["Insecte", "Poison"]}, {"id": 16, "name": "Roucool", "types": ["Normal", "Vol"]}, {"id": 17, "name": "Roucoups", "types": ["Normal", "Vol"]}, {"id": 18, "name": "Roucarnage", "types": ["Normal", "Vol"]}, {"id": 19, "name": "Rattata", "types": ["Normal"]}, {"id": 20, "name": "Rattatac", "types": ["Normal"]}, {"id": 21, "name": "Piafabec", "types": ["Normal", "Vol"]}, {"id": 22, "name": "Rapasdepic", "types": ["Normal", "Vol"]}, {"id": 23, "name": "Abo", "types": ["Poison"]}, {"id": 24, "name": "Arbok", "types": ["Poison"]}, {"id": 25, "name": "Pikachu", "types": ["Électrik"]}, {"id": 26, "name": "Raichu", "types": ["Électrik"]}, {"id": 27, "name": "Sabelette", "types": ["Sol"]}, {"id": 28, "name": "Sablaireau", "types": ["Sol"]}, {"id": 29, "name": "Nidoran♀", "types": ["Poison"]}, {"id": 30, "name": "Nidorina", "types": ["Poison"]}, {"id": 31, "name": "Nidoqueen", "types": ["Poison", "Sol"]}, {"id": 32, "name": "Nidoran♂", "types": ["Poison"]}, {"id": 33, "name": "Nidorino", "types": ["Poison"]}, {"id": 34, "name": "Nidoking", "types": ["Poison", "Sol"]}, {"id": 35, "name": "Mélofée", "types": ["Fée"]}, {"id": 36, "name": "Mélodelfe", "types": ["Fée"]}, {"id": 37, "name": "Goupix", "types": ["Feu"]}, {"id": 38, "name": "Feunard", "types": ["Feu"]}, {"id": 39, "name": "Rondoudou", "types": ["Normal", "Fée"]}, {"id": 40, "name": "Grodoudou", "types": ["Normal", "Fée"]}, {"id": 41, "name": "Nosferapti", "types": ["Poison", "Vol"]}, {"id": 42, "name": "Nosferalto", "types": ["Poison", "Vol"]}, {"id": 43, "name": "Mystherbe", "types": ["Plante", "Poison"]}, {"id": 44, "name": "Ortide", "types": ["Plante", "Poison"]}, {"id": 45, "name": "Rafflesia", "types": ["Plante", "Poison"]}, {"id": 46, "name": "Paras", "types": ["Insecte", "Plante"]}, {"id": 47, "name": "Parasect", "types": ["Insecte", "Plante"]}, {"id": 48, "name": "Mimitoss", "types": ["Insecte", "Poison"]}, {"id": 49, "name": "Aéromite", "types": ["Insecte", "Poison"]}, {"id": 50, "name": "Taupiqueur", "types": ["Sol"]}, {"id": 51, "name": "Triopikeur", "types": ["Sol"]}, {"id": 52, "name": "Miaouss", "types": ["Normal"]}, {"id": 53, "name": "Persian", "types": ["Normal"]}, {"id": 54, "name": "Psykokwak", "types": ["Eau"]}, {"id": 55, "name": "Akwakwak", "types": ["Eau"]}, {"id": 56, "name": "Férosinge", "types": ["Combat"]}, {"id": 57, "name": "Colossinge", "types": ["Combat"]}, {"id": 58, "name": "Caninos", "types": ["Feu"]}, {"id": 59, "name": "Arcanin", "types": ["Feu"]}, {"id": 60, "name": "Ptitard", "types": ["Eau"]}, {"id": 61, "name": "Têtarte", "types": ["Eau"]}, {"id": 62, "name": "Tartard", "types": ["Eau", "Combat"]}, {"id": 63, "name": "Abra", "types": ["Psy"]}, {"id": 64, "name": "Kadabra", "types": ["Psy"]}, {"id": 65, "name": "Alakazam", "types": ["Psy"]}, {"id": 66, "name": "Machoc", "types": ["Combat"]}, {"id": 67, "name": "Machopeur", "types": ["Combat"]}, {"id": 68, "name": "Mackogneur", "types": ["Combat"]}, {"id": 69, "name": "Chétiflor", "types": ["Plante", "Poison"]}, {"id": 70, "name": "Boustiflor", "types": ["Plante", "Poison"]}, {"id": 71, "name": "Empiflor", "types": ["Plante", "Poison"]}, {"id": 72, "name": "Tentacool", "types": ["Eau", "Poison"]}, {"id": 73, "name": "Tentacruel", "types": ["Eau", "Poison"]}, {"id": 74, "name": "Racaillou", "types": ["Roche", "Sol"]}, {"id": 75, "name": "Gravalanch", "types": ["Roche", "Sol"]}, {"id": 76, "name": "Grolem", "types": ["Roche", "Sol"]}, {"id": 77, "name": "Ponyta", "types": ["Feu"]}, {"id": 78, "name": "Galopa", "types": ["Feu"]}, {"id": 79, "name": "Ramoloss", "types": ["Eau", "Psy"]}, {"id": 80, "name": "Flagadoss", "types": ["Eau", "Psy"]}, {"id": 81, "name": "Magnéti", "types": ["Électrik", "Acier"]}, {"id": 82, "name": "Magnéton", "types": ["Électrik", "Acier"]}, {"id": 83, "name": "Canarticho", "types": ["Normal", "Vol"]}, {"id": 84, "name": "Doduo", "types": ["Normal", "Vol"]}, {"id": 85, "name": "Dodrio", "types": ["Normal", "Vol"]}, {"id": 86, "name": "Otaria", "types": ["Eau"]}, {"id": 87, "name": "Lamantine", "types": ["Eau", "Glace"]}, {"id": 88, "name": "Tadmorv", "types": ["Poison"]}, {"id": 89, "name": "Grotadmorv", "types": ["Poison"]}, {"id": 90, "name": "Kokiyas", "types": ["Eau"]}, {"id": 91, "name": "Crustabri", "types": ["Eau", "Glace"]}, {"id": 92, "name": "Fantominus", "types": ["Spectre", "Poison"]}, {"id": 93, "name": "Spectrum", "types": ["Spectre", "Poison"]}, {"id": 94, "name": "Ectoplasma", "types": ["Spectre", "Poison"]}, {"id": 95, "name": "Onix", "types": ["Roche", "Sol"]}, {"id": 96, "name": "Soporifik", "types": ["Psy"]}, {"id": 97, "name": "Hypnomade", "types": ["Psy"]}, {"id": 98, "name": "Krabby", "types": ["Eau"]}, {"id": 99, "name": "Krabboss", "types": ["Eau"]}, {"id": 100, "name": "Voltorbe", "types": ["Électrik"]}, {"id": 101, "name": "Électrode", "types": ["Électrik"]}, {"id": 102, "name": "Noeunoeuf", "types": ["Plante", "Psy"]}, {"id": 103, "name": "Noadkoko", "types": ["Plante", "Psy"]}, {"id": 104, "name": "Osselait", "types": ["Sol"]}, {"id": 105, "name": "Ossatueur", "types": ["Sol"]}, {"id": 106, "name": "Kicklee", "types": ["Combat"]}, {"id": 107, "name": "Tygnon", "types": ["Combat"]}, {"id": 108, "name": "Excelangue", "types": ["Normal"]}, {"id": 109, "name": "Smogo", "types": ["Poison"]}, {"id": 110, "name": "Smogogo", "types": ["Poison"]}, {"id": 111, "name": "Rhinocorne", "types": ["Sol", "Roche"]}, {"id": 112, "name": "Rhinoféros", "types": ["Sol", "Roche"]}, {"id": 113, "name": "Leveinard", "types": ["Normal"]}, {"id": 114, "name": "Saquedeneu", "types": ["Plante"]}, {"id": 115, "name": "Kangourex", "types": ["Normal"]}, {"id": 116, "name": "Hypotrempe", "types": ["Eau"]}, {"id": 117, "name": "Hypocéan", "types": ["Eau"]}, {"id": 118, "name": "Poissirène", "types": ["Eau"]}, {"id": 119, "name": "Poissoroy", "types": ["Eau"]}, {"id": 120, "name": "Stari", "types": ["Eau"]}, {"id": 121, "name": "Staross", "types": ["Eau", "Psy"]}, {"id": 122, "name": "M. Mime", "types": ["Psy", "Fée"]}, {"id": 123, "name": "Insécateur", "types": ["Insecte", "Vol"]}, {"id": 124, "name": "Lippoutou", "types": ["Glace", "Psy"]}, {"id": 125, "name": "Élektek", "types": ["Électrik"]}, {"id": 126, "name": "Magmar", "types": ["Feu"]}, {"id": 127, "name": "Scarabrute", "types": ["Insecte"]}, {"id": 128, "name": "Tauros", "types": ["Normal"]}, {"id": 129, "name": "Magicarpe", "types": ["Eau"]}, {"id": 130, "name": "Léviator", "types": ["Eau", "Vol"]}, {"id": 131, "name": "Lokhlass", "types": ["Eau", "Glace"]}, {"id": 132, "name": "Métamorph", "types": ["Normal"]}, {"id": 133, "name": "Évoli", "types": ["Normal"]}, {"id": 134, "name": "Aquali", "types": ["Eau"]}, {"id": 135, "name": "Voltali", "types": ["Électrik"]}, {"id": 136, "name": "Pyroli", "types": ["Feu"]}, {"id": 137, "name": "Porygon", "types": ["Normal"]}, {"id": 138, "name": "Amonita", "types": ["Roche", "Eau"]}, {"id": 139, "name": "Amonistar", "types": ["Roche", "Eau"]}, {"id": 140, "name": "Kabuto", "types": ["Roche", "Eau"]}, {"id": 141, "name": "Kabutops", "types": ["Roche", "Eau"]}, {"id": 142, "name": "Ptéra", "types": ["Roche", "Vol"]}, {"id": 143, "name": "Ronflex", "types": ["Normal"]}, {"id": 144, "name": "Artikodin", "types": ["Glace", "Vol"]}, {"id": 145, "name": "Électhor", "types": ["Électrik", "Vol"]}, {"id": 146, "name": "Sulfura", "types": ["Feu", "Vol"]}, {"id": 147, "name": "Minidraco", "types": ["Dragon"]}, {"id": 148, "name": "Draco", "types": ["Dragon"]}, {"id": 149, "name": "Dracolosse", "types": ["Dragon", "Vol"]}, {"id": 150, "name": "Mewtwo", "types": ["Psy"]}, {"id": 151, "name": "Mew", "types": ["Psy"]}, {"id": 152, "name": "Germignon", "types": ["Plante"]}, {"id": 153, "name": "Macronium", "types": ["Plante"]}, {"id": 154, "name": "Méganium", "types": ["Plante"]}, {"id": 155, "name": "Héricendre", "types": ["Feu"]}, {"id": 156, "name": "Feurisson", "types": ["Feu"]}, {"id": 157, "name": "Typhlosion", "types": ["Feu"]}, {"id": 158, "name": "Kaiminus", "types": ["Eau"]}, {"id": 159, "name": "Crocrodil", "types": ["Eau"]}, {"id": 160, "name": "Aligatueur", "types": ["Eau"]}, {"id": 161, "name": "Fouinette", "types": ["Normal"]}, {"id": 162, "name": "Fouinar", "types": ["Normal"]}, {"id": 163, "name": "Hoothoot", "types": ["Normal", "Vol"]}, {"id": 164, "name": "Noarfang", "types": ["Normal", "Vol"]}, {"id": 165, "name": "Coxy", "types": ["Insecte", "Vol"]}, {"id": 166, "name": "Coxyclaque", "types": ["Insecte", "Vol"]}, {"id": 167, "name": "Mimigal", "types": ["Insecte", "Poison"]}, {"id": 168, "name": "Migalos", "types": ["Insecte", "Poison"]}, {"id": 169, "name": "Nostenfer", "types": ["Poison", "Vol"]}, {"id": 170, "name": "Loupio", "types": ["Eau", "Électrik"]}, {"id": 171, "name": "Lanturn", "types": ["Eau", "Électrik"]}, {"id": 172, "name": "Pichu", "types": ["Électrik"]}, {"id": 173, "name": "Mélo", "types": ["Fée"]}, {"id": 174, "name": "Toudoudou", "types": ["Normal", "Fée"]}, {"id": 175, "name": "Togepi", "types": ["Fée"]}, {"id": 176, "name": "Togetic", "types": ["Fée", "Vol"]}, {"id": 177, "name": "Natu", "types": ["Psy", "Vol"]}, {"id": 178, "name": "Xatu", "types": ["Psy", "Vol"]}, {"id": 179, "name": "Wattouat", "types": ["Électrik"]}, {"id": 180, "name": "Lainergie", "types": ["Électrik"]}, {"id": 181, "name": "Pharamp", "types": ["Électrik"]}, {"id": 182, "name": "Joliflor", "types": ["Plante"]}, {"id": 183, "name": "Marill", "types": ["Eau", "Fée"]}, {"id": 184, "name": "Azumarill", "types": ["Eau", "Fée"]}, {"id": 185, "name": "Simularbre", "types": ["Roche"]}, {"id": 186, "name": "Tarpaud", "types": ["Eau"]}, {"id": 187, "name": "Granivol", "types": ["Plante", "Vol"]}, {"id": 188, "name": "Floravol", "types": ["Plante", "Vol"]}, {"id": 189, "name": "Cotovol", "types": ["Plante", "Vol"]}, {"id": 190, "name": "Capumain", "types": ["Normal"]}, {"id": 191, "name": "Tournegrin", "types": ["Plante"]}, {"id": 192, "name": "Héliatronc", "types": ["Plante"]}, {"id": 193, "name": "Yanma", "types": ["Insecte", "Vol"]}, {"id": 194, "name": "Axoloto", "types": ["Eau", "Sol"]}, {"id": 195, "name": "Maraiste", "types": ["Eau", "Sol"]}, {"id": 196, "name": "Mentali", "types": ["Psy"]}, {"id": 197, "name": "Noctali", "types": ["Ténèbres"]}, {"id": 198, "name": "Cornèbre", "types": ["Ténèbres", "Vol"]}, {"id": 199, "name": "Roigada", "types": ["Eau", "Psy"]}, {"id": 200, "name": "Feuforêve", "types": ["Spectre"]}, {"id": 201, "name": "Zarbi", "types": ["Psy"]}, {"id": 202, "name": "Qulbutoké", "types": ["Psy"]}, {"id": 203, "name": "Girafarig", "types": ["Normal", "Psy"]}, {"id": 204, "name": "Pomdepik", "types": ["Insecte"]}, {"id": 205, "name": "Foretress", "types": ["Insecte", "Acier"]}, {"id": 206, "name": "Insolourdo", "types": ["Normal"]}, {"id": 207, "name": "Scorplane", "types": ["Sol", "Vol"]}, {"id": 208, "name": "Steelix", "types": ["Acier", "Sol"]}, {"id": 209, "name": "Snubbull", "types": ["Fée"]}, {"id": 210, "name": "Granbull", "types": ["Fée"]}, {"id": 211, "name": "Qwilfish", "types": ["Eau", "Poison"]}, {"id": 212, "name": "Cizayox", "types": ["Insecte", "Acier"]}, {"id": 213, "name": "Caratroc", "types": ["Insecte", "Roche"]}, {"id": 214, "name": "Scarhino", "types": ["Insecte", "Combat"]}, {"id": 215, "name": "Farfuret", "types": ["Ténèbres", "Glace"]}, {"id": 216, "name": "Teddiursa", "types": ["Normal"]}, {"id": 217, "name": "Ursaring", "types": ["Normal"]}, {"id": 218, "name": "Limagma", "types": ["Feu"]}, {"id": 219, "name": "Volcaropod", "types": ["Feu", "Roche"]}, {"id": 220, "name": "Marcacrin", "types": ["Glace", "Sol"]}, {"id": 221, "name": "Cochignon", "types": ["Glace", "Sol"]}, {"id": 222, "name": "Corayon", "types": ["Eau", "Roche"]}, {"id": 223, "name": "Rémoraid", "types": ["Eau"]}, {"id": 224, "name": "Octillery", "types": ["Eau"]}, {"id": 225, "name": "Cadoizo", "types": ["Glace", "Vol"]}, {"id": 226, "name": "Démanta", "types": ["Eau", "Vol"]}, {"id": 227, "name": "Airmure", "types": ["Acier", "Vol"]}, {"id": 228, "name": "Malosse", "types": ["Ténèbres", "Feu"]}, {"id": 229, "name": "Démolosse", "types": ["Ténèbres", "Feu"]}, {"id": 230, "name": "Hyporoi", "types": ["Eau", "Dragon"]}, {"id": 231, "name": "Phanpy", "types": ["Sol"]}, {"id": 232, "name": "Donphan", "types": ["Sol"]}, {"id": 233, "name": "Porygon2", "types": ["Normal"]}, {"id": 234, "name": "Cerfrousse", "types": ["Normal"]}, {"id": 235, "name": "Queulorior", "types": ["Normal"]}, {"id": 236, "name": "Debugant", "types": ["Combat"]}, {"id": 237, "name": "Kapoera", "types": ["Combat"]}, {"id": 238, "name": "Lippouti", "types": ["Glace", "Psy"]}, {"id": 239, "name": "Élekid", "types": ["Électrik"]}, {"id": 240, "name": "Magby", "types": ["Feu"]}, {"id": 241, "name": "Écrémeuh", "types": ["Normal"]}, {"id": 242, "name": "Leuphorie", "types": ["Normal"]}, {"id": 243, "name": "Raikou", "types": ["Électrik"]}, {"id": 244, "name": "Entei", "types": ["Feu"]}, {"id": 245, "name": "Suicune", "types": ["Eau"]}, {"id": 246, "name": "Embrylex", "types": ["Roche", "Sol"]}, {"id": 247, "name": "Ymphect", "types": ["Roche", "Sol"]}, {"id": 248, "name": "Tyranocif", "types": ["Roche", "Ténèbres"]}, {"id": 249, "name": "Lugia", "types": ["Psy", "Vol"]}, {"id": 250, "name": "Ho-Oh", "types": ["Feu", "Vol"]}, {"id": 251, "name": "Celebi", "types": ["Psy", "Plante"]}, {"id": 252, "name": "Arcko", "types": ["Plante"]}, {"id": 253, "name": "Massko", "types": ["Plante"]}, {"id": 254, "name": "Jungko", "types": ["Plante"]}, {"id": 255, "name": "Poussifeu", "types": ["Feu"]}, {"id": 256, "name": "Galifeu", "types": ["Feu", "Combat"]}, {"id": 257, "name": "Braségali", "types": ["Feu", "Combat"]}, {"id": 258, "name": "Gobou", "types": ["Eau"]}, {"id": 259, "name": "Flobio", "types": ["Eau", "Sol"]}, {"id": 260, "name": "Laggron", "types": ["Eau", "Sol"]}, {"id": 261, "name": "Medhyèna", "types": ["Ténèbres"]}, {"id": 262, "name": "Grahyèna", "types": ["Ténèbres"]}, {"id": 263, "name": "Zigzaton", "types": ["Normal"]}, {"id": 264, "name": "Linéon", "types": ["Normal"]}, {"id": 265, "name": "Chenipotte", "types": ["Insecte"]}, {"id": 266, "name": "Armulys", "types": ["Insecte"]}, {"id": 267, "name": "Charmillon", "types": ["Insecte", "Vol"]}, {"id": 268, "name": "Blindalys", "types": ["Insecte"]}, {"id": 269, "name": "Papinox", "types": ["Insecte", "Poison"]}, {"id": 270, "name": "Nénupiot", "types": ["Eau", "Plante"]}, {"id": 271, "name": "Lombre", "types": ["Eau", "Plante"]}, {"id": 272, "name": "Ludicolo", "types": ["Eau", "Plante"]}, {"id": 273, "name": "Grainipiot", "types": ["Plante"]}, {"id": 274, "name": "Pifeuil", "types": ["Plante", "Ténèbres"]}, {"id": 275, "name": "Tengalice", "types": ["Plante", "Ténèbres"]}, {"id": 276, "name": "Nirondelle", "types": ["Normal", "Vol"]}, {"id": 277, "name": "Hélédelle", "types": ["Normal", "Vol"]}, {"id": 278, "name": "Goélise", "types": ["Eau", "Vol"]}, {"id": 279, "name": "Bekipan", "types": ["Eau", "Vol"]}, {"id": 280, "name": "Tarsal", "types": ["Psy", "Fée"]}, {"id": 281, "name": "Kirlia", "types": ["Psy", "Fée"]}, {"id": 282, "name": "Gardevoir", "types": ["Psy", "Fée"]}, {"id": 283, "name": "Arakdo", "types": ["Insecte", "Eau"]}, {"id": 284, "name": "Maskadra", "types": ["Insecte", "Vol"]}, {"id": 285, "name": "Balignon", "types": ["Plante"]}, {"id": 286, "name": "Chapignon", "types": ["Plante", "Combat"]}, {"id": 287, "name": "Parecool", "types": ["Normal"]}, {"id": 288, "name": "Vigoroth", "types": ["Normal"]}, {"id": 289, "name": "Monaflèmit", "types": ["Normal"]}, {"id": 290, "name": "Ningale", "types": ["Insecte", "Sol"]}, {"id": 291, "name": "Ninjask", "types": ["Insecte", "Vol"]}, {"id": 292, "name": "Munja", "types": ["Insecte", "Spectre"]}, {"id": 293, "name": "Chuchmur", "types": ["Normal"]}, {"id": 294, "name": "Ramboum", "types": ["Normal"]}, {"id": 295, "name": "Brouhabam", "types": ["Normal"]}, {"id": 296, "name": "Makuhita", "types": ["Combat"]}, {"id": 297, "name": "Hariyama", "types": ["Combat"]}, {"id": 298, "name": "Azurill", "types": ["Normal", "Fée"]}, {"id": 299, "name": "Tarinor", "types": ["Roche"]}, {"id": 300, "name": "Skitty", "types": ["Normal"]}, {"id": 301, "name": "Delcatty", "types": ["Normal"]}, {"id": 302, "name": "Ténéfix", "types": ["Ténèbres", "Spectre"]}, {"id": 303, "name": "Mysdibule", "types": ["Acier", "Fée"]}, {"id": 304, "name": "Galekid", "types": ["Acier", "Roche"]}, {"id": 305, "name": "Galegon", "types": ["Acier", "Roche"]}, {"id": 306, "name": "Galeking", "types": ["Acier", "Roche"]}, {"id": 307, "name": "Méditikka", "types": ["Combat", "Psy"]}, {"id": 308, "name": "Charmina", "types": ["Combat", "Psy"]}, {"id": 309, "name": "Dynavolt", "types": ["Électrik"]}, {"id": 310, "name": "Élecsprint", "types": ["Électrik"]}, {"id": 311, "name": "Posipi", "types": ["Électrik"]}, {"id": 312, "name": "Négapi", "types": ["Électrik"]}, {"id": 313, "name": "Muciole", "types": ["Insecte"]}, {"id": 314, "name": "Lumivole", "types": ["Insecte"]}, {"id": 315, "name": "Rosélia", "types": ["Plante", "Poison"]}, {"id": 316, "name": "Gloupti", "types": ["Poison"]}, {"id": 317, "name": "Avaltout", "types": ["Poison"]}, {"id": 318, "name": "Carvanha", "types": ["Eau", "Ténèbres"]}, {"id": 319, "name": "Sharpedo", "types": ["Eau", "Ténèbres"]}, {"id": 320, "name": "Wailmer", "types": ["Eau"]}, {"id": 321, "name": "Wailord", "types": ["Eau"]}, {"id": 322, "name": "Chamallot", "types": ["Feu", "Sol"]}, {"id": 323, "name": "Camérupt", "types": ["Feu", "Sol"]}, {"id": 324, "name": "Chartor", "types": ["Feu"]}, {"id": 325, "name": "Spoink", "types": ["Psy"]}, {"id": 326, "name": "Groret", "types": ["Psy"]}, {"id": 327, "name": "Spinda", "types": ["Normal"]}, {"id": 328, "name": "Kraknoix", "types": ["Sol"]}, {"id": 329, "name": "Vibraninf", "types": ["Sol", "Dragon"]}, {"id": 330, "name": "Libégon", "types": ["Sol", "Dragon"]}, {"id": 331, "name": "Cacnea", "types": ["Plante"]}, {"id": 332, "name": "Cacturne", "types": ["Plante", "Ténèbres"]}, {"id": 333, "name": "Tylton", "types": ["Normal", "Vol"]}, {"id": 334, "name": "Altaria", "types": ["Dragon", "Vol"]}, {"id": 335, "name": "Mangriff", "types": ["Normal"]}, {"id": 336, "name": "Séviper", "types": ["Poison"]}, {"id": 337, "name": "Séléroc", "types": ["Roche", "Psy"]}, {"id": 338, "name": "Solaroc", "types": ["Roche", "Psy"]}, {"id": 339, "name": "Barloche", "types": ["Eau", "Sol"]}, {"id": 340, "name": "Barbicha", "types": ["Eau", "Sol"]}, {"id": 341, "name": "Écrapince", "types": ["Eau"]}, {"id": 342, "name": "Colhomard", "types": ["Eau", "Ténèbres"]}, {"id": 343, "name": "Balbuto", "types": ["Sol", "Psy"]}, {"id": 344, "name": "Kaorine", "types": ["Sol", "Psy"]}, {"id": 345, "name": "Lilia", "types": ["Roche", "Plante"]}, {"id": 346, "name": "Vacilys", "types": ["Roche", "Plante"]}, {"id": 347, "name": "Anorith", "types": ["Roche", "Insecte"]}, {"id": 348, "name": "Armaldo", "types": ["Roche", "Insecte"]}, {"id": 349, "name": "Barpau", "types": ["Eau"]}, {"id": 350, "name": "Milobellus", "types": ["Eau"]}, {"id": 351, "name": "Morphéo", "types": ["Normal"]}, {"id": 352, "name": "Kecleon", "types": ["Normal"]}, {"id": 353, "name": "Polichombr", "types": ["Spectre"]}, {"id": 354, "name": "Branette", "types": ["Spectre"]}, {"id": 355, "name": "Skelénox", "types": ["Spectre"]}, {"id": 356, "name": "Téraclope", "types": ["Spectre"]}, {"id": 357, "name": "Tropius", "types": ["Plante", "Vol"]}, {"id": 358, "name": "Éoko", "types": ["Psy"]}, {"id": 359, "name": "Absol", "types": ["Ténèbres"]}, {"id": 360, "name": "Okéoké", "types": ["Psy"]}, {"id": 361, "name": "Stalgamin", "types": ["Glace"]}, {"id": 362, "name": "Oniglali", "types": ["Glace"]}, {"id": 363, "name": "Obalie", "types": ["Glace", "Eau"]}, {"id": 364, "name": "Phogleur", "types": ["Glace", "Eau"]}, {"id": 365, "name": "Kaimorse", "types": ["Glace", "Eau"]}, {"id": 366, "name": "Coquiperl", "types": ["Eau"]}, {"id": 367, "name": "Serpang", "types": ["Eau"]}, {"id": 368, "name": "Rosabyss", "types": ["Eau"]}, {"id": 369, "name": "Relicanth", "types": ["Eau", "Roche"]}, {"id": 370, "name": "Lovdisc", "types": ["Eau"]}, {"id": 371, "name": "Draby", "types": ["Dragon"]}, {"id": 372, "name": "Drackhaus", "types": ["Dragon"]}, {"id": 373, "name": "Drattak", "types": ["Dragon", "Vol"]}, {"id": 374, "name": "Terhal", "types": ["Acier", "Psy"]}, {"id": 375, "name": "Métang", "types": ["Acier", "Psy"]}, {"id": 376, "name": "Métalosse", "types": ["Acier", "Psy"]}, {"id": 377, "name": "Regirock", "types": ["Roche"]}, {"id": 378, "name": "Regice", "types": ["Glace"]}, {"id": 379, "name": "Registeel", "types": ["Acier"]}, {"id": 380, "name": "Latias", "types": ["Dragon", "Psy"]}, {"id": 381, "name": "Latios", "types": ["Dragon", "Psy"]}, {"id": 382, "name": "Kyogre", "types": ["Eau"]}, {"id": 383, "name": "Groudon", "types": ["Sol"]}, {"id": 384, "name": "Rayquaza", "types": ["Dragon", "Vol"]}, {"id": 385, "name": "Jirachi", "types": ["Acier", "Psy"]}, {"id": 386, "name": "Deoxys", "types": ["Psy"]}, {"id": 387, "name": "Tortipouss", "types": ["Plante"]}, {"id": 388, "name": "Boskara", "types": ["Plante"]}, {"id": 389, "name": "Torterra", "types": ["Plante", "Sol"]}, {"id": 390, "name": "Ouisticram", "types": ["Feu"]}, {"id": 391, "name": "Chimpenfeu", "types": ["Feu", "Combat"]}, {"id": 392, "name": "Simiabraz", "types": ["Feu", "Combat"]}, {"id": 393, "name": "Tiplouf", "types": ["Eau"]}, {"id": 394, "name": "Prinplouf", "types": ["Eau"]}, {"id": 395, "name": "Pingoléon", "types": ["Eau", "Acier"]}, {"id": 396, "name": "Étourmi", "types": ["Normal", "Vol"]}, {"id": 397, "name": "Étourvol", "types": ["Normal", "Vol"]}, {"id": 398, "name": "Étouraptor", "types": ["Normal", "Vol"]}, {"id": 399, "name": "Keunotor", "types": ["Normal"]}, {"id": 400, "name": "Castorno", "types": ["Normal", "Eau"]}, {"id": 401, "name": "Crikzik", "types": ["Insecte"]}, {"id": 402, "name": "Mélokrik", "types": ["Insecte"]}, {"id": 403, "name": "Lixy", "types": ["Électrik"]}, {"id": 404, "name": "Luxio", "types": ["Électrik"]}, {"id": 405, "name": "Luxray", "types": ["Électrik"]}, {"id": 406, "name": "Rozbouton", "types": ["Plante", "Poison"]}, {"id": 407, "name": "Roserade", "types": ["Plante", "Poison"]}, {"id": 408, "name": "Kranidos", "types": ["Roche"]}, {"id": 409, "name": "Charkos", "types": ["Roche"]}, {"id": 410, "name": "Dinoclier", "types": ["Roche", "Acier"]}, {"id": 411, "name": "Bastiodon", "types": ["Roche", "Acier"]}, {"id": 412, "name": "Cheniti", "types": ["Insecte"]}, {"id": 413, "name": "Cheniselle", "types": ["Insecte", "Plante"]}, {"id": 414, "name": "Papilord", "types": ["Insecte", "Vol"]}, {"id": 415, "name": "Apitrini", "types": ["Insecte", "Vol"]}, {"id": 416, "name": "Apireine", "types": ["Insecte", "Vol"]}, {"id": 417, "name": "Pachirisu", "types": ["Électrik"]}, {"id": 418, "name": "Mustébouée", "types": ["Eau"]}, {"id": 419, "name": "Mustéflott", "types": ["Eau"]}, {"id": 420, "name": "Ceribou", "types": ["Plante"]}, {"id": 421, "name": "Ceriflor", "types": ["Plante"]}, {"id": 422, "name": "Sancoki", "types": ["Eau"]}, {"id": 423, "name": "Tritosor", "types": ["Eau", "Sol"]}, {"id": 424, "name": "Capidextre", "types": ["Normal"]}, {"id": 425, "name": "Baudrive", "types": ["Spectre", "Vol"]}, {"id": 426, "name": "Grodrive", "types": ["Spectre", "Vol"]}, {"id": 427, "name": "Laporeille", "types": ["Normal"]}, {"id": 428, "name": "Lockpin", "types": ["Normal"]}, {"id": 429, "name": "Magirêve", "types": ["Spectre"]}, {"id": 430, "name": "Corboss", "types": ["Ténèbres", "Vol"]}, {"id": 431, "name": "Chaglam", "types": ["Normal"]}, {"id": 432, "name": "Chaffreux", "types": ["Normal"]}, {"id": 433, "name": "Korillon", "types": ["Psy"]}, {"id": 434, "name": "Moufouette", "types": ["Poison", "Ténèbres"]}, {"id": 435, "name": "Moufflair", "types": ["Poison", "Ténèbres"]}, {"id": 436, "name": "Archéomire", "types": ["Acier", "Psy"]}, {"id": 437, "name": "Archéodong", "types": ["Acier", "Psy"]}, {"id": 438, "name": "Manzaï", "types": ["Roche"]}, {"id": 439, "name": "Mime Jr.", "types": ["Psy", "Fée"]}, {"id": 440, "name": "Ptiravi", "types": ["Normal"]}, {"id": 441, "name": "Pijako", "types": ["Normal", "Vol"]}, {"id": 442, "name": "Spiritomb", "types": ["Spectre", "Ténèbres"]}, {"id": 443, "name": "Griknot", "types": ["Dragon", "Sol"]}, {"id": 444, "name": "Carmache", "types": ["Dragon", "Sol"]}, {"id": 445, "name": "Carchacrok", "types": ["Dragon", "Sol"]}, {"id": 446, "name": "Goinfrex", "types": ["Normal"]}, {"id": 447, "name": "Riolu", "types": ["Combat"]}, {"id": 448, "name": "Lucario", "types": ["Combat", "Acier"]}, {"id": 449, "name": "Hippopotas", "types": ["Sol"]}, {"id": 450, "name": "Hippodocus", "types": ["Sol"]}, {"id": 451, "name": "Rapion", "types": ["Poison", "Insecte"]}, {"id": 452, "name": "Drascore", "types": ["Poison", "Ténèbres"]}, {"id": 453, "name": "Cradopaud", "types": ["Poison", "Combat"]}, {"id": 454, "name": "Coatox", "types": ["Poison", "Combat"]}, {"id": 455, "name": "Vortente", "types": ["Plante"]}, {"id": 456, "name": "Écayon", "types": ["Eau"]}, {"id": 457, "name": "Luminéon", "types": ["Eau"]}, {"id": 458, "name": "Babimanta", "types": ["Eau", "Vol"]}, {"id": 459, "name": "Blizzi", "types": ["Plante", "Glace"]}, {"id": 460, "name": "Blizzaroi", "types": ["Plante", "Glace"]}, {"id": 461, "name": "Dimoret", "types": ["Ténèbres", "Glace"]}, {"id": 462, "name": "Magnézone", "types": ["Électrik", "Acier"]}, {"id": 463, "name": "Coudlangue", "types": ["Normal"]}, {"id": 464, "name": "Rhinastoc", "types": ["Sol", "Roche"]}, {"id": 465, "name": "Bouldeneu", "types": ["Plante"]}, {"id": 466, "name": "Élekable", "types": ["Électrik"]}, {"id": 467, "name": "Maganon", "types": ["Feu"]}, {"id": 468, "name": "Togekiss", "types": ["Fée", "Vol"]}, {"id": 469, "name": "Yanmega", "types": ["Insecte", "Vol"]}, {"id": 470, "name": "Phyllali", "types": ["Plante"]}, {"id": 471, "name": "Givrali", "types": ["Glace"]}, {"id": 472, "name": "Scorvol", "types": ["Sol", "Vol"]}, {"id": 473, "name": "Mammochon", "types": ["Glace", "Sol"]}, {"id": 474, "name": "Porygon-Z", "types": ["Normal"]}, {"id": 475, "name": "Gallame", "types": ["Psy", "Combat"]}, {"id": 476, "name": "Tarinorme", "types": ["Roche", "Acier"]}, {"id": 477, "name": "Noctunoir", "types": ["Spectre"]}, {"id": 478, "name": "Momartik", "types": ["Glace", "Spectre"]}, {"id": 479, "name": "Motisma", "types": ["Électrik", "Spectre"]}, {"id": 480, "name": "Créhelf", "types": ["Psy"]}, {"id": 481, "name": "Créfollet", "types": ["Psy"]}, {"id": 482, "name": "Créfadet", "types": ["Psy"]}, {"id": 483, "name": "Dialga", "types": ["Acier", "Dragon"]}, {"id": 484, "name": "Palkia", "types": ["Eau", "Dragon"]}, {"id": 485, "name": "Heatran", "types": ["Feu", "Acier"]}, {"id": 486, "name": "Regigigas", "types": ["Normal"]}, {"id": 487, "name": "Giratina", "types": ["Spectre", "Dragon"]}, {"id": 488, "name": "Cresselia", "types": ["Psy"]}, {"id": 489, "name": "Phione", "types": ["Eau"]}, {"id": 490, "name": "Manaphy", "types": ["Eau"]}, {"id": 491, "name": "Darkrai", "types": ["Ténèbres"]}, {"id": 492, "name": "Shaymin", "types": ["Plante"]}, {"id": 493, "name": "Arceus", "types": ["Normal"]}, {"id": 494, "name": "Victini", "types": ["Psy", "Feu"]}, {"id": 495, "name": "Vipélierre", "types": ["Plante"]}, {"id": 496, "name": "Lianaja", "types": ["Plante"]}, {"id": 497, "name": "Majaspic", "types": ["Plante"]}, {"id": 498, "name": "Gruikui", "types": ["Feu"]}, {"id": 499, "name": "Grotichon", "types": ["Feu", "Combat"]}, {"id": 500, "name": "Roitiflam", "types": ["Feu", "Combat"]}, {"id": 501, "name": "Moustillon", "types": ["Eau"]}, {"id": 502, "name": "Mateloutre", "types": ["Eau"]}, {"id": 503, "name": "Clamiral", "types": ["Eau"]}, {"id": 504, "name": "Ratentif", "types": ["Normal"]}, {"id": 505, "name": "Miradar", "types": ["Normal"]}, {"id": 506, "name": "Ponchiot", "types": ["Normal"]}, {"id": 507, "name": "Ponchien", "types": ["Normal"]}, {"id": 508, "name": "Mastouffe", "types": ["Normal"]}, {"id": 509, "name": "Chacripan", "types": ["Ténèbres"]}, {"id": 510, "name": "Léopardus", "types": ["Ténèbres"]}, {"id": 511, "name": "Feuillajou", "types": ["Plante"]}, {"id": 512, "name": "Feuiloutan", "types": ["Plante"]}, {"id": 513, "name": "Flamajou", "types": ["Feu"]}, {"id": 514, "name": "Flamoutan", "types": ["Feu"]}, {"id": 515, "name": "Flotajou", "types": ["Eau"]}, {"id": 516, "name": "Flotoutan", "types": ["Eau"]}, {"id": 517, "name": "Munna", "types": ["Psy"]}, {"id": 518, "name": "Mushana", "types": ["Psy"]}, {"id": 519, "name": "Poichigeon", "types": ["Normal", "Vol"]}, {"id": 520, "name": "Colombeau", "types": ["Normal", "Vol"]}, {"id": 521, "name": "Déflaisan", "types": ["Normal", "Vol"]}, {"id": 522, "name": "Zébibron", "types": ["Électrik"]}, {"id": 523, "name": "Zéblitz", "types": ["Électrik"]}, {"id": 524, "name": "Nodulithe", "types": ["Roche"]}, {"id": 525, "name": "Géolithe", "types": ["Roche"]}, {"id": 526, "name": "Gigalithe", "types": ["Roche"]}, {"id": 527, "name": "Chovsourir", "types": ["Psy", "Vol"]}, {"id": 528, "name": "Rhinolove", "types": ["Psy", "Vol"]}, {"id": 529, "name": "Rototaupe", "types": ["Sol"]}, {"id": 530, "name": "Minotaupe", "types": ["Sol", "Acier"]}, {"id": 531, "name": "Nanméouïe", "types": ["Normal"]}, {"id": 532, "name": "Charpenti", "types": ["Combat"]}, {"id": 533, "name": "Ouvrifier", "types": ["Combat"]}, {"id": 534, "name": "Bétochef", "types": ["Combat"]}, {"id": 535, "name": "Tritonde", "types": ["Eau"]}, {"id": 536, "name": "Batracné", "types": ["Eau", "Sol"]}, {"id": 537, "name": "Crapustule", "types": ["Eau", "Sol"]}, {"id": 538, "name": "Judokrak", "types": ["Combat"]}, {"id": 539, "name": "Karaclée", "types": ["Combat"]}, {"id": 540, "name": "Larveyette", "types": ["Insecte", "Plante"]}, {"id": 541, "name": "Couverdure", "types": ["Insecte", "Plante"]}, {"id": 542, "name": "Manternel", "types": ["Insecte", "Plante"]}, {"id": 543, "name": "Venipatte", "types": ["Insecte", "Poison"]}, {"id": 544, "name": "Scobolide", "types": ["Insecte", "Poison"]}, {"id": 545, "name": "Brutapode", "types": ["Insecte", "Poison"]}, {"id": 546, "name": "Doudouvet", "types": ["Plante", "Fée"]}, {"id": 547, "name": "Farfaduvet", "types": ["Plante", "Fée"]}, {"id": 548, "name": "Chlorobule", "types": ["Plante"]}, {"id": 549, "name": "Fragilady", "types": ["Plante"]}, {"id": 550, "name": "Bargantua", "types": ["Eau"]}, {"id": 551, "name": "Mascaïman", "types": ["Sol", "Ténèbres"]}, {"id": 552, "name": "Escroco", "types": ["Sol", "Ténèbres"]}, {"id": 553, "name": "Crocorible", "types": ["Sol", "Ténèbres"]}, {"id": 554, "name": "Darumarond", "types": ["Feu"]}, {"id": 555, "name": "Darumacho", "types": ["Feu"]}, {"id": 556, "name": "Maracachi", "types": ["Plante"]}, {"id": 557, "name": "Crabicoque", "types": ["Insecte", "Roche"]}, {"id": 558, "name": "Crabaraque", "types": ["Insecte", "Roche"]}, {"id": 559, "name": "Baggiguane", "types": ["Ténèbres", "Combat"]}, {"id": 560, "name": "Baggaïd", "types": ["Ténèbres", "Combat"]}, {"id": 561, "name": "Cryptéro", "types": ["Psy", "Vol"]}, {"id": 562, "name": "Tutafeh", "types": ["Spectre"]}, {"id": 563, "name": "Tutankafer", "types": ["Spectre"]}, {"id": 564, "name": "Carapagos", "types": ["Eau", "Roche"]}, {"id": 565, "name": "Mégapagos", "types": ["Eau", "Roche"]}, {"id": 566, "name": "Arkéapti", "types": ["Roche", "Vol"]}, {"id": 567, "name": "Aéroptéryx", "types": ["Roche", "Vol"]}, {"id": 568, "name": "Miamiasme", "types": ["Poison"]}, {"id": 569, "name": "Miasmax", "types": ["Poison"]}, {"id": 570, "name": "Zorua", "types": ["Ténèbres"]}, {"id": 571, "name": "Zoroark", "types": ["Ténèbres"]}, {"id": 572, "name": "Chinchidou", "types": ["Normal"]}, {"id": 573, "name": "Pashmilla", "types": ["Normal"]}, {"id": 574, "name": "Scrutella", "types": ["Psy"]}, {"id": 575, "name": "Mesmérella", "types": ["Psy"]}, {"id": 576, "name": "Sidérella", "types": ["Psy"]}, {"id": 577, "name": "Nucléos", "types": ["Psy"]}, {"id": 578, "name": "Méios", "types": ["Psy"]}, {"id": 579, "name": "Symbios", "types": ["Psy"]}, {"id": 580, "name": "Couaneton", "types": ["Eau", "Vol"]}, {"id": 581, "name": "Lakmécygne", "types": ["Eau", "Vol"]}, {"id": 582, "name": "Sorbébé", "types": ["Glace"]}, {"id": 583, "name": "Sorboul", "types": ["Glace"]}, {"id": 584, "name": "Sorbouboul", "types": ["Glace"]}, {"id": 585, "name": "Vivaldaim", "types": ["Normal", "Plante"]}, {"id": 586, "name": "Haydaim", "types": ["Normal", "Plante"]}, {"id": 587, "name": "Emolga", "types": ["Électrik", "Vol"]}, {"id": 588, "name": "Carabing", "types": ["Insecte"]}, {"id": 589, "name": "Lançargot", "types": ["Insecte", "Acier"]}, {"id": 590, "name": "Trompignon", "types": ["Plante", "Poison"]}, {"id": 591, "name": "Gaulet", "types": ["Plante", "Poison"]}, {"id": 592, "name": "Viskuse", "types": ["Eau", "Spectre"]}, {"id": 593, "name": "Moyade", "types": ["Eau", "Spectre"]}, {"id": 594, "name": "Mamanbo", "types": ["Eau"]}, {"id": 595, "name": "Statitik", "types": ["Insecte", "Électrik"]}, {"id": 596, "name": "Mygavolt", "types": ["Insecte", "Électrik"]}, {"id": 597, "name": "Grindur", "types": ["Plante", "Acier"]}, {"id": 598, "name": "Noacier", "types": ["Plante", "Acier"]}, {"id": 599, "name": "Tic", "types": ["Acier"]}, {"id": 600, "name": "Clic", "types": ["Acier"]}, {"id": 601, "name": "Cliticlic", "types": ["Acier"]}, {"id": 602, "name": "Anchwatt", "types": ["Électrik"]}, {"id": 603, "name": "Lampéroie", "types": ["Électrik"]}, {"id": 604, "name": "Ohmassacre", "types": ["Électrik"]}, {"id": 605, "name": "Lewsor", "types": ["Psy"]}, {"id": 606, "name": "Neitram", "types": ["Psy"]}, {"id": 607, "name": "Funécire", "types": ["Spectre", "Feu"]}, {"id": 608, "name": "Mélancolux", "types": ["Spectre", "Feu"]}, {"id": 609, "name": "Lugulabre", "types": ["Spectre", "Feu"]}, {"id": 610, "name": "Coupenotte", "types": ["Dragon"]}, {"id": 611, "name": "Incisache", "types": ["Dragon"]}, {"id": 612, "name": "Tranchodon", "types": ["Dragon"]}, {"id": 613, "name": "Polarhume", "types": ["Glace"]}, {"id": 614, "name": "Polagriffe", "types": ["Glace"]}, {"id": 615, "name": "Hexagel", "types": ["Glace"]}, {"id": 616, "name": "Escargaume", "types": ["Insecte"]}, {"id": 617, "name": "Limaspeed", "types": ["Insecte"]}, {"id": 618, "name": "Limonde", "types": ["Sol", "Électrik"]}, {"id": 619, "name": "Kungfouine", "types": ["Combat"]}, {"id": 620, "name": "Shaofouine", "types": ["Combat"]}, {"id": 621, "name": "Drakkarmin", "types": ["Dragon"]}, {"id": 622, "name": "Gringolem", "types": ["Sol", "Spectre"]}, {"id": 623, "name": "Golemastoc", "types": ["Sol", "Spectre"]}, {"id": 624, "name": "Scalpion", "types": ["Ténèbres", "Acier"]}, {"id": 625, "name": "Scalproie", "types": ["Ténèbres", "Acier"]}, {"id": 626, "name": "Frison", "types": ["Normal"]}, {"id": 627, "name": "Furaiglon", "types": ["Normal", "Vol"]}, {"id": 628, "name": "Gueriaigle", "types": ["Normal", "Vol"]}, {"id": 629, "name": "Vostourno", "types": ["Ténèbres", "Vol"]}, {"id": 630, "name": "Vaututrice", "types": ["Ténèbres", "Vol"]}, {"id": 631, "name": "Aflamanoir", "types": ["Feu"]}, {"id": 632, "name": "Fermite", "types": ["Insecte", "Acier"]}, {"id": 633, "name": "Solochi", "types": ["Ténèbres", "Dragon"]}, {"id": 634, "name": "Diamat", "types": ["Ténèbres", "Dragon"]}, {"id": 635, "name": "Trioxhydre", "types": ["Ténèbres", "Dragon"]}, {"id": 636, "name": "Pyronille", "types": ["Insecte", "Feu"]}, {"id": 637, "name": "Pyrax", "types": ["Insecte", "Feu"]}, {"id": 638, "name": "Cobaltium", "types": ["Acier", "Combat"]}, {"id": 639, "name": "Terrakium", "types": ["Roche", "Combat"]}, {"id": 640, "name": "Viridium", "types": ["Plante", "Combat"]}, {"id": 641, "name": "Boréas", "types": ["Vol"]}, {"id": 642, "name": "Fulguris", "types": ["Électrik", "Vol"]}, {"id": 643, "name": "Reshiram", "types": ["Dragon", "Feu"]}, {"id": 644, "name": "Zekrom", "types": ["Dragon", "Électrik"]}, {"id": 645, "name": "Démétéros", "types": ["Sol", "Vol"]}, {"id": 646, "name": "Kyurem", "types": ["Dragon", "Glace"]}, {"id": 647, "name": "Keldeo", "types": ["Eau", "Combat"]}, {"id": 648, "name": "Meloetta", "types": ["Normal", "Psy"]}, {"id": 649, "name": "Genesect", "types": ["Insecte", "Acier"]}, {"id": 650, "name": "Marisson", "types": ["Plante"]}, {"id": 651, "name": "Boguérisse", "types": ["Plante"]}, {"id": 652, "name": "Blindépique", "types": ["Plante", "Combat"]}, {"id": 653, "name": "Feunnec", "types": ["Feu"]}, {"id": 654, "name": "Roussil", "types": ["Feu"]}, {"id": 655, "name": "Goupelin", "types": ["Feu", "Psy"]}, {"id": 656, "name": "Grenousse", "types": ["Eau"]}, {"id": 657, "name": "Croâporal", "types": ["Eau"]}, {"id": 658, "name": "Amphinobi", "types": ["Eau", "Ténèbres"]}, {"id": 659, "name": "Sapereau", "types": ["Normal"]}, {"id": 660, "name": "Excavarenne", "types": ["Normal", "Sol"]}, {"id": 661, "name": "Passerouge", "types": ["Normal", "Vol"]}, {"id": 662, "name": "Braisillon", "types": ["Feu", "Vol"]}, {"id": 663, "name": "Flambusard", "types": ["Feu", "Vol"]}, {"id": 664, "name": "Lépidonille", "types": ["Insecte"]}, {"id": 665, "name": "Pérégrain", "types": ["Insecte"]}, {"id": 666, "name": "Prismillon", "types": ["Insecte", "Vol"]}, {"id": 667, "name": "Hélionceau", "types": ["Feu", "Normal"]}, {"id": 668, "name": "Némélios", "types": ["Feu", "Normal"]}, {"id": 669, "name": "Flabébé", "types": ["Fée"]}, {"id": 670, "name": "Floette", "types": ["Fée"]}, {"id": 671, "name": "Florges", "types": ["Fée"]}, {"id": 672, "name": "Cabriolaine", "types": ["Plante"]}, {"id": 673, "name": "Chevroum", "types": ["Plante"]}, {"id": 674, "name": "Pandespiègle", "types": ["Combat"]}, {"id": 675, "name": "Pandarbare", "types": ["Combat", "Ténèbres"]}, {"id": 676, "name": "Couafarel", "types": ["Normal"]}, {"id": 677, "name": "Psystigri", "types": ["Psy"]}, {"id": 678, "name": "Mistigrix", "types": ["Psy"]}, {"id": 679, "name": "Monorpale", "types": ["Acier", "Spectre"]}, {"id": 680, "name": "Dimoclès", "types": ["Acier", "Spectre"]}, {"id": 681, "name": "Exagide", "types": ["Acier", "Spectre"]}, {"id": 682, "name": "Fluvetin", "types": ["Fée"]}, {"id": 683, "name": "Cocotine", "types": ["Fée"]}, {"id": 684, "name": "Sucroquin", "types": ["Fée"]}, {"id": 685, "name": "Cupcanaille", "types": ["Fée"]}, {"id": 686, "name": "Sepiatop", "types": ["Ténèbres", "Psy"]}, {"id": 687, "name": "Sepiatroce", "types": ["Ténèbres", "Psy"]}, {"id": 688, "name": "Opermine", "types": ["Roche", "Eau"]}, {"id": 689, "name": "Golgopathe", "types": ["Roche", "Eau"]}, {"id": 690, "name": "Venalgue", "types": ["Poison", "Eau"]}, {"id": 691, "name": "Kravarech", "types": ["Poison", "Dragon"]}, {"id": 692, "name": "Flingouste", "types": ["Eau"]}, {"id": 693, "name": "Gamblast", "types": ["Eau"]}, {"id": 694, "name": "Galvaran", "types": ["Électrik", "Normal"]}, {"id": 695, "name": "Iguolta", "types": ["Électrik", "Normal"]}, {"id": 696, "name": "Ptyranidur", "types": ["Roche", "Dragon"]}, {"id": 697, "name": "Rexillius", "types": ["Roche", "Dragon"]}, {"id": 698, "name": "Amagara", "types": ["Roche", "Glace"]}, {"id": 699, "name": "Dragmara", "types": ["Roche", "Glace"]}, {"id": 700, "name": "Nymphali", "types": ["Fée"]}, {"id": 701, "name": "Brutalibré", "types": ["Combat", "Vol"]}, {"id": 702, "name": "Dedenne", "types": ["Électrik", "Fée"]}, {"id": 703, "name": "Strassie", "types": ["Roche", "Fée"]}, {"id": 704, "name": "Mucuscule", "types": ["Dragon"]}, {"id": 705, "name": "Colimucus", "types": ["Dragon"]}, {"id": 706, "name": "Muplodocus", "types": ["Dragon"]}, {"id": 707, "name": "Trousselin", "types": ["Acier", "Fée"]}, {"id": 708, "name": "Brocélôme", "types": ["Spectre", "Plante"]}, {"id": 709, "name": "Desséliande", "types": ["Spectre", "Plante"]}, {"id": 710, "name": "Pitrouille", "types": ["Spectre", "Plante"]}, {"id": 711, "name": "Banshitrouye", "types": ["Spectre", "Plante"]}, {"id": 712, "name": "Grelaçon", "types": ["Glace"]}, {"id": 713, "name": "Séracrawl", "types": ["Glace"]}, {"id": 714, "name": "Sonistrelle", "types": ["Vol", "Dragon"]}, {"id": 715, "name": "Bruyverne", "types": ["Vol", "Dragon"]}, {"id": 716, "name": "Xerneas", "types": ["Fée"]}, {"id": 717, "name": "Yveltal", "types": ["Ténèbres", "Vol"]}, {"id": 718, "name": "Zygarde", "types": ["Dragon", "Sol"]}, {"id": 719, "name": "Diancie", "types": ["Roche", "Fée"]}, {"id": 720, "name": "Hoopa", "types": ["Psy", "Spectre"]}, {"id": 721, "name": "Volcanion", "types": ["Feu", "Eau"]}, {"id": 722, "name": "Brindibou", "types": ["Plante", "Vol"]}, {"id": 723, "name": "Efflèche", "types": ["Plante", "Vol"]}, {"id": 724, "name": "Archéduc", "types": ["Plante", "Spectre"]}, {"id": 725, "name": "Flamiaou", "types": ["Feu"]}, {"id": 726, "name": "Matoufeu", "types": ["Feu"]}, {"id": 727, "name": "Félinferno", "types": ["Feu", "Ténèbres"]}, {"id": 728, "name": "Otaquin", "types": ["Eau"]}, {"id": 729, "name": "Otarlette", "types": ["Eau"]}, {"id": 730, "name": "Oratoria", "types": ["Eau", "Fée"]}, {"id": 731, "name": "Picassaut", "types": ["Normal", "Vol"]}, {"id": 732, "name": "Piclairon", "types": ["Normal", "Vol"]}, {"id": 733, "name": "Bazoucan", "types": ["Normal", "Vol"]}, {"id": 734, "name": "Manglouton", "types": ["Normal"]}, {"id": 735, "name": "Argouste", "types": ["Normal"]}, {"id": 736, "name": "Larvibule", "types": ["Insecte"]}, {"id": 737, "name": "Chrysapile", "types": ["Insecte", "Électrik"]}, {"id": 738, "name": "Lucanon", "types": ["Insecte", "Électrik"]}, {"id": 739, "name": "Crabagarre", "types": ["Combat"]}, {"id": 740, "name": "Crabominable", "types": ["Combat", "Glace"]}, {"id": 741, "name": "Plumeline", "types": ["Feu", "Vol"]}, {"id": 742, "name": "Bombydou", "types": ["Insecte", "Fée"]}, {"id": 743, "name": "Rubombelle", "types": ["Insecte", "Fée"]}, {"id": 744, "name": "Rocabot", "types": ["Roche"]}, {"id": 745, "name": "Lougaroc", "types": ["Roche"]}, {"id": 746, "name": "Froussardine", "types": ["Eau"]}, {"id": 747, "name": "Vorastérie", "types": ["Poison", "Eau"]}, {"id": 748, "name": "Prédastérie", "types": ["Poison", "Eau"]}, {"id": 749, "name": "Tiboudet", "types": ["Sol"]}, {"id": 750, "name": "Bourrinos", "types": ["Sol"]}, {"id": 751, "name": "Araqua", "types": ["Eau", "Insecte"]}, {"id": 752, "name": "Tarenbulle", "types": ["Eau", "Insecte"]}, {"id": 753, "name": "Mimantis", "types": ["Plante"]}, {"id": 754, "name": "Floramantis", "types": ["Plante"]}, {"id": 755, "name": "Spododo", "types": ["Plante", "Fée"]}, {"id": 756, "name": "Lampignon", "types": ["Plante", "Fée"]}, {"id": 757, "name": "Tritox", "types": ["Poison", "Feu"]}, {"id": 758, "name": "Malamandre", "types": ["Poison", "Feu"]}, {"id": 759, "name": "Nounourson", "types": ["Normal", "Combat"]}, {"id": 760, "name": "Chelours", "types": ["Normal", "Combat"]}, {"id": 761, "name": "Croquine", "types": ["Plante"]}, {"id": 762, "name": "Candine", "types": ["Plante"]}, {"id": 763, "name": "Sucreine", "types": ["Plante"]}, {"id": 764, "name": "Guérilande", "types": ["Fée"]}, {"id": 765, "name": "Gouroutan", "types": ["Normal", "Psy"]}, {"id": 766, "name": "Quartermac", "types": ["Combat"]}, {"id": 767, "name": "Sovkipou", "types": ["Insecte", "Eau"]}, {"id": 768, "name": "Sarmuraï", "types": ["Insecte", "Eau"]}, {"id": 769, "name": "Bacabouh", "types": ["Spectre", "Sol"]}, {"id": 770, "name": "Trépassable", "types": ["Spectre", "Sol"]}, {"id": 771, "name": "Concombaffe", "types": ["Eau"]}, {"id": 772, "name": "Type:0", "types": ["Normal"]}, {"id": 773, "name": "Silvallié", "types": ["Normal"]}, {"id": 774, "name": "Météno", "types": ["Roche", "Vol"]}, {"id": 775, "name": "Dodoala", "types": ["Normal"]}, {"id": 776, "name": "Boumata", "types": ["Feu", "Dragon"]}, {"id": 777, "name": "Togedemaru", "types": ["Électrik", "Acier"]}, {"id": 778, "name": "Mimiqui", "types": ["Spectre", "Fée"]}, {"id": 779, "name": "Denticrisse", "types": ["Eau", "Psy"]}, {"id": 780, "name": "Draïeul", "types": ["Normal", "Dragon"]}, {"id": 781, "name": "Sinistrail", "types": ["Spectre", "Plante"]}, {"id": 782, "name": "Bébécaille", "types": ["Dragon"]}, {"id": 783, "name": "Écaïd", "types": ["Dragon", "Combat"]}, {"id": 784, "name": "Ékaïser", "types": ["Dragon", "Combat"]}, {"id": 785, "name": "Tokorico", "types": ["Électrik", "Fée"]}, {"id": 786, "name": "Tokopiyon", "types": ["Psy", "Fée"]}, {"id": 787, "name": "Tokotoro", "types": ["Plante", "Fée"]}, {"id": 788, "name": "Tokopisco", "types": ["Eau", "Fée"]}, {"id": 789, "name": "Cosmog", "types": ["Psy"]}, {"id": 790, "name": "Cosmovum", "types": ["Psy"]}, {"id": 791, "name": "Solgaleo", "types": ["Psy", "Acier"]}, {"id": 792, "name": "Lunala", "types": ["Psy", "Spectre"]}, {"id": 793, "name": "Zéroïd", "types": ["Roche", "Poison"]}, {"id": 794, "name": "Mouscoto", "types": ["Insecte", "Combat"]}, {"id": 795, "name": "Cancrelove", "types": ["Insecte", "Combat"]}, {"id": 796, "name": "Câblifère", "types": ["Électrik"]}, {"id": 797, "name": "Bamboiselle", "types": ["Acier", "Vol"]}, {"id": 798, "name": "Katagami", "types": ["Plante", "Acier"]}, {"id": 799, "name": "Engloutyran", "types": ["Ténèbres", "Dragon"]}, {"id": 800, "name": "Necrozma", "types": ["Psy"]}, {"id": 801, "name": "Magearna", "types": ["Acier", "Fée"]}, {"id": 802, "name": "Marshadow", "types": ["Combat", "Spectre"]}, {"id": 803, "name": "Vémini", "types": ["Poison"]}, {"id": 804, "name": "Mandrillon", "types": ["Poison", "Dragon"]}, {"id": 805, "name": "Ama-Ama", "types": ["Roche", "Acier"]}, {"id": 806, "name": "Pierroteknik", "types": ["Feu", "Spectre"]}, {"id": 807, "name": "Zeraora", "types": ["Électrik"]}, {"id": 808, "name": "Meltan", "types": ["Acier"]}, {"id": 809, "name": "Melmetal", "types": ["Acier"]}, {"id": 810, "name": "Ouistempo", "types": ["Plante"]}, {"id": 811, "name": "Badabouin", "types": ["Plante"]}, {"id": 812, "name": "Gorythmic", "types": ["Plante"]}, {"id": 813, "name": "Flambino", "types": ["Feu"]}, {"id": 814, "name": "Lapyro", "types": ["Feu"]}, {"id": 815, "name": "Pyrobut", "types": ["Feu"]}, {"id": 816, "name": "Larméléon", "types": ["Eau"]}, {"id": 817, "name": "Arrozard", "types": ["Eau"]}, {"id": 818, "name": "Lézargus", "types": ["Eau"]}, {"id": 819, "name": "Rongourmand", "types": ["Normal"]}, {"id": 820, "name": "Rongrigou", "types": ["Normal"]}, {"id": 821, "name": "Minisange", "types": ["Vol"]}, {"id": 822, "name": "Bleuseille", "types": ["Vol"]}, {"id": 823, "name": "Corvaillus", "types": ["Vol", "Acier"]}, {"id": 824, "name": "Larvadar", "types": ["Insecte"]}, {"id": 825, "name": "Coléodôme", "types": ["Insecte", "Psy"]}, {"id": 826, "name": "Astronelle", "types": ["Insecte", "Psy"]}, {"id": 827, "name": "Goupilou", "types": ["Ténèbres"]}, {"id": 828, "name": "Roublenard", "types": ["Ténèbres"]}, {"id": 829, "name": "Tournicoton", "types": ["Plante"]}, {"id": 830, "name": "Blancoton", "types": ["Plante"]}, {"id": 831, "name": "Moumouton", "types": ["Normal"]}, {"id": 832, "name": "Moumouflon", "types": ["Normal"]}, {"id": 833, "name": "Khélocrok", "types": ["Eau"]}, {"id": 834, "name": "Torgamord", "types": ["Eau", "Roche"]}, {"id": 835, "name": "Voltoutou", "types": ["Électrik"]}, {"id": 836, "name": "Fulgudog", "types": ["Électrik"]}, {"id": 837, "name": "Charbi", "types": ["Roche"]}, {"id": 838, "name": "Wagomine", "types": ["Roche", "Feu"]}, {"id": 839, "name": "Monthracite", "types": ["Roche", "Feu"]}, {"id": 840, "name": "Verpom", "types": ["Plante", "Dragon"]}, {"id": 841, "name": "Pomdrapi", "types": ["Plante", "Dragon"]}, {"id": 842, "name": "Dratatin", "types": ["Plante", "Dragon"]}, {"id": 843, "name": "Dunaja", "types": ["Sol"]}, {"id": 844, "name": "Dunaconda", "types": ["Sol"]}, {"id": 845, "name": "Nigosier", "types": ["Vol", "Eau"]}, {"id": 846, "name": "Embrochet", "types": ["Eau"]}, {"id": 847, "name": "Hastacuda", "types": ["Eau"]}, {"id": 848, "name": "Toxizap", "types": ["Électrik", "Poison"]}, {"id": 849, "name": "Salarsen", "types": ["Électrik", "Poison"]}, {"id": 850, "name": "Grillepattes", "types": ["Feu", "Insecte"]}, {"id": 851, "name": "Scolocendre", "types": ["Feu", "Insecte"]}, {"id": 852, "name": "Poulpaf", "types": ["Combat"]}, {"id": 853, "name": "Krakos", "types": ["Combat"]}, {"id": 854, "name": "Théffroi", "types": ["Spectre"]}, {"id": 855, "name": "Polthégeist", "types": ["Spectre"]}, {"id": 856, "name": "Bibichut", "types": ["Psy"]}, {"id": 857, "name": "Chapotus", "types": ["Psy"]}, {"id": 858, "name": "Sorcilence", "types": ["Psy", "Fée"]}, {"id": 859, "name": "Grimalin", "types": ["Ténèbres", "Fée"]}, {"id": 860, "name": "Fourbelin", "types": ["Ténèbres", "Fée"]}, {"id": 861, "name": "Angoliath", "types": ["Ténèbres", "Fée"]}, {"id": 862, "name": "Ixon", "types": ["Ténèbres", "Normal"]}, {"id": 863, "name": "Berserkatt", "types": ["Acier"]}, {"id": 864, "name": "Corayôme", "types": ["Spectre"]}, {"id": 865, "name": "Palarticho", "types": ["Combat"]}, {"id": 866, "name": "M. Glaquette", "types": ["Glace", "Psy"]}, {"id": 867, "name": "Tutétékri", "types": ["Sol", "Spectre"]}, {"id": 868, "name": "Crèmy", "types": ["Fée"]}, {"id": 869, "name": "Charmilly", "types": ["Fée"]}, {"id": 870, "name": "Hexadron", "types": ["Combat"]}, {"id": 871, "name": "Wattapik", "types": ["Électrik"]}, {"id": 872, "name": "Frissonille", "types": ["Glace", "Insecte"]}, {"id": 873, "name": "Beldeneige", "types": ["Glace", "Insecte"]}, {"id": 874, "name": "Dolman", "types": ["Roche"]}, {"id": 875, "name": "Bekaglaçon", "types": ["Glace"]}, {"id": 876, "name": "Wimessir", "types": ["Psy", "Normal"]}, {"id": 877, "name": "Morpeko", "types": ["Électrik", "Ténèbres"]}, {"id": 878, "name": "Charibari", "types": ["Acier"]}, {"id": 879, "name": "Pachyradjah", "types": ["Acier"]}, {"id": 880, "name": "Galvagon", "types": ["Électrik", "Dragon"]}, {"id": 881, "name": "Galvagla", "types": ["Électrik", "Glace"]}, {"id": 882, "name": "Hydragon", "types": ["Eau", "Dragon"]}, {"id": 883, "name": "Hydragla", "types": ["Eau", "Glace"]}, {"id": 884, "name": "Duralugon", "types": ["Acier", "Dragon"]}, {"id": 885, "name": "Fantyrm", "types": ["Dragon", "Spectre"]}, {"id": 886, "name": "Dispareptil", "types": ["Dragon", "Spectre"]}, {"id": 887, "name": "Lanssorien", "types": ["Dragon", "Spectre"]}, {"id": 888, "name": "Zacian", "types": ["Fée"]}, {"id": 889, "name": "Zamazenta", "types": ["Combat"]}, {"id": 890, "name": "Éthernatos", "types": ["Poison", "Dragon"]}, {"id": 891, "name": "Wushours", "types": ["Combat"]}, {"id": 892, "name": "Shifours", "types": ["Combat", "Ténèbres"]}, {"id": 893, "name": "Zarude", "types": ["Ténèbres", "Plante"]}, {"id": 894, "name": "Regieleki", "types": ["Électrik"]}, {"id": 895, "name": "Regidrago", "types": ["Dragon"]}, {"id": 896, "name": "Blizzeval", "types": ["Glace"]}, {"id": 897, "name": "Spectreval", "types": ["Spectre"]}, {"id": 898, "name": "Sylveroy", "types": ["Psy", "Plante"]}, {"id": 899, "name": "Cerbyllin", "types": ["Normal", "Psy"]}, {"id": 900, "name": "Hachécateur", "types": ["Insecte", "Roche"]}, {"id": 901, "name": "Ursaking", "types": ["Sol", "Normal"]}, {"id": 902, "name": "Paragruel", "types": ["Eau", "Spectre"]}, {"id": 903, "name": "Farfurex", "types": ["Combat", "Poison"]}, {"id": 904, "name": "Qwilpik", "types": ["Ténèbres", "Poison"]}, {"id": 905, "name": "Amovénus", "types": ["Fée", "Vol"]}, {"id": 906, "name": "Poussacha", "types": ["Plante"]}, {"id": 907, "name": "Matourgeon", "types": ["Plante"]}, {"id": 908, "name": "Miascarade", "types": ["Plante", "Ténèbres"]}, {"id": 909, "name": "Chochodile", "types": ["Feu"]}, {"id": 910, "name": "Crocogril", "types": ["Feu"]}, {"id": 911, "name": "Flâmigator", "types": ["Feu", "Spectre"]}, {"id": 912, "name": "Coiffeton", "types": ["Eau"]}, {"id": 913, "name": "Canarbello", "types": ["Eau"]}, {"id": 914, "name": "Palmaval", "types": ["Eau", "Combat"]}, {"id": 915, "name": "Gourmelet", "types": ["Normal"]}, {"id": 916, "name": "Fragroin", "types": ["Normal"]}, {"id": 917, "name": "Tissenboule", "types": ["Insecte"]}, {"id": 918, "name": "Filentrappe", "types": ["Insecte"]}, {"id": 919, "name": "Lilliterelle", "types": ["Insecte"]}, {"id": 920, "name": "Gambex", "types": ["Insecte", "Ténèbres"]}, {"id": 921, "name": "Pohm", "types": ["Électrik"]}, {"id": 922, "name": "Pohmotte", "types": ["Électrik", "Combat"]}, {"id": 923, "name": "Pohmarmotte", "types": ["Électrik", "Combat"]}, {"id": 924, "name": "Compagnol", "types": ["Normal"]}, {"id": 925, "name": "Famignol", "types": ["Normal"]}, {"id": 926, "name": "Pâtachiot", "types": ["Fée"]}, {"id": 927, "name": "Briochien", "types": ["Fée"]}, {"id": 928, "name": "Olivini", "types": ["Plante", "Normal"]}, {"id": 929, "name": "Olivado", "types": ["Plante", "Normal"]}, {"id": 930, "name": "Arboliva", "types": ["Plante", "Normal"]}, {"id": 931, "name": "Tapatoès", "types": ["Normal", "Vol"]}, {"id": 932, "name": "Selutin", "types": ["Roche"]}, {"id": 933, "name": "Amassel", "types": ["Roche"]}, {"id": 934, "name": "Gigansel", "types": ["Roche"]}, {"id": 935, "name": "Charbambin", "types": ["Feu"]}, {"id": 936, "name": "Carmadura", "types": ["Feu", "Psy"]}, {"id": 937, "name": "Malvalame", "types": ["Feu", "Spectre"]}, {"id": 938, "name": "Têtampoule", "types": ["Électrik"]}, {"id": 939, "name": "Ampibidou", "types": ["Électrik"]}, {"id": 940, "name": "Zapétrel", "types": ["Électrik", "Vol"]}, {"id": 941, "name": "Fulgulairo", "types": ["Électrik", "Vol"]}, {"id": 942, "name": "Grondogue", "types": ["Ténèbres"]}, {"id": 943, "name": "Dogrino", "types": ["Ténèbres"]}, {"id": 944, "name": "Gribouraigne", "types": ["Poison", "Normal"]}, {"id": 945, "name": "Tag-Tag", "types": ["Poison", "Normal"]}, {"id": 946, "name": "Virovent", "types": ["Plante", "Spectre"]}, {"id": 947, "name": "Virevorreur", "types": ["Plante", "Spectre"]}, {"id": 948, "name": "Terracool", "types": ["Sol", "Plante"]}, {"id": 949, "name": "Terracruel", "types": ["Sol", "Plante"]}, {"id": 950, "name": "Craparoi", "types": ["Roche"]}, {"id": 951, "name": "Pimito", "types": ["Plante"]}, {"id": 952, "name": "Scovilain", "types": ["Plante", "Feu"]}, {"id": 953, "name": "Léboulérou", "types": ["Insecte"]}, {"id": 954, "name": "Bérasca", "types": ["Insecte", "Psy"]}, {"id": 955, "name": "Flotillon", "types": ["Psy"]}, {"id": 956, "name": "Cléopsytra", "types": ["Psy"]}, {"id": 957, "name": "Forgerette", "types": ["Fée", "Acier"]}, {"id": 958, "name": "Forgella", "types": ["Fée", "Acier"]}, {"id": 959, "name": "Forgelina", "types": ["Fée", "Acier"]}, {"id": 960, "name": "Taupikeau", "types": ["Eau"]}, {"id": 961, "name": "Triopikeau", "types": ["Eau"]}, {"id": 962, "name": "Lestombaile", "types": ["Vol", "Ténèbres"]}, {"id": 963, "name": "Dofin", "types": ["Eau"]}, {"id": 964, "name": "Superdofin", "types": ["Eau"]}, {"id": 965, "name": "Vrombi", "types": ["Acier", "Poison"]}, {"id": 966, "name": "Vrombotor", "types": ["Acier", "Poison"]}, {"id": 967, "name": "Motorizard", "types": ["Dragon", "Normal"]}, {"id": 968, "name": "Ferdeter", "types": ["Acier"]}, {"id": 969, "name": "Germéclat", "types": ["Roche", "Poison"]}, {"id": 970, "name": "Floréclat", "types": ["Roche", "Poison"]}, {"id": 971, "name": "Toutombe", "types": ["Spectre"]}, {"id": 972, "name": "Tomberro", "types": ["Spectre"]}, {"id": 973, "name": "Flamenroule", "types": ["Vol", "Combat"]}, {"id": 974, "name": "Piétacé", "types": ["Glace"]}, {"id": 975, "name": "Balbalèze", "types": ["Glace"]}, {"id": 976, "name": "Délestin", "types": ["Eau", "Psy"]}, {"id": 977, "name": "Oyacata", "types": ["Eau"]}, {"id": 978, "name": "Nigirigon", "types": ["Dragon", "Eau"]}, {"id": 979, "name": "Courrousinge", "types": ["Combat", "Spectre"]}, {"id": 980, "name": "Terraiste", "types": ["Poison", "Sol"]}, {"id": 981, "name": "Farigiraf", "types": ["Normal", "Psy"]}, {"id": 982, "name": "Deusolourdo", "types": ["Normal"]}, {"id": 983, "name": "Scalpereur", "types": ["Ténèbres", "Acier"]}, {"id": 984, "name": "Fort-Ivoire", "types": ["Sol", "Combat"]}, {"id": 985, "name": "Hurle-Queue", "types": ["Fée", "Psy"]}, {"id": 986, "name": "Fongus-Furie", "types": ["Plante", "Ténèbres"]}, {"id": 987, "name": "Flotte-Mèche", "types": ["Spectre", "Fée"]}, {"id": 988, "name": "Rampe-Ailes", "types": ["Insecte", "Combat"]}, {"id": 989, "name": "Pelage-Sablé", "types": ["Électrik", "Sol"]}, {"id": 990, "name": "Roue-de-Fer", "types": ["Sol", "Acier"]}, {"id": 991, "name": "Hotte-de-Fer", "types": ["Glace", "Eau"]}, {"id": 992, "name": "Paume-de-Fer", "types": ["Combat", "Électrik"]}, {"id": 993, "name": "Têtes-de-Fer", "types": ["Ténèbres", "Vol"]}, {"id": 994, "name": "Mite-de-Fer", "types": ["Feu", "Poison"]}, {"id": 995, "name": "Épine-de-Fer", "types": ["Roche", "Électrik"]}, {"id": 996, "name": "Frigodo", "types": ["Dragon", "Glace"]}, {"id": 997, "name": "Cryodo", "types": ["Dragon", "Glace"]}, {"id": 998, "name": "Glaivodo", "types": ["Dragon", "Glace"]}, {"id": 999, "name": "Mordudor", "types": ["Spectre"]}, {"id": 1000, "name": "Gromago", "types": ["Acier", "Spectre"]}, {"id": 1001, "name": "Chongjian", "types": ["Ténèbres", "Plante"]}, {"id": 1002, "name": "Baojian", "types": ["Ténèbres", "Glace"]}, {"id": 1003, "name": "Dinglu", "types": ["Ténèbres", "Sol"]}, {"id": 1004, "name": "Yuyu", "types": ["Ténèbres", "Feu"]}, {"id": 1005, "name": "Rugit-Lune", "types": ["Dragon", "Ténèbres"]}, {"id": 1006, "name": "Garde-de-Fer", "types": ["Fée", "Combat"]}, {"id": 1007, "name": "Koraidon", "types": ["Combat", "Dragon"]}, {"id": 1008, "name": "Miraidon", "types": ["Électrik", "Dragon"]}, {"id": 1009, "name": "Serpente-Eau", "types": ["Eau", "Dragon"]}, {"id": 1010, "name": "Vert-de-Fer", "types": ["Plante", "Psy"]}, {"id": 1011, "name": "Pomdramour", "types": ["Plante", "Dragon"]}, {"id": 1012, "name": "Poltchageist", "types": ["Plante", "Spectre"]}, {"id": 1013, "name": "Théffroyable", "types": ["Plante", "Spectre"]}, {"id": 1014, "name": "Félicanis", "types": ["Poison", "Combat"]}, {"id": 1015, "name": "Fortusimia", "types": ["Poison", "Psy"]}, {"id": 1016, "name": "Favianos", "types": ["Poison", "Fée"]}, {"id": 1017, "name": "Ogerpon", "types": ["Plante"]}, {"id": 1018, "name": "Pondralugon", "types": ["Acier", "Dragon"]}, {"id": 1019, "name": "Pomdorochi", "types": ["Plante", "Dragon"]}, {"id": 1020, "name": "Feu-Perçant", "types": ["Feu", "Dragon"]}, {"id": 1021, "name": "Ire-Foudre", "types": ["Électrik", "Dragon"]}, {"id": 1022, "name": "Roc-de-Fer", "types": ["Roche", "Psy"]}, {"id": 1023, "name": "Chef-de-Fer", "types": ["Acier", "Psy"]}, {"id": 1024, "name": "Terapagos", "types": ["Normal"]}, {"id": 1025, "name": "Pêchaminus", "types": ["Poison", "Spectre"]}];

const GENERATIONS = [
  { id: "all", name: "Toutes les générations", min: 1, max: 1025 },
  { id: "gen1", name: "Gen 1 (Kanto #001 - #151)", min: 1, max: 151 },
  { id: "gen2", name: "Gen 2 (Johto #152 - #251)", min: 152, max: 251 },
  { id: "gen3", name: "Gen 3 (Hoenn #252 - #386)", min: 252, max: 386 },
  { id: "gen4", name: "Gen 4 (Sinnoh #387 - #493)", min: 387, max: 493 },
  { id: "gen5", name: "Gen 5 (Unys #494 - #649)", min: 494, max: 649 },
  { id: "gen6", name: "Gen 6 (Kalos #650 - #721)", min: 650, max: 721 },
  { id: "gen7", name: "Gen 7 (Alola #722 - #809)", min: 722, max: 809 },
  { id: "gen8", name: "Gen 8 (Galar #810 - #905)", min: 810, max: 905 },
  { id: "gen9", name: "Gen 9 (Paldea #906 - #1025)", min: 906, max: 1025 }
];

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
    this.addRibbonIcon("pokeball", "Ouvrir le Pokédex", () => {
      this.activatePokedexView();
    });

    // Add Command Palette commands
    this.addCommand({
      id: "open-pokedex",
      name: "Ouvrir le Pokédex",
      callback: () => this.activatePokedexView()
    });

    this.addCommand({
      id: "download-pokemon-sprites",
      name: "Télécharger les 2050 sprites Pokémon (Hors-Ligne)",
      callback: () => {
        this.downloadAllSprites();
      }
    });

    this.addCommand({
      id: "test-encounter-pokemon",
      name: "Tester une apparition de Pokémon",
      callback: () => {
        const activeFile = this.app.workspace.getActiveFile();
        const docPath = activeFile ? activeFile.path : "Note active.md";
        const docTitle = activeFile ? activeFile.basename : "Note active";
        this.triggerEncounter(docPath, docTitle, false);
      }
    });

    this.addCommand({
      id: "test-shiny-pokemon",
      name: "Tester une apparition de Pokémon Shiny",
      callback: () => {
        const activeFile = this.app.workspace.getActiveFile();
        const docPath = activeFile ? activeFile.path : "Note active.md";
        const docTitle = activeFile ? activeFile.basename : "Note active";
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
    throw new Error(`Impossible de télécharger le sprite #${pokemonId}`);
  }

  async downloadAllSprites(onProgress = null, forceRedownload = false) {
    if (this.isDownloadingSprites) {
      new Notice("⏳ Un téléchargement de sprites est déjà en cours...");
      return;
    }

    const adapter = this.app && this.app.vault ? this.app.vault.adapter : null;
    if (!adapter || typeof adapter.writeBinary !== "function") {
      new Notice("❌ Impossible d'accéder au système de fichiers d'Obsidian.");
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
      console.error("[Pokédex] Erreur création dossier sprites :", err);
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

    new Notice("📥 Début du téléchargement des 2050 sprites Pokémon...");
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
      new Notice(`⏸️ Téléchargement interrompu (${completed - failed}/${total} sprites prêts). Vous pourrez reprendre à tout moment.`);
    } else if (failed > 0) {
      new Notice(`⚠️ Téléchargement terminé avec ${failed} erreur(s) (${completed - failed}/${total} sprites installés). Relancez pour compléter.`);
    } else {
      new Notice("🎉 Les 2050 sprites Pokémon (Normaux + Shiny) sont installés en local !");
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
      const docPath = activeFile ? activeFile.path : "Note active.md";
      const docTitle = activeFile ? activeFile.basename : "Note active";

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
    const formattedDate = now.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }) + " à " + now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const catchEntry = {
      uid: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      pokemonId: pkm.id,
      pokemonName: pkm.name,
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
      new Notice(`🎉 ${pkm.name} #${String(pkm.id).padStart(3, "0")}${tagText} attrapé !`);
    }
  }

  showBottomEncounterAnimation(pkm, isShiny, isNew) {
    if (this.currentNotificationEl && this.currentNotificationEl.parentNode) {
      this.currentNotificationEl.parentNode.removeChild(this.currentNotificationEl);
    }

    const container = document.createElement("div");
    container.className = `pokemon-encounter-container ${this.settings.notificationPosition}`;
    this.currentNotificationEl = container;

    const card = container.createDiv({
      cls: "pokemon-encounter-card",
      attr: { title: "Cliquer pour ouvrir le Pokédex" }
    });

    const stage = card.createDiv({ cls: "pokemon-encounter-stage" });

    const spriteWrap = stage.createDiv({ cls: "pokemon-stage-sprite-wrap" });
    const spriteImg = spriteWrap.createEl("img", {
      cls: "pokemon-stage-sprite",
      attr: { alt: pkm.name }
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
      text: `${pkm.name} #${String(pkm.id).padStart(3, "0")}`
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
    titleText.createEl("h1", { text: "Pokédex National" });
    titleText.createEl("p", { text: "1025 Pokémon découverts et capturés au fil de votre écriture dans Obsidian." });
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
    infoDiv.createEl("strong", { text: "📦 Pack d'Animations Hors-Ligne (2050 GIFs)" });

    if (this.plugin.isDownloadingSprites) {
      const { current, total } = this.plugin.downloadProgress;
      const pct = total > 0 ? Math.round((current / total) * 100) : 0;
      infoDiv.createEl("span", {
        text: `Téléchargement depuis PokéAPI / Showdown en cours : ${current} / ${total} (${pct}%)...`
      });

      const progressWrap = infoDiv.createDiv({ cls: "pokedex-progress-bar-wrap" });
      const progressFill = progressWrap.createDiv({ cls: "pokedex-progress-bar-fill" });
      progressFill.style.width = `${pct}%`;

      const actionsDiv = this.downloadBannerEl.createDiv({ cls: "pokedex-sprites-banner-actions" });
      const cancelBtn = actionsDiv.createEl("button", {
        cls: "pokedex-btn-secondary",
        text: "⏸️ Mettre en pause"
      });
      cancelBtn.addEventListener("click", () => {
        this.plugin.cancelSpriteDownload = true;
      });
    } else {
      infoDiv.createEl("span", {
        text: "Les GIFs ne sont pas inclus par défaut (droits d'auteur). Téléchargez-les en 1 clic pour un affichage instantané 100% hors-ligne."
      });

      const actionsDiv = this.downloadBannerEl.createDiv({ cls: "pokedex-sprites-banner-actions" });
      const dlBtn = actionsDiv.createEl("button", {
        cls: "mod-cta pokedex-btn-download",
        text: this.plugin.hasAnyLocalSprite ? "📥 Reprendre le téléchargement des GIFs" : "📥 Télécharger les 2050 GIFs"
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
      { label: "Total Capturés", value: totalCaught },
      { label: "Pokémon Uniques", value: `${uniqueCount} / ${TOTAL_POKEMON}` },
      { label: "Complétion Pokédex", value: `${completionPercent}%` },
      { label: "Pokémon Shiny", value: shinyCount }
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
      text: `📋 Journal des Captures (${this.plugin.catches.length})`
    });
    journalBtn.addEventListener("click", () => {
      this.activeTab = "journal";
      this.refresh();
    });

    const gridBtn = tabs.createEl("button", {
      cls: `pokedex-tab-btn ${this.activeTab === "grid" ? "active" : ""}`,
      text: `🗂️ Grille Pokédex (${TOTAL_POKEMON})`
    });
    gridBtn.addEventListener("click", () => {
      this.activeTab = "grid";
      this.searchQuery = "";
      this.refresh();
    });

    // Generation Selector (when in grid)
    if (this.activeTab === "grid") {
      const genSelect = navBar.createEl("select", { cls: "dropdown pokedex-gen-select" });
      GENERATIONS.forEach(g => {
        const opt = genSelect.createEl("option", { value: g.id, text: g.name });
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
      placeholder: "🔍 Rechercher un Pokémon, une note ou un type..."
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
        { value: "date-desc", text: "Date (plus récent)" },
        { value: "date-asc", text: "Date (plus ancien)" },
        { value: "id-asc", text: "N° Pokédex (1 à 1025)" },
        { value: "name-asc", text: "Nom (A - Z)" }
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
        const nameMatch = c.pokemonName.toLowerCase().includes(q);
        const docMatch = c.documentTitle.toLowerCase().includes(q) || c.documentPath.toLowerCase().includes(q);
        const typeMatch = Array.isArray(c.types) && c.types.some(t => t.toLowerCase().includes(q));
        const numMatch = String(c.pokemonId).includes(q);
        return nameMatch || docMatch || typeMatch || numMatch;
      });
    }

    list.sort((a, b) => {
      if (this.sortBy === "date-desc") return (b.timestamp || 0) - (a.timestamp || 0);
      if (this.sortBy === "date-asc") return (a.timestamp || 0) - (b.timestamp || 0);
      if (this.sortBy === "id-asc") return a.pokemonId - b.pokemonId;
      if (this.sortBy === "name-asc") return a.pokemonName.localeCompare(b.pokemonName);
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
      empty.createEl("h3", { text: "Aucun Pokémon trouvé" });
      empty.createEl("p", {
        text: this.searchQuery
          ? "Aucun résultat ne correspond à votre recherche."
          : "Écrivez du texte dans vos notes pour commencer à attraper des Pokémon !"
      });
      return;
    }

    const tableWrapper = wrapper.createDiv({ cls: "pokedex-table-wrapper" });
    const table = tableWrapper.createEl("table", { cls: "pokedex-capture-table" });

    const thead = table.createEl("thead");
    const headerRow = thead.createEl("tr");
    headerRow.createEl("th", { text: "Sprite" });
    headerRow.createEl("th", { text: "N° & Pokémon" });
    headerRow.createEl("th", { text: "Types" });
    headerRow.createEl("th", { text: "Date de Capture" });
    headerRow.createEl("th", { text: "Document Source" });
    headerRow.createEl("th", { text: "Actions" });

    const tbody = table.createEl("tbody");

    filtered.forEach((entry) => {
      const tr = tbody.createEl("tr");

      // 1. Sprite
      const tdSprite = tr.createEl("td");
      const img = tdSprite.createEl("img", {
        cls: "pokedex-table-sprite"
      });
      this.plugin.applySpriteWithFallback(img, entry.pokemonId, entry.isShiny);
      img.alt = entry.pokemonName;

      // 2. Name & ID
      const tdName = tr.createEl("td");
      tdName.createDiv({
        cls: "pokedex-pkm-id",
        text: `#${String(entry.pokemonId).padStart(3, "0")}`
      });
      const nameDiv = tdName.createDiv({ cls: "pokedex-pkm-name" });
      nameDiv.createSpan({ text: entry.pokemonName });
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
            text: t
          });
        });
      }

      // 4. Date
      const tdDate = tr.createEl("td");
      tdDate.createSpan({
        cls: "pokedex-date-badge",
        text: entry.caughtAt || "Date inconnue"
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
        title: "Supprimer cette capture"
      });
      delBtn.addEventListener("click", async () => {
        const originalIndex = this.plugin.catches.findIndex(c => c.uid === entry.uid);
        if (originalIndex !== -1) {
          this.plugin.catches.splice(originalIndex, 1);
          await this.plugin.savePluginData();
          new Notice(`Supprimé : ${entry.pokemonName}`);
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

      if (this.searchQuery) {
        const q = this.searchQuery;
        const nameMatch = pkm.name.toLowerCase().includes(q);
        const numMatch = String(pkm.id).includes(q);
        const typeMatch = Array.isArray(pkm.types) && pkm.types.some(t => t.toLowerCase().includes(q));
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
            title: `${normalCount} capture(s) normale(s)`
          });
        }

        if (shinyCount > 0) {
          badgesWrap.createDiv({
            cls: "pokedex-grid-shiny-badge",
            text: `x${shinyCount}`,
            title: `${shinyCount} capture(s) en version Shiny ✨`
          });
        }
      }

      const sprite = card.createEl("img", {
        cls: "pokedex-grid-sprite"
      });
      const showShinySprite = shinyCount > 0 && normalCount === 0;
      this.plugin.applySpriteWithFallback(sprite, pkm.id, showShinySprite);
      sprite.alt = pkm.name;

      card.createDiv({
        cls: "pokedex-grid-name",
        text: isCaught ? pkm.name : "???"
      });

      if (isCaught) {
        card.addEventListener("click", () => {
          this.activeTab = "journal";
          this.searchQuery = pkm.name.toLowerCase();
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
      new Notice(`Document introuvable : ${docPath}`);
    }
  }
}

// ============================================================================
// CONFIRMATION MODAL (Obsidian Community Guidelines Compliant)
// ============================================================================
class ConfirmResetModal extends Modal {
  constructor(app, onConfirm) {
    super(app);
    this.onConfirm = onConfirm;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: "Vider tout le Pokédex ?" });
    contentEl.createEl("p", {
      text: "Voulez-vous vraiment effacer tout votre historique de Pokédex ? Cette action est irréversible."
    });

    new Setting(contentEl)
      .addButton(btn => btn
        .setButtonText("Annuler")
        .onClick(() => this.close())
      )
      .addButton(btn => btn
        .setButtonText("Confirmer la suppression")
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

    // 0. Offline Sprites Download Section
    new Setting(containerEl)
      .setName("Pack d'animations hors-ligne (2050 GIFs)")
      .setHeading();

    const spriteStatusDesc = this.plugin.hasLocalSprites
      ? "✅ Les 2050 animations GIF (1025 Normaux + 1025 Shiny) sont installées dans le dossier local 'sprites/'."
      : "🌐 Les GIFs ne sont pas fournis avec le plugin (respect des droits d'auteur). Téléchargez-les gratuitement en 1 clic depuis PokéAPI / Showdown pour activer le mode 100% hors-ligne.";

    const spriteSetting = new Setting(containerEl)
      .setName(this.plugin.hasLocalSprites ? "Sprites locaux : Installés" : "Sprites locaux : Non installés")
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
        text: `⏳ Téléchargement en cours : ${current} / ${total} fichiers (${pct}%)`
      });
      const barWrap = progressContainer.createDiv({ cls: "pokedex-progress-bar-wrap" });
      const barFill = barWrap.createDiv({ cls: "pokedex-progress-bar-fill" });
      barFill.style.width = `${pct}%`;
    };

    if (this.plugin.isDownloadingSprites) {
      updateSettingsProgress(this.plugin.downloadProgress.current, this.plugin.downloadProgress.total);
      spriteSetting.addButton(btn => btn
        .setButtonText("⏸️ Mettre en pause")
        .onClick(() => {
          this.plugin.cancelSpriteDownload = true;
          setTimeout(() => this.display(), 400);
        })
      );
    } else {
      spriteSetting.addButton(btn => btn
        .setButtonText(
          this.plugin.hasLocalSprites
            ? "🔄 Vérifier / Réparer les GIFs"
            : (this.plugin.hasAnyLocalSprite ? "📥 Reprendre le téléchargement" : "📥 Télécharger les 2050 GIFs")
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
      .setName("Préférences de capture")
      .setHeading();

    new Setting(containerEl)
      .setName("Fréquence d'apparition (Caractères)")
      .setDesc("Nombre de caractères à taper dans une note pour faire apparaître et capturer un Pokémon.")
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
      .setName("Position de l'animation d'apparition")
      .setDesc("Emplacement de la bannière de capture sur l'écran.")
      .addDropdown(drop => drop
        .addOption("pos-bottom-right", "En bas à droite")
        .addOption("pos-bottom-center", "En bas au centre")
        .addOption("pos-bottom-left", "En bas à gauche")
        .setValue(this.plugin.settings.notificationPosition)
        .onChange(async (val) => {
          this.plugin.settings.notificationPosition = val;
          await this.plugin.savePluginData();
        })
      );

    // 3. Show Animation Toggle
    new Setting(containerEl)
      .setName("Afficher l'animation de capture")
      .setDesc("Affiche la Pokéball animée et le Pokémon lors de chaque capture.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showCatchAnimation)
        .onChange(async (val) => {
          this.plugin.settings.showCatchAnimation = val;
          await this.plugin.savePluginData();
        })
      );

    // 4. Sound Effects Toggle
    new Setting(containerEl)
      .setName("Effets sonores 8-bit")
      .setDesc("Joue une mélodie rétro 8-bit lors de la capture d'un Pokémon (synthèse audio sans fichier externe).")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.soundEnabled)
        .onChange(async (val) => {
          this.plugin.settings.soundEnabled = val;
          await this.plugin.savePluginData();
        })
      );

    // 5. Test Normal Encounter
    new Setting(containerEl)
      .setName("Tester une capture normale")
      .setDesc("Déclenche immédiatement une capture de test normale.")
      .addButton(btn => btn
        .setButtonText("Tester normale")
        .onClick(() => {
          const activeFile = this.app.workspace.getActiveFile();
          const docPath = activeFile ? activeFile.path : "Note de test.md";
          const docTitle = activeFile ? activeFile.basename : "Note de test";
          this.plugin.triggerEncounter(docPath, docTitle, false);
        })
      );

    // 6. Test Shiny Encounter
    new Setting(containerEl)
      .setName("Tester une capture Shiny (✨)")
      .setDesc("Déclenche immédiatement une capture de test d'un Pokémon Shiny.")
      .addButton(btn => btn
        .setButtonText("Tester Shiny ✨")
        .setCta()
        .onClick(() => {
          const activeFile = this.app.workspace.getActiveFile();
          const docPath = activeFile ? activeFile.path : "Note de test.md";
          const docTitle = activeFile ? activeFile.basename : "Note de test";
          this.plugin.triggerEncounter(docPath, docTitle, true);
        })
      );

    // 7. Reset Data
    new Setting(containerEl)
      .setName("Gestion des données")
      .setHeading();

    new Setting(containerEl)
      .setName("Réinitialiser la progression actuelle")
      .setDesc("Remet le compteur de frappe actuel à zéro.")
      .addButton(btn => btn
        .setButtonText("Remettre à 0")
        .onClick(async () => {
          this.plugin.settings.currentKeystrokeCount = 0;
          await this.plugin.savePluginData();
          new Notice("Compteur réinitialisé à 0.");
        })
      );

    new Setting(containerEl)
      .setName("Vider tout le Pokédex")
      .setDesc("Attention : supprime définitivement toutes les captures enregistrées.")
      .addButton(btn => btn
        .setButtonText("Vider le Pokédex")
        .setWarning()
        .onClick(() => {
          new ConfirmResetModal(this.app, async () => {
            this.plugin.catches = [];
            this.plugin.settings.totalCharactersTyped = 0;
            this.plugin.settings.currentKeystrokeCount = 0;
            await this.plugin.savePluginData();
            new Notice("Pokédex vidé.");
          }).open();
        })
      );
  }
}

module.exports = PokemonPokedexPlugin;


