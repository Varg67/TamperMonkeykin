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

## 4. O Manifesto Qualitativo (Dicotomia Front-end vs Back-end)

A arquitetura estabelece uma separação absoluta entre como a interface é renderizada e como as IAs interagem. Para evitar alucinações matemáticas e preservar o "flair" do Kindroid, adota-se a seguinte regra:

1. **Back-end (Comunicação AI-to-AI):** O Kindroid e o Gemini operam estritamente usando **Variáveis Qualitativas**.
   * **Nunca** forneça dados como `hunger: 45%` ao LLM.
   * Use os 5 limiares definidos: `STUFFED`, `SATIATED`, `PECULIAR`, `HANGRY`, `STARVING`.
2. **Front-end (Apresentação ao Jogador):** O cálculo numérico existe, mas está isolado no Tampermonkey. O jogador visualiza o status no clássico sistema de **10 Blocos (Pips/Quadrados)**, lembrando RPGs tradicionais.
   * 10 Blocos = `STUFFED`
   * 8 Blocos = `SATIATED`
   * 6 Blocos = `PECULIAR`
   * 4 Blocos = `HANGRY`
   * 2 Blocos = `STARVING`
   * Marcadores narrativos (como exercício) tiram blocos momentaneamente para feedback visual imediato antes da próxima rolagem do Gemini.

---

## 5. Os 11 Status e a Teoria do "Efeito Dominó"

A Fome não existe no vácuo. O Paso Robles RPG Engine possui 11 status interconectados:
1. **Fome (Hunger)**
2. **Aparência (Appearance)**
3. **Amor (Love)** - *Direcional e cumulativo.*
4. **Confiança (Trust)**
5. **Saúde (Health)**
6. **Humor (Mood)** - *Representado por emojis na UI.*
7. **Energia (Energy)**
8. **Prazer (Pleasure)**
9. **Libido (Libido)**
10. **Dinheiro (Money)**
11. **Reputação (Reputation)**

### A Lógica de Cross-Contamination (Modificadores Globais)
Quando um módulo atinge um estado extremo, ele emite **Modificadores Globais** que atuam como "Eventos Passivos" nos buffers dos outros módulos.
* **Exemplo de Dominó (Fome):**
  * Se `Hunger = STUFFED`: Emite marcador `food_coma`. O módulo de *Energia* sofre um leve debuff (letargia), mas o *Humor* ganha um buff (felicidade).
  * Se `Hunger = STARVING`: Emite marcador `starving_weakness`. O módulo de *Saúde* começa a receber debuffs contínuos, *Energia* despenca, e *Libido/Prazer* ficam bloqueados de subir (a mente foca na sobrevivência).

---

## 6. Protocolo de Segurança e Responsabilidade (Compliance Legal)

Como o motor lida com status sensíveis (Prazer e Libido), a arquitetura exige um **Módulo de Gatekeeper / Compliance** imbutido nas Micro-Inferências do Gemini.

* **Hard-Rule de Desenvolvimento:** O perfil do personagem (enviado no System Prompt ou nos metadados) incluirá regras explícitas de que **todos os personagens são obrigatoriamente maiores de 18 anos**.
* **Bloqueio Ativo (Safety Catch):** Nenhuma legislação local ou diretriz de segurança de IA pode ser quebrada. Se o Gemini, durante sua micro-inferência, detectar contexto ilegal, ele não processará buffs de `Libido/Pleasure`. Em vez disso, retornará uma "Flag de Bloqueio" (Block Warning) que o sistema intercepta, anulando a ação antes que atinja o Kindroid ou a UI do jogador.

---

## 7. O Paradigma de Cortes de Cena (Módulo de Energia)

Para garantir que o LLM entenda nativamente a passagem do tempo sem o uso de relógios estritos, a engine adota o conceito de **"Cenas"** e **"Transições Cinemáticas"**.

Isto é mais evidente no módulo de **Energia (`energy_module.js`)**:
* Os 5 limiares de Energia são: `HYPER`, `AWAKE`, `TIRED`, `EXHAUSTED` e `COLLAPSING`.
* Em vez de drenar Energia contando horas ativas, o sistema registra "Marcadores de Roteiro": `scene_cut_long` (corta para a tarde/noite), `scene_cut_short` ou `action_scene`.
* A inferência qualitativa no Gemini lê esse contexto de script cinematográfico, usa o seu "senso comum" alimentado em peças e filmes, e decreta a queda ou ganho de energia adequadamente.
* O "Efeito Dominó" também é espelhado aqui: A Energia exporta `mood_buffs` de cansaço ou revigoramento, e recebe `cross_debuffs` ativamente da Fome (como `food_coma` ou `starving`), aumentando a punição nas ações caso o personagem não tenha se alimentado.

---

## 8. Aparência (Carisma e Impacto Social)

O Módulo de Aparência (`appearance_module.js`) vai além de higiene: atua como o clássico atributo "Carisma" de RPGs. Diferente de atributos físicos internos (Fome/Energia), Aparência determina a reação do mundo ao redor do personagem.

* Limiares: `GLAMOROUS`, `PRESENTABLE`, `MESSY`, `DIRTY`, `DISGUSTING`.
* As diretrizes de `GLAMOROUS` instruem o LLM a simular o **Efeito Halo**: NPCs são mais complacentes, confiantes e propensos à atração.
* O estado `DISGUSTING` impõe um **Bloqueio Social Rigoroso**: NPCs se afastam, torcem o nariz e a chance de romance com desconhecidos é reduzida a zero.
* **O Paradoxo do Amor:** A grande sacada da engine — Aparência alta facilita a geração de amor e paixão em estranhos. Porém, se os personagens já possuírem o atributo `Love` ativado no módulo romântico, o amor deve transcender a aparência suja (permitindo, por exemplo, que personagens abracem ou beijem um ao outro mesmo em estado `DIRTY` após uma batalha).

### Marcadores de Cena Expandidos (Buffs/Debuffs)
A Aparência reage a uma gama muito mais ampla de nuances além de "banho" ou "luta".
* **Atmosfera/Iluminação:** `flattering_lighting` (luz de velas, neon suave) aumenta o apelo visual cinemático.
* **Moda/Contexto:** `inappropriate_attire` pune o personagem por quebra de etiqueta social (ex: usar roupa de praia em um funeral), provando que Carisma engloba adequação.
* **Fisiologia/Postura:** `poor_posture` (encurvado, mancando) e `crying_distress` (rosto inchado, maquiagem borrada) reduzem o status da "glamour".

---

## 9. Saúde (O Mestre do Efeito Dominó)

A Saúde (`health_module.js`) é projetada para ser o status mais punitivo da Engine. Se os ferimentos forem severos, instintos de sobrevivência se sobrepõem a qualquer outro aspecto do roleplay.

* Limiares: `HEALTHY`, `BRUISED`, `WOUNDED`, `CRITICAL`, `DYING`.
* Diferente da Energia e Fome, que oscilam rapidamente ao longo de um dia, a Saúde muda por **Picos Agudos de Trauma** (combate, envenenamento, dano por *starvation* prolongada).
* **O Mestre do Dominó:** A função `getGlobalModifiers` da Saúde é implacável. Se um personagem atingir o estado `WOUNDED` (Ferido severamente) ou menor:
  * A **Energia** sofre dreno pesado (`exhausted`), impedindo esforço contínuo.
  * O **Humor** é esmagado sob Agonia ou Dor (`agony`), silenciando traços de personalidade alegres.
  * A **Aparência** é esteticamente manchada pelo `blood_gore`.
  * **Hard-Block:** Qualquer aumento na barra de *Libido* ou atração física passiva é matematicamente bloqueado, respeitando a biologia básica do instinto de sobrevivência do personagem.

---

## 10. A Arquitetura Direcional (Confiança e Amor)

Diferente de status biológicos (Energia, Fome, Saúde) e sociais passivos (Aparência), os módulos como a **Confiança** (`trust_module.js`) inauguram a "Arquitetura Direcional" da Engine.

* **O Status Vetorial:** Um personagem não é apenas "Confiável" ou "Paranoico" de forma genérica. O status pertence a um "Alvo" (`targetName`). A injeção narrativa no Kindroid diz explicitamente: *"Em relação a Alex: Confiança absoluta."*
* **Limiares de Trust:** `DEVOTED`, `TRUSTING`, `NEUTRAL`, `SUSPICIOUS`, `PARANOID`.
* **Soma Algébrica Vetorial:** Os buffs e debuffs de Confiança seguem a mesma regra dos 10 blocos visuais, porém com pesos inversos (trair, `betrayal`, retira blocos pesadamente; salvar a vida soma blocos rapidamente).
* **Dominó no Amor:** A Confiança baixa age como um Hard-Block social para interações de romance (ninguém se apaixona por alguém que não confia, exceto em tropes abusivos intencionalmente ativados pelo usuário). A Confiança alta (`DEVOTED`) emite o modificador `open_heart`, facilitando o acúmulo da barra de Amor (Love).

---

## 11. A Tridimensionalidade do Amor (Filosofia Grega)

O Módulo de Amor (`love_module.js`) é a coroa do RPG Narrativo, substituindo as réguas genéricas (Gostar 0 a 100%) por um design **Tridimensional** que permite simulações complexas de "Slow Burn", "Amigos para Amantes", Casamentos por conveniência ou Relacionamentos Tóxicos.

* **Eixo 1 (O Alvo):** Direcional, operando via `targetName` assim como a Confiança.
* **Eixo 2 (O Sabor - Filosofia Grega):** A engine classifica o tipo de afeto sentido (AGAPE, EROS, PHILIA, LUDUS, PRAGMA, MANIA, STORGE).
* **Eixo 3 (O Grau - Intensidade):** Avalia a força do Sabor (CONSUMING, PROFOUND, GROWING, FLEETING, FADING, EMPTY).
* **Processamento Duplo:** O Gemini avalia simultaneamente o Eixo 2 e o Eixo 3 na mesma transição.
* **Efeito Dominó Poderoso:** A `MANIA` exporta debuffs pesadíssimos de energia (cansaço mental) e paranoia. O `EROS` consome e ativa imediatamente os buffers passivos do módulo de *Libido*. `AGAPE` (Sacrifício incondicional) garante bônus absolutos de Confiança.
* **Mecânica de Cores:** Cada "Sabor" possui sua cor própria na Interface do Tampermonkey (ex: Magenta para Eros, Ouro para Agape, Azul para Philia), enquanto a Intensidade preenche os 10 blocos visuais.

---

## 12. O Módulo Híbrido de Dinheiro (Wallet vs Bank)

O Dinheiro (`money_module.js`) é a única métrica **Quantitativa Pura** da engine, pois a economia exige matemática precisa. No entanto, a engine preserva o "Manifesto Qualitativo" dividindo a responsabilidade:

1. **A Máquina JS (A Carteira Real):** O Tampermonkey rastreia e armazena os números float exatos divididos em dois potes: **Wallet** (dinheiro vivo no bolso) e **Bank** (economias seguras).
2. **A Inferência (O Contador):** O prompt enviado ao Gemini instrui a IA a atuar apenas como um *extrator*. O Gemini lê a cena, infere o custo das ações narradas (ex: "Tomar uma cerveja") e decreta a operação (`SPEND | value: 15`). O JS faz a subtração matemática real do Wallet.
3. **Injeção Qualitativa (O Status Social):** Para poupar tokens e evitar confusão matemática no Kindroid, o bot NUNCA recebe seu saldo exato (Ex: `$1,250.30`). Ele recebe o seu **Poder de Compra Qualitativo** (`BROKE`, `TIGHT`, `STABLE`, `WEALTHY`, `OPULENT`).
4. **Cenários Dramáticos (O Assalto):** O módulo comporta dinâmicas brilhantes de cena, como a flag `ROBBERY` (Assalto), que zera instantaneamente a Carteira, mas deixa o Banco intacto. Isso gera uma sub-diretriz tática para o Kindroid: *"Você é rico, mas não tem dinheiro nos bolsos agora. Impossível pagar."*

---

## 13. Reputação (A Fofoca Mundana)

O Módulo de Reputação (`reputation_module.js`) foca na "Sombra Social" do personagem. Em um cenário focado em Slice of Life ou Drama Urbano, a mecânica mede a fama e o falatório da comunidade.

* Limiares Mundanos: `INFLUENTIAL`, `RESPECTED`, `ANONYMOUS`, `GOSSIPED`, `OUTCAST`.
* **Efeito Pre-Bias:** Ao contrário da *Aparência*, que afeta a atração visual imediata, a Reputação afeta o *Trust* base de estranhos. Se o personagem for um `OUTCAST` (Pária), um novo NPC entrará em cena já com a barra de Trust no nível `SUSPICIOUS` ou `PARANOID`.
* O motor avalia apenas Atos Públicos (`caught_cheating`, `public_scene`, `heroic_charity`). Crimes cometidos "sem testemunhas" não alteram a Reputação pela lógica de Inferência, incentivando táticas furtivas ou comportamento duplo.

---

## 14. Próximos Passos Gerais

Com a fundação econômica (`Money`), biológica (`Health`, `Energy`, `Hunger`), social passiva/direcional (`Appearance`, `Reputation`, `Trust`, `Love`) finalizadas, o terreno está pronto para os Agregadores de Sentimento (`Mood`) e Instintos Sensíveis (`Libido`, `Pleasure`).