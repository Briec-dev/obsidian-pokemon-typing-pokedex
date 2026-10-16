# 🐾 Pokémon Typing Pokédex (National Pokédex 1–1025)

> 🇬🇧 **[English Overview](#-english-overview--installation)** | 🇫🇷 **[Documentation en Français](#-documentation-en-français)**

---

## 🇬🇧 English Overview & Installation

**Turn your writing sessions in Obsidian into a Pokémon Trainer adventure!**

Every time you type in your notes, a keystroke counter tracks your progress. Every **$X$ characters typed**, a wild Pokémon (from **Generations 1 to 9**, #001 to #1025, with a 2% natural Shiny rate) appears at the bottom of your screen, gets caught by an animated Pokéball, and is recorded in your personal **National Pokédex** with the exact date, time, and a direct link to the note where you caught it.

### ✨ Key Features
* **Complete National Pokédex (1025 Pokémon)**: Covers all 9 Generations (Kanto to Paldea) with types and generation filters.
* **Minimalist Catch HUD**: Non-intrusive bottom encounter animation with Pokéball throw, wiggle, and capture celebration, plus `[N]` (New) and `[S]` (Shiny ✨) badges.
* **Chronological Catch Log & Grid View**: Track every duplicate caught, filter by generation/type/note, click on a note link to open the source document, and view separate normal (`xN`) and Shiny (`xN`) counters.
* **Synthesized 8-Bit Audio**: Optional retro victory jingle generated via the Web Audio API (no external audio files required).

### 📦 Sprites & Copyright Compliance (User-Downloaded GIFs)
> [!IMPORTANT]
> **No Pokémon sprites or GIFs are distributed in this repository.**
> To respect intellectual property rights (Nintendo / Creatures Inc. / GAME FREAK inc.) and keep the plugin lightweight:
> 1. **1-Click Offline Pack Downloader**: Open the Pokédex view or **Settings → Pokémon Typing Pokédex** and click **`📥 Télécharger les 2050 GIFs`** to download all 2050 sprites (1025 Normal + 1025 Shiny) directly from [PokéAPI](https://github.com/PokeAPI/sprites) / *Pokémon Showdown* into your local plugin folder (`sprites/`). Supports pause and resume!
> 2. **Automatic Online Fallback**: Before downloading the offline pack, the plugin seamlessly loads sprites on the fly from PokéAPI.

---

## 🇫🇷 Documentation en Français

> **Transformez vos sessions d'écriture dans Obsidian en une véritable aventure de dresseur Pokémon !**

Chaque fois que vous écrivez dans vos notes, un compteur enregistre vos frappes. Tous les **$X$ caractères** saisis, un Pokémon sauvage apparaît au bas de votre écran, est capturé par une Pokéball animée, et est immédiatement enregistré dans votre **Pokédex National** personnel avec la date, l'heure et un lien direct vers votre document source.

---

## 📥 Installation & Téléchargement des Sprites (Important)

> [!IMPORTANT]
> **Respect des droits d'auteur (Nintendo / The Pokémon Company) :**
> Pour des raisons de propriété intellectuelle et de légèreté du dépôt GitHub, **aucun fichier GIF de Pokémon n'est distribué dans ce dépôt**. Le plugin inclut un **gestionnaire de téléchargement intégré en 1 clic** permettant à chaque utilisateur de récupérer les **2050 animations** directement depuis [PokéAPI](https://github.com/PokeAPI/sprites) / *Pokémon Showdown* sur sa propre machine.

### Étape 1 : Installer le plugin dans Obsidian

#### Via BRAT (ou Catalogue Communautaire)
1. Installez le plugin communautaire **BRAT** dans Obsidian.
2. Ajoutez le dépôt bêta : `Briec-dev/obsidian-pokemon-typing-pokedex`.
3. Activez **Pokémon Typing Pokédex** dans **Paramètres (`⚙️`) → Modules complémentaires**.

#### Installation Manuelle
1. Téléchargez les 3 fichiers de la dernière [Release GitHub](https://github.com/Briec-dev/obsidian-pokemon-typing-pokedex/releases) (`main.js`, `manifest.json`, `styles.css`) ou clonez ce dépôt dans le dossier des plugins de votre coffre Obsidian :
   ```bash
   cd /chemin/vers/VotreCoffre/.obsidian/plugins/
   git clone https://github.com/Briec-dev/obsidian-pokemon-typing-pokedex.git pokemon-typing-pokedex
   ```
2. Dans Obsidian, ouvrez **Paramètres (`⚙️`) → Modules complémentaires (Community plugins)**.
3. Rechargez la liste des plugins et activez **Pokémon Typing Pokédex**.

### Étape 2 : Télécharger les 2050 animations GIF en local (3 options au choix)

#### 🌟 Option A — En 1 clic directement dans Obsidian *(Recommandé)*
1. Ouvrez le **Pokédex** (icône Pokéball dans la barre latérale gauche) ou allez dans **Paramètres → Pokémon Typing Pokédex**.
2. Cliquez sur le bouton **`📥 Télécharger les 2050 GIFs`**.
3. Une barre de progression télécharge automatiquement les **1025 Pokémon normaux** et les **1025 versions Shiny** dans le dossier `sprites/` du plugin.
4. Si vous mettez en pause ou fermez Obsidian, le téléchargement pourra reprendre exactement là où il s'était arrêté !

#### 💻 Option B — Via le script autonome en ligne de commande *(Optionnel)*
Si Node.js (v18+) est installé sur votre ordinateur, vous pouvez lancer le script fourni à la racine du plugin :
```bash
node download-sprites.mjs
```

#### 🌐 Option C — Mode en ligne automatique (Sans téléchargement)
Si vous ne téléchargez pas le pack hors-ligne, le plugin fonctionne quand même immédiatement ! Il chargera automatiquement les sprites à la volée via Internet depuis le dépôt officiel de PokéAPI.

---

## ✨ Fonctionnalités Principales

### 1. 🌐 Pokédex National Intégral (1025 Pokémon)
* Couvre l'intégralité des **9 Générations** de Pokémon :
  * **Gen 1 — Kanto** : #001 Bulbizarre à #151 Mew
  * **Gen 2 — Johto** : #152 Germignon à #251 Celebi
  * **Gen 3 — Hoenn** : #252 Arcko à #386 Deoxys
  * **Gen 4 — Sinnoh** : #387 Tortipouss à #493 Arceus
  * **Gen 5 — Unys** : #494 Victini à #649 Genesect
  * **Gen 6 — Kalos** : #650 Marisson à #721 Volcanion
  * **Gen 7 — Alola** : #722 Brindibou à #809 Melmetal
  * **Gen 8 — Galar** : #810 Ouistempo à #905 Amovénus
  * **Gen 9 — Paldea** : #906 Poussacha à #1025 Pêchaminus
* Noms officiels français et types traduits pour l'ensemble des 1025 espèces.

---

### 2. ⚡ Mode 100% Hors-Ligne & Zéro Latence
* Une fois téléchargés via le bouton intégré, les **2050 fichiers d'animation** (1025 normaux + 1025 Shiny) sont stockés localement dans `sprites/`.
* **Zéro latence** : les sprites se chargent instantanément depuis votre disque sans solliciter votre connexion Internet.
* **Fallback intelligent** : si un fichier local est manquant, le plugin bascule automatiquement sur la ressource en ligne sans jamais afficher d'image brisée.

---

### 3. 🎯 Interface de Capture Ultra-Épurée (HUD Minimaliste)
* **Design discret et compact** : positionné en bas de l'écran, il ne distrait pas votre rédaction.
* **Animation complète** :
  1. Apparition du Pokémon en sautillant.
  2. Lancer de la Pokéball qui absorbe le Pokémon dans un halo lumineux rouge.
  3. Trois secousses au sol (*wiggle-wiggle-wiggle*) avec clignotement rouge du bouton central.
  4. Clic victorieux et explosion d'étoiles scintillantes !
* **Informations affichées** :
  * Le Pokémon animé et la Pokéball.
  * Le nom suivi du numéro (ex: `Pikachu #025`).
  * Les **badges d'état côte à côte** :
    * **`[N]`** (bleu) : Nouveau Pokémon jamais attrapé auparavant.
    * **`[S]`** (rouge) : Pokémon Chromatique (✨ Shiny, 2% de chance naturelle).
    * Si le Pokémon est **nouveau ET shiny**, les deux badges apparaissent côte à côte : **`[N] [S]`**.
* **Raccourci direct** : cliquer n'importe où sur la vignette ouvre immédiatement le Pokédex.

---

### 4. 📊 Pokédex Complet avec Gestion des Doublons
Accessible en cliquant sur la **Pokéball dans le ruban latéral gauche**, via la palette de commandes (`Ctrl + P`), ou depuis le HUD de capture :

#### A. Le Journal des Captures (Historique Chronologique)
* **Prise en charge intégrale des doublons** : chaque capture forme une nouvelle ligne dans le tableau, même si vous attrapez 10 fois le même Pokémon.
* **Colonnes détaillées** :
  * Miniature animée.
  * N° Pokédex et Nom avec badge Shiny si applicable.
  * Badges de Types colorés (Feu, Eau, Plante, Électrik, Dragon, Fée, Ténèbres...).
  * Date et heure exacte de la capture.
  * **Document source avec lien direct** : cliquer sur le nom du document ouvre instantanément la note correspondante dans l'éditeur d'Obsidian !
  * Bouton corbeille pour supprimer une entrée si souhaité.

#### B. La Grille du Pokédex (1025 Pokémon)
* Cartes visuelles ordonnées de #001 à #1025.
* **Silhouette sombre `???`** pour les Pokémon non encore découverts.
* **Carte colorée et animée** dès qu'une espèce est capturée au moins une fois.
* **Double badge de comptage** :
  * **Badge Bleu (`xN`)** : nombre de captures en version **normale**.
  * **Badge Rouge (`xN`)** : nombre de captures en version **Shiny ✨**.
* **Filtre par Génération** : menu déroulant permettant d'isoler une région (Kanto, Johto, Hoenn, Sinnoh, Unys, Kalos, Alola, Galar, Paldea) ou d'afficher la totalité des 1025 Pokémon.
* **Remise à zéro automatique** : cliquer sur l'onglet *Grille Pokédex* efface automatiquement la barre de recherche pour visualiser toute la grille.

#### C. Statistiques du Dresseur
* **Total Capturés** : nombre total de Pokémon attrapés (doublons inclus).
* **Pokémon Uniques** : progression globale sur les 1025 espèces (ex: `142 / 1025`).
* **Complétion Pokédex** : pourcentage de complétion du Pokédex National.
* **Pokémon Shiny** : total de créatures chromatiques rares trouvées.

---

### 5. ⚙️ Barre d'État & Options de Configuration

* **Barre d'état discrète** : en bas de fenêtre, formatée en `Pokemon : y/x` (ex : `Pokemon : 14/150`).
* **Options dans les Paramètres d'Obsidian** :
  * **Téléchargement / Vérification des GIFs** : installe ou répare les 2050 animations locales en un clic avec barre de progression.
  * **Fréquence d'apparition** : réglez le nombre de caractères requis ($X$) via curseur ou champ numérique (de 20 à 500+).
  * **Position de la capture** : en bas à droite, en bas au centre ou en bas à gauche.
  * **Effets sonores 8-bit** : jingle rétro synthétisé via l'API Web Audio (aucun fichier MP3/WAV externe requis).
  * **Bouton Tester normale** : simule instantanément une capture standard.
  * **Bouton Tester Shiny ✨** : force l'apparition immédiate d'un Pokémon Shiny pour admirer l'animation et ses badges rouges.
  * **Gestion des données** : réinitialiser le compteur de frappe ou vider l'historique du Pokédex.

---

## ⌨️ Raccourcis & Palette de Commandes (`Ctrl + P`)

| Commande | Action |
| :--- | :--- |
| `Ouvrir le Pokédex` | Ouvre la vue dédiée du Pokédex dans un onglet |
| `Télécharger les 2050 sprites Pokémon (Hors-Ligne)` | Télécharge et installe les 2050 GIFs dans `sprites/` |
| `Tester une apparition de Pokémon` | Déclenche une capture de test normale |
| `Tester une apparition de Pokémon Shiny` | Déclenche une capture de test Shiny (✨) |

---

## 📁 Architecture du Projet

```text
pokemon-typing-pokedex/
├── manifest.json                  # Métadonnées du plugin Obsidian
├── versions.json                  # Correspondance des versions pour Obsidian Community
├── main.js                        # Script principal (Logique, Pokédex, Téléchargeur de GIFs, 1025 Pokémon)
├── styles.css                     # Styles, animations Pokéball et thème adaptatif clair/sombre
├── download-sprites.mjs           # Script CLI optionnel pour télécharger les 2050 GIFs via Node.js
├── .github/workflows/release.yml  # Publication automatique des Releases GitHub (main.js, manifest.json, styles.css)
├── .gitignore                     # Exclut sprites/ et data.json du dépôt GitHub
├── LICENSE                        # Licence MIT du code & mentions légales
└── sprites/                       # (Ignoré par Git — généré au téléchargement par l'utilisateur)
    ├── 1.gif ... 1025.gif         # Sprites normaux
    └── shiny/
        ├── 1.gif ... 1025.gif     # Sprites chromatiques Shiny
```

---

## ⚖️ Mentions Légales & Crédits

* **Code source du plugin** : Distribué sous licence [MIT](LICENSE).
* **Propriété Intellectuelle Pokémon** : *Pokémon* ainsi que les noms et visuels de toutes les créatures sont des marques déposées et © de **Nintendo**, **Creatures Inc.** et **GAME FREAK inc.** (1995–2026). Ce projet est un module non officiel, gratuit et à but non lucratif créé par un fan, et n'est ni affilié, ni approuvé par Nintendo ou The Pokémon Company.
* **Aucun asset graphique Pokémon n'est hébergé dans ce dépôt GitHub.** Les sprites sont téléchargés par l'utilisateur final depuis les dépôts publics communautaires [PokéAPI Sprites](https://github.com/PokeAPI/sprites) et [Pokémon Showdown](https://play.pokemonshowdown.com/sprites/).
