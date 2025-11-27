import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

const RGBShiftShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'amount': { value: 0.005 },
        'angle': { value: 0.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float amount;
        uniform float angle;
        varying vec2 vUv;
        void main() {
            vec2 offset = amount * vec2( cos(angle), sin(angle));
            vec4 cr = texture2D(tDiffuse, vUv + offset);
            vec4 cga = texture2D(tDiffuse, vUv);
            vec4 cb = texture2D(tDiffuse, vUv - offset);
            gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
        }`
};

export class PostProcessing {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.composer = null;
        this.bloom = null;
        this.rgbShift = null;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    init() {
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        this.bloom = new UnrealBloomPass(new THREE.Vector2(this.width, this.height), 1.5, 0.4, 0.85);
        this.bloom.threshold = 0;
        this.bloom.strength = 1.2;
        this.bloom.radius = 0.5;
        this.composer.addPass(this.bloom);

        this.rgbShift = new ShaderPass(RGBShiftShader);
        this.rgbShift.uniforms['amount'].value = 0.0;
        this.composer.addPass(this.rgbShift);
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.composer.setSize(width, height);
        this.bloom.resolution.set(width, height);
    }

    setShake(amount) {
        if (this.rgbShift) {
            this.rgbShift.uniforms['amount'].value = amount * 0.03;
        }
    }

    update() {
        // Decay shake effect
        if (this.rgbShift && this.rgbShift.uniforms['amount'].value > 0) {
            this.rgbShift.uniforms['amount'].value *= 0.9;
            if (this.rgbShift.uniforms['amount'].value < 0.001) {
                this.rgbShift.uniforms['amount'].value = 0;
            }
        }
    }

    render() {
        this.composer.render();
    }

    // Optimization: Low Quality Mode
    setQuality(isLow) {
        if (isLow) {
            this.bloom.resolution.set(this.width / 2, this.height / 2);
            this.rgbShift.enabled = false;
        } else {
            this.bloom.resolution.set(this.width, this.height);
            this.rgbShift.enabled = true;
        }
    }
}
