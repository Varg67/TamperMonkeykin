// ==UserScript==
// @name         Kindroid Cinematic RP Framework Beta 0.2
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Glassmorphism RPG HUD + Journal Tool + API Pinger
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
        loc: "Waiting Init...",
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
        hunger:   { label: "HUNGER",    color: "#d97706", danger: "#b45309" }, // Taurus: Earth/Brown-Orange
        thirst:   { label: "THIRST",    color: "#0284c7", danger: "#0369a1" }, // Cancer: Deep Blue
        energy:   { label: "ENERGY",    color: "#facc15", danger: "#eab308" }, // Leo: Yellow
        hygiene:  { label: "HYGIENE",   color: "#f8fafc", danger: "#cbd5e1" }, // Virgo: Clean White
        stress:   { label: "STRESS",    color: "#9333ea", danger: "#7e22ce" }, // Scorpio: Dark Purple
        connect:  { label: "CONNECTION",color: "#38bdf8", danger: "#0284c7" }, // Gemini: Light Blue
        affection:{ label: "AFFECTION", color: "#f472b6", danger: "#be185d" }, // Libra: Pink
        trust:    { label: "TRUST",     color: "#fbbf24", danger: "#d97706" }, // Sagittarius: Gold
        libido:   { label: "LIBIDO",    color: "#ef4444", danger: "#b91c1c" }, // Aries: Red
        pleasure: { label: "PLEASURE",  color: "#d946ef", danger: "#c026d3" }  // Venus: Magenta
    };

    // ==========================================
    // 2. CSS ARCHITECTURE
    // ==========================================
    const injectCSS = () => {
        const style = document.createElement('style');
        style.textContent = `
            #knd-hud-wrapper {
                position: fixed; top: 20px; right: 20px; width: 360px;
                background: rgba(20, 25, 30, 0.6); backdrop-filter: blur(12px) saturate(150%);
                border: 1px solid rgba(80, 255, 120, 0.3);
                border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 10px rgba(80, 255, 120, 0.1); color: #e2e8f0;
                font-family: 'Inter', sans-serif; z-index: 999999; display: flex; flex-direction: column;
                transition: opacity 0.3s ease; opacity: 0.85; user-select: none; overflow: hidden;
            }
            #knd-hud-wrapper:hover { opacity: 1; }
            #knd-hud-header {
                padding: 10px 15px;
                background: repeating-linear-gradient(
                    -45deg,
                    rgba(10, 10, 10, 0.9),
                    rgba(10, 10, 10, 0.9) 10px,
                    rgba(240, 240, 240, 0.9) 10px,
                    rgba(240, 240, 240, 0.9) 20px
                );
                border-bottom: 2px solid #000; cursor: grab; display: flex; justify-content: space-between; align-items: center;
            }
            #knd-hud-header > div {
                background: rgba(0,0,0,0.8); padding: 4px 8px; border-radius: 6px;
            }
            #knd-hud-header:active { cursor: grabbing; }
            .knd-header-loc { font-size: 11px; text-transform: uppercase; color: #94a3b8; flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

            .knd-header-api { display: flex; gap: 4px; align-items: center; font-size: 10px; font-weight: bold; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; margin-right: 5px; cursor: default; }
            .knd-status-icon { padding: 2px 4px; border-radius: 3px; color: #fff; text-shadow: 0 0 3px #000; opacity: 0.5; transition: all 0.3s; }
            .knd-status-icon.online { opacity: 1; background: rgba(74, 222, 128, 0.2); color: #4ade80; box-shadow: 0 0 5px rgba(74, 222, 128, 0.5); }
            .knd-status-icon.error { opacity: 1; background: rgba(239, 68, 68, 0.2); color: #ef4444; box-shadow: 0 0 5px rgba(239, 68, 68, 0.5); }
            .knd-status-icon.testing { opacity: 1; color: #eab308; animation: pulseDanger 1s infinite; }
            .knd-token-count { margin-left: 4px; color: #94a3b8; font-family: monospace; }

            .knd-header-controls { flex: 1; text-align: right; display: flex; justify-content: flex-end; gap: 8px; }
            .knd-ctrl-btn { background: none; border: none; cursor: pointer; font-size: 14px; color: #94a3b8; transition: all 0.2s; padding: 0 2px; outline: none; }
            .knd-ctrl-btn:hover { color: #fff; text-shadow: 0 0 5px rgba(255,255,255,0.8); }
            .knd-ctrl-btn:focus-visible { box-shadow: 0 0 0 2px rgba(80, 255, 120, 0.5); border-radius: 4px; }

            #knd-hud-settings, #knd-hud-journal { display: none; padding: 15px; flex-direction: column; gap: 10px; }
            .knd-settings-row { display: flex; flex-direction: column; gap: 4px; }
            .knd-settings-row label { font-size: 10px; font-weight: bold; color: #cbd5e1; }
            .knd-input-group { display: flex; gap: 5px; }
            .knd-input { flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #fff; padding: 6px 8px; font-size: 11px; font-family: monospace; outline: none; }
            .knd-input:focus { border-color: rgba(80, 255, 120, 0.5); }
            .knd-textarea { min-height: 80px; resize: vertical; }

            .knd-btn-ping { background: rgba(80, 255, 120, 0.1); border: 1px solid rgba(80, 255, 120, 0.3); color: #4ade80; cursor: pointer; border-radius: 4px; padding: 4px 8px; font-size: 10px; font-weight: bold; }
            .knd-btn-action { background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.5); color: #60a5fa; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 11px; text-align: center; }
            .knd-btn-action:not(:disabled):hover { background: rgba(59, 130, 246, 0.4); color: #fff; }
            .knd-btn-action.green { background: rgba(80, 255, 120, 0.2); border-color: rgba(80, 255, 120, 0.5); color: #4ade80; }
            .knd-btn-action:disabled, .knd-btn-ping:disabled { opacity: 0.5; cursor: not-allowed; }

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
    const domCache = {};
    const createElement = (tag, id, className, textContent, attributes = {}) => {
        const el = document.createElement(tag);
        if (id) el.id = id;
        if (className) el.className = className;
        if (textContent) el.textContent = textContent;
        for (const [k, v] of Object.entries(attributes)) {
            el.setAttribute(k, v);
        }
        return el;
    };

    const createHUD = () => {
        const hud = createElement('div', 'knd-hud-wrapper');

        // Header
        const header = createElement('div', 'knd-hud-header');
        const locText = createElement('div', 'knd-loc-text', 'knd-header-loc', `📍 ${gameState.loc}`);

        const apiWrapper = createElement('div', null, 'knd-header-api', null, {title: 'API Status & Tokens'});
        apiWrapper.appendChild(createElement('span', 'icon-k', 'knd-status-icon', 'K'));
        apiWrapper.appendChild(createElement('span', 'icon-c', 'knd-status-icon', 'C'));
        apiWrapper.appendChild(createElement('span', 'icon-g', 'knd-status-icon', 'G'));
        apiWrapper.appendChild(createElement('span', 'knd-tokens', 'knd-token-count', '0T'));

        const controls = createElement('div', null, 'knd-header-controls');
        controls.appendChild(createElement('button', 'knd-journal-toggle', 'knd-ctrl-btn', '📝', {title: 'Journal Diary', 'aria-label': 'Toggle Journal'}));
        controls.appendChild(createElement('button', 'knd-config-toggle', 'knd-ctrl-btn', '⚙️', {title: 'Settings', 'aria-label': 'Toggle Settings'}));
        controls.appendChild(createElement('button', 'knd-min-toggle', 'knd-ctrl-btn', '—', {title: 'Minimize', 'aria-label': 'Toggle Minimize'}));

        header.appendChild(locText);
        header.appendChild(apiWrapper);
        header.appendChild(controls);
        hud.appendChild(header);

        // Body
        hud.appendChild(createElement('div', 'knd-hud-body'));

        // Settings Panel
        const settingsPanel = createElement('div', 'knd-hud-settings');

        const createSettingRow = (labelText, inputId, placeholder, btnId) => {
            const row = createElement('div', null, 'knd-settings-row');
            row.appendChild(createElement('label', null, null, labelText, {'for': inputId}));
            const group = createElement('div', null, 'knd-input-group');
            group.appendChild(createElement('input', inputId, 'knd-input', null, {type: 'password', placeholder}));
            group.appendChild(createElement('button', btnId, 'knd-btn-ping', 'PING', {'aria-label': `Ping ${labelText}`}));
            row.appendChild(group);
            return row;
        };

        settingsPanel.appendChild(createSettingRow('KINDROID API KEY (General)', 'inp-api-k', 'sk-kindroid...', 'btn-ping-k'));
        settingsPanel.appendChild(createSettingRow('KIN ID (Character)', 'inp-api-c', 'Kin ID...', 'btn-ping-c'));
        settingsPanel.appendChild(createSettingRow('GEMINI API KEY', 'inp-api-g', 'AIzaSy...', 'btn-ping-g'));
        settingsPanel.appendChild(createElement('button', 'knd-save-keys', 'knd-btn-action', 'SAVE KEYS'));

        hud.appendChild(settingsPanel);

        // Journal Panel
        const journalPanel = createElement('div', 'knd-hud-journal');

        const jRow1 = createElement('div', null, 'knd-settings-row');
        jRow1.appendChild(createElement('label', null, null, 'NEW JOURNAL ENTRY', {'for': 'knd-journal-text'}));
        jRow1.appendChild(createElement('textarea', 'knd-journal-text', 'knd-input knd-textarea', null, {placeholder: 'What happened today? Describe the important event...'}));
        journalPanel.appendChild(jRow1);

        const jRow2 = createElement('div', null, 'knd-settings-row');
        jRow2.appendChild(createElement('label', null, null, 'KEYPHRASES (Comma separated)', {'for': 'knd-journal-keys'}));
        jRow2.appendChild(createElement('input', 'knd-journal-keys', 'knd-input', null, {type: 'text', placeholder: 'ex: travel, fight, secret'}));
        journalPanel.appendChild(jRow2);

        journalPanel.appendChild(createElement('button', 'knd-send-journal', 'knd-btn-action green', 'SEND TO MEMORY'));

        hud.appendChild(journalPanel);

        // Footer
        hud.appendChild(createElement('div', 'knd-hud-footer'));

        document.body.appendChild(hud);
        return hud;
    };

    const buildStatBar = (key, config) => {
        const wrapper = createElement('div', `stat-${key}`, 'knd-stat-container');

        const header = createElement('div', null, 'knd-stat-header');
        header.appendChild(createElement('span', null, null, config.label));
        header.appendChild(createElement('span', `val-${key}`, null, '0%'));
        wrapper.appendChild(header);

        const blocksWrapper = createElement('div', `blocks-${key}`, 'knd-blocks-wrapper');
        for(let i=0; i<10; i++) {
            blocksWrapper.appendChild(createElement('div', null, 'knd-block'));
        }
        wrapper.appendChild(blocksWrapper);

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

    const cacheDOM = () => {
        domCache.locText = document.getElementById('knd-loc-text');
        domCache.tokens = document.getElementById('knd-tokens');
        domCache.pleasureStat = document.getElementById('stat-pleasure');

        Object.keys(gameState.stats).forEach(key => {
            domCache[`val-${key}`] = document.getElementById(`val-${key}`);
            domCache[`blocks-${key}`] = document.getElementById(`blocks-${key}`).children;
        });
    };

    const renderState = () => {
        domCache.locText.textContent = `📍 ${gameState.loc}`;
        domCache.tokens.textContent = gameState.tokens + 'T';

        Object.keys(gameState.stats).forEach(key => {
            const stat = gameState.stats[key];
            const config = statConfig[key];
            const blocks = domCache[`blocks-${key}`];

            domCache[`val-${key}`].textContent = `${Math.round(stat.val)}%`;
            if (key === 'pleasure') domCache.pleasureStat.style.display = stat.val > 0 ? 'flex' : 'none';

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
        span.className = 'knd-floating-text'; span.style.color = color; span.textContent = text;
        footer.appendChild(span);
        setTimeout(() => { if(footer.contains(span)) span.remove(); }, 2500);
    };

    // ==========================================
    // 4. CASCADE ENGINE & RECOVERY
    // ==========================================
    const modifyStat = (key, rawDelta) => {
        if(!gameState.stats[key]) return;

        // Security: Input validation to prevent LLM JSON from injecting NaN/Strings
        let delta = parseFloat(rawDelta);
        if (isNaN(delta)) return;

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
            // Security: Prevent untrusted input leakage into logs
            console.error("Kindroid V4: Parse JSON Error.");
        }
    };

    const initObserver = () => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if(mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 || node.nodeType === 3) {
                            const text = node.textContent || "";
                            if (!text.includes('"loc"')) return;

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

        document.getElementById('inp-api-k').value = savedKeys.k;
        document.getElementById('inp-api-c').value = savedKeys.c;
        document.getElementById('inp-api-g').value = savedKeys.g;

        document.getElementById('knd-save-keys').addEventListener('click', () => {
            // Security: Sanitize newlines to prevent HTTP Header Injection
            const sanitizeKey = (val) => val.replace(/[\r\n]/g, '').trim();
            gameState.apiKeys.k = sanitizeKey(document.getElementById('inp-api-k').value);
            gameState.apiKeys.c = sanitizeKey(document.getElementById('inp-api-c').value);
            gameState.apiKeys.g = sanitizeKey(document.getElementById('inp-api-g').value);
            GM_setValue('knd_rp_keys', JSON.stringify(gameState.apiKeys));
            showLog('[KEYS SAVED]', '#4ade80');
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

        // ACTION: SEND JOURNAL
        document.getElementById('knd-send-journal').addEventListener('click', async (e) => {
            const btn = e.currentTarget;
            const entry = document.getElementById('knd-journal-text').value.trim();
            const keysRaw = document.getElementById('knd-journal-keys').value.trim();

            // Security: Sanitize stored keys before using in headers
            const safeKeyK = (gameState.apiKeys.k || '').replace(/[\r\n]/g, '').trim();
            const safeKeyC = (gameState.apiKeys.c || '').replace(/[\r\n]/g, '').trim();

            if(!entry || !safeKeyK || !safeKeyC) {
                showLog('[ERROR: MISSING DATA OR KEYS]', '#ef4444');
                return;
            }

            const keyphrases = keysRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);
            showLog('[SENDING TO MEMORY...]', '#eab308');

            const origText = btn.textContent;
            btn.textContent = 'SENDING...';
            btn.disabled = true;

            try {
                const res = await gmFetch("https://api.kindroid.ai/v1/journal-create", {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${safeKeyK}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ai_id: safeKeyC,
                        entry: entry,
                        keyphrases: keyphrases
                    })
                });

                if(res.ok) {
                    showLog('[MEMORY SAVED SUCCESSFULLY]', '#4ade80');
                    document.getElementById('knd-journal-text').value = '';
                    document.getElementById('knd-journal-keys').value = '';
                } else {
                    throw new Error();
                }
            } catch (e) {
                showLog('[FAILED TO SAVE MEMORY]', '#ef4444');
            } finally {
                btn.textContent = origText;
                btn.disabled = false;
            }
        });

        const pingAPI = async (type, btn) => {
            const icon = document.getElementById(`icon-${type}`);
            // Security: Prevent header injection by removing newlines
            const targetVal = document.getElementById(`inp-api-${type}`).value.replace(/[\r\n]/g, '').trim();
            const keyK = document.getElementById('inp-api-k').value.replace(/[\r\n]/g, '').trim();
            if(!targetVal) { icon.className = 'knd-status-icon error'; return; }

            icon.className = 'knd-status-icon testing';

            const origText = btn.textContent;
            btn.textContent = '...';
            btn.disabled = true;

            try {
                let success = false;
                if (type === 'g') {
                    // Security: URL Encode API key to prevent injection
                    const res = await gmFetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(targetVal)}`, {
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
                        body: JSON.stringify({ ai_id: targetVal }) // ai_id is sent in JSON body, safe
                    });
                    success = res.ok;
                }
                icon.className = success ? 'online' : 'error';
                if(success) gameState.apiKeys[type] = targetVal;
            } catch (err) { icon.className = 'knd-status-icon error'; } finally {
                btn.textContent = origText;
                btn.disabled = false;
            }
        };

        document.getElementById('btn-ping-k').addEventListener('click', (e) => pingAPI('k', e.currentTarget));
        document.getElementById('btn-ping-c').addEventListener('click', (e) => pingAPI('c', e.currentTarget));
        document.getElementById('btn-ping-g').addEventListener('click', (e) => pingAPI('g', e.currentTarget));
    };

    // ==========================================
    // 8. BOOTSTRAP
    // ==========================================
    const init = () => {
        injectCSS();
        const hud = createHUD();
        assembleBody();
        cacheDOM();
        initDraggable(hud);
        initToolsLogic();
        renderState();
        initObserver();
        console.log("🎬 Kindroid Cinematic RP System Beta 0.2: INITIALIZED.");
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

})();
