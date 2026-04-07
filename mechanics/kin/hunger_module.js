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
 * Nenhum LLM jamais vê um número. Só estes quatro estados.
 */
const HungerThreshold = Object.freeze({
  SATIATED: "SATIATED",
  INTEREST: "INTEREST",
  HANGRY:   "HANGRY",
  CRITICAL: "CRITICAL",
});

/**
 * Faixas numéricas correspondentes a cada threshold.
 * Usadas SOMENTE pelo converter para gerar o valor da barra UI.
 * [min, max] — inclusivos.
 */
const THRESHOLD_RANGES = Object.freeze({
  [HungerThreshold.SATIATED]: { min: 0,  max: 20  },
  [HungerThreshold.INTEREST]: { min: 21, max: 45  },
  [HungerThreshold.HANGRY]:   { min: 46, max: 75  },
  [HungerThreshold.CRITICAL]: { min: 76, max: 100 },
});

/**
 * Cores da barra por threshold — consumidas pela UI.
 */
const THRESHOLD_COLORS = Object.freeze({
  [HungerThreshold.SATIATED]: { bar: "#4ade80", bg: "#14532d" }, // verde
  [HungerThreshold.INTEREST]: { bar: "#facc15", bg: "#713f12" }, // amarelo
  [HungerThreshold.HANGRY]:   { bar: "#fb923c", bg: "#7c2d12" }, // laranja
  [HungerThreshold.CRITICAL]: { bar: "#ef4444", bg: "#7f1d1d" }, // vermelho
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
    `Thresholds válidos: SATIATED, INTEREST, HANGRY, CRITICAL`,
    `Regras (RPG Cinemático Baseado em Eventos):`,
    `- 'time_skip' com histórico de 'light_meal' ou 'snack' = HANGRY`,
    `- Ações de 'physical_activity' (treino, combate, fuga) exigem mais calorias, intensificam fome.`,
    `- Ignorar múltiplos 'time_skip' sucessivos sem refeição = CRITICAL`,
    `- Refeição completa ('FULL_MEAL', 'FEAST') restaura para SATIATED.`,
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
    /hunger:\s*(SATIATED|INTEREST|HANGRY|CRITICAL)\s*\|\s*reason:\s*(.+)/i
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
 * Calcula a posição numérica DENTRO da faixa do threshold
 * usando os marcadores de eventos/ações narrativas como peso.
 *
 * Não é uma simulação de tempo, mas acúmulo de estresse de cena.
 *
 * @param {string} threshold — HungerThreshold válido
 * @param {string[]} markers — marcadores narrativos ativos
 * @returns {{ value: number, threshold: string, color: { bar: string, bg: string } }}
 */
function convertToNumeric(threshold, markers = []) {
  const range = THRESHOLD_RANGES[threshold];
  if (!range) {
    throw new Error(`Threshold inválido: ${threshold}`);
  }

  // Soma dos pesos dos marcadores ativos gerados por eventos
  let gravityScore = 0;

  for (const marker of markers) {
    const weight = NARRATIVE_MARKER_WEIGHTS[marker];
    if (weight !== undefined) {
      gravityScore += weight;
    }
  }

  // Clamp entre 0.0 e 1.0
  const position = Math.max(0, Math.min(1, gravityScore));

  // Interpola dentro da faixa
  const value = Math.round(range.min + position * (range.max - range.min));

  return {
    value,
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
  [HungerThreshold.SATIATED]: {
    directive: "Personagem saciado. Foque na trama. Sem menções a comida salvo se contextualmente relevante.",
    behavior_modifiers: [],
  },
  [HungerThreshold.INTEREST]: {
    directive: "Apetite desperto. Mencione cheiros de comida, vitrines de restaurante, ou desejo por pratos específicos de forma natural.",
    behavior_modifiers: ["curiosidade_gastronômica", "distração_leve"],
  },
  [HungerThreshold.HANGRY]: {
    directive: "Hangry. O personagem está irritadiço, impaciente, perde o foco facilmente. Estômago ronca em momentos inoportunos. Sarcasmo aumenta.",
    behavior_modifiers: ["irritabilidade", "impaciência", "sarcasmo", "foco_reduzido"],
  },
  [HungerThreshold.CRITICAL]: {
    directive: "FOME CRÍTICA. A fome é prioridade absoluta. O personagem recusa atividades complexas, está fraco, não consegue pensar direito. Qualquer menção a comida domina sua atenção completamente.",
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
 * Gera o payload completo para renderização da barra de fome na UI.
 *
 * @param {string} threshold
 * @param {string[]} markers
 * @returns {Readonly<{ value: number, threshold: string, color: { bar: string, bg: string }, label: string }>}
 */
function getUIPayload(threshold, markers = []) {
  const numeric = convertToNumeric(threshold, markers);

  const labels = {
    [HungerThreshold.SATIATED]: "Satisfeito",
    [HungerThreshold.INTEREST]: "Com apetite",
    [HungerThreshold.HANGRY]:   "Faminto",
    [HungerThreshold.CRITICAL]: "Passando mal",
  };

  return Object.freeze({
    ...numeric,
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
    [MealType.FEAST]:      HungerThreshold.SATIATED,
    [MealType.FULL_MEAL]:  HungerThreshold.SATIATED,
    [MealType.LIGHT_MEAL]: HungerThreshold.INTEREST,
    [MealType.SNACK]:      currentThreshold === HungerThreshold.CRITICAL
                              ? HungerThreshold.HANGRY
                              : HungerThreshold.INTEREST,
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
  convertToNumeric,

  // Payloads
  getNarrativePayload,
  getUIPayload,

  // Pipeline
  processSceneCheckpoint,
  registerMealEvent,
  addEventMarker,

  // Config (read-only, para debug/testes)
  THRESHOLD_RANGES,
  THRESHOLD_COLORS,
  NARRATIVE_MARKER_WEIGHTS,
};
