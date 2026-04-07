/**
 * ═══════════════════════════════════════════════════════════════
 *  PASO ROBLES RPG ENGINE — MONEY/WEALTH MODULE v1.0
 * ═══════════════════════════════════════════════════════════════
 *  Arquitetura: Híbrida (Front-End Matemático + Gemini Extrator)
 *
 *  A ÚNICA exceção ao "Manifesto Qualitativo". O dinheiro requer
 *  matemática rigorosa. O Front-End (Tampermonkey) gerencia os
 *  valores exatos (Wallet/Bank). O Gemini atua apenas como o
 *  "Caixa/Contador" que identifica a intenção financeira na cena.
 *
 *  O Kindroid não recebe os números brutos, apenas o Nível
 *  de Poder de Compra Qualitativo (Ex: "QUEBRADO").
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────
//  TIPOS E CONSTANTES (A TRADUÇÃO QUALITATIVA)
// ─────────────────────────────────────────────

/**
 * Níveis de Poder de Compra que o Kindroid entenderá.
 * Calculado ativamente pelo Front-End baseado no somatório de bens (Wallet + Bank).
 */
const WealthThreshold = Object.freeze({
  BROKE:    "BROKE",    // $0 ou Dívidas. Desespero financeiro.
  TIGHT:    "TIGHT",    // Pouco dinheiro, conta moedas.
  STABLE:   "STABLE",   // Classe média, confortável, não ostenta.
  WEALTHY:  "WEALTHY",  // Rico, não olha preço de cardápio.
  OPULENT:  "OPULENT",  // Magnata, nobreza rica, compra cidades.
});

/**
 * Operações Financeiras reconhecidas pelo Gemini.
 */
const FinancialAction = Object.freeze({
  NONE:        "NONE",        // Sem movimentação
  SPEND:       "SPEND",       // Compra diária, taverna, armadura
  EARN:        "EARN",        // Achou um tesouro, gorjeta
  PAYDAY:      "PAYDAY",      // Recebeu salário (vai pro banco)
  ROBBERY:     "ROBBERY",     // Foi assaltado (zera a carteira)
  WITHDRAW:    "WITHDRAW",    // Saque do Banco -> Carteira
  DEPOSIT:     "DEPOSIT",     // Carteira -> Banco
});

// ─────────────────────────────────────────────
//  ESTADO FINANCEIRO (STATE MANAGER)
// ─────────────────────────────────────────────

/**
 * Diferente dos outros Buffers de Cena, a Economia é persistente
 * em números exatos flutuantes.
 */
function createFinancialState({
  wallet = 0.00, // Dinheiro vivo no bolso (sujeito a roubo/gastos rápidos)
  bank   = 0.00, // Dinheiro seguro, exige "Saque" para usar
  salary = 0.00, // Salário fixo recebido no PAYDAY
} = {}) {
  return Object.freeze({
    wallet: parseFloat(Math.max(0, wallet).toFixed(2)),
    bank:   parseFloat(Math.max(0, bank).toFixed(2)),
    salary: parseFloat(Math.max(0, salary).toFixed(2)),
  });
}

// ─────────────────────────────────────────────
//  FLASH PROMPT BUILDER (O CONTADOR)
// ─────────────────────────────────────────────

function serializeFinancialContext(state) {
  return [
    `wallet_cash: $${state.wallet}`,
    `bank_savings: $${state.bank}`
  ].join(" | ");
}

/**
 * Instruções para a Extração Financeira do Gemini.
 * O Gemini vai ler a cena, identificar se houve gasto, e extrair o número.
 */
function buildFlashFinancialPrompt(state) {
  const context = serializeFinancialContext(state);

  return [
    `[FINANCIAL EXTRACTION CHECK - CONTADOR]`,
    context,
    ``,
    `Analise a cena recente para extrair movimentações financeiras.`,
    `A sua tarefa é atuar como o Contador do jogo. Não calcule saldos finais, apenas indique a OPERAÇÃO e o VALOR movimentado na cena.`,
    ``,
    `Responda SOMENTE neste formato:`,
    `action: FINANCIAL_ACTION | value: NUMERO | reason: explicação_curta`,
    ``,
    `Ações Válidas: NONE, SPEND (Compra na carteira), EARN (Ganhou dinheiro vivo), PAYDAY (Recebeu salário), ROBBERY (Assaltado), WITHDRAW (Saque), DEPOSIT (Depósito).`,
    `Regras Financeiras:`,
    `- Se não houve menção a dinheiro ou comércio, retorne: 'action: NONE | value: 0'.`,
    `- Se comprou algo, estime o preço do item (ex: Cerveja = 5, Espada = 150) e retorne: 'action: SPEND | value: VALOR_ESTIMADO'.`,
    `- Se houve um salto de tempo de dias/semanas e o personagem trabalhou, decrete 'action: PAYDAY | value: 0' (o sistema injetará o salário dele automaticamente).`,
    `- Se ele foi roubado/assaltado na rua, decrete 'action: ROBBERY | value: 0'. O sistema esvaziará a carteira dele.`,
    `- Se ele foi ao banco, decrete WITHDRAW ou DEPOSIT e o valor exato mencionado por ele.`
  ].join("\n");
}

function parseFinancialResponse(flashResponse) {
  const cleaned = flashResponse.trim().replace(/\s+/g, " ");
  const match = cleaned.match(
    /action:\s*(NONE|SPEND|EARN|PAYDAY|ROBBERY|WITHDRAW|DEPOSIT)\s*\|\s*value:\s*([\d.]+)\s*\|\s*reason:\s*(.+)/i
  );

  if (!match) return null;

  const action = match[1].toUpperCase();
  const value = parseFloat(match[2]);

  if (!FinancialAction[action] || isNaN(value)) return null;

  return { action, value, reason: match[3].trim() };
}

// ─────────────────────────────────────────────
//  O MOTOR MATEMÁTICO FRONT-END
// ─────────────────────────────────────────────

/**
 * Processa a ação contábil extraída pelo Gemini e altera os números reais.
 */
function processTransaction(currentState, extraction) {
  let { wallet, bank, salary } = currentState;
  let action = extraction.action;
  let val = extraction.value;

  switch (action) {
    case FinancialAction.SPEND:
      // Tenta tirar da carteira. O Tampermonkey avisa se falhar.
      if (wallet >= val) {
        wallet -= val;
      } else {
        // Bloqueio financeiro (Dívida/Calote) - A UI pode alertar o jogador
        wallet = 0;
      }
      break;

    case FinancialAction.EARN:
      wallet += val; // Entra na carteira (dinheiro vivo)
      break;

    case FinancialAction.WITHDRAW:
      const safeWithdraw = Math.min(val, bank); // Saca apenas o que tem
      bank -= safeWithdraw;
      wallet += safeWithdraw;
      break;

    case FinancialAction.DEPOSIT:
      const safeDeposit = Math.min(val, wallet);
      wallet -= safeDeposit;
      bank += safeDeposit;
      break;

    case FinancialAction.PAYDAY:
      // O sistema injeta o salário configurado direto no Banco
      bank += salary;
      break;

    case FinancialAction.ROBBERY:
      // Lógica de Assalto de Rua: Zera apenas o dinheiro vivo.
      wallet = 0;
      break;

    case FinancialAction.NONE:
    default:
      break;
  }

  return createFinancialState({ wallet, bank, salary });
}

// ─────────────────────────────────────────────
//  FRONT-END CONVERTER (UI e STATUS DO KINDROID)
// ─────────────────────────────────────────────

/**
 * Avalia o nível de Poder de Compra Qualitativo para injetar no Kindroid.
 * A riqueza total (Wallet + Bank) dita como o personagem se porta socialmente,
 * mas a carteira zerada impede ações imediatas.
 */
function evaluateWealthThreshold(totalMoney) {
  if (totalMoney <= 10)    return WealthThreshold.BROKE;
  if (totalMoney <= 200)   return WealthThreshold.TIGHT;
  if (totalMoney <= 2000)  return WealthThreshold.STABLE;
  if (totalMoney <= 50000) return WealthThreshold.WEALTHY;
  return WealthThreshold.OPULENT; // Acima de 50k
}

function getUIPayload(state) {
  const total = state.wallet + state.bank;
  const threshold = evaluateWealthThreshold(total);

  return Object.freeze({
    // O Front-End renderiza os números exatos para o Player
    walletDisplay: `$${state.wallet.toFixed(2)}`,
    bankDisplay:   `$${state.bank.toFixed(2)}`,
    totalWealth:   total,
    qualitativeThreshold: threshold,
    // Cores visuais (Ouro/Verde/Vermelho)
    color: threshold === WealthThreshold.BROKE ? { text: "#ef4444" } : { text: "#facc15" },
  });
}

// ─────────────────────────────────────────────
//  DIRETRIZES DO KINDROID (SUGGESTION INJECTION)
// ─────────────────────────────────────────────

const NARRATIVE_DIRECTIVES = Object.freeze({
  [WealthThreshold.BROKE]: {
    directive: "Você está completamente quebrado. Não tem dinheiro para comer, dormir ou pagar por serviços. Tente barganhar, pedir ajuda ou fugir de despesas.",
    behavior_modifiers: ["desespero_financeiro", "pechincha", "humildade"],
  },
  [WealthThreshold.TIGHT]: {
    directive: "Dinheiro apertado. Você conta as moedas. Recusa compras de luxo e sempre busca a opção mais barata no cardápio ou na loja.",
    behavior_modifiers: ["frugalidade", "recusa_luxos"],
  },
  [WealthThreshold.STABLE]: {
    directive: "Vida financeira estável. Pode pagar refeições, estalagem e consertos sem se preocupar muito, mas evita esbanjar dinheiro à toa.",
    behavior_modifiers: ["conforto_classe_media"],
  },
  [WealthThreshold.WEALTHY]: {
    directive: "Você é rico. Não se importa com preços, paga rodadas para amigos, dá boas gorjetas e exige quartos ou serviços de qualidade superior.",
    behavior_modifiers: ["esbanjador", "exigente", "generosidade"],
  },
  [WealthThreshold.OPULENT]: {
    directive: "Riqueza opulenta. Você trata o dinheiro como algo trivial. Suborna guardas, compra estabelecimentos inteiros se irritado. Ostentação máxima.",
    behavior_modifiers: ["ostentação", "soberba_financeira", "soluções_via_suborno"],
  },
});

function getNarrativePayload(state) {
  const total = state.wallet + state.bank;
  const threshold = evaluateWealthThreshold(total);
  const entry = NARRATIVE_DIRECTIVES[threshold];

  let payload = `[Finanças: ${entry.directive}]`;

  // Adiciona a Camada Tática do "Roubo" ou "Esquecimento" (Sem dinheiro no bolso)
  if (state.wallet === 0 && state.bank > 0) {
    payload += ` IMPORTANTE: Seu dinheiro está no banco. Você não tem NENHUM dinheiro nos bolsos agora. Você não pode pagar nada à vista nesta cena.`;
  }

  return Object.freeze({
    threshold,
    directive: payload,
    behavior_modifiers: [...entry.behavior_modifiers],
  });
}

// ─────────────────────────────────────────────
//  CROSS-CONTAMINATION — Efeito Dominó Global
// ─────────────────────────────────────────────

/**
 * Dinheiro não sangra nem dá fome, mas a falta dele gera estresse (Mood).
 */
function getGlobalModifiers(threshold, walletZero) {
  // Se está falido
  if (threshold === WealthThreshold.BROKE) {
    return Object.freeze({ mood_buff: "anxious_poor", appearance_debuff: "shabby" });
  }

  // Se é Rico, mas está sem a carteira no momento do pagamento (Situação embaraçosa)
  if (walletZero && (threshold === WealthThreshold.WEALTHY || threshold === WealthThreshold.OPULENT)) {
    return Object.freeze({ mood_buff: "embarrassed", reputation_risk: true });
  }

  // Rico esbanja Carisma Social (Egotrip)
  if (threshold === WealthThreshold.OPULENT) {
    return Object.freeze({ mood_buff: "arrogant_joy", reputation_buff: "respected" });
  }

  return Object.freeze({});
}

// ─────────────────────────────────────────────
//  PIPELINE COMPLETO
// ─────────────────────────────────────────────

function processFinancialCheckpoint({ previousState, flashResponse }) {
  const parsed = parseFinancialResponse(flashResponse);

  if (!parsed || parsed.action === FinancialAction.NONE) {
    // Nenhuma alteração financeira
    return {
      error: !parsed ? "Flash retornou formato financeiro inválido." : null,
      kindroid: getNarrativePayload(previousState),
      ui: getUIPayload(previousState),
      nextState: previousState,
    };
  }

  // O Front-End JS aplica a matemática rígida (O Contador)
  const nextState = processTransaction(previousState, parsed);

  const kindroid = getNarrativePayload(nextState);
  const ui = getUIPayload(nextState);

  return { kindroid, ui, nextState };
}

// ─────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────
module.exports = {
  WealthThreshold,
  FinancialAction,
  createFinancialState,
  serializeFinancialContext,
  buildFlashFinancialPrompt,
  parseFinancialResponse,
  processTransaction,
  evaluateWealthThreshold,
  getNarrativePayload,
  getUIPayload,
  getGlobalModifiers,
  processFinancialCheckpoint,
};
