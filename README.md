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

- 🎙️ **Transcription en temps réel** : convertit la parole en texte
- 📝 **Résumés instantanés** : synthèse de ce qui est dit
- ✅ **Extraction d'actions** : identifie automatiquement les tâches
- 👥 **Suivi des participants** : qui a dit quoi
- 📊 **Analyse post-réunion** : rapport complet après la réunion

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
# Installation complète (dépendances + build + démarrage)
npm run setup
```

Cette commande :
1. Installe toutes les dépendances
2. Build l'interface web
3. Démarre l'application

### Configuration

Au premier lancement, configurez votre clé API :

- **OpenAI** : [Obtenir une clé](https://platform.openai.com/api-keys)
- **Gemini** : [Obtenir une clé](https://aistudio.google.com/apikey)
- **Claude** : Configurez dans les paramètres
- **Ollama** : Aucune clé requise (modèles locaux)

---

## ⚙️ Technologies

- **Frontend** : Electron + Web Components (Lit)
- **Backend** : Node.js 20 + Express
- **Base de données** : SQLite (local) + Firebase (cloud optionnel)
- **IA** : Multi-provider (OpenAI, Anthropic, Google, Ollama)
- **Documents** : PDFKit, DOCX, Mammoth, PDF-Parse
- **Speech** : Deepgram (cloud), Whisper (local)
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

### Intégration Continue

GitHub Actions exécute automatiquement :
- ✅ Tests d'intégration (30 tests)
- ✅ Tests unitaires + linting
- ✅ Build multi-plateforme

---

## 📊 Statut du projet

**Version** : 0.2.4

**Phases complétées** :
- ✅ Phase 1 : Système de base (profils, workflows, contexte)
- ✅ Phase 2 : Mémoire augmentée (RAG, knowledge graph)
- ✅ Phase 3 : Tests & CI/CD (Docker, 30 tests)
- ✅ Phase 4 : Documents & export (PDF, Word, Markdown)
- 🚧 Phase WOW : Profils utilisateur & onboarding (en cours)

---

## 🔒 Sécurité & confidentialité

- **Offline-first** : fonctionne sans connexion Internet
- **Stockage local** : vos données restent sur votre machine
- **Chiffrement** : données sensibles chiffrées
- **Aucune collecte** : vous contrôlez vos providers IA
- **RGPD compliant** : conformité native

---

## 📚 Documentation

Documentation technique complète :
- [Architecture du système](./ARCHITECTURE_DOCUMENTS.md)
- [Guide de développement](./PHASE_3_PLAN_AND_ROADMAP.md)
- [Gestion des dépendances](./DEPENDENCY_MANAGEMENT.md)
- [Guide des tests](./tests/README.md)
- [Présentation investisseurs](./PRESENTATION_INVESTISSEURS.md)

---

## 🤝 Contribuer

Les contributions sont les bienvenues !

Consultez notre [guide de contribution](./CONTRIBUTING.md) pour commencer.

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

---

**Lucide - L'IA qui devient VOTRE assistant personnel** 🚀
