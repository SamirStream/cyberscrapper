export class UIManager {
    constructor(gameLogic) {
        this.gameLogic = gameLogic;
        this.dom = {
            rankName: document.getElementById('rank-name'),
            xpVal: document.getElementById('xp-val'),
            xpBar: document.getElementById('xp-bar'),
            score: document.getElementById('score'),

            lvlTool: document.getElementById('lvl-tool'),
            lvlValue: document.getElementById('lvl-value'),
            lvlDrone: document.getElementById('lvl-drone'),

            costTool: document.getElementById('cost-tool'),
            costValue: document.getElementById('cost-value'),
            costDrone: document.getElementById('cost-drone'),

            progBar: document.getElementById('prog-bar'),
            progText: document.getElementById('prog-text'),

            sellVal: document.getElementById('sell-val'),
            actionBtn: document.getElementById('action-btn'),

            glitchMsg: document.getElementById('glitch-msg'),
            bossMsg: document.getElementById('boss-msg'),

            novaContainer: document.getElementById('nova-container'),
            novaBar: document.getElementById('nova-bar'),

            prestigeContainer: document.getElementById('prestige-container')
        };
    }

    update() {
        const state = this.gameLogic.state;
        const config = this.gameLogic.config;

        // Progress
        const pct = Math.min(100, Math.floor(this.gameLogic.cleanedPercentage));
        this.dom.progBar.style.width = pct + '%';
        if (!this.gameLogic.isComplete) {
            this.dom.progText.innerText = `INTEGRITY: ${pct}%`;
            this.dom.progText.style.color = "#0ff";
            this.dom.progBar.style.background = 'linear-gradient(90deg, #00ffff, #ff0055)';
            this.dom.actionBtn.style.display = 'none';
        } else {
            this.dom.progText.innerText = "100% PURE";
            this.dom.progText.style.color = "#00ff00";
            this.dom.progBar.style.background = '#00ff00';
            this.dom.actionBtn.style.display = 'block';
        }

        // Stats
        this.dom.score.innerText = Math.floor(state.credits);

        const rank = config.ranks[state.rankIdx];
        this.dom.rankName.innerText = rank.name;
        const xpPct = Math.floor((state.xp / rank.max) * 100);
        this.dom.xpVal.innerText = xpPct;
        this.dom.xpBar.style.width = xpPct + '%';

        // Shop
        this.dom.lvlTool.innerText = state.toolLevel;
        this.dom.lvlValue.innerText = state.valueLevel;
        this.dom.lvlDrone.innerText = state.droneLevel;
        this.dom.costTool.innerText = state.toolCost;
        this.dom.costValue.innerText = state.valueCost;
        this.dom.costDrone.innerText = state.droneCost;

        this.dom.sellVal.innerText = Math.floor(this.gameLogic.currentArtifact.value * this.gameLogic.combo * state.prestigeMultiplier);

        // Nova
        this.dom.novaBar.style.width = this.gameLogic.novaCharge + '%';
        if (this.gameLogic.novaCharge >= 100) {
            this.dom.novaContainer.style.display = 'flex';
        } else {
            this.dom.novaContainer.style.display = 'none';
        }

        // Prestige
        if (state.rankIdx >= config.ranks.length - 1) {
            this.dom.prestigeContainer.style.display = 'block';
        } else {
            this.dom.prestigeContainer.style.display = 'none';
        }
    }

    showGlitch(show) {
        this.dom.glitchMsg.style.display = show ? 'block' : 'none';
    }

    showBoss(show) {
        this.dom.bossMsg.style.display = show ? 'block' : 'none';
    }

    updateCombo(combo) {
        const box = document.getElementById('combo-box');
        if (combo > 1.5) {
            box.style.opacity = 1;
            document.getElementById('combo-val').innerText = 'x' + combo.toFixed(1);
            box.style.transform = `translateX(-50%) scale(${1 + (combo * 0.1)})`;
        } else {
            box.style.opacity = 0;
        }
    }

    spawnFloatText(x, y, txt, col, size = 1.5) {
        const el = document.createElement('div');
        el.className = 'floating-txt';
        el.innerText = txt;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.color = col;
        el.style.fontSize = size + 'rem';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 800);
    }
}
