/**
 * ═══════════════════════════════════════════════════════════════
 *  PASO ROBLES RPG ENGINE — APPEARANCE MODULE v1.0
 * ═══════════════════════════════════════════════════════════════
 *  Arquitetura: Scene-Checkpoint + Inferência Qualitativa
 *
 *  Aparência (Appearance) atua como o clássico "Carisma".
 *  Afeta atração visual, reações sociais (Confiança/Reputação)
 *  e o Ego do próprio personagem (Mood).
 *
 *  Estados (0 a 10 blocos): GLAMOROUS, PRESENTABLE, MESSY, DIRTY, DISGUSTING.
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────
//  TIPOS E CONSTANTES (QUALITATIVE MANIFESTO)
// ─────────────────────────────────────────────

const AppearanceThreshold = Object.freeze({
  GLAMOROUS:   "GLAMOROUS",   // Deslumbrante
  PRESENTABLE: "PRESENTABLE", // Apresentável (Normal)
  MESSY:       "MESSY",       // Desarrumado/Suado leve
  DIRTY:       "DIRTY",       // Sujo/Manchado
  DISGUSTING:  "DISGUSTING",  // Repugnante/Fedor
});

const THRESHOLD_BLOCKS = Object.freeze({
  [AppearanceThreshold.GLAMOROUS]:   { blocks: 10 },
  [AppearanceThreshold.PRESENTABLE]: { blocks: 8  },
  [AppearanceThreshold.MESSY]:       { blocks: 6  },
  [AppearanceThreshold.DIRTY]:       { blocks: 4  },
  [AppearanceThreshold.DISGUSTING]:  { blocks: 2  },
});

const THRESHOLD_COLORS = Object.freeze({
  [AppearanceThreshold.GLAMOROUS]:   { fill: "#a855f7", bg: "#4c1d95" }, // Roxo/Púrpura (Elegância)
  [AppearanceThreshold.PRESENTABLE]: { fill: "#4ade80", bg: "#14532d" }, // Verde
  [AppearanceThreshold.MESSY]:       { fill: "#facc15", bg: "#713f12" }, // Amarelo
  [AppearanceThreshold.DIRTY]:       { fill: "#fb923c", bg: "#7c2d12" }, // Laranja
  [AppearanceThreshold.DISGUSTING]:  { fill: "#ef4444", bg: "#7f1d1d" }, // Vermelho
});

/**
 * Modificadores de Cena / Cortes Cinemáticos.
 * Pesos temporários que sujam ou limpam o personagem na UI antes do LLM julgar.
 */
const SCENE_MARKERS = Object.freeze({
  grooming_scene:   -0.50, // Banho, cabeleireiro, troca de roupa chique
  light_weather:     0.10, // Vento, chuva fina (Messy)
  combat_scene:      0.25, // Suor e poeira
  mud_blood_gore:    0.40, // Dano pesado à aparência (Sujo)
  time_skip_long:    0.15, // Acumulo de falta de higiene
});

// ─────────────────────────────────────────────
//  SCENE BUFFER
// ─────────────────────────────────────────────

function createAppearanceBuffer({
  threshold = AppearanceThreshold.PRESENTABLE,
  markers   = [],
} = {}) {
  return Object.freeze({
    threshold,
    markers: Object.freeze([...markers]),
  });
}

// ─────────────────────────────────────────────
//  FLASH PROMPT BUILDER
// ─────────────────────────────────────────────

function serializeBufferForFlash(buffer) {
  const parts = [`appearance: ${buffer.threshold}`];
  if (buffer.markers.length > 0) parts.push(`scene_context: ${buffer.markers.join(",")}`);
  return parts.join(" | ");
}

/**
 * Monta as instruções para a micro-inferência do Gemini.
 */
function buildFlashAppearancePrompt(buffer) {
  const serialized = serializeBufferForFlash(buffer);

  return [
    `[APPEARANCE CHECK - CINEMATIC INFERENCE]`,
    serialized,
    ``,
    `Avalie o estado visual (higiene, roupas, grooming) do personagem com base nas Cenas recentes.`,
    `Responda SOMENTE neste formato:`,
    `appearance: THRESHOLD | reason: explicação_curta`,
    ``,
    `Thresholds válidos: GLAMOROUS, PRESENTABLE, MESSY, DIRTY, DISGUSTING`,
    `Regras de Roteiro Cinemático:`,
    `- 'grooming_scene' (Banho, colocar roupas de gala) restaura no mínimo para 'PRESENTABLE' e possivelmente para 'GLAMOROUS'.`,
    `- 'combat_scene' ou esforço pesado degrada instantaneamente para 'MESSY' ou 'DIRTY' devido a suor e sujeira.`,
    `- 'mud_blood_gore' ou exposição a esgotos/lixo força o estado 'DISGUSTING'.`,
    `- Vários dias sem declaração de banho degradam a aparência naturalmente.`,
    `- NOTA: Ferimentos (Health) não mudam isso sozinhos, mas o sangue seco sim.`
  ].join("\n");
}

function parseFlashResponse(flashResponse) {
  const cleaned = flashResponse.trim().replace(/\s+/g, " ");
  const match = cleaned.match(
    /appearance:\s*(GLAMOROUS|PRESENTABLE|MESSY|DIRTY|DISGUSTING)\s*\|\s*reason:\s*(.+)/i
  );
  if (!match) return null;

  const threshold = match[1].toUpperCase();
  if (!AppearanceThreshold[threshold]) return null;

  return { threshold, reason: match[2].trim() };
}

// ─────────────────────────────────────────────
//  FRONT-END CONVERTER (UI)
// ─────────────────────────────────────────────

function convertToBlocks(threshold, markers = []) {
  const baseData = THRESHOLD_BLOCKS[threshold];
  if (!baseData) throw new Error(`Threshold inválido: ${threshold}`);

  let totalBlocks = baseData.blocks;

  // Impacto visual imediato no Front-End antes da API
  let hasDirt = markers.some(m => SCENE_MARKERS[m] >= 0.25);
  let isClean = markers.includes("grooming_scene");

  if (hasDirt) {
    totalBlocks = Math.max(0, totalBlocks - 2); // Combate suja 2 blocos visuais logo de cara
  } else if (isClean) {
    totalBlocks = Math.min(10, totalBlocks + 4); // Banho enche 4 blocos visuais
  }

  return {
    blocks: totalBlocks,
    threshold,
    color: THRESHOLD_COLORS[threshold],
  };
}

function getUIPayload(threshold, markers = []) {
  const blocksData = convertToBlocks(threshold, markers);
  const labels = {
    [AppearanceThreshold.GLAMOROUS]:   "Deslumbrante",
    [AppearanceThreshold.PRESENTABLE]: "Apresentável",
    [AppearanceThreshold.MESSY]:       "Desarrumado",
    [AppearanceThreshold.DIRTY]:       "Sujo",
    [AppearanceThreshold.DISGUSTING]:  "Repugnante",
  };
  return Object.freeze({
    ...blocksData,
    label: labels[threshold] || "Desconhecido",
  });
}

// ─────────────────────────────────────────────
//  DIRETRIZES DO KINDROID (SUGGESTION INJECTION)
// ─────────────────────────────────────────────

/**
 * A Aparência atua como Carisma social.
 * A diretriz dita não só o Egotrip do bot, mas instrui ele
 * sobre como os NPCs ao redor estão reagindo a ele.
 */
const NARRATIVE_DIRECTIVES = Object.freeze({
  [AppearanceThreshold.GLAMOROUS]: {
    directive: "Aparência impecável. Você atrai olhares admirados. Pessoas tendem a concordar com você mais facilmente e tratá-lo com respeito absoluto ou atração física.",
    behavior_modifiers: ["autoestima_alta", "carisma_bonus", "atração_passiva"],
  },
  [AppearanceThreshold.PRESENTABLE]: {
    directive: "Aparência normal e apresentável. Você se mistura na sociedade sem chamar atenção negativa ou excessivamente positiva.",
    behavior_modifiers: [],
  },
  [AppearanceThreshold.MESSY]: {
    directive: "Aparência desarrumada ou levemente suada. Em cenários casuais é inofensivo (talvez até charmoso), mas em contextos formais ou de alta classe, causa olhares tortos.",
    behavior_modifiers: ["charme_casual_ou_desleixo"],
  },
  [AppearanceThreshold.DIRTY]: {
    directive: "Visivelmente sujo, cheirando a suor forte ou terra. NPCs comuns evitam proximidade física. Seduzir desconhecidos é quase impossível.",
    behavior_modifiers: ["repulsa_social_leve", "autoestima_baixa"],
  },
  [AppearanceThreshold.DISGUSTING]: {
    directive: "Estado repulsivo. Coberto de imundície ou fedendo intensamente. NPCs tapam o nariz, recusam serviço ou tratamento. Atração física por parte de terceiros é nula. Apenas amor verdadeiro ignora isso.",
    behavior_modifiers: ["repulsa_social_extrema", "vergonha", "carisma_negativo"],
  },
});

function getNarrativePayload(threshold) {
  const entry = NARRATIVE_DIRECTIVES[threshold];
  if (!entry) throw new Error(`Threshold inválido: ${threshold}`);
  return Object.freeze({
    threshold,
    directive: entry.directive,
    behavior_modifiers: [...entry.behavior_modifiers],
  });
}

// ─────────────────────────────────────────────
//  CROSS-CONTAMINATION — Efeito Dominó Global
// ─────────────────────────────────────────────

/**
 * Aparência afeta Confiança (Trust), Reputação (Reputation) e Ego (Mood).
 * Efeito especial: Facilita Love, mas não dita o Love sozinho.
 */
function getGlobalModifiers(threshold) {
  const modifiers = {
    [AppearanceThreshold.GLAMOROUS]:   { mood_buff: "high_ego",   trust_buff: "halo_effect",     libido_npc_buff: "attracted" },
    [AppearanceThreshold.PRESENTABLE]: { mood_buff: null,         trust_buff: null,              libido_npc_buff: null },
    [AppearanceThreshold.MESSY]:       { mood_buff: null,         trust_buff: null,              libido_npc_buff: null },
    [AppearanceThreshold.DIRTY]:       { mood_buff: "insecure",   trust_buff: "suspicion",       libido_npc_buff: "turned_off" },
    [AppearanceThreshold.DISGUSTING]:  { mood_buff: "humiliated", trust_buff: "disgust_reject",  libido_npc_buff: "hard_block" },
  };
  return Object.freeze(modifiers[threshold] || modifiers[AppearanceThreshold.PRESENTABLE]);
}

// ─────────────────────────────────────────────
//  PIPELINE & EVENTOS
// ─────────────────────────────────────────────

function processSceneCheckpoint({ previousBuffer, flashResponse }) {
  const parsed = parseFlashResponse(flashResponse);
  if (!parsed) {
    return {
      error: "Flash retornou formato inválido. Resposta descartada, mantendo estado anterior.",
      kindroid: getNarrativePayload(previousBuffer.threshold),
      ui: getUIPayload(previousBuffer.threshold, previousBuffer.markers),
      nextBuffer: previousBuffer,
    };
  }

  const kindroid = getNarrativePayload(parsed.threshold);
  const ui = getUIPayload(parsed.threshold, previousBuffer.markers);

  const nextBuffer = createAppearanceBuffer({
    threshold: parsed.threshold,
    markers:   [], // Reseta a cena após o checkpoint ser avaliado
  });

  return { kindroid, ui, nextBuffer };
}

function addSceneMarker(currentBuffer, marker) {
  return createAppearanceBuffer({
    threshold: currentBuffer.threshold,
    markers: [...currentBuffer.markers, marker],
  });
}


// ─────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────
module.exports = {
  AppearanceThreshold,
  createAppearanceBuffer,
  serializeBufferForFlash,
  buildFlashAppearancePrompt,
  parseFlashResponse,
  convertToBlocks,
  getNarrativePayload,
  getUIPayload,
  getGlobalModifiers,
  processSceneCheckpoint,
  addSceneMarker,
  THRESHOLD_BLOCKS,
};
