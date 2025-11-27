⚙️ Technical Specifications & Architecture

1. Architecture Actuelle (V9) vs Cible (V10)

Actuelle (Monolithique)

Tout le code réside dans un seul fichier HTML/JS.

gameState : Objet global gérant l'état.

initAudio() : Initialisation WebAudio.

animate() : Boucle de rendu unique gérant Three.js, TWEENing, et logique de jeu.

Cible (Modulaire / Framework)

Transition recommandée vers Vite + Vanilla JS ou React + Three-Fiber.
Structure de dossiers suggérée :

/src
  /core
    - GameLoop.js
    - StateManager.js (Zustand ou Redux light)
    - SaveSystem.js
  /engine
    - ThreeScene.js
    - PostProcessing.js
    - InputHandler.js
  /systems
    - ArtifactGenerator.js (Logique géométrie + texture)
    - DirtSystem.js (Canvas 2D masking logic)
    - DroneSystem.js
    - AudioSynth.js
  /ui
    - HUD.js
    - Shop.js


2. Mécanique de Nettoyage (Le Cœur du Jeu)

Technique : "Texture Masking".

Implémentation :

Un OffscreenCanvas (ou canvas caché) est rempli de blanc (ou d'un bruit de perlin).

Ce canvas est utilisé comme alphaMap sur le matériau de la saleté (dirtMesh).

Lors de l'interaction (Raycast), on dessine des cercles avec globalCompositeOperation = 'destination-out' sur le canvas 2D.

texture.needsUpdate = true est appelé pour rafraîchir le matériau Three.js.

Optimisation V10 : Ne pas mettre à jour la texture à chaque frame si l'input n'a pas bougé. Utiliser une résolution de texture adaptative (512x512 sur mobile, 1024x1024 sur Desktop).

3. Système Audio Procédural

L'audio n'utilise aucun asset externe pour garantir un chargement instantané.

Noise Buffer : Créé au runtime pour le son de nettoyage (filtré par un LowPass dynamiquement selon le % de nettoyage).

Oscillators : Utilisés pour les mélodies (Win, Level Up) et les effets (Drones, Lasers).

Directive V10 : Encapsuler cela dans une classe AudioManager robuste qui gère le "ducking" (baisse du son) et la spatialisation 3D basique.

4. Shaders & Post-Processing

Bloom : UnrealBloomPass est essentiel pour l'esthétique Néon.

RGB Shift : Shader personnalisé injecté dans le ShaderPass pour les effets d'impact (Screen Shake).

Contrainte : Ces passes sont coûteuses en GPU. Il faut désactiver le RGB Shift quand amount == 0 ou réduire la résolution du Bloom sur les appareils faibles.

5. Données & Sauvegarde

Actuellement : localStorage avec JSON.stringify.

Futur : Prévoir une migration vers une sauvegarde Cloud (Firebase) si le leaderboard est implémenté, pour éviter la triche.