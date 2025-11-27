import * as THREE from 'three';

export class InputManager {
    constructor(game) {
        this.game = game;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.isDown = false;
    }

    init() {
        window.addEventListener('mousemove', e => {
            if (this.game.logic.hasStarted) {
                // Trail logic could go here or in Game loop
                if (e.buttons === 1) this.handleInput(e.clientX, e.clientY);
            }
        });

        window.addEventListener('touchmove', e => {
            if (this.game.logic.hasStarted) {
                this.handleInput(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });

        window.addEventListener('mousedown', () => this.isDown = true);
        window.addEventListener('mouseup', () => {
            this.isDown = false;
            this.game.audio.setSound(false);
            this.game.logic.combo = 1;
            this.game.ui.updateCombo(1);
        });

        window.addEventListener('touchstart', () => this.isDown = true);
        window.addEventListener('touchend', () => {
            this.isDown = false;
            this.game.audio.setSound(false);
            this.game.logic.combo = 1;
            this.game.ui.updateCombo(1);
        });
    }

    handleInput(x, y) {
        if (this.game.logic.isComplete) return;

        this.mouse.x = (x / window.innerWidth) * 2 - 1;
        this.mouse.y = -(y / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.game.scene.camera);

        const intersects = [];
        if (this.game.artifactManager.dirtMesh) {
            this.game.artifactManager.dirtMesh.traverse(c => {
                if (c.isMesh) {
                    const h = this.raycaster.intersectObject(c);
                    if (h.length > 0) intersects.push(h[0]);
                }
            });
        }

        if (intersects.length > 0 && intersects[0].uv) {
            const hit = intersects[0];
            this.game.artifactManager.paint(hit.uv);

            // Enhanced Particles (more on impact)
            const particleCount = Math.floor(this.game.logic.combo);
            this.game.scene.particles.setComboColor(this.game.logic.combo);
            this.game.scene.particles.spawn(hit.point, particleCount + 2);

            // Physics Rotation with Damping
            if (this.game.artifactManager.group) {
                this.game.artifactManager.group.rotation.x += this.mouse.y * 0.03;
                this.game.artifactManager.group.rotation.y += this.mouse.x * 0.03;
            }

            // Camera Shake on Impact
            const shakeAmount = 0.02 * this.game.logic.combo;
            this.game.logic.shake = Math.max(this.game.logic.shake, shakeAmount);

            // Sound & Combo
            this.game.audio.setSound(true, this.game.logic.combo, this.game.logic.cleanedPercentage, this.game.logic.combo);

            const now = Date.now();
            if (now - this.game.logic.lastCleanTime < 250) {
                this.game.logic.combo = Math.min(this.game.logic.combo + 0.1, 10.0);
            } else {
                this.game.logic.combo = 1.0;
            }
            this.game.logic.lastCleanTime = now;
            this.game.ui.updateCombo(this.game.logic.combo);

            // Check Nova Charge
            if (this.game.logic.novaCharge < 100) {
                this.game.logic.novaCharge += 0.5;
            }

        } else {
            this.game.audio.setSound(false);
            this.game.logic.combo = 1.0;
            this.game.ui.updateCombo(1.0);
        }

        this.game.ui.update();
        if (this.game.logic.checkCompletion()) {
            this.game.completeLevel();
        }
    }
}
