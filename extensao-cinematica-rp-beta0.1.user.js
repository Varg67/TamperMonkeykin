// ==UserScript==
// @name         Kindroid RP Framework V4 (Final System)
// @namespace    http://tampermonkey.net/
// @version      4.1
// @description  Liquid Glass RPG HUD + Journal Tool + API Pinger
// @author       Dev LLM Game & You
// @match        *://*.kindroid.ai/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @connect      api.kindroid.ai
// @connect      generativelanguage.googleapis.com
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // 1. STATE & CONFIGURATION MATRIX
    // ==========================================
    const gameState = {
        loc: "Aguardando Init...",
        mood: { icon: "😐", text: "NEUTRAL", color: "#ecc94b" },
        tokens: 0,
        apiKeys: { k: "", c: "", g: "" },
        stats: {
            hunger:   { val: 0,   type: 'negative' },
            thirst:   { val: 0,   type: 'negative' },
            energy:   { val: 100, type: 'positive' },
            hygiene:  { val: 100, type: 'positive' },
            stress:   { val: 0,   type: 'negative' },
            connect:  { val: 80,  type: 'positive' },
            affection:{ val: 50,  type: 'positive' },
            trust:    { val: 50,  type: 'positive' },
            libido:   { val: 0,   type: 'neutral' },
            pleasure: { val: 0,   type: 'climax' }
        }
    };

    const statConfig = {
        hunger:   { label: "FOME",    color: "#f97316", danger: "#ea580c" },
        thirst:   { label: "SEDE",    color: "#06b6d4", danger: "#dc2626" },
        energy:   { label: "ENERGIA", color: "#4ade80", danger: "#eab308" },
        hygiene:  { label: "HIGIENE", color: "#e2e8f0", danger: "#b45309" },
        stress:   { label: "STRESS",  color: "#7c3aed", danger: "#ef4444" },
        connect:  { label: "CONEXÃO", color: "#3b82f6", danger: "#1e3a8a" },
        affection:{ label: "AFEIÇÃO", color: "#ec4899", danger: "#be185d" },
        trust:    { label: "CONFIANÇA",color: "#eab308", danger: "#a16207" },
        libido:   { label: "LIBIDO",  color: "#dc2626", danger: "#ff0000" },
        pleasure: { label: "PRAZER",  color: "#d946ef", danger: "#ffffff" }
    };

    // ==========================================
    // 2. CSS ARCHITECTURE
    // ==========================================
    const injectCSS = () => {
        const style = document.createElement('style');
        style.textContent = `
            #knd-hud-wrapper {
                position: fixed; top: 20px; right: 20px; width: 360px;
                background: rgba(35, 40, 50, 0.85); backdrop-filter: blur(16px) saturate(120%);
                border-top: 1px solid rgba(80, 255, 120, 0.4); border-left: 1px solid rgba(80, 255, 120, 0.2);
                border-bottom: 1px solid rgba(0, 0, 0, 0.5); border-right: 1px solid rgba(0, 0, 0, 0.5);
                border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); color: #e2e8f0;
                font-family: 'Inter', sans-serif; z-index: 999999; display: flex; flex-direction: column;
                transition: opacity 0.3s ease; opacity: 0.85; user-select: none;
            }
            #knd-hud-wrapper:hover { opacity: 1; }
            #knd-hud-header { padding: 10px 15px; background: rgba(15,20,25,0.4); border-bottom: 1px solid rgba(255,255,255,0.05); cursor: grab; display: flex; justify-content: space-between; align-items: center; }
            #knd-hud-header:active { cursor: grabbing; }
            .knd-header-loc { font-size: 11px; text-transform: uppercase; color: #94a3b8; flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

            .knd-header-api { display: flex; gap: 4px; align-items: center; font-size: 10px; font-weight: bold; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; margin-right: 5px; cursor: default; }
            .knd-status-icon { padding: 2px 4px; border-radius: 3px; color: #fff; text-shadow: 0 0 3px #000; opacity: 0.5; transition: all 0.3s; }
            .knd-status-icon.online { opacity: 1; background: rgba(74, 222, 128, 0.2); color: #4ade80; box-shadow: 0 0 5px rgba(74, 222, 128, 0.5); }
            .knd-status-icon.error { opacity: 1; background: rgba(239, 68, 68, 0.2); color: #ef4444; box-shadow: 0 0 5px rgba(239, 68, 68, 0.5); }
            .knd-status-icon.testing { opacity: 1; color: #eab308; animation: pulseDanger 1s infinite; }
            .knd-token-count { margin-left: 4px; color: #94a3b8; font-family: monospace; }

            .knd-header-controls { flex: 1; text-align: right; display: flex; justify-content: flex-end; gap: 8px; }
            .knd-ctrl-btn { cursor: pointer; font-size: 14px; color: #94a3b8; transition: all 0.2s; padding: 0 2px; }
            .knd-ctrl-btn:hover { color: #fff; text-shadow: 0 0 5px rgba(255,255,255,0.8); }

            #knd-hud-settings, #knd-hud-journal { display: none; padding: 15px; flex-direction: column; gap: 10px; }
            .knd-settings-row { display: flex; flex-direction: column; gap: 4px; }
            .knd-settings-row label { font-size: 10px; font-weight: bold; color: #cbd5e1; }
            .knd-input-group { display: flex; gap: 5px; }
            .knd-input { flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #fff; padding: 6px 8px; font-size: 11px; font-family: monospace; outline: none; }
            .knd-input:focus { border-color: rgba(80, 255, 120, 0.5); }
            .knd-textarea { min-height: 80px; resize: vertical; }

            .knd-btn-ping { background: rgba(80, 255, 120, 0.1); border: 1px solid rgba(80, 255, 120, 0.3); color: #4ade80; cursor: pointer; border-radius: 4px; padding: 4px 8px; font-size: 10px; font-weight: bold; }
            .knd-btn-action { background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.5); color: #60a5fa; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 11px; text-align: center; }
            .knd-btn-action:hover { background: rgba(59, 130, 246, 0.4); color: #fff; }
            .knd-btn-action.green { background: rgba(80, 255, 120, 0.2); border-color: rgba(80, 255, 120, 0.5); color: #4ade80; }

            #knd-hud-wrapper.minimized #knd-hud-body, #knd-hud-wrapper.minimized #knd-hud-footer, #knd-hud-wrapper.minimized #knd-hud-settings, #knd-hud-wrapper.minimized #knd-hud-journal { display: none !important; }
            #knd-hud-body { padding: 15px; display: flex; flex-direction: column; gap: 12px; }
            .knd-tier-group { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .knd-stat-container { display: flex; flex-direction: column; gap: 4px; }
            .knd-stat-header { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; color: #cbd5e1; }
            .knd-blocks-wrapper { display: flex; gap: 2px; height: 8px; }
            .knd-block { flex: 1; background: rgba(200, 210, 220, 0.1); border-radius: 1px; transition: all 0.3s ease; }
            .knd-block.filled { box-shadow: inset 0 0 4px rgba(0,0,0,0.2); }

            @keyframes pulseDanger { 0% { opacity: 0.8; } 50% { opacity: 1; box-shadow: 0 0 8px currentColor; } 100% { opacity: 0.8; } }
            .knd-block.danger { animation: pulseDanger 1.5s infinite; }
            @keyframes whiteHot { 0% { background: #d946ef; } 50% { background: #ffffff; box-shadow: 0 0 15px #d946ef; } 100% { background: #d946ef; } }
            .knd-block.climax { animation: whiteHot 0.8s infinite; }

            #knd-hud-footer { padding: 8px 15px; background: rgba(0,0,0,0.2); min-height: 20px; display: flex; justify-content: flex-end; overflow: hidden; gap: 5px; }
            .knd-floating-text { font-size: 11px; font-weight: bold; animation: floatUpAndFade 2.5s forwards; }
            @keyframes floatUpAndFade { 0% { opacity: 0; transform: translateY(10px); } 15% { opacity: 1; transform: translateY(0); } 80% { opacity: 1; transform: translateY(-5px); } 100% { opacity: 0; transform: translateY(-15px); } }
            #stat-pleasure { display: none; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px;}
        `;
        document.head.appendChild(style);
    };

    // ==========================================
    // 3. UI RENDER ENGINE
    // ==========================================
    const createHUD = () => {
        const hud = document.createElement('div');
        hud.id = 'knd-hud-wrapper';
        hud.innerHTML = `
            <div id="knd-hud-header">
                <div class="knd-header-loc" id="knd-loc-text">📍 ${gameState.loc}</div>
                <div class="knd-header-api" title="API Status & Tokens">
                    <span class="knd-status-icon" id="icon-k">K</span>
                    <span class="knd-status-icon" id="icon-c">C</span>
                    <span class="knd-status-icon" id="icon-g">G</span>
                    <span class="knd-token-count" id="knd-tokens">0T</span>
                </div>
                <div class="knd-header-controls">
                    <span class="knd-ctrl-btn" id="knd-journal-toggle" title="Diário de Journal">📝</span>
                    <span class="knd-ctrl-btn" id="knd-config-toggle" title="Configurações">⚙️</span>
                    <span class="knd-ctrl-btn" id="knd-min-toggle" title="Minimizar">—</span>
                </div>
            </div>
            <div id="knd-hud-body"></div>

            <!-- PAINEL DE CONFIGURAÇÕES -->
            <div id="knd-hud-settings">
                <div class="knd-settings-row">
                    <label>KINDROID API KEY (Geral)</label>
                    <div class="knd-input-group">
                        <input type="password" class="knd-input" id="inp-api-k" placeholder="sk-kindroid...">
                        <button class="knd-btn-ping" id="btn-ping-k">PING</button>
                    </div>
                </div>
                <div class="knd-settings-row">
                    <label>KIN ID (Personagem)</label>
                    <div class="knd-input-group">
                        <input type="password" class="knd-input" id="inp-api-c" placeholder="Kin ID...">
                        <button class="knd-btn-ping" id="btn-ping-c">PING</button>
                    </div>
                </div>
                <div class="knd-settings-row">
                    <label>GEMINI API KEY</label>
                    <div class="knd-input-group">
                        <input type="password" class="knd-input" id="inp-api-g" placeholder="AIzaSy...">
                        <button class="knd-btn-ping" id="btn-ping-g">PING</button>
                    </div>
                </div>
                <button class="knd-btn-action" id="knd-save-keys">SALVAR CHAVES</button>
            </div>

            <!-- PAINEL DE JOURNAL -->
            <div id="knd-hud-journal">
                <div class="knd-settings-row">
                    <label>NOVA ENTRADA NO DIÁRIO</label>
                    <textarea class="knd-input knd-textarea" id="knd-journal-text" placeholder="O que aconteceu hoje? Descreva o fato importante..."></textarea>
                </div>
                <div class="knd-settings-row">
                    <label>KEYPHRASES (Separe por vírgula)</label>
                    <input type="text" class="knd-input" id="knd-journal-keys" placeholder="ex: viagem, briga, segredo">
                </div>
                <button class="knd-btn-action green" id="knd-send-journal">ENVIAR PARA MEMÓRIA</button>
            </div>

            <div id="knd-hud-footer"></div>
        `;
        document.body.appendChild(hud);
        return hud;
    };

    const buildStatBar = (key, config) => {
        const wrapper = document.createElement('div'); wrapper.className = 'knd-stat-container'; wrapper.id = `stat-${key}`;
        wrapper.innerHTML = `<div class="knd-stat-header"><span>${config.label}</span> <span id="val-${key}">0%</span></div>
                             <div class="knd-blocks-wrapper" id="blocks-${key}">${'<div class="knd-block"></div>'.repeat(10)}</div>`;
        return wrapper;
    };

    const assembleBody = () => {
        const body = document.getElementById('knd-hud-body');
        const addRow = (keys) => {
            const row = document.createElement('div'); row.className = 'knd-tier-group';
            keys.forEach(k => row.appendChild(buildStatBar(k, statConfig[k])));
            body.appendChild(row);
        };
        addRow(['hunger', 'thirst']);
        addRow(['energy', 'hygiene']);
        addRow(['stress', 'connect']);
        addRow(['affection', 'trust']);
        body.appendChild(buildStatBar('libido', statConfig.libido));
        body.appendChild(buildStatBar('pleasure', statConfig.pleasure));
    };

    const renderState = () => {
        document.getElementById('knd-loc-text').innerText = `📍 ${gameState.loc}`;
        document.getElementById('knd-tokens').innerText = gameState.tokens + 'T';

        Object.keys(gameState.stats).forEach(key => {
            const stat = gameState.stats[key];
            const config = statConfig[key];
            const blocks = document.getElementById(`blocks-${key}`).children;

            document.getElementById(`val-${key}`).innerText = `${Math.round(stat.val)}%`;
            if (key === 'pleasure') document.getElementById('stat-pleasure').style.display = stat.val > 0 ? 'flex' : 'none';

            const filledBlocks = Math.ceil(stat.val / 10);
            let isDanger = (stat.type === 'negative' && stat.val >= 70) || (stat.type === 'positive' && stat.val <= 30);
            if(key === 'stress' && stat.val >= 80) isDanger = true;
            if(key === 'libido' && stat.val >= 80) isDanger = true;

            for (let i = 0; i < 10; i++) {
                const block = blocks[i];
                block.className = 'knd-block'; block.style.backgroundColor = ''; block.style.color = '';
                if (i < filledBlocks) {
                    block.classList.add('filled');
                    if (key === 'pleasure' && filledBlocks >= 9) block.classList.add('climax');
                    else if (isDanger) { block.classList.add('danger'); block.style.backgroundColor = config.danger; block.style.color = config.danger; }
                    else { block.style.backgroundColor = config.color; }
                }
            }
        });
    };

    const showLog = (text, color) => {
        const footer = document.getElementById('knd-hud-footer');
        const span = document.createElement('span');
        span.className = 'knd-floating-text'; span.style.color = color; span.innerText = text;
        footer.appendChild(span);
        setTimeout(() => { if(footer.contains(span)) span.remove(); }, 2500);
    };

    // ==========================================
    // 4. CASCADE ENGINE & RECOVERY
    // ==========================================
    const modifyStat = (key, delta) => {
        if(!gameState.stats[key]) return;
        let oldVal = gameState.stats[key].val;
        let newVal = oldVal + delta;
        if(newVal > 100) newVal = 100;
        if(newVal < 0) newVal = 0;
        gameState.stats[key].val = newVal;

        if(Math.abs(delta) >= 1) {
            const label = statConfig[key].label;
            const sign = delta > 0 ? '+' : '';
            const color = (statConfig[key].type === 'negative') ? (delta > 0 ? '#ef4444' : '#4ade80') : (delta > 0 ? '#4ade80' : '#ef4444');
            showLog(`[${label} ${sign}${Math.round(delta)}]`, color);
        }
    };

    const processTurnCascades = () => {
        const s = gameState.stats;
        modifyStat('hunger', 0.5);
        modifyStat('thirst', 0.8);
        modifyStat('energy', -0.3);
        modifyStat('hygiene', -0.2);

        if (s.hunger.val > 70) modifyStat('stress', 1.0);
        if (s.thirst.val > 70) modifyStat('stress', 1.0);
        if (s.energy.val < 20) modifyStat('stress', 1.0);

        modifyStat('connect', s.stress.val > 50 ? -0.2 : -0.1);

        if (s.hygiene.val < 30) {
            if(s.libido.val > 20) s.libido.val -= 1.0;
        } else if (s.connect.val < 20) {
            if(s.libido.val > 30) s.libido.val -= 1.0;
            modifyStat('stress', 0.3);
        } else {
            if (s.energy.val > 60 && s.stress.val < 30 && s.hygiene.val > 60 && s.connect.val > 50) {
                modifyStat('libido', 0.08);
            } else {
                modifyStat('libido', -0.20);
            }
        }
        if (s.libido.val > 60) modifyStat('stress', 0.4);
        renderState();
    };

    // ==========================================
    // 5. OBSERVER & PARSER
    // ==========================================
    const resolveClimax = () => {
        setTimeout(() => {
            gameState.stats.pleasure.val = 0;
            gameState.stats.libido.val = 0;
            modifyStat('stress', -50);
            modifyStat('energy', -30);
            modifyStat('connect', 20);
            showLog(`[CLIMAX RESOLUTION]`, '#ffffff');
            renderState();
        }, 2000);
    };

    const parseLLMPayload = (jsonStr) => {
        try {
            const data = JSON.parse(jsonStr);
            if (data.loc) gameState.loc = data.loc;
            if (data.A_mod) modifyStat('affection', data.A_mod);
            if (data.Tr_mod) modifyStat('trust', data.Tr_mod);
            if (data.Z_mod) modifyStat('stress', data.Z_mod);
            if (data.C_mod) modifyStat('connect', data.C_mod);

            if (data.P_mod) {
                modifyStat('pleasure', data.P_mod);
                if (gameState.stats.pleasure.val >= 100) resolveClimax();
            }
            processTurnCascades();
        } catch (e) {
            console.error("Kindroid V4: Parse JSON Error.", e);
        }
    };

    const initObserver = () => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if(mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 || node.nodeType === 3) {
                            const text = node.textContent || node.innerText || "";
                            const regex = /\{[\s\S]*"loc"[\s\S]*\}/g;
                            const matches = text.match(regex);
                            if (matches && matches.length > 0) {
                                const jsonStr = matches[matches.length - 1];
                                let parent = node.parentElement;
                                if(parent && !parent.hasAttribute('data-rp-parsed')) {
                                    parent.setAttribute('data-rp-parsed', 'true');
                                    gameState.tokens += Math.ceil(text.length / 4);
                                    parseLLMPayload(jsonStr);
                                }
                            }
                        }
                    });
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    };

    // ==========================================
    // 6. UI TOGGLES & DRAG
    // ==========================================
    const initDraggable = (hud) => {
        const header = document.getElementById('knd-hud-header');
        const minBtn = document.getElementById('knd-min-toggle');
        const cfgBtn = document.getElementById('knd-config-toggle');
        const jnlBtn = document.getElementById('knd-journal-toggle');

        const bodyEl = document.getElementById('knd-hud-body');
        const setEl = document.getElementById('knd-hud-settings');
        const jnlEl = document.getElementById('knd-hud-journal');

        let isDragging = false, currX, currY, initX, initY, xOff = 0, yOff = 0;

        const switchPanel = (panelToShow) => {
            if (hud.classList.contains('minimized')) hud.classList.remove('minimized');
            [bodyEl, setEl, jnlEl].forEach(p => p.style.display = 'none');
            [cfgBtn, jnlBtn].forEach(b => b.style.color = '#94a3b8');

            if(panelToShow) {
                panelToShow.panel.style.display = 'flex';
                panelToShow.btn.style.color = '#fff';
            } else {
                bodyEl.style.display = 'flex';
            }
        };

        cfgBtn.addEventListener('mousedown', e => e.stopPropagation());
        cfgBtn.addEventListener('click', () => {
            const isClosing = setEl.style.display === 'flex';
            switchPanel(isClosing ? null : {panel: setEl, btn: cfgBtn});
        });

        jnlBtn.addEventListener('mousedown', e => e.stopPropagation());
        jnlBtn.addEventListener('click', () => {
            const isClosing = jnlEl.style.display === 'flex';
            switchPanel(isClosing ? null : {panel: jnlEl, btn: jnlBtn});
        });

        minBtn.addEventListener('mousedown', e => e.stopPropagation());
        minBtn.addEventListener('click', () => {
            hud.classList.toggle('minimized');
            minBtn.innerText = hud.classList.contains('minimized') ? '+' : '—';
        });

        header.addEventListener('mousedown', e => {
            initX = e.clientX - xOff; initY = e.clientY - yOff;
            if (e.target === header || header.contains(e.target)) isDragging = true;
        });
        document.addEventListener('mouseup', () => { initX = currX; initY = currY; isDragging = false; });
        document.addEventListener('mousemove', e => {
            if (isDragging) {
                e.preventDefault();
                currX = e.clientX - initX; currY = e.clientY - initY;
                xOff = currX; yOff = currY;
                hud.style.transform = `translate3d(${currX}px, ${currY}px, 0)`;
            }
        });
    };

    // ==========================================
    // 7. API TOOLS (JOURNAL & PING)
    // ==========================================
    const initToolsLogic = () => {
        const savedKeys = JSON.parse(GM_getValue('knd_rp_keys', '{"k":"","c":"","g":""}'));
        gameState.apiKeys = savedKeys;

        ['k', 'c', 'g'].forEach(type => {
            document.getElementById(`inp-api-${type}`).value = savedKeys[type];
        });

        document.getElementById('knd-save-keys').addEventListener('click', () => {
            ['k', 'c', 'g'].forEach(type => {
                gameState.apiKeys[type] = document.getElementById(`inp-api-${type}`).value;
            });
            GM_setValue('knd_rp_keys', JSON.stringify(gameState.apiKeys));
            showLog('[CHAVES SALVAS]', '#4ade80');
        });

        const gmFetch = (url, options) => {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: options.method || 'GET',
                    url: url,
                    headers: options.headers || {},
                    data: options.body,
                    onload: (response) => resolve({ ok: response.status >= 200 && response.status < 300, status: response.status, responseText: response.responseText }),
                    onerror: (error) => reject(error)
                });
            });
        };

        // ACTION: ENVIAR JOURNAL
        document.getElementById('knd-send-journal').addEventListener('click', async () => {
            const entry = document.getElementById('knd-journal-text').value.trim();
            const keysRaw = document.getElementById('knd-journal-keys').value.trim();

            if(!entry || !gameState.apiKeys.k || !gameState.apiKeys.c) {
                showLog('[ERRO: FALTA DADOS OU CHAVES]', '#ef4444');
                return;
            }

            const keyphrases = keysRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);
            showLog('[ENVIANDO PARA MEMÓRIA...]', '#eab308');

            try {
                const res = await gmFetch("https://api.kindroid.ai/v1/journal-create", {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${gameState.apiKeys.k}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ai_id: gameState.apiKeys.c,
                        entry: entry,
                        keyphrases: keyphrases
                    })
                });

                if(res.ok) {
                    showLog('[MEMÓRIA GRAVADA COM SUCESSO]', '#4ade80');
                    document.getElementById('knd-journal-text').value = '';
                    document.getElementById('knd-journal-keys').value = '';
                } else {
                    throw new Error();
                }
            } catch (e) {
                showLog('[FALHA AO GRAVAR MEMÓRIA]', '#ef4444');
            }
        });

        const pingAPI = async (type) => {
            const icon = document.getElementById(`icon-${type}`);
            const targetVal = document.getElementById(`inp-api-${type}`).value.trim();
            const keyK = document.getElementById('inp-api-k').value.trim();
            if(!targetVal) { icon.className = 'knd-status-icon error'; return; }

            icon.className = 'knd-status-icon testing';
            try {
                let success = false;
                if (type === 'g') {
                    const res = await gmFetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${targetVal}`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: "ping" }] }] })
                    });
                    success = res.ok;
                } else if (type === 'k') {
                    const res = await gmFetch("https://api.kindroid.ai/v1/check-user-subscription", {
                        method: 'POST', headers: { 'Authorization': `Bearer ${targetVal}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({})
                    });
                    success = res.ok;
                } else if (type === 'c') {
                    if(!keyK) throw new Error();
                    const res = await gmFetch("https://api.kindroid.ai/v1/update-info", {
                        method: 'POST', headers: { 'Authorization': `Bearer ${keyK}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ai_id: targetVal })
                    });
                    success = res.ok;
                }
                icon.className = success ? 'online' : 'error';
                if(success) gameState.apiKeys[type] = targetVal;
            } catch (err) { icon.className = 'knd-status-icon error'; }
        };

        ['k', 'c', 'g'].forEach(type => {
            document.getElementById(`btn-ping-${type}`).addEventListener('click', () => pingAPI(type));
        });
    };

    // ==========================================
    // 8. BOOTSTRAP
    // ==========================================
    const init = () => {
        injectCSS();
        const hud = createHUD();
        assembleBody();
        initDraggable(hud);
        initToolsLogic();
        renderState();
        initObserver();
        console.log("🎬 Kindroid RP System V4.1: JOURNAL TOOL ADDED.");
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

})();
