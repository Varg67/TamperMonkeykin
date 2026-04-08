/**
 * ═══════════════════════════════════════════════════════════════
 *  PASO ROBLES RPG ENGINE — REPUTATION MODULE v1.0
 * ═══════════════════════════════════════════════════════════════
 *  Arquitetura: Scene-Checkpoint + Inferência Qualitativa (Mundana)
 *
 *  A Reputação é o "Efeito Halo" ou a "Sombra" do personagem
 *  perante a comunidade/cidade. Define como estranhos o tratam
 *  (o Pre-Bias de Confiança Inicial).
 *
 *  Estados (0 a 10 blocos): INFLUENTIAL, RESPECTED, ANONYMOUS, GOSSIPED, OUTCAST.
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────
//  TIPOS E CONSTANTES (A ESCALA SOCIAL)
// ─────────────────────────────────────────────

const ReputationThreshold = Object.freeze({
  INFLUENTIAL: "INFLUENTIAL", // VIP Local. Ouve favores, abre portas.
  RESPECTED:   "RESPECTED",   // Trabalhador honesto, boa pessoa.
  ANONYMOUS:   "ANONYMOUS",   // Neutro. Rosto na multidão.
  GOSSIPED:    "GOSSIPED",    // Fofocas ruins, desconfiança leve da comunidade.
  OUTCAST:     "OUTCAST",     // Pária social, cancelado, rejeitado ativamente.
});

const THRESHOLD_BLOCKS = Object.freeze({
  [ReputationThreshold.INFLUENTIAL]: { blocks: 10 },
  [ReputationThreshold.RESPECTED]:   { blocks: 8  },
  [ReputationThreshold.ANONYMOUS]:   { blocks: 5  }, // Meio termo exato
  [ReputationThreshold.GOSSIPED]:    { blocks: 3  },
  [ReputationThreshold.OUTCAST]:     { blocks: 1  },
});

const THRESHOLD_COLORS = Object.freeze({
  [ReputationThreshold.INFLUENTIAL]: { fill: "#a855f7", bg: "#4c1d95" }, // Roxo (Prestígio)
  [ReputationThreshold.RESPECTED]:   { fill: "#3b82f6", bg: "#1e3a8a" }, // Azul (Honradez)
  [ReputationThreshold.ANONYMOUS]:   { fill: "#9ca3af", bg: "#374151" }, // Cinza (Neutro)
  [ReputationThreshold.GOSSIPED]:    { fill: "#facc15", bg: "#713f12" }, // Amarelo (Aviso)
  [ReputationThreshold.OUTCAST]:     { fill: "#ef4444", bg: "#7f1d1d" }, // Vermelho (Rejeição)
});

/**
 * Modificadores de Cena Social (Buffs e Debuffs).
 * Eventos públicos que chegam aos ouvidos da cidade.
 * Positivos somam blocos, Negativos subtraem blocos na UI imediatamente.
 */
const SCENE_MARKERS = Object.freeze({
  // --- Buffs Sociais ---
  heroic_charity:    0.50, // Salvar a empresa, doar muito dinheiro, ato heróico na rua
  hard_worker:       0.20, // Elogio do chefe, bater meta pública, ser promovido
  networking_charm:  0.15, // Ser o centro das atenções em uma festa, fazer contatos

  // --- Debuffs Sociais ---
  public_scene:     -0.30, // Brigar bêbado no bar, gritar com garçom (karen)
  caught_cheating:  -0.50, // Traição conjugal vazar, pego roubando no trabalho
  fired_for_cause:  -0.40, // Demissão vergonhosa espalhada pela cidade
  rude_behavior:    -0.15, // Ser rude com vizinhos, não pagar conta (calote local)
});

// ─────────────────────────────────────────────
//  SCENE BUFFER
// ─────────────────────────────────────────────

function createReputationBuffer({
  threshold = ReputationThreshold.ANONYMOUS,
  markers   = [],
  cross_buff = null, // Ex: "opulent_wealth" do módulo de Dinheiro
} = {}) {
  return Object.freeze({
    threshold,
    cross_buff,
    markers: Object.freeze([...markers]),
  });
}

// ─────────────────────────────────────────────
//  FLASH PROMPT BUILDER
// ─────────────────────────────────────────────

function serializeBufferForFlash(buffer) {
  const parts = [`reputation: ${buffer.threshold}`];
  if (buffer.cross_buff) parts.push(`passive_influence: ${buffer.cross_buff}`);
  if (buffer.markers.length > 0) parts.push(`public_events: ${buffer.markers.join(",")}`);
  return parts.join(" | ");
}

/**
 * Instruções para o Gemini julgar como a cidade enxerga o personagem.
 */
function buildFlashReputationPrompt(buffer) {
  const serialized = serializeBufferForFlash(buffer);

  return [
    `[REPUTATION CHECK - SOCIAL STANDING]`,
    serialized,
    ``,
    `Avalie o prestígio público e a fama/infâmia do personagem perante a comunidade (colegas, vizinhos, cidade).`,
    `A Reputação muda LENTAMENTE, a menos que haja um escândalo ou ato heróico público. Cenas privadas (entre 4 paredes) NÃO afetam reputação.`,
    `Responda SOMENTE neste formato:`,
    `reputation: THRESHOLD | reason: explicação_curta`,
    ``,
    `Thresholds válidos: INFLUENTIAL, RESPECTED, ANONYMOUS, GOSSIPED, OUTCAST`,
    `Regras de Roteiro Social:`,
    `- 'caught_cheating' ou 'public_scene' (escândalos) geram fofocas imediatas, caindo a reputação para 'GOSSIPED' ou 'OUTCAST'.`,
    `- 'hard_worker' consistente ou 'networking' ajudam a subir para 'RESPECTED'.`,
    `- Dinheiro visível ('opulent_wealth') cria respeito artificial, amortecendo a queda para 'GOSSIPED', mas não perdoa crimes graves.`,
    `- Para ser 'INFLUENTIAL', o personagem deve ter salvo o dia publicamente ou ser uma figura de autoridade inquestionável na trama.`,
    `- Se as ações ruins não tiveram testemunhas, o status se mantém INTACTO.`
  ].join("\n");
}

function parseFlashResponse(flashResponse) {
  const cleaned = flashResponse.trim().replace(/\s+/g, " ");
  const match = cleaned.match(
    /reputation:\s*(INFLUENTIAL|RESPECTED|ANONYMOUS|GOSSIPED|OUTCAST)\s*\|\s*reason:\s*(.+)/i
  );
  if (!match) return null;

  const threshold = match[1].toUpperCase();
  if (!ReputationThreshold[threshold]) return null;

  return { threshold, reason: match[2].trim() };
}

// ─────────────────────────────────────────────
//  FRONT-END CONVERTER (UI)
// ─────────────────────────────────────────────

function convertToBlocks(threshold, markers = [], cross_buff = null) {
  const baseData = THRESHOLD_BLOCKS[threshold];
  if (!baseData) throw new Error(`Threshold inválido: ${threshold}`);

  let totalBlocks = baseData.blocks;

  // Impacto visual instantâneo do escândalo ou elogio
  let socialShift = 0;
  for (const marker of markers) {
    const weight = SCENE_MARKERS[marker];
    if (weight !== undefined) socialShift += weight;
  }

  // Riqueza atua como "blindagem social" leve contra fofocas pequenas
  if (cross_buff === "opulent_wealth") socialShift += 0.10;

  const blockModifier = Math.round(socialShift * 10);

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
    [ReputationThreshold.INFLUENTIAL]: "Influente (VIP)",
    [ReputationThreshold.RESPECTED]:   "Respeitado",
    [ReputationThreshold.ANONYMOUS]:   "Anônimo",
    [ReputationThreshold.GOSSIPED]:    "Alvo de Fofocas",
    [ReputationThreshold.OUTCAST]:     "Pária Social",
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
  [ReputationThreshold.INFLUENTIAL]: {
    directive: "Sua reputação o precede. As pessoas o tratam como um VIP ou autoridade local. Portas se abrem com facilidade, favores são feitos sorrindo.",
    behavior_modifiers: ["privilegiado", "tratamento_vip", "poder_social"],
  },
  [ReputationThreshold.RESPECTED]: {
    directive: "Você é conhecido como um cidadão de bem e honesto. As pessoas confiam naturalmente em você e são polidas no trato diário.",
    behavior_modifiers: ["confiabilidade_base_alta", "bom_cidadão"],
  },
  [ReputationThreshold.ANONYMOUS]: {
    directive: "Você é apenas mais um rosto na multidão. Desconhecidos não têm nenhuma opinião formada sobre você.",
    behavior_modifiers: [],
  },
  [ReputationThreshold.GOSSIPED]: {
    directive: "Há fofocas ruins sobre você correndo a cidade. As pessoas sussurram quando você passa, os olhares são de julgamento. Comerciantes são frios.",
    behavior_modifiers: ["julgamento_social_leve", "desconfiança_base"],
  },
  [ReputationThreshold.OUTCAST]: {
    directive: "Você é um pária. Um 'cancelado' ou escória local. Ninguém respeitável quer ser visto falando com você. Pessoas atravessam a rua para te evitar ou o ofendem abertamente.",
    behavior_modifiers: ["rejeição_hostil", "isolamento_social_forçado"],
  },
});

function getNarrativePayload(threshold) {
  const entry = NARRATIVE_DIRECTIVES[threshold];
  if (!entry) throw new Error(`Threshold inválido: ${threshold}`);
  return Object.freeze({
    threshold,
    directive: `[Status Público: ${entry.directive}]`,
    behavior_modifiers: [...entry.behavior_modifiers],
  });
}

// ─────────────────────────────────────────────
//  CROSS-CONTAMINATION — Efeito Dominó Global
// ─────────────────────────────────────────────

/**
 * Reputação dita o "Pre-Bias" de Confiança (Trust) para NOVOS NPCs.
 * Se você for Outcast, a pessoa já começa Paranoid ou Suspicious.
 */
function getGlobalModifiers(threshold) {
  const modifiers = {
    [ReputationThreshold.INFLUENTIAL]: { trust_pre_bias: "TRUSTING",   mood_buff: "proud" },
    [ReputationThreshold.RESPECTED]:   { trust_pre_bias: "NEUTRAL",    mood_buff: "content" },
    [ReputationThreshold.ANONYMOUS]:   { trust_pre_bias: "NEUTRAL",    mood_buff: null },
    [ReputationThreshold.GOSSIPED]:    { trust_pre_bias: "SUSPICIOUS", mood_buff: "anxious_ashamed" },
    [ReputationThreshold.OUTCAST]:     { trust_pre_bias: "PARANOID",   mood_buff: "humiliated_angry", appearance_debuff: "shabby" }, // Difícil manter a pose quando a cidade te odeia
  };
  return Object.freeze(modifiers[threshold] || modifiers[ReputationThreshold.ANONYMOUS]);
}

// ─────────────────────────────────────────────
//  PIPELINE & EVENTOS
// ─────────────────────────────────────────────

function processSceneCheckpoint({ previousBuffer, flashResponse }) {
  const parsed = parseFlashResponse(flashResponse);
  if (!parsed) {
    return {
      error: "Flash retornou formato inválido. Resposta descartada.",
      kindroid: getNarrativePayload(previousBuffer.threshold),
      ui: getUIPayload(previousBuffer.threshold, previousBuffer.markers, previousBuffer.cross_buff),
      nextBuffer: previousBuffer,
    };
  }

  const kindroid = getNarrativePayload(parsed.threshold);
  const ui = getUIPayload(parsed.threshold, previousBuffer.markers, previousBuffer.cross_buff);

  const nextBuffer = createReputationBuffer({
    threshold:  parsed.threshold,
    cross_buff: previousBuffer.cross_buff,
    markers:    [], // Reseta escândalos passados da transição visual
  });

  return { kindroid, ui, nextBuffer };
}

function addSceneMarker(currentBuffer, marker) {
  return createReputationBuffer({
    threshold: currentBuffer.threshold,
    cross_buff: currentBuffer.cross_buff,
    markers: [...currentBuffer.markers, marker],
  });
}

// ─────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────
module.exports = {
  ReputationThreshold,
  createReputationBuffer,
  serializeBufferForFlash,
  buildFlashReputationPrompt,
  parseFlashResponse,
  convertToBlocks,
  getNarrativePayload,
  getUIPayload,
  getGlobalModifiers,
  processSceneCheckpoint,
  addSceneMarker,
  THRESHOLD_BLOCKS,
};
