#!/usr/bin/env node
/**
 * Script autonome de téléchargement des 2050 sprites Pokémon (1025 Normaux + 1025 Shiny)
 * Usage : node download-sprites.mjs
 *
 * Note : Vous pouvez également télécharger les sprites en 1 clic directement
 * depuis l'interface d'Obsidian (Paramètres du plugin ou bannière du Pokédex).
 */

import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOTAL_POKEMON = 1025;
const CONCURRENCY = 16;

const SPRITES_DIR = path.join(__dirname, "sprites");
const SHINY_DIR = path.join(SPRITES_DIR, "shiny");

function getOnlineUrl(id, isShiny, fallbackPng = false) {
  const shinyPrefix = isShiny ? "shiny/" : "";
  if (fallbackPng) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shinyPrefix}${id}.png`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${shinyPrefix}${id}.gif`;
}

async function fetchSpriteBuffer(id, isShiny) {
  const primaryUrl = getOnlineUrl(id, isShiny, false);
  try {
    const res = await fetch(primaryUrl);
    if (res.ok) {
      const ab = await res.arrayBuffer();
      if (ab.byteLength > 0) return Buffer.from(ab);
    }
  } catch {
    // Fallback below
  }

  const fallbackUrl = getOnlineUrl(id, isShiny, true);
  const resFallback = await fetch(fallbackUrl);
  if (resFallback.ok) {
    const ab = await resFallback.arrayBuffer();
    if (ab.byteLength > 0) return Buffer.from(ab);
  }

  throw new Error(`Impossible de télécharger le sprite #${id} (${isShiny ? "Shiny" : "Normal"})`);
}

async function main() {
  console.log("================================================================");
  console.log(" 📥 Téléchargement des 2050 sprites Pokémon (Normaux + Shiny)");
  console.log("================================================================");

  await fs.mkdir(SPRITES_DIR, { recursive: true });
  await fs.mkdir(SHINY_DIR, { recursive: true });

  const tasks = [];
  for (let id = 1; id <= TOTAL_POKEMON; id++) {
    tasks.push({ id, isShiny: false, dest: path.join(SPRITES_DIR, `${id}.gif`) });
    tasks.push({ id, isShiny: true, dest: path.join(SHINY_DIR, `${id}.gif`) });
  }

  const total = tasks.length;
  let completed = 0;
  let skipped = 0;
  let failed = 0;
  let index = 0;

  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (index < total) {
      const currentTask = tasks[index++];
      try {
        if (existsSync(currentTask.dest)) {
          skipped++;
          completed++;
        } else {
          const buf = await fetchSpriteBuffer(currentTask.id, currentTask.isShiny);
          await fs.writeFile(currentTask.dest, buf);
          completed++;
        }
      } catch (err) {
        failed++;
        completed++;
      }

      if (completed % 25 === 0 || completed === total) {
        const pct = Math.round((completed / total) * 100);
        process.stdout.write(`\r⏳ Progression : ${completed} / ${total} (${pct}%) | Ignorés (déjà présents) : ${skipped} | Erreurs : ${failed}`);
      }
    }
  });

  await Promise.all(workers);
  console.log("\n\n✅ Téléchargement terminé !");
  if (failed > 0) {
    console.log(`⚠️ ${failed} fichier(s) n'ont pas pu être récupérés. Relancez la commande pour réessayer.`);
  } else {
    console.log(`🎉 Les 2050 sprites sont prêts dans le dossier : ${SPRITES_DIR}`);
  }
}

main().catch((err) => {
  console.error("\n❌ Erreur fatale :", err);
  process.exit(1);
});
