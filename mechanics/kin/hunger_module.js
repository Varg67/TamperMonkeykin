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
  skipped_breakfast:  0.15,
  skipped_lunch:      0.25,
  skipped_dinner:     0.25,
  light_breakfast:    0.10,
  light_lunch:        0.10,
  hours_since_meal:   0.05,  // multiplicado pelas horas
  physical_activity:  0.15,
  emotional_stress:   0.10,
  fast_metabolism:    0.10,
  slow_metabolism:   -0.08,
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
 * @param {string} params.lastMealType    — tipo da última refeição (MealType)
 * @param {string} params.lastMealTime    — hora narrativa da última refeição ("7h", "13h")
 * @param {string} params.currentTime     — hora narrativa da cena atual
 * @param {string[]} params.missedMeals   — refeições puladas desde o último checkpoint
 * @param {string[]} params.markers       — marcadores narrativos ativos
 * @returns {Readonly<Object>}
 */
function createSceneBuffer({
  threshold    = HungerThreshold.SATIATED,
  lastMealType = MealType.NONE,
  lastMealTime = "0h",
  currentTime  = "0h",
  missedMeals  = [],
  markers      = [],
} = {}) {
  return Object.freeze({
    threshold,
    lastMealType,
    lastMealTime,
    currentTime,
    missedMeals: Object.freeze([...missedMeals]),
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
 *   hunger: INTEREST | last_meal: snack(7h) | now: 15h | missed: lunch | markers: light_breakfast,hours_since_meal
 *
 * @param {Object} buffer — SceneBuffer
 * @returns {string}
 */
function serializeBufferForFlash(buffer) {
  const parts = [
    `hunger: ${buffer.threshold}`,
    `last_meal: ${buffer.lastMealType}(${buffer.lastMealTime})`,
    `now: ${buffer.currentTime}`,
  ];

  if (buffer.missedMeals.length > 0) {
    parts.push(`missed: ${buffer.missedMeals.join(",")}`);
  }

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
    `Regras:`,
    `- Café da manhã leve + almoço pulado após 6h = mínimo HANGRY`,
    `- Refeição completa recente (< 2h) = SATIATED`,
    `- Sem comer há 8h+ = CRITICAL`,
    `- Estresse emocional intensifica a fome em um nível`,
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
 * usando os marcadores narrativos como peso.
 *
 * Não é uma simulação — é uma tradução visual.
 * O threshold já é a verdade. O número é só cosmético.
 *
 * @param {string} threshold — HungerThreshold válido
 * @param {string[]} markers — marcadores narrativos ativos
 * @param {number} hoursSinceMeal — horas narrativas desde última refeição
 * @returns {{ value: number, threshold: string, color: { bar: string, bg: string } }}
 */
function convertToNumeric(threshold, markers = [], hoursSinceMeal = 0) {
  const range = THRESHOLD_RANGES[threshold];
  if (!range) {
    throw new Error(`Threshold inválido: ${threshold}`);
  }

  // Soma dos pesos dos marcadores ativos
  let gravityScore = 0;

  for (const marker of markers) {
    const weight = NARRATIVE_MARKER_WEIGHTS[marker];
    if (weight !== undefined) {
      gravityScore += weight;
    }
  }

  // Peso temporal: horas * peso por hora
  gravityScore += hoursSinceMeal * (NARRATIVE_MARKER_WEIGHTS.hours_since_meal || 0);

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
 * @param {number} hoursSinceMeal
 * @returns {Readonly<{ value: number, threshold: string, color: { bar: string, bg: string }, label: string }>}
 */
function getUIPayload(threshold, markers = [], hoursSinceMeal = 0) {
  const numeric = convertToNumeric(threshold, markers, hoursSinceMeal);

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
 * Processa um checkpoint de cena completo.
 *
 * Recebe o buffer da cena anterior + a resposta do Flash,
 * e retorna tudo que cada sistema precisa:
 *   - payload para o Kindroid (diretriz narrativa)
 *   - payload para a UI (barra numérica + cor)
 *   - novo buffer para a próxima cena
 *
 * @param {Object} params
 * @param {Object} params.previousBuffer — buffer da cena anterior
 * @param {string} params.flashResponse  — resposta crua do Flash
 * @param {string} params.newTime        — hora narrativa da nova cena
 * @returns {{ kindroid: Object, ui: Object, nextBuffer: Object } | { error: string }}
 */
function processSceneCheckpoint({ previousBuffer, flashResponse, newTime }) {
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

  // 2. Calcula horas narrativas desde última refeição
  const hoursSinceMeal = parseNarrativeHours(previousBuffer.lastMealTime, newTime);

  // 3. Gera payloads
  const kindroid = getNarrativePayload(parsed.threshold);
  const ui = getUIPayload(parsed.threshold, previousBuffer.markers, hoursSinceMeal);

  // 4. Monta novo buffer para a próxima cena
  const nextBuffer = createSceneBuffer({
    threshold:    parsed.threshold,
    lastMealType: previousBuffer.lastMealType,
    lastMealTime: previousBuffer.lastMealTime,
    currentTime:  newTime,
    missedMeals:  previousBuffer.missedMeals,
    markers:      previousBuffer.markers,
  });

  return { kindroid, ui, nextBuffer };
}

/**
 * Atualiza o buffer quando o personagem come.
 * Chamado DENTRO de uma cena, não entre cenas.
 *
 * @param {Object} currentBuffer — buffer atual
 * @param {string} mealType      — MealType consumido
 * @param {string} mealTime      — hora narrativa da refeição
 * @returns {Object} — novo buffer atualizado
 */
function registerMeal(currentBuffer, mealType, mealTime) {
  return createSceneBuffer({
    threshold:    inferPostMealThreshold(mealType, currentBuffer.threshold),
    lastMealType: mealType,
    lastMealTime: mealTime,
    currentTime:  currentBuffer.currentTime,
    missedMeals:  [], // refeição reseta missed meals
    markers:      currentBuffer.markers.filter(
      (m) => !m.startsWith("skipped_") && !m.startsWith("light_")
    ),
  });
}


// ─────────────────────────────────────────────
//  HELPERS INTERNOS
// ─────────────────────────────────────────────

/**
 * Extrai horas narrativas de strings como "7h", "15h", "23h30".
 * Retorna a diferença em horas (float).
 */
function parseNarrativeHours(fromTime, toTime) {
  const parse = (t) => {
    const match = t.match(/(\d+)h?(\d*)/);
    if (!match) return 0;
    const hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    return hours + minutes / 60;
  };

  let diff = parse(toTime) - parse(fromTime);

  // Se negativo, cruzou meia-noite
  if (diff < 0) diff += 24;

  return diff;
}

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
  registerMeal,

  // Config (read-only, para debug/testes)
  THRESHOLD_RANGES,
  THRESHOLD_COLORS,
  NARRATIVE_MARKER_WEIGHTS,
};
