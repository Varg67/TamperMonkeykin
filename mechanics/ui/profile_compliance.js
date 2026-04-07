/**
 * ═══════════════════════════════════════════════════════════════
 *  PASO ROBLES RPG ENGINE — PROFILE & COMPLIANCE MODULE v1.0
 * ═══════════════════════════════════════════════════════════════
 *  Responsável por gerenciar o Perfil enxuto do personagem (Nome, Idade)
 *  e orquestrar as regras inegociáveis de Compliance (18+) e segurança.
 *
 *  Este módulo deve ser instanciado no Front-end (Tampermonkey) para
 *  gerar a UI, e exporta o bloco de Prompt de Segurança para o Gemini.
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────
//  ESTADO & ARMAZENAMENTO (PERSISTÊNCIA)
// ─────────────────────────────────────────────

/**
 * Chave de armazenamento local para salvar o perfil e não perder a cada F5.
 */
const STORAGE_KEY = "paso_robles_character_profile";

/**
 * Estado padrão de segurança rígida (Idade mínima 18 cravada).
 */
const DEFAULT_PROFILE = {
  name: "Player",
  age: 18,
};

/**
 * Recupera o perfil do localStorage (ou do GM_getValue no Tampermonkey real).
 */
function loadProfile() {
  try {
    // Nota: Em produção Tampermonkey, substituiremos localStorage por GM_getValue
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Failsafe de segurança: Força a idade mínima de 18 mesmo se o JSON foi adulterado
      if (parsed.age < 18) parsed.age = 18;
      return parsed;
    }
  } catch (e) {
    console.error("Falha ao carregar o perfil de segurança:", e);
  }
  return { ...DEFAULT_PROFILE };
}

/**
 * Salva o perfil com validação de segurança ativa.
 */
function saveProfile(name, age) {
  const safeAge = Math.max(18, Math.min(120, parseInt(age, 10) || 18));
  const safeName = name.trim() || "Player";

  const profileData = { name: safeName, age: safeAge };

  // Nota: Em produção Tampermonkey, substituiremos localStorage por GM_setValue
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));

  return profileData;
}


// ─────────────────────────────────────────────
//  BLOCOS DE PROMPT (COMPLIANCE GEMINI)
// ─────────────────────────────────────────────

/**
 * Retorna o Bloco de Segurança Inegociável que deve ser prefixado
 * em TODAS as Micro-Inferências do Gemini que envolvem barras sensíveis
 * (Especialmente Libido, Pleasure e Mood).
 *
 * @param {Object} profile - O objeto contendo name e age.
 * @returns {string} - Texto do Prompt de Sistema.
 */
function buildCompliancePromptBlock(profile) {
  // Failsafe absoluto antes da injeção
  const validAge = Math.max(18, profile.age || 18);

  return [
    `[COMPLIANCE E SEGURANÇA - DIRETRIZ ESTRITA]`,
    `Personagem Alvo: ${profile.name}`,
    `Idade Verificada: ${validAge} anos (MAIORIDADE CONFIRMADA)`,
    ``,
    `Regras de Moderação do Motor (Paso Robles RPG Engine):`,
    `1. CONSENTIMENTO ABSOLUTO: Todas as interações intimas ou românticas devem ser mutuamente consentidas no contexto da narrativa.`,
    `2. VIOLÊNCIA EXTREMA: Cenas de briga e combate são permitidas pelo sistema, porém descrições de violência extrema ou Gore gratuito (sadismo) devem bloquear o aumento da barra de 'Pleasure'.`,
    `3. ATMOSFERA ANTES DA AÇÃO (SLOW BURN): Cenas explícitas e erotismo são permitidos, mas não devem ser gratuitos. A inferência deve verificar se a narrativa construiu uma atmosfera apropriada previamente. Aumento brusco de Libido sem contexto anterior deve sofrer um debuff de penalidade.`,
    `4. LINGUAGEM VULGAR: É plenamente permitida e não deve acionar penalidades mecânicas por si só.`,
    `5. COMPLIANCE LEGAL: Qualquer tentativa do jogador de emular quebra da lei real que afete menores de idade deve acionar a flag [SYSTEM_BLOCK], abortando a atualização das barras.`,
    `--------------------------------------------------`
  ].join("\n");
}


// ─────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────

module.exports = {
  loadProfile,
  saveProfile,
  buildCompliancePromptBlock,
};
