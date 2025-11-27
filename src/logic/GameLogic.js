export class GameLogic {
    constructor(config) {
        this.config = config;
        this.state = this.loadData() || this.getInitialState();

        // Runtime state (not saved)
        this.cleanedPercentage = 0;
        this.isComplete = false;
        this.currentArtifact = { value: 0, rarity: 'COMMON', isGlitch: false, isBoss: false };
        this.combo = 1.0;
        this.lastCleanTime = 0;
        this.shake = 0;
        this.hasStarted = false;
        this.novaCharge = 0;
        this.level = 1; // Session level count
    }

    getInitialState() {
        return {
            credits: 1000, // Starting credits (V9 compatibility)
            xp: 0,
            rankIdx: 0,
            toolLevel: 1,
            valueLevel: 1,
            droneLevel: 0,
            toolCost: 150,
            valueCost: 300,
            droneCost: 500,
            prestigeMultiplier: 1.0,
            prestigeCount: 0
        };
    }

    loadData() {
        const s = localStorage.getItem('cyberScrapperV10');
        return s ? JSON.parse(s) : null;
    }

    saveData() {
        localStorage.setItem('cyberScrapperV10', JSON.stringify(this.state));
    }

    resetForPrestige() {
        const multiplier = this.state.prestigeMultiplier * 2;
        const count = this.state.prestigeCount + 1;
        this.state = this.getInitialState();
        this.state.prestigeMultiplier = multiplier;
        this.state.prestigeCount = count;
        this.saveData();
    }

    // --- Actions ---

    upgradeTool() {
        if (this.state.credits >= this.state.toolCost) {
            this.state.credits -= this.state.toolCost;
            this.state.toolLevel++;
            this.state.toolCost = Math.floor(this.state.toolCost * 1.5);
            this.saveData();
            return true;
        }
        return false;
    }

    upgradeValue() {
        if (this.state.credits >= this.state.valueCost) {
            this.state.credits -= this.state.valueCost;
            this.state.valueLevel++;
            this.state.valueCost = Math.floor(this.state.valueCost * 1.6);
            this.saveData();
            return true;
        }
        return false;
    }

    upgradeDrone() {
        if (this.state.credits >= this.state.droneCost) {
            this.state.credits -= this.state.droneCost;
            this.state.droneLevel++;
            this.state.droneCost = Math.floor(this.state.droneCost * 1.8);
            this.saveData();
            return true;
        }
        return false;
    }

    gainXP(amount) {
        this.state.xp += amount;
        const rank = this.config.ranks[this.state.rankIdx];
        let leveledUp = false;
        if (this.state.xp >= rank.max && this.state.rankIdx < this.config.ranks.length - 1) {
            this.state.rankIdx++;
            this.state.xp = 0;
            leveledUp = true;
        }
        return leveledUp;
    }

    sellArtifact() {
        const val = Math.floor(this.currentArtifact.value * this.combo * this.state.prestigeMultiplier);
        this.state.credits += val;
        const leveledUp = this.gainXP(val * 0.1);
        this.saveData();
        return { val, leveledUp };
    }

    claimAdReward(amount) {
        const val = Math.floor(amount * this.state.prestigeMultiplier);
        this.state.credits += val;
        this.saveData();
        return val;
    }

    checkCompletion() {
        if (this.cleanedPercentage >= this.config.cleanThreshold && !this.isComplete) {
            this.isComplete = true;
            return true;
        }
        return false;
    }
}
