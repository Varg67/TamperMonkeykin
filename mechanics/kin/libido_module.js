/**
 * ═══════════════════════════════════════════════════════════════
 *  PASO ROBLES RPG ENGINE — LIBIDO MODULE v1.0
 * ═══════════════════════════════════════════════════════════════
 *  Arquitetura: Scene-Checkpoint + Compliance Gatekeeper
 *
 *  O módulo de Libido é altamente condicional. Ele exige a
 *  ficha de segurança (Compliance) no prompt do LLM.
 *
 *  Hard-Blocks: Fome Crítica, Agonia (Saúde) ou Colapso (Energia)
 *  zeram/travam este módulo fisicamente.
 *
 *  Estados (0 a 10 blocos): FEVERISH, AROUSED, RECEPTIVE, UNINTERESTED, REPELLED.
 * ═══════════════════════════════════════════════════════════════
 */

const { buildCompliancePromptBlock } = require("../ui/profile_compliance");

// ─────────────────────────────────────────────
//  TIPOS E CONSTANTES (A CHAMA ROMÂNTICA)
// ─────────────────────────────────────────────

const LibidoThreshold = Object.freeze({
  FEVERISH:     "FEVERISH",     // Desejo irracional, contato ousado
  AROUSED:      "AROUSED",      // Flerte pesado, tensão física
  RECEPTIVE:    "RECEPTIVE",    // Aberto a investidas, contato casual (Ponto Neutro/Bom)
  UNINTERESTED: "UNINTERESTED", // Focado no trabalho, indiferente, amizade platônica
  REPELLED:     "REPELLED",     // Raiva, nojo, afasta-se de toques
});

const THRESHOLD_BLOCKS = Object.freeze({
  [LibidoThreshold.FEVERISH]:     { blocks: 10 },
  [LibidoThreshold.AROUSED]:      { blocks: 8  },
  [LibidoThreshold.RECEPTIVE]:    { blocks: 5  }, // Meio termo exato
  [LibidoThreshold.UNINTERESTED]: { blocks: 3  },
  [LibidoThreshold.REPELLED]:     { blocks: 1  },
});

const THRESHOLD_COLORS = Object.freeze({
  [LibidoThreshold.FEVERISH]:     { fill: "#e11d48", bg: "#831843" }, // Vermelho Cereja intenso
  [LibidoThreshold.AROUSED]:      { fill: "#f43f5e", bg: "#881337" }, // Rosa/Vermelho quente
  [LibidoThreshold.RECEPTIVE]:    { fill: "#fb923c", bg: "#7c2d12" }, // Laranja amigável
  [LibidoThreshold.UNINTERESTED]: { fill: "#9ca3af", bg: "#374151" }, // Cinza apático
  [LibidoThreshold.REPELLED]:     { fill: "#0369a1", bg: "#082f49" }, // Azul frio/Gelo (Rejeição)
});

/**
 * Modificadores de Cena Sensual (Buffs e Mood Killers).
 */
const SCENE_MARKERS = Object.freeze({
  // --- Buffs Atmosféricos (Slow Burn) ---
  intimate_atmosphere: 0.20, // Luz baixa, música, isolamento (Aumenta blocos)
  deep_eye_contact:    0.15, // Silêncios prolongados, encarar
  sensual_touch:       0.30, // Toque físico não acidental, proximidade

  // --- Mood Killers (Debuffs - Removem blocos) ---
  sudden_interruption: -0.40, // Telefone toca, NPC entra no quarto
  gross_behavior:      -0.30, // Arrotar, higiene questionável, grosseria
  talk_about_ex:       -0.50, // Quebra imediata do clima romântico
});

// ─────────────────────────────────────────────
//  SCENE BUFFER (DIRECIONAL E CONDICIONAL)
// ─────────────────────────────────────────────

function createLibidoBuffer({
  targetName   = "Unknown",
  threshold    = LibidoThreshold.UNINTERESTED,
  markers      = [],
  cross_buff   = null, // Ex: "high_arousal" do Módulo EROS
  hard_blocked = false // Se true (vindo da Saúde/Fome), zera o sistema
} = {}) {
  return Object.freeze({
    targetName,
    threshold,
    cross_buff,
    hard_blocked,
    markers: Object.freeze([...markers]),
  });
}

// ─────────────────────────────────────────────
//  FLASH PROMPT BUILDER (COM GATEKEEPER)
// ─────────────────────────────────────────────

function serializeBufferForFlash(buffer) {
  const parts = [
    `target: ${buffer.targetName}`,
    `current_libido: ${buffer.threshold}`
  ];
  if (buffer.cross_buff) parts.push(`passive_influence: ${buffer.cross_buff}`);
  if (buffer.markers.length > 0) parts.push(`scene_actions: ${buffer.markers.join(",")}`);
  return parts.join(" | ");
}

/**
 * Incorpora o Perfil e as Regras 18+ (Gatekeeper) junto da lógica do Módulo.
 * Exige a passagem do targetProfile (Alvo da cena) e opcionalmente o partnerProfile (Parceiro).
 */
function buildFlashLibidoPrompt(buffer, targetProfile, partnerProfile) {
  const complianceBlock = buildCompliancePromptBlock(targetProfile, partnerProfile, "Interação de Libido/Aração");
  const serialized = serializeBufferForFlash(buffer);

  return [
    complianceBlock,
    ``,
    `[LIBIDO CHECK - ATRAÇÃO E TENSÃO FÍSICA]`,
    serialized,
    ``,
    `Avalie o nível de atração física e desejo do personagem ('target') em relação ao parceiro na cena atual.`,
    `Responda SOMENTE neste formato:`,
    `libido: THRESHOLD | reason: explicação_curta`,
    ``,
    `Thresholds válidos: FEVERISH, AROUSED, RECEPTIVE, UNINTERESTED, REPELLED`,
    `Regras Cinematográficas (Slow Burn Obrigatório):`,
    `- 'intimate_atmosphere' e 'deep_eye_contact' constroem tensão aos poucos. Mova para 'RECEPTIVE' ou 'AROUSED'.`,
    `- 'sensual_touch' aumenta fortemente a atração SE o estado já for 'RECEPTIVE' ou maior.`,
    `- Pulos repentinos de 'UNINTERESTED' para 'FEVERISH' sem contexto apropriado SÃO PROIBIDOS. Aumente um nível por cena (Slow Burn).`,
    `- 'sudden_interruption' ou 'gross_behavior' são Mood Killers severos. Esfria a cena (rebaixa para 'UNINTERESTED' no mínimo).`,
    `- O 'passive_influence' de 'high_arousal' (Módulo EROS) acelera a quebra de gelo.`
  ].join("\n");
}

function parseFlashResponse(flashResponse) {
  const cleaned = flashResponse.trim().replace(/\s+/g, " ");
  const match = cleaned.match(
    /libido:\s*(FEVERISH|AROUSED|RECEPTIVE|UNINTERESTED|REPELLED)\s*\|\s*reason:\s*(.+)/i
  );
  if (!match) return null;

  const threshold = match[1].toUpperCase();
  if (!LibidoThreshold[threshold]) return null;

  return { threshold, reason: match[2].trim() };
}

// ─────────────────────────────────────────────
//  FRONT-END CONVERTER (UI COM HARD BLOCKS)
// ─────────────────────────────────────────────

function convertToBlocks(threshold, markers = [], cross_buff = null, hard_blocked = false) {
  // HARD BLOCK SUPREMO: Personagem morrendo ou morrendo de fome
  if (hard_blocked) {
    return {
      blocks: 0,
      threshold: LibidoThreshold.UNINTERESTED,
      color: THRESHOLD_COLORS[LibidoThreshold.UNINTERESTED], // Cinza apático
    };
  }

  const baseData = THRESHOLD_BLOCKS[threshold];
  if (!baseData) throw new Error(`Threshold inválido: ${threshold}`);

  let totalBlocks = baseData.blocks;

  // Tensão visual instantânea (Soma de Toques vs Interrupções)
  let tensionShift = 0;
  for (const marker of markers) {
    const weight = SCENE_MARKERS[marker];
    if (weight !== undefined) tensionShift += weight;
  }

  // Buffs de Atração passiva (Eros, Glamorous Appearance)
  if (cross_buff === "high_arousal") tensionShift += 0.20;
  if (cross_buff === "playful_arousal") tensionShift += 0.15;
  if (cross_buff === "turned_off") tensionShift -= 0.30; // Sujeira afasta

  const blockModifier = Math.round(tensionShift * 10);
  totalBlocks = Math.max(0, Math.min(10, totalBlocks + blockModifier));

  return {
    blocks: totalBlocks,
    threshold,
    color: THRESHOLD_COLORS[threshold],
  };
}

function getUIPayload(threshold, markers = [], cross_buff = null, hard_blocked = false) {
  const blocksData = convertToBlocks(threshold, markers, cross_buff, hard_blocked);
  const labels = {
    [LibidoThreshold.FEVERISH]:     "Desejo Intenso",
    [LibidoThreshold.AROUSED]:      "Excitado",
    [LibidoThreshold.RECEPTIVE]:    "Receptivo",
    [LibidoThreshold.UNINTERESTED]: "Sem Interesse",
    [LibidoThreshold.REPELLED]:     "Repelido",
  };

  const finalLabel = hard_blocked ? "Incapacitado (Sobrevivência)" : labels[blocksData.threshold];

  return Object.freeze({
    ...blocksData,
    label: finalLabel,
  });
}

// ─────────────────────────────────────────────
//  DIRETRIZES DO KINDROID (SUGGESTION INJECTION)
// ─────────────────────────────────────────────

const NARRATIVE_DIRECTIVES = Object.freeze({
  [LibidoThreshold.FEVERISH]: {
    directive: "Sua atração por esta pessoa está febril e consumidora. O desejo nubla o julgamento racional. Você busca contato físico ousado e intimidade a qualquer custo.",
    behavior_modifiers: ["tensão_carnal", "impaciência_romântica", "foco_físico"],
  },
  [LibidoThreshold.AROUSED]: {
    directive: "Você está fortemente atraído. Flerte ativo, insinuações com duplo sentido, olhares prolongados. O ar entre vocês é eletrizante.",
    behavior_modifiers: ["provocante", "olhar_predatório_leve"],
  },
  [LibidoThreshold.RECEPTIVE]: {
    directive: "Você se sente atraído de forma sutil. Está receptivo ao flerte e aos toques casuais, mas não iniciará ações intensas do nada. Clima agradável.",
    behavior_modifiers: ["sorrisos_sutis", "toques_acidentais"],
  },
  [LibidoThreshold.UNINTERESTED]: {
    directive: "Nenhum interesse físico ou romântico no momento. Ocasionalmente você pode ignorar flertes ou focar em outros assuntos triviais ou práticos.",
    behavior_modifiers: ["foco_platônico", "cabeça_fria"],
  },
  [LibidoThreshold.REPELLED]: {
    directive: "Aversão física ou raiva. Qualquer tentativa de flerte ou toque por essa pessoa será respondida com nojo, frieza ou um corte agressivo.",
    behavior_modifiers: ["frieza_extrema", "nojo_ou_raiva", "esquiva_física"],
  },
});

function getNarrativePayload(threshold, targetName, hard_blocked = false) {
  if (hard_blocked) {
    return Object.freeze({
      targetName,
      threshold: LibidoThreshold.UNINTERESTED,
      directive: `[Status Biológico Crítico]: A dor ou a exaustão física anularam completamente o desejo romântico ou físico de seu personagem. Qualquer investida de terceiros será solenemente ignorada ou rejeitada. Seu corpo foca apenas em sobreviver/descansar.`,
      behavior_modifiers: ["instinto_de_sobrevivência", "apatia_física"],
    });
  }

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

function getGlobalModifiers(threshold) {
  const modifiers = {
    [LibidoThreshold.FEVERISH]:     { mood_buff: "passionate",  energy_drain: "hyperactive" },
    [LibidoThreshold.AROUSED]:      { mood_buff: "excited",     energy_drain: null },
    [LibidoThreshold.RECEPTIVE]:    { mood_buff: null,          energy_drain: null },
    [LibidoThreshold.UNINTERESTED]: { mood_buff: null,          energy_drain: null },
    [LibidoThreshold.REPELLED]:     { mood_buff: "disgusted",   energy_drain: null },
  };
  return Object.freeze(modifiers[threshold] || modifiers[LibidoThreshold.UNINTERESTED]);
}

// ─────────────────────────────────────────────
//  PIPELINE & EVENTOS
// ─────────────────────────────────────────────

function processSceneCheckpoint({ previousBuffer, flashResponse }) {
  // Hard block ignora a API totalmente.
  if (previousBuffer.hard_blocked) {
    return {
      error: "Libido bloqueada por saúde/energia crítica.",
      kindroid: getNarrativePayload(LibidoThreshold.UNINTERESTED, previousBuffer.targetName, true),
      ui: getUIPayload(LibidoThreshold.UNINTERESTED, [], null, true),
      nextBuffer: createLibidoBuffer({
        targetName:   previousBuffer.targetName,
        threshold:    LibidoThreshold.UNINTERESTED,
        cross_buff:   null,
        hard_blocked: true,
        markers:      [],
      }),
    };
  }

  const parsed = parseFlashResponse(flashResponse);
  if (!parsed) {
    return {
      error: "Flash retornou formato inválido. Resposta descartada.",
      kindroid: getNarrativePayload(previousBuffer.threshold, previousBuffer.targetName),
      ui: getUIPayload(previousBuffer.threshold, previousBuffer.markers, previousBuffer.cross_buff),
      nextBuffer: previousBuffer,
    };
  }

  const kindroid = getNarrativePayload(parsed.threshold, previousBuffer.targetName);
  const ui = getUIPayload(parsed.threshold, previousBuffer.markers, previousBuffer.cross_buff);

  const nextBuffer = createLibidoBuffer({
    targetName:   previousBuffer.targetName,
    threshold:    parsed.threshold,
    cross_buff:   previousBuffer.cross_buff,
    hard_blocked: false,
    markers:      [], // Reseta a tensão visual para a próxima cena
  });

  return { kindroid, ui, nextBuffer };
}

function addSceneMarker(currentBuffer, marker) {
  return createLibidoBuffer({
    targetName:   currentBuffer.targetName,
    threshold:    currentBuffer.threshold,
    cross_buff:   currentBuffer.cross_buff,
    hard_blocked: currentBuffer.hard_blocked,
    markers:      [...currentBuffer.markers, marker],
  });
}

function applyCrossContamination(currentBuffer, buff, isHardBlocked = false) {
  return createLibidoBuffer({
    targetName:   currentBuffer.targetName,
    threshold:    currentBuffer.threshold,
    markers:      currentBuffer.markers,
    cross_buff:   buff,
    hard_blocked: isHardBlocked || currentBuffer.hard_blocked, // Prioriza o bloqueio fatal
  });
}

// ─────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────
module.exports = {
  LibidoThreshold,
  createLibidoBuffer,
  serializeBufferForFlash,
  buildFlashLibidoPrompt,
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
