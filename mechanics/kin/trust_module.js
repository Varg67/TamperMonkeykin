/**
 * ═══════════════════════════════════════════════════════════════
 *  PASO ROBLES RPG ENGINE — TRUST MODULE v1.0
 * ═══════════════════════════════════════════════════════════════
 *  Arquitetura: Scene-Checkpoint + Inferência Qualitativa Direcional
 *
 *  Diferente de status biológicos, a Confiança é VETORIAL.
 *  O personagem tem um status de Confiança independente para
 *  cada alvo (NPC/Player) com quem interage.
 *
 *  Estados (0 a 10 blocos): DEVOTED, TRUSTING, NEUTRAL, SUSPICIOUS, PARANOID.
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────
//  TIPOS E CONSTANTES (QUALITATIVE MANIFESTO)
// ─────────────────────────────────────────────

const TrustThreshold = Object.freeze({
  DEVOTED:    "DEVOTED",    // Confiança cega / Lealdade absoluta
  TRUSTING:   "TRUSTING",   // Amigável / Acredita na palavra
  NEUTRAL:    "NEUTRAL",    // Ponto de partida (Desconhecidos)
  SUSPICIOUS: "SUSPICIOUS", // Desconfiado / Exige provas
  PARANOID:   "PARANOID",   // Inimigo / Assume malícia
});

const THRESHOLD_BLOCKS = Object.freeze({
  [TrustThreshold.DEVOTED]:    { blocks: 10 },
  [TrustThreshold.TRUSTING]:   { blocks: 8  },
  [TrustThreshold.NEUTRAL]:    { blocks: 5  }, // Meio da barra
  [TrustThreshold.SUSPICIOUS]: { blocks: 3  },
  [TrustThreshold.PARANOID]:   { blocks: 1  },
});

const THRESHOLD_COLORS = Object.freeze({
  [TrustThreshold.DEVOTED]:    { fill: "#3b82f6", bg: "#1e3a8a" }, // Azul (Lealdade)
  [TrustThreshold.TRUSTING]:   { fill: "#4ade80", bg: "#14532d" }, // Verde
  [TrustThreshold.NEUTRAL]:    { fill: "#9ca3af", bg: "#374151" }, // Cinza (Neutro)
  [TrustThreshold.SUSPICIOUS]: { fill: "#facc15", bg: "#713f12" }, // Amarelo (Alerta)
  [TrustThreshold.PARANOID]:   { fill: "#ef4444", bg: "#7f1d1d" }, // Vermelho (Hostil)
});

/**
 * Modificadores de Cena / Ações Sociais.
 * Buffs aproximam (negativos no cálculo algébrico se a barra fosse invertida, mas
 * aqui somamos blocos para Buffs e subtraímos para Debuffs direcionalmente).
 */
const SCENE_MARKERS = Object.freeze({
  // --- Buffs de Confiança (Soma Blocos) ---
  saved_life:       0.50, // Salvar o personagem de perigo letal
  kept_promise:     0.20, // Cumprir a palavra
  gift_given:       0.15, // Presente significativo
  emotional_support: 0.25, // Ouvir desabafo, consolar

  // --- Debuffs de Confiança (Subtrai Blocos) ---
  caught_lying:    -0.30, // Pego na mentira
  betrayal:        -0.80, // Traição grave (ataque, roubo direto)
  broken_promise:  -0.20, // Falhar num compromisso
  creepy_behavior: -0.15, // Ações estranhas, invasão de espaço (sem intimidade)
});

// ─────────────────────────────────────────────
//  SCENE BUFFER (DIRECIONAL)
// ─────────────────────────────────────────────

/**
 * Cria o buffer de Confiança para uma relação ESPECÍFICA.
 * O StateManager da Engine deve instanciar um buffer por Alvo.
 */
function createTrustBuffer({
  targetName = "Unknown",
  threshold  = TrustThreshold.NEUTRAL,
  markers    = [],
  cross_buff = null, // Ex: "halo_effect" vindo da Aparência Glamorous do alvo
} = {}) {
  return Object.freeze({
    targetName,
    threshold,
    cross_buff,
    markers: Object.freeze([...markers]),
  });
}

// ─────────────────────────────────────────────
//  FLASH PROMPT BUILDER
// ─────────────────────────────────────────────

function serializeBufferForFlash(buffer) {
  const parts = [
    `target: ${buffer.targetName}`,
    `current_trust: ${buffer.threshold}`
  ];
  if (buffer.cross_buff) parts.push(`passive_influence: ${buffer.cross_buff}`);
  if (buffer.markers.length > 0) parts.push(`recent_actions: ${buffer.markers.join(",")}`);
  return parts.join(" | ");
}

/**
 * Monta as instruções para a micro-inferência direcional do Gemini.
 */
function buildFlashTrustPrompt(buffer) {
  const serialized = serializeBufferForFlash(buffer);

  return [
    `[TRUST CHECK - RELATIONAL INFERENCE]`,
    serialized,
    ``,
    `Avalie o nível de confiança do personagem em relação ao ALVO ('target') com base nas ações recentes da cena.`,
    `Responda SOMENTE neste formato:`,
    `trust: THRESHOLD | reason: explicação_curta`,
    ``,
    `Thresholds válidos: DEVOTED, TRUSTING, NEUTRAL, SUSPICIOUS, PARANOID`,
    `Regras de Roteiro Social:`,
    `- 'betrayal' (Ataque, Roubo, Traição) degrada instantaneamente a confiança para 'PARANOID' ou no mínimo 'SUSPICIOUS'.`,
    `- 'caught_lying' reduz o status em 1 nível.`,
    `- 'saved_life' ou apoio emocional genuíno aproxima de 'TRUSTING' ou 'DEVOTED'.`,
    `- 'passive_influence' (Ex: O Alvo é muito atraente/carismático) afrouxa a guarda e acelera o ganho de confiança.`,
    `- Confiança leva tempo para construir (NEUTRAL -> TRUSTING), mas pode ser destruída em uma única cena.`
  ].join("\n");
}

function parseFlashResponse(flashResponse) {
  const cleaned = flashResponse.trim().replace(/\s+/g, " ");
  const match = cleaned.match(
    /trust:\s*(DEVOTED|TRUSTING|NEUTRAL|SUSPICIOUS|PARANOID)\s*\|\s*reason:\s*(.+)/i
  );
  if (!match) return null;

  const threshold = match[1].toUpperCase();
  if (!TrustThreshold[threshold]) return null;

  return { threshold, reason: match[2].trim() };
}

// ─────────────────────────────────────────────
//  FRONT-END CONVERTER (UI)
// ─────────────────────────────────────────────

function convertToBlocks(threshold, markers = [], cross_buff = null) {
  const baseData = THRESHOLD_BLOCKS[threshold];
  if (!baseData) throw new Error(`Threshold inválido: ${threshold}`);

  let totalBlocks = baseData.blocks;

  // Feedback social instantâneo antes da avaliação do LLM
  let relationalShift = 0;
  for (const marker of markers) {
    const weight = SCENE_MARKERS[marker];
    if (weight !== undefined) relationalShift += weight;
  }

  // Se o alvo tem o 'Halo Effect' (Aparência Glamorous), ganha um micro-buff na dúvida
  if (cross_buff === "halo_effect") relationalShift += 0.10;

  const blockModifier = Math.round(relationalShift * 10);

  // Confiança vai de 0 (Traição Absoluta) a 10 (Devoção Cega)
  totalBlocks = Math.max(0, Math.min(10, totalBlocks + blockModifier));

  return {
    blocks: totalBlocks,
    threshold,
    color: THRESHOLD_COLORS[threshold],
  };
}

function getUIPayload(threshold, markers = [], cross_buff = null) {
  const blocksData = convertToBlocks(threshold, markers, cross_buff);
  const labels = {
    [TrustThreshold.DEVOTED]:    "Devoto",
    [TrustThreshold.TRUSTING]:   "Confiante",
    [TrustThreshold.NEUTRAL]:    "Neutro",
    [TrustThreshold.SUSPICIOUS]: "Suspeito",
    [TrustThreshold.PARANOID]:   "Paranoico",
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
 * A injeção no Kindroid DEVE incluir o nome do Alvo (ex: "Em relação a Alex: ...")
 */
const NARRATIVE_DIRECTIVES = Object.freeze({
  [TrustThreshold.DEVOTED]: {
    directive: "Confiança absoluta. Você acata sugestões, não questiona motivos e protegerá/defenderá esta pessoa de acusações.",
    behavior_modifiers: ["lealdade_extrema", "compartilhar_segredos", "cegueira_voluntária"],
  },
  [TrustThreshold.TRUSTING]: {
    directive: "Você confia na palavra desta pessoa e a considera uma aliada/amiga. Diálogos são abertos e relaxados.",
    behavior_modifiers: ["amigável", "cooperativo"],
  },
  [TrustThreshold.NEUTRAL]: {
    directive: "Sentimento neutro. Trata com educação básica (ou indiferença), mas não revela segredos nem arrisca o pescoço por ela.",
    behavior_modifiers: ["cautela_educada", "distanciamento_profissional"],
  },
  [TrustThreshold.SUSPICIOUS]: {
    directive: "Você desconfia das intenções desta pessoa. É evasivo nas respostas. Exige provas para qualquer afirmação que ela faça.",
    behavior_modifiers: ["evasivo", "interrogativo", "linguagem_corporal_fechada"],
  },
  [TrustThreshold.PARANOID]: {
    directive: "Hostilidade e paranoia. Você assume que qualquer ação dessa pessoa é uma armadilha, mentira ou ofensa. Recusa cooperação voluntária.",
    behavior_modifiers: ["hostilidade_ativa_ou_passiva", "recusa_cooperação", "acusatório"],
  },
});

function getNarrativePayload(threshold, targetName) {
  const entry = NARRATIVE_DIRECTIVES[threshold];
  if (!entry) throw new Error(`Threshold inválido: ${threshold}`);

  return Object.freeze({
    targetName,
    threshold,
    directive: `Em relação a ${targetName}: ${entry.directive}`,
    behavior_modifiers: [...entry.behavior_modifiers],
  });
}

// ─────────────────────────────────────────────
//  CROSS-CONTAMINATION — Efeito Dominó Global
// ─────────────────────────────────────────────

/**
 * Trust não debuffa energia ou fome, mas afeta fortemente o Amor e Reputação.
 * Não confia = Não ama (em 90% dos casos).
 */
function getGlobalModifiers(threshold) {
  const modifiers = {
    [TrustThreshold.DEVOTED]:    { love_facilitator: "open_heart",  mood_buff: "secure" },
    [TrustThreshold.TRUSTING]:   { love_facilitator: "friendly",    mood_buff: null },
    [TrustThreshold.NEUTRAL]:    { love_facilitator: null,          mood_buff: null },
    [TrustThreshold.SUSPICIOUS]: { love_facilitator: "blocked",     mood_buff: "tense" },
    [TrustThreshold.PARANOID]:   { love_facilitator: "hard_block",  mood_buff: "anxious_angry" },
  };
  return Object.freeze(modifiers[threshold] || modifiers[TrustThreshold.NEUTRAL]);
}

// ─────────────────────────────────────────────
//  PIPELINE & EVENTOS
// ─────────────────────────────────────────────

function processSceneCheckpoint({ previousBuffer, flashResponse }) {
  const parsed = parseFlashResponse(flashResponse);
  if (!parsed) {
    return {
      error: "Flash retornou formato inválido. Resposta descartada, mantendo estado anterior.",
      kindroid: getNarrativePayload(previousBuffer.threshold, previousBuffer.targetName),
      ui: getUIPayload(previousBuffer.threshold, previousBuffer.markers, previousBuffer.cross_buff),
      nextBuffer: previousBuffer,
    };
  }

  const kindroid = getNarrativePayload(parsed.threshold, previousBuffer.targetName);
  const ui = getUIPayload(parsed.threshold, previousBuffer.markers, previousBuffer.cross_buff);

  const nextBuffer = createTrustBuffer({
    targetName: previousBuffer.targetName,
    threshold:  parsed.threshold,
    cross_buff: previousBuffer.cross_buff,
    markers:    [], // Reseta as ações sociais da cena
  });

  return { kindroid, ui, nextBuffer };
}

function addSceneMarker(currentBuffer, marker) {
  return createTrustBuffer({
    targetName: currentBuffer.targetName,
    threshold: currentBuffer.threshold,
    cross_buff: currentBuffer.cross_buff,
    markers: [...currentBuffer.markers, marker],
  });
}


// ─────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────
module.exports = {
  TrustThreshold,
  createTrustBuffer,
  serializeBufferForFlash,
  buildFlashTrustPrompt,
  parseFlashResponse,
  convertToBlocks,
  getNarrativePayload,
  getUIPayload,
  getGlobalModifiers,
  processSceneCheckpoint,
  addSceneMarker,
  THRESHOLD_BLOCKS,
};
