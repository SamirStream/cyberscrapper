📄 Product Requirements Document (PRD) - V10

1. Vision du Produit

Créer l'expérience "Satisfying Cleaning" ultime sur mobile et web, enrobée dans une esthétique Cyberpunk/Synthwave haut de gamme. Le jeu doit retenir le joueur par le plaisir immédiat (Juice/Game Feel) et le fidéliser par la profondeur de la gestion (Upgrades/Drones).

2. Cibles Utilisateurs

Core Gamer : Apprécie la montée en puissance, les combos et l'optimisation (Min-Maxing).

Casual Gamer : Cherche une relaxation immédiate (ASMR, visuels néons) sur des sessions courtes (3-5 min).

3. Boucle de Gameplay (Core Loop)

Acquisition : Un nouvel artefact sale apparaît (Génération procédurale).

Action (Satisfaction) : Le joueur nettoie manuellement (Laser) ou laisse ses drones travailler. Il explose les "Nœuds Rouges" pour des bonus.

Climax : Activation du "Nova Blast" ou du "Overdrive" pour une satisfaction maximale.

Récompense : Vente de l'objet -> Gain de Crédits & XP.

Investissement : Achat d'améliorations (Puissance Laser, Valeur, Drones).

4. Spécifications des Fonctionnalités V10

A. Refonte de l'Expérience Utilisateur (UX)

UI Mobile First : Interface réactive, boutons larges pour le tactile, menus glissants.

Haptic Feedback : Intégration de l'API Vibration pour les explosions et le nettoyage.

Tutoriel Interactif : Remplacer le texte par une main guidant le premier nettoyage.

B. Contenu & Progression

Système de "Prestige" : Possibilité de réinitialiser sa progression contre une monnaie "Premium" (Nanites) permettant des upgrades permanents.

Collection (Musée) : Garder les artefacts légendaires nettoyés dans une galerie virtuelle.

Leaderboard : Classement mondial basé sur la valeur totale vendue.

C. Performance & Technique

Optimisation Canvas : Réduire la fréquence de mise à jour de la texture de saleté (dirtTex.needsUpdate) pour économiser la batterie sur mobile.

Modularité : Séparer le code en composants (GameEngine, AudioSystem, UIManager, ArtifactGenerator).

D. Monétisation (Préparation)

Rewarded Ads : "Regarder une pub pour doubler la valeur de vente de cet artefact Légendaire".

IAP (In-App Purchase) : Skins pour le laser (Couleurs, Formes).

5. Critères de Succès

Performance : 60 FPS constant sur mobile milieu de gamme.

Rétention : Le joueur doit vouloir revenir pour débloquer le rang suivant.

Stabilité : Zéro crash lors des transitions d'artefacts ou des explosions de particules.