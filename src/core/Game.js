import { AudioSystem } from './AudioSystem.js';
import { GameLogic } from '../logic/GameLogic.js';
import { ThreeScene } from '../engine/ThreeScene.js';
import { UIManager } from '../ui/UIManager.js';
import { ArtifactManager } from '../logic/ArtifactManager.js';
import { DroneSystem } from '../logic/DroneSystem.js';
import { InputManager } from './InputManager.js';
import { AdService } from '../logic/AdService.js';

const CONFIG = {
    baseBrushSize: 0.15,
    baseValue: 250,
    cleanThreshold: 99.8,
    ranks: [
        { name: "NOVICE", max: 1000 },
        { name: "HUNTER", max: 5000 },
        { name: "SPECIALIST", max: 15000 },
        { name: "DATA LORD", max: 50000 },
        { name: "SINGULARITY", max: 1000000 }
    ]
};

export class Game {
    constructor() {
        this.audio = new AudioSystem();
        this.logic = new GameLogic(CONFIG);
        this.scene = new ThreeScene();
        this.ui = new UIManager(this.logic);
        this.artifactManager = new ArtifactManager(this.scene, this.logic);
        this.drones = new DroneSystem(this.scene.scene, this.artifactManager); // Pass raw scene to drones
        this.input = new InputManager(this);
        this.adService = new AdService();

        this.loop = this.loop.bind(this);
    }

    async init() {
        console.log("Game Initializing...");

        this.scene.init('game-container');
        this.artifactManager.init();
        this.input.init();

        // Bind UI
        document.getElementById('btn-start').onclick = () => this.start();

        // Shop
        document.getElementById('btn-upgrade-tool').onclick = () => {
            if (this.logic.upgradeTool()) { this.audio.sfx('coin'); this.ui.update(); }
        };
        document.getElementById('btn-upgrade-value').onclick = () => {
            if (this.logic.upgradeValue()) { this.audio.sfx('coin'); this.ui.update(); }
        };
        document.getElementById('btn-upgrade-drone').onclick = () => {
            if (this.logic.upgradeDrone()) {
                this.audio.sfx('coin');
                this.drones.spawn(this.logic.state.droneLevel);
                this.ui.update();
            }
        };

        // Ad Network
        document.getElementById('btn-ads').onclick = () => this.openAdNetwork();
        document.getElementById('ad-close').onclick = () => {
            document.getElementById('ad-modal-overlay').style.display = 'none';
        };

        // Actions
        document.getElementById('action-btn').onclick = () => this.sell();
        document.getElementById('nova-container').onclick = () => this.triggerNova();
        document.getElementById('btn-prestige').onclick = () => this.prestige();

        this.ui.update();
    }

    async openAdNetwork() {
        const overlay = document.getElementById('ad-modal-overlay');
        const list = document.getElementById('ad-list');
        overlay.style.display = 'flex';
        list.innerHTML = '<div style="color:#888;">SCANNING NETWORK...</div>';

        try {
            const ads = await this.adService.getAvailableAds();
            list.innerHTML = '';
            ads.forEach(ad => {
                const el = document.createElement('div');
                el.className = 'ad-item';
                el.innerHTML = `
                    <div class="ad-title">${ad.title}</div>
                    <div class="ad-reward">+${ad.reward} CR</div>
                `;
                el.onclick = () => this.watchAd(ad);
                list.appendChild(el);
            });
        } catch (e) {
            list.innerHTML = '<div style="color:red;">NETWORK ERROR</div>';
        }
    }

    async watchAd(ad) {
        document.getElementById('ad-modal-overlay').style.display = 'none';
        const timerOverlay = document.getElementById('ad-timer-overlay');
        const fill = document.getElementById('ad-timer-fill');

        timerOverlay.style.display = 'flex';
        fill.style.width = '0%';

        // Animate bar
        const start = Date.now();
        const duration = ad.duration;

        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const pct = Math.min(100, (elapsed / duration) * 100);
            fill.style.width = pct + '%';

            if (elapsed >= duration) {
                clearInterval(interval);
            }
        }, 50);

        try {
            const result = await this.adService.watchAd(ad.id);
            timerOverlay.style.display = 'none';

            if (result.success) {
                this.logic.claimAdReward(result.reward);
                this.ui.update();
                this.ui.spawnFloatText(window.innerWidth / 2, window.innerHeight / 2, `DATA SOLD: +${result.reward}`, "#00ff00", 3);
                this.audio.sfx('coin');
            }
        } catch (e) {
            timerOverlay.style.display = 'none';
            console.error(e);
        }
    }

    start() {
        this.audio.init();
        this.audio.resume();
        this.logic.hasStarted = true;

        document.getElementById('start-screen').style.display = 'none';

        this.drones.spawn(this.logic.state.droneLevel);
        this.nextLevel();

        requestAnimationFrame(this.loop);
    }

    nextLevel() {
        const { isGlitch, isBoss } = this.artifactManager.generate(this.logic.level);

        this.ui.showGlitch(isGlitch);
        this.ui.showBoss(isBoss);

        if (isGlitch) this.audio.sfx('glitch');
        if (isBoss) this.audio.sfx('glitch'); // Boss sound placeholder

        this.ui.update();
    }

    sell() {
        const { val, leveledUp } = this.logic.sellArtifact();
        this.audio.sfx('coin');

        // Visuals
        const container = document.getElementById('credits-container');
        container.style.transform = 'scale(1.2)';
        setTimeout(() => container.style.transform = 'scale(1)', 100);

        if (leveledUp) {
            this.ui.spawnFloatText(window.innerWidth / 2, window.innerHeight / 2, "RANK UP!", "#ffd700", 4);
            this.audio.sfx('win');
        }

        this.logic.level++;
        this.nextLevel();
    }

    triggerNova() {
        this.audio.sfx('nova');
        this.scene.postProcessing.setShake(1.0);
        this.ui.spawnFloatText(window.innerWidth / 2, window.innerHeight / 2, "NOVA BLAST!", "#00ffff", 4);

        // Clean huge chunk center
        this.artifactManager.paint({ x: 0.5, y: 0.5 }, 1, true);

        this.logic.novaCharge = 0;
        this.ui.update();
    }

    completeLevel() {
        this.audio.setSound(false);
        this.audio.sfx('win');
        this.ui.update();
    }

    prestige() {
        if (confirm("HARD RESET? You will lose all progress but gain x2 Multiplier.")) {
            this.logic.resetForPrestige();
            this.logic.level = 1;
            this.drones.spawn(0);
            this.nextLevel();
            this.ui.update();
        }
    }

    loop() {
        requestAnimationFrame(this.loop);

        if (!this.logic.hasStarted) return;

        this.drones.update();
        this.artifactManager.update();

        // Camera Shake
        if (this.logic.shake > 0) {
            this.scene.applyShake(this.logic.shake);
            this.logic.shake *= 0.85; // Decay
            if (this.logic.shake < 0.001) this.logic.shake = 0;
        } else {
            this.scene.applyShake(0);
        }

        this.scene.update();
        this.scene.render();
    }
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    window.game = game;
    game.init();
});
