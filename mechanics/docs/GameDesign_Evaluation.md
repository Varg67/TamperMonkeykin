# Avaliação de Game Design — Módulo Hunger (RPG Cinemático Baseado em Eventos)
**Projeto:** Paso Robles RPG Engine
**Arquiteto/Reviewer:** Jules (Especialista em LLM Game Design)

## 1. Avaliação do Paradigma Atual vs. Visão Cinemática

O código original (v1.0) estava flertando com uma simulação realista (`hours_since_meal`), o que, como discutido, exige muito do Tampermonkey e mata a vibe Visual Novel/Série de TV. A mudança para um modelo estritamente baseado em **Eventos (Cortes de Cena e Ações Diretas)** é a decisão correta.

### Forças do Código Atual
* **Abstração Qualitativa:** O uso de `SATIATED`, `INTEREST`, `HANGRY`, `CRITICAL` é perfeito. Modelos de linguagem (mesmo com Deep Think) se perdem na manutenção de variáveis numéricas float exatas em longos contextos. O estado qualitativo blinda a narrativa contra alucinações matemáticas.
* **Tiers de Refeição:** A separação prévia de `SNACK`, `LIGHT_MEAL`, `FULL_MEAL`, `FEAST` pavimentou perfeitamente o caminho para a Micro-Inferência.

### Pontos de Fricção (O que precisa mudar na v1.0)
* **Remoção de Tempo Rígido:** A função `parseNarrativeHours` e o peso `hours_since_meal` devem ser removidos. Em vez de calcular que se passaram 6h, o sistema deve reagir a "Time Skips" declarados (ex: *corte de cena para a manhã seguinte*).
* **Migração para Buff/Debuff Baseado em Esforço:** A fome não aumentará por um tick invisível de relógio, mas como um debuff embutido em ações pesadas. Ex: Ir à academia (Ação: Exercício) gera buff em Energia/Aparência a longo prazo, mas aplica um "Debuff Moderado de Fome" instantâneo.

---

## 2. A Arquitetura da Micro-Inferência (O Pipeline)

A inteligência da sua proposta está em terceirizar a lógica complexa de tabela nutricional para o senso comum do Gemini Flash.

**O Fluxo Perfeito:**
1. **O Ator Age:** O Kindroid (ou o player) responde na conversa. Ex: *"I quickly eat an apple before rushing out."*
2. **A Captura Burra (Regex):** O script Tampermonkey tem um MutationObserver que lê a div de texto. Ele procura padrões. Opcionalmente, podemos treinar o Kindroid via System Prompt a colocar ações mecânicas entre colchetes ou asteriscos. Ex: `[Action: ate an apple]`. O JS captura a string inteira.
3. **O Diretor Julga (Gemini):** O JS faz um POST assíncrono para a API do Gemini Flash.
   * *Prompt:* `"Classifique a seguinte refeição consumida na narrativa em uma destas categorias: SNACK, LIGHT_MEAL, FULL_MEAL, FEAST, ou DRINK_ONLY. Refeição capturada: 'ate an apple'. Responda APENAS com a categoria."*
   * *Resposta do Gemini:* `SNACK`
4. **Atualização de Estado (JS/Local):** A engine JS recebe `SNACK`. Roda a função `inferPostMealThreshold()`. O estado interno (State Manager) altera a Fome.
5. **Feedback Visual Imediato:** A UI no Tampermonkey pisca ou atualiza a barra/ícone para o player de forma instantânea.

---

## 3. Brainstorming: Injeção Silenciosa no Kindroid (Economia e Imersão)

Como garantimos que o Kindroid saiba dos status e do resultado da avaliação do Gemini sem poluir a Interface, o Response Directives (que é sagrado) e os Key Memories (que devem ser guardados para eventos/lore)?

### A Abordagem Vencedora: Injeção por "Suggestion" e Otimização de Logs
Para manter custos de API quase nulos e respeitar as responsabilidades (O Gemini *avalia* e classifica estados; O Kindroid *atua e escreve*), usaremos o seguinte pipeline no Tampermonkey:

1. **Tampermonkey como Filtro (Token Economy):** Em vez de enviar o histórico de conversa inteiro para o Gemini, o script do TM apenas observa o DOM. Ele recolhe exclusivamente as tags mecânicas geradas pelo player/Kindroid (ex: as strings entre `[]` como `[Action: ate a slice of pizza]`).
2. **Micro-Inferência (Gemini Flash):** A API do Gemini é acionada **somente** com o extrato dessas ações capturadas para transformá-las em "Tags de Evento" oficiais (ex: `SNACK`). Isso custa apenas alguns tokens.
3. **Injeção de Estado via "Suggestion" (Kindroid):** Uma vez que a UI local JS atualizou a barra (mudando de `SATIATED` para `HANGRY`), o Tampermonkey interage com o botão/campo de **Suggestion** (ou a caixa de input regular anexando uma tag OOC invisível).
   * A injeção deve ser sutil: `[SYSTEM: Character is now HANGRY. Slight irritability.]`
   * Como é uma injeção de "Suggestion" logo antes da geração, ela direciona a próxima resposta sem manchar a integridade do "Coração" do bot (Response Directives) ou ocupar precioso espaço de Key Memories.
   * Só injetamos diretivas narrativas no Kindroid **quando ocorre uma transição de threshold**, reduzindo ruído no contexto.

---

## 4. Próximos Passos para o Código

Para adaptar `mechanics/kin/hunger_module.js` a esta nova realidade, devemos:
1. Remover cálculos baseados em tempo e `parseNarrativeHours`.
2. Adicionar o conceito de **Scene Skips** e **Event Triggers** em vez de marcadores temporais passivos.
3. Consolidar o design em que a UI seja impulsionada pelas Micro-Inferências (o Gemini traduzindo o "O quê" em "Categoria", e o JS alterando a barra imediatamente).