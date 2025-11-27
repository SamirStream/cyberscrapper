import * as THREE from 'three';

export class DroneSystem {
    constructor(scene, artifactManager) {
        this.scene = scene;
        this.artifactManager = artifactManager;
        this.drones = [];
        this.raycaster = new THREE.Raycaster();
        this.lastShot = 0;
    }

    spawn(count) {
        // Clear old
        this.drones.forEach(d => this.scene.remove(d));
        this.drones = [];

        const geo = new THREE.ConeGeometry(0.1, 0.2, 4);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.x = Math.PI / 2;
            const group = new THREE.Group();
            group.add(mesh);

            group.userData = {
                angle: (Math.PI * 2 / count) * i,
                speed: 0.02 + Math.random() * 0.01,
                height: 1 + Math.random() * 0.5,
                radius: 2.5
            };

            this.scene.add(group);
            this.drones.push(group);
        }
    }

    update() {
        // Orbit
        this.drones.forEach(d => {
            d.userData.angle += d.userData.speed;
            d.position.x = Math.cos(d.userData.angle) * d.userData.radius;
            d.position.z = Math.sin(d.userData.angle) * d.userData.radius;
            d.position.y = Math.sin(Date.now() * 0.001 + d.userData.angle) * 0.5 + d.userData.height;
            d.lookAt(0, 0, 0);
        });

        // Shoot Logic
        if (Date.now() - this.lastShot > 500 && !this.artifactManager.gameLogic.isComplete && this.artifactManager.dirtMesh) {
            let fired = false;
            this.drones.forEach(d => {
                this.raycaster.set(d.position, new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), d.position).normalize());
                const intersects = [];
                this.artifactManager.dirtMesh.traverse(c => {
                    if (c.isMesh) {
                        const h = this.raycaster.intersectObject(c);
                        if (h.length > 0) intersects.push(h[0]);
                    }
                });

                if (intersects.length > 0 && intersects[0].uv) {
                    this.artifactManager.paint(intersects[0].uv, 0.5); // Half power

                    // Laser visual
                    const laserGeo = new THREE.BufferGeometry().setFromPoints([d.position, intersects[0].point]);
                    const laser = new THREE.Line(laserGeo, new THREE.LineBasicMaterial({ color: 0x00ff00, transparent: true }));
                    this.scene.add(laser);
                    setTimeout(() => this.scene.remove(laser), 50);
                    fired = true;
                }
            });
            if (fired) this.lastShot = Date.now();
            return fired; // Return true if fired to trigger sound
        }
        return false;
    }
}
