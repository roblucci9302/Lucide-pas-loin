# Lucide - Assistant de Réunion Intelligent Propulsé par l'IA 🎙️

**Lucide** est un assistant de réunion intelligent et complet, développé avec Electron, qui transforme vos réunions en insights actionnables grâce à la transcription en temps réel, l'analyse IA et le suivi automatisé.

## 📋 Table des matières

- [Qu'est-ce que Lucide ?](#quest-ce-que-lucide-)
- [Fonctionnalités principales](#-fonctionnalités-principales)
- [Installation rapide](#-installation-rapide)
- [Modes d'utilisation](#-modes-dutilisation)
- [Architecture technique](#-architecture-technique)
- [Configuration](#-configuration)
- [Tests](#-tests)
- [Contribution](#-contribution)
- [Licence](#-licence)

## Qu'est-ce que Lucide ?

Lucide est une **application desktop multi-plateforme** (Windows, macOS, Linux) qui révolutionne la façon dont vous gérez vos réunions et vos conversations professionnelles. Propulsée par l'intelligence artificielle, Lucide capture, analyse et transforme vos discussions en données actionnables.

### À quoi sert Lucide ?

- **📝 Prendre des notes automatiquement** pendant vos réunions
- **🎯 Identifier les décisions**, actions et deadlines en temps réel
- **👥 Attribuer automatiquement** les interventions aux bons participants
- **📊 Analyser vos réunions** pour détecter des tendances et améliorer la productivité
- **💼 Générer des emails de suivi** professionnels automatiquement
- **📚 Créer une base de connaissances** avec vos documents et conversations
- **🤖 Bénéficier d'un assistant IA personnalisé** avec 9 profils spécialisés

### Cas d'usage principaux

- **Réunions d'équipe** : Capture automatique, distribution des tâches
- **Entretiens** : Transcription, analyse de sentiment, résumés RH
- **Formations** : Prise de notes automatique, génération de résumés
- **Brainstorming** : Capture d'idées, détection de patterns
- **Gestion de projets** : Extraction d'actions, deadlines, blocages
- **Recherche** : Base de connaissances avec citations automatiques

## ✨ Fonctionnalités principales

### 🎯 Phase 1 : Prise de Notes & Export

- **Transcription en temps réel** avec plusieurs moteurs Speech-to-Text (Whisper, Deepgram, OpenAI)
- **Résumés intelligents** générés par Claude Sonnet 4
- **Export multi-format** : Markdown, PDF professionnel, CSV
- **Stockage persistant** : SQLite local + synchronisation cloud Firebase optionnelle

### 👥 Phase 2 : Attribution Intelligente & Suivi

- **Attribution automatique des speakers** avec détection intelligente des participants
- **Génération d'emails professionnels** en 4 types :
  - Email de suivi (Follow-up)
  - Résumé de réunion (Summary)
  - Liste des actions (Action Items)
  - Remerciements (Thank You)
- **Gestion avancée des tâches** avec :
  - 5 états : À faire, En cours, Terminé, Annulé, En pause
  - Niveaux de priorité : Faible, Moyen, Élevé, Urgent
  - Tags personnalisés et deadlines
  - Export CSV pour intégration externe
- **Suggestions IA** pour les prochaines étapes et actions à entreprendre

### 💡 Phase 3 : Insights en Temps Réel & Intelligence

- **Détection automatique de 8 types d'insights** :
  - ✅ **Décisions** : "Nous avons décidé de choisir l'option A"
  - 📋 **Actions** : "Jean va s'occuper de l'intégration API"
  - ⏰ **Deadlines** : "Il nous faut ça pour vendredi prochain"
  - ❓ **Questions** : "Comment devons-nous aborder la conception?"
  - 💡 **Points clés** : "L'aspect le plus important est la sécurité"
  - ⛔ **Blocages** : "Nous sommes bloqués par le problème d'API"
  - 🔄 **Changements de sujet** : "Parlons maintenant du frontend"
  - 🔁 **Sujets récurrents** : Sujets mentionnés 3 fois ou plus

- **Analyse de sentiment IA** en 5 types : Positif, Neutre, Négatif, Urgent, Collaboratif
- **Suggestions proactives** générées toutes les 5 interventions
- **Notifications intelligentes** avec :
  - 4 niveaux de priorité (Faible, Moyen, Élevé, Critique)
  - Notifications desktop pour insights prioritaires
  - Centre de notifications in-app avec compteur
  - Configuration personnalisable (types, son, desktop/in-app)
- **Plus de 30 algorithmes de détection** de patterns pour une analyse contextuelle

### 📊 Phase 4 : Analytics & Dashboard

- **Statistiques complètes** : Nombre de réunions, durée totale, insights générés
- **Répartition des insights** par type avec visualisations
- **Identification du jour le plus productif**
- **Sujets tendances** avec analyse de fréquence
- **Timeline de productivité** avec tendances visuelles
- **Filtres de période** : 7 jours, 30 jours, historique complet
- **Comparaison de sessions** et scoring d'engagement

### 🚀 Phase WOW : Base de Connaissances & Assistant IA

- **Base de connaissances avec RAG** (Retrieval Augmented Generation)
- **Upload et analyse de documents** :
  - PDF, DOCX, TXT, Markdown
  - Images avec OCR (reconnaissance de texte)
  - Tableaux Excel
- **Recherche sémantique** avec embeddings vectoriels
- **Citations automatiques** des sources dans les réponses
- **9 profils d'agents IA spécialisés** :
  - 🎓 Assistant général
  - 📚 Étudiant
  - 🔬 Chercheur
  - 👔 Ressources Humaines
  - 💻 IT/Tech
  - 📈 Marketing
  - 👨‍💼 CEO/Direction
  - 💰 Sales/Commercial
  - 📊 Manager/Chef de projet
- **Génération de documents professionnels** : CV, lettres de motivation, rapports
- **Export de documents** : PDF, DOCX, Markdown
- **Système de workflows** pour tâches complexes
- **Support multi-langues** (internationalisation i18n)

## 🚀 Installation rapide

### Prérequis

- **Node.js** v20.x.x ([Télécharger](https://nodejs.org/fr/download))
- **Python** ([Télécharger](https://www.python.org/downloads/))
- **Windows uniquement** : [Build Tools for Visual Studio](https://visualstudio.microsoft.com/fr/downloads/)

```bash
# Vérifier votre version de Node.js
node --version

# Si nécessaire, utiliser nvm pour passer à Node.js 20
# nvm install 20
# nvm use 20
```

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/roblucci9302/Lucide-pas-loin.git
cd Lucide-pas-loin

# Installer les dépendances
npm run setup

# Démarrer l'application
npm start
```

### Dépendances optionnelles

Lucide utilise un système de dégradation gracieuse. Les fonctionnalités de base fonctionnent sans ces dépendances, mais pour une fonctionnalité complète :

```bash
# Toutes les dépendances optionnelles
npm install uuid better-sqlite3 pg mysql2

# Ou individuellement
npm install uuid              # Pour l'indexation de documents
npm install better-sqlite3    # Pour la base de données SQLite locale
npm install pg                # Pour le support PostgreSQL
npm install mysql2            # Pour le support MySQL
```

## 🎨 Modes d'utilisation

### 1. Mode Réunion (Listen)

**Activation** : Bouton "Écouter" dans le header

**Fonctionnalités** :
- Capture audio du microphone ou loopback (Windows)
- Transcription en temps réel
- Détection d'insights automatique
- Notifications proactives pendant la réunion
- Attribution des speakers

**Workflow** :
1. Cliquez sur "Écouter" pour démarrer
2. Parlez naturellement pendant votre réunion
3. Consultez les insights en temps réel dans le panneau latéral
4. Arrêtez l'enregistrement
5. Accédez au panneau post-réunion pour :
   - Gérer les participants
   - Voir les tâches générées
   - Générer des emails de suivi
   - Exporter les notes

### 2. Mode Chat (Ask)

**Activation** : Fenêtre principale

**Fonctionnalités** :
- Conversation avec l'IA (Claude, GPT-4, Gemini, Ollama)
- Upload de documents pour analyse
- Recherche dans la base de connaissances
- Génération de documents professionnels
- Citations automatiques des sources

**Profils disponibles** :
Choisissez parmi 9 profils spécialisés selon votre besoin (étudiant, chercheur, RH, IT, marketing, CEO, sales, manager)

### 3. Mode Base de Connaissances (Knowledge)

**Activation** : Menu Knowledge

**Fonctionnalités** :
- Gestion de vos documents
- Recherche sémantique avancée
- Indexation automatique
- Organisation par tags et catégories
- Visualisation des documents liés

### 4. Mode Analytics

**Activation** : Menu Analytics

**Fonctionnalités** :
- Vue d'ensemble de toutes vos réunions
- Tendances de productivité
- Identification des sujets récurrents
- Comparaison de sessions
- Statistiques détaillées

### 5. Mode Historique (History)

**Fonctionnalités** :
- Consultation des sessions passées
- Recherche dans l'historique
- Ré-analyse de conversations
- Export de données historiques

## 🏗️ Architecture technique

### Technologies utilisées

#### Frontend
- **Lit Elements** - Web Components modernes
- **HTML/CSS** - Interface utilisateur responsive
- **JavaScript ES6+** - Logique applicative

#### Backend
- **Electron** v30.5.1 - Framework desktop multi-plateforme
- **Node.js** v20.x.x - Environnement d'exécution
- **Better-SQLite3** - Base de données locale SQLite
- **Firebase** - Synchronisation cloud optionnelle (Firestore + Auth)
- **Express** - Serveur HTTP intégré

#### Intelligence Artificielle
- **Claude Sonnet 4** (Anthropic) - Moteur IA principal
- **OpenAI GPT-4.1** - Alternative LLM
- **Google Gemini 2.5 Flash** - Alternative LLM
- **Ollama** - Modèles IA locaux
- **Whisper** - Speech-to-Text local (tiny, base, small, medium)
- **Deepgram Nova-3** - Speech-to-Text cloud
- **Portkey AI** - Gateway IA pour la gestion multi-providers

#### Traitement de documents
- **Tesseract.js** - OCR pour reconnaissance de texte dans images
- **pdf-parse** - Extraction de texte PDF
- **mammoth** - Extraction DOCX
- **PDFKit** - Génération de PDF professionnels
- **docx** - Génération de documents Word
- **marked** - Parsing Markdown
- **sharp** - Traitement d'images
- **xlsx** - Gestion de fichiers Excel

### Structure du projet

```
src/
├── index.js                      # Point d'entrée principal (Electron main process)
├── preload.js                    # Exposition des APIs (50+ méthodes)
│
├── features/                     # Services backend
│   ├── listen/                   # Fonctionnalités de réunion
│   │   ├── listenService.js
│   │   ├── stt/                 # Speech-to-Text
│   │   ├── summary/             # Résumés IA
│   │   ├── participants/        # Attribution de speakers (Phase 2.1)
│   │   ├── email/               # Génération d'emails (Phase 2.2)
│   │   ├── tasks/               # Gestion de tâches (Phase 2.3)
│   │   ├── followUp/            # Suggestions IA (Phase 2.4)
│   │   └── liveInsights/        # Insights en temps réel (Phase 3)
│   │       ├── liveInsightsService.js
│   │       ├── notificationService.js
│   │       └── contextualAnalysisService.js
│   │
│   ├── analytics/               # Analytics & Dashboard (Phase 4)
│   ├── knowledge/               # Base de connaissances (Phase WOW)
│   ├── ask/                     # Chat IA
│   ├── browser/                 # Navigateur intégré
│   ├── settings/                # Configuration
│   │
│   └── common/                  # Services partagés
│       ├── ai/providers/        # OpenAI, Gemini, Anthropic, Ollama, Whisper, Deepgram
│       ├── services/            # 40+ services (RAG, OCR, indexation, documents...)
│       ├── repositories/        # Accès base de données
│       ├── config/              # Configuration et schémas DB
│       └── utils/               # Utilitaires
│
├── ui/                          # Interface utilisateur (Lit Elements)
│   ├── app/                     # Application principale
│   ├── listen/                  # Interface réunion
│   │   ├── ListenView.js
│   │   ├── LiveInsightsPanel.js
│   │   ├── NotificationCenter.js
│   │   ├── PostMeetingPanel.js
│   │   ├── ParticipantModal.js
│   │   └── EmailPreviewModal.js
│   ├── analytics/               # Dashboard analytics
│   ├── ask/                     # Interface chat
│   ├── documents/               # Gestion documents
│   ├── knowledge/               # Base de connaissances
│   ├── settings/                # Paramètres
│   ├── onboarding/              # Onboarding utilisateur
│   └── i18n/                    # Internationalisation
│
├── bridge/                      # Communication IPC (Electron)
│   └── modules/                 # 10+ bridges spécialisés
│
└── window/                      # Gestion des fenêtres Electron
```

### Statistiques du projet

- **~70,000 lignes** de code JavaScript
- **50+ méthodes API** exposées via window.api
- **40+ services backend** spécialisés
- **20+ composants UI** en Lit Elements
- **6 fournisseurs IA** supportés
- **8 types d'insights** détectés automatiquement
- **9 profils d'agents** IA spécialisés
- **4 formats d'export** (Markdown, PDF, DOCX, CSV)
- **30+ algorithmes** de détection de patterns

## ⌨️ Raccourcis clavier

- `Ctrl/Cmd + \` : Afficher/masquer la fenêtre principale
- `Ctrl/Cmd + Enter` : Poser une question à l'IA avec le contexte
- `Ctrl/Cmd + Flèches` : Déplacer la position de la fenêtre

## 🔧 Configuration

### Clés API

Lucide supporte plusieurs fournisseurs d'IA. Configurez vos clés API dans Paramètres → Clés API :

- **OpenAI API** : [Obtenir une clé](https://platform.openai.com/api-keys)
- **Gemini API** : [Obtenir une clé](https://aistudio.google.com/apikey)
- **Claude API** : [Obtenir une clé](https://console.anthropic.com/)
- **LLM Local** : Ollama & Whisper (aucune clé nécessaire)

### Préférences de notifications

Personnalisez le comportement des notifications dans Paramètres :
- Notifications desktop (activées/désactivées)
- Notifications in-app (activées/désactivées)
- Alertes sonores
- Filtres de priorité (élevée uniquement, toutes, etc.)
- Filtres de type (blocages, deadlines, décisions, etc.)

### Modes de déploiement

1. **Local (Standalone)** :
   - SQLite uniquement
   - Pas de synchronisation cloud
   - Modèles IA locaux (Whisper, Ollama)

2. **Cloud (Connecté)** :
   - Synchronisation Firebase
   - APIs IA cloud (OpenAI, Anthropic, Gemini)
   - Collaboration possible

3. **Hybride** :
   - SQLite + Firebase
   - Mix de modèles locaux et cloud
   - Basculement automatique (fallback)

4. **Entreprise** :
   - Gateway entreprise
   - Base de données externe (PostgreSQL/MySQL)
   - Gestion des licences et permissions

## 🧪 Tests

### Tests d'intégration

```bash
# Démarrer les bases de données de test (Docker requis)
npm run docker:start

# Exécuter tous les tests d'intégration
npm run test:integration

# Exécuter des tests spécifiques par base de données
npm run test:integration:postgres
npm run test:integration:mysql
npm run test:integration:sqlite

# Arrêter les bases de données de test
npm run docker:stop
```

### Tests manuels

Consultez le guide de tests complet :

```bash
# Voir le guide de tests
cat TESTING_GUIDE.md
```

**31 cas de test manuels** couvrant toutes les phases :
- Phase 1 : 4 tests
- Phase 2 : 5 tests
- Phase 3 : 11 tests
- Phase 4 : 8 tests
- Intégration : 3 tests

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Forker le dépôt
2. Créer une branche de fonctionnalité (`git checkout -b feature/super-fonctionnalite`)
3. Committer vos changements (`git commit -m 'Ajout d'une super fonctionnalité'`)
4. Pousser vers la branche (`git push origin feature/super-fonctionnalite`)
5. Ouvrir une Pull Request

### Directives de développement

- Suivre le style de code existant
- Ajouter des tests pour les nouvelles fonctionnalités
- Mettre à jour la documentation
- S'assurer que tous les tests passent avant de soumettre

## 📝 Documentation

Documentation complète disponible dans le dépôt :

- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** : Guide de tests manuels (31 tests)
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** : Documentation complète des fonctionnalités
- **[DEPENDENCY_MANAGEMENT.md](./DEPENDENCY_MANAGEMENT.md)** : Guide de gestion des dépendances
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** : Guide de contribution
- **[docs/](./docs/)** : Documentation technique détaillée (60+ fichiers)

## 🗺️ Roadmap

### Complété ✅

- [x] Phase 1 : Prise de notes et export
- [x] Phase 2 : Attribution, emails, tâches, suggestions
- [x] Phase 3 : Insights en temps réel, analyse IA, notifications
- [x] Phase 4 : Analytics et dashboard
- [x] Phase WOW : Base de connaissances avec RAG et agents spécialisés

### Améliorations futures 🚀

- [ ] Support multi-langues complet (i18n)
- [ ] Intégrations avec Slack, Teams, Calendar
- [ ] Prise de notes collaborative
- [ ] Commandes vocales pendant les réunions
- [ ] Application mobile (iOS/Android)
- [ ] Amélioration de la synchronisation cloud
- [ ] Entraînement de modèles IA personnalisés
- [ ] Templates de réunion prédéfinis
- [ ] Marketplace de plugins

## 📄 Licence

Ce projet est sous licence GPL-3.0 - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

Ce projet est un fork de [CheatingDaddy](https://github.com/sohzm/cheating-daddy) avec des modifications extensives. Merci à [Soham](https://x.com/soham_btw) et à tous les contributeurs open-source.

## 📞 Support

- **Issues** : [GitHub Issues](https://github.com/roblucci9302/Lucide-pas-loin/issues)
- **Discussions** : [GitHub Discussions](https://github.com/roblucci9302/Lucide-pas-loin/discussions)

---

**Développé avec ❤️ en utilisant Electron et Lit Elements**

*Dernière mise à jour : 2025-11-22*
