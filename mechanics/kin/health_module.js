/**
 * ═══════════════════════════════════════════════════════════════
 *  PASO ROBLES RPG ENGINE — HEALTH MODULE v1.0
 * ═══════════════════════════════════════════════════════════════
 *  Arquitetura: Scene-Checkpoint + Inferência Qualitativa
 *
 *  Saúde (Health) é o status mestre do Efeito Dominó.
 *  Estados baixos de Saúde sobrepujam e anulam as vontades de
 *  outros status (zerando Energia, Libido e afundando o Humor).
 *
 *  Estados (0 a 10 blocos): HEALTHY, BRUISED, WOUNDED, CRITICAL, DYING.
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────
//  TIPOS E CONSTANTES (QUALITATIVE MANIFESTO)
// ─────────────────────────────────────────────

const HealthThreshold = Object.freeze({
  HEALTHY:   "HEALTHY",   // Perfeito estado
  BRUISED:   "BRUISED",   // Escoriações, hematomas, dor leve
  WOUNDED:   "WOUNDED",   // Ferimentos abertos, doença ativa, mancando
  CRITICAL:  "CRITICAL",  // Ossos quebrados, hemorragia, veneno grave
  DYING:     "DYING",     // Inconsciente, moribundo
});

const THRESHOLD_BLOCKS = Object.freeze({
  [HealthThreshold.HEALTHY]:   { blocks: 10 },
  [HealthThreshold.BRUISED]:   { blocks: 8  },
  [HealthThreshold.WOUNDED]:   { blocks: 6  },
  [HealthThreshold.CRITICAL]:  { blocks: 4  },
  [HealthThreshold.DYING]:     { blocks: 2  },
});

const THRESHOLD_COLORS = Object.freeze({
  [HealthThreshold.HEALTHY]:   { fill: "#4ade80", bg: "#14532d" }, // Verde Vivo
  [HealthThreshold.BRUISED]:   { fill: "#facc15", bg: "#713f12" }, // Amarelo
  [HealthThreshold.WOUNDED]:   { fill: "#fb923c", bg: "#7c2d12" }, // Laranja
  [HealthThreshold.CRITICAL]:  { fill: "#ef4444", bg: "#7f1d1d" }, // Vermelho Forte
  [HealthThreshold.DYING]:     { fill: "#000000", bg: "#7f1d1d" }, // Preto/Vermelho Sangue
});

/**
 * Modificadores de Cena / Cortes Cinemáticos.
 * Buffs curam (negativos para soma algébrica de blocos visuais).
 * Debuffs ferem (positivos removem blocos).
 */
const SCENE_MARKERS = Object.freeze({
  // --- Buffs de Cura ---
  magic_healing:    -0.80, // Restauração total via magia ou tecnologia avançada
  hospital_care:    -0.60, // Cirurgia, dias de descanso médico
  first_aid:        -0.20, // Bandagens, poções fracas (estabiliza o dano)
  medication:       -0.30, // Antídoto, analgésico forte, antibiótico

  // --- Debuffs (Dano Cinético e Doenças) ---
  blunt_trauma:      0.20, // Socos, quedas leves, golpes de impacto
  piercing_wound:    0.40, // Cortes de espada, tiros, facadas (Dano pesado)
  poison_disease:    0.30, // Veneno, febre alta, infecção
  lethal_blow:       0.80, // Queda de penhasco, explosões diretas (Insta-Crítico)
});

// ─────────────────────────────────────────────
//  SCENE BUFFER
// ─────────────────────────────────────────────

function createHealthBuffer({
  threshold    = HealthThreshold.HEALTHY,
  markers      = [],
  cross_debuff = null, // Ex: "starvation_damage"
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
  const parts = [`health: ${buffer.threshold}`];
  if (buffer.cross_debuff) parts.push(`system_stress: ${buffer.cross_debuff}`);
  if (buffer.markers.length > 0) parts.push(`scene_context: ${buffer.markers.join(",")}`);
  return parts.join(" | ");
}

/**
 * Monta as instruções para a micro-inferência de combate/saúde do Gemini.
 */
function buildFlashHealthPrompt(buffer) {
  const serialized = serializeBufferForFlash(buffer);

  return [
    `[HEALTH CHECK - CINEMATIC INFERENCE]`,
    serialized,
    ``,
    `Avalie a integridade física, ferimentos ou doenças do personagem com base nas Cenas recentes.`,
    `Responda SOMENTE neste formato:`,
    `health: THRESHOLD | reason: explicação_curta`,
    ``,
    `Thresholds válidos: HEALTHY, BRUISED, WOUNDED, CRITICAL, DYING`,
    `Regras de Roteiro Cinemático (Dano e Cura):`,
    `- 'piercing_wound' (Cortes profundos/Tiros) força um rebaixamento direto para 'WOUNDED' ou 'CRITICAL'.`,
    `- Quedas ou socos ('blunt_trauma') geralmente reduzem para 'BRUISED', a menos que seja severo.`,
    `- Magia de cura ('magic_healing') ou internação ('hospital_care') restauram a saúde para 'HEALTHY'.`,
    `- 'first_aid' apenas estabiliza sangramentos, impedindo a morte, mas não cura 'WOUNDED' magicamente.`,
    `- 'system_stress' prolongado (como morrer de fome/starvation) degrada a saúde continuamente.`
  ].join("\n");
}

function parseFlashResponse(flashResponse) {
  const cleaned = flashResponse.trim().replace(/\s+/g, " ");
  const match = cleaned.match(
    /health:\s*(HEALTHY|BRUISED|WOUNDED|CRITICAL|DYING)\s*\|\s*reason:\s*(.+)/i
  );
  if (!match) return null;

  const threshold = match[1].toUpperCase();
  if (!HealthThreshold[threshold]) return null;

  return { threshold, reason: match[2].trim() };
}

// ─────────────────────────────────────────────
//  FRONT-END CONVERTER (UI)
// ─────────────────────────────────────────────

function convertToBlocks(threshold, markers = [], cross_debuff = null) {
  const baseData = THRESHOLD_BLOCKS[threshold];
  if (!baseData) throw new Error(`Threshold inválido: ${threshold}`);

  let totalBlocks = baseData.blocks;

  // Feedback dramático instantâneo (A soma algébrica das dores)
  let visualShift = 0;
  for (const marker of markers) {
    const weight = SCENE_MARKERS[marker];
    if (weight !== undefined) visualShift += weight;
  }

  // Se o personagem estiver morrendo de fome, perde blocos de HP temporários
  if (cross_debuff === "starvation_damage") visualShift += 0.20;

  const blockModifier = Math.round(visualShift * 10);

  // Limita o HP entre 0 (Desmaio) e 10 (Perfeito)
  totalBlocks = Math.max(0, Math.min(10, totalBlocks - blockModifier));

  return {
    blocks: totalBlocks,
    threshold,
    color: THRESHOLD_COLORS[threshold],
  };
}

function getUIPayload(threshold, markers = [], cross_debuff = null) {
  const blocksData = convertToBlocks(threshold, markers, cross_debuff);
  const labels = {
    [HealthThreshold.HEALTHY]:   "Saudável",
    [HealthThreshold.BRUISED]:   "Escoriado",
    [HealthThreshold.WOUNDED]:   "Ferido",
    [HealthThreshold.CRITICAL]:  "Crítico",
    [HealthThreshold.DYING]:     "Moribundo",
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
  [HealthThreshold.HEALTHY]: {
    directive: "Personagem em perfeitas condições físicas. Nenhuma dor ou limitação.",
    behavior_modifiers: [],
  },
  [HealthThreshold.BRUISED]: {
    directive: "Dor leve. Hematomas, arranhões ou dor de cabeça. O personagem geme ao fazer esforço pesado, mas consegue agir normalmente.",
    behavior_modifiers: ["gemidos_de_esforço_ocasionais"],
  },
  [HealthThreshold.WOUNDED]: {
    directive: "Ferimento ativo. O personagem manca, segura a costela ou respira com dificuldade. Combater ou correr é doloroso. Foco na dor latente.",
    behavior_modifiers: ["expressão_de_dor", "restrição_de_movimento", "irritabilidade_por_dor"],
  },
  [HealthThreshold.CRITICAL]: {
    directive: "ESTADO CRÍTICO. Dor agonizante, sangramento intenso ou febre debilitante. Incapaz de lutar ou correr. A respiração é fraca. O instinto de sobrevivência (focar em cura imediata) anula qualquer outro desejo social ou romântico.",
    behavior_modifiers: ["agonia", "incapacitação_motora", "visão_turva", "desespero"],
  },
  [HealthThreshold.DYING]: {
    directive: "MORIBUNDO. Quase inconsciente. Incapaz de manter diálogos longos. Tosse sangue ou mal consegue sussurrar. Depende totalmente de terceiros para não morrer.",
    behavior_modifiers: ["inconsciência_iminente", "paralisia", "fala_cortada"],
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
 * A Saúde é a métrica mais punitiva da Engine.
 * Valores baixos esmagam todos os outros status.
 */
function getGlobalModifiers(threshold) {
  const modifiers = {
    [HealthThreshold.HEALTHY]:  { energy_debuff: null,         mood_buff: null,         appearance_debuff: null,           block_libido: false },
    [HealthThreshold.BRUISED]:  { energy_debuff: "pain_drain", mood_buff: "annoyed",    appearance_debuff: null,           block_libido: false },
    [HealthThreshold.WOUNDED]:  { energy_debuff: "exhausted",  mood_buff: "suffering",  appearance_debuff: "blood_sweat",  block_libido: true  },
    [HealthThreshold.CRITICAL]: { energy_debuff: "collapsing", mood_buff: "agony",      appearance_debuff: "blood_gore",   block_libido: true  },
    [HealthThreshold.DYING]:    { energy_debuff: "zero_energy",mood_buff: "fading",     appearance_debuff: "death_door",   block_libido: true  },
  };
  return Object.freeze(modifiers[threshold] || modifiers[HealthThreshold.HEALTHY]);
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

  const nextBuffer = createHealthBuffer({
    threshold:    parsed.threshold,
    cross_debuff: previousBuffer.cross_debuff,
    markers:      [], // Reseta os danos agudos na transição de cena
  });

  return { kindroid, ui, nextBuffer };
}

function addSceneMarker(currentBuffer, marker) {
  return createHealthBuffer({
    threshold: currentBuffer.threshold,
    cross_debuff: currentBuffer.cross_debuff,
    markers: [...currentBuffer.markers, marker],
  });
}

function applyCrossContamination(currentBuffer, debuff) {
  return createHealthBuffer({
    threshold: currentBuffer.threshold,
    markers: currentBuffer.markers,
    cross_debuff: debuff,
  });
}

// ─────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────
module.exports = {
  HealthThreshold,
  createHealthBuffer,
  serializeBufferForFlash,
  buildFlashHealthPrompt,
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
