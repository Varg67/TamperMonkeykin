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
 * Modificadores de Cena / Cortes Cinemáticos (Buffs e Debuffs de Carisma Visual).
 * Pesos temporários que ajustam os blocos da UI para feedback imediato antes da inferência da API.
 * Valores Negativos: Limpam/Embelezam (Aumentam os blocos).
 * Valores Positivos: Sujam/Degradam (Reduzem os blocos).
 */
const SCENE_MARKERS = Object.freeze({
  // --- Buffs de Estética e Vestuário ---
  deep_cleaning:         -0.60, // Banho demorado, spa, limpeza mágica pesada
  makeup_and_grooming:   -0.30, // Retocar maquiagem, fazer a barba, pentear o cabelo, perfume
  elegant_outfit:        -0.40, // Terno, vestido de gala, armadura polida cerimonial
  clean_casual_clothes:  -0.20, // Trocar para roupas limpas do dia a dia

  // --- Buffs de Postura e Atmosfera ---
  flattering_lighting:   -0.15, // Luz de velas, golden hour, neon suave (Buff visual temporário)
  confident_posture:     -0.10, // Sorriso aberto, pose de poder, caminhar elegante

  // --- Debuffs Ambientais e de Combate ---
  light_weather:          0.10, // Vento forte (cabelo bagunçado), garoa leve, poeira de rua
  harsh_weather:          0.25, // Chuva torrencial (roupa encharcada), tempestade de areia
  combat_sweat:           0.20, // Suor de treino, escoriações leves de combate
  mud_blood_gore:         0.45, // Lama espessa, manchas de sangue (próprio ou inimigo), esgoto

  // --- Debuffs Sociais, Vestuário e Fisiológicos ---
  wardrobe_malfunction:   0.20, // Roupa rasgada, salto quebrado, mancha de vinho derramado
  inappropriate_attire:   0.30, // Vestido de gala no esgoto ou farrapos em um baile real (Quebra de Contexto)
  crying_distress:        0.15, // Choro (olhos inchados/vermelhos), maquiagem borrada
  poor_posture:           0.10, // Encurvado, mancando de dor, tremores (perda de pose/carisma)

  // --- Debuff Passivo (Tempo) ---
  time_skip_long:         0.15, // Viagem de dias, acúmulo de sujeira natural sem higiene declarada
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
    `Regras de Roteiro Cinemático (Aparência, Moda e Postura):`,
    `- Banho, grooming ('makeup_and_grooming') e roupas elegantes ('elegant_outfit') restauram ou elevam o status para 'PRESENTABLE' ou 'GLAMOROUS'.`,
    `- Avalie o CONTEXTO: Roupas rasgadas, inadequadas para a ocasião social ('inappropriate_attire') ou maquiagem borrada por choro forçam uma degradação social (mínimo 'MESSY').`,
    `- Esforço pesado, suor de combate ('combat_sweat') ou clima adverso degradam para 'MESSY' ou 'DIRTY'.`,
    `- Exposição a esgoto, lixo ou sangue excessivo ('mud_blood_gore') força o estado 'DISGUSTING'.`,
    `- Postura confiante ou iluminação cinematográfica ('flattering_lighting') podem mascarar sujeiras leves, mas não ocultam sujeira pesada.`,
    `- Sem declaração de banho em saltos longos de tempo ('time_skip_long'), a aparência degrada naturalmente.`
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

  // Calcula a soma algébrica dos marcadores para dar o feedback dramático instantâneo
  let visualShift = 0;
  for (const marker of markers) {
    const weight = SCENE_MARKERS[marker];
    if (weight !== undefined) {
      visualShift += weight;
    }
  }

  // Translada o "peso visual" em variação de blocos (Aproximação: cada 0.10 vale ~1 bloco visual)
  const blockModifier = Math.round(visualShift * 10);

  // Como os Buffs têm peso negativo (reduzem a "sujeira"), subtrair o visualShift soma blocos
  // Como os Debuffs têm peso positivo, eles removem blocos.
  totalBlocks = Math.max(0, Math.min(10, totalBlocks - blockModifier));

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
