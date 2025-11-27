import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        // Load texture from CDN for now, or local asset if we had one. Using the one from V9.
        this.texture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/spark1.png');
        this.material = new THREE.SpriteMaterial({
            map: this.texture,
            color: 0x00ffff,
            blending: THREE.AdditiveBlending
        });
    }

    spawn(pos, count = 1) {
        for (let i = 0; i < count; i++) {
            const p = new THREE.Sprite(this.material.clone());
            p.position.copy(pos);
            p.scale.setScalar(0.2 + Math.random() * 0.1);

            // Physics properties
            p.userData = {
                vel: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.15,
                    (Math.random() - 0.5) * 0.1 + 0.15, // Initial upward burst
                    (Math.random() - 0.5) * 0.15
                ),
                life: 1.0,
                gravity: 0.006
            };
            this.scene.add(p);
            this.particles.push(p);
        }
    }

    setComboColor(combo) {
        // Color changes from cyan (low) to magenta (high)
        const t = Math.min(combo / 10, 1);
        const color = new THREE.Color();
        color.lerpColors(new THREE.Color(0x00ffff), new THREE.Color(0xff00ff), t);
        this.material.color = color;
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];

            // Physics
            p.userData.vel.y -= p.userData.gravity; // Gravity
            p.position.add(p.userData.vel);

            // Floor bounce (y = -2 is roughly floor)
            if (p.position.y < -2) {
                p.position.y = -2;
                p.userData.vel.y *= -0.6; // Bounce with damping
                p.userData.vel.x *= 0.8; // Friction
                p.userData.vel.z *= 0.8;
            }

            // Life
            p.material.opacity = p.userData.life;
            p.userData.life -= 0.02;

            if (p.userData.life <= 0) {
                this.scene.remove(p);
                this.particles.splice(i, 1);
            }
        }
    }
}
