import * as THREE from 'three';
import { PostProcessing } from './PostProcessing.js';
import { ParticleSystem } from './ParticleSystem.js';

export class ThreeScene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.postProcessing = null;
        this.particles = null;
        this.grid = null;
        this.raycaster = new THREE.Raycaster();

        // Performance Monitoring
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fps = 60;
    }

    init(containerId) {
        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 1.8, 4.5);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        document.getElementById(containerId).appendChild(this.renderer.domElement);

        // Post Processing
        this.postProcessing = new PostProcessing(this.renderer, this.scene, this.camera);
        this.postProcessing.init();

        // Particles
        this.particles = new ParticleSystem(this.scene);

        // Lights
        this.scene.add(new THREE.AmbientLight(0x444444, 4));
        const dirLight = new THREE.DirectionalLight(0xffffff, 2);
        dirLight.position.set(5, 10, 5);
        this.scene.add(dirLight);
        const rimLight = new THREE.PointLight(0x00ffff, 3, 10);
        rimLight.position.set(-4, 2, -2);
        this.scene.add(rimLight);

        // Grid
        this.createGrid();

        // Resize Handler
        window.addEventListener('resize', () => this.onResize());
    }

    createGrid() {
        this.grid = new THREE.Group();
        const gridMat = new THREE.LineBasicMaterial({ color: 0xff0055, transparent: true, opacity: 0.15 });
        for (let i = -30; i <= 30; i += 3) {
            let pts = []; pts.push(new THREE.Vector3(i, -4, -50)); pts.push(new THREE.Vector3(i, -4, 30));
            let g = new THREE.BufferGeometry().setFromPoints(pts); this.grid.add(new THREE.Line(g, gridMat));
            pts = []; pts.push(new THREE.Vector3(-30, -4, i)); pts.push(new THREE.Vector3(30, -4, i));
            g = new THREE.BufferGeometry().setFromPoints(pts);
            let l = new THREE.Line(g, gridMat); l.userData = { z: i }; this.grid.add(l);
        }
        this.scene.add(this.grid);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.postProcessing.setSize(window.innerWidth, window.innerHeight);
    }

    update() {
        // Grid Animation
        this.grid.children.forEach(l => {
            if (l.userData.z !== undefined) {
                l.position.z += 0.05;
                if (l.position.z > 50) l.position.z = -30;
            }
        });

        this.particles.update();
        this.postProcessing.update();

        // FPS Check
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;

            // Dynamic Quality
            if (this.fps < 30) this.postProcessing.setQuality(true);
            else if (this.fps > 50) this.postProcessing.setQuality(false);
        }
    }

    applyShake(shakeAmount) {
        if (shakeAmount > 0) {
            this.camera.position.x = (Math.random() - 0.5) * shakeAmount;
            this.camera.position.y = 1.8 + (Math.random() - 0.5) * shakeAmount;
        } else {
            // Reset to default
            this.camera.position.x = 0;
            this.camera.position.y = 1.8;
        }
    }

    render() {
        this.postProcessing.render();
    }

    add(obj) { this.scene.add(obj); }
    remove(obj) { this.scene.remove(obj); }
}
