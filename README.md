# Lucide 🧠

**L'assistant IA qui vous connaît vraiment**

[![Integration Tests](https://github.com/roblucci9302/Lucidi/actions/workflows/integration-tests.yml/badge.svg)](https://github.com/roblucci9302/Lucidi/actions/workflows/integration-tests.yml)
[![Unit Tests](https://github.com/roblucci9302/Lucidi/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/roblucci9302/Lucidi/actions/workflows/unit-tests.yml)
[![Build](https://github.com/roblucci9302/Lucidi/actions/workflows/build.yml/badge.svg)](https://github.com/roblucci9302/Lucidi/actions/workflows/build.yml)

---

## Qu'est-ce que Lucide ?

Lucide est un **assistant IA contextuel** qui transforme l'IA générique en collaborateur personnalisé.

Contrairement à ChatGPT ou Claude qui oublient tout entre chaque conversation, **Lucide vous connaît** : votre industrie, votre rôle, vos défis, et adapte chaque réponse à votre contexte spécifique.

### Le problème qu'on résout

Avec les assistants IA classiques, vous devez :
- ❌ Réexpliquer votre contexte à chaque fois
- ❌ Obtenir des réponses génériques inadaptées
- ❌ Perdre du temps à reformuler vos demandes
- ❌ Tout oublier entre chaque session

### La solution Lucide

- ✅ **Vous connaît** : mémorise votre contexte et votre historique
- ✅ **S'adapte à vous** : répond selon votre industrie, rôle et besoins
- ✅ **9 experts spécialisés** : RH, CEO, Dev, Marketing, Finance, etc.
- ✅ **Documents professionnels** : génère PDF, Word, Markdown prêts à l'emploi
- ✅ **Assistant de réunion intelligent** : transcription temps réel, insights automatiques
- ✅ **Fonctionne offline** : données en local, confidentialité totale

---

## 🎯 Fonctionnalités principales

### 1. Profils d'experts intelligents

Lucide se transforme automatiquement en **9 experts différents** selon votre besoin :

| Expert | Spécialité | Exemples d'usage |
|--------|------------|------------------|
| 👩‍💼 **Lucy RH** | Ressources Humaines | Offres d'emploi, grilles salariales, onboarding |
| 🎯 **Lucy CEO** | Direction & Stratégie | Plans stratégiques, pitch decks, rapports board |
| 💻 **Lucy Dev** | Développement | Architecture logicielle, code review, specs techniques |
| 📱 **Lucy Marketing** | Marketing & Growth | Campagnes, plans de contenu, analyses marché |
| 💼 **Lucy Sales** | Commercial | Scripts prospection, propositions commerciales |
| 👥 **Lucy Manager** | Management | Plans de projet, feedback, one-on-ones |
| 🔬 **Lucy Chercheur** | Recherche | Revues de littérature, méthodologie |
| 🎓 **Lucy Étudiant** | Aide scolaire | Devoirs, synthèses, préparation examens |
| 🤖 **Lucy Assistant** | Usage général | Polyvalent pour toutes vos questions |

**Le génie ?** Vous n'avez même pas à choisir. Lucide détecte automatiquement le bon expert en analysant votre question.

### 2. Connaissance contextuelle

Lucide mémorise et utilise en permanence :

- **Votre profil** : industrie (SaaS, E-commerce...), taille d'entreprise, rôle, expérience
- **Vos objectifs** : défis actuels, projets en cours, priorités
- **Vos préférences** : ton de communication, niveau technique, format de réponse
- **Votre historique** : conversations passées, documents consultés, décisions prises

**Résultat** : chaque réponse est adaptée à VOTRE réalité, pas une réponse générique.

### 3. Workflows structurés (30+ templates)

Des formulaires guidés pour générer des documents professionnels en quelques minutes :

**Pour les RH :**
- Offres d'emploi complètes
- Plans d'onboarding 30-60-90 jours
- Grilles salariales par poste
- Guides d'entretien structurés

**Pour les CEO :**
- Plans stratégiques annuels
- Rapports trimestriels investisseurs
- Pitch decks de levée de fonds
- Présentations board

**Pour les Marketeurs :**
- Plans de campagne marketing
- Calendriers éditoriaux
- Buyer personas
- Analyses concurrentielles

**Pour les Managers :**
- Plans de projet
- Feedback de performance
- Templates one-on-one
- Plans de développement d'équipe

### 4. Génération de documents professionnels

Exportez vos résultats en **vrais documents professionnels** :

- 📄 **PDF** : formatage avancé, prêt à imprimer ou envoyer
- 📝 **Word (DOCX)** : éditable avec styles natifs
- 📋 **Markdown** : pour Notion, Confluence, GitHub

Fini le copier-coller. Un clic et votre document est prêt.

### 5. Base de connaissances (RAG)

Uploadez vos propres documents pour enrichir Lucide :

- **PDF** : contrats, rapports, business plans
- **Word** : procédures, documents stratégiques
- **Images** : screenshots, schémas (avec OCR)
- **Texte** : notes, documentation

Lucide indexe vos documents et **cite vos sources** quand il répond.

Plus vous l'alimentez, plus il devient pertinent pour VOTRE entreprise.

### 6. Assistant de réunion intelligent

Un système complet d'analyse de réunions en 4 phases :

#### 📝 Phase 1 : Transcription & Export
- **Transcription temps réel** avec Speech-to-Text multi-provider
- **Résumés IA** générés par Claude Sonnet 4
- **Export multi-format** : Markdown, PDF, CSV
- **Stockage persistant** : SQLite local ou Firebase cloud

#### 👥 Phase 2 : Attribution & Suivi
- **Attribution des intervenants** avec détection intelligente
- **Génération d'emails** (4 types : Follow-up, Summary, Action Items, Thank You)
- **Gestion de tâches avancée** avec priorités, tags et deadlines
- **Suggestions IA** pour les prochaines étapes

#### 💡 Phase 3 : Insights en Direct
- **Détection d'insights temps réel** (8 types) :
  - ✅ Décisions : "Nous avons décidé de..."
  - 📋 Actions : "Jean va gérer l'intégration API"
  - ⏰ Deadlines : "Nous devons livrer vendredi prochain"
  - ❓ Questions : "Comment aborder le design de la BDD ?"
  - 💡 Points clés : "L'aspect le plus important est la sécurité"
  - ⛔ Blocages : "Nous sommes bloqués par l'API"
  - 🔄 Changements de sujet
  - 🔁 Sujets récurrents (mentionnés 3+ fois)

- **Analyse de sentiment IA** (5 types : positif, neutre, négatif, urgent, collaboratif)
- **Suggestions proactives** générées tous les 5 tours de conversation
- **Notifications intelligentes** (desktop + in-app) avec niveaux de priorité
- **30+ algorithmes de détection** pour insights contextuels

#### 📊 Phase 4 : Analytics & Dashboard
- **Statistiques complètes** sur toutes vos réunions
- **Extraction de sujets tendance** avec analyse de fréquence
- **Tendances de productivité** (jour/semaine/mois)
- **Comparaisons de sessions** et score d'engagement
- **Dashboard interactif** avec filtres période (7j, 30j, tout)

---

## 🚀 Installation

### Prérequis

- **Node.js 20.x.x** (requis)
- **Python** (pour dépendances natives)
- **Windows** : Build Tools for Visual Studio

Vérifiez votre version de Node.js :
```bash
node --version
```

Si besoin, installez Node.js 20 avec nvm :
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### Démarrage rapide

```bash
# Cloner le repository
git clone https://github.com/roblucci9302/Lucide-pas-loin.git
cd Lucide-pas-loin

# Installation complète (dépendances + build + démarrage)
npm run setup

# Démarrer l'application
npm start
```

Cette commande :
1. Installe toutes les dépendances
2. Build l'interface web
3. Démarre l'application

### Dépendances optionnelles

Lucide utilise un système de dégradation gracieuse. L'application fonctionne sans ces modules, mais certaines fonctionnalités avancées les requièrent :

```bash
# Toutes les dépendances optionnelles
npm install uuid better-sqlite3 pg mysql2

# Ou individuellement
npm install uuid           # Pour l'indexation de documents
npm install better-sqlite3 # Pour SQLite natif
npm install pg             # Pour PostgreSQL
npm install mysql2         # Pour MySQL
```

### Configuration

Au premier lancement, configurez votre clé API :

- **OpenAI** : [Obtenir une clé](https://platform.openai.com/api-keys)
- **Gemini** : [Obtenir une clé](https://aistudio.google.com/apikey)
- **Claude** : [Obtenir une clé](https://console.anthropic.com/)
- **Ollama** : Aucune clé requise (modèles locaux)

---

## ⚙️ Technologies

- **Frontend** : Electron + Web Components (Lit)
- **Backend** : Node.js 20 + Express
- **Base de données** : SQLite (local) + Firebase (cloud optionnel)
- **IA** : Multi-provider (OpenAI, Anthropic, Google, Ollama)
- **Documents** : PDFKit, DOCX, Mammoth, PDF-Parse
- **Speech** : Deepgram (cloud), Whisper (local), OpenAI
- **OCR** : Tesseract.js

---

## ⌨️ Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl/Cmd + \` | Afficher/masquer Lucide |
| `Ctrl/Cmd + Enter` | Envoyer votre question |
| `Ctrl/Cmd + Flèches` | Déplacer la fenêtre |

---

## 🧪 Tests

Lucide inclut **30 tests d'intégration** couvrant PostgreSQL, MySQL et SQLite.

### Tests avec Docker

```bash
# Démarrer les bases de données de test
npm run docker:start

# Exécuter tous les tests
npm run test:integration

# Tests spécifiques
npm run test:integration:postgres
npm run test:integration:mysql
npm run test:integration:sqlite

# Arrêter les conteneurs
npm run docker:stop
```

### Tests manuels

Suivez le guide de tests complet :
```bash
cat TESTING_GUIDE.md
```

**31 cas de tests manuels** couvrant toutes les phases :
- Phase 1 : 4 tests
- Phase 2 : 5 tests
- Phase 3 : 11 tests
- Phase 4 : 8 tests
- Intégration : 3 tests

### Intégration Continue

GitHub Actions exécute automatiquement :
- ✅ Tests d'intégration (30 tests)
- ✅ Tests unitaires + linting
- ✅ Build multi-plateforme

---

## 🏗️ Architecture

### Stack Technique

- **Frontend** : Lit Elements (Web Components)
- **Backend** : Electron + Node.js
- **Database** : SQLite (local) + Firebase (cloud sync optionnel)
- **IA** : Claude Sonnet 4 (Anthropic), OpenAI, Google, Ollama
- **STT** : Multi-provider (OpenAI, Google, modèles locaux)

### Structure du Projet

```
src/
├── features/
│   ├── listen/              # Réunions & transcription
│   │   ├── stt/            # Speech-to-Text
│   │   ├── summary/        # Génération résumés IA
│   │   ├── export/         # Export MD/PDF/CSV
│   │   ├── participants/   # Attribution intervenants
│   │   ├── email/          # Génération emails
│   │   ├── tasks/          # Gestion de tâches
│   │   ├── followUp/       # Suggestions IA
│   │   └── liveInsights/   # Insights temps réel
│   ├── analytics/          # Analytics & Dashboard
│   ├── ask/                # Questions & réponses
│   ├── knowledge/          # Base de connaissances (RAG)
│   └── common/             # Services partagés
├── ui/
│   ├── listen/             # Composants UI réunions
│   ├── analytics/          # Dashboard analytics
│   ├── ask/                # Interface Q&A
│   └── components/         # Composants réutilisables
├── bridge/                 # Communication IPC
└── preload.js             # APIs exposées
```

### API Overview

Lucide expose **50+ méthodes** via `window.api` :

- **Insights** : 14 méthodes + 4 event listeners
- **Notifications** : 14 méthodes + 6 event listeners
- **Analytics** : 5 méthodes
- **Tasks** : Gestion avancée de tâches
- **Participants** : 7 méthodes
- **Email** : 5 méthodes

---

## 📊 Statut du projet

**Version** : 0.2.4

**Phases complétées** :
- ✅ Phase 1 : Système de base (profils, workflows, contexte)
- ✅ Phase 2 : Mémoire augmentée (RAG, knowledge graph)
- ✅ Phase 3 : Tests & CI/CD (Docker, 30 tests)
- ✅ Phase 4 : Documents & export (PDF, Word, Markdown)
- ✅ Meeting Assistant : 4 phases complètes (transcription, analytics, insights)
- 🚧 Phase WOW : Profils utilisateur & onboarding (en cours)

**Statistiques** :
- ~6500+ lignes de code production
- 50+ méthodes API
- 30+ templates de workflows
- 8 types d'insights détectés
- 30+ regex patterns pour détection

---

## 🔒 Sécurité & confidentialité

- **Offline-first** : fonctionne sans connexion Internet
- **Stockage local** : vos données restent sur votre machine (SQLite)
- **Chiffrement** : données sensibles chiffrées
- **Aucune collecte** : vous contrôlez vos providers IA
- **RGPD compliant** : conformité native

---

## 📚 Documentation

Documentation technique complète :
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Guide de tests manuels (31 tests)
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Documentation complète des features
- [ARCHITECTURE_DOCUMENTS.md](./ARCHITECTURE_DOCUMENTS.md) - Architecture du système
- [PHASE_3_PLAN_AND_ROADMAP.md](./PHASE_3_PLAN_AND_ROADMAP.md) - Plan de développement
- [DEPENDENCY_MANAGEMENT.md](./DEPENDENCY_MANAGEMENT.md) - Gestion des dépendances
- [PRESENTATION_INVESTISSEURS.md](./PRESENTATION_INVESTISSEURS.md) - Présentation investisseurs
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guide de contribution

---

## 🤝 Contribuer

Les contributions sont les bienvenues !

1. Forkez le repository
2. Créez une branche feature (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add amazing feature'`)
4. Pushez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

### Guidelines de développement

- Suivez le style de code existant
- Ajoutez des tests pour les nouvelles features
- Mettez à jour la documentation
- Assurez-vous que tous les tests passent

---

## 📄 Licence

GPL-3.0

---

## 💡 Pourquoi Lucide ?

| Assistants classiques | Lucide |
|----------------------|--------|
| Connaissances générales | **Connaît VOTRE contexte** |
| Répond à des questions | **Anticipe vos besoins** |
| Une seule personnalité | **9 experts spécialisés** |
| Zéro mémoire | **Mémoire complète** |
| Génère du texte | **Documents professionnels** |
| Cloud uniquement | **Fonctionne offline** |
| Pas d'insights réunions | **Analytics complètes + insights temps réel** |

---

## 🙏 Remerciements

Ce projet est un fork de [CheatingDaddy](https://github.com/sohzm/cheating-daddy) avec des modifications extensives. Merci à [Soham](https://x.com/soham_btw) et tous les contributeurs open-source.

---

**Lucide - L'IA qui devient VOTRE assistant personnel** 🚀

*Dernière mise à jour : 2025-11-22*
