# Lucide - Assistant IA Contextuel 🧠

[![Integration Tests](https://github.com/roblucci9302/Lucidi/actions/workflows/integration-tests.yml/badge.svg)](https://github.com/roblucci9302/Lucidi/actions/workflows/integration-tests.yml)
[![Unit Tests](https://github.com/roblucci9302/Lucidi/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/roblucci9302/Lucidi/actions/workflows/unit-tests.yml)
[![Build](https://github.com/roblucci9302/Lucidi/actions/workflows/build.yml/badge.svg)](https://github.com/roblucci9302/Lucidi/actions/workflows/build.yml)

## 📋 Table des matières

- [À propos](#à-propos)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Installation](#installation)
- [Démarrage rapide](#démarrage-rapide)
- [Architecture](#architecture)
- [Technologies utilisées](#technologies-utilisées)
- [Tests et intégration continue](#tests-et-intégration-continue)
- [Raccourcis clavier](#raccourcis-clavier)
- [Contribuer](#contribuer)
- [Licence](#licence)

## À propos

**Lucide** est une application desktop innovante qui transforme l'intelligence artificielle en un véritable collaborateur. Grâce à sa capacité à comprendre le contexte complet de votre travail, Lucide vous assiste en temps réel dans vos tâches quotidiennes.

### Vision

Transformer l'IA d'un simple outil générique en un assistant intelligent et contextuel qui comprend votre environnement de travail, vos réunions et vos besoins.

### Différenciation clé

- **🎯 9 Profils d'experts spécialisés** : RH, CEO, Développeur, Marketing, Finance, Juridique, Ventes, Support, Stratégie
- **🧠 Mémoire complète** : Contexte permanent de vos interactions et de votre historique
- **📡 Offline-First** : Fonctionne sans connexion Internet avec les modèles locaux
- **🔗 Multi-Source** : Agrégation intelligente de données provenant de multiples sources
- **📄 Génération de documents** : Documents professionnels prêts à l'emploi (PDF, Word, Markdown)
- **🎙️ Support réunions en temps réel** : Prise de notes automatique et résumés intelligents

## Fonctionnalités principales

### 1. Ask - Questions contextuelles

Posez des questions basées sur tout votre contexte de travail :
- Historique des actions à l'écran
- Enregistrements audio
- Documents consultés
- Base de connaissances personnelle

### 2. Listen - Assistant de réunion

Support intelligent pendant vos réunions :
- **Transcription en temps réel** : Conversion automatique de la parole en texte
- **Résumés instantanés** : Synthèse de ce qui est dit pendant la réunion
- **Extraction d'actions** : Identification automatique des tâches à effectuer
- **Suivi des participants** : Qui a dit quoi et quand
- **Analyse post-réunion** : Rapport complet après la réunion

### 3. Knowledge - Base de connaissances

Gestion intelligente de vos informations :
- **Knowledge Graph** : Organisation automatique des connaissances
- **RAG (Retrieval-Augmented Generation)** : Contexte enrichi basé sur vos données
- **Embeddings** : Recherche sémantique vectorielle
- **Indexation automatique** : Classification intelligente des informations

### 4. Documents - Traitement et génération

Analyse et création de documents :
- **Import** : PDF, Word, Excel, images
- **OCR** : Extraction de texte depuis images (Tesseract.js)
- **Export professionnel** : Génération PDF, Word, Markdown
- **Templates** : Documents pré-formatés personnalisables

### 5. Profils utilisateur

Personnalisation avancée :
- Création et gestion de profils multiples
- Thèmes personnalisés par profil
- Recommandations contextuelles
- Interface adaptée selon le rôle

## Installation

### Prérequis

- **Node.js** version 20.x.x (recommandé)
- **Python** (pour certaines dépendances natives)
- **Build Tools** (Windows uniquement : Build Tools for Visual Studio)

Vérifiez votre version de Node.js :

```bash
node --version
```

Si nécessaire, installez Node.js 20.x.x avec nvm :

```bash
# Installation de nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Installation de Node.js 20
nvm install 20
nvm use 20
```

### Installation rapide

```bash
npm run setup
```

Cette commande effectue :
1. Installation des dépendances principales
2. Construction de l'interface web
3. Démarrage de l'application

## Démarrage rapide

### Configuration de base

1. **Démarrer l'application** :
```bash
npm start
```

2. **Configurer votre clé API** :
   - OpenAI : [Obtenir une clé API](https://platform.openai.com/api-keys)
   - Gemini : [Obtenir une clé API](https://aistudio.google.com/apikey)
   - Anthropic Claude : Via les paramètres de l'application
   - Ollama (local) : Aucune clé requise

3. **Choisir votre modèle** :
   - GPT-4 / ChatGPT (OpenAI)
   - Claude (Anthropic)
   - Gemini (Google)
   - Ollama (modèles locaux)

### Dépendances optionnelles

Lucide utilise un système de dégradation gracieuse. L'application fonctionne sans ces modules, mais certaines fonctionnalités avancées les requièrent :

| Module | Objectif | Requis pour |
|--------|----------|------------|
| `uuid` | Génération d'ID | Indexation documents, knowledge graph |
| `better-sqlite3` | SQLite natif | Fonctionnalités base de données complètes |
| `pg` | Driver PostgreSQL | Sources de données PostgreSQL externes |
| `mysql2` | Driver MySQL | Sources de données MySQL externes |

**Installation selon vos besoins** :

```bash
# Toutes les dépendances optionnelles
npm install uuid better-sqlite3 pg mysql2

# Ou individuellement
npm install uuid           # Pour les services de documents
npm install pg             # Pour le support PostgreSQL
npm install mysql2         # Pour le support MySQL
```

Sans ces modules, l'application utilisera des mocks légers avec des avertissements informatifs.

## Architecture

### Vue d'ensemble

Lucide est construite sur une architecture Electron multi-couches :

```
┌─────────────────────────────────────┐
│     Application Electron Desktop     │
│  ┌───────────────────────────────┐  │
│  │  Renderer Process (UI)        │  │
│  │  • AskView (Q&A)              │  │
│  │  • ListenView (Réunions)      │  │
│  │  • SettingsView (Config)      │  │
│  │  • KnowledgeView (Base)       │  │
│  │  • HistoryView (Historique)   │  │
│  └───────────────────────────────┘  │
│              ↕ IPC                   │
│  ┌───────────────────────────────┐  │
│  │  Main Process (Backend)       │  │
│  │  • Window Manager             │  │
│  │  • Feature Bridges            │  │
│  │  • Services Layer             │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
                ↕
┌─────────────────────────────────────┐
│        Couche de Services            │
│  • LLM Multi-Provider               │
│  • Audio/Speech (STT)               │
│  • Gestion de données (RAG)         │
│  • Traitement de documents          │
│  • Gestion utilisateurs             │
└─────────────────────────────────────┘
                ↕
┌─────────────────────────────────────┐
│    Persistance des données           │
│  • SQLite (local, principal)        │
│  • PostgreSQL (sync cloud, opt.)    │
│  • Firebase (legacy)                │
└─────────────────────────────────────┘
```

### Structure du projet

```
lucide/
├── src/                      # Code source principal
│   ├── features/            # Fonctionnalités (ask, listen, knowledge)
│   ├── ui/                  # Composants interface utilisateur
│   ├── bridge/              # Communication IPC Electron
│   └── window/              # Gestion des fenêtres
├── lucide-backend/          # Backend SaaS (Express + Supabase)
├── lucide-enterprise-gateway/ # Gateway intégration entreprise
├── docker/                  # Configuration Docker pour tests
├── tests/                   # Suite de tests d'intégration
├── web/                     # Interface web
└── public/                  # Ressources publiques
```

## Technologies utilisées

### Frontend & Desktop
- **Electron** ^30.5.1 - Framework desktop cross-platform
- **esbuild** ^0.25.5 - Bundler JavaScript ultra-rapide

### Intelligence Artificielle
- **@anthropic-ai/sdk** ^0.56.0 - API Claude
- **openai** ^4.70.0 - API OpenAI/GPT-4
- **@google/generative-ai** ^0.24.1 - API Gemini
- **portkey-ai** ^1.10.1 - Routeur LLM multi-provider
- **ollama** - Support LLM locaux open-source

### Audio & Speech
- **@deepgram/sdk** ^4.9.1 - Transcription vocale (Speech-to-Text)
- **tesseract.js** ^5.1.1 - OCR (reconnaissance optique de caractères)
- **ws** ^8.18.0 - WebSocket pour audio temps réel

### Documents
- **pdfkit** ^0.17.2 - Génération de PDF
- **docx** ^9.5.1 - Génération de documents Word
- **pdf-parse** ^2.4.5 - Analyse de PDF
- **mammoth** ^1.11.0 - Analyse de documents Word
- **marked** ^17.0.0 - Traitement Markdown
- **xlsx** ^0.18.5 - Traitement de fichiers Excel

### Base de données
- **better-sqlite3** ^12.2.0 - SQLite natif (stockage local)
- **@supabase/supabase-js** ^2.45.0 - Client PostgreSQL cloud
- **firebase** ^12.2.1 - Backend cloud Firebase

### Backend API
- **Express.js** ^4.18.2 - Framework serveur web
- **jsonwebtoken** ^9.0.2 - Authentification JWT
- **axios** ^1.10.0 - Client HTTP

## Tests et intégration continue

### Tests d'intégration avec Docker

Lucide fournit un environnement Docker complet pour les tests d'intégration :

**Démarrage rapide** :
```bash
# Démarrer les bases de données de test
npm run docker:start

# Exécuter les tests d'intégration
npm run test:integration

# Arrêter les bases de données
npm run docker:stop
```

**Commandes disponibles** :
- `npm run docker:start` - Démarrer PostgreSQL, MySQL, Redis
- `npm run docker:stop` - Arrêter tous les conteneurs
- `npm run docker:reset` - Réinitialiser avec données fraîches
- `npm run docker:health` - Vérifier l'état des services
- `npm run test:integration` - Tous les tests (30 tests)
- `npm run test:integration:postgres` - Tests PostgreSQL (10 tests)
- `npm run test:integration:mysql` - Tests MySQL (10 tests)
- `npm run test:integration:sqlite` - Tests SQLite (10 tests)

**Prérequis** :
- Docker Desktop installé et en cours d'exécution
- Ports 5432 (PostgreSQL), 3306 (MySQL), 6379 (Redis) disponibles

**Couverture** : 30 tests d'intégration (PostgreSQL: 10, MySQL: 10, SQLite: 10)

### Intégration Continue (CI/CD)

GitHub Actions assure la qualité du code :

**Workflows automatisés** :
- ✅ **Tests d'intégration** - Test automatique avec PostgreSQL, MySQL, SQLite
  - Exécuté sur chaque push vers `main`, `develop`, `claude/**`
  - Utilise les services GitHub Actions
  - 30 tests à travers 3 systèmes de base de données

- ✅ **Tests unitaires** - Qualité et validation du code
  - Linting avec ESLint
  - Audit de sécurité avec npm audit
  - Validation des helpers et utilitaires

- ✅ **Build** - Compilation et packaging
  - Support multi-plateforme (Windows, macOS, Linux)

Les badges de statut (en haut du README) indiquent l'état actuel des tests.

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl/Cmd + \` | Afficher/masquer la fenêtre principale |
| `Ctrl/Cmd + Enter` | Poser une question à l'IA avec tout le contexte |
| `Ctrl/Cmd + Flèches` | Déplacer la fenêtre principale |

## Phases de développement

### ✅ Phase 1 : Système de base
- Capture de contexte (écran + audio)
- Feature Ask (questions contextuelles)
- Support multi-LLM (OpenAI, Claude, Gemini, Ollama)
- Profils d'agents (9 experts spécialisés)
- Configuration utilisateur

### ✅ Phase 2 : Mémoire augmentée
- Conversation persistante
- Knowledge Graph
- RAG (Retrieval-Augmented Generation)
- Embeddings vectoriels
- Intégration bases de données externes

### ✅ Phase 3 : Infrastructure de tests
- Intégration Docker (PostgreSQL, MySQL, Redis)
- 30 tests d'intégration
- CI/CD avec GitHub Actions
- Abstraction multi-base de données
- Gestion des migrations

### ✅ Phase 4 : Workflows & Documents
- Upload et analyse de documents
- Capacité OCR
- Export de documents (PDF, Word, Markdown)
- Moteur de workflow
- Système de templates

### 🚧 Phase WOW 1 : Profils utilisateur (en cours)
- Profils utilisateur multiples
- Assistant d'onboarding
- Thèmes personnalisés par profil
- Suggestions basées sur le profil
- UX adaptée selon le rôle

## Contribuer

Nous adorons les contributions ! N'hésitez pas à ouvrir des issues pour signaler des bugs ou demander de nouvelles fonctionnalités.

Pour un guide détaillé, consultez notre [guide de contribution](/CONTRIBUTING.md).

### Documentation technique

Pour plus de détails sur l'architecture et le développement :
- [ARCHITECTURE_DOCUMENTS.md](./ARCHITECTURE_DOCUMENTS.md) - Architecture détaillée
- [DEPENDENCY_MANAGEMENT.md](./DEPENDENCY_MANAGEMENT.md) - Gestion des dépendances
- [PHASE_3_PLAN_AND_ROADMAP.md](./PHASE_3_PLAN_AND_ROADMAP.md) - Plan Phase 3
- [tests/README.md](./tests/README.md) - Guide des tests

## Sécurité et confidentialité

Lucide prend la sécurité au sérieux :
- 🔒 **Chiffrement** des données sensibles
- 🚫 **Protection des captures d'écran** - invisible dans les enregistrements
- 🔐 **Gestion sécurisée des clés API** avec keytar
- 📡 **Offline-first** - fonctionne sans connexion Internet
- ✅ **Contrôle des permissions** système
- 🛡️ **Validation des entrées** avec Joi

## Licence

Ce projet est sous licence GPL-3.0.

## Statut du projet

**Version actuelle** : 0.2.4

**Statut** : Production-ready avec 4 phases complètes
- Architecture évolutive et modulaire
- Excellente couverture de tests (30 tests d'intégration)
- Support multi-plateforme (Windows, macOS, Linux)
- Documentation complète

---

**Lucide** - Transformez l'IA en un véritable collaborateur intelligent. 🚀
