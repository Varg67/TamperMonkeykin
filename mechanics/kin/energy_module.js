/**
 * ═══════════════════════════════════════════════════════════════
 *  PASO ROBLES RPG ENGINE — ENERGY MODULE v1.0
 * ═══════════════════════════════════════════════════════════════
 *  Arquitetura: Scene-Checkpoint + Inferência Qualitativa
 *
 *  Energia (Energy) é drenada e recuperada não por relógios,
 *  mas por Cenas (Cortes de Cena e Ação Cinemática).
 *
 *  Estados (0 a 10 blocos): HYPER, AWAKE, TIRED, EXHAUSTED, COLLAPSING.
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────
//  TIPOS E CONSTANTES (QUALITATIVE MANIFESTO)
// ─────────────────────────────────────────────

const EnergyThreshold = Object.freeze({
  HYPER:      "HYPER",
  AWAKE:      "AWAKE",
  TIRED:      "TIRED",
  EXHAUSTED:  "EXHAUSTED",
  COLLAPSING: "COLLAPSING",
});

const THRESHOLD_BLOCKS = Object.freeze({
  [EnergyThreshold.HYPER]:      { blocks: 10 },
  [EnergyThreshold.AWAKE]:      { blocks: 8  },
  [EnergyThreshold.TIRED]:      { blocks: 6  },
  [EnergyThreshold.EXHAUSTED]:  { blocks: 4  },
  [EnergyThreshold.COLLAPSING]: { blocks: 2  },
});

const THRESHOLD_COLORS = Object.freeze({
  [EnergyThreshold.HYPER]:      { fill: "#3b82f6", bg: "#1e3a8a" }, // Azul elétrico
  [EnergyThreshold.AWAKE]:      { fill: "#4ade80", bg: "#14532d" }, // Verde
  [EnergyThreshold.TIRED]:      { fill: "#facc15", bg: "#713f12" }, // Amarelo
  [EnergyThreshold.EXHAUSTED]:  { fill: "#fb923c", bg: "#7c2d12" }, // Laranja
  [EnergyThreshold.COLLAPSING]: { fill: "#ef4444", bg: "#7f1d1d" }, // Vermelho
});

/**
 * Modificadores de Cena / Cortes Cinemáticos.
 * Define o peso semântico e visual temporário da cena atual.
 */
const SCENE_MARKERS = Object.freeze({
  scene_cut_long:    0.30, // Ex: "Mais tarde naquele dia"
  scene_cut_short:   0.10, // Ex: "Alguns minutos depois"
  action_scene:      0.25, // Combate, fuga, exercício pesado
  mental_drain:      0.15, // Estudar, stress emocional intenso
  resting_scene:    -0.20, // Cochilo leve, cena de relaxamento
});

// ─────────────────────────────────────────────
//  SCENE BUFFER
// ─────────────────────────────────────────────

/**
 * Cria o buffer de Cena de Energia.
 */
function createEnergyBuffer({
  threshold = EnergyThreshold.AWAKE,
  markers   = [], // Marcadores como scene_cut_long
  cross_debuff = null, // Ex: "food_coma" ou "starving" que vem da Fome
} = {}) {
  return Object.freeze({
    threshold,
    cross_debuff,
    markers: Object.freeze([...markers]),
  });
}

// ─────────────────────────────────────────────
//  FLASH PROMPT BUILDER
// ─────────────────────────────────────────────

function serializeBufferForFlash(buffer) {
  const parts = [`energy: ${buffer.threshold}`];
  if (buffer.cross_debuff) parts.push(`debuff_ativo: ${buffer.cross_debuff}`);
  if (buffer.markers.length > 0) parts.push(`scene_context: ${buffer.markers.join(",")}`);
  return parts.join(" | ");
}

/**
 * Monta as instruções para a micro-inferência do Gemini.
 * Redigido usando termos de roteiro cinematográfico para ativar
 * o senso comum do LLM quanto à passagem de tempo.
 */
function buildFlashEnergyPrompt(buffer) {
  const serialized = serializeBufferForFlash(buffer);

  return [
    `[ENERGY CHECK - CINEMATIC INFERENCE]`,
    serialized,
    ``,
    `Avalie o estado de cansaço do personagem com base nas Cenas recentes.`,
    `Responda SOMENTE neste formato:`,
    `energy: THRESHOLD | reason: explicação_curta`,
    ``,
    `Thresholds válidos: HYPER, AWAKE, TIRED, EXHAUSTED, COLLAPSING`,
    `Regras de Roteiro Cinemático:`,
    `- 'scene_cut_long' (Corte para tarde/noite) naturalmente degrada o status em 1 nível.`,
    `- 'action_scene' (Combate/Fuga) exige fôlego e drena energia instantaneamente.`,
    `- Uma noite inteira de sono restaura para 'HYPER'.`,
    `- Cenas de relaxamento (banho, cochilo) estabilizam em 'AWAKE'.`,
    `- Se houver 'debuff_ativo' de 'starving' ou 'food_coma', o dreno em cenas curtas é amplificado.`
  ].join("\n");
}

function parseFlashResponse(flashResponse) {
  const cleaned = flashResponse.trim().replace(/\s+/g, " ");
  const match = cleaned.match(
    /energy:\s*(HYPER|AWAKE|TIRED|EXHAUSTED|COLLAPSING)\s*\|\s*reason:\s*(.+)/i
  );
  if (!match) return null;

  const threshold = match[1].toUpperCase();
  if (!EnergyThreshold[threshold]) return null;

  return { threshold, reason: match[2].trim() };
}

// ─────────────────────────────────────────────
//  FRONT-END CONVERTER (UI)
// ─────────────────────────────────────────────

function convertToBlocks(threshold, markers = [], cross_debuff = null) {
  const baseData = THRESHOLD_BLOCKS[threshold];
  if (!baseData) throw new Error(`Threshold inválido: ${threshold}`);

  let totalBlocks = baseData.blocks;

  // Impacto dramático instantâneo da Cena Atual
  let hasDrain = markers.some(m => SCENE_MARKERS[m] >= 0.15);

  if (hasDrain || cross_debuff === "starving") {
    totalBlocks = Math.max(0, totalBlocks - 1);
  } else if (markers.includes("resting_scene")) {
    totalBlocks = Math.min(10, totalBlocks + 1);
  }

  return {
    blocks: totalBlocks,
    threshold,
    color: THRESHOLD_COLORS[threshold],
  };
}

function getUIPayload(threshold, markers = [], cross_debuff = null) {
  const blocksData = convertToBlocks(threshold, markers, cross_debuff);
  const labels = {
    [EnergyThreshold.HYPER]:      "Revigorado",
    [EnergyThreshold.AWAKE]:      "Desperto",
    [EnergyThreshold.TIRED]:      "Cansado",
    [EnergyThreshold.EXHAUSTED]:  "Exausto",
    [EnergyThreshold.COLLAPSING]: "Desmaiando",
  };
  return Object.freeze({
    ...blocksData,
    label: labels[threshold] || "Desconhecido",
  });
}

// ─────────────────────────────────────────────
//  DIRETRIZES DO KINDROID (SUGGESTION INJECTION)
// ─────────────────────────────────────────────

const NARRATIVE_DIRECTIVES = Object.freeze({
  [EnergyThreshold.HYPER]: {
    directive: "Personagem extremamente revigorado e alerta. Totalmente focado. Respostas rápidas e proativas.",
    behavior_modifiers: ["foco_total", "proatividade"],
  },
  [EnergyThreshold.AWAKE]: {
    directive: "Personagem acordado e alerta. Nenhuma penalidade de cansaço.",
    behavior_modifiers: [],
  },
  [EnergyThreshold.TIRED]: {
    directive: "Personagem cansado. O corpo começa a pesar após o dia ou esforço. Bocejos leves ou postura mais relaxada/encurvada.",
    behavior_modifiers: ["foco_levemente_reduzido", "bocejos_ocasionais"],
  },
  [EnergyThreshold.EXHAUSTED]: {
    directive: "EXAUSTÃO. Personagem fala de forma mais arrastada. Reluta em iniciar esforços pesados ou tarefas complexas. Desejo constante de deitar.",
    behavior_modifiers: ["relutancia_esforco", "fala_lenta", "irritabilidade_leve"],
  },
  [EnergyThreshold.COLLAPSING]: {
    directive: "COLAPSO CRÍTICO. Personagem caindo de sono. Visão turva, tropeçando nas palavras e objetos. Qualquer interação cede à necessidade imediata de dormir.",
    behavior_modifiers: ["recusa_esforco_total", "falha_cognitiva", "desespero_sono"],
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

function getGlobalModifiers(threshold) {
  const modifiers = {
    [EnergyThreshold.HYPER]:      { mood_buff: "energetic_joy",     libido_buff: null },
    [EnergyThreshold.AWAKE]:      { mood_buff: null,                libido_buff: null },
    [EnergyThreshold.TIRED]:      { mood_buff: null,                libido_buff: null },
    [EnergyThreshold.EXHAUSTED]:  { mood_buff: "cranky_tiredness",  libido_buff: "low_drive" },
    [EnergyThreshold.COLLAPSING]: { mood_buff: "sleep_despair",     libido_buff: "zero_drive" },
  };
  return Object.freeze(modifiers[threshold] || modifiers[EnergyThreshold.AWAKE]);
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
      ui: getUIPayload(previousBuffer.threshold, previousBuffer.markers, previousBuffer.cross_debuff),
      nextBuffer: previousBuffer,
    };
  }

  const kindroid = getNarrativePayload(parsed.threshold);
  const ui = getUIPayload(parsed.threshold, previousBuffer.markers, previousBuffer.cross_debuff);

  const nextBuffer = createEnergyBuffer({
    threshold:    parsed.threshold,
    cross_debuff: previousBuffer.cross_debuff,
    markers:      [], // Reseta a cena após o checkpoint ser avaliado
  });

  return { kindroid, ui, nextBuffer };
}

/**
 * Adiciona um corte de cena ou marcador cinemático.
 */
function addSceneMarker(currentBuffer, marker) {
  return createEnergyBuffer({
    threshold: currentBuffer.threshold,
    cross_debuff: currentBuffer.cross_debuff,
    markers: [...currentBuffer.markers, marker],
  });
}

/**
 * Recebe buffs/debuffs passivos de outras barras (Ex: starving da Fome).
 */
function applyCrossContamination(currentBuffer, debuff) {
  return createEnergyBuffer({
    threshold: currentBuffer.threshold,
    markers: currentBuffer.markers,
    cross_debuff: debuff,
  });
}

// ─────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────
module.exports = {
  EnergyThreshold,
  createEnergyBuffer,
  serializeBufferForFlash,
  buildFlashEnergyPrompt,
  parseFlashResponse,
  convertToBlocks,
  getNarrativePayload,
  getUIPayload,
  getGlobalModifiers,
  processSceneCheckpoint,
  addSceneMarker,
  applyCrossContamination,
  THRESHOLD_BLOCKS,
};
