/**
 * ═══════════════════════════════════════════════════════════════
 *  PASO ROBLES RPG ENGINE — HUNGER MODULE v1.0
 * ═══════════════════════════════════════════════════════════════
 *  Arquitetura: Scene-Checkpoint + Inferência Qualitativa
 *
 *  O LLM (Gemini Flash) trabalha SOMENTE com thresholds qualitativos.
 *  O middleware converte o qualitativo em valor numérico para a UI.
 *  O bot (Kindroid) recebe SOMENTE a diretriz narrativa.
 *
 *  Fluxo:
 *  ┌─────────┐    ┌───────────┐    ┌────────────┐    ┌──────────┐
 *  │  CENA   │ →  │   FLASH   │ →  │ CONVERTER  │ →  │ KINDROID │
 *  │ (buffer)│    │(inferência)│   │(num + dir) │    │(diretriz)│
 *  └─────────┘    └───────────┘    └────────────┘    └──────────┘
 *                                        ↓
 *                                   ┌─────────┐
 *                                   │ UI/BARRA │
 *                                   └─────────┘
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────
//  TIPOS E CONSTANTES
// ─────────────────────────────────────────────

/**
 * Thresholds qualitativos — a linguagem oficial entre sistemas.
 * Nenhum LLM jamais vê um número. Só estes 5 estados baseados nos blocos da UI.
 */
const HungerThreshold = Object.freeze({
  STUFFED:  "STUFFED",
  SATIATED: "SATIATED",
  PECULIAR: "PECULIAR",
  HANGRY:   "HANGRY",
  STARVING: "STARVING",
});

/**
 * Quantidade de blocos associados a cada estado.
 * A barra visual tem 10 blocos no total.
 * O índice é a quantidade de blocos preenchidos (10 = totalmente cheio/empanturrado).
 */
const THRESHOLD_BLOCKS = Object.freeze({
  [HungerThreshold.STUFFED]:  { blocks: 10 },
  [HungerThreshold.SATIATED]: { blocks: 8  },
  [HungerThreshold.PECULIAR]: { blocks: 6  },
  [HungerThreshold.HANGRY]:   { blocks: 4  },
  [HungerThreshold.STARVING]: { blocks: 2  },
});

/**
 * Cores dos blocos por threshold — consumidas pela UI do Tampermonkey.
 */
const THRESHOLD_COLORS = Object.freeze({
  [HungerThreshold.STUFFED]:  { fill: "#3b82f6", bg: "#1e3a8a" }, // azul
  [HungerThreshold.SATIATED]: { fill: "#4ade80", bg: "#14532d" }, // verde
  [HungerThreshold.PECULIAR]: { fill: "#facc15", bg: "#713f12" }, // amarelo
  [HungerThreshold.HANGRY]:   { fill: "#fb923c", bg: "#7c2d12" }, // laranja
  [HungerThreshold.STARVING]: { fill: "#ef4444", bg: "#7f1d1d" }, // vermelho
});

/**
 * Tipos de refeição reconhecidos pelo sistema.
 */
const MealType = Object.freeze({
  NONE:       "none",
  SNACK:      "snack",       // pão, fruta, biscoito
  LIGHT_MEAL: "light_meal",  // sanduíche, salada
  FULL_MEAL:  "full_meal",   // almoço/jantar completo
  FEAST:      "feast",       // banquete, rodízio
  DRINK_ONLY: "drink_only",  // café, suco, água
});

/**
 * Peso de gravidade de cada marcador narrativo.
 * Vai de 0.0 (sem impacto) a 1.0 (impacto máximo dentro da faixa).
 * Usado pelo converter para posicionar DENTRO da faixa do threshold.
 */
const NARRATIVE_MARKER_WEIGHTS = Object.freeze({
  skipped_meal:       0.25,
  light_meal:         0.10,
  physical_activity:  0.20,  // Cansaço/exercício dispara fome (Evento Direto)
  emotional_stress:   0.10,
  time_skip:          0.30,  // Salto de cena longo sem refeição declarada
});


// ─────────────────────────────────────────────
//  SCENE BUFFER — o que viaja entre cenas
// ─────────────────────────────────────────────

/**
 * Cria um buffer de cena limpo.
 * Este é o contrato entre o middleware e o Flash.
 *
 * @param {Object} params
 * @param {string} params.threshold       — último threshold qualitativo conhecido
 * @param {string} params.lastMealType    — tipo da última refeição inferida pelo Gemini (MealType)
 * @param {string[]} params.markers       — marcadores de eventos/ações narrativas ativas
 * @returns {Readonly<Object>}
 */
function createSceneBuffer({
  threshold    = HungerThreshold.SATIATED,
  lastMealType = MealType.NONE,
  markers      = [],
} = {}) {
  return Object.freeze({
    threshold,
    lastMealType,
    markers: Object.freeze([...markers]),
  });
}


// ─────────────────────────────────────────────
//  FLASH PROMPT BUILDER — monta o pedido pro LLM
// ─────────────────────────────────────────────

/**
 * Serializa o buffer em formato compacto para o prompt do Flash.
 * Economia máxima de tokens. Uma linha, pipe-separated.
 *
 * Exemplo de saída:
 *   hunger: INTEREST | last_meal: snack | markers: physical_activity,time_skip
 *
 * @param {Object} buffer — SceneBuffer
 * @returns {string}
 */
function serializeBufferForFlash(buffer) {
  const parts = [
    `hunger: ${buffer.threshold}`,
    `last_meal: ${buffer.lastMealType}`,
  ];

  if (buffer.markers.length > 0) {
    parts.push(`markers: ${buffer.markers.join(",")}`);
  }

  return parts.join(" | ");
}

/**
 * Monta o system prompt parcial que instrui o Flash a avaliar hunger.
 * Retorna SOMENTE a seção hunger — integrar no prompt completo externamente.
 *
 * @param {Object} buffer — SceneBuffer
 * @returns {string}
 */
function buildFlashHungerPrompt(buffer) {
  const serialized = serializeBufferForFlash(buffer);

  return [
    `[HUNGER CHECK]`,
    serialized,
    ``,
    `Avalie o estado de fome do personagem com base no contexto acima.`,
    `Responda SOMENTE neste formato:`,
    `hunger: THRESHOLD | reason: explicação_curta`,
    ``,
    `Thresholds válidos: STUFFED, SATIATED, PECULIAR, HANGRY, STARVING`,
    `Regras (RPG Cinemático Baseado em Eventos):`,
    `- 'time_skip' com histórico de 'light_meal' ou 'snack' = HANGRY`,
    `- Ações de 'physical_activity' (treino, combate, fuga) exigem mais calorias, intensificam fome.`,
    `- Ignorar múltiplos 'time_skip' sucessivos sem refeição = STARVING`,
    `- Refeição completa ('FULL_MEAL') restaura para SATIATED.`,
    `- 'FEAST' (banquete) muda estado para STUFFED.`,
  ].join("\n");
}


// ─────────────────────────────────────────────
//  FLASH RESPONSE PARSER
// ─────────────────────────────────────────────

/**
 * Extrai threshold e reason da resposta do Flash.
 * Tolerante a variações de formatação.
 *
 * @param {string} flashResponse — resposta crua do Flash
 * @returns {{ threshold: string, reason: string } | null}
 */
function parseFlashResponse(flashResponse) {
  const cleaned = flashResponse.trim().replace(/\s+/g, " ");

  // Pattern: hunger: THRESHOLD | reason: texto
  const match = cleaned.match(
    /hunger:\s*(STUFFED|SATIATED|PECULIAR|HANGRY|STARVING)\s*\|\s*reason:\s*(.+)/i
  );

  if (!match) return null;

  const threshold = match[1].toUpperCase();

  if (!HungerThreshold[threshold]) return null;

  return {
    threshold,
    reason: match[2].trim(),
  };
}


// ─────────────────────────────────────────────
//  CONVERTER — qualitativo → numérico (para UI)
// ─────────────────────────────────────────────

/**
 * Calcula a perda visual de blocos baseada em marcadores narrativos,
 * garantindo que o `value` seja estritamente focado em blocos inteiros para o Front-End.
 *
 * @param {string} threshold — HungerThreshold válido
 * @param {string[]} markers — marcadores narrativos ativos
 * @returns {{ blocks: number, threshold: string, color: { fill: string, bg: string } }}
 */
function convertToBlocks(threshold, markers = []) {
  const baseData = THRESHOLD_BLOCKS[threshold];
  if (!baseData) {
    throw new Error(`Threshold inválido: ${threshold}`);
  }

  let totalBlocks = baseData.blocks;

  // Modificadores menores de cena reduzem temporariamente a exibição em 1 bloco
  // para dar feedback visual antes da mudança real qualitativa do Gemini.
  let hasStress = markers.some(m => NARRATIVE_MARKER_WEIGHTS[m] >= 0.15);

  if (hasStress) {
      totalBlocks = Math.max(0, totalBlocks - 1);
  }

  return {
    blocks: totalBlocks,
    threshold,
    color: THRESHOLD_COLORS[threshold],
  };
}


// ─────────────────────────────────────────────
//  DIRETRIZ NARRATIVA — o que o Kindroid recebe
// ─────────────────────────────────────────────

/**
 * Mapa de diretrizes por threshold.
 * Cada entrada é uma instrução direta para o system prompt do Kindroid.
 * Escrito em português — língua de trabalho do projeto.
 */
const NARRATIVE_DIRECTIVES = Object.freeze({
  [HungerThreshold.STUFFED]: {
    directive: "Empanturrado. O personagem acabou de comer além da conta. Recusa qualquer comida adicional. Pode estar levemente letárgico.",
    behavior_modifiers: ["recusa_comida", "letargia_leve"],
  },
  [HungerThreshold.SATIATED]: {
    directive: "Personagem saciado e satisfeito. Foque 100% na trama. Sem menções a comida.",
    behavior_modifiers: [],
  },
  [HungerThreshold.PECULIAR]: {
    directive: "Apetite levemente desperto. O personagem comenta sobre comida ou olha para pratos com curiosidade se passar perto de um, mas não altera os planos por isso.",
    behavior_modifiers: ["curiosidade_gastronômica"],
  },
  [HungerThreshold.HANGRY]: {
    directive: "Hangry. O personagem está faminto e irritadiço. Estômago ronca. Impaciência. Ele quer parar as atividades e buscar comida.",
    behavior_modifiers: ["irritabilidade", "impaciência", "sarcasmo"],
  },
  [HungerThreshold.STARVING]: {
    directive: "FOME CRÍTICA. A fome é prioridade absoluta. Personagem se recusa a fazer atividades pesadas. Tontura leve. O foco inteiro é comer.",
    behavior_modifiers: ["recusa_atividades", "fraqueza", "obsessão_comida", "cognição_reduzida"],
  },
});

/**
 * Gera o payload completo de hunger para injeção no Kindroid.
 * Este é o produto final do módulo — tudo que o bot precisa saber.
 *
 * @param {string} threshold — HungerThreshold válido
 * @returns {Readonly<{ threshold: string, directive: string, behavior_modifiers: string[] }>}
 */
function getNarrativePayload(threshold) {
  const entry = NARRATIVE_DIRECTIVES[threshold];
  if (!entry) {
    throw new Error(`Threshold inválido: ${threshold}`);
  }

  return Object.freeze({
    threshold,
    directive: entry.directive,
    behavior_modifiers: [...entry.behavior_modifiers],
  });
}


// ─────────────────────────────────────────────
//  UI PAYLOAD — o que o jogador vê
// ─────────────────────────────────────────────

/**
 * Gera o payload completo para renderização visual dos blocos na UI do Tampermonkey.
 * Os dados aqui (como os blocos) NUNCA devem ser vazados em texto para o Kindroid.
 *
 * @param {string} threshold
 * @param {string[]} markers
 * @returns {Readonly<{ blocks: number, threshold: string, color: { fill: string, bg: string }, label: string }>}
 */
function getUIPayload(threshold, markers = []) {
  const blocksData = convertToBlocks(threshold, markers);

  const labels = {
    [HungerThreshold.STUFFED]:  "Empanturrado",
    [HungerThreshold.SATIATED]: "Satisfeito",
    [HungerThreshold.PECULIAR]: "Apetite",
    [HungerThreshold.HANGRY]:   "Faminto",
    [HungerThreshold.STARVING]: "Passando mal",
  };

  return Object.freeze({
    ...blocksData,
    label: labels[threshold] || "Desconhecido",
  });
}


// ─────────────────────────────────────────────
//  PIPELINE COMPLETO — orquestra um checkpoint
// ─────────────────────────────────────────────

/**
 * Processa um checkpoint de cena completo (Micro-Inferência do Gemini Flash).
 *
 * Recebe o buffer anterior + a resposta qualitativa do Flash,
 * e retorna os novos estados para UI (Front-end) e Kindroid (Suggestion Injection).
 *
 * @param {Object} params
 * @param {Object} params.previousBuffer — buffer da cena anterior
 * @param {string} params.flashResponse  — resposta crua do Flash (ex: "hunger: HANGRY | reason: ...")
 * @returns {{ kindroid: Object, ui: Object, nextBuffer: Object } | { error: string }}
 */
function processSceneCheckpoint({ previousBuffer, flashResponse }) {
  // 1. Parseia a resposta do Flash
  const parsed = parseFlashResponse(flashResponse);
  if (!parsed) {
    return {
      error: "Flash retornou formato inválido. Resposta descartada, mantendo estado anterior.",
      kindroid: getNarrativePayload(previousBuffer.threshold),
      ui: getUIPayload(previousBuffer.threshold, previousBuffer.markers),
      nextBuffer: previousBuffer,
    };
  }

  // 2. Gera payloads atualizados
  const kindroid = getNarrativePayload(parsed.threshold);
  const ui = getUIPayload(parsed.threshold, previousBuffer.markers);

  // 3. Monta novo buffer mantendo o contexto mas assumindo o novo Threshold
  const nextBuffer = createSceneBuffer({
    threshold:    parsed.threshold,
    lastMealType: previousBuffer.lastMealType,
    markers:      previousBuffer.markers,
  });

  return { kindroid, ui, nextBuffer };
}

/**
 * Atualiza o buffer baseado num Evento (Ação de comer, dormir, exercício etc).
 * Quando acionado por comer, o Tampermonkey injeta o `mealType` pré-inferido pelo Gemini.
 *
 * @param {Object} currentBuffer — buffer atual
 * @param {string} mealType      — MealType inferido do evento consumido
 * @returns {Object} — novo buffer atualizado com feedback visual imediato
 */
function registerMealEvent(currentBuffer, mealType) {
  return createSceneBuffer({
    threshold:    inferPostMealThreshold(mealType, currentBuffer.threshold),
    lastMealType: mealType,
    markers:      currentBuffer.markers.filter(
      (m) => m !== "skipped_meal" && m !== "light_meal"
    ),
  });
}

/**
 * Registra marcadores de evento passivos (como `time_skip` ou `physical_activity`)
 * para impactar na gravidade da barra UI.
 */
function addEventMarker(currentBuffer, marker) {
  return createSceneBuffer({
    threshold: currentBuffer.threshold,
    lastMealType: currentBuffer.lastMealType,
    markers: [...currentBuffer.markers, marker],
  });
}


// ─────────────────────────────────────────────
//  HELPERS INTERNOS
// ─────────────────────────────────────────────

/**
 * Inferência local de threshold pós-refeição.
 * Usado como fallback imediato — o Flash confirma no próximo checkpoint.
 */
function inferPostMealThreshold(mealType, currentThreshold) {
  const recovery = {
    [MealType.FEAST]:      HungerThreshold.STUFFED,
    [MealType.FULL_MEAL]:  HungerThreshold.SATIATED,
    [MealType.LIGHT_MEAL]: HungerThreshold.PECULIAR,
    [MealType.SNACK]:      currentThreshold === HungerThreshold.STARVING
                              ? HungerThreshold.HANGRY
                              : HungerThreshold.PECULIAR,
    [MealType.DRINK_ONLY]: currentThreshold, // sem mudança
    [MealType.NONE]:       currentThreshold,
  };

  return recovery[mealType] || currentThreshold;
}


// ─────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────

module.exports = {
  // Enums
  HungerThreshold,
  MealType,

  // Buffer
  createSceneBuffer,

  // Flash communication
  serializeBufferForFlash,
  buildFlashHungerPrompt,
  parseFlashResponse,

  // Converter
  convertToBlocks,

  // Payloads
  getNarrativePayload,
  getUIPayload,

  // Pipeline
  processSceneCheckpoint,
  registerMealEvent,
  addEventMarker,

  // Config (read-only, para debug/testes)
  THRESHOLD_BLOCKS,
  THRESHOLD_COLORS,
  NARRATIVE_MARKER_WEIGHTS,
};
