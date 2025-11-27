import * as THREE from 'three';

export class ArtifactManager {
    constructor(scene, gameLogic) {
        this.scene = scene;
        this.gameLogic = gameLogic;

        this.group = null;
        this.dirtMesh = null;
        this.dirtCanvas = null;
        this.dirtCtx = null;
        this.dirtTex = null;

        this.TEX_SIZE = 1024;
        this.isDirty = false; // Optimization Flag
    }

    init() {
        this.dirtCanvas = document.createElement('canvas');
        this.dirtCanvas.width = this.dirtCanvas.height = this.TEX_SIZE;
        this.dirtCtx = this.dirtCanvas.getContext('2d');
    }

    generate(level) {
        if (this.group) this.scene.remove(this.group);

        // Reset Logic
        this.gameLogic.cleanedPercentage = 0;
        this.gameLogic.isComplete = false;
        this.gameLogic.combo = 1.0;
        this.gameLogic.novaCharge = 0;

        // Init Dirt Texture
        this.initDirt();

        // Boss Check
        const isBoss = (level % 10 === 0);
        this.gameLogic.currentArtifact.isBoss = isBoss;

        // Glitch Chance (if not boss)
        const isGlitch = !isBoss && Math.random() > 0.95;
        this.gameLogic.currentArtifact.isGlitch = isGlitch;

        let color = isGlitch ? 0xff0000 : 0x00ffff;
        if (isBoss) color = 0xff00ff; // Boss Color

        let scale = isGlitch ? 1.5 : 1.0;
        if (isBoss) scale = 3.0; // Giant

        // Value Calculation
        const valueBase = 250 * (this.gameLogic.state.rankIdx + 1);
        let multiplier = 1;
        if (isGlitch) multiplier = 20;
        if (isBoss) multiplier = 50;

        this.gameLogic.currentArtifact.value = valueBase * multiplier * this.gameLogic.state.valueLevel;

        // Geometry
        this.group = new THREE.Group();
        const shapes = ['box', 'cylinder', 'dodeca', 'torus'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        let geo;

        if (isBoss) {
            // Boss is always complex
            geo = new THREE.IcosahedronGeometry(1, 1);
        } else {
            if (shape === 'box') geo = new THREE.BoxGeometry(1.3, 1.3, 1.3);
            else if (shape === 'cylinder') geo = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 32);
            else if (shape === 'torus') geo = new THREE.TorusKnotGeometry(0.5, 0.2, 100, 16);
            else geo = new THREE.DodecahedronGeometry(1);
        }

        // Core Material
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.2,
            metalness: 1.0,
            emissive: color,
            emissiveIntensity: isGlitch ? 2 : 0.5
        });
        const core = new THREE.Mesh(geo, coreMat);
        this.group.add(core);

        // Wireframe Overlay
        const dMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.05 });
        const wire = new THREE.Mesh(geo, dMat);
        wire.scale.setScalar(1.02);
        this.group.add(wire);

        // Dirt Layer
        const dirtMat = new THREE.MeshStandardMaterial({
            color: 0x4a3b2a,
            roughness: 1,
            alphaMap: this.dirtTex,
            transparent: true,
            side: THREE.DoubleSide
        });
        const dirtGroup = new THREE.Group();
        const dMesh = new THREE.Mesh(geo, dirtMat);
        dMesh.scale.setScalar(1.01);
        dirtGroup.add(dMesh);

        this.dirtMesh = dirtGroup;
        this.group.add(dirtGroup);

        this.group.scale.setScalar(scale);
        this.scene.add(this.group);

        return { isGlitch, isBoss };
    }

    initDirt() {
        this.dirtCtx.globalCompositeOperation = 'source-over';
        this.dirtCtx.fillStyle = '#fff';
        this.dirtCtx.fillRect(0, 0, this.TEX_SIZE, this.TEX_SIZE);

        // Random dirt pattern
        for (let i = 0; i < 1500; i++) {
            this.dirtCtx.beginPath();
            this.dirtCtx.arc(Math.random() * this.TEX_SIZE, Math.random() * this.TEX_SIZE, Math.random() * 40 + 5, 0, 6.28);
            this.dirtCtx.fillStyle = `rgba(80,60,50,${Math.random() * 0.6})`;
            this.dirtCtx.fill();
        }

        if (this.dirtTex) this.dirtTex.dispose();
        this.dirtTex = new THREE.CanvasTexture(this.dirtCanvas);
        this.isDirty = true;
    }

    paint(uv, brushSizeMultiplier = 1, isNova = false) {
        this.dirtCtx.globalCompositeOperation = 'destination-out';
        this.dirtCtx.beginPath();

        let size = 0.15 * (1 + (this.gameLogic.state.toolLevel - 1) * 0.05) * brushSizeMultiplier;
        if (isNova) size = 500; // Huge

        this.dirtCtx.arc(uv.x * this.TEX_SIZE, (1 - uv.y) * this.TEX_SIZE, size * this.TEX_SIZE, 0, 6.28);
        this.dirtCtx.fill();

        this.isDirty = true; // Mark for update

        // Calculate Progress (Simplified approximation)
        const cleanAmount = (0.3 * this.gameLogic.state.toolLevel * brushSizeMultiplier) * (isNova ? 10 : 1);
        this.gameLogic.cleanedPercentage += cleanAmount;
        if (this.gameLogic.cleanedPercentage > 100) this.gameLogic.cleanedPercentage = 100;

        return this.gameLogic.cleanedPercentage;
    }

    update() {
        // Optimization: Only update texture if painted
        if (this.isDirty && this.dirtTex) {
            this.dirtTex.needsUpdate = true;
            this.isDirty = false;
        }

        if (this.group) {
            // Rotation
            if (this.gameLogic.isComplete) {
                this.group.rotation.y += 0.05;
            } else {
                this.group.rotation.y += 0.002;

                // Rotation Damping
                this.group.rotation.x *= 0.95;
            }

            // Boss Pulsing Effect
            if (this.gameLogic.currentArtifact.isBoss && !this.gameLogic.isComplete) {
                const pulse = Math.sin(Date.now() * 0.002) * 0.1 + 1;
                this.group.scale.setScalar(3.0 * pulse);
            }
        }
    }
}
