/**
 * ═══════════════════════════════════════════════════════════════
 *  PASO ROBLES RPG ENGINE — LOVE MODULE v1.0
 * ═══════════════════════════════════════════════════════════════
 *  Arquitetura: Scene-Checkpoint + Inferência Qualitativa Dupla
 *
 *  O Amor é o status relacional mais complexo:
 *  É Vetorial (targetName), Tem um Sabor/Tipo (Filosofia Grega)
 *  e possui um Grau de Intensidade (Intensity).
 *
 *  O Gemini avaliará os dois eixos simultaneamente.
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────
//  TIPOS E CONSTANTES (A MATRIZ DO AMOR GREGO)
// ─────────────────────────────────────────────

/**
 * O Sabor/Tipo do vínculo (Como o amor se expressa).
 * Estes não são graus numéricos, são arquétipos narrativos puros.
 */
const LoveType = Object.freeze({
  NONE:   "NONE",   // Ausência de amor
  AGAPE:  "AGAPE",  // Amor incondicional, sacrifício (Ato supremo, heróis)
  EROS:   "EROS",   // Amor romântico, atração carnal, paixão ardente
  PHILIA: "PHILIA", // Amizade profunda, camaradagem de irmãos de armas
  LUDUS:  "LUDUS",  // Amor flertante, paixão adolescente, sem compromisso
  PRAGMA: "PRAGMA", // Amor prático, casamentos arranjados, conveniência
  MANIA:  "MANIA",  // Amor obsessivo, ciúmes tóxico, dependência
  STORGE: "STORGE", // Amor familiar, zelo protetor, instinto parental
});

/**
 * A Intensidade do vínculo. Mapeado para os nossos 10 Blocos UI.
 */
const LoveIntensity = Object.freeze({
  CONSUMING: "CONSUMING", // [10-9] Domina os pensamentos
  PROFOUND:  "PROFOUND",  // [8-7]  Sólido e inabalável
  GROWING:   "GROWING",   // [6-5]  Desenvolvendo-se ativamente
  FLEETING:  "FLEETING",  // [4-3]  Fugaz, momentâneo, superficial
  FADING:    "FADING",    // [2-1]  Morrendo, restam apenas cinzas
  EMPTY:     "EMPTY",     // [0]    Zero
});

const INTENSITY_BLOCKS = Object.freeze({
  [LoveIntensity.CONSUMING]: { blocks: 10 },
  [LoveIntensity.PROFOUND]:  { blocks: 8  },
  [LoveIntensity.GROWING]:   { blocks: 6  },
  [LoveIntensity.FLEETING]:  { blocks: 4  },
  [LoveIntensity.FADING]:    { blocks: 2  },
  [LoveIntensity.EMPTY]:     { blocks: 0  },
});

/**
 * A cor da barra na UI muda dependendo do TIPO de Amor (Sabor grego).
 * O preenchimento da barra depende da INTENSIDADE.
 */
const TYPE_COLORS = Object.freeze({
  [LoveType.NONE]:   { fill: "#9ca3af", bg: "#374151" }, // Cinza nulo
  [LoveType.AGAPE]:  { fill: "#facc15", bg: "#713f12" }, // Dourado radiante
  [LoveType.EROS]:   { fill: "#ec4899", bg: "#701a75" }, // Rosa/Magenta vibrante
  [LoveType.PHILIA]: { fill: "#3b82f6", bg: "#1e3a8a" }, // Azul leal
  [LoveType.LUDUS]:  { fill: "#f472b6", bg: "#831843" }, // Rosa chiclete/claro
  [LoveType.PRAGMA]: { fill: "#10b981", bg: "#064e3b" }, // Verde esmeralda (estabilidade)
  [LoveType.MANIA]:  { fill: "#ef4444", bg: "#7f1d1d" }, // Vermelho agressivo
  [LoveType.STORGE]: { fill: "#f97316", bg: "#7c2d12" }, // Laranja cálido
});

/**
 * Modificadores de Cena / Ações Afetivas.
 * Positivos fortalecem o vínculo (somam blocos).
 * Negativos esfriam ou destroem o vínculo (removem blocos).
 */
const SCENE_MARKERS = Object.freeze({
  // --- Buffs de Vínculo ---
  deep_conversation:  0.25, // Desabafo íntimo, revelar segredos dolorosos
  physical_intimacy:  0.40, // Toque prolongado, dormir junto, beijo, sexo
  sacrificial_act:    0.60, // Levar um golpe pelo outro, dar o último pão
  flirting_banter:    0.15, // Piadinhas, provocações, rir juntos

  // --- Debuffs Afetivos ---
  neglect_ignore:    -0.15, // Ignorar ativamente o outro, frieza prolongada
  harsh_rejection:   -0.40, // Rejeição amorosa explícita, "Não gosto de você"
  betrayal_trust:    -0.70, // Mentira descoberta, traição (Pode mudar AGAPE para FADING)
  jealous_outburst:  -0.20, // Ataque de ciúmes (Pode buffar MANIA, mas debuffa EROS saudável)
});

// ─────────────────────────────────────────────
//  SCENE BUFFER (DIRECIONAL DUPLO)
// ─────────────────────────────────────────────

function createLoveBuffer({
  targetName = "Unknown",
  loveType   = LoveType.NONE,
  intensity  = LoveIntensity.EMPTY,
  markers    = [],
  cross_buff = null, // Ex: "open_heart" da Confiança DEVOTED
} = {}) {
  return Object.freeze({
    targetName,
    loveType,
    intensity,
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
    `current_type: ${buffer.loveType}`,
    `current_intensity: ${buffer.intensity}`
  ];
  if (buffer.cross_buff) parts.push(`passive_influence: ${buffer.cross_buff}`);
  if (buffer.markers.length > 0) parts.push(`recent_actions: ${buffer.markers.join(",")}`);
  return parts.join(" | ");
}

/**
 * Instruções para o Gemini avaliar o "Sabor" e o "Grau" do Amor na cena.
 */
function buildFlashLovePrompt(buffer) {
  const serialized = serializeBufferForFlash(buffer);

  return [
    `[LOVE/AFFECTION CHECK - DUAL INFERENCE]`,
    serialized,
    ``,
    `Avalie o tipo e o grau do afeto do personagem em relação ao ALVO ('target') com base nas interações da cena.`,
    `Responda SOMENTE neste formato:`,
    `type: LOVE_TYPE | intensity: INTENSITY | reason: explicação_curta`,
    ``,
    `Tipos Válidos (Sabor): AGAPE (Sacrifício), EROS (Romance/Paixão), PHILIA (Amizade Profunda), LUDUS (Flertante), PRAGMA (Prático), MANIA (Obsessivo/Tóxico), STORGE (Familiar/Protetor), NONE.`,
    `Intensidades Válidas (Grau): CONSUMING, PROFOUND, GROWING, FLEETING, FADING, EMPTY.`,
    ``,
    `Regras de Roteiro Afetivo:`,
    `- O Amor NUNCA salta do zero para CONSUMING EROS em uma cena. O desenvolvimento exige 'GROWING' via 'deep_conversation' ou 'LUDUS' prévio.`,
    `- 'physical_intimacy' fortalece o EROS ou LUDUS (intensidade sobe).`,
    `- 'harsh_rejection' ou 'betrayal_trust' esfria intensamente o amor (muda para 'FADING').`,
    `- O 'passive_influence' de uma Confiança alta (open_heart) facilita a criação de PHILIA ou EROS genuínos.`,
    `- Ataques de ciúmes sem justificativa podem alterar o tipo de amor saudável para 'MANIA'.`,
    `- Se a cena for banal, mantenha o tipo e intensidade atuais.`
  ].join("\n");
}

function parseFlashResponse(flashResponse) {
  const cleaned = flashResponse.trim().replace(/\s+/g, " ");
  const match = cleaned.match(
    /type:\s*(NONE|AGAPE|EROS|PHILIA|LUDUS|PRAGMA|MANIA|STORGE)\s*\|\s*intensity:\s*(CONSUMING|PROFOUND|GROWING|FLEETING|FADING|EMPTY)\s*\|\s*reason:\s*(.+)/i
  );
  if (!match) return null;

  const loveType = match[1].toUpperCase();
  const intensity = match[2].toUpperCase();

  if (!LoveType[loveType] || !LoveIntensity[intensity]) return null;

  return { loveType, intensity, reason: match[3].trim() };
}

// ─────────────────────────────────────────────
//  FRONT-END CONVERTER (UI)
// ─────────────────────────────────────────────

function convertToBlocks(intensity, loveType, markers = [], cross_buff = null) {
  const baseData = INTENSITY_BLOCKS[intensity];
  if (!baseData) throw new Error(`Intensidade inválida: ${intensity}`);

  let totalBlocks = baseData.blocks;

  // Feedback emocional instantâneo na UI
  let emotionShift = 0;
  for (const marker of markers) {
    const weight = SCENE_MARKERS[marker];
    if (weight !== undefined) emotionShift += weight;
  }

  // Facilitação passiva se o alvo for confiável
  if (cross_buff === "open_heart") emotionShift += 0.15;

  const blockModifier = Math.round(emotionShift * 10);

  // Amor é contido entre 0 e 10 blocos visuais
  totalBlocks = Math.max(0, Math.min(10, totalBlocks + blockModifier));

  return {
    blocks: totalBlocks,
    intensity,
    loveType,
    color: TYPE_COLORS[loveType] || TYPE_COLORS[LoveType.NONE],
  };
}

function getUIPayload(intensity, loveType, markers = [], cross_buff = null) {
  const blocksData = convertToBlocks(intensity, loveType, markers, cross_buff);
  const typeLabels = {
    [LoveType.NONE]:   "Neutro",
    [LoveType.AGAPE]:  "Amor Incondicional",
    [LoveType.EROS]:   "Paixão (Eros)",
    [LoveType.PHILIA]: "Camaradagem (Philia)",
    [LoveType.LUDUS]:  "Flertante (Ludus)",
    [LoveType.PRAGMA]: "Conveniência (Pragma)",
    [LoveType.MANIA]:  "Obsessão (Mania)",
    [LoveType.STORGE]: "Protetor (Storge)",
  };
  const intensityLabels = {
    [LoveIntensity.CONSUMING]: "Consumidor",
    [LoveIntensity.PROFOUND]:  "Profundo",
    [LoveIntensity.GROWING]:   "Crescente",
    [LoveIntensity.FLEETING]:  "Fugaz",
    [LoveIntensity.FADING]:    "Desvanecendo",
    [LoveIntensity.EMPTY]:     "Vazio",
  };

  return Object.freeze({
    ...blocksData,
    label: `${typeLabels[loveType]} - ${intensityLabels[intensity]}`,
  });
}

// ─────────────────────────────────────────────
//  DIRETRIZES DO KINDROID (SUGGESTION INJECTION)
// ─────────────────────────────────────────────

/**
 * A diretiva para o Kindroid mistura o Sabor (Tipo) e a Força (Intensidade).
 * É uma injeção dramática profunda. O "TargetName" é obrigatório no payload final.
 */
const BASE_TYPE_DIRECTIVES = Object.freeze({
  [LoveType.NONE]:   "Você não possui sentimentos especiais por esta pessoa. Interação pautada pelo resto do contexto.",
  [LoveType.AGAPE]:  "Você daria sua vida por esta pessoa. O bem-estar dela vem antes do seu. Amor puro e altruísta.",
  [LoveType.EROS]:   "Atração romântica e física pulsante. Desejo constante de estar perto, tocar e flertar. Paixão de filme.",
  [LoveType.PHILIA]: "Lealdade de irmãos de trincheira. Você adora a companhia dessa pessoa, protege-a como família, sem atração física.",
  [LoveType.LUDUS]:  "Você encara essa relação como um jogo divertido. Muito flerte, piadas de duplo sentido, mas sem pensar em casar ou se sacrificar.",
  [LoveType.PRAGMA]: "Você se importa com essa pessoa por conveniência, parceria de negócios ou arranjo familiar. Respeito prático, mas frio.",
  [LoveType.MANIA]:  "Obsessão perigosa. Você sente ciúmes de qualquer um que fale com ela. Medo constante de abandono. Exige atenção exclusiva.",
  [LoveType.STORGE]: "Você sente uma necessidade parental ou fraterna de proteger essa pessoa. Um carinho suave e caseiro.",
});

function getNarrativePayload(intensity, loveType, targetName) {
  if (!LoveType[loveType] || !LoveIntensity[intensity]) throw new Error("Parâmetros inválidos.");

  if (loveType === LoveType.NONE || intensity === LoveIntensity.EMPTY) {
    return Object.freeze({
      targetName, loveType, intensity,
      directive: `Em relação a ${targetName}: Sem envolvimento afetivo direto.`,
      behavior_modifiers: []
    });
  }

  const baseDirective = BASE_TYPE_DIRECTIVES[loveType];
  const powerScale = intensity === LoveIntensity.CONSUMING ? "Isto domina completamente suas ações atuais." :
                     intensity === LoveIntensity.PROFOUND ? "Isto é uma verdade sólida no seu coração." :
                     intensity === LoveIntensity.GROWING ? "Este sentimento está nascendo em você." :
                     intensity === LoveIntensity.FLEETING ? "É apenas uma impressão fugaz que pode sumir." :
                     "Este sentimento está morrendo e se apagando em você.";

  return Object.freeze({
    targetName,
    loveType,
    intensity,
    directive: `Em relação a ${targetName}: ${baseDirective} (Intensidade: ${powerScale})`,
    behavior_modifiers: [`afeto_${loveType.toLowerCase()}`],
  });
}

// ─────────────────────────────────────────────
//  CROSS-CONTAMINATION — Efeito Dominó Global
// ─────────────────────────────────────────────

function getGlobalModifiers(loveType, intensity) {
  if (intensity === LoveIntensity.EMPTY || loveType === LoveType.NONE) return {};

  const modifiers = {
    [LoveType.AGAPE]:  { trust_buff: "blind_faith", mood_buff: "peaceful" },
    [LoveType.EROS]:   { libido_buff: "high_arousal", mood_buff: "passionate" },
    [LoveType.PHILIA]: { trust_buff: "brotherhood", mood_buff: "cheerful" },
    [LoveType.LUDUS]:  { libido_buff: "playful_arousal", mood_buff: "amused" },
    [LoveType.PRAGMA]: { trust_buff: "business_partner", mood_buff: "neutral" },
    [LoveType.MANIA]:  { trust_buff: "paranoid_jealousy", mood_buff: "anxious_angry", energy_debuff: "mental_drain" },
    [LoveType.STORGE]: { trust_buff: "protective", mood_buff: "warm" },
  };

  // Se for Fading, o Efeito Dominó enfraquece brutalmente e gera tristeza
  if (intensity === LoveIntensity.FADING) {
      return Object.freeze({ mood_buff: "heartbroken", libido_buff: "blocked" });
  }

  return Object.freeze(modifiers[loveType] || {});
}

// ─────────────────────────────────────────────
//  PIPELINE & EVENTOS
// ─────────────────────────────────────────────

function processSceneCheckpoint({ previousBuffer, flashResponse }) {
  const parsed = parseFlashResponse(flashResponse);

  if (!parsed) {
    return {
      error: "Flash retornou formato inválido. Resposta descartada.",
      kindroid: getNarrativePayload(previousBuffer.intensity, previousBuffer.loveType, previousBuffer.targetName),
      ui: getUIPayload(previousBuffer.intensity, previousBuffer.loveType, previousBuffer.markers, previousBuffer.cross_buff),
      nextBuffer: previousBuffer,
    };
  }

  const kindroid = getNarrativePayload(parsed.intensity, parsed.loveType, previousBuffer.targetName);
  const ui = getUIPayload(parsed.intensity, parsed.loveType, previousBuffer.markers, previousBuffer.cross_buff);

  const nextBuffer = createLoveBuffer({
    targetName: previousBuffer.targetName,
    loveType:   parsed.loveType,
    intensity:  parsed.intensity,
    cross_buff: previousBuffer.cross_buff,
    markers:    [], // Reseta ações sociais da cena
  });

  return { kindroid, ui, nextBuffer };
}

function addSceneMarker(currentBuffer, marker) {
  return createLoveBuffer({
    targetName: currentBuffer.targetName,
    loveType:   currentBuffer.loveType,
    intensity:  currentBuffer.intensity,
    cross_buff: currentBuffer.cross_buff,
    markers:    [...currentBuffer.markers, marker],
  });
}

// ─────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────
module.exports = {
  LoveType,
  LoveIntensity,
  createLoveBuffer,
  serializeBufferForFlash,
  buildFlashLovePrompt,
  parseFlashResponse,
  convertToBlocks,
  getNarrativePayload,
  getUIPayload,
  getGlobalModifiers,
  processSceneCheckpoint,
  addSceneMarker,
  INTENSITY_BLOCKS,
};
